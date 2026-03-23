import { useEffect, useId } from 'react';
import { AlertCircle, RefreshCw, Zap } from 'lucide-react';
import type { Email } from '../types';
import { useTriageStore } from '../stores/triageStore';
import { useActionStore } from '../stores/actionStore';
import { useEmailStore } from '../stores/emailStore';
import SummarySection from './SummarySection';
import ActionCard from './ActionCard';
import PriorityBadge from './PriorityBadge';
import TaskDetectionBadge from './TaskDetectionBadge';
import InboxOverloadIndicator from './InboxOverloadIndicator';
import DecisionSimulator from './DecisionSimulator';

interface TriagePanelProps {
  email: Email;
  onToast: (msg: string) => void;
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function TriageSkeleton() {
  return (
    <div className="space-y-4 animate-fade-in" aria-label="Loading AI analysis…" aria-busy="true">
      <div className="flex items-center gap-2 px-1">
        <div className="w-4 h-4 skeleton-shimmer rounded-full" />
        <div className="h-3 skeleton-shimmer rounded w-28" />
        <div className="ml-auto h-5 skeleton-shimmer rounded-full w-20" />
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
        <div className="h-3 skeleton-shimmer rounded w-20" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-2">
            <div className="w-5 h-5 skeleton-shimmer rounded-full flex-shrink-0" />
            <div className="flex-1 h-3 skeleton-shimmer rounded" />
          </div>
        ))}
      </div>

      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 skeleton-shimmer rounded-lg" />
            <div className="h-3 skeleton-shimmer rounded w-24" />
          </div>
          <div className="h-3 skeleton-shimmer rounded w-full" />
          <div className="h-3 skeleton-shimmer rounded w-3/4" />
          <div className="flex gap-2 pt-1">
            <div className="h-7 skeleton-shimmer rounded-lg w-32" />
            <div className="h-7 skeleton-shimmer rounded-lg w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Priority Level Badge ──────────────────────────────────────────────────────

function PriorityLevelBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const cfg = {
    High: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800',
    Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    Low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
  }[level];
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg}`} aria-label={`Priority: ${level}`}>
      {level} Priority
    </span>
  );
}

// ─── Main panel ────────────────────────────────────────────────────────────────

export default function TriagePanel({ email, onToast }: TriagePanelProps) {
  const { results, loading, errors, triageEmail, clearError } = useTriageStore();
  const { approveAction, rejectAction, getStatus } = useActionStore();
  const { addSentReply } = useEmailStore();

  const isLoading = loading[email.id] ?? false;
  const error = errors[email.id] ?? null;
  const result = results[email.id] ?? null;
  const sectionId = useId();

  useEffect(() => {
    triageEmail(email);
  }, [email.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const makeApproveHandler = (type: 'reply' | 'calendar' | 'task', label: string) =>
    async (payload: Record<string, unknown>) => {
      await approveAction({
        emailId: email.id,
        emailSubject: email.subject,
        type,
        payload,
        fromAddress: email.from,
        threadId: email.thread?.[0],
        messageId: email.messageId,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });

      // Feature 9: push reply to threaded view
      if (type === 'reply') {
        addSentReply({
          id: `reply_${Date.now()}`,
          emailId: email.id,
          body: String(payload.body ?? ''),
          tone: (payload.tone as 'formal' | 'short' | 'friendly') ?? 'formal',
          sentAt: new Date().toISOString(),
        });
      }

      onToast(`✓ ${label} approved and logged`);
    };

  const makeRejectHandler = (type: 'reply' | 'calendar' | 'task') => () => {
    rejectAction({ emailId: email.id, emailSubject: email.subject, type });
    const label = type === 'reply' ? 'Reply' : type === 'calendar' ? 'Calendar event' : 'Tasks';
    onToast(`${label} suggestion rejected`);
  };

  return (
    <section
      className="p-4 space-y-4 bg-slate-50 dark:bg-slate-800/50 min-h-full"
      aria-labelledby={sectionId}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5" id={sectionId}>
          <Zap className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">AI Triage</h2>
        </div>
        {result && <PriorityBadge priority={result.priority} size="md" />}
      </div>

      {isLoading && <TriageSkeleton />}

      {/* Error */}
      {error && !isLoading && (
        <div
          className="flex items-start gap-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 p-4"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-300">Triage failed</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{error}</p>
          </div>
          <button
            onClick={() => { clearError(email.id); triageEmail(email); }}
            className="flex items-center gap-1 text-xs text-red-700 dark:text-red-400 font-medium hover:text-red-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <div className="space-y-3 animate-fade-in">

          {/* Feature 1 & 3: Priority level + Task detection badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {result.priorityLevel && <PriorityLevelBadge level={result.priorityLevel} />}
            <TaskDetectionBadge detectedTaskType={result.detectedTaskType ?? 'none'} />
          </div>

          {/* AI Summary with confidence */}
          <SummarySection
            summary={result.summary}
            confidence={result.confidence}
            source={result.source}
          />

          {/* Feature 6: Inbox Overload Indicator */}
          <InboxOverloadIndicator />

          {/* Feature 2 & 4 & 5: Action cards with confidence + tone + calendar confirm */}
          <ActionCard
            type="reply"
            emailId={email.id}
            replyDraft={result.replyDraft}
            replyVariants={result.replyVariants}
            confidence={result.replyConfidence}
            onApprove={makeApproveHandler('reply', 'Reply draft')}
            onReject={makeRejectHandler('reply')}
            isApproved={getStatus(email.id, 'reply') === 'executed'}
            isRejected={getStatus(email.id, 'reply') === 'rejected'}
          />

          <ActionCard
            type="calendar"
            emailId={email.id}
            event={result.calendarEvent}
            confidence={result.calendarConfidence}
            onApprove={makeApproveHandler('calendar', 'Calendar event')}
            onReject={makeRejectHandler('calendar')}
            isApproved={getStatus(email.id, 'calendar') === 'executed'}
            isRejected={getStatus(email.id, 'calendar') === 'rejected'}
          />

          <ActionCard
            type="task"
            emailId={email.id}
            tasks={result.taskList}
            confidence={result.taskConfidence}
            onApprove={makeApproveHandler('task', 'Task list')}
            onReject={makeRejectHandler('task')}
            isApproved={getStatus(email.id, 'task') === 'executed'}
            isRejected={getStatus(email.id, 'task') === 'rejected'}
          />

          {/* Feature 7: Decision Simulator */}
          <DecisionSimulator recommendation={result.decisionRecommendation} />

        </div>
      )}

      {!result && !isLoading && !error && (
        <div className="flex flex-col items-center justify-center py-10 text-slate-300 dark:text-slate-600">
          <Zap className="w-10 h-10 mb-2 opacity-30" />
          <p className="text-xs">Waiting for AI analysis…</p>
        </div>
      )}
    </section>
  );
}
