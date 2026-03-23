"use client";

import { PriorityBadge } from "./EmailList";

// Shows AI-generated summary, priority badge, and reasons
export default function SummaryCard({ email }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Summary</h3>
        <PriorityBadge level={email.priority?.level} />
      </div>

      {/* Email meta */}
      <div className="mb-3">
        <p className="text-white font-semibold text-base">{email.subject}</p>
        <p className="text-gray-400 text-sm mt-0.5">
          From: <span className="text-gray-300">{email.senderName}</span>{" "}
          <span className="text-gray-500">({email.senderEmail})</span>
        </p>
      </div>

      {/* AI Summary */}
      <p className="text-gray-300 text-sm leading-relaxed mb-4">{email.summary}</p>

      {/* Priority reasons */}
      {email.priority?.reasons?.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Why this priority</p>
          <ul className="space-y-1">
            {email.priority.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                <span className="text-blue-400 mt-0.5">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
