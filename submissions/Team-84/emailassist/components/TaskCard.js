import { useState, useTransition } from "react";
import { approveTasks } from "@/actions/approveTasks";
import { ListChecks, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

const PRIORITY_STYLES = {
  high: "bg-red-50 text-red-600 font-bold",
  medium: "bg-yellow-50 text-yellow-600 font-bold",
  low: "bg-gray-50 text-gray-400 font-bold",
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
    <div className="bg-white rounded-xl p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED]">
            <ListChecks className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#211B34]/30 uppercase tracking-[0.2em]">Tasks</h3>
            <p className="text-[#211B34] font-bold text-lg">{email.tasks?.length || 0} Identified</p>
          </div>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-4 mb-8">
        {(email.tasks || []).map((task, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 bg-gray-50/50 p-5 rounded-lg group transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="text-base text-[#211B34] font-bold truncate">{task.title}</p>
              {task.deadline && (
                <div className="flex items-center gap-1.5 mt-1 text-[#211B34]/40">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold">{task.deadline}</span>
                </div>
              )}
            </div>
            <span
              className={`flex-shrink-0 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full ${
                PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
              }`}
            >
              {task.priority}
            </span>
          </div>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 text-red-600 rounded-lg text-sm font-bold">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      <button
        onClick={handleApproveAll}
        disabled={isPending || approved}
        className={`w-full flex items-center justify-center gap-3 py-4 rounded-lg text-base font-black transition-all duration-300 active:scale-[0.98] ${
          approved
            ? "bg-green-50 text-green-600 cursor-default"
            : "bg-[#7C3AED] hover:bg-[#6D28D9] text-white"
        }`}
      >
        {approved ? (
          <>
            <CheckCircle2 className="w-5 h-5" />
            TASKS SAVED
          </>
        ) : isPending ? (
          "SAVING..."
        ) : (
          "APPROVE ALL TASKS"
        )}
      </button>
    </div>
  );
}
