import { create } from 'zustand';
import type { TriageResult, Email } from '../types';
import { triageEmail as triageEmailApi } from '../api/triage';
import { MOCK_TRIAGE_RESULTS } from '../data/mockTriageResults';
import { useEmailStore } from './emailStore';

interface TriageStore {
  results: Record<string, TriageResult>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;

  triageEmail: (email: Email) => Promise<void>;
  clearError: (emailId: string) => void;
}

// ─── Pre-load mock results at module init ─────────────────────────────────────
// This ensures priority badges and filter tabs work immediately on load,
// even before any email is clicked and before the backend responds.
function buildInitialResults(): Record<string, TriageResult> {
  return { ...MOCK_TRIAGE_RESULTS };
}

export const useTriageStore = create<TriageStore>((set, get) => ({
  // Pre-populate with mock results — overwritten by real AI results when backend is live
  results: buildInitialResults(),
  loading: {},
  errors: {},

  triageEmail: async (email: Email) => {
    const { id } = email;

    // Skip if already loaded from cache/mock (will still refresh if source is 'cache')
    const existing = get().results[id];
    if (existing && existing.source !== 'cache') return;

    set((s) => ({
      loading: { ...s.loading, [id]: true },
      errors: { ...s.errors, [id]: null },
    }));

    try {
      const result = await triageEmailApi(email);

      // Merge in any frontend-only fields from the mock (decisionRecommendation,
      // detectedTaskType, stressLevel, replyVariants, etc.). The live AI backend
      // does not return these fields, so we fall back to the mock when present,
      // and supply sensible defaults for pasted/unknown emails.
      const mockFallback = MOCK_TRIAGE_RESULTS[id];
      const merged: TriageResult = {
        ...result,
        priorityLevel: result.priorityLevel ?? mockFallback?.priorityLevel ?? 'Medium',
        detectedTaskType: result.detectedTaskType ?? mockFallback?.detectedTaskType ?? 'none',
        requiresImmediateAttention: result.requiresImmediateAttention ?? mockFallback?.requiresImmediateAttention ?? false,
        stressLevel: result.stressLevel ?? mockFallback?.stressLevel ?? 'low',
        isSpam: result.isSpam ?? mockFallback?.isSpam ?? false,
        spamReason: result.spamReason ?? mockFallback?.spamReason,
        replyVariants: result.replyVariants ?? mockFallback?.replyVariants ?? {
          formal: result.replyDraft,
          short: result.replyDraft,
          friendly: result.replyDraft,
        },
        replyConfidence: result.replyConfidence ?? mockFallback?.replyConfidence ?? result.confidence,
        calendarConfidence: result.calendarConfidence ?? mockFallback?.calendarConfidence ?? result.confidence,
        taskConfidence: result.taskConfidence ?? mockFallback?.taskConfidence ?? result.confidence,
        decisionRecommendation: result.decisionRecommendation ?? mockFallback?.decisionRecommendation ?? null,
      };

      set((s) => ({
        results: { ...s.results, [id]: merged },
        loading: { ...s.loading, [id]: false },
      }));

      // Sync priority back into emailStore
      useEmailStore.getState().setPriority(id, merged.priority);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Triage failed. Please try again.';
      set((s) => ({
        loading: { ...s.loading, [id]: false },
        errors: { ...s.errors, [id]: message },
      }));
    }
  },

  clearError: (emailId: string) => {
    set((s) => ({ errors: { ...s.errors, [emailId]: null } }));
  },
}));
