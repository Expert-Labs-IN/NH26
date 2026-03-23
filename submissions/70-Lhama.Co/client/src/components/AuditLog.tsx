import { MessageSquare, Calendar, CheckSquare, Check, X, ClipboardList } from 'lucide-react';
import { useActionStore } from '../stores/actionStore';
import { useEmailStore } from '../stores/emailStore';
import { cn, truncate } from '../utils/helpers';
import type { ActionType } from '../types';

const TYPE_CONFIG: Record<ActionType, { icon: typeof MessageSquare; color: string; label: string }> = {
  reply: { icon: MessageSquare, color: 'text-violet-600 bg-violet-100 dark:bg-violet-900/40', label: 'Reply' },
  calendar: { icon: Calendar, color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40', label: 'Calendar' },
  task: { icon: CheckSquare, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/40', label: 'Task' },
};

function formatLogTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function AuditLog() {
  const auditLog = useActionStore((s) => s.auditLog);
  const emails = useEmailStore((s) => s.emails);

  const getSubject = (emailId: string) =>
    emails.find((e) => e.id === emailId)?.subject ?? emailId;

  return (
    <aside
      className="flex flex-col h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700"
      aria-label="Session audit log"
    >
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-blue-600" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Audit Log</h2>
        {auditLog.length > 0 && (
          <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
            {auditLog.length} action{auditLog.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto px-3 py-3">
        {auditLog.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
              <ClipboardList className="w-5 h-5 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-xs font-medium text-slate-400 dark:text-slate-500">No actions yet</p>
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
              Approve or reject AI suggestions to see them here
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical timeline line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-slate-100 dark:bg-slate-700" aria-hidden="true" />

            <ol className="space-y-3 relative" aria-label="Action history">
              {auditLog.map((entry) => {
                const cfg = TYPE_CONFIG[entry.type];
                const Icon = cfg.icon;
                const subject = truncate(entry.emailSubject || getSubject(entry.emailId), 32);

                return (
                  <li key={entry.id} className="flex gap-3 items-start">
                    {/* Icon bubble */}
                    <div
                      className={cn(
                        'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center relative z-10',
                        cfg.color,
                      )}
                      aria-hidden="true"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2.5 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                          {cfg.label}
                        </span>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {entry.status === 'executed' ? (
                            <span className="flex items-center gap-0.5 text-xs text-green-700 dark:text-green-400 font-medium">
                              <Check className="w-3 h-3" aria-hidden="true" />
                              Done
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-xs text-slate-400 font-medium">
                              <X className="w-3 h-3" aria-hidden="true" />
                              Rejected
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
                        {subject}
                      </p>

                      {entry.summary && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                          {entry.summary}
                        </p>
                      )}

                      <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
                        {formatLogTime(entry.timestamp)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </aside>
  );
}
