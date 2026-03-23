import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Groq from 'groq-sdk';
import { google } from 'googleapis';
import { z } from 'zod';

import connectDB from './config/db.js';
import Email from './models/Email.js';
import UserConfig from './models/UserConfig.js';
import { createCalendarEvent, listUpcomingEvents } from './services/calendarService.js';
import { getNotifications, saveNotification, markNotificationRead } from './services/notificationService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.use(express.json());

// ─── MongoDB Connection & Seeding ─────────────────────────────────────────────
connectDB();

let incomingEmailQueue = [];

async function seedIfEmpty() {
  const mockPath = path.join(__dirname, 'data', 'mock_emails.json');
  const mocks = JSON.parse(fs.readFileSync(mockPath, 'utf-8'));
  
  const existingEmails = await Email.find({}, 'id');
  const existingIds = new Set(existingEmails.map(e => e.id));
  
  const missingMocks = mocks.filter(m => !existingIds.has(m.id));
  
  if (missingMocks.length > 0) {
    // We'll seat the first few and queue the rest
    const half = Math.ceil(missingMocks.length / 2);
    const toSeed = missingMocks.slice(0, half);
    incomingEmailQueue = missingMocks.slice(half);
    
    if (toSeed.length > 0) {
      await Email.insertMany(toSeed);
      console.log(`Seeded ${toSeed.length} new mock emails to MongoDB`);
    }
  } else {
    console.log("No missing mock emails to seed or queue.");
  }
  console.log(`Queued ${incomingEmailQueue.length} emails for real-time simulation`);
}

// Start Simulator
setInterval(async () => {
  if (incomingEmailQueue.length > 0) {
    const newEmailData = incomingEmailQueue.shift();
    newEmailData.received_at = new Date().toISOString(); 
    const newEmail = new Email(newEmailData);
    await newEmail.save();
    console.log(`[Simulator] New email arrived: ${newEmail.subject}`);
  }
}, 15000);


// ─── AI Triage Service ────────────────────────────────────────────────────────
const triageSchema = z.object({
  summary: z.array(z.string()).min(1).max(3),
  priority: z.enum(['Urgent', 'Action Required', 'FYI']),
  suggestedAction: z.object({
    type: z.enum(['reply', 'calendar', 'task']),
    payload: z.record(z.any())
  }),
  reasoning: z.string()
});

async function processEmailTriage(emailData) {
  const systemInstruction = `You are an Email Triage Agent. Analyze the email and respond with ONLY valid JSON (no markdown):
{
  "summary": ["bullet 1", "bullet 2", "bullet 3"],
  "priority": "Urgent" | "Action Required" | "FYI",
  "suggestedAction": {
    "type": "reply" | "calendar" | "task",
    "payload": {}
  },
  "reasoning": "..."
}
Rules:
- calendar payload: { "title": "Meeting title", "date": "YYYY-MM-DD", "time": "HH:MM", "endTime": "HH:MM", "attendees": ["email@example.com"], "location": "room or URL", "description": "brief description" }
- reply payload: { "text": "draft reply text here" }
- task payload: { "tasks": [{ "taskName": "...", "dueDate": "YYYY-MM-DD" }] }
If any date/time info is ambiguous, make a reasonable best-guess based on the email context. Always extract attendee emails if mentioned.`;

  const userMessage = `Sender: ${emailData.sender}\nSubject: ${emailData.subject}\nBody: ${emailData.body}`;

  try {
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userMessage }
      ]
    });

    const text = response.choices[0].message.content;
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const parsed = JSON.parse(clean);
    return triageSchema.parse(parsed);
  } catch (err) {
    console.error("AI SDK error:", err.message);
    return {
      summary: ["AI triage unavailable."],
      priority: "FYI",
      suggestedAction: { type: "task", payload: { tasks: [{ taskName: "Manual Review Required", dueDate: "Today" }] } },
      reasoning: "The AI request was rejected."
    };
  }
}

// ─── Google OAuth Setup ─────────────────────────────────────────────
const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI || `http://localhost:${PORT}/api/auth/callback`
);

async function saveToken(token) {
  await UserConfig.findOneAndUpdate(
    { id: '__config__' },
    { googleToken: token },
    { upsert: true, new: true }
  );
}

async function getToken() {
  const config = await UserConfig.findOne({ id: '__config__' });
  return config ? config.googleToken : null;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), storage: 'mongodb' });
});

