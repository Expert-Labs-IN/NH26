import { useState } from "react";
import { triageEmail } from "../api.js";
import PriorityBadge from "./PriorityBadge.jsx";
import ActionPanel from "./ActionPanel.jsx";

export default function EmailDetail({ email, triage, onTriaged }) {
  const [loading, setLoading] = useState(false);

  const handleTriage = async () => {
    setLoading(true);
    try {
      const result = await triageEmail(email);
      onTriaged(email.id, result.triage);
    } catch (e) {
      alert("Triage failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (!email) {
    return (
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: "var(--surface)",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, borderRadius: "var(--radius-md)",
            background: "var(--surface-container-low)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
            fontSize: 24,
          }}>✉</div>
          <p style={{ color: "var(--outline)", fontSize: 13, fontFamily: "var(--font-display)" }}>
            Select a message to begin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", overflow: "hidden" }}>

      {/* Email content — left of action panel */}
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 40px" }}>

        {/* Subject + meta */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 10 }}>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: 22, fontWeight: 700,
              color: "var(--on-surface)",
              lineHeight: 1.3, flex: 1,
              letterSpacing: "-0.3px",
            }}>
              {email.subject}
            </h2>
            {triage && <PriorityBadge priority={triage.priority} />}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--on-surface-variant)", alignItems: "center" }}>
            <span>
              <span style={{ color: "var(--outline)" }}>From </span>
              <strong style={{ color: "var(--on-surface)", fontWeight: 500 }}>{email.fromName}</strong>
              <span style={{ color: "var(--outline)" }}> &lt;{email.from}&gt;</span>
            </span>
            {email.isVIP && (
              <span style={{
                background: "var(--tertiary-fixed)", color: "var(--on-tertiary-fixed)",
                padding: "2px 10px", borderRadius: "var(--radius-full)",
                fontSize: 11, fontWeight: 600, fontFamily: "var(--font-display)",
              }}>★ VIP</span>
            )}
          </div>
        </div>

        {/* AI Summary — inverse surface card */}
        {triage && (
          <div style={{
            background: "var(--inverse-surface)",
            borderRadius: "var(--radius-md)",
            padding: "20px 24px",
            marginBottom: 28,
          }}>
            <p style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.4)",
              fontFamily: "var(--font-display)",
              textTransform: "uppercase",
              marginBottom: 12,
            }}>
              ✦ AI Executive Summary
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {triage.summary.map((s, i) => (
                <li key={i} style={{ display: "flex", gap: 10, fontSize: 13 }}>
                  <span style={{ color: "var(--primary-container)", flexShrink: 0, marginTop: 1 }}>›</span>
                  <span style={{
                    color: "rgba(255,255,255,0.85)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 500,
                    lineHeight: 1.5,
                  }}>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Email body */}
        <div style={{
          background: "var(--surface-container-lowest)",
          borderRadius: "var(--radius-md)",
          padding: "24px 28px",
          boxShadow: "var(--shadow-ambient)",
        }}>
          <pre style={{
            fontFamily: "var(--font-body)",
            fontSize: 13.5,
            color: "var(--on-surface)",
            lineHeight: 1.85,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {email.body}
          </pre>
        </div>

        {/* Triage button */}
        {!triage && (
          <div style={{ marginTop: 24 }}>
            <button
              onClick={handleTriage}
              disabled={loading}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "10px 22px",
                borderRadius: "var(--radius)",
                background: loading
                  ? "var(--surface-container-high)"
                  : "linear-gradient(135deg, var(--primary), var(--primary-container))",
                color: loading ? "var(--outline)" : "#fff",
                fontFamily: "var(--font-display)",
                fontWeight: 600, fontSize: 13,
                boxShadow: loading ? "none" : "0 4px 16px rgba(53,37,205,0.25)",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <span>✦</span>
              {loading ? "Analysing…" : "Analyse with AI"}
            </button>
          </div>
        )}

        {triage && (
          <button onClick={handleTriage} disabled={loading}
            style={{
              marginTop: 16, fontSize: 12, color: "var(--outline)",
              background: "none", border: "none", cursor: "pointer",
              fontFamily: "var(--font-body)",
            }}>
            ↺ Re-analyse
          </button>
        )}
      </div>

      {/* Action panel — right column */}
      {triage && (
        <div style={{
          width: 320, flexShrink: 0,
          background: "var(--surface-container-low)",
          overflowY: "auto",
          padding: "36px 24px",
          borderLeft: "none",
        }}>
          <p style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
            color: "var(--outline)",
            fontFamily: "var(--font-display)",
            textTransform: "uppercase",
            marginBottom: 20,
          }}>Suggested Action</p>
          <ActionPanel emailId={email.id} triage={triage} />
        </div>
      )}
    </div>
  );
}
