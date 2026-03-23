import { PriorityBadge } from "./EmailList";
import { Sparkles, FileText, User } from "lucide-react";

// Shows AI-generated summary, priority badge, and reasons
export default function SummaryCard({ email }) {
  return (
    <div className="bg-white rounded-xl p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 text-[#7C3AED] uppercase tracking-widest text-[10px] font-bold">
          <FileText className="w-3.5 h-3.5" />
          Summary
        </div>
        <PriorityBadge level={email.priority?.level} />
      </div>

      {/* Email meta */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#211B34] tracking-tight leading-tight mb-3">
          {email.subject}
        </h1>
        <div className="flex items-center gap-2 text-sm text-[#211B34]/60 bg-gray-50 px-4 py-2 rounded-lg w-fit">
          <User className="w-4 h-4" />
          <span className="font-bold text-[#211B34]/80">{email.senderName}</span>
          <span className="opacity-40">({email.senderEmail})</span>
        </div>
      </div>

      {/* AI Summary */}
      <div className="relative mb-8">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#7C3AED]/20 rounded-full" />
        <p className="text-[#211B34]/70 text-base leading-relaxed font-medium">
          {email.summary}
        </p>
      </div>

      {/* Priority reasons */}
      {email.priority?.reasons?.length > 0 && (
        <div className="mt-8 pt-8">
          <p className="text-[10px] text-[#211B34]/30 uppercase tracking-widest font-black mb-4">Why this priority</p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {email.priority.reasons.map((reason, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-[#211B34]/70 bg-gray-50/50 p-3 rounded-lg">
                <Sparkles className="w-4 h-4 text-[#7C3AED]/40 mt-0.5 shrink-0" />
                <span className="font-medium">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
