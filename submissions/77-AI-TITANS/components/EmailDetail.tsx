'use client';

import { Email } from '@/types';
import { User, Calendar, Paperclip, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface EmailDetailProps {
  email: Email;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

export default function EmailDetail({ email, onAnalyze, isAnalyzing }: EmailDetailProps) {
  const [showThread, setShowThread] = useState(false);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {email.subject}
        </h1>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
              {email.from.name.split(' ').map(n => n[0]).join('')}
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {email.from.name}
                </span>
                {email.from.isVIP && (
                  <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {email.from.email}
              </p>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>
                  {format(new Date(email.timestamp), 'PPpp')}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className={`
              px-6 py-2.5 rounded-lg font-medium transition-all
              ${isAnalyzing
                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
              }
            `}
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              '🤖 AI Analyze'
            )}
          </button>
        </div>

        {email.hasAttachments && (
          <div className="mt-4 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Paperclip className="w-4 h-4" />
            <span>Has attachments</span>
          </div>
        )}
      </div>

      {/* Thread History */}
      {email.thread.length > 0 && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowThread(!showThread)}
            className="w-full px-6 py-3 flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <span>Previous messages ({email.thread.length})</span>
            {showThread ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>

          {showThread && (
            <div className="px-6 pb-4 space-y-3 bg-gray-50 dark:bg-gray-900/50">
              {email.thread.map((msg, idx) => (
                <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {msg.subject}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-500 mb-2">
                    {format(new Date(msg.timestamp), 'PPp')}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {msg.body}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Email Body */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="prose dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {email.body}
          </div>
        </div>
      </div>
    </div>
  );
}
