"use client";

// Priority badge colors and labels
const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  requires_action: { label: "Action Required", bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  fyi: { label: "FYI", bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-600" },
};

export function PriorityBadge({ level }) {
  const config = PRIORITY_CONFIG[level] || PRIORITY_CONFIG.fyi;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {config.label}
    </span>
  );
}

export default function EmailList({ emails, selectedId, onSelect }) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6">
        <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">No emails processed yet.</p>
        <p className="text-gray-600 text-xs mt-1">Click Refresh to fetch your inbox.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-800">
      {emails.map((email) => {
        const isSelected = email.emailId === selectedId;
        return (
          <li key={email.emailId}>
            <button
              onClick={() => onSelect(email)}
              className={`w-full text-left px-4 py-4 transition-colors hover:bg-gray-800/60 ${
                isSelected ? "bg-gray-800 border-l-2 border-blue-500" : "border-l-2 border-transparent"
              }`}
            >
              {/* Top row: sender name + priority badge */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-semibold text-white truncate">{email.senderName}</span>
                <PriorityBadge level={email.priority?.level} />
              </div>

              {/* Subject */}
              <p className="text-sm text-gray-300 truncate mb-1">{email.subject}</p>

              {/* Short summary */}
              <p className="text-xs text-gray-500 line-clamp-2">{email.summary}</p>

              {/* Status icons */}
              <div className="flex items-center gap-2 mt-2">
                {email.replySent && (
                  <span className="text-xs text-green-500 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Replied
                  </span>
                )}
                {email.calendarCreated && (
                  <span className="text-xs text-blue-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Event created
                  </span>
                )}
                {email.tasksApproved && (
                  <span className="text-xs text-purple-400 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Tasks saved
                  </span>
                )}
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