// GET /api/emails
app.get('/api/emails', async (req, res) => {
  try {
    const emails = await Email.find().sort({ received_at: -1 });
    const token = await getToken();
    res.json({ emails, isGmailConnected: !!token });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// GET /api/emails/:id
app.get('/api/emails/:id', async (req, res) => {
  const email = await Email.findOne({ id: req.params.id });
  if (!email) return res.status(404).json({ error: 'Email not found' });
  res.json(email);
});

// POST /api/triage/:id
app.post('/api/triage/:id', async (req, res) => {
  const email = await Email.findOne({ id: req.params.id });
  if (!email) return res.status(404).json({ error: 'Email not found' });

  const start = Date.now();
  try {
    const result = await processEmailTriage(email);
    const latency_ms = Date.now() - start;

    email.triage = {
      summary: result.summary,
      priority: result.priority,
      status: 'pending',
      suggestedAction: result.suggestedAction,
      reasoning: result.reasoning,
      latency_ms
    };

    await email.save();
    res.json({ message: 'Triage completed', data: email });
  } catch (err) {
    res.status(500).json({ error: 'Triage failed', details: err.message });
  }
});

// PATCH /api/actions/approve
app.patch('/api/actions/approve', async (req, res) => {
  const { actionId } = req.body;
  const email = await Email.findOne({ id: actionId });
  if (!email) return res.status(404).json({ error: 'Email not found' });
  if (!email.triage) return res.status(400).json({ error: 'Not yet triaged' });

  email.triage.status = 'approved';
  await email.save();
  res.json({ message: 'Approved', data: email });
});

// PATCH /api/emails/:id/ignore
app.patch('/api/emails/:id/ignore', async (req, res) => {
  const email = await Email.findOne({ id: req.params.id });
  if (!email) return res.status(404).json({ error: 'Email not found' });

  if (!email.triage) email.triage = {};
  email.triage.status = 'ignored';
  await email.save();
  res.json({ message: 'Ignored', data: email });
});

// GET /api/stats
app.get('/api/stats', async (req, res) => {
  const emails = await Email.find();
  const triaged = emails.filter(e => e.triage && e.triage.summary && e.triage.summary.length > 0);
  const approved = triaged.filter(e => e.triage.status === 'approved');
  const ignored = triaged.filter(e => e.triage.status === 'ignored');
  const pending = triaged.filter(e => e.triage.status === 'pending');
  
  res.json({
    total: emails.length,
    triaged: triaged.length,
    pending: pending.length,
    approved: approved.length,
    ignored: ignored.length,
  });
});

// ─── Gmail Auth & Sync Routes ─────────────────────────────────────────────────

app.get('/api/auth/google', (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/calendar.events'
    ],
    prompt: 'consent'
  });
  res.redirect(url);
});

app.get('/api/auth/callback', async (req, res) => {
  try {
    const { tokens } = await oauth2Client.getToken(req.query.code);
    await saveToken(tokens);
    res.redirect('http://localhost:5500/dashboard.html?connected=true');
  } catch (err) {
    res.status(500).send('Authentication failed');
  }
});

