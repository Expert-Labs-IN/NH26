import { Inbox, CheckCircle2, Calendar, LayoutList, Ghost } from "lucide-react";

// Priority badge colors and labels
const PRIORITY_CONFIG = {
  urgent: { label: "Urgent", bg: "bg-red-500", text: "text-white" },
  requires_action: { label: "Action Required", bg: "bg-yellow-500", text: "text-white" },
  fyi: { label: "FYI", bg: "bg-gray-400", text: "text-white" },
};

export function PriorityBadge({ level }) {
  const config = PRIORITY_CONFIG[level] || PRIORITY_CONFIG.fyi;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

export default function EmailList({ emails, selectedId, onSelect }) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
        <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mb-6">
          <Ghost className="w-8 h-8 text-white/20" />
        </div>
        <p className="text-white font-bold text-lg mb-2">Your inbox is clear</p>
        <p className="text-white/40 text-sm leading-relaxed max-w-[200px] mx-auto">
          No emails processed yet. Click Refresh to let AI handle your inbox.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-12 space-y-2">
      {emails.map((email) => {
        const isSelected = email.emailId === selectedId;
        return (
          <div key={email.emailId}>
            <button
              onClick={() => onSelect(email)}
              className={`w-full text-left p-5 rounded-lg transition-all duration-300 group ${
                isSelected
                  ? "bg-white scale-[1.02]"
                  : "bg-white/10 hover:bg-white/15"
              }`}
            >
              {/* Top row: sender name + priority badge */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className={`text-sm font-bold truncate ${isSelected ? "text-[#7C3AED]" : "text-white"}`}>
                  {email.senderName}
                </span>
                <PriorityBadge level={email.priority?.level} />
              </div>

              {/* Subject */}
               <p className={`text-sm font-medium truncate mb-2 ${isSelected ? "text-gray-700" : "text-white/70"}`}>
                {email.subject}
              </p>

              {/* Short summary */}
               <p className={`text-xs leading-relaxed line-clamp-2 ${isSelected ? "text-gray-600" : "text-white/40"}`}>
                {email.summary}
              </p>

              {/* Status icons */}
              <div className="flex items-center gap-3 mt-4">
                {email.replySent && (
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 ${isSelected ? "text-green-600" : "text-green-400"}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Replied
                  </span>
                )}
                {email.calendarCreated && (
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 ${isSelected ? "text-blue-600" : "text-blue-400"}`}>
                    <Calendar className="w-3.5 h-3.5" />
                    Event
                  </span>
                )}
                 {email.tasksApproved && (
                  <span className={`text-[11px] font-bold flex items-center gap-1.5 ${isSelected ? "text-[#7C3AED]" : "text-purple-400"}`}>
                    <LayoutList className="w-3.5 h-3.5" />
                    Tasks
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
