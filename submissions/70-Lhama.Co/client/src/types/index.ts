// ─── Email ────────────────────────────────────────────────────────────────────

export type PriorityTag = 'Urgent' | 'Requires Action' | 'FYI';
export type PriorityLevel = 'High' | 'Medium' | 'Low';
export type DetectedTaskType = 'meeting' | 'deadline' | 'payment' | 'follow-up' | 'none';
export type StressLevel = 'low' | 'medium' | 'high';
export type ReplyTone = 'formal' | 'short' | 'friendly';

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
  isMarkedSpam?: boolean;  // F9: spam folder
}

// ─── Sent Reply (Threaded View) ───────────────────────────────────────────────

export interface SentReply {
  id: string;
  emailId: string;
  body: string;
  tone: ReplyTone;
  sentAt: string;
}

// ─── Triage ───────────────────────────────────────────────────────────────────

export interface CalendarEvent {
  title: string | null;
  date: string | null;
  time: string | null;
  attendees: string[];
  location: string | null;
}

export interface ReplyVariants {
  formal: string;
  short: string;
  friendly: string;
}

// ─── Decision Recommendation ─────────────────────────────────────────────────

export type DecisionChoice = 'yes' | 'no' | 'defer';

export interface DecisionRecommendation {
  question: string;            // key yes/no question extracted from the email
  recommendation: DecisionChoice;
  reasoning: string;           // why the AI suggests this choice
  alternativeRisk: string;     // what happens if user takes the opposite action
  confidence: number;          // 0–1
}

export interface TriageResult {
  emailId: string;
  priority: PriorityTag;
  priorityLevel: PriorityLevel;          // High / Medium / Low
  summary: string[];                     // always exactly 3 strings
  replyDraft: string;
  replyVariants: ReplyVariants;          // formal / short / friendly
  calendarEvent: CalendarEvent;
  taskList: string[];                    // always exactly 3 strings
  confidence: number;                    // overall  0.0 – 1.0
  replyConfidence: number;               // per-action confidence
  calendarConfidence: number;
  taskConfidence: number;
  source: 'ollama' | 'groq' | 'cache';
  detectedTaskType: DetectedTaskType;    // meeting | deadline | payment | follow-up | none
  requiresImmediateAttention: boolean;
  stressLevel: StressLevel;             // low | medium | high
  isSpam: boolean;                       // F9: spam detection
  spamReason?: string;                   // why it was flagged
  decisionRecommendation: DecisionRecommendation; // F8: yes/no AI advisor
}

// ─── Actions ──────────────────────────────────────────────────────────────────

export type ActionType = 'reply' | 'calendar' | 'task';
export type ActionStatus = 'pending' | 'executed' | 'rejected';

export interface Action {
  id: string;
  emailId: string;
  type: ActionType;
  status: ActionStatus;
  payload: Record<string, unknown>;
  executedAt?: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface EmailsResponse {
  emails: Email[];
  total: number;
  hasMore: boolean;
}

export interface ApproveResponse {
  success: boolean;
  actionId: string;
  status: 'executed';
  executedAt: string;
  message: string;
}

export interface ApiError {
  error: string;
  message?: string;
}
