import { Check, User, Dot } from 'lucide-react';
import type { SentReply, ReplyTone } from '../types';
import { cn, formatTimestamp, getInitials } from '../utils/helpers';

interface ThreadedReplyViewProps {
  replies: SentReply[];
}

const TONE_CONFIG: Record<ReplyTone, { label: string; cls: string }> = {
  formal: {
    label: 'Formal',
    cls: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  },
  short: {
    label: 'Short',
    cls: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300',
  },
  friendly: {
    label: 'Friendly',
    cls: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
};

export default function ThreadedReplyView({ replies }: ThreadedReplyViewProps) {
  if (replies.length === 0) return null;

  return (
    <div className="border-t border-slate-100 dark:border-slate-700" aria-label="Sent replies thread">
      {/* Thread header */}
      <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Sent Replies ({replies.length})
          </span>
        </div>
      </div>

      {/* Reply entries */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
        {replies.map((reply, idx) => {
          const toneCfg = TONE_CONFIG[reply.tone];

          return (
            <article
              key={reply.id}
              className="px-5 py-4 bg-white dark:bg-slate-900 animate-slide-up"
              aria-label={`Sent reply ${idx + 1}`}
            >
              {/* Sender row */}
              <div className="flex items-start gap-3 mb-3">
                {/* Connector line for threads > 1 */}
                {idx > 0 && (
                  <div className="absolute left-[38px] -mt-4 w-px h-4 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
                )}

                {/* "You" avatar */}
                <div
                  className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold"
                  aria-hidden="true"
                >
                  <User className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      You
                    </span>
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', toneCfg.cls)}>
                      {toneCfg.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      <Check className="w-3 h-3" aria-hidden="true" />
                      Sent
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                    <Dot className="w-3 h-3" />
                    {formatTimestamp(reply.sentAt)}
                  </div>
                </div>
              </div>

              {/* Reply body */}
              <div className="ml-12 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl px-4 py-3">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {reply.body}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
