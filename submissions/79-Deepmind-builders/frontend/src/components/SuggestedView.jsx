import { useState } from "react";

export default function SuggestedView({ emails, triageCache, onNavigate }) {
  const [dismissed, setDismissed] = useState({});

  const suggestions = [
    {
      id: "rule-newsletters",
      type: "Rule Suggestion",
      icon: "⚙",
      title: "Auto-archive newsletters",
      description: "You receive newsletters regularly. Create a rule to auto-tag them as FYI and skip drafting.",
      action: "Set Rule",
      chipBg: "#e9ddff", chipColor: "#5516be",
    },
    {
      id: "batch-vip",
      type: "Workflow Suggestion",
      icon: "★",
      title: "Batch VIP responses",
      description: "You have VIP emails from Rajesh Mehta and Deepak Rao. Review and approve their draft replies together.",
      action: "View VIP Emails",
      chipBg: "#fdf0ee", chipColor: "#922b21",
    },
    {
      id: "focus-block",
      type: "Focus Suggestion",
      icon: "🧠",
      title: "Schedule a focus block",
      description: "Your agent detected 3 complex tasks requiring deep work. Block 2 hours this afternoon.",
      action: "Add to Calendar",
      chipBg: "#f2f3ff", chipColor: "#3525cd",
    },
    {
      id: "weekly-summary",
      type: "Summary Ready",
      icon: "✦",
      title: "Weekly digest ready",
      description: `Your agent has processed ${Object.keys(triageCache).length} emails. Want a one-paragraph executive summary?`,
      action: "Generate Summary",
      chipBg: "#edf7f2", chipColor: "#145c30",
    },
  ].filter(s => !dismissed[s.id]);

  const agentInsights = Object.entries(triageCache).slice(0, 3).map(([id, triage]) => {
    const email = emails.find(e => e.id === id);
    return email ? { email, triage } : null;
  }).filter(Boolean);

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", background: "#faf8ff" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 26, fontWeight: 700, color: "#131b2e", letterSpacing: "-0.4px", marginBottom: 6 }}>Suggested</h1>
        <p style={{ color: "#464555", fontSize: 13 }}>Your AI agent's proactive recommendations based on your inbox patterns.</p>
      </div>

      {/* Suggestion cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 32 }}>
        {suggestions.map(s => (
          <div key={s.id} style={{ background: "#ffffff", borderRadius: "16px", padding: "22px 24px", boxShadow: "0 0 24px rgba(19,27,46,0.06)", position: "relative" }}>
            <button onClick={() => setDismissed(d => ({ ...d, [s.id]: true }))}
              style={{ position: "absolute", top: 14, right: 14, color: "#787594", fontSize: 18, cursor: "pointer", opacity: 0.5 }}>×</button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: s.chipBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{s.icon}</div>
              <span style={{ background: s.chipBg, color: s.chipColor, borderRadius: "9999px", padding: "2px 10px", fontSize: 10, fontWeight: 700, fontFamily: "'Manrope',sans-serif", letterSpacing: "0.05em" }}>
                {s.type.toUpperCase()}
              </span>
            </div>
            <h3 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 14, color: "#131b2e", marginBottom: 6 }}>{s.title}</h3>
            <p style={{ fontSize: 12, color: "#464555", lineHeight: 1.6, marginBottom: 16 }}>{s.description}</p>
            <button onClick={() => onNavigate(s.id === "batch-vip" ? "inbox" : s.id === "rule-newsletters" ? "ai-rules" : "inbox")} style={{
              fontSize: 12, fontWeight: 700, color: s.chipColor,
              fontFamily: "'Manrope',sans-serif", cursor: "pointer",
              letterSpacing: "0.04em",
            }}>{s.action} →</button>
          </div>
        ))}

        {suggestions.length === 0 && (
          <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, color: "#131b2e", marginBottom: 6 }}>All caught up!</p>
            <p style={{ color: "#787594", fontSize: 13 }}>No suggestions right now. Your agent will surface new ones as your inbox grows.</p>
          </div>
        )}
      </div>

      {/* Agent Insights */}
      {agentInsights.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 16, color: "#131b2e", marginBottom: 14 }}>
            ✦ Agent Insights
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {agentInsights.map(({ email, triage }, i) => (
              <div key={i} style={{
                background: "#283044", borderRadius: "12px", padding: "16px 20px",
                display: "flex", alignItems: "center", gap: 14,
              }}>
                <div style={{ width: 36, height: 36, borderRadius: "9999px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                  {email.fromName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, color: "#fff", marginBottom: 2 }}>{email.fromName}</p>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>{triage.summary[0]?.slice(0, 80)}…</p>
                </div>
                <span style={{
                  background: triage.priority === "Urgent" ? "#fdf0ee" : triage.priority === "Requires Action" ? "#e9ddff" : "#edf7f2",
                  color: triage.priority === "Urgent" ? "#922b21" : triage.priority === "Requires Action" ? "#5516be" : "#145c30",
                  borderRadius: "9999px", padding: "3px 12px", fontSize: 10, fontWeight: 700,
                  fontFamily: "'Manrope',sans-serif", flexShrink: 0,
                }}>{triage.priority}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
