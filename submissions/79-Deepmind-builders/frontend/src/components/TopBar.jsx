import { useState, useRef, useEffect } from "react";

export default function TopBar({ activeView, emails = [], triageCache = {}, onNavigate, onSearch }) {
  const [focusMode, setFocusMode] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showAgent, setShowAgent] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [readNotifs, setReadNotifs] = useState({});
  const [query, setQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const urgent = Object.values(triageCache).filter(t => t.priority === "Urgent").length;
  const analyzed = Object.keys(triageCache).length;

  const notifs = [
    { id: 1, text: "Rajesh Mehta flagged Urgent — contract deadline Friday", time: "2m ago", dot: "#c0392b" },
    { id: 2, text: "Calendar event extracted from Calendly invite", time: "8m ago", dot: "#3525cd" },
    { id: 3, text: "3 tasks auto-generated from HR self-assessment email", time: "17m ago", dot: "#5516be" },
    { id: 4, text: "Deepak Rao (CFO) marked VIP Urgent — budget sign-off needed", time: "21m ago", dot: "#c0392b" },
  ].map(n => ({ ...n, read: !!readNotifs[n.id] }));

  const unreadCount = notifs.filter(n => !n.read).length;

  const agentLog = [
    { action: "Classified emails", detail: `Urgent: ${urgent} · Analyzed: ${analyzed}`, time: "Just now", icon: "⚡" },
    { action: "Draft reply generated", detail: "To: Rajesh Mehta re: contract renewal", time: "2m ago", icon: "✏" },
    { action: "Calendar event extracted", detail: "Q2 Product Roadmap Sync — Mar 25, 3PM", time: "8m ago", icon: "📅" },
    { action: "Task list created", detail: "5 items from HR self-assessment email", time: "17m ago", icon: "✓" },
  ];

  const teamMembers = [
    { name: "Priya S.", role: "Product", status: "online", avatar: "P" },
    { name: "Deepak R.", role: "Finance", status: "busy", avatar: "D" },
    { name: "Ananya I.", role: "Engineering", status: "offline", avatar: "A" },
    { name: "Vikram N.", role: "Partnerships", status: "online", avatar: "V" },
  ];
  const statusColor = { online: "#1a6e3c", busy: "#b7600a", offline: "#c0c0d0" };

  // Search results
  const q = query.toLowerCase().trim();
  const results = q.length < 2 ? [] : (() => {
    const hits = [];
    emails.forEach(email => {
      const triage = triageCache[email.id];
      const matchEmail = email.fromName.toLowerCase().includes(q) || email.subject.toLowerCase().includes(q) || email.body.toLowerCase().includes(q);
      const matchSummary = triage?.summary?.some(s => s.toLowerCase().includes(q));
      const matchTask = triage?.actionType === "task_list" && triage?.action?.tasks?.some(t => t.toLowerCase().includes(q));

      if (matchTask) {
        triage.action.tasks.filter(t => t.toLowerCase().includes(q)).forEach(task => {
          hits.push({ type: "task", label: task, sub: `from ${email.fromName}`, email, view: "tasks" });
        });
      }
      if (triage?.actionType === "draft_reply" && matchSummary) {
        hits.push({ type: "draft", label: `Draft: Re: ${email.subject}`, sub: `to ${email.from}`, email, view: "drafts" });
      }
      if (matchEmail) {
        hits.push({ type: "email", label: email.subject, sub: `from ${email.fromName}`, email, view: "inbox" });
      }
    });
    return hits.slice(0, 8);
  })();

  const typeIcon = { email: "✉", draft: "✏", task: "✓" };
  const typeColor = { email: "#3525cd", draft: "#5516be", task: "#145c30" };
  const typeBg = { email: "#f2f3ff", draft: "#e9ddff", task: "#edf7f2" };

  const handleSelect = (result) => {
    setQuery("");
    setShowResults(false);
    onNavigate?.(result.view);
  };

  useEffect(() => {
    setShowResults(q.length >= 2);
  }, [q]);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const closeAll = () => { setShowNotifs(false); setShowAgent(false); setShowTeam(false); };

  return (
    <div style={{ position: "relative", zIndex: 50 }}>
      {focusMode && (
        <div style={{ background: "linear-gradient(135deg, #3525cd, #4f46e5)", padding: "7px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontFamily: "'Manrope',sans-serif", fontWeight: 600 }}>
            ⚡ Focus Mode active — non-urgent notifications paused
          </span>
          <button onClick={() => setFocusMode(false)} style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, cursor: "pointer", fontFamily: "'Manrope',sans-serif", background: "none", border: "none" }}>
            Exit Focus Mode ×
          </button>
        </div>
      )}

      <div style={{ height: 52, flexShrink: 0, background: "#ffffff", display: "flex", alignItems: "center", padding: "0 24px", gap: 16, borderBottom: "1px solid #f2f3ff" }}>
        <span style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 17, color: "#131b2e", letterSpacing: "-0.3px", whiteSpace: "nowrap", flexShrink: 0 }}>
          Curator AI
        </span>

        {/* Search */}
        <div ref={searchRef} style={{ flex: 1, maxWidth: 460, minWidth: 0, position: "relative" }}>
          <div style={{ background: "#f2f3ff", borderRadius: "9999px", display: "flex", alignItems: "center", gap: 8, padding: "7px 16px" }}>
            <span style={{ color: "#787594", fontSize: 14, flexShrink: 0 }}>⌕</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onFocus={() => q.length >= 2 && setShowResults(true)}
              placeholder={`Search emails, tasks, drafts…`}
              style={{ border: "none", background: "none", outline: "none", fontSize: 13, color: "#131b2e", width: "100%", minWidth: 0 }}
            />
            {query && (
              <button onClick={() => { setQuery(""); setShowResults(false); }} style={{ color: "#c0c0d0", fontSize: 16, cursor: "pointer", flexShrink: 0, background: "none", border: "none" }}>×</button>
            )}
          </div>

          {/* Results dropdown */}
          {showResults && (
            <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "#fff", borderRadius: "14px", boxShadow: "0 8px 32px rgba(19,27,46,0.14)", zIndex: 400, overflow: "hidden" }}>
              {results.length === 0 ? (
                <div style={{ padding: "20px 18px", textAlign: "center" }}>
                  <p style={{ fontSize: 13, color: "#787594" }}>No results for "<strong style={{ color: "#131b2e" }}>{query}</strong>"</p>
                </div>
              ) : (
                <>
                  <div style={{ padding: "10px 16px 6px" }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#787594", letterSpacing: "0.06em", fontFamily: "'Manrope',sans-serif" }}>
                      {results.length} RESULT{results.length !== 1 ? "S" : ""} FOR "{query.toUpperCase()}"
                    </p>
                  </div>
                  {results.map((r, i) => (
                    <div key={i} onClick={() => handleSelect(r)} style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", borderTop: "1px solid #f2f3ff", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#faf8ff"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <div style={{ width: 28, height: 28, borderRadius: "8px", background: typeBg[r.type], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: typeColor[r.type], flexShrink: 0 }}>
                        {typeIcon[r.type]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#131b2e", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {r.label.split(new RegExp(`(${query})`, "gi")).map((part, j) =>
                            part.toLowerCase() === q
                              ? <mark key={j} style={{ background: "#e9ddff", color: "#3525cd", borderRadius: "3px", padding: "0 2px" }}>{part}</mark>
                              : part
                          )}
                        </p>
                        <p style={{ fontSize: 11, color: "#787594", marginTop: 1 }}>{r.sub}</p>
                      </div>
                      <span style={{ fontSize: 11, color: typeColor[r.type], background: typeBg[r.type], borderRadius: "9999px", padding: "2px 8px", fontWeight: 600, flexShrink: 0, fontFamily: "'Manrope',sans-serif" }}>
                        {r.type}
                      </span>
                    </div>
                  ))}
                  <div style={{ padding: "8px 16px", borderTop: "1px solid #f2f3ff", background: "#faf8ff" }}>
                    <p style={{ fontSize: 11, color: "#787594" }}>Click a result to navigate directly</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto", flexShrink: 0 }}>
          <button onClick={() => { setFocusMode(f => !f); closeAll(); }} style={{ padding: "6px 14px", borderRadius: "9999px", background: focusMode ? "linear-gradient(135deg, #3525cd, #4f46e5)" : "#f2f3ff", color: focusMode ? "#fff" : "#3525cd", fontSize: 12, fontWeight: 700, fontFamily: "'Manrope',sans-serif", cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", border: "none" }}>FOCUS MODE</button>

          <button onClick={() => { setShowTeam(t => !t); setShowNotifs(false); setShowAgent(false); }} style={{ fontSize: 12, fontWeight: 600, color: showTeam ? "#3525cd" : "#787594", padding: "6px 12px", cursor: "pointer", fontFamily: "'Manrope',sans-serif", whiteSpace: "nowrap", borderRadius: "9999px", background: showTeam ? "#f2f3ff" : "transparent", transition: "all 0.15s", border: "none" }}>TEAM SYNC</button>

          <div style={{ position: "relative" }}>
            <button onClick={() => { setShowNotifs(n => !n); setShowAgent(false); setShowTeam(false); }} style={{ width: 34, height: 34, borderRadius: "9999px", background: showNotifs ? "#f2f3ff" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, cursor: "pointer", position: "relative", border: "none", transition: "background 0.15s" }}>
              🔔
              {unreadCount > 0 && <span style={{ position: "absolute", top: 4, right: 4, width: 9, height: 9, borderRadius: "50%", background: "#3525cd", border: "2px solid #fff" }} />}
            </button>
          </div>

          <button style={{ width: 34, height: 34, borderRadius: "9999px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#787594", cursor: "pointer", border: "none" }}>⊟</button>

          <button onClick={() => { setShowAgent(a => !a); setShowNotifs(false); setShowTeam(false); }} style={{ padding: "7px 16px", borderRadius: "9999px", background: showAgent ? "#283044" : "linear-gradient(135deg, #3525cd, #4f46e5)", color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "'Manrope',sans-serif", cursor: "pointer", letterSpacing: "0.03em", whiteSpace: "nowrap", boxShadow: "0 4px 14px rgba(77,68,227,0.25)", transition: "all 0.2s", border: "none" }}>AGENT ACTIVITY</button>
        </div>
      </div>

      {/* Notifications */}
      {showNotifs && (
        <div style={{ position: "absolute", top: focusMode ? 88 : 54, right: 120, width: 320, background: "#fff", borderRadius: "14px", boxShadow: "0 8px 32px rgba(19,27,46,0.14)", zIndex: 200, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px 10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13, color: "#131b2e" }}>
              Notifications {unreadCount > 0 && <span style={{ background: "#3525cd", color: "#fff", borderRadius: "9999px", padding: "1px 7px", fontSize: 10, marginLeft: 6 }}>{unreadCount}</span>}
            </p>
            <button onClick={() => setReadNotifs(Object.fromEntries(notifs.map(n => [n.id, true])))} style={{ fontSize: 11, color: "#3525cd", fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope',sans-serif", background: "none", border: "none" }}>Mark all read</button>
          </div>
          {notifs.map(n => (
            <div key={n.id} onClick={() => setReadNotifs(p => ({ ...p, [n.id]: true }))} style={{ padding: "12px 18px", borderTop: "1px solid #f2f3ff", display: "flex", gap: 12, alignItems: "flex-start", background: n.read ? "#fff" : "#faf8ff", cursor: "pointer" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.read ? "#c0c0d0" : n.dot, flexShrink: 0, marginTop: 5 }} />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, color: "#131b2e", fontWeight: n.read ? 400 : 600, lineHeight: 1.5 }}>{n.text}</p>
                <p style={{ fontSize: 11, color: "#787594", marginTop: 3 }}>{n.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Sync */}
      {showTeam && (
        <div style={{ position: "absolute", top: focusMode ? 88 : 54, right: 220, width: 280, background: "#fff", borderRadius: "14px", boxShadow: "0 8px 32px rgba(19,27,46,0.14)", zIndex: 200, overflow: "hidden" }}>
          <div style={{ padding: "14px 18px 10px" }}>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13, color: "#131b2e", marginBottom: 2 }}>Team Sync</p>
            <p style={{ fontSize: 11, color: "#787594" }}>{teamMembers.filter(m => m.status === "online").length} members online</p>
          </div>
          {teamMembers.map(m => (
            <div key={m.name} style={{ padding: "10px 18px", borderTop: "1px solid #f2f3ff", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #3525cd, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff", fontWeight: 700, flexShrink: 0, position: "relative" }}>
                {m.avatar}
                <div style={{ position: "absolute", bottom: 0, right: 0, width: 9, height: 9, borderRadius: "50%", background: statusColor[m.status], border: "2px solid #fff" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#131b2e", fontFamily: "'Manrope',sans-serif" }}>{m.name}</p>
                <p style={{ fontSize: 11, color: "#787594" }}>{m.role}</p>
              </div>
              <span style={{ fontSize: 11, color: statusColor[m.status], fontWeight: 600, textTransform: "capitalize" }}>{m.status}</span>
            </div>
          ))}
          <div style={{ padding: "12px 18px", borderTop: "1px solid #f2f3ff" }}>
            <button style={{ width: "100%", padding: "8px", borderRadius: "9999px", background: "#f2f3ff", color: "#3525cd", fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", border: "none" }}>Start Team Sync →</button>
          </div>
        </div>
      )}

      {/* Agent Activity */}
      {showAgent && (
        <div style={{ position: "absolute", top: focusMode ? 88 : 54, right: 16, width: 340, background: "#283044", borderRadius: "14px", boxShadow: "0 8px 32px rgba(19,27,46,0.2)", zIndex: 200, overflow: "hidden" }}>
          <div style={{ padding: "16px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a6e3c" }} />
              <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>Agent Activity</p>
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Live agent log · {analyzed}/{emails.length} emails processed</p>
            <div style={{ height: 3, background: "rgba(255,255,255,0.1)", borderRadius: "9999px", marginTop: 10 }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg, #4f46e5, #7c6af7)", borderRadius: "9999px", width: `${emails.length ? (analyzed / emails.length) * 100 : 0}%`, transition: "width 0.4s" }} />
            </div>
          </div>
          {agentLog.map((log, i) => (
            <div key={i} style={{ padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <div style={{ width: 28, height: 28, borderRadius: "8px", background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{log.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: "#fff", fontFamily: "'Manrope',sans-serif", marginBottom: 2 }}>{log.action}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>{log.detail}</p>
              </div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap", marginTop: 2 }}>{log.time}</span>
            </div>
          ))}
          <div style={{ padding: "12px 18px" }}>
            <div style={{ display: "flex", gap: 8 }}>
              {[["⚡", `${urgent} urgent`], ["✓", `${analyzed} done`], ["⏳", `${emails.length - analyzed} pending`]].map(([icon, label]) => (
                <div key={label} style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: "8px", padding: "8px", textAlign: "center" }}>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 2 }}>{icon}</p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", fontFamily: "'Manrope',sans-serif" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(showNotifs || showAgent || showTeam) && (
        <div onClick={closeAll} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
      )}
    </div>
  );
}
