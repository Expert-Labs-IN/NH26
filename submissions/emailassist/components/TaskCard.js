"use client";

import { useState, useTransition } from "react";
import { approveTasks } from "@/actions/approveTasks";

const PRIORITY_STYLES = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-gray-500/20 text-gray-400 border-gray-600",
};

export default function TaskCard({ email, onUpdate }) {
  const [approved, setApproved] = useState(email.tasksApproved);
  const [isPending, startApprove] = useTransition();
  const [error, setError] = useState("");

  function handleApproveAll() {
    if (approved) return;
    startApprove(async () => {
      try {
        setError("");
        await approveTasks({
          emailId: email.emailId,
          subject: email.subject,
          tasks: email.tasks,
        });
        setApproved(true);
        if (onUpdate) onUpdate({ ...email, tasksApproved: true });
      } catch (err) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Tasks</h3>
        </div>
        <span className="text-xs text-gray-500">{email.tasks?.length || 0} task(s)</span>
      </div>

      {/* Task list */}
      <ul className="space-y-2 mb-4">
        {(email.tasks || []).map((task, i) => (
          <li
            key={i}
            className="flex items-start justify-between gap-3 bg-gray-800 rounded-lg px-3 py-2.5"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-200 font-medium">{task.title}</p>
              {task.deadline && (
                <p className="text-xs text-gray-500 mt-0.5">
                  Due: <span className="text-gray-400">{task.deadline}</span>
                </p>
              )}
            </div>
            <span
              className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full border ${
                PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
              }`}
            >
              {task.priority}
            </span>
          </li>
        ))}
      </ul>

      {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

      <button
        onClick={handleApproveAll}
        disabled={isPending || approved}
        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
          approved
            ? "bg-green-600/20 text-green-400 border border-green-600/30 cursor-default"
            : "bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50"
        }`}
      >
        {approved ? (
          <>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Tasks Saved
          </>
        ) : isPending ? (
          "Saving…"
        ) : (
          "Approve All Tasks"
        )}
      </button>
    </div>
  );
}
