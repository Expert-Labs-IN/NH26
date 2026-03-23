import type { Email } from '../types';
import PriorityBadge from './PriorityBadge';
import { cn, formatTimestamp, getInitials, avatarColor } from '../utils/helpers';

interface EmailListItemProps {
  email: Email;
  isSelected: boolean;
  onClick: () => void;
}

export default function EmailListItem({ email, isSelected, onClick }: EmailListItemProps) {
  const initials = getInitials(email.fromName);
  const color = avatarColor(email.fromName);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left px-3 py-3 rounded-xl transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
        isSelected
          ? 'bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900'
          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
      )}
      aria-pressed={isSelected}
      aria-label={`Email from ${email.fromName}: ${email.subject}`}
    >
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div
          className={cn(
            'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold',
            isSelected ? 'bg-white/20' : color,
          )}
          aria-hidden="true"
        >
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          {/* Row 1: Name + Time */}
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span
              className={cn(
                'text-xs font-semibold truncate',
                isSelected ? 'text-white' : !email.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300',
              )}
            >
              {email.fromName}
            </span>
            <span
              className={cn(
                'text-xs flex-shrink-0',
                isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500',
              )}
            >
              {formatTimestamp(email.timestamp).split(',')[1]?.trim() ?? ''}
            </span>
          </div>

          {/* Row 2: Subject */}
          <div className="flex items-center gap-1.5 mb-1">
            {!email.isRead && (
              <span
                className={cn(
                  'w-1.5 h-1.5 rounded-full flex-shrink-0',
                  isSelected ? 'bg-white' : 'bg-blue-500',
                )}
                aria-label="Unread"
              />
            )}
            <p
              className={cn(
                'text-xs truncate font-medium',
                isSelected ? 'text-white' : !email.isRead ? 'text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400',
              )}
            >
              {email.subject}
            </p>
          </div>

          {/* Row 3: Priority badge */}
          {email.priority && (
            <div className="mt-1">
              {isSelected ? (
                <span className="text-xs text-blue-100 font-medium">{email.priority}</span>
              ) : (
                <PriorityBadge priority={email.priority} size="sm" />
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}
