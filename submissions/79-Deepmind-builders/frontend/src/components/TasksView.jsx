import { useState } from "react";

export default function TasksView({ emails, triageCache }) {
  const [checked, setChecked] = useState({});

  const taskEmails = emails
    .filter(e => triageCache[e.id]?.actionType === "task_list")
    .map(e => ({ email: e, triage: triageCache[e.id] }));

  const allTasks = taskEmails.flatMap(({ email, triage }) =>
    (triage.action?.tasks || []).map((task, i) => ({
      id: `${email.id}-${i}`,
      task,
      from: email.fromName,
      subject: email.subject,
      priority: triage.priority,
    }))
  );

  const toggle = (id) => setChecked(p => ({ ...p, [id]: !p[id] }));
  const done = allTasks.filter(t => checked[t.id]).length;

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", background: "#faf8ff" }}>
      <div style={{ marginBottom: 28, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ fontFamily: "'Manrope',sans-serif", fontSize: 26, fontWeight: 700, color: "#131b2e", letterSpacing: "-0.4px", marginBottom: 6 }}>Tasks</h1>
          <p style={{ color: "#464555", fontSize: 13 }}>
            {allTasks.length} task{allTasks.length !== 1 ? "s" : ""} extracted by your agent · {done} completed
          </p>
        </div>
        {allTasks.length > 0 && (
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 28, color: "#3525cd" }}>
              {allTasks.length > 0 ? Math.round((done / allTasks.length) * 100) : 0}%
            </div>
            <div style={{ fontSize: 11, color: "#787594", fontWeight: 600, letterSpacing: "0.05em" }}>COMPLETE</div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {allTasks.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ height: 6, background: "#e0e0ee", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: "9999px",
              background: "linear-gradient(135deg, #3525cd, #4f46e5)",
              width: `${Math.round((done / allTasks.length) * 100)}%`,
              transition: "width 0.4s ease",
            }} />
          </div>
        </div>
      )}

      {allTasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 16 }}>✓</div>
          <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 600, color: "#131b2e", marginBottom: 6 }}>No tasks yet</p>
          <p style={{ color: "#787594", fontSize: 13 }}>Analyse emails with task lists to extract action items here.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {taskEmails.map(({ email, triage }, gi) => (
            <div key={gi} style={{ background: "#ffffff", borderRadius: "16px", padding: "20px 24px", boxShadow: "0 0 24px rgba(19,27,46,0.06)", marginBottom: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <div style={{ width: 32, height: 32, borderRadius: "9999px", background: "linear-gradient(135deg, #3525cd, #4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                  {email.fromName[0]}
                </div>
                <div>
                  <p style={{ fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 13, color: "#131b2e" }}>{email.fromName}</p>
                  <p style={{ fontSize: 11, color: "#787594" }}>{email.subject.slice(0, 50)}</p>
                </div>
                {triage.priority === "Urgent" && (
                  <span style={{ marginLeft: "auto", background: "#fdf0ee", color: "#922b21", borderRadius: "9999px", padding: "3px 10px", fontSize: 10, fontWeight: 700, fontFamily: "'Manrope',sans-serif" }}>URGENT</span>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {(triage.action?.tasks || []).map((task, i) => {
                  const id = `${email.id}-${i}`;
                  const isDone = checked[id];
                  return (
                    <div key={i} onClick={() => toggle(id)} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "10px 14px", borderRadius: "9999px",
                      background: isDone ? "#edf7f2" : "#f2f3ff",
                      cursor: "pointer", transition: "all 0.2s",
                    }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
                        background: isDone ? "#1a6e3c" : "transparent",
                        border: isDone ? "none" : "2px solid #3525cd",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.2s",
                      }}>
                        {isDone && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                      </div>
                      <span style={{
                        fontSize: 13, color: isDone ? "#145c30" : "#131b2e",
                        textDecoration: isDone ? "line-through" : "none",
                        fontFamily: isDone ? "'Inter',sans-serif" : "'Inter',sans-serif",
                        transition: "all 0.2s",
                      }}>{task}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
