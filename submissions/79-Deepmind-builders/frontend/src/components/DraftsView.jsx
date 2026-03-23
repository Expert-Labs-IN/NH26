export default function DraftsView({ emails, triageCache, onNavigate }) {
  const drafts = emails
    .filter(e => triageCache[e.id]?.actionType === "draft_reply")
    .map(e => ({ email: e, triage: triageCache[e.id] }));

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", background: "#faf8ff" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 26, fontWeight: 700, color: "#131b2e", letterSpacing: "-0.4px", marginBottom: 6 }}>Drafts</h1>
        <p style={{ color: "#464555", fontSize: 13 }}>
          {drafts.length} AI-prepared draft{drafts.length !== 1 ? "s" : ""} ready for your review.
        </p>
      </div>

      {drafts.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>✏</div>
          <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, color: "#131b2e", marginBottom: 6 }}>No drafts yet</p>
          <p style={{ color: "#787594", fontSize: 13, marginBottom: 20 }}>Go to Inbox and analyse emails to generate AI draft replies.</p>
          <button onClick={() => onNavigate("inbox")} style={{
            padding: "9px 22px", borderRadius: "9999px",
            background: "linear-gradient(135deg, #3525cd, #4f46e5)",
            color: "#fff", fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
          }}>Go to Inbox →</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {drafts.map(({ email, triage }, i) => (
            <div key={i} style={{
              background: "#ffffff", borderRadius: "16px",
              padding: "22px 26px", boxShadow: "0 0 24px rgba(19,27,46,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ background: "#e9ddff", color: "#5516be", borderRadius: "9999px", padding: "3px 12px", fontSize: 10, fontWeight: 700, fontFamily: "'Manrope',sans-serif", letterSpacing: "0.05em" }}>✦ DRAFT READY</span>
                  {triage.priority === "Urgent" && (
                    <span style={{ background: "#fdf0ee", color: "#922b21", borderRadius: "9999px", padding: "3px 12px", fontSize: 10, fontWeight: 700, fontFamily: "'Manrope',sans-serif" }}>⚠ URGENT</span>
                  )}
                </div>
                <span style={{ fontSize: 12, color: "#787594" }}>To: {triage.action?.to}</span>
              </div>

              <h3 style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 15, color: "#131b2e", marginBottom: 4 }}>
                {triage.action?.subject}
              </h3>
              <p style={{ fontSize: 12, color: "#464555", marginBottom: 14, lineHeight: 1.6 }}>
                {triage.action?.body?.slice(0, 140)}…
              </p>

              <div style={{ background: "#f2f3ff", borderRadius: "8px", padding: "10px 14px", marginBottom: 16, fontSize: 12, color: "#3525cd", fontStyle: "italic" }}>
                <strong>AI Summary:</strong> {triage.summary[0]}
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button style={{
                  padding: "8px 20px", borderRadius: "9999px",
                  background: "linear-gradient(135deg, #3525cd, #4f46e5)",
                  color: "#fff", fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(77,68,227,0.2)",
                }}>✓ Approve & Send</button>
                <button onClick={() => onNavigate("inbox")} style={{
                  padding: "8px 18px", borderRadius: "9999px",
                  background: "#f2f3ff", color: "#3525cd",
                  fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}>✏ Edit in Inbox</button>
                <button style={{
                  padding: "8px 18px", borderRadius: "9999px",
                  background: "transparent", color: "#787594",
                  fontFamily: "'Manrope',sans-serif", fontSize: 13, cursor: "pointer",
                }}>🗑 Discard</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
