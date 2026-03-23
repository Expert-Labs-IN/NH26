"use client";

import { useState, useEffect, useTransition } from "react";
import EmailList from "@/components/EmailList";
import ActionPanel from "@/components/ActionPanel";

export default function DashboardClient({ initialEmails }) {
  const [emails, setEmails] = useState(initialEmails);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isRefreshing, startRefresh] = useTransition();
  const [fastApiDown, setFastApiDown] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");
  const [maxResults, setMaxResults] = useState(20);

  // Check FastAPI health on mount
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setFastApiDown(d.fastapi !== "ok"))
      .catch(() => setFastApiDown(true));
  }, []);

  // Trigger the email processing pipeline then reload the list
  function handleRefresh() {
    startRefresh(async () => {
      setRefreshMsg("");
      try {
        const processRes = await fetch("/api/emails/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maxResults }),
        });
        const processData = await processRes.json();

        // Re-fetch the full list from DB
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
    <div className="flex flex-col h-full">
      {/* FastAPI warning banner */}
      {fastApiDown && (
        <div className="bg-yellow-500/10 border-b border-yellow-500/30 text-yellow-400 text-xs text-center py-2 px-4">
          ⚠ AI service (FastAPI) is not reachable. Email processing may be unavailable.
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* ── Left Panel: Email List ── */}
        <aside className="w-80 flex-shrink-0 border-r border-gray-800 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 gap-2">
            <h2 className="text-sm font-semibold text-white shrink-0">
              Inbox{" "}
              <span className="text-gray-500 font-normal">({emails.length})</span>
            </h2>

            {/* Fetch count dropdown */}
            <select
              value={maxResults}
              onChange={(e) => setMaxResults(Number(e.target.value))}
              disabled={isRefreshing}
              className="text-xs bg-gray-800 border border-gray-700 text-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
              title="Number of emails to fetch"
            >
              <option value={5}>5 emails</option>
              <option value={10}>10 emails</option>
              <option value={20}>20 emails</option>
              <option value={30}>30 emails</option>
              <option value={50}>50 emails</option>
            </select>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-600 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 shrink-0"
            >
              <svg
                className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              {isRefreshing ? "Refreshing…" : "Refresh"}
            </button>
          </div>

          {/* Refresh message */}
          {refreshMsg && (
            <p className="text-xs text-center text-gray-500 py-1.5 border-b border-gray-800">
              {refreshMsg}
            </p>
          )}

          {/* Email list — scrollable */}
          <div className="flex-1 overflow-y-auto">
            <EmailList
              emails={emails}
              selectedId={selectedEmail?.emailId}
              onSelect={setSelectedEmail}
            />
          </div>
        </aside>

        {/* ── Right Panel: Action Panel ── */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <ActionPanel
            email={selectedEmail}
            onUpdate={handleEmailUpdate}
          />
        </main>
      </div>
    </div>
  );
}

