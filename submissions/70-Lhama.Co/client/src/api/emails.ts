import type { Email, EmailsResponse } from '../types';
import { MOCK_EMAILS } from '../data/mockEmails';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function fetchEmails(priority?: string): Promise<Email[]> {
  const params = new URLSearchParams();
  if (priority && priority !== 'all') params.set('priority', priority);
  params.set('limit', '50');

  const res = await fetch(`${API_URL}/api/emails?${params.toString()}`, {
    signal: AbortSignal.timeout(8000),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const data: EmailsResponse = await res.json();
  return data.emails;
}

/** Returns mock emails for explicit use (guest mode / offline). */
export function getMockEmails(): Email[] {
  return MOCK_EMAILS;
}

