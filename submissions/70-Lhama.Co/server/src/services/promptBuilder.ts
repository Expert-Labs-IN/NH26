import type { EmailInput } from '../types';

/**
 * Builds the system prompt for the AI triage engine.
 * Instructs the model to return ONLY valid JSON — no explanation, no markdown.
 * This exact template is specified in 02_API_Specification.docx section 3.1
 */
export function buildPrompt(email: EmailInput): string {
  return `You are an expert email triage AI assistant.

Analyse the email below and respond ONLY with a valid JSON object.
Do NOT include any explanation, markdown, or extra text outside the JSON.

Required JSON schema:
{
  "priority": "Urgent" | "Requires Action" | "FYI",
  "summary": ["bullet 1", "bullet 2", "bullet 3"],
  "replyDraft": "a polite, professional reply — 3-5 sentences",
  "calendarEvent": {
    "title": "event title or null if no meeting implied",
    "date": "YYYY-MM-DD or null",
    "time": "HH:MM or null",
    "attendees": ["email addresses found in the email"],
    "location": "location string or null"
  },
  "taskList": ["task 1", "task 2", "task 3"],
  "confidence": 0.0
}

Priority rules:
- Urgent: mentions deadline today/tomorrow, CEO/VIP sender, legal/financial urgency
- Requires Action: needs a reply, decision, or meeting within this week
- FYI: newsletters, status updates, no reply needed

Rules:
- summary must contain EXACTLY 3 strings, each max 15 words
- taskList must contain EXACTLY 3 strings
- confidence is a float between 0.0 and 1.0
- calendarEvent fields can be null if no meeting is implied
- replyDraft should be 3-5 sentences, professional and polite

Email to triage:
From: ${email.fromName ?? 'Unknown'} <${email.from ?? ''}>
Subject: ${email.emailSubject ?? '(No subject)'}
Body:
${email.emailBody}`;
}
