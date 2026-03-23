import { useEffect, useMemo } from 'react';
import { Mail, RefreshCw, Inbox, ArrowUpDown } from 'lucide-react';
import { useEmailStore, sortEmailsByPriority } from '../stores/emailStore';
import { useAppStore } from '../stores/appStore';
import EmailListItem from './EmailListItem';
import FilterTabs from './FilterTabs';
import { EmailPasteModalTrigger } from './EmailPasteModal';
import { cn } from '../utils/helpers';

interface InboxSidebarProps {
  onOpenPasteModal: () => void;
}

export default function InboxSidebar({ onOpenPasteModal }: InboxSidebarProps) {
  const { emails, selectedEmailId, isLoadingEmails, loadEmails, selectEmail } = useEmailStore();
  const { inboxFilter, sortByPriority, togglePrioritySort } = useAppStore();

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  // Filter then sort
  const displayedEmails = useMemo(() => {
    let filtered;
    if (inboxFilter === 'spam') {
      filtered = emails.filter((e) => e.isMarkedSpam);
    } else if (inboxFilter === 'all') {
      filtered = emails.filter((e) => !e.isMarkedSpam);
    } else {
      filtered = emails.filter((e) => e.priority === inboxFilter && !e.isMarkedSpam);
    }
    return sortByPriority ? sortEmailsByPriority(filtered) : filtered;
  }, [emails, inboxFilter, sortByPriority]);

  const unreadCount = emails.filter((e) => !e.isRead && !e.isMarkedSpam).length;

  return (
    <aside
      className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700"
      aria-label="Email inbox"
    >
      {/* Header row */}
      <div className="px-3 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
        <Inbox className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden="true" />
        <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Inbox</h2>
        {unreadCount > 0 && (
          <span className="bg-blue-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
            {unreadCount}
          </span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {/* Sort toggle */}
          <button
            onClick={togglePrioritySort}
            className={cn(
              'p-1.5 rounded-lg text-xs transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
              sortByPriority
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
            aria-pressed={sortByPriority}
            aria-label={sortByPriority ? 'Disable priority sort' : 'Sort by priority'}
            title={sortByPriority ? 'Sorted by priority (click to disable)' : 'Sort by priority'}
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>

          {/* Add / Paste email */}
          <EmailPasteModalTrigger onClick={onOpenPasteModal} />

          {/* Refresh */}
          <button
            onClick={loadEmails}
            disabled={isLoadingEmails}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Refresh inbox"
          >

            <RefreshCw className={cn('w-3.5 h-3.5', isLoadingEmails && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <FilterTabs />

      {/* Count row */}
      <div className="px-3 py-1.5 border-b border-slate-50 dark:border-slate-800">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          {displayedEmails.length} of {emails.length} messages
          {sortByPriority && ' · sorted by priority'}
        </p>
      </div>

      {/* Email list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
        {isLoadingEmails && emails.length === 0 ? (
          <div className="space-y-2 px-1 pt-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 rounded-xl">
                <div className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full skeleton-shimmer flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 skeleton-shimmer rounded w-3/4" />
                    <div className="h-3 skeleton-shimmer rounded w-full" />
                    <div className="h-2.5 skeleton-shimmer rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-600">
            <Mail className="w-8 h-8 mb-2 opacity-30" />
            <p className="text-xs">
              {inboxFilter === 'all' ? 'No emails found' : `No ${inboxFilter} emails yet`}
            </p>
          </div>
        ) : (
          displayedEmails.map((email) => (
            <EmailListItem
              key={email.id}
              email={email}
              isSelected={email.id === selectedEmailId}
              onClick={() => selectEmail(email.id)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
