import type { Email } from '../types';
import { getAccessToken, getTokens, storeTokens, clearTokens, isTokenExpired } from './tokenStore';
import { stripHtml } from './htmlStrip';

const GRAPH_BASE = 'https://graph.microsoft.com/v1.0';
const MS_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

// ─── Token refresh ────────────────────────────────────────────────────────────

export async function refreshAccessTokenIfNeeded(): Promise<void> {
  if (!isTokenExpired()) return;

  const tokens = getTokens();
  if (!tokens?.refreshToken) {
    clearTokens();
    throw new Error('No refresh token available — user must re-authenticate');
  }

  console.log('[graph] Access token expired, refreshing...');

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: process.env.MICROSOFT_CLIENT_ID ?? '',
    client_secret: process.env.MICROSOFT_CLIENT_SECRET ?? '',
    refresh_token: tokens.refreshToken,
    scope: 'offline_access Mail.Read Mail.Send Calendars.ReadWrite Tasks.ReadWrite User.Read',
  });

  const res = await fetch(MS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const err = await res.text();
    clearTokens();
    throw new Error(`Token refresh failed: ${err}`);
  }

  const data = await res.json() as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  storeTokens({
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? tokens.refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
    userEmail: tokens.userEmail,
    userDisplayName: tokens.userDisplayName,
  });

  console.log('[graph] Token refreshed successfully');
}

// ─── Generic Graph API request helper ────────────────────────────────────────

async function graphRequest<T>(
  endpoint: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  await refreshAccessTokenIfNeeded();

  const token = getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${GRAPH_BASE}${endpoint}`, {
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
    throw new Error(`Graph API error ${res.status}: ${err.error?.message ?? res.statusText}`);
  }

  // 204 No Content (e.g. sendMail) — return empty object
  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

// ─── Fetch real emails from Outlook inbox ────────────────────────────────────

interface GraphMessage {
  id: string;
  subject: string;
  from: { emailAddress: { name: string; address: string } };
  toRecipients: Array<{ emailAddress: { name: string; address: string } }>;
  body: { contentType: 'html' | 'text'; content: string };
  receivedDateTime: string;
  isRead: boolean;
}

interface GraphMessagesResponse {
  value: GraphMessage[];
  '@odata.nextLink'?: string;
}

export async function fetchOutlookEmails(limit = 20): Promise<Email[]> {
  const data = await graphRequest<GraphMessagesResponse>(
    `/me/mailFolders/inbox/messages?$top=${limit}&$orderby=receivedDateTime desc&$select=id,subject,from,toRecipients,body,receivedDateTime,isRead`
  );

  return data.value.map((msg): Email => ({
    id: msg.id,
    from: msg.from?.emailAddress?.address ?? '',
    fromName: msg.from?.emailAddress?.name ?? 'Unknown',
    to: msg.toRecipients?.[0]?.emailAddress?.address ?? 'me@outlook.com',
    subject: msg.subject ?? '(No subject)',
    body: msg.body.contentType === 'html'
      ? stripHtml(msg.body.content)
      : (msg.body.content ?? ''),
    timestamp: msg.receivedDateTime,
    thread: [],
    isRead: msg.isRead,
    priority: null,
  }));
}

// ─── Send email reply ─────────────────────────────────────────────────────────

export async function sendReply(params: {
  toAddress: string;
  subject: string;
  body: string;
}): Promise<void> {
  await graphRequest('/me/sendMail', {
    method: 'POST',
    body: {
      message: {
        subject: params.subject.startsWith('Re:')
          ? params.subject
          : `Re: ${params.subject}`,
        body: {
          contentType: 'Text',
          content: params.body,
        },
        toRecipients: [
          { emailAddress: { address: params.toAddress } },
        ],
      },
      saveToSentItems: true,
    },
  });

  console.log(`[graph] Reply sent to ${params.toAddress}`);
}

// ─── Create calendar event ─────────────────────────────────────────────────────

export async function createCalendarEvent(params: {
  title: string;
  date: string;        // YYYY-MM-DD
  time: string;        // HH:MM
  attendees: string[];
  location: string | null;
  timeZone?: string;
}): Promise<{ id: string; webLink: string }> {
  const timeZone = params.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  const startDateTime = `${params.date}T${params.time}:00`;
  // Default duration: 1 hour
  const endHour = String(parseInt(params.time.split(':')[0]) + 1).padStart(2, '0');
  const endDateTime = `${params.date}T${endHour}:${params.time.split(':')[1]}:00`;

  const validAttendees = params.attendees.filter((email) => {
    const trimmed = email.trim();
    return trimmed.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  });

  const body: Record<string, unknown> = {
    subject: params.title,
    start: { dateTime: startDateTime, timeZone },
    end: { dateTime: endDateTime, timeZone },
  };

  if (validAttendees.length > 0) {
    body.attendees = validAttendees.map((email) => ({
      emailAddress: { address: email.trim() },
      type: 'required',
    }));
  }

  if (params.location) {
    body.location = { displayName: params.location };
  }

  const result = await graphRequest<{ id: string; webLink: string }>('/me/events', {
    method: 'POST',
    body,
  });

  console.log(`[graph] Calendar event created: ${params.title}`);
  return result;
}

// ─── Create Microsoft To-Do tasks ────────────────────────────────────────────

interface GraphTodoList {
  id: string;
  displayName: string;
  isOwner: boolean;
  wellknownListName: string;
}

interface GraphTodoListsResponse {
  value: GraphTodoList[];
}

async function getDefaultTaskListId(): Promise<string> {
  const data = await graphRequest<GraphTodoListsResponse>('/me/todo/lists');

  // Prefer the "Tasks" wellknown list, or fall back to first available
  const defaultList = data.value.find((l) => l.wellknownListName === 'defaultList')
    ?? data.value[0];

  if (!defaultList) throw new Error('No To-Do lists found');
  return defaultList.id;
}

export async function createTasks(tasks: string[]): Promise<void> {
  const listId = await getDefaultTaskListId();

  // Create all tasks in parallel
  await Promise.all(
    tasks.map((task) =>
      graphRequest(`/me/todo/lists/${listId}/tasks`, {
        method: 'POST',
        body: {
          title: task,
          status: 'notStarted',
          importance: 'normal',
        },
      })
    )
  );

  console.log(`[graph] Created ${tasks.length} tasks in To-Do`);
}

// ─── Get current user profile ─────────────────────────────────────────────────

export async function getUserProfile(): Promise<{ displayName: string; mail: string; userPrincipalName: string }> {
  return graphRequest<{ displayName: string; mail: string; userPrincipalName: string }>('/me?$select=displayName,mail,userPrincipalName');
}
