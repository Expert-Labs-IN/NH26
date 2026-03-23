import { Loader2, Zap } from 'lucide-react';
import { useEmailStore } from '../stores/emailStore';
import { useTriageStore } from '../stores/triageStore';
import { cn } from '../utils/helpers';

export default function ProcessAllButton() {
  const emails = useEmailStore((s) => s.emails);
  const isBatchTriaging = useEmailStore((s) => s.isBatchTriaging);
  const batchProgress = useEmailStore((s) => s.batchProgress);
  const setBatchTriaging = useEmailStore((s) => s.setBatchTriaging);
  const setBatchProgress = useEmailStore((s) => s.setBatchProgress);
  const { triageEmail, results } = useTriageStore();

  const untriagedCount = emails.filter((e) => !results[e.id]).length;
  const allDone = untriagedCount === 0 && emails.length > 0;

  const handleProcessAll = async () => {
    if (isBatchTriaging || allDone) return;

    const untriagedEmails = emails.filter((e) => !results[e.id]);
    if (untriagedEmails.length === 0) return;

    setBatchTriaging(true);
    setBatchProgress(0);

    for (let i = 0; i < untriagedEmails.length; i++) {
      try {
        await triageEmail(untriagedEmails[i]);
      } catch {
        // continue even if one fails
      }
      setBatchProgress(i + 1);
    }

    setBatchTriaging(false);
    setBatchProgress(0);
  };

  return (
    <button
      onClick={handleProcessAll}
      disabled={isBatchTriaging || allDone || emails.length === 0}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
        allDone
          ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 cursor-default border border-green-200 dark:border-green-800'
          : isBatchTriaging
          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 cursor-wait border border-blue-200 dark:border-blue-800'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50',
      )}
      aria-label={
        allDone ? 'All emails triaged' : `Process all ${untriagedCount} untriaged emails`
      }
    >
      {isBatchTriaging ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
          {batchProgress}/{emails.filter((e) => !results[e.id]).length + batchProgress}
        </>
      ) : allDone ? (
        <>
          <Zap className="w-3.5 h-3.5" aria-hidden="true" />
          All Triaged
        </>
      ) : (
        <>
          <Zap className="w-3.5 h-3.5" aria-hidden="true" />
          Process All ({untriagedCount})
        </>
      )}
    </button>
  );
}
