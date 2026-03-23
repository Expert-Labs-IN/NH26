import PriorityBadge from "./PriorityBadge.jsx";

function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export default function EmailList({ emails, selectedId, triageCache, onSelect }) {
  return (
    <div style={{
      height: "100%",
      overflowY: "auto",
      background: "var(--surface-container-low)",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <div style={{ padding: "28px 20px 16px" }}>
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: 26, fontWeight: 700,
          color: "var(--on-surface)",
          letterSpacing: "-0.5px",
        }}>
          Inbox<span style={{
            background: "linear-gradient(135deg, var(--primary), var(--primary-container))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>AI</span>
        </h1>
        <p style={{ color: "var(--outline)", fontSize: 12, marginTop: 3, fontFamily: "var(--font-body)" }}>
          {emails.length} messages · intelligent workspace
        </p>
      </div>

      {/* Email rows — no dividers, spacing only */}
      <div style={{ padding: "0 10px", display: "flex", flexDirection: "column", gap: 4 }}>
        {emails.map((email) => {
          const triage = triageCache[email.id];
          const isSelected = email.id === selectedId;
          const isUnread = !triage;

          return (
            <div
              key={email.id}
              onClick={() => onSelect(email)}
              style={{
                padding: "12px 14px",
                borderRadius: "var(--radius-md)",
                cursor: "pointer",
                background: isSelected
                  ? "var(--surface-container-lowest)"
                  : isUnread
                  ? "var(--surface-container-highest)"
                  : "transparent",
                boxShadow: isSelected ? "var(--shadow-ambient)" : "none",
                transition: "all 0.15s ease",
                borderLeft: isSelected ? "3px solid var(--primary)" : "3px solid transparent",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
                <span style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: isUnread ? 600 : 500,
                  fontSize: 13,
                  color: "var(--on-surface)",
                  flex: 1,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {email.fromName}
                  {email.isVIP && (
                    <span style={{
                      marginLeft: 6, fontSize: 10,
                      background: "var(--tertiary-fixed)",
                      color: "var(--on-tertiary-fixed)",
                      padding: "1px 7px", borderRadius: "var(--radius-full)",
                      fontWeight: 600,
                    }}>VIP</span>
                  )}
                </span>
                <span style={{ fontSize: 11, color: "var(--outline)", flexShrink: 0, marginLeft: 8, fontVariantNumeric: "tabular-nums" }}>
                  {timeAgo(email.receivedAt)}
                </span>
              </div>

              <p style={{
                fontSize: 12, color: "var(--on-surface-variant)",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                marginBottom: 7,
              }}>
                {email.subject}
              </p>

              {triage
                ? <PriorityBadge priority={triage.priority} />
                : <span style={{ fontSize: 11, color: "var(--outline)", fontStyle: "italic" }}>not yet analysed</span>
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}
