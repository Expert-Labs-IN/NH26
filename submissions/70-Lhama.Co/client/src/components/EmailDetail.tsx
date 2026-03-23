import type { Email } from '../types';
import PriorityBadge from './PriorityBadge';
import ThreadedReplyView from './ThreadedReplyView';
import { formatTimestamp, getInitials, avatarColor } from '../utils/helpers';
import { useEmailStore } from '../stores/emailStore';
import { Mail } from 'lucide-react';

interface EmailDetailProps {
  email: Email;
}

export default function EmailDetail({ email }: EmailDetailProps) {
  const initials = getInitials(email.fromName);
  const color = avatarColor(email.fromName);
  const sentReplies = useEmailStore((s) => s.sentReplies[email.id] ?? []);

  return (
    <article
      className="border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900"
      aria-label="Email content"
    >
      <div className="p-5">
        {/* Subject */}
        <h1 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-snug">
          {email.subject}
        </h1>

        {/* Meta row */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold ${color}`}
            aria-hidden="true"
          >
            {initials}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {email.fromName}
              </span>
              {email.priority && <PriorityBadge priority={email.priority} size="sm" />}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Mail className="w-3 h-3 text-slate-400 flex-shrink-0" aria-hidden="true" />
              <span className="text-xs text-slate-400 dark:text-slate-500 truncate">{email.from}</span>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {formatTimestamp(email.timestamp)}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-700 mb-4" />

        {/* Body */}
        <div
          className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap"
          role="main"
          aria-label="Email body"
        >
          {email.body}
        </div>
      </div>

      {/* Feature 9: Threaded reply view */}
      <ThreadedReplyView replies={sentReplies} />
    </article>
  );
}
