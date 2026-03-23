import { useState } from "react";
import { triageEmail } from "../api.js";

function IntelChip({ type }) {
  const map = {
    draft_reply: { bg: "#e9ddff", color: "#5516be", label: "✦ DRAFT READY" },
    calendar_event: { bg: "#f2f3ff", color: "#3525cd", label: "📅 SCHEDULE" },
    task_list: { bg: "#edf7f2", color: "#145c30", label: "✓ TASKS" },
    urgent: { bg: "#fdf0ee", color: "#922b21", label: "⚠ FLAGGED BY AI" },
  };
  const s = map[type] || map.draft_reply;
  return (
    <span style={{
      background: s.bg, color: s.color,
      borderRadius: "9999px", padding: "3px 10px",
      fontSize: 10, fontWeight: 700, letterSpacing: "0.05em",
      fontFamily: "'Manrope',sans-serif",
    }}>{s.label}</span>
  );
}

export default function InboxView({ emails, triageCache, onTriaged }) {
  const [selected, setSelected] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [approved, setApproved] = useState({});

  const handleTriage = async (email, e) => {
    e?.stopPropagation();
    setLoadingId(email.id);
    try {
      const result = await triageEmail(email);
      onTriaged(email.id, result.triage);
    } catch (err) {
      alert("Triage failed: " + err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const nonSpam = emails.filter(e => !e.isSpam);
  const analyzed = Object.keys(triageCache).length;

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", overflow: "hidden" }}>
      {/* Email list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", background: "#faf8ff" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 26, fontWeight: 700, color: "#131b2e", letterSpacing: "-0.4px", marginBottom: 6 }}>
            Focused Inbox
          </h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ color: "#464555", fontSize: 13 }}>
              Your intelligence agent has prioritized{" "}
              <span style={{ color: "#3525cd", fontWeight: 600 }}>
                {Object.values(triageCache).filter(t => t.priority === "Urgent").length} critical items
              </span>{" "}
              requiring human approval.
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ padding: "6px 14px", borderRadius: "9999px", background: "#f2f3ff", color: "#3525cd", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                ⊟ Filter
              </button>
              <button style={{ padding: "6px 14px", borderRadius: "9999px", background: "#f2f3ff", color: "#3525cd", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Manrope',sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                ↕ Latest
              </button>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {nonSpam.map((email) => {
            const triage = triageCache[email.id];
            const isSelected = selected?.id === email.id;
            const isLoading = loadingId === email.id;
            const isUrgent = triage?.priority === "Urgent";

            return (
              <div key={email.id}
                onClick={() => setSelected(isSelected ? null : email)}
                style={{
                  padding: "18px 20px",
                  borderRadius: "12px",
                  marginBottom: 4,
                  cursor: "pointer",
                  background: isSelected ? "#ffffff" : "transparent",
                  boxShadow: isSelected ? "0 0 24px rgba(19,27,46,0.06)" : "none",
                  borderLeft: isUrgent ? "3px solid #c0392b" : isSelected ? "3px solid #3525cd" : "3px solid transparent",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  {/* Unread dot */}
                  <div style={{ paddingTop: 4, flexShrink: 0 }}>
                    {!triage
                      ? <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3525cd" }} />
                      : <div style={{ width: 8, height: 8, borderRadius: "50%", background: "transparent" }} />
                    }
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 14, color: "#131b2e" }}>
                          {email.fromName}
                        </span>
                        <span style={{ fontSize: 13, color: "#787594" }}>{email.subject}</span>
                        {email.isVIP && (
                          <span style={{ background: "#e9ddff", color: "#5516be", borderRadius: "9999px", padding: "1px 8px", fontSize: 10, fontWeight: 700, fontFamily: "'Manrope',sans-serif" }}>VIP</span>
                        )}
                      </div>
                      <span style={{ fontSize: 12, color: "#787594", flexShrink: 0, marginLeft: 16, fontVariantNumeric: "tabular-nums" }}>
                        {new Date(email.receivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {/* Chips row */}
                    <div style={{ display: "flex", gap: 6, marginBottom: triage ? 10 : 0 }}>
                      {triage && <IntelChip type={triage.actionType} />}
                      {triage?.priority === "Urgent" && <IntelChip type="urgent" />}
                    </div>

                    {/* AI Summary inline */}
                    {triage && (
                      <div style={{
                        background: isUrgent ? "#fdf0ee" : "#f2f3ff",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        borderLeft: `3px solid ${isUrgent ? "#c0392b" : "#3525cd"}`,
                      }}>
                        <span style={{ fontWeight: 600, fontSize: 12, color: isUrgent ? "#c0392b" : "#3525cd", fontFamily: "'Manrope',sans-serif" }}>
                          AI Summary:{" "}
                        </span>
                        <span style={{ fontSize: 12, color: "#464555" }}>{triage.summary.join(" · ")}</span>
                      </div>
                    )}

                    {/* Expanded email + action */}
                    {isSelected && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{
                          background: "#ffffff", borderRadius: "12px",
                          padding: "20px", marginBottom: 16,
                          boxShadow: "0 0 24px rgba(19,27,46,0.04)",
                        }}>
                          <pre style={{
                            fontFamily: "'Inter',sans-serif", fontSize: 13,
                            color: "#464555", lineHeight: 1.8,
                            whiteSpace: "pre-wrap", wordBreak: "break-word",
                          }}>{email.body}</pre>
                        </div>

                        {!triage ? (
                          <button onClick={(e) => handleTriage(email, e)} disabled={isLoading} style={{
                            display: "inline-flex", alignItems: "center", gap: 8,
                            padding: "9px 20px", borderRadius: "9999px",
                            background: isLoading ? "#ececf8" : "linear-gradient(135deg, #3525cd, #4f46e5)",
                            color: isLoading ? "#787594" : "#fff",
                            fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13,
                            boxShadow: isLoading ? "none" : "0 4px 14px rgba(77,68,227,0.25)",
                            cursor: isLoading ? "not-allowed" : "pointer",
                          }}>
                            <span>✦</span> {isLoading ? "Analysing…" : "Analyse with AI"}
                          </button>
                        ) : (
                          <ActionInline
                            email={email} triage={triage}
                            approved={approved[email.id]}
                            onApprove={() => setApproved(p => ({ ...p, [email.id]: true }))}
                            onRetriage={(e) => handleTriage(email, e)}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Inbox Health Score */}
        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "1fr auto", gap: 16 }}>
          <div style={{
            background: "linear-gradient(135deg, #3525cd, #4f46e5)",
            borderRadius: "16px", padding: "24px 28px",
          }}>
            <h3 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 16, color: "#fff", marginBottom: 8 }}>
              Inbox Health Score
            </h3>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 20 }}>
              Your AI agent has processed {analyzed} email{analyzed !== 1 ? "s" : ""} today
              {analyzed > 0 ? ", saving you time on sorting and drafting." : ". Start processing to improve your score."}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.2)", borderRadius: "9999px" }}>
                <div style={{
                  height: "100%", borderRadius: "9999px",
                  background: "#fff",
                  width: `${Math.round((analyzed / emails.length) * 100)}%`,
                  transition: "width 0.5s ease",
                }} />
              </div>
              <span style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 16, color: "#fff" }}>
                {Math.round((analyzed / emails.length) * 100)}%
              </span>
            </div>
          </div>

          <div style={{
            background: "#e9ddff", borderRadius: "16px", padding: "24px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            minWidth: 200,
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🪄</div>
            <div>
              <h4 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 14, color: "#131b2e", marginBottom: 6 }}>Rule Suggestion</h4>
              <p style={{ fontSize: 12, color: "#464555", marginBottom: 12, lineHeight: 1.6 }}>
                "Auto-archive newsletters that don't mention your core topics."
              </p>
              <button style={{ fontSize: 12, fontWeight: 700, color: "#3525cd", fontFamily: "'Manrope',sans-serif", cursor: "pointer", letterSpacing: "0.04em" }}>
                SET RULE →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionInline({ email, triage, approved, onApprove, onRetriage }) {
  const [editedAction, setEditedAction] = useState(triage.action);
  const typeLabel = { draft_reply: "Draft Reply", calendar_event: "Calendar Event", task_list: "Task List" };

  if (approved) return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "#edf7f2", borderRadius: "9999px" }}>
      <span style={{ color: "#145c30", fontSize: 16 }}>✓</span>
      <span style={{ color: "#145c30", fontWeight: 600, fontSize: 13, fontFamily: "'Manrope',sans-serif" }}>Action executed successfully</span>
    </div>
  );

  return (
    <div style={{ background: "#f2f3ff", borderRadius: "12px", padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ background: "#e9ddff", color: "#5516be", borderRadius: "9999px", padding: "3px 12px", fontSize: 11, fontWeight: 700, fontFamily: "'Manrope',sans-serif" }}>
          ✦ {typeLabel[triage.actionType]}
        </span>
        <span style={{ fontSize: 11, color: "#787594" }}>AI-prepared · review before approving</span>
      </div>

      {triage.actionType === "draft_reply" && (
        <div style={{ marginBottom: 14 }}>
          <p style={{ fontSize: 11, color: "#787594", marginBottom: 4, fontWeight: 600 }}>DRAFT REPLY TO {editedAction.to}</p>
          <textarea value={editedAction.body} onChange={e => setEditedAction(a => ({ ...a, body: e.target.value }))} rows={4}
            style={{ width: "100%", background: "#ffffff", border: "none", borderRadius: "8px", padding: "10px 12px", fontSize: 12, color: "#131b2e", outline: "none", resize: "vertical", lineHeight: 1.7, fontFamily: "'Inter',sans-serif" }}
            onFocus={e => e.target.style.boxShadow = "0 0 0 2px rgba(53,37,205,0.35)"}
            onBlur={e => e.target.style.boxShadow = "none"}
          />
        </div>
      )}

      {triage.actionType === "calendar_event" && (
        <div style={{ background: "#ffffff", borderRadius: "8px", padding: "12px", marginBottom: 14, fontSize: 12, color: "#464555", lineHeight: 2 }}>
          <p><strong style={{ color: "#131b2e" }}>Event:</strong> {editedAction.title}</p>
          <p><strong style={{ color: "#131b2e" }}>Date:</strong> {editedAction.date} · {editedAction.startTime} – {editedAction.endTime}</p>
          {editedAction.location && <p><strong style={{ color: "#131b2e" }}>Location:</strong> {editedAction.location}</p>}
        </div>
      )}

      {triage.actionType === "task_list" && (
        <div style={{ marginBottom: 14 }}>
          {editedAction.tasks?.map((t, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ color: "#3525cd", fontSize: 12 }}>◆</span>
              <span style={{ fontSize: 12, color: "#464555" }}>{t}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={onApprove} style={{
          padding: "8px 20px", borderRadius: "9999px",
          background: "linear-gradient(135deg, #3525cd, #4f46e5)",
          color: "#fff", fontFamily: "'Manrope',sans-serif",
          fontWeight: 700, fontSize: 13, cursor: "pointer",
          boxShadow: "0 4px 12px rgba(77,68,227,0.25)",
        }}>Approve & Execute →</button>
        <button onClick={onRetriage} style={{ fontSize: 12, color: "#787594", cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
          ↺ Re-analyse
        </button>
      </div>
    </div>
  );
}
