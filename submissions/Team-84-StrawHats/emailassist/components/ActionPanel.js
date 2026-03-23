"use client";

import { useState } from "react";
import SummaryCard from "./SummaryCard";
import ReplyCard from "./ReplyCard";
import CalendarCard from "./CalendarCard";
import TaskCard from "./TaskCard";
import AutopilotPanel from "./AutopilotPanel";
import { Bot, FileText, Reply, Calendar, ListChecks, MailOpen, Cpu } from "lucide-react";

const TABS = [
  { id: "summary",   label: "Summary",   icon: FileText },
  { id: "reply",     label: "Reply",     icon: Reply },
  { id: "calendar",  label: "Calendar",  icon: Calendar },
  { id: "tasks",     label: "Tasks",     icon: ListChecks },
  { id: "autopilot", label: "Autopilot", icon: Cpu },
];

export default function ActionPanel({ email, onUpdate, autopilotEnabled, onAutopilotChange }) {
  const [activeTab, setActiveTab] = useState("summary");

  // When no email is selected, only the Autopilot tab is available
  const effectiveTab =
    !email && activeTab !== "autopilot" ? "autopilot" : activeTab;

  return (
    <div className="flex flex-col h-full bg-white text-[#211B34]">
      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <nav className="flex items-center px-10 pt-6 gap-2 shrink-0 overflow-x-auto">
        {TABS.map((tab) => {
          const isActive = effectiveTab === tab.id;
          const isAutopilot = tab.id === "autopilot";
          const Icon = tab.icon;

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
              className={`relative flex items-center gap-2.5 px-6 py-3 text-sm font-bold whitespace-nowrap transition-all rounded-lg ${
                isActive
                  ? "text-[#7C3AED] bg-white"
                  : isDisabled
                  ? "text-gray-200 cursor-not-allowed"
                  : "text-gray-400 hover:text-[#7C3AED] hover:bg-gray-50"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "scale-110" : "scale-100"} transition-transform`} />
              {tab.label}
              {isAutopilot && autopilotEnabled && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-[#7C3AED] rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Tab content ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
        {effectiveTab === "autopilot" ? (
          <AutopilotPanel onSettingsChange={onAutopilotChange} />
        ) : !email ? null : (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
          <div className="flex flex-col items-center justify-center h-full text-center py-20 px-10">
            <div className="w-20 h-20 rounded-lg bg-gray-50 flex items-center justify-center mb-8">
              <MailOpen className="w-10 h-10 text-gray-200" />
            </div>
            <p className="text-[#211B34] font-bold text-xl mb-3">Select an email</p>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Pick a conversation from your inbox to see AI summaries and smart actions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
