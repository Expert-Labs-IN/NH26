"use client";

import { useState, useTransition } from "react";
import { updateTaskStatus } from "@/actions/updateTaskStatus";

const PRIORITY_STYLES = {
  high: { bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
  medium: { bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
  low: { bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-600" },
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
    <li className={`bg-gray-900 border rounded-xl px-5 py-4 flex items-start justify-between gap-4 transition-opacity ${
      isCompleted ? "opacity-60 border-gray-800" : "border-gray-800"
    }`}>
      <div className="flex-1 min-w-0">
        {/* Task title */}
        <p className={`font-medium text-sm ${isCompleted ? "line-through text-gray-500" : "text-white"}`}>
          {task.title}
        </p>

        {/* Source email */}
        <p className="text-xs text-gray-500 mt-0.5 truncate">
          From: <span className="text-gray-400">{task.sourceEmailSubject || "Unknown email"}</span>
        </p>

        {/* Deadline */}
        {task.deadline && (
          <p className="text-xs text-gray-500 mt-1">
            Due:{" "}
            <span className={`font-medium ${isCompleted ? "text-gray-500" : "text-gray-300"}`}>
              {task.deadline}
            </span>
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Priority badge */}
        <span className={`text-xs px-2 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
          {task.priority}
        </span>

        {/* Mark complete / reopen button */}
        <button
          onClick={toggleStatus}
          disabled={isPending}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
            isCompleted
              ? "bg-gray-800 hover:bg-gray-700 text-gray-400"
              : "bg-green-600 hover:bg-green-500 text-white"
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
          <p className="text-sm text-gray-500 mt-1">
            {pendingCount} pending · {doneCount} completed
          </p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1">
          {["all", "pending", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                filter === f ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"
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
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No tasks here yet.</p>
          <p className="text-gray-600 text-xs mt-1">Approve tasks from emails in your inbox.</p>
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