app.post('/api/gmail/sync', async (req, res) => {
  const token = await getToken();
  if (!token) return res.status(401).json({ error: 'Gmail not connected' });

  oauth2Client.setCredentials(token);
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  try {
    const listRes = await gmail.users.messages.list({ userId: 'me', maxResults: 50, q: 'in:inbox' });
    const messages = listRes.data.messages || [];
    let newCount = 0;

    for (const msg of messages) {
      const existing = await Email.findOne({ id: msg.id });
      if (existing) continue;

      const fullMsg = await gmail.users.messages.get({ userId: 'me', id: msg.id });
      const payload = fullMsg.data.payload;
      const headers = payload.headers;

      const subject = headers.find(h => h.name.toLowerCase() === 'subject')?.value || '(No Subject)';
      const sender = headers.find(h => h.name.toLowerCase() === 'from')?.value || 'Unknown';
      const recipient = headers.find(h => h.name.toLowerCase() === 'to')?.value || 'Me';
      
      let bodyText = fullMsg.data.snippet || '';
      // (Simplified extractor)

      await Email.create({
        id: msg.id,
        subject,
        sender,
        recipient,
        body: bodyText,
        received_at: new Date(Number(fullMsg.data.internalDate))
      });
      newCount++;
    }
    res.json({ message: `Synced ${newCount} new emails`, count: newCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to sync' });
  }
});

// ─── Calendar Routes ─────────────────────────────────────────────────────────

app.post('/api/calendar/create', async (req, res) => {
  const { emailId, payload } = req.body;
  const token = await getToken();
  if (!token) return res.status(401).json({ error: 'Google Calendar not connected' });

  const email = await Email.findOne({ id: emailId });
  if (!email) return res.status(404).json({ error: 'Email not found' });

  try {
    oauth2Client.setCredentials(token);
    const event = await createCalendarEvent(oauth2Client, payload);

    if (!email.triage) email.triage = {};
    email.triage.status = 'approved';
    email.triage.calendarEventId = event.id;
    email.triage.calendarEventLink = event.htmlLink;
    await email.save();

    await saveNotification({ 
      message: `📅 Event "${payload.title || 'Meeting'}" added to Google Calendar`, 
      type: 'calendar', 
      emailId 
    });

    res.json({ message: 'Calendar event created', event: { id: event.id } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create event', details: err.message });
  }
});

app.get('/api/calendar/events', async (req, res) => {
  const token = await getToken();
  if (!token) return res.status(401).json({ error: 'Not connected' });

  try {
    oauth2Client.setCredentials(token);
    const events = await listUpcomingEvents(oauth2Client, parseInt(req.query.maxResults) || 10);
    res.json({ events });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.post('/api/emails/scan-calendar', async (req, res) => {
  const untriaged = await Email.find({ 
    $or: [
      { triage: { $exists: false } },
      { triage: null },
      { "triage.summary": { $exists: false } },
      { "triage.summary": { $size: 0 } }
    ]
  });
  console.log(`[Scan] Found ${untriaged.length} untriaged emails to process.`);
  let scanned = 0;
  const calendarEmails = [];

  for (const email of untriaged) {
    try {
      const result = await processEmailTriage(email);
      email.triage = {
        summary: result.summary,
        priority: result.priority,
        status: 'pending',
        suggestedAction: result.suggestedAction,
        reasoning: result.reasoning,
        latency_ms: 0
      };
      await email.save();
      scanned++;

      if (result.suggestedAction?.type === 'calendar') {
        calendarEmails.push({ id: email.id, subject: email.subject, payload: result.suggestedAction.payload });
        await saveNotification({
          message: `🔍 AI detected a calendar event in email: "${email.subject}"`,
          type: 'info',
          emailId: email.id
        });
      }
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`Error scanning email ${email.id}:`, err.message);
    }
  }
  res.json({ message: `Scanned ${scanned} emails. Found ${calendarEmails.length} events.`, scanned, emails: calendarEmails });
});

// ─── Draft Reply Routes ──────────────────────────────────────────────────────

// POST /api/emails/:id/send-reply
app.post('/api/emails/:id/send-reply', async (req, res) => {
  const { body: replyBody } = req.body;
  if (!replyBody || !replyBody.trim()) {
    return res.status(400).json({ error: 'Reply body cannot be empty' });
  }

  const email = await Email.findOne({ id: req.params.id }).catch(() => null)
    || await Email.findById(req.params.id).catch(() => null);
  if (!email) return res.status(404).json({ error: 'Email not found' });

  const token = await getToken();
  if (!token) return res.status(401).json({ error: 'Gmail not connected. Please connect your Gmail account first.' });

  try {
    oauth2Client.setCredentials(token);
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Extract the sender email address from "Name <email>" format
    const senderMatch = email.sender.match(/<(.+)>/);
    const toAddress = senderMatch ? senderMatch[1] : email.sender;

    // Build raw MIME message
    const subject = email.subject.startsWith('Re:')
      ? email.subject
      : `Re: ${email.subject}`;

    const mimeLines = [
      `To: ${toAddress}`,
      `Subject: ${subject}`,
      'Content-Type: text/plain; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      replyBody
    ];
    const rawMessage = Buffer.from(mimeLines.join('\r\n')).toString('base64url');

    const sendPayload = { userId: 'me', requestBody: { raw: rawMessage } };
    // Thread reply if we have a threadId stored
    if (email.threadId) sendPayload.requestBody.threadId = email.threadId;

    await gmail.users.messages.send(sendPayload);

    // Persist draft reply status on the email record
    if (!email.triage) email.triage = {};
    email.triage.draftReply = {
      body: replyBody,
      sentAt: new Date(),
      status: 'sent'
    };
    email.triage.status = 'approved';
    await email.save();

    await saveNotification({
      message: `✉️ Reply sent for: "${email.subject}"`,
      type: 'reply',
      emailId: email.id
    });

    res.json({ message: 'Reply sent successfully', data: email });
  } catch (err) {
    console.error('Send reply error:', err.message);
    res.status(500).json({ error: 'Failed to send reply', details: err.message });
  }
});

// ─── Notification Routes ──────────────────────────────────────────────────────

app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await getNotifications();
    const unreadCount = notifications.filter(n => !n.read).length;
    res.json({ notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

app.patch('/api/notifications/:id/read', async (req, res) => {
  try {
    const notif = await markNotificationRead(req.params.id);
    res.json({ message: 'Marked as read', notification: notif });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// ─── Start ────────────────────────────────────────────────────────────────────
const server = app.listen(PORT, '0.0.0.0', () => {
  seedIfEmpty().then(() => {
    console.log(`\n🚀 NexMail backend running!`);
    console.log(`🔗 Listening on: http://localhost:${PORT}`);
    console.log(`📖 Health: http://localhost:${PORT}/health\n`);
    
    // Start Simulator
    setInterval(async () => {
      if (incomingEmailQueue.length > 0) {
        const newEmailData = incomingEmailQueue.shift();
        newEmailData.received_at = new Date().toISOString(); 
        const newEmail = new Email(newEmailData);
        await newEmail.save();
        console.log(`[Simulator] New email arrived: ${newEmail.subject}`);
      }
    }, 15000);
  }).catch(err => {
    console.error("❌ Seeding failed:", err.message);
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please check other processes.`);
  } else {
    console.error("❌ Server error:", err.message);
  }
});

