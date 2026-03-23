import { useState } from "react";

const SPAM_SIGNALS = {
  e017: ["Prize/lottery scam", "Requests personal & banking info", "Urgency tactics", "Suspicious domain"],
  e018: ["Phishing — fake PayPal domain (paypa1)", "Account suspension threat", "Credential harvesting link", "Spoofed sender"],
  e019: ["Advance-fee fraud (419 scam)", "Unsolicited inheritance claim", "Requests financial cooperation", "Implausible offer"],
};

export default function SpamView({ emails }) {
  const [deleted, setDeleted] = useState({});
  const [restored, setRestored] = useState({});
  const [selected, setSelected] = useState(null);
  const [reportedAll, setReportedAll] = useState(false);

  const spamEmails = emails.filter(e => e.isSpam && !deleted[e.id]);
  const restoredEmails = emails.filter(e => e.isSpam && restored[e.id] && !deleted[e.id]);

  const deleteAll = () => {
    spamEmails.forEach(e => setDeleted(p => ({ ...p, [e.id]: true })));
    setSelected(null);
  };

  const riskLevel = (email) => {
    if (email.subject.includes("PayPal") || email.subject.includes("verify")) return { label: "Phishing", color: "#922b21", bg: "#fdf0ee" };
    if (email.subject.includes("inheritance") || email.subject.includes("Million")) return { label: "Fraud", color: "#7d4207", bg: "#fef6ec" };
    return { label: "Scam", color: "#5516be", bg: "#e9ddff" };
  };

  if (spamEmails.length === 0) return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#faf8ff" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🛡</div>
        <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 18, color: "#131b2e", marginBottom: 6 }}>Spam folder is empty</p>
        <p style={{ color: "#787594", fontSize: 13 }}>Your AI agent is keeping your inbox clean.</p>
      </div>
    </div>
  );

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", overflow: "hidden" }}>

      {/* Left — spam list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 32px 32px 40px", background: "#faf8ff" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 26, fontWeight: 700, color: "#131b2e", letterSpacing: "-0.4px", marginBottom: 6 }}>Spam</h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ color: "#464555", fontSize: 13 }}>
              <span style={{ color: "#922b21", fontWeight: 600 }}>{spamEmails.length} threat{spamEmails.length !== 1 ? "s" : ""}</span> detected and quarantined by your AI agent
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {!reportedAll && (
                <button onClick={() => setReportedAll(true)} style={{
                  padding: "6px 14px", borderRadius: "9999px",
                  background: "#fdf0ee", color: "#922b21",
                  fontSize: 12, fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Manrope',sans-serif", border: "none",
                }}>Report All</button>
              )}
              {reportedAll && (
                <span style={{ padding: "6px 14px", borderRadius: "9999px", background: "#edf7f2", color: "#145c30", fontSize: 12, fontWeight: 700, fontFamily: "'Manrope',sans-serif" }}>✓ Reported</span>
              )}
              <button onClick={deleteAll} style={{
                padding: "6px 14px", borderRadius: "9999px",
                background: "#283044", color: "#fff",
                fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: "'Manrope',sans-serif", border: "none",
              }}>Delete All</button>
            </div>
          </div>
        </div>

        {/* AI notice */}
        <div style={{ background: "#283044", borderRadius: "14px", padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 20 }}>🛡</span>
          <div>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 2 }}>AI Threat Detection Active</p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>These emails were automatically quarantined based on phishing, fraud, and scam patterns. Never click links or share personal information.</p>
          </div>
        </div>

        {/* Spam email rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {spamEmails.map(email => {
            const risk = riskLevel(email);
            const isSelected = selected?.id === email.id;
            const signals = SPAM_SIGNALS[email.id] || ["Suspicious content detected"];

            return (
              <div key={email.id} onClick={() => setSelected(isSelected ? null : email)} style={{
                background: "#ffffff", borderRadius: "14px",
                padding: "16px 20px",
                cursor: "pointer",
                boxShadow: isSelected ? "0 0 24px rgba(19,27,46,0.08)" : "0 0 12px rgba(19,27,46,0.04)",
                borderLeft: `3px solid ${risk.color}`,
                transition: "all 0.15s",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13, color: "#131b2e" }}>{email.fromName}</span>
                      <span style={{ fontSize: 12, color: "#787594" }}>·</span>
                      <span style={{ fontSize: 11, color: "#787594", fontFamily: "'Inter',sans-serif" }}>{email.from}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#464555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.subject}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: 16 }}>
                    <span style={{ background: risk.bg, color: risk.color, borderRadius: "9999px", padding: "3px 10px", fontSize: 11, fontWeight: 700, fontFamily: "'Manrope',sans-serif" }}>
                      ⚠ {risk.label}
                    </span>
                    <button onClick={e => { e.stopPropagation(); setDeleted(p => ({ ...p, [email.id]: true })); if (selected?.id === email.id) setSelected(null); }} style={{
                      width: 26, height: 26, borderRadius: "9999px",
                      background: "#f2f3ff", color: "#787594",
                      fontSize: 14, cursor: "pointer", border: "none",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>×</button>
                  </div>
                </div>

                {/* Signal pills */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {signals.map((s, i) => (
                    <span key={i} style={{ background: "#fdf0ee", color: "#922b21", borderRadius: "9999px", padding: "2px 8px", fontSize: 10, fontWeight: 600, fontFamily: "'Manrope',sans-serif" }}>
                      {s}
                    </span>
                  ))}
                </div>

                {/* Expanded preview */}
                {isSelected && (
                  <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f2f3ff" }}>
                    <div style={{ background: "#fdf0ee", borderRadius: "10px", padding: "12px 14px", marginBottom: 12 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: "#922b21", marginBottom: 6, fontFamily: "'Manrope',sans-serif" }}>⚠ DO NOT interact with this email</p>
                      <p style={{ fontSize: 12, color: "#464555", lineHeight: 1.7, maxHeight: 100, overflow: "hidden" }}>
                        {email.body.slice(0, 280)}…
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={e => { e.stopPropagation(); setRestored(p => ({ ...p, [email.id]: true })); setDeleted(p => ({ ...p, [email.id]: true })); setSelected(null); }} style={{
                        padding: "7px 14px", borderRadius: "9999px",
                        background: "#f2f3ff", color: "#3525cd",
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                        fontFamily: "'Manrope',sans-serif", border: "none",
                      }}>Not spam — restore</button>
                      <button onClick={e => { e.stopPropagation(); setDeleted(p => ({ ...p, [email.id]: true })); setSelected(null); }} style={{
                        padding: "7px 14px", borderRadius: "9999px",
                        background: "#283044", color: "#fff",
                        fontSize: 12, fontWeight: 600, cursor: "pointer",
                        fontFamily: "'Manrope',sans-serif", border: "none",
                      }}>Delete permanently</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Deletion message */}
        {Object.keys(deleted).length > 0 && spamEmails.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", marginTop: 16 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🛡</div>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 16, color: "#131b2e", marginBottom: 6 }}>All threats removed</p>
            <p style={{ color: "#787594", fontSize: 13 }}>Your inbox is protected.</p>
          </div>
        )}
      </div>

      {/* Right — stats panel */}
      <div style={{ width: 280, flexShrink: 0, background: "#ffffff", overflowY: "auto", padding: "32px 24px", borderLeft: "none" }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#787594", letterSpacing: "0.08em", marginBottom: 16, fontFamily: "'Manrope',sans-serif" }}>THREAT SUMMARY</p>

        {/* Stats */}
        {[
          ["⚠", "Phishing", emails.filter(e => e.isSpam && e.from.includes("paypa1")).length, "#fdf0ee", "#922b21"],
          ["💰", "Fraud / Scam", emails.filter(e => e.isSpam && !e.from.includes("paypa1")).length, "#fef6ec", "#7d4207"],
          ["🗑", "Deleted", Object.keys(deleted).length, "#edf7f2", "#145c30"],
        ].map(([icon, label, count, bg, color]) => (
          <div key={label} style={{ background: bg, borderRadius: "10px", padding: "12px 14px", marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color, fontWeight: 600, fontFamily: "'Manrope',sans-serif" }}>{label}</p>
            </div>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 800, fontSize: 20, color }}>{count}</p>
          </div>
        ))}

        {/* Protection tips */}
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: "#787594", letterSpacing: "0.08em", marginBottom: 12, fontFamily: "'Manrope',sans-serif" }}>PROTECTION TIPS</p>
          {[
            ["🔗", "Never click links in unsolicited emails"],
            ["🏦", "Banks never ask for credentials via email"],
            ["🎁", "If it sounds too good to be true, it is"],
            ["📞", "Verify requests by calling official numbers"],
          ].map(([icon, tip], i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{icon}</span>
              <p style={{ fontSize: 12, color: "#464555", lineHeight: 1.5 }}>{tip}</p>
            </div>
          ))}
        </div>

        {/* AI Protection badge */}
        <div style={{ marginTop: 20, background: "linear-gradient(135deg, #3525cd, #4f46e5)", borderRadius: "12px", padding: "16px", textAlign: "center" }}>
          <p style={{ fontSize: 22, marginBottom: 6 }}>🛡</p>
          <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff", marginBottom: 4 }}>AI Protection Active</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}>Your agent scans every incoming email for threats in real-time.</p>
        </div>
      </div>
    </div>
  );
}
