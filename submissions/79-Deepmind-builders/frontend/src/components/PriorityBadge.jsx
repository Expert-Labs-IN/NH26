export default function PriorityBadge({ priority }) {
  const map = {
    Urgent: { color: "var(--urgent-text)", bg: "var(--urgent-bg)", dot: "var(--urgent)", label: "Urgent" },
    "Requires Action": { color: "var(--action-text)", bg: "var(--action-bg)", dot: "var(--action)", label: "Action" },
    FYI: { color: "var(--fyi-text)", bg: "var(--fyi-bg)", dot: "var(--fyi)", label: "FYI" },
  };
  const s = map[priority] || map["FYI"];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px",
      borderRadius: "var(--radius-full)",
      background: s.bg,
      color: s.color,
      fontSize: 11, fontWeight: 600,
      fontFamily: "var(--font-display)",
      letterSpacing: "0.04em",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}
