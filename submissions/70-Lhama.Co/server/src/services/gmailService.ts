import type { Email } from '../types';
import {
  getGoogleTokens,
  getGoogleAccessToken,
  storeGoogleTokens,
  clearGoogleTokens,
  isGoogleTokenExpired,
} from './googleTokenStore';
import { stripHtml } from './htmlStrip';

const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// ─── Token refresh ────────────────────────────────────────────────────────────

export async function refreshGoogleTokenIfNeeded(): Promise<void> {
  if (!isGoogleTokenExpired()) return;

  const tokens = getGoogleTokens();
  if (!tokens?.refreshToken) {
    clearGoogleTokens();
    throw new Error('No Google refresh token — user must re-authenticate');
  }

  console.log('[gmail] Access token expired, refreshing...');

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.GOOGLE_CLIENT_ID ?? '',
    client_secret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    refresh_token: tokens.refreshToken,
  });

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const err = await res.text();
    clearGoogleTokens();
    throw new Error(`Google token refresh failed: ${err}`);
  }

  const data = await res.json() as {
    access_token: string;
    expires_in: number;
  };

  storeGoogleTokens({
    accessToken: data.access_token,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
    userEmail: tokens.userEmail,
    userDisplayName: tokens.userDisplayName,
  });

  console.log('[gmail] Token refreshed successfully');
}

// ─── Generic Google API request helper ───────────────────────────────────────

async function googleRequest<T>(
  url: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  await refreshGoogleTokenIfNeeded();

  const token = getGoogleAccessToken();
  if (!token) throw new Error('Not authenticated with Google');

  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } })) as {
      error?: { message?: string };
    };
    throw new Error(`Google API error ${res.status}: ${err.error?.message ?? res.statusText}`);
  }

  if (res.status === 204) return {} as T;
  return res.json() as Promise<T>;
}

// ─── Fetch Gmail inbox emails ─────────────────────────────────────────────────

interface GmailListResponse {
  messages?: Array<{ id: string; threadId: string }>;
  nextPageToken?: string;
}

interface GmailMessage {
  id: string;
  threadId: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
      parts?: Array<{ mimeType: string; body?: { data?: string } }>;
    }>;
  };
  internalDate: string;
  labelIds: string[];
  snippet: string;
}

function getHeader(msg: GmailMessage, name: string): string {
  return msg.payload.headers.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  )?.value ?? '';
}

function decodeBase64(data: string): string {
  try {
    // Gmail uses URL-safe base64
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    return '';
  }
}

function extractEmailBody(msg: GmailMessage): string {
  // Try to get plain text first, then HTML
  const parts = msg.payload.parts ?? [];

  // Recursive search for text/plain or text/html parts
  function findPart(
    parts: GmailMessage['payload']['parts'],
    mimeType: string
  ): string | null {
    if (!parts) return null;
    for (const part of parts) {
      if (part.mimeType === mimeType && part.body?.data) {
        return decodeBase64(part.body.data);
      }
      if (part.parts) {
        const found = findPart(part.parts, mimeType);
        if (found) return found;
      }
    }
    return null;
  }

  // 1. Try plain text parts
  const plainText = findPart(parts, 'text/plain');
  if (plainText) return plainText.trim();

  // 2. Try HTML parts
  const htmlText = findPart(parts, 'text/html');
  if (htmlText) return stripHtml(htmlText);

  // 3. Try direct body (single-part messages)
  if (msg.payload.body?.data) {
    return decodeBase64(msg.payload.body.data).trim();
  }

  // 4. Fall back to snippet
  return msg.snippet ?? '';
}

export async function fetchGmailEmails(limit = 20): Promise<Email[]> {
  // Step 1: Get message IDs from inbox
  const listData = await googleRequest<GmailListResponse>(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${limit}&labelIds=INBOX&q=-category:promotions -category:social`
  );

  if (!listData.messages?.length) return [];

  // Step 2: Fetch each message in parallel (batch of up to 20)
  const messagePromises = listData.messages.slice(0, limit).map((m) =>
    googleRequest<GmailMessage>(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`
    )
  );

  const messages = await Promise.all(messagePromises);

  return messages.map((msg): Email => {
    const from = getHeader(msg, 'From');
    const subject = getHeader(msg, 'Subject');
    const to = getHeader(msg, 'To');
    const messageId = getHeader(msg, 'Message-ID');

    // Parse "Name <email>" format
    const nameMatch = from.match(/^"?([^"<]+)"?\s*<(.+)>$/);
    const fromName = nameMatch ? nameMatch[1].trim() : from.replace(/<.*>/, '').trim() || 'Unknown';
    const fromEmail = nameMatch ? nameMatch[2] : from.replace(/.*<(.+)>.*/, '$1') || from;

    const isRead = !msg.labelIds.includes('UNREAD');
    const timestamp = new Date(parseInt(msg.internalDate)).toISOString();
    const body = extractEmailBody(msg);

    return {
      id: msg.id,
      from: fromEmail,
      fromName,
      to: to.replace(/<.*>/, '').trim() || 'me@gmail.com',
      subject: subject || '(No subject)',
      body,
      timestamp,
      thread: [msg.threadId],
      isRead,
      priority: null,
      messageId,
    };
  });
}

