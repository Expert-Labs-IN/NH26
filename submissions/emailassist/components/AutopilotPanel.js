"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { nanoid } from "nanoid";

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
    return <span className="text-green-400 text-base leading-none">✓</span>;
  if (status === "skipped")
    return <span className="text-gray-500 text-base leading-none">⏭</span>;
  return <span className="text-red-400 text-base leading-none">✕</span>;
}

function ActionBadge({ label, color }) {
  const colors = {
    green: "bg-green-500/15 text-green-400 border-green-500/25",
    blue: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/25",
    gray: "bg-gray-700/50 text-gray-500 border-gray-600/50",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded border ${colors[color] || colors.gray}`}
    >
      {label}
    </span>
  );
}

function LogEntry({ log }) {
  const borderColor =
    log.status === "success"
      ? "border-green-500/40"
      : log.status === "skipped"
      ? "border-gray-700"
      : "border-red-500/40";

  const bgColor =
    log.status === "success"
      ? "bg-green-500/5"
      : log.status === "skipped"
      ? "bg-transparent"
      : "bg-red-500/5";

  return (
    <div
      className={`border-l-2 ${borderColor} ${bgColor} pl-3 pr-2 py-2.5 rounded-r-lg`}
    >
      {/* Top row — icon + sender + time */}
      <div className="flex items-center gap-2 mb-1">
        <StatusIcon status={log.status} />
        <span className="text-sm font-semibold text-white truncate flex-1">
          {log.senderName || "Unknown Sender"}
        </span>
        <span className="text-[10px] text-gray-600 shrink-0 tabular-nums">
          {timeAgo(log.processedAt)}
        </span>
      </div>

      {/* Subject */}
      <p className="text-xs text-gray-400 truncate mb-1.5 ml-5">
        {log.emailSubject || "(No Subject)"}
      </p>

      {/* Action badges */}
      {log.status === "success" && (
        <div className="flex flex-wrap gap-1 ml-5 mb-1.5">
          {log.replySent && <ActionBadge label="✉ Replied" color="green" />}
          {log.eventCreated && <ActionBadge label="📅 Event" color="blue" />}
          {log.tasksApproved && <ActionBadge label="✓ Tasks" color="purple" />}
        </div>
      )}

      {/* AI reasoning */}
      <p className="text-[11px] text-gray-500 ml-5 italic leading-relaxed">
        {log.status === "error"
          ? `Error: ${log.errorMessage}`
          : log.reasoning}
      </p>

      {/* Matched rule */}
      {log.matchedRuleText && log.status !== "error" && (
        <p className="text-[10px] text-blue-500/70 ml-5 mt-1">
          Rule: {'"'}{log.matchedRuleText}{'"'}
        </p>
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
      <div className="flex items-center justify-center h-32">
        <div className="w-5 h-5 border-t-2 border-blue-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Toggle Card ─────────────────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <span className="text-base">🤖</span>
              {enabled && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">
                Autopilot Mode
              </h3>
              <p className="text-[11px] text-gray-500">
                {enabled
                  ? "AI is acting on emails automatically"
                  : "AI will only suggest — you take action"}
              </p>
            </div>
          </div>

          {/* Toggle switch */}
          <button
            onClick={handleToggle}
            disabled={isSaving}
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 disabled:opacity-60 focus:outline-none ${
              enabled ? "bg-blue-600" : "bg-gray-700"
            }`}
            aria-label={enabled ? "Disable autopilot" : "Enable autopilot"}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {saveError && (
          <p className="text-red-400 text-xs mt-3">{saveError}</p>
        )}
      </div>

      {/* ── Rules Editor ────────────────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Your Rules
          </h3>
          <button
            onClick={handleAddRule}
            className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Rule
          </button>
        </div>

        {rules.length === 0 ? (
          <div className="text-center py-5">
            <p className="text-xs text-gray-500 mb-1">No rules yet.</p>
            <p className="text-[11px] text-gray-600">
              Without rules, autopilot only replies to{" "}
              <span className="text-red-400">urgent</span> emails.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {rules.map((rule) => (
              <li key={rule.id} className="flex items-center gap-2">
                <span className="text-gray-600 text-xs shrink-0">→</span>
                <input
                  type="text"
                  value={rule.text}
                  onChange={(e) => handleRuleChange(rule.id, e.target.value)}
                  onBlur={handleRuleBlur}
                  placeholder='e.g. "Reply to my professor formally"'
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={() => handleDeleteRule(rule.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors shrink-0 p-1"
                  aria-label="Delete rule"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-[10px] text-gray-600 leading-relaxed">
            Rules use natural language. The AI matches them against sender, subject, and content.
            Changes save automatically when you leave an input.
          </p>
        </div>
      </div>

      {/* ── Action Log ──────────────────────────────────────────────────── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Action Log
          </h3>
          <div className="flex items-center gap-2">
            {enabled && (
              <span className="flex items-center gap-1 text-[10px] text-green-400">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                Live
              </span>
            )}
            <button
              onClick={fetchLogs}
              className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-gray-500 mb-1">No actions taken yet.</p>
            <p className="text-[11px] text-gray-600">
              Enable Autopilot and click Refresh on the inbox.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {logs.map((log) => (
              <LogEntry key={log._id || log.emailId} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
