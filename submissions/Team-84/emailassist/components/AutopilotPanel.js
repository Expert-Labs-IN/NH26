"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { nanoid } from "nanoid";
import { 
  Bot, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  ListChecks, 
  SkipForward, 
  XCircle, 
  Plus, 
  Trash2, 
  RefreshCcw,
  Clock,
  Zap,
  ShieldAlert,
  ChevronRight
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────

function timeAgo(isoString) {
  if (!isoString) return "";
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

function StatusIcon({ status }) {
  if (status === "success")
    return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (status === "skipped")
    return <SkipForward className="w-4 h-4 text-gray-400" />;
  return <XCircle className="w-4 h-4 text-red-500" />;
}

function ActionBadge({ label, color, icon: Icon }) {
  const colors = {
    green: "bg-green-50 text-green-700",
    blue: "bg-blue-50 text-blue-700",
    purple: "bg-purple-50 text-purple-700",
    gray: "bg-gray-50 text-gray-500",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${colors[color] || colors.gray}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function LogEntry({ log }) {
  const bgColor =
    log.status === "success"
      ? "bg-green-50/30"
      : log.status === "skipped"
      ? "bg-white"
      : "bg-red-50/30";

  return (
    <div
      className={`${bgColor} p-5 rounded-xl transition-all`}
    >
      {/* Top row — icon + sender + time */}
      <div className="flex items-center gap-3 mb-2">
        <StatusIcon status={log.status} />
        <span className="text-sm font-black text-[#211B34] truncate flex-1">
          {log.senderName || "Unknown Sender"}
        </span>
        <span className="text-[10px] font-bold text-[#211B34]/30 shrink-0 uppercase tracking-widest flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(log.processedAt)}
        </span>
      </div>

      {/* Subject */}
      <p className="text-xs font-bold text-[#211B34]/50 truncate mb-4 ml-7">
        {log.emailSubject || "(No Subject)"}
      </p>

      {/* Action badges */}
      {log.status === "success" && (
        <div className="flex flex-wrap gap-2 ml-7 mb-4">
          {log.replySent && <ActionBadge label="Replied" color="green" icon={Mail} />}
          {log.eventCreated && <ActionBadge label="Event" color="blue" icon={Calendar} />}
          {log.tasksApproved && <ActionBadge label="Tasks" color="purple" icon={ListChecks} />}
        </div>
      )}

      {/* AI reasoning */}
      <div className="flex gap-2 ml-7 p-3 bg-white/50 rounded-lg text-[#211B34]/60 italic leading-relaxed">
        <Zap className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" />
        <p className="text-[11px] font-medium leading-relaxed">
          {log.status === "error"
            ? `Error: ${log.errorMessage}`
            : log.reasoning}
        </p>
      </div>

      {/* Matched rule */}
      {log.matchedRuleText && log.status !== "error" && (
        <div className="flex items-center gap-1.5 ml-7 mt-3 text-[10px] font-black text-blue-500/50 uppercase tracking-widest">
          <ShieldAlert className="w-3 h-3" />
          Rule: {'"'}{log.matchedRuleText}{'"'}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function AutopilotPanel({ onSettingsChange }) {
  const [enabled, setEnabled] = useState(false);
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPrefs, setIsLoadingPrefs] = useState(true);
  const [saveError, setSaveError] = useState("");
  const pollRef = useRef(null);
  const rulesRef = useRef(rules); // always points to latest rules

  // ── Load preferences on mount ─────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/preferences")
      .then((r) => r.json())
      .then((d) => {
        setEnabled(d.autopilotEnabled ?? false);
        const loadedRules =
          Array.isArray(d.rules) && d.rules.length > 0 ? d.rules : [];
        setRules(loadedRules);
        rulesRef.current = loadedRules;
      })
      .catch(() => {})
      .finally(() => setIsLoadingPrefs(false));
  }, []);

  // ── Load logs ─────────────────────────────────────────────────────────────
  const fetchLogs = useCallback(() => {
    fetch("/api/autopilot/logs")
      .then((r) => r.json())
      .then((d) => setLogs(Array.isArray(d.logs) ? d.logs : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── Poll every 6s when autopilot is enabled ───────────────────────────────
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (enabled) {
      pollRef.current = setInterval(fetchLogs, 6000);
    }
    return () => clearInterval(pollRef.current);
  }, [enabled, fetchLogs]);

  // ── Save preferences ──────────────────────────────────────────────────────
  async function savePrefs(newEnabled, newRules) {
    setIsSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ autopilotEnabled: newEnabled, rules: newRules }),
      });
      if (!res.ok) throw new Error("Failed to save");
      if (onSettingsChange) onSettingsChange(newEnabled);
    } catch (e) {
      setSaveError(e.message);
    } finally {
      setIsSaving(false);
    }
  }

  function handleToggle() {
    const next = !enabled;
    setEnabled(next);
    savePrefs(next, rules);
  }

  function handleRuleChange(id, text) {
    const updated = rules.map((r) => (r.id === id ? { ...r, text } : r));
    setRules(updated);
    rulesRef.current = updated; // keep ref in sync
  }

  function handleRuleBlur() {
    savePrefs(enabled, rulesRef.current);
  }

  function handleAddRule() {
    const newRule = { id: nanoid(), text: "" };
    const updated = [...rulesRef.current, newRule];
    setRules(updated);
    rulesRef.current = updated;
  }

  function handleDeleteRule(id) {
    const updated = rulesRef.current.filter((r) => r.id !== id);
    setRules(updated);
    rulesRef.current = updated;
    savePrefs(enabled, updated);
  }

  if (isLoadingPrefs) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-10 h-10 border-4 border-t-[#211B34] border-[#211B34]/10 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* ── Toggle Card ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className={`relative flex items-center justify-center w-16 h-16 rounded-lg transition-all duration-500 scale-100 active:scale-95 ${enabled ? "bg-[#7C3AED] text-white" : "bg-gray-50 text-gray-300"}`}>
              <Bot className={`w-8 h-8 ${enabled ? "animate-pulse" : ""}`} />
              {enabled && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-4 border-white animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#211B34] tracking-tight mb-1">
                Autopilot Mode
              </h3>
              <p className="text-sm font-bold text-[#211B34]/30 max-w-xs leading-relaxed">
                {enabled
                  ? "AI is actively optimizing your workflow in real-time."
                  : "AI is currently in suggestion mode only."}
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            onClick={handleToggle}
            disabled={isSaving}
            className={`relative w-16 h-9 rounded-full transition-all duration-300 disabled:opacity-50 focus:outline-none ${
              enabled ? "bg-[#7C3AED]" : "bg-gray-200"
            }`}
            aria-label={enabled ? "Disable autopilot" : "Enable autopilot"}
          >
            <div
              className={`absolute top-1 left-1 w-7 h-7 bg-white rounded-full transition-all duration-500 flex items-center justify-center ${
                enabled ? "translate-x-7" : "translate-x-0"
              }`}
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
              ) : (
                <Zap className={`w-3.5 h-3.5 ${enabled ? "text-[#7C3AED]" : "text-gray-300"}`} />
              )}
            </div>
          </button>
        </div>

        {saveError && (
          <div className="flex items-center gap-2 p-4 mt-6 bg-red-50 text-red-600 rounded-lg text-xs font-bold">
            <ShieldAlert className="w-4 h-4" />
            {saveError}
          </div>
        )}
      </div>

      {/* ── Rules Editor ────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-black text-[#211B34]/30 uppercase tracking-[0.2em] mb-1">
              Refinement Rules
            </h3>
            <p className="text-[#211B34] font-bold text-lg">Define AI logic</p>
          </div>
          <button
            onClick={handleAddRule}
            className="flex items-center gap-2.5 px-6 py-3 bg-[#7C3AED] text-white rounded-lg text-xs font-black transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            ADD RULE
          </button>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 rounded-xl">
            <ShieldAlert className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-[#211B34]/40">No custom rules established yet.</p>
            <p className="text-[11px] font-bold text-red-400 mt-2 uppercase tracking-widest">
              Fallback: Responding to urgent emails only
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-4 group">
                <div className="flex-1 relative">
                  <ChevronRight className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#211B34]/30" />
                  <input
                    type="text"
                    value={rule.text}
                    onChange={(e) => handleRuleChange(rule.id, e.target.value)}
                    onBlur={handleRuleBlur}
                    placeholder='e.g. "Draft formal invites for all faculty members"'
                    className="w-full bg-gray-50/50 rounded-lg pl-14 pr-6 py-4 text-sm text-[#211B34] font-bold placeholder:text-[#211B34]/20 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/10 focus:bg-white transition-all"
                  />
                </div>
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="w-12 h-12 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all group-hover:opacity-100 opacity-0 md:opacity-100"
                  aria-label="Delete rule"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 pt-6 flex gap-3">
          <Info className="w-4 h-4 text-[#211B34]/20 shrink-0 mt-0.5" />
          <p className="text-[11px] font-bold text-[#211B34]/30 leading-relaxed uppercase tracking-wider">
            Rules use natural language processing. The AI dynamically adapts its behavior based on sender identity, subject context, and email sentiment.
          </p>
        </div>
      </div>

      {/* ── Action Log ──────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-black text-[#211B34]/30 uppercase tracking-[0.2em] mb-1">
              Operations Log
            </h3>
            <div className="flex items-center gap-3">
              <p className="text-[#211B34] font-bold text-lg">System Activity</p>
              {enabled && (
                <div className="flex items-center gap-1.5 bg-[#7C3AED]/10 text-[#7C3AED] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 bg-[#7C3AED] rounded-full animate-pulse" />
                  Live Sync
                </div>
              )}
            </div>
          </div>
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-5 py-2.5 text-[#211B34]/50 hover:text-[#7C3AED] hover:bg-[#7C3AED]/5 rounded-lg transition-all text-xs font-black uppercase tracking-widest"
          >
            <RefreshCcw className="w-4 h-4" />
            REFRESH
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-12 rounded-xl">
            <RefreshCcw className="w-10 h-10 text-gray-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-[#211B34]/30 mb-1">Queue is currently empty.</p>
            <p className="text-[11px] font-bold text-[#211B34]/20 uppercase tracking-widest">
              Enable Autopilot to begin autonomous processing.
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[40rem] overflow-y-auto pr-2 custom-scrollbar">
            {logs.map((log) => (
              <LogEntry key={log._id || log.emailId} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Missing Lucide import Info for the description section
import { Info } from "lucide-react";
