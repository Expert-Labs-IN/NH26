import type { Email, TriageResult } from '../types';
import { MOCK_TRIAGE_RESULTS } from '../data/mockTriageResults';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// ─── In-memory client-side cache ─────────────────────────────────────────────
const clientCache: Record<string, TriageResult> = {};

export async function triageEmail(email: Email): Promise<TriageResult> {
  // Check client cache first
  if (clientCache[email.id]) {
    return { ...clientCache[email.id], source: 'cache' };
  }

  try {
    const res = await fetch(`${API_URL}/api/triage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(80000),
      body: JSON.stringify({
        emailId: email.id,
        emailBody: email.body,
        emailSubject: email.subject,
        fromName: email.fromName,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'UNKNOWN' }));
      throw new Error(err.error ?? `HTTP ${res.status}`);
    }

    const result: TriageResult = await res.json();
    clientCache[email.id] = result;
    return result;
  } catch {
    // Graceful fallback — use pre-cached mock result when backend is offline
    const mock = MOCK_TRIAGE_RESULTS[email.id];
    if (mock) {
      console.warn(`[triageEmail] Backend unreachable — using mock result for ${email.id}`);
      clientCache[email.id] = mock;
      return { ...mock, source: 'cache' };
    }
    // No mock available — propagate error
    throw new Error('AI_UNAVAILABLE');
  }
}

export function clearClientCache() {
  Object.keys(clientCache).forEach((k) => delete clientCache[k]);
}
