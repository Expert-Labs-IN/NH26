"use client";

import { useState } from "react";
import SummaryCard from "./SummaryCard";
import ReplyCard from "./ReplyCard";
import CalendarCard from "./CalendarCard";
import TaskCard from "./TaskCard";
import AutopilotPanel from "./AutopilotPanel";

const TABS = [
  { id: "summary",   label: "Summary" },
  { id: "reply",     label: "Reply" },
  { id: "calendar",  label: "Calendar" },
  { id: "tasks",     label: "Tasks" },
  { id: "autopilot", label: "Autopilot" },
];

export default function ActionPanel({ email, onUpdate, autopilotEnabled, onAutopilotChange }) {
  const [activeTab, setActiveTab] = useState("summary");

  // When no email is selected, only the Autopilot tab is available
  const effectiveTab =
    !email && activeTab !== "autopilot" ? "autopilot" : activeTab;

  return (
    <div className="flex flex-col h-full">
      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <nav className="flex items-center border-b border-gray-800 px-3 pt-1 shrink-0 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = effectiveTab === tab.id;
          const isAutopilot = tab.id === "autopilot";

          // Disable email-specific tabs when no email is selected
          const isDisabled = !email && !isAutopilot;

          // Hide Calendar/Tasks tabs when the email has neither
          if (tab.id === "calendar" && email && !email.hasMeeting) return null;
          if (tab.id === "tasks" && email && !(email.hasTasks && email.tasks?.length > 0)) return null;

          return (
            <button
              key={tab.id}
              onClick={() => !isDisabled && setActiveTab(tab.id)}
              disabled={isDisabled}
              className={`relative flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                isActive
                  ? "text-white border-blue-500"
                  : isDisabled
                  ? "text-gray-700 border-transparent cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-300 border-transparent hover:border-gray-700"
              }`}
            >
              {isAutopilot && (
                <>
                  <span className="text-sm">🤖</span>
                  {autopilotEnabled && (
                    <span className="absolute top-1.5 right-1 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  )}
                </>
              )}
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4">
        {effectiveTab === "autopilot" ? (
          <AutopilotPanel onSettingsChange={onAutopilotChange} />
        ) : !email ? null : (
          <div className="space-y-4">
            {effectiveTab === "summary" && <SummaryCard email={email} />}
            {effectiveTab === "reply" && (
              <ReplyCard email={email} onUpdate={onUpdate} />
            )}
            {effectiveTab === "calendar" && email.hasMeeting && email.calendarEvent && (
              <CalendarCard email={email} onUpdate={onUpdate} />
            )}
            {effectiveTab === "tasks" &&
              email.hasTasks &&
              email.tasks?.length > 0 && (
                <TaskCard email={email} onUpdate={onUpdate} />
              )}
          </div>
        )}

        {/* Fallback when no email is selected and not on autopilot tab */}
        {!email && effectiveTab !== "autopilot" && (
          <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6">
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <svg
                className="w-7 h-7 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"
                />
              </svg>
            </div>
            <p className="text-gray-500 text-sm">Select an email to view actions</p>
          </div>
        )}
      </div>
    </div>
  );
}
