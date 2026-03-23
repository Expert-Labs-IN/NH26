export default function Dashboard({ emails, triageCache, onNavigate, onTriageAll }) {
  const nonSpamEmails = emails.filter(e => !e.isSpam);
  const urgent = Object.values(triageCache).filter(t => t.priority === "Urgent").length;
  const action = Object.values(triageCache).filter(t => t.priority === "Requires Action").length;
  const drafts = Object.values(triageCache).filter(t => t.actionType === "draft_reply");
  const calendars = Object.values(triageCache).filter(t => t.actionType === "calendar_event");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const analyzed = Object.keys(triageCache).length;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px", background: "#faf8ff" }}>

      {/* Hero greeting */}
      <div style={{ marginBottom: 36, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{
            fontFamily: "'Manrope',sans-serif", fontSize: 32, fontWeight: 700,
            color: "#131b2e", letterSpacing: "-0.5px", marginBottom: 8,
          }}>{greeting}, Director.</h1>
          <p style={{ color: "#464555", fontSize: 14 }}>
            {analyzed > 0
              ? `Your agent has analyzed ${analyzed} signal${analyzed !== 1 ? "s" : ""} since your last check-in.`
              : `${emails.length} new signals waiting for your agent. Click "Process All" to begin.`}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
          <button onClick={() => onNavigate("inbox")} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 18px", borderRadius: "12px",
            background: "#f2f3ff", color: "#3525cd",
            fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>
            <span>✦</span> Draft Weekly Summary
          </button>
          <button onClick={onTriageAll} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 20px", borderRadius: "12px",
            background: "linear-gradient(135deg, #3525cd, #4f46e5)",
            color: "#fff", fontFamily: "'Manrope',sans-serif",
            fontWeight: 700, fontSize: 13, cursor: "pointer",
            boxShadow: "0 4px 16px rgba(77,68,227,0.3)",
          }}>
            Process All Suggestions
          </button>
        </div>
      </div>

      {/* Ready for Approval */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 16 }}>🛡</span>
            <h2 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 17, fontWeight: 700, color: "#131b2e" }}>
              Ready for Your Approval
            </h2>
          </div>
          {urgent + action > 0 && (
            <span style={{
              background: "#e9ddff", color: "#5516be",
              borderRadius: "9999px", padding: "3px 12px",
              fontSize: 11, fontWeight: 700, fontFamily: "'Manrope',sans-serif",
              letterSpacing: "0.05em",
            }}>{urgent + action} HIGH IMPACT ITEMS</span>
          )}
        </div>

        {analyzed === 0 ? (
          <div style={{
            background: "#ffffff", borderRadius: "16px",
            padding: "32px", textAlign: "center",
            boxShadow: "0 0 24px rgba(19,27,46,0.06)",
          }}>
            <p style={{ color: "#787594", fontSize: 13, marginBottom: 16 }}>
              No signals analysed yet. Hit "Process All Suggestions" to let your agent get to work.
            </p>
            <button onClick={onTriageAll} style={{
              padding: "9px 22px", borderRadius: "9999px",
              background: "linear-gradient(135deg, #3525cd, #4f46e5)",
              color: "#fff", fontFamily: "'Manrope',sans-serif",
              fontWeight: 600, fontSize: 13, cursor: "pointer",
            }}>✦ Analyse Now</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {drafts.slice(0, 1).map((triage, i) => {
              const email = emails.find(e => triageCache[e.id] === triage);
              if (!email) return null;
              return (
                <div key={i} style={{
                  background: "#ffffff", borderRadius: "16px",
                  padding: "22px 24px", boxShadow: "0 0 24px rgba(19,27,46,0.06)",
                }}>
                  <span style={{
                    background: "#e9ddff", color: "#5516be",
                    borderRadius: "9999px", padding: "3px 12px",
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                    fontFamily: "'Manrope',sans-serif",
                  }}>✦ DRAFT READY</span>
                  <h3 style={{
                    fontFamily: "'Manrope',sans-serif", fontWeight: 700,
                    fontSize: 15, color: "#131b2e", margin: "12px 0 8px",
                  }}>Reply to {email.fromName}</h3>
                  <p style={{ color: "#464555", fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>
                    {triage.summary[0]?.slice(0, 90)}...
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => onNavigate("inbox")} style={{
                      flex: 1, padding: "8px", borderRadius: "8px",
                      background: "linear-gradient(135deg, #3525cd, #4f46e5)",
                      color: "#fff", fontFamily: "'Manrope',sans-serif",
                      fontWeight: 600, fontSize: 13, cursor: "pointer",
                    }}>Approve & Send</button>
                    <button onClick={() => onNavigate("inbox")} style={{
                      padding: "8px 16px", borderRadius: "8px",
                      background: "#f2f3ff", color: "#3525cd",
                      fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
                    }}>Edit</button>
                  </div>
                </div>
              );
            })}

            {calendars.slice(0, 1).map((triage, i) => {
              const email = emails.find(e => triageCache[e.id] === triage);
              if (!email) return null;
              return (
                <div key={i} style={{
                  background: "#ffffff", borderRadius: "16px",
                  padding: "22px 24px", boxShadow: "0 0 24px rgba(19,27,46,0.06)",
                }}>
                  <span style={{
                    background: "#f2f3ff", color: "#3525cd",
                    borderRadius: "9999px", padding: "3px 12px",
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                    fontFamily: "'Manrope',sans-serif",
                  }}>📅 CALENDAR MATCH</span>
                  <h3 style={{
                    fontFamily: "'Manrope',sans-serif", fontWeight: 700,
                    fontSize: 15, color: "#131b2e", margin: "12px 0 8px",
                  }}>{triage.action?.title || email.subject}</h3>
                  <p style={{ color: "#464555", fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>
                    {triage.action?.date} at {triage.action?.startTime}
                    {triage.action?.location ? ` · ${triage.action.location}` : ""}
                  </p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => onNavigate("inbox")} style={{
                      flex: 1, padding: "8px", borderRadius: "8px",
                      background: "linear-gradient(135deg, #3525cd, #4f46e5)",
                      color: "#fff", fontFamily: "'Manrope',sans-serif",
                      fontWeight: 600, fontSize: 13, cursor: "pointer",
                    }}>Confirm</button>
                    <button onClick={() => onNavigate("inbox")} style={{
                      padding: "8px 16px", borderRadius: "8px",
                      background: "#f2f3ff", color: "#3525cd",
                      fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
                    }}>Reschedule</button>
                  </div>
                </div>
              );
            })}

            {/* Urgent action banner */}
            {urgent > 0 && (
              <div style={{
                gridColumn: "1 / -1",
                background: "#283044", borderRadius: "16px",
                padding: "20px 24px",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 20 }}>⚠</span>
                  <div>
                    <p style={{ color: "#ffffff", fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 14 }}>
                      {urgent} Urgent Item{urgent !== 1 ? "s" : ""} Require Immediate Action
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>
                      Your agent has flagged high-priority signals requiring human sign-off.
                    </p>
                  </div>
                </div>
                <button onClick={() => onNavigate("inbox")} style={{
                  padding: "9px 20px", borderRadius: "9999px",
                  background: "#ffffff", color: "#3525cd",
                  fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  whiteSpace: "nowrap",
                }}>View {urgent} Task{urgent !== 1 ? "s" : ""}</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Today's Priorities */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "22px 24px", boxShadow: "0 0 24px rgba(19,27,46,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>⚡</span>
            <h3 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 15, color: "#131b2e" }}>Today's Priorities</h3>
          </div>
          {Object.entries(triageCache).slice(0, 3).map(([emailId, triage], i) => {
            const email = emails.find(e => e.id === emailId);
            if (!email) return null;
            const labels = { Urgent: { bg: "#fdf0ee", color: "#922b21", label: "CRITICAL" }, "Requires Action": { bg: "#e9ddff", color: "#5516be", label: "DRAFT READY" }, FYI: { bg: "#edf7f2", color: "#145c30", label: "INFORMATIONAL" } };
            const s = labels[triage.priority] || labels.FYI;
            return (
              <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < 2 ? "1px solid #f2f3ff" : "none" }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: s.color, letterSpacing: "0.06em", fontFamily: "'Manrope',sans-serif" }}>{s.label}</span>
                <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, color: "#131b2e", margin: "3px 0 2px" }}>{email.fromName}</p>
                <p style={{ fontSize: 12, color: "#787594" }}>{triage.summary[0]?.slice(0, 55)}...</p>
              </div>
            );
          })}
          {Object.keys(triageCache).length === 0 && (
            <p style={{ color: "#787594", fontSize: 12 }}>Run analysis to see priorities.</p>
          )}
        </div>

        {/* Sentiment & Velocity */}
        <div style={{ background: "linear-gradient(135deg, #3525cd, #4f46e5)", borderRadius: "16px", padding: "22px 24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🧠</div>
            <h3 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>Sentiment & Velocity</h3>
          </div>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
            {analyzed > 0
              ? `${analyzed} signals processed. ${urgent > 0 ? `${urgent} urgent item${urgent !== 1 ? "s" : ""} flagged.` : "No critical issues detected."} Communication health looks strong.`
              : "Process your inbox to unlock velocity insights."}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            {[
              [analyzed || "—", "SIGNALS CUT"],
              [urgent, "URGENT"],
              [action, "ACTION"],
              [emails.length - analyzed, "PENDING"],
            ].map(([val, label], i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 22, color: "#fff" }}>{val}</p>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", letterSpacing: "0.06em", fontWeight: 600 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
