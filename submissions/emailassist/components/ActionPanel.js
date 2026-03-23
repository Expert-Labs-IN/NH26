"use client";

import SummaryCard from "./SummaryCard";
import ReplyCard from "./ReplyCard";
import CalendarCard from "./CalendarCard";
import TaskCard from "./TaskCard";

// Right panel — renders all 4 action cards for the selected email
export default function ActionPanel({ email, onUpdate }) {
  if (!email) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6">
        <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">Select an email to view actions</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 overflow-y-auto h-full">
      {/* 1. Summary */}
      <SummaryCard email={email} />

      {/* 2. Reply */}
      <ReplyCard email={email} onUpdate={onUpdate} />

      {/* 3. Calendar Event — only shown if AI detected a meeting */}
      {email.hasMeeting && email.calendarEvent && (
        <CalendarCard email={email} onUpdate={onUpdate} />
      )}

      {/* 4. Tasks — only shown if AI extracted tasks */}
      {email.hasTasks && email.tasks?.length > 0 && (
        <TaskCard email={email} onUpdate={onUpdate} />
      )}
    </div>
  );
}
