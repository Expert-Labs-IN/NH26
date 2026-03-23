import { Router } from 'express';
import { z } from 'zod';
import { buildPrompt } from '../services/promptBuilder';
import { callOllama } from '../services/ollamaService';
import { callGroq } from '../services/groqService';
import { MOCK_TRIAGE } from '../services/mockTriage';

const router = Router();

const TriageRequestSchema = z.object({
  emailId: z.string().min(1, 'emailId is required'),
  emailBody: z.string().min(1, 'emailBody is required'),
  emailSubject: z.string().optional().default(''),
  fromName: z.string().optional().default(''),
  from: z.string().optional().default(''),
});

/**
 * POST /api/triage
 * Fallback chain: Ollama → Groq → Mock data
 * Every request goes to Ollama first — no caching.
 */
router.post('/', async (req, res) => {
  const parsed = TriageRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'MISSING_BODY',
      details: parsed.error.flatten(),
    });
  }

  const { emailId, emailBody, emailSubject, fromName, from } = parsed.data;
  const prompt = buildPrompt({ emailId, emailBody, emailSubject, fromName, from });

  // 1. Try Ollama (local AI — primary)
  try {
    console.log(`[triage] 🤖 Trying Ollama for ${emailId}...`);
    const result = await callOllama(prompt);
    result.emailId = emailId;
    console.log(`[triage] ✅ Ollama success — priority: ${result.priority}`);
    return res.json({ ...result, source: 'ollama' });
  } catch (ollamaErr) {
    console.warn(`[triage] ⚠️  Ollama failed: ${(ollamaErr as Error).message}`);
  }

  // 2. Try Groq (cloud fallback)
  try {
    console.log(`[triage] ☁️  Trying Groq for ${emailId}...`);
    const result = await callGroq(prompt);
    result.emailId = emailId;
    console.log(`[triage] ✅ Groq success — priority: ${result.priority}`);
    return res.json({ ...result, source: 'groq' });
  } catch (groqErr) {
    console.warn(`[triage] ⚠️  Groq failed: ${(groqErr as Error).message}`);
  }

  // 3. Final fallback — pre-built mock triage data
  const mock = MOCK_TRIAGE[emailId];
  if (mock) {
    console.log(`[triage] 📦 Serving mock data for ${emailId}`);
    return res.json({ ...mock, emailId, source: 'cache' });
  }

  // 4. Completely unknown emailId — generic safe response
  console.error(`[triage] ❌ All sources failed for ${emailId}`);
  return res.json({
    emailId,
    priority: 'Requires Action',
    summary: [
      'AI triage temporarily unavailable — manual review needed',
      'Ollama and Groq services could not be reached',
      'Please review this email and take appropriate action',
    ],
    replyDraft: 'Thank you for your email. I will review this and get back to you shortly.',
    calendarEvent: { title: null, date: null, time: null, attendees: [], location: null },
    taskList: [
      'Manually review this email',
      'Reply to sender as appropriate',
      'Follow up if action is required',
    ],
    confidence: 0.0,
    source: 'cache',
  });
});

export default router;


