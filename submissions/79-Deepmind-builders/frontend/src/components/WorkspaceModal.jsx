export default function WorkspaceModal({ emails, triageCache, onClose }) {
  const analyzed = Object.keys(triageCache).length;
  const urgent = Object.values(triageCache).filter(t => t.priority === "Urgent").length;
  const action = Object.values(triageCache).filter(t => t.priority === "Requires Action").length;
  const drafts = Object.values(triageCache).filter(t => t.actionType === "draft_reply").length;
  const tasks = Object.values(triageCache).filter(t => t.actionType === "task_list").length;
  const cal = Object.values(triageCache).filter(t => t.actionType === "calendar_event").length;
  const health = emails.length ? Math.round((analyzed / emails.length) * 100) : 0;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(19,27,46,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 480, background: "#fff", borderRadius: "24px", boxShadow: "0 24px 64px rgba(19,27,46,0.2)", overflow: "hidden" }}>

        {/* Hero */}
        <div style={{ background: "linear-gradient(135deg, #3525cd, #4f46e5)", padding: "32px 32px 28px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", bottom: -30, right: 40, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: "14px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#fff" }}>✦</div>
            <div>
              <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", letterSpacing: "-0.4px" }}>The Workspace</p>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#4ade80" }} />
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: 600, letterSpacing: "0.04em" }}>AI AGENT ACTIVE</p>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>
            Your intelligent email workspace. The agent has processed{" "}
            <strong style={{ color: "#fff" }}>{analyzed} of {emails.length}</strong> signals
            {urgent > 0 && <>, flagging <strong style={{ color: "#fca5a5" }}>{urgent} urgent item{urgent !== 1 ? "s" : ""}</strong></>}.
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ padding: "24px 32px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            ["✉", "Emails", emails.length, "#f2f3ff", "#3525cd"],
            ["⚡", "Urgent", urgent, "#fdf0ee", "#922b21"],
            ["◉", "Action", action, "#fef6ec", "#7d4207"],
            ["✏", "Drafts", drafts, "#e9ddff", "#5516be"],
            ["✓", "Tasks", tasks, "#edf7f2", "#145c30"],
            ["📅", "Events", cal, "#f2f3ff", "#3525cd"],
          ].map(([icon, label, val, bg, color]) => (
            <div key={label} style={{ background: bg, borderRadius: "12px", padding: "14px", textAlign: "center" }}>
              <p style={{ fontSize: 18, marginBottom: 4 }}>{icon}</p>
              <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 22, color }}>{val}</p>
              <p style={{ fontSize: 11, color, fontWeight: 600, letterSpacing: "0.04em" }}>{label.toUpperCase()}</p>
            </div>
          ))}
        </div>

        {/* Health bar */}
        <div style={{ padding: "0 32px 24px" }}>
          <div style={{ background: "#f2f3ff", borderRadius: "12px", padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#464555", fontFamily: "'Manrope',sans-serif" }}>Inbox Health Score</span>
              <span style={{ fontSize: 12, fontWeight: 800, color: "#3525cd", fontFamily: "'Manrope',sans-serif" }}>{health}%</span>
            </div>
            <div style={{ height: 6, background: "#e0e0ee", borderRadius: "9999px" }}>
              <div style={{ height: "100%", background: "linear-gradient(90deg, #3525cd, #4f46e5)", borderRadius: "9999px", width: `${health}%`, transition: "width 0.6s ease" }} />
            </div>
            <p style={{ fontSize: 11, color: "#787594", marginTop: 8 }}>
              {health === 100 ? "All signals processed — inbox fully curated!" : health > 50 ? "Good progress — keep going!" : "Start analysing to improve your score"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "0 32px 24px", display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: "9999px", background: "linear-gradient(135deg, #3525cd, #4f46e5)", color: "#fff", fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer", border: "none", boxShadow: "0 4px 14px rgba(77,68,227,0.25)" }}>
            Back to Workspace
          </button>
          <button onClick={onClose} style={{ padding: "10px 20px", borderRadius: "9999px", background: "#f2f3ff", color: "#3525cd", fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", border: "none" }}>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
