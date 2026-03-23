"use client";

import { useState, useTransition } from "react";
import { updateTaskStatus } from "@/actions/updateTaskStatus";

const PRIORITY_STYLES = {
  high: { bg: "bg-red-500", text: "text-white" },
  medium: { bg: "bg-yellow-500", text: "text-white" },
  low: { bg: "bg-gray-400", text: "text-white" },
};

function TaskRow({ task }) {
  const [status, setStatus] = useState(task.status);
  const [isPending, start] = useTransition();
  const style = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  function toggleStatus() {
    const newStatus = status === "completed" ? "pending" : "completed";
    start(async () => {
      await updateTaskStatus({ taskId: task._id, status: newStatus });
      setStatus(newStatus);
    });
  }

  const isCompleted = status === "completed";

  return (
    <li className={`bg-white rounded-xl px-5 py-4 flex items-start justify-between gap-4 transition-opacity ${
      isCompleted ? "opacity-60" : ""
    }`}>
      <div className="flex-1 min-w-0">
        {/* Task title */}
        <p className={`font-medium text-sm ${isCompleted ? "line-through text-gray-400" : "text-[#211B34]"}`}>
          {task.title}
        </p>

        {/* Source email */}
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          From: <span className="text-gray-600">{task.sourceEmailSubject || "Unknown email"}</span>
        </p>

        {/* Deadline */}
        {task.deadline && (
          <p className="text-xs text-gray-500 mt-1">
            Due:{" "}
            <span className={`font-medium ${isCompleted ? "text-gray-400" : "text-gray-700"}`}>
              {task.deadline}
            </span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Priority badge */}
        <span className={`text-xs px-2 py-0.5 rounded-full ${style.bg} ${style.text}`}>
          {task.priority}
        </span>

        {/* Mark complete / reopen button */}
        <button
          onClick={toggleStatus}
          disabled={isPending}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
            isCompleted
              ? "bg-gray-200 hover:bg-gray-300 text-gray-600"
              : "bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white"
          }`}
        >
          {isPending ? "…" : isCompleted ? "Reopen" : "Mark Done"}
        </button>
      </div>
    </li>
  );
}

export default function TasksClient({ initialTasks }) {
  const [filter, setFilter] = useState("all"); // "all" | "pending" | "completed"
  const tasks = initialTasks;

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const doneCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Task Dashboard</h1>
          <p className="text-sm text-white/60 mt-1">
            {pendingCount} pending · {doneCount} completed
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {["all", "pending", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 capitalize ${
                filter === f ? "bg-white text-[#7C3AED]" : "text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-white/60 text-sm">No tasks here yet.</p>
          <p className="text-white/40 text-xs mt-1">Approve tasks from emails in your inbox.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map((task) => (
            <TaskRow key={task._id} task={task} />
          ))}
        </ul>
      )}
    </div>
  );
}
