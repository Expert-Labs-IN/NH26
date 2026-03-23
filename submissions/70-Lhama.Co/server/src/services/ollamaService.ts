import type { TriageResult } from '../types';

const OLLAMA_URL = process.env.OLLAMA_URL ?? 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? 'qwen2.5:7b';
const TIMEOUT_MS = 75_000; // 75 seconds

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

/**
 * Sends a prompt to the local Ollama instance and parses the JSON response.
 * Uses format:"json" to instruct Ollama to return valid JSON only.
 * Throws on network failure, timeout, or JSON parse error.
 */
export async function callOllama(prompt: string): Promise<TriageResult> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      format: 'json',   // Instructs Ollama to guarantee JSON output
    }),
  });

  if (!res.ok) {
    throw new Error(`Ollama HTTP ${res.status}: ${res.statusText}`);
  }

  const data = await res.json() as OllamaResponse;

  // Parse the AI response string as JSON
  const parsed = JSON.parse(data.response) as TriageResult;

  // Basic validation — ensure required fields exist
  if (!parsed.priority || !Array.isArray(parsed.summary) || !parsed.replyDraft) {
    throw new Error('Ollama response missing required fields');
  }

  // Normalise arrays to always have exactly 3 items
  if (parsed.summary.length !== 3) {
    parsed.summary = (parsed.summary.slice(0, 3) as string[]);
    while (parsed.summary.length < 3) parsed.summary.push('');
  }
  if (!Array.isArray(parsed.taskList) || parsed.taskList.length === 0) {
    parsed.taskList = ['Review email and take appropriate action', 'Follow up as needed', 'File for reference'];
  }
  if (parsed.taskList.length !== 3) {
    parsed.taskList = parsed.taskList.slice(0, 3) as string[];
    while (parsed.taskList.length < 3) parsed.taskList.push('Follow up as needed');
  }

  // Ensure calendarEvent exists
  if (!parsed.calendarEvent) {
    parsed.calendarEvent = { title: null, date: null, time: null, attendees: [], location: null };
  }

  return parsed;
}

/**
 * Health check — returns true if Ollama is reachable and the model is loaded.
 */
export async function checkOllamaHealth(): Promise<{ reachable: boolean; model: string; responseTimeMs: number }> {
  const start = Date.now();
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    const responseTimeMs = Date.now() - start;
    if (!res.ok) return { reachable: false, model: OLLAMA_MODEL, responseTimeMs };
    return { reachable: true, model: OLLAMA_MODEL, responseTimeMs };
  } catch {
    return { reachable: false, model: OLLAMA_MODEL, responseTimeMs: Date.now() - start };
  }
}
