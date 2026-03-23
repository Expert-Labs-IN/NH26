'use client';

import { Email } from '@/types';
import { Mail, Clock, Paperclip, AlertCircle, Star, CheckCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (email: Email) => void;
}

export default function EmailList({ emails, selectedEmailId, onSelectEmail }: EmailListProps) {
  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'action_required':
        return 'border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-900/20';
      default:
        return 'border-l-4 border-gray-300 dark:border-gray-600';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'action_required':
        return <CheckCircle className="w-4 h-4 text-amber-500" />;
      default:
        return <Mail className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
            URGENT
          </span>
        );
      case 'action_required':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
            ACTION REQUIRED
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            FYI
          </span>
        );
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Inbox
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {emails.length} messages
        </p>
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {emails.map((email) => {
          const isSelected = email.id === selectedEmailId;
          const timeAgo = formatDistanceToNow(new Date(email.timestamp), {
            addSuffix: true,
          });

          return (
            <div
              key={email.id}
              onClick={() => onSelectEmail(email)}
              className={`
                p-4 cursor-pointer transition-all hover:bg-gray-100 dark:hover:bg-gray-800
                ${getPriorityStyles(email.priority)}
                ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-l-blue-500' : ''}
              `}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getPriorityIcon(email.priority)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 dark:text-white truncate">
                      {email.from.name}
                    </span>
                    {email.from.isVIP && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                    {getPriorityBadge(email.priority)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo}</span>
                    {email.hasAttachments && (
                      <Paperclip className="w-3 h-3 ml-2" />
                    )}
                  </div>

                  <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
                    {email.subject}
                  </h3>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {email.body}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
