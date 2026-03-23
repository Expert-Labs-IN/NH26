import { useState } from "react";
import { approveAction } from "../api.js";

function IntelligenceChip({ label }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: "var(--tertiary-fixed)",
      color: "var(--on-tertiary-fixed)",
      borderRadius: "var(--radius-full)",
      padding: "3px 12px",
      fontSize: 12, fontWeight: 600,
      fontFamily: "var(--font-display)",
    }}>
      <span style={{ fontSize: 10 }}>✦</span> {label}
    </span>
  );
}

function AgentButton({ onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        padding: "0.75rem 1.75rem",
        borderRadius: "var(--radius)",
        background: disabled
          ? "var(--surface-container-high)"
          : "linear-gradient(135deg, var(--primary), var(--primary-container))",
        color: disabled ? "var(--outline)" : "#ffffff",
        fontFamily: "var(--font-display)",
        fontWeight: 600, fontSize: 14,
        letterSpacing: "0.01em",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s ease",
        boxShadow: disabled ? "none" : "0 4px 16px rgba(53,37,205,0.25)",
      }}
    >
      {children}
    </button>
  );
}

function FieldInput({ label, value, onChange, multiline, rows = 5 }) {
  const base = {
    width: "100%",
    background: "var(--surface-container-low)",
    border: "none",
    borderRadius: "var(--radius)",
    padding: "8px 12px",
    color: "var(--on-surface)",
    fontSize: 13,
    lineHeight: 1.6,
    outline: "none",
    transition: "box-shadow 0.15s",
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{
        display: "block", marginBottom: 5,
        fontSize: 11, fontWeight: 600,
        color: "var(--outline)",
        fontFamily: "var(--font-display)",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>{label}</label>
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows}
            style={{ ...base, resize: "vertical" }}
            onFocus={e => e.target.style.boxShadow = "0 0 0 2px rgba(53,37,205,0.4)"}
            onBlur={e => e.target.style.boxShadow = "none"} />
        : <input value={value} onChange={e => onChange(e.target.value)}
            style={{ ...base, height: 36 }}
            onFocus={e => e.target.style.boxShadow = "0 0 0 2px rgba(53,37,205,0.4)"}
            onBlur={e => e.target.style.boxShadow = "none"} />
      }
    </div>
  );
}

function DraftReplyEditor({ action, onChange }) {
  return (
    <div>
      <FieldInput label="To" value={action.to} onChange={v => onChange({ ...action, to: v })} />
      <FieldInput label="Subject" value={action.subject} onChange={v => onChange({ ...action, subject: v })} />
      <FieldInput label="Body" value={action.body} onChange={v => onChange({ ...action, body: v })} multiline rows={6} />
    </div>
  );
}

function CalendarEventEditor({ action, onChange }) {
  return (
    <div>
      <FieldInput label="Event title" value={action.title || ""} onChange={v => onChange({ ...action, title: v })} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {[["Date", "date"], ["Start", "startTime"], ["End", "endTime"]].map(([l, k]) => (
          <FieldInput key={k} label={l} value={action[k] || ""} onChange={v => onChange({ ...action, [k]: v })} />
        ))}
      </div>
      <FieldInput label="Location" value={action.location || ""} onChange={v => onChange({ ...action, location: v })} />
      <FieldInput label="Description" value={action.description || ""} onChange={v => onChange({ ...action, description: v })} multiline rows={2} />
    </div>
  );
}

function TaskListEditor({ action, onChange }) {
  const setTask = (i, val) => { const t = [...action.tasks]; t[i] = val; onChange({ ...action, tasks: t }); };
  const addTask = () => onChange({ ...action, tasks: [...action.tasks, ""] });
  const removeTask = (i) => onChange({ ...action, tasks: action.tasks.filter((_, idx) => idx !== i) });
  return (
    <div>
      {action.tasks.map((task, i) => (
        <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
          <span style={{ color: "var(--primary)", fontSize: 14, flexShrink: 0 }}>◆</span>
          <input value={task} onChange={e => setTask(i, e.target.value)}
            style={{
              flex: 1, background: "var(--surface-container-low)",
              border: "none", borderRadius: "var(--radius)",
              padding: "7px 11px", color: "var(--on-surface)", fontSize: 13,
              outline: "none",
            }}
            onFocus={e => e.target.style.boxShadow = "0 0 0 2px rgba(53,37,205,0.4)"}
            onBlur={e => e.target.style.boxShadow = "none"}
          />
          <button onClick={() => removeTask(i)}
            style={{ color: "var(--outline)", fontSize: 18, padding: "0 4px", lineHeight: 1 }}>×</button>
        </div>
      ))}
      <button onClick={addTask} style={{
        fontSize: 12, color: "var(--primary)",
        background: "var(--primary-dim)",
        padding: "5px 14px", borderRadius: "var(--radius-full)",
        fontWeight: 600, marginTop: 4,
        fontFamily: "var(--font-display)",
      }}>+ Add task</button>
    </div>
  );
}

export default function ActionPanel({ emailId, triage, onApproved }) {
  const [action, setAction] = useState(triage.action);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const typeLabel = { draft_reply: "Draft Reply", calendar_event: "Calendar Event", task_list: "Task List" };

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approveAction(emailId, triage.actionType, action);
      setDone(true);
      onApproved?.();
    } catch (e) {
      alert("Approval failed: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{
        textAlign: "center", padding: "32px 0",
        background: "var(--fyi-bg)", borderRadius: "var(--radius-md)",
      }}>
        <div style={{ fontSize: 28, marginBottom: 10, color: "var(--fyi)" }}>✓</div>
        <p style={{ color: "var(--fyi-text)", fontWeight: 600, fontFamily: "var(--font-display)" }}>Action executed</p>
        <p style={{ color: "var(--outline)", fontSize: 12, marginTop: 4 }}>
          {triage.actionType === "draft_reply" && `Reply sent to ${action.to}`}
          {triage.actionType === "calendar_event" && `"${action.title}" added to calendar`}
          {triage.actionType === "task_list" && `${action.tasks.length} tasks created`}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <IntelligenceChip label={typeLabel[triage.actionType]} />
        <span style={{ fontSize: 11, color: "var(--outline)" }}>AI-prepared · review before approving</span>
      </div>

      {triage.actionType === "draft_reply" && <DraftReplyEditor action={action} onChange={setAction} />}
      {triage.actionType === "calendar_event" && <CalendarEventEditor action={action} onChange={setAction} />}
      {triage.actionType === "task_list" && <TaskListEditor action={action} onChange={setAction} />}

      <div style={{ marginTop: 20 }}>
        <AgentButton onClick={handleApprove} disabled={loading}>
          {loading ? "Executing…" : "Approve & Execute →"}
        </AgentButton>
      </div>
    </div>
  );
}
