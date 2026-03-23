import { create } from 'zustand';
import type { Email, PriorityTag, SentReply } from '../types';
import { fetchEmails } from '../api/emails';
import { MOCK_EMAILS } from '../data/mockEmails';
import { getMockEmails } from '../api/emails';

// Pre-load mock spam emails so the Spam tab is always populated
const SPAM_SEED: Email[] = MOCK_EMAILS.filter((e) => e.isMarkedSpam);

// Priority weight for sorting — lower = higher in list
const PRIORITY_WEIGHT: Record<string, number> = {
  Urgent: 0,
  'Requires Action': 1,
  FYI: 2,
};

interface EmailStore {
  emails: Email[];
  selectedEmailId: string | null;
  isLoadingEmails: boolean;
  emailsError: string | null;
  isBatchTriaging: boolean;
  batchProgress: number; // 0-10
  sentReplies: Record<string, SentReply[]>; // keyed by emailId

  loadEmails: () => Promise<void>;
  selectEmail: (id: string) => void;
  setPriority: (id: string, priority: PriorityTag) => void;
  markAsRead: (id: string) => void;
  setBatchTriaging: (val: boolean) => void;
  setBatchProgress: (n: number) => void;
  addSentReply: (reply: SentReply) => void;
  addEmail: (email: Email) => void;
  removeEmail: (id: string) => void;
  markAsSpam: (id: string) => void;
  cleanInbox: () => void; // removes FYI + spam emails
}

export const useEmailStore = create<EmailStore>((set, get) => ({
  // Seed with spam emails so the Spam tab is always visible
  emails: SPAM_SEED,
  selectedEmailId: null,
  isLoadingEmails: false,
  emailsError: null,
  isBatchTriaging: false,
  batchProgress: 0,
  sentReplies: {},

  loadEmails: async () => {
    set({ isLoadingEmails: true, emailsError: null });
    try {
      const fetched = await fetchEmails();
      // Merge: keep spam seeds that aren't already in the fetched list
      const fetchedIds = new Set(fetched.map((e) => e.id));
      const spamToKeep = SPAM_SEED.filter((e) => !fetchedIds.has(e.id));
      set({ emails: [...fetched, ...spamToKeep], isLoadingEmails: false });
    } catch (err) {
      const currentEmails = useEmailStore.getState().emails;
      console.warn('[emailStore] fetchEmails failed:', err);

      if (currentEmails.filter((e) => !e.isMarkedSpam).length === 0) {
        // Inbox genuinely empty (no real emails yet) — fall back to full mocks
        console.warn('[emailStore] Inbox empty — falling back to mock emails');
        const mocks = getMockEmails();
        const mockIds = new Set(mocks.map((e) => e.id));
        const spamToKeep = SPAM_SEED.filter((e) => !mockIds.has(e.id));
        set({ emails: [...mocks, ...spamToKeep], isLoadingEmails: false });
      } else {
        // Real emails already loaded — keep them, just show an error banner
        set({ emailsError: 'Could not refresh emails. Showing last known data.', isLoadingEmails: false });
      }
    }
  },


  selectEmail: (id: string) => {
    set({ selectedEmailId: id });
    get().markAsRead(id);
  },

  setPriority: (id: string, priority: PriorityTag) => {
    set((state) => ({
      emails: state.emails.map((e) => (e.id === id ? { ...e, priority } : e)),
    }));
  },

  markAsRead: (id: string) => {
    set((state) => ({
      emails: state.emails.map((e) => (e.id === id ? { ...e, isRead: true } : e)),
    }));
  },

  setBatchTriaging: (val: boolean) => set({ isBatchTriaging: val }),
  setBatchProgress: (n: number) => set({ batchProgress: n }),

  addSentReply: (reply: SentReply) => {
    set((state) => ({
      sentReplies: {
        ...state.sentReplies,
        [reply.emailId]: [...(state.sentReplies[reply.emailId] ?? []), reply],
      },
    }));
  },

  addEmail: (email: Email) => {
    set((state) => ({
      emails: [email, ...state.emails],
      selectedEmailId: email.id,
    }));
  },

  removeEmail: (id: string) => {
    set((state) => ({
      emails: state.emails.filter((e) => e.id !== id),
      selectedEmailId: state.selectedEmailId === id ? null : state.selectedEmailId,
    }));
  },

  markAsSpam: (id: string) => {
    set((state) => ({
      emails: state.emails.map((e) => e.id === id ? { ...e, isMarkedSpam: true } : e),
      selectedEmailId: state.selectedEmailId === id ? null : state.selectedEmailId,
    }));
  },

  cleanInbox: () => {
    set((state) => ({
      emails: state.emails.filter(
        (e) => !e.isMarkedSpam && e.priority !== 'FYI',
      ),
      selectedEmailId: null,
    }));
  },
}));

// ─── Derived selectors ─────────────────────────────────────────────────────────

export const useSelectedEmail = () =>
  useEmailStore((s) => s.emails.find((e) => e.id === s.selectedEmailId) ?? null);

// Returns emails sorted by priority (triaged ones float to top)
export function sortEmailsByPriority(emails: Email[]): Email[] {
  return [...emails].sort((a, b) => {
    const wa = a.priority ? PRIORITY_WEIGHT[a.priority] ?? 3 : 4;
    const wb = b.priority ? PRIORITY_WEIGHT[b.priority] ?? 3 : 4;
    if (wa !== wb) return wa - wb;
    // Within same priority, unread first, then by timestamp desc
    if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}
