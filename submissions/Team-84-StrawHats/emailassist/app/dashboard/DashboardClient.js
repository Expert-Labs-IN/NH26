"use client";

import { useState, useEffect, useTransition } from "react";
import EmailList from "@/components/EmailList";
import ActionPanel from "@/components/ActionPanel";
import { RefreshCw, AlertCircle, Zap } from "lucide-react";

export default function DashboardClient({ initialEmails }) {
  const [emails, setEmails] = useState(initialEmails);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isRefreshing, startRefresh] = useTransition();
  const [fastApiDown, setFastApiDown] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");
  const [maxResults, setMaxResults] = useState(20);
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);

  // Check FastAPI health + load autopilot pref on mount
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setFastApiDown(d.fastapi !== "ok"))
      .catch(() => setFastApiDown(true));

    fetch("/api/preferences")
      .then((r) => r.json())
      .then((d) => setAutopilotEnabled(d.autopilotEnabled ?? false))
      .catch(() => {});
  }, []);

  // Trigger the email processing pipeline, then run autopilot, then reload the list
  function handleRefresh() {
    startRefresh(async () => {
      setRefreshMsg("");
      try {
        // Step 1: Process new emails through AI
        const processRes = await fetch("/api/emails/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maxResults }),
        });
        const processData = await processRes.json();

        // Step 2: Fire autopilot (no-op if disabled — server guards this)
        fetch("/api/autopilot/run", { method: "POST" }).catch(() => {});

        // Step 3: Reload the full email list from DB
        const listRes = await fetch("/api/emails");
        const listData = await listRes.json();
        setEmails(listData.emails || []);
        setRefreshMsg(processData.message || "Done");
      } catch (err) {
        setRefreshMsg("Error: " + err.message);
      }
    });
  }

  // Called by action panel cards when they complete an action (optimistic UI update)
  function handleEmailUpdate(updatedEmail) {
    setEmails((prev) =>
      prev.map((e) => (e.emailId === updatedEmail.emailId ? updatedEmail : e))
    );
    setSelectedEmail(updatedEmail);
  }

  return (
    <div className="flex flex-col h-full bg-[#211B34]">
      {/* FastAPI warning banner */}
      {fastApiDown && (
        <div className="bg-red-500/10 text-red-200 text-xs text-center py-3 px-6 font-medium flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          AI service (FastAPI) is not reachable. Email processing may be unavailable.
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel: Email List ── */}
        <aside className="w-96 flex-shrink-0 flex flex-col pt-4">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 gap-4">
            <h2 className="text-lg font-bold text-white tracking-tight">
              Inbox{" "}
              <span className="text-white/40 font-medium text-sm ml-1">({emails.length})</span>
            </h2>

            <div className="flex items-center gap-3">
              {/* Fetch count dropdown */}
              <select
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
                disabled={isRefreshing}
                className="text-xs bg-white/5 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/40 disabled:opacity-50 cursor-pointer font-semibold transition-all"
                title="Number of emails to fetch"
              >
                {[5, 10, 20, 30, 50].map(v => (
                  <option key={v} value={v} className="bg-[#211B34]">{v}</option>
                ))}
              </select>

              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="group flex items-center gap-2 text-xs font-bold text-white bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 px-4 py-2 rounded-lg transition-all disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`}
                />
                {isRefreshing ? "Refreshing…" : "Refresh"}
              </button>
            </div>
          </div>

          {/* Autopilot active indicator */}
          {autopilotEnabled && (
            <div className="flex items-center gap-3 mx-6 mb-4 px-4 py-3 rounded-lg bg-[#7C3AED]/10">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </div>
              <span className="text-xs font-bold text-[#7C3AED] flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="w-3 h-3 fill-current" />
                Autopilot Active
              </span>
            </div>
          )}

          {/* Refresh message */}
          {refreshMsg && (
            <div className="mx-6 mb-4 px-4 py-2 rounded-lg bg-white/5 text-[11px] text-center text-white/60 font-medium">
              {refreshMsg}
            </div>
          )}

          {/* Email list — scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <EmailList
              emails={emails}
              selectedId={selectedEmail?.emailId}
              onSelect={setSelectedEmail}
            />
          </div>
        </aside>

        {/* ── Right Panel: Tabbed Action Panel ── */}
        <main className="flex-1 overflow-hidden bg-white rounded-tl-xl">
          <ActionPanel
            email={selectedEmail}
            onUpdate={handleEmailUpdate}
            autopilotEnabled={autopilotEnabled}
            onAutopilotChange={setAutopilotEnabled}
          />
        </main>
      </div>
    </div>
  );
}
