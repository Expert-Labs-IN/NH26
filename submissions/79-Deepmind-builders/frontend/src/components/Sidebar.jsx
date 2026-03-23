import { useState } from "react";

function ToggleSwitch({ defaultOn }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div onClick={() => setOn(o => !o)} style={{
      width: 36, height: 20, borderRadius: "9999px",
      background: on ? "linear-gradient(135deg, #3525cd, #4f46e5)" : "#e0e0ee",
      position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
    }}>
      <div style={{
        position: "absolute", top: 3, left: on ? 18 : 3,
        width: 14, height: 14, borderRadius: "50%",
        background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }} />
    </div>
  );
}

export default function Sidebar({ activeView, onNavigate, onWorkspace }) {
  const [openPanel, setOpenPanel] = useState(null);

  const navItems = [
    { id: "dashboard", icon: "⊞", label: "Dashboard" },
    { id: "inbox", icon: "✉", label: "Inbox" },
    { id: "drafts", icon: "✏", label: "Drafts" },
    { id: "tasks", icon: "✓", label: "Tasks" },
    { id: "ai-rules", icon: "⚙", label: "AI Rules" },
    { id: "suggested", icon: "✦", label: "Suggested" },
    { id: "spam", icon: "🛡", label: "Spam" },
  ];

  return (
    <div style={{
      width: 210, flexShrink: 0,
      background: "#ffffff",
      display: "flex", flexDirection: "column",
      height: "100vh",
      boxShadow: "2px 0 24px rgba(19,27,46,0.04)",
    }}>
      {/* Logo */}
      <div onClick={onWorkspace} style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: 10, cursor: "pointer", borderRadius: "12px", transition: "background 0.15s" }} onMouseEnter={e => e.currentTarget.style.background="rgba(53,37,205,0.05)"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
        <div style={{
          width: 32, height: 32, borderRadius: "8px",
          background: "linear-gradient(135deg, #3525cd, #4f46e5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, color: "#fff", fontWeight: 700, flexShrink: 0,
        }}>✦</div>
        <div>
          <p style={{ fontFamily: "'Manrope', sans-serif", fontWeight: 700, fontSize: 13, color: "#131b2e" }}>The Workspace</p>
          <p style={{ fontSize: 10, color: "#5516be", fontWeight: 600, letterSpacing: "0.04em" }}>AI AGENT ACTIVE</p>
        </div>
      </div>

      {/* Compose */}
      <div style={{ padding: "0 12px 16px" }}>
        <button onClick={() => onNavigate("compose")} style={{
          width: "100%", padding: "9px 16px",
          background: "linear-gradient(135deg, #3525cd, #4f46e5)",
          borderRadius: "12px", color: "#fff",
          fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 13,
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 4px 14px rgba(77,68,227,0.3)",
          cursor: "pointer",
        }}>
          <span>✏</span> Compose
        </button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "0 8px", display: "flex", flexDirection: "column", gap: 1 }}>
        {navItems.map(item => (
          <button key={item.id} onClick={() => { onNavigate(item.id); setOpenPanel(null); }} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px", borderRadius: "8px",
            background: activeView === item.id ? "rgba(53,37,205,0.08)" : "transparent",
            color: activeView === item.id ? "#3525cd" : "#464555",
            fontWeight: activeView === item.id ? 600 : 400,
            fontSize: 13, width: "100%", textAlign: "left",
            border: "none", cursor: "pointer", transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 14, width: 18, textAlign: "center", opacity: 0.8 }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom — Settings, Support, Profile */}
      <div style={{ padding: "12px 8px 16px", display: "flex", flexDirection: "column", gap: 1, position: "relative" }}>

        {[["⚙", "Settings", "settings"], ["?", "Support", "support"]].map(([icon, label, id]) => (
          <button key={id} onClick={() => setOpenPanel(openPanel === id ? null : id)} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "8px 12px", borderRadius: "8px",
            color: openPanel === id ? "#3525cd" : "#787594",
            background: openPanel === id ? "rgba(53,37,205,0.08)" : "transparent",
            fontSize: 13, width: "100%", textAlign: "left", cursor: "pointer",
            border: "none", transition: "all 0.15s",
          }}>
            <span style={{ fontSize: 13, width: 18, textAlign: "center" }}>{icon}</span>
            {label}
          </button>
        ))}

        {/* Profile row */}
        <div onClick={() => setOpenPanel(openPanel === "profile" ? null : "profile")} style={{
          padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, marginTop: 4,
          borderRadius: "8px", cursor: "pointer",
          background: openPanel === "profile" ? "rgba(53,37,205,0.08)" : "transparent",
          transition: "all 0.15s",
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "linear-gradient(135deg, #3525cd, #4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#fff", fontWeight: 700, flexShrink: 0,
          }}>D</div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: "#131b2e", fontFamily: "'Manrope',sans-serif" }}>Director</p>
            <p style={{ fontSize: 10, color: "#5516be", fontWeight: 600, letterSpacing: "0.04em" }}>AI AGENT ACTIVE</p>
          </div>
        </div>

        {/* Settings panel */}
        {openPanel === "settings" && (
          <div style={{
            position: "absolute", bottom: "100%", left: 8, right: 8,
            background: "#fff", borderRadius: "14px",
            boxShadow: "0 -8px 32px rgba(19,27,46,0.14)",
            padding: "16px", zIndex: 300,
            border: "1px solid #f2f3ff",
          }}>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13, color: "#131b2e", marginBottom: 14 }}>Settings</p>
            {[
              ["🔔", "Notifications", true],
              ["✦", "AI Agent", true],
              ["🌙", "Dark Mode", false],
              ["⚡", "Auto-triage", true],
              ["📧", "Email sync", true],
            ].map(([icon, label, on], i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 0", borderBottom: i < 4 ? "1px solid #f2f3ff" : "none",
              }}>
                <span style={{ fontSize: 13, color: "#464555", display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>{label}
                </span>
                <ToggleSwitch defaultOn={on} />
              </div>
            ))}
            <button onClick={() => setOpenPanel(null)} style={{
              marginTop: 14, width: "100%", padding: "8px", borderRadius: "9999px",
              background: "#f2f3ff", color: "#3525cd",
              fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", border: "none",
            }}>Done</button>
          </div>
        )}

        {/* Support panel */}
        {openPanel === "support" && (
          <div style={{
            position: "absolute", bottom: "100%", left: 8, right: 8,
            background: "#fff", borderRadius: "14px",
            boxShadow: "0 -8px 32px rgba(19,27,46,0.14)",
            padding: "16px", zIndex: 300,
            border: "1px solid #f2f3ff",
          }}>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13, color: "#131b2e", marginBottom: 14 }}>Support</p>
            {[
              ["📖", "Documentation", "Read the full guide"],
              ["💬", "Live Chat", "Talk to our team"],
              ["🐛", "Report a Bug", "Something not working?"],
              ["🎓", "Tutorials", "Get started quickly"],
            ].map(([icon, label, sub], i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 0", borderBottom: i < 3 ? "1px solid #f2f3ff" : "none",
                cursor: "pointer",
              }}>
                <span style={{ fontSize: 16 }}>{icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#131b2e", fontFamily: "'Manrope',sans-serif" }}>{label}</p>
                  <p style={{ fontSize: 11, color: "#787594" }}>{sub}</p>
                </div>
                <span style={{ color: "#c0c0d0", fontSize: 14 }}>›</span>
              </div>
            ))}
            <button onClick={() => setOpenPanel(null)} style={{
              marginTop: 14, width: "100%", padding: "8px", borderRadius: "9999px",
              background: "#f2f3ff", color: "#3525cd",
              fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 12, cursor: "pointer", border: "none",
            }}>Close</button>
          </div>
        )}

        {/* Profile panel */}
        {openPanel === "profile" && (
          <div style={{
            position: "absolute", bottom: "100%", left: 8, right: 8,
            background: "#fff", borderRadius: "14px",
            boxShadow: "0 -8px 32px rgba(19,27,46,0.14)",
            padding: "16px", zIndex: 300,
            border: "1px solid #f2f3ff",
          }}>
            <div style={{ textAlign: "center", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f2f3ff" }}>
              <div style={{
                width: 52, height: 52, borderRadius: "50%",
                background: "linear-gradient(135deg, #3525cd, #4f46e5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, color: "#fff", fontWeight: 700, margin: "0 auto 10px",
              }}>D</div>
              <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 14, color: "#131b2e" }}>Director</p>
              <p style={{ fontSize: 10, color: "#5516be", fontWeight: 700, letterSpacing: "0.04em", marginTop: 2 }}>AI AGENT ACTIVE</p>
              <p style={{ fontSize: 11, color: "#787594", marginTop: 4 }}>director@workspace.ai</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {[["👤", "Edit Profile", false], ["🔑", "Change Password", false], ["📊", "Usage Stats", false], ["🚪", "Sign Out", true]].map(([icon, label, danger], i) => (
                <button key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: "8px", width: "100%",
                  color: danger ? "#922b21" : "#464555",
                  background: "transparent", border: "none",
                  fontSize: 13, cursor: "pointer", textAlign: "left",
                }}>
                  <span>{icon}</span>{label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Backdrop */}
        {openPanel && (
          <div onClick={() => setOpenPanel(null)} style={{ position: "fixed", inset: 0, zIndex: 200 }} />
        )}
      </div>
    </div>
  );
}