// ─── Send Gmail reply ─────────────────────────────────────────────────────────

function makeRfc2822Email(params: {
  to: string;
  subject: string;
  body: string;
  from: string;
  inReplyToMessageId?: string;
}): string {
  const subject = params.subject.startsWith('Re:') ? params.subject : 'Re: ' + params.subject;
  const lines: string[] = [
    `From: ${params.from}`,
    `To: ${params.to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
  ];

  if (params.inReplyToMessageId) {
    lines.push(`In-Reply-To: ${params.inReplyToMessageId}`);
    lines.push(`References: ${params.inReplyToMessageId}`);
  }

  lines.push('', params.body);

  const rawStr = lines.join('\r\n');
  return btoa(unescape(encodeURIComponent(rawStr)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendGmailReply(params: {
  toAddress: string;
  subject: string;
  body: string;
  fromEmail: string;
  threadId?: string;
  inReplyToMessageId?: string;
}): Promise<void> {
  const rawEmail = makeRfc2822Email({
    to: params.toAddress,
    subject: params.subject,
    body: params.body,
    from: params.fromEmail,
    inReplyToMessageId: params.inReplyToMessageId,
  });

  const sendUrl = params.threadId
    ? `https://gmail.googleapis.com/gmail/v1/users/me/messages/send?threadId=${params.threadId}`
    : 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

  await googleRequest(
    sendUrl,
    {
      method: 'POST',
      body: { raw: rawEmail },
    }
  );

  console.log(`[gmail] Reply sent to ${params.toAddress}`);
}

// ─── Create Google Calendar event ────────────────────────────────────────────

export async function createGoogleCalendarEvent(params: {
  title: string;
  date: string;   // YYYY-MM-DD
  time: string;   // HH:MM
  attendees: string[];
  location: string | null;
  timeZone?: string;
}): Promise<{ id: string; htmlLink: string }> {
  const timeZone = params.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  const startDateTime = `${params.date}T${params.time}:00`;
  const endHour = String(parseInt(params.time.split(':')[0]) + 1).padStart(2, '0');
  const endDateTime = `${params.date}T${endHour}:${params.time.split(':')[1]}:00`;

  const validAttendees = params.attendees.filter((email) => {
    const trimmed = email.trim();
    return trimmed.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  });

  const body: Record<string, unknown> = {
    summary: params.title,
    start: { dateTime: startDateTime, timeZone },
    end: { dateTime: endDateTime, timeZone },
  };

  if (validAttendees.length > 0) {
    body.attendees = validAttendees.map((email) => ({ email: email.trim() }));
  }

  if (params.location) {
    body.location = params.location;
  }

  const result = await googleRequest<{ id: string; htmlLink: string }>(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    { method: 'POST', body }
  );

  console.log(`[gmail] Calendar event created: ${params.title}`);
  return result;
}

// ─── Create Google Tasks ───────────────────────────────────────────────────────

interface GoogleTaskList {
  id: string;
  title: string;
}

interface GoogleTaskListsResponse {
  items?: GoogleTaskList[];
}

async function getDefaultTaskListId(): Promise<string> {
  const data = await googleRequest<GoogleTaskListsResponse>(
    'https://tasks.googleapis.com/tasks/v1/users/@me/lists'
  );

  const list = data.items?.[0];
  if (!list) throw new Error('No Google Task lists found');
  return list.id;
}

export async function createGoogleTasks(tasks: string[]): Promise<void> {
  const listId = await getDefaultTaskListId();

  await Promise.all(
    tasks.map((task) =>
      googleRequest(
        `https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`,
        {
          method: 'POST',
          body: { title: task, status: 'needsAction' },
        }
      )
    )
  );

  console.log(`[gmail] Created ${tasks.length} Google Tasks`);
}

// ─── Get Google user profile ──────────────────────────────────────────────────

export async function getGoogleUserProfile(): Promise<{
  email: string;
  name: string;
}> {
  const data = await googleRequest<{
    emailAddress: string;
    messagesTotal: number;
  }>('https://gmail.googleapis.com/gmail/v1/users/me/profile');

  // Get display name from Google People API
  try {
    const people = await googleRequest<{
      names?: Array<{ displayName: string }>;
    }>('https://people.googleapis.com/v1/people/me?personFields=names');
    const name = people.names?.[0]?.displayName ?? data.emailAddress;
    return { email: data.emailAddress, name };
  } catch {
    return { email: data.emailAddress, name: data.emailAddress };
  }
}
