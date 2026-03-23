import type { TriageResult } from '../types';

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

/**
 * Sends a prompt to the Groq cloud API and parses the JSON response.
 * This is the fallback when Ollama is unreachable.
 * Returns the same TriageResult shape as callOllama().
 */
export async function callGroq(prompt: string): Promise<TriageResult> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }

  const systemMessage = `You are an expert email triage AI. You MUST respond with ONLY a valid JSON object — no explanation, no markdown, no text outside the JSON. The JSON must match the schema provided in the user message exactly.`;

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    signal: AbortSignal.timeout(15_000),
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,   // Low temperature for consistent JSON output
      max_tokens: 1024,
      response_format: { type: 'json_object' }, // Force JSON mode
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq HTTP ${res.status}: ${errText}`);
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Groq returned empty response');

  // Strip markdown fences if present (safety net)
  const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
  const parsed = JSON.parse(cleaned) as TriageResult;

  if (!parsed.priority || !Array.isArray(parsed.summary) || !parsed.replyDraft) {
    throw new Error('Groq response missing required fields');
  }

  // Normalise arrays
  if (!Array.isArray(parsed.summary) || parsed.summary.length !== 3) {
    parsed.summary = (parsed.summary ?? []).slice(0, 3) as string[];
    while (parsed.summary.length < 3) parsed.summary.push('');
  }
  if (!Array.isArray(parsed.taskList) || parsed.taskList.length === 0) {
    parsed.taskList = ['Review email and take appropriate action', 'Follow up as needed', 'File for reference'];
  }
  parsed.taskList = parsed.taskList.slice(0, 3) as string[];
  while (parsed.taskList.length < 3) parsed.taskList.push('Follow up as needed');

  if (!parsed.calendarEvent) {
    parsed.calendarEvent = { title: null, date: null, time: null, attendees: [], location: null };
  }

  return parsed;
}

/**
 * Health check — returns true if Groq API key is configured and API responds.
 */
export async function checkGroqHealth(): Promise<{ reachable: boolean; model: string }> {
  if (!GROQ_API_KEY) return { reachable: false, model: GROQ_MODEL };
  try {
    // Lightweight check — just verify the API key works
    const res = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}` },
      signal: AbortSignal.timeout(3000),
    });
    return { reachable: res.ok, model: GROQ_MODEL };
  } catch {
    return { reachable: false, model: GROQ_MODEL };
  }
}
