import { useState } from "react";

const DEFAULT_RULES = [
  { id: 1, active: true, trigger: "From VIP sender", action: "Flag as Urgent + Draft reply immediately", icon: "★" },
  { id: 2, active: true, trigger: "Contains meeting details (date/time)", action: "Extract as Calendar Event", icon: "📅" },
  { id: 3, active: true, trigger: "Contains numbered list or 'action required'", action: "Extract as Task List", icon: "✓" },
  { id: 4, active: false, trigger: "Newsletter or promotional email", action: "Auto-tag as FYI, skip drafting", icon: "✉" },
  { id: 5, active: false, trigger: "Subject contains 'URGENT' or 'deadline'", action: "Bump to top of inbox + notify", icon: "⚠" },
];

export default function AIRulesView() {
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [showAdd, setShowAdd] = useState(false);
  const [newTrigger, setNewTrigger] = useState("");
  const [newAction, setNewAction] = useState("");

  const toggle = (id) => setRules(r => r.map(rule => rule.id === id ? { ...rule, active: !rule.active } : rule));
  const remove = (id) => setRules(r => r.filter(rule => rule.id !== id));
  const addRule = () => {
    if (!newTrigger || !newAction) return;
    setRules(r => [...r, { id: Date.now(), active: true, trigger: newTrigger, action: newAction, icon: "✦" }]);
    setNewTrigger(""); setNewAction(""); setShowAdd(false);
  };

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", background: "#faf8ff" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 26, fontWeight: 700, color: "#131b2e", letterSpacing: "-0.4px", marginBottom: 6 }}>AI Rules</h1>
          <p style={{ color: "#464555", fontSize: 13 }}>
            Configure how your agent automatically triages and acts on incoming emails.
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{
          padding: "9px 20px", borderRadius: "9999px",
          background: "linear-gradient(135deg, #3525cd, #4f46e5)",
          color: "#fff", fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
          boxShadow: "0 4px 12px rgba(77,68,227,0.2)",
        }}>+ Add Rule</button>
      </div>

      {/* Add rule form */}
      {showAdd && (
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "22px 26px", marginBottom: 16, boxShadow: "0 0 24px rgba(19,27,46,0.08)", border: "2px solid rgba(53,37,205,0.15)" }}>
          <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 14, color: "#131b2e", marginBottom: 14 }}>New Rule</p>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#787594", letterSpacing: "0.06em", display: "block", marginBottom: 5, fontFamily: "'Manrope',sans-serif" }}>WHEN (trigger)</label>
            <input value={newTrigger} onChange={e => setNewTrigger(e.target.value)}
              placeholder="e.g. Email from my manager"
              style={{ width: "100%", background: "#f2f3ff", border: "none", borderRadius: "8px", padding: "9px 14px", fontSize: 13, color: "#131b2e", outline: "none" }}
              onFocus={e => e.target.style.boxShadow = "0 0 0 2px rgba(53,37,205,0.35)"}
              onBlur={e => e.target.style.boxShadow = "none"}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#787594", letterSpacing: "0.06em", display: "block", marginBottom: 5, fontFamily: "'Manrope',sans-serif" }}>THEN (action)</label>
            <input value={newAction} onChange={e => setNewAction(e.target.value)}
              placeholder="e.g. Flag as urgent and draft a reply"
              style={{ width: "100%", background: "#f2f3ff", border: "none", borderRadius: "8px", padding: "9px 14px", fontSize: 13, color: "#131b2e", outline: "none" }}
              onFocus={e => e.target.style.boxShadow = "0 0 0 2px rgba(53,37,205,0.35)"}
              onBlur={e => e.target.style.boxShadow = "none"}
            />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={addRule} style={{ padding: "8px 20px", borderRadius: "9999px", background: "linear-gradient(135deg, #3525cd, #4f46e5)", color: "#fff", fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Save Rule</button>
            <button onClick={() => setShowAdd(false)} style={{ padding: "8px 18px", borderRadius: "9999px", background: "#f2f3ff", color: "#787594", fontFamily: "'Manrope',sans-serif", fontSize: 13, cursor: "pointer" }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rules.map(rule => (
          <div key={rule.id} style={{
            background: "#ffffff", borderRadius: "16px", padding: "18px 24px",
            boxShadow: "0 0 24px rgba(19,27,46,0.06)",
            display: "flex", alignItems: "center", gap: 16,
            opacity: rule.active ? 1 : 0.5, transition: "opacity 0.2s",
          }}>
            <div style={{ width: 40, height: 40, borderRadius: "12px", background: rule.active ? "#e9ddff" : "#f2f3ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {rule.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#787594", letterSpacing: "0.06em", fontFamily: "'Manrope',sans-serif" }}>WHEN</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#131b2e", fontFamily: "'Manrope',sans-serif" }}>{rule.trigger}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#3525cd", letterSpacing: "0.06em", fontFamily: "'Manrope',sans-serif" }}>THEN</span>
                <span style={{ fontSize: 13, color: "#464555" }}>{rule.action}</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
              {/* Toggle */}
              <div onClick={() => toggle(rule.id)} style={{
                width: 44, height: 24, borderRadius: "9999px", cursor: "pointer",
                background: rule.active ? "linear-gradient(135deg, #3525cd, #4f46e5)" : "#e0e0ee",
                position: "relative", transition: "background 0.2s",
              }}>
                <div style={{
                  position: "absolute", top: 3, left: rule.active ? 23 : 3,
                  width: 18, height: 18, borderRadius: "50%", background: "#fff",
                  transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                }} />
              </div>
              <button onClick={() => remove(rule.id)} style={{ color: "#c0392b", fontSize: 16, cursor: "pointer", padding: "2px 6px", opacity: 0.6 }}>×</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
