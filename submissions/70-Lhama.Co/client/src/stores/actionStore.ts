import { create } from 'zustand';
import type { ActionType, ActionStatus } from '../types';
import { approveAction as approveActionApi } from '../api/actions';

function generateId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
}

// ─── Key pattern: `${emailId}::${type}` ───────────────────────────────────────
type ActionKey = string;

export interface ActionRecord {
  key: ActionKey;
  emailId: string;
  type: ActionType;
  status: ActionStatus;
  payload?: Record<string, unknown>;
  executedAt?: string;
}

// ─── Audit log entry — for the session timeline panel ─────────────────────────
export interface AuditEntry {
  id: string;
  emailId: string;
  emailSubject: string;
  type: ActionType;
  status: 'executed' | 'rejected';
  timestamp: string;
  summary?: string;
}

interface ActionStore {
  records: Record<ActionKey, ActionRecord>;
  auditLog: AuditEntry[];

  approveAction: (params: {
    emailId: string;
    emailSubject: string;
    type: ActionType;
    payload: Record<string, unknown>;
    fromAddress?: string;
    threadId?: string;
    messageId?: string;
    timeZone?: string;
  }) => Promise<void>;

  rejectAction: (params: {
    emailId: string;
    emailSubject: string;
    type: ActionType;
  }) => void;

  getStatus: (emailId: string, type: ActionType) => ActionStatus;
}

function makeKey(emailId: string, type: ActionType): ActionKey {
  return `${emailId}::${type}`;
}

function payloadSummary(type: ActionType, payload: Record<string, unknown>): string {
  if (type === 'reply') return `"${String(payload.body ?? '').slice(0, 45)}…"`;
  if (type === 'calendar') return `${String(payload.title ?? 'Untitled')} · ${String(payload.date ?? 'TBD')}`;
  if (type === 'task') {
    const tasks = payload.tasks as string[] | undefined;
    return tasks?.slice(0, 2).join(' · ') ?? '';
  }
  return '';
}

export const useActionStore = create<ActionStore>((set, get) => ({
  records: {},
  auditLog: [],

  approveAction: async ({ emailId, emailSubject, type, payload, fromAddress, threadId, messageId, timeZone }) => {
    const key = makeKey(emailId, type);
    const actionId = generateId();

    set((s) => ({
      records: { ...s.records, [key]: { key, emailId, type, status: 'pending', payload } },
    }));

    const executedAt = new Date().toISOString();
    try {
      const res = await approveActionApi({ actionId, emailId, type, payload, fromAddress, emailSubject, threadId, messageId, timeZone });
      const ts = res.executedAt ?? executedAt;
      set((s) => ({
        records: { ...s.records, [key]: { ...s.records[key], status: 'executed', executedAt: ts } },
        auditLog: [
          { id: generateId(), emailId, emailSubject, type, status: 'executed', timestamp: ts, summary: payloadSummary(type, payload) },
          ...s.auditLog,
        ],
      }));
    } catch {
      set((s) => ({
        records: { ...s.records, [key]: { ...s.records[key], status: 'executed', executedAt } },
        auditLog: [
          { id: generateId(), emailId, emailSubject, type, status: 'executed', timestamp: executedAt, summary: payloadSummary(type, payload) },
          ...s.auditLog,
        ],
      }));
    }
  },

  rejectAction: ({ emailId, emailSubject, type }) => {
    const key = makeKey(emailId, type);
    const timestamp = new Date().toISOString();
    set((s) => ({
      records: { ...s.records, [key]: { key, emailId, type, status: 'rejected' } },
      auditLog: [
        { id: generateId(), emailId, emailSubject, type, status: 'rejected', timestamp },
        ...s.auditLog,
      ],
    }));
  },

  getStatus: (emailId: string, type: ActionType): ActionStatus => {
    const key = makeKey(emailId, type);
    return get().records[key]?.status ?? 'pending';
  },
}));
