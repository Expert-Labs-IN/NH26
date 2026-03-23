import { useState } from "react";

const TEMPLATES = [
  { id: "follow-up", label: "Follow-up", subject: "Following up on our conversation", body: "Hi,\n\nI wanted to follow up on our recent conversation. I'd love to connect and discuss next steps.\n\nLooking forward to hearing from you.\n\nBest regards" },
  { id: "meeting", label: "Meeting request", subject: "Meeting request — quick sync", body: "Hi,\n\nI hope you're doing well. I'd love to schedule a quick 20-minute sync to discuss [topic].\n\nAre you available this week? Here are a few slots that work for me:\n• [Day] at [Time]\n• [Day] at [Time]\n\nLooking forward to connecting.\n\nBest regards" },
  { id: "intro", label: "Introduction", subject: "Introduction — [Your Name]", body: "Hi,\n\nMy name is [Name] and I'm reaching out because [reason].\n\nI'd love to learn more about [topic] and explore potential opportunities to collaborate.\n\nWould you be open to a brief call this week?\n\nBest regards" },
];

export default function ComposeModal({ onClose }) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState(null);

  const applyTemplate = (t) => {
    setSubject(t.subject);
    setBody(t.body);
    setActiveTemplate(t.id);
    setShowTemplates(false);
  };

  const handleAIDraft = async () => {
    if (!subject && !to) return;
    setAiLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    const drafts = {
      default: `Hi,\n\nThank you for your time. I'm reaching out regarding ${subject || "our recent discussion"}.\n\nI'd love to connect and explore how we can move forward together. Please let me know your availability for a quick call this week.\n\nBest regards`,
    };
    setBody(drafts.default);
    setAiLoading(false);
  };

  const handleSend = async () => {
    if (!to || !subject || !body) return;
    setSending(true);
    await new Promise(r => setTimeout(r, 900));
    setSending(false);
    setSent(true);
    setTimeout(onClose, 1500);
  };

  const inputStyle = {
    width: "100%", background: "none", border: "none",
    outline: "none", fontSize: 13, color: "#131b2e",
    fontFamily: "'Inter',sans-serif", padding: "10px 0",
  };

  if (sent) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(19,27,46,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: "#fff", borderRadius: "20px", padding: "48px 40px", textAlign: "center", boxShadow: "0 24px 64px rgba(19,27,46,0.2)" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#edf7f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>✓</div>
        <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 18, color: "#131b2e", marginBottom: 6 }}>Message sent!</p>
        <p style={{ color: "#787594", fontSize: 13 }}>Your email to {to} has been delivered.</p>
      </div>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(19,27,46,0.45)", display: "flex", alignItems: "flex-end", justifyContent: "flex-end", zIndex: 1000, padding: "0 24px 24px 0" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 540, background: "#fff", borderRadius: "20px", boxShadow: "0 24px 64px rgba(19,27,46,0.2)", display: "flex", flexDirection: "column", maxHeight: "80vh" }}>

        {/* Header */}
        <div style={{ padding: "16px 20px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f2f3ff" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: "8px", background: "linear-gradient(135deg, #3525cd, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff" }}>✏</div>
            <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 14, color: "#131b2e" }}>New Message</p>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setShowTemplates(s => !s)} style={{
              padding: "5px 12px", borderRadius: "9999px",
              background: showTemplates ? "#e9ddff" : "#f2f3ff",
              color: showTemplates ? "#5516be" : "#3525cd",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              fontFamily: "'Manrope',sans-serif", border: "none",
            }}>Templates</button>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: "9999px", background: "#f2f3ff", color: "#787594", fontSize: 16, cursor: "pointer", border: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          </div>
        </div>

        {/* Templates */}
        {showTemplates && (
          <div style={{ padding: "10px 20px", borderBottom: "1px solid #f2f3ff", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TEMPLATES.map(t => (
              <button key={t.id} onClick={() => applyTemplate(t)} style={{
                padding: "5px 14px", borderRadius: "9999px",
                background: activeTemplate === t.id ? "linear-gradient(135deg, #3525cd, #4f46e5)" : "#f2f3ff",
                color: activeTemplate === t.id ? "#fff" : "#3525cd",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                fontFamily: "'Manrope',sans-serif", border: "none",
              }}>{t.label}</button>
            ))}
          </div>
        )}

        {/* Fields */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {[["To", to, setTo, "recipient@example.com"], ["Subject", subject, setSubject, "What's this about?"]].map(([label, val, set, ph]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px", borderBottom: "1px solid #f2f3ff" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#787594", width: 52, flexShrink: 0, fontFamily: "'Manrope',sans-serif" }}>{label}</span>
              <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inputStyle} />
            </div>
          ))}

          {/* AI Draft button */}
          <div style={{ padding: "10px 20px", borderBottom: "1px solid #f2f3ff" }}>
            <button onClick={handleAIDraft} disabled={aiLoading} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "5px 14px", borderRadius: "9999px",
              background: aiLoading ? "#ececf8" : "#e9ddff",
              color: aiLoading ? "#787594" : "#5516be",
              fontSize: 12, fontWeight: 700, cursor: aiLoading ? "not-allowed" : "pointer",
              fontFamily: "'Manrope',sans-serif", border: "none",
            }}>
              <span>{aiLoading ? "⏳" : "✦"}</span>
              {aiLoading ? "Drafting with AI…" : "Draft with AI"}
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "4px 20px" }}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Write your message…"
              rows={10}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.8, width: "100%", paddingTop: 12 }}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid #f2f3ff", display: "flex", alignItems: "center", gap: 10 }}>
          <button onClick={handleSend} disabled={sending || !to || !subject || !body} style={{
            padding: "9px 24px", borderRadius: "9999px",
            background: (!to || !subject || !body) ? "#ececf8" : "linear-gradient(135deg, #3525cd, #4f46e5)",
            color: (!to || !subject || !body) ? "#787594" : "#fff",
            fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13,
            cursor: (!to || !subject || !body) ? "not-allowed" : "pointer",
            boxShadow: (!to || !subject || !body) ? "none" : "0 4px 14px rgba(77,68,227,0.25)",
            border: "none", transition: "all 0.2s",
          }}>
            {sending ? "Sending…" : "Send →"}
          </button>
          <button style={{ padding: "9px 16px", borderRadius: "9999px", background: "#f2f3ff", color: "#3525cd", fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", border: "none" }}>
            Save Draft
          </button>
          <button onClick={onClose} style={{ marginLeft: "auto", padding: "9px 16px", borderRadius: "9999px", background: "#fdf0ee", color: "#922b21", fontFamily: "'Manrope',sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer", border: "none" }}>
            Discard
          </button>
        </div>
      </div>
    </div>
  );
}
