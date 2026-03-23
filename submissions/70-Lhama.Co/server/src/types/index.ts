// ─── Email ────────────────────────────────────────────────────────────────────

export type PriorityTag = 'Urgent' | 'Requires Action' | 'FYI';

export interface Email {
  id: string;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  thread: string[];
  isRead: boolean;
  priority: PriorityTag | null;
  messageId?: string;
}

// ─── Triage ───────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  title: string | null;
  date: string | null;       // YYYY-MM-DD
  time: string | null;       // HH:MM
  attendees: string[];
  location: string | null;
}

export interface TriageResult {
  emailId: string;
  priority: PriorityTag;
  summary: string[];         // exactly 3 strings
  replyDraft: string;
  calendarEvent: CalendarEvent;
  taskList: string[];        // exactly 3 strings
  confidence: number;        // 0.0 – 1.0
  source: 'ollama' | 'groq' | 'cache';
}

// ─── Triage request input ─────────────────────────────────────────────────────

export interface EmailInput {
  emailId: string;
  emailBody: string;
  emailSubject?: string;
  fromName?: string;
  from?: string;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type ActionType = 'reply' | 'calendar' | 'task';

export interface ApproveActionRequest {
  actionId: string;
  emailId: string;
  type: ActionType;
  payload: Record<string, unknown>;
}

export interface ApproveActionResponse {
  success: boolean;
  actionId: string;
  status: 'executed';
  executedAt: string;
  message: string;
}

// ─── In-memory store for approved actions ─────────────────────────────────────

export interface ActionRecord {
  actionId: string;
  emailId: string;
  type: ActionType;
  payload: Record<string, unknown>;
  executedAt: string;
}
