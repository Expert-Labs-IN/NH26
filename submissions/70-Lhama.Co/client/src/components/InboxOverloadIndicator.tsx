import { useState } from 'react';
import { Trash2, ShieldAlert, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useEmailStore } from '../stores/emailStore';

export default function InboxOverloadIndicator() {
  const emails = useEmailStore((s) => s.emails);
  const cleanInbox = useEmailStore((s) => s.cleanInbox);
  const [isExpanded, setIsExpanded] = useState(false);
  const [cleaned, setCleaned] = useState(false);

  const totalEmails = emails.length;
  const spamCount = emails.filter((e) => e.isMarkedSpam).length;
  const lowPriorityCount = emails.filter((e) => !e.isMarkedSpam && e.priority === 'FYI').length;
  const cleanableCount = spamCount + lowPriorityCount;
  const isOverloaded = totalEmails >= 8;

  const overloadLevel =
    totalEmails >= 12 ? 'Critical' :
    totalEmails >= 8 ? 'High' :
    totalEmails >= 5 ? 'Moderate' : 'Normal';

  const levelCfg = {
    Critical: { bar: 'bg-red-500', barW: '100%', badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300', border: 'border-red-200 dark:border-red-800', bg: 'bg-red-50 dark:bg-red-900/10' },
    High: { bar: 'bg-orange-500', barW: '75%', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', bg: 'bg-orange-50 dark:bg-orange-900/10' },
    Moderate: { bar: 'bg-amber-500', barW: '50%', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', bg: 'bg-amber-50 dark:bg-amber-900/10' },
    Normal: { bar: 'bg-emerald-500', barW: '25%', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', bg: 'bg-emerald-50 dark:bg-emerald-900/10' },
  }[overloadLevel];

  const handleClean = () => {
    cleanInbox();
    setCleaned(true);
    setTimeout(() => setCleaned(false), 3000);
  };

  return (
    <section
      className={`rounded-xl border ${levelCfg.border} ${levelCfg.bg} overflow-hidden animate-slide-up`}
      aria-label="Inbox overload indicator"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-slate-600 dark:text-slate-300" aria-hidden="true" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
            Inbox Overload Analyser
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelCfg.badge}`}>
            {overloadLevel}
          </span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
        </div>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-200/50 dark:border-slate-700/50 pt-3">
          {/* Load bar */}
          <div>
            <div className="flex items-center justify-between mb-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Inbox Load</span>
              <span className="font-semibold">{totalEmails} emails</span>
            </div>
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${levelCfg.bar}`}
                style={{ width: levelCfg.barW }}
              />
            </div>
          </div>

          {/* Breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-400 dark:text-slate-500">Spam</p>
              <p className="text-lg font-bold text-red-500">{spamCount}</p>
            </div>
            <div className="bg-white dark:bg-slate-800/60 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-400 dark:text-slate-500">Low Priority</p>
              <p className="text-lg font-bold text-amber-500">{lowPriorityCount}</p>
            </div>
          </div>

          {/* Description */}
          {isOverloaded && !cleaned && (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your inbox has <span className="font-semibold">{cleanableCount} removable emails</span> — {spamCount} spam and {lowPriorityCount} low-priority (FYI). Clean up to focus on what matters.
            </p>
          )}

          {/* Success state */}
          {cleaned && (
            <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Inbox cleaned successfully — {cleanableCount} emails removed!
            </div>
          )}

          {/* Clean button */}
          {cleanableCount > 0 && !cleaned && (
            <button
              onClick={handleClean}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 shadow-sm"
              aria-label={`Remove ${cleanableCount} spam and low-priority emails`}
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              Auto-Clean Inbox ({cleanableCount} emails)
            </button>
          )}

          {cleanableCount === 0 && !cleaned && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium text-center">
              ✓ No spam or low-priority emails to remove
            </p>
          )}
        </div>
      )}
    </section>
  );
}
