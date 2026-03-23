import { useEmailStore } from '../stores/emailStore';
import { useAppStore, type InboxFilter } from '../stores/appStore';
import { cn } from '../utils/helpers';
import { ShieldX } from 'lucide-react';

const TABS: { label: string; value: InboxFilter; dot?: string; icon?: typeof ShieldX }[] = [
  { label: 'All', value: 'all' },
  { label: 'Urgent', value: 'Urgent', dot: 'bg-red-500' },
  { label: 'Action', value: 'Requires Action', dot: 'bg-amber-500' },
  { label: 'FYI', value: 'FYI', dot: 'bg-blue-500' },
  { label: 'Spam', value: 'spam', icon: ShieldX },
];

export default function FilterTabs() {
  const { inboxFilter, setInboxFilter } = useAppStore();
  const emails = useEmailStore((s) => s.emails);

  const getCount = (filter: InboxFilter) => {
    if (filter === 'all') return emails.filter((e) => !e.isMarkedSpam).length;
    if (filter === 'spam') return emails.filter((e) => e.isMarkedSpam).length;
    return emails.filter((e) => e.priority === filter && !e.isMarkedSpam).length;
  };

  return (
    <div
      className="flex gap-1 px-2 py-2 border-b border-slate-100 dark:border-slate-700 flex-wrap"
      role="tablist"
      aria-label="Filter emails by priority"
    >
      {TABS.map((tab) => {
        const count = getCount(tab.value);
        const isActive = inboxFilter === tab.value;
        const isSpam = tab.value === 'spam';

        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => setInboxFilter(tab.value)}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              isActive
                ? isSpam
                  ? 'bg-red-500 text-white shadow-sm'
                  : 'bg-blue-600 text-white shadow-sm'
                : isSpam
                  ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'
            )}
          >
            {tab.icon && <tab.icon className="w-3 h-3 flex-shrink-0" aria-hidden="true" />}
            {tab.dot && !tab.icon && (
              <span
                className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', tab.dot)}
                aria-hidden="true"
              />
            )}
            {tab.label}
            {count > 0 && (
              <span
                className={cn(
                  'text-xs rounded-full px-1 min-w-[16px] text-center',
                  isActive
                    ? 'bg-white/20 text-white'
                    : isSpam
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
