import express from "express";
import pool from "../db/database.js";

export const triageRouter = express.Router();

function mockTriage(email) {
  const subject = (email.subject || "").toLowerCase();
  const body = (email.body || "").toLowerCase();
  const combined = subject + " " + body;

  let priority = "FYI";
  if (email.isVIP || combined.includes("urgent") || combined.includes("legal") ||
      combined.includes("escalate") || combined.includes("deadline") ||
      combined.includes("suspend") || combined.includes("broken") ||
      combined.includes("sign-off") || combined.includes("approval needed") ||
      combined.includes("vulnerability") || combined.includes("security alert") ||
      combined.includes("overdue") || combined.includes("term sheet") ||
      combined.includes("gdpr") || combined.includes("audit notice") ||
      combined.includes("series b")) {
    priority = "Urgent";
  } else if (combined.includes("action required") || combined.includes("submit") ||
             combined.includes("approve") || combined.includes("complete") ||
             combined.includes("please complete") || combined.includes("required") ||
             combined.includes("reminder") || combined.includes("renews") ||
             combined.includes("reschedule") || combined.includes("payment") ||
             combined.includes("invoice") || combined.includes("update billing") ||
             combined.includes("open to a")) {
    priority = "Requires Action";
  }

  let actionType = "draft_reply";
  if (combined.includes("has scheduled") || combined.includes("new meeting") ||
      combined.includes("date:") || combined.includes("time:") ||
      combined.includes("3:00 pm") || combined.includes("10:00 am") ||
      combined.includes("meet.google") || combined.includes("zoom.us") ||
      combined.includes("reschedule") || combined.includes("onboarding call")) {
    actionType = "calendar_event";
  } else if (/^\s*\d+\./m.test(email.body) ||
             combined.includes("please complete the following") ||
             combined.includes("you are required to provide") ||
             combined.includes("top services") || combined.includes("key line items")) {
    actionType = "task_list";
  }

  const summary = [
    `From ${email.fromName}: ${email.subject.slice(0, 70)}`,
    priority === "Urgent"
      ? "Flagged urgent — requires immediate attention or response"
      : priority === "Requires Action"
      ? "Action needed — review, complete, or respond to this email"
      : "Informational only — no response required",
    actionType === "calendar_event"
      ? "Meeting or event details extracted and ready to add to calendar"
      : actionType === "task_list"
      ? "Action items identified and compiled into a task checklist"
      : "Draft reply prepared — review and edit before sending",
  ];

  let action;
  if (actionType === "draft_reply") {
    action = {
      to: email.from,
      subject: `Re: ${email.subject}`,
      body: email.isVIP
        ? `Dear ${email.fromName},\n\nThank you for reaching out. I want to assure you that this matter has my full and immediate attention. I am coordinating with the relevant stakeholders internally and will revert with a detailed response by end of day.\n\nI appreciate your patience.\n\nBest regards`
        : priority === "Urgent"
        ? `Dear ${email.fromName},\n\nThank you for flagging this. I understand the urgency and am looking into it immediately. I will coordinate with the relevant team and get back to you with a concrete update as soon as possible.\n\nBest regards`
        : `Dear ${email.fromName},\n\nThank you for your email. I have reviewed your message and will follow up with a detailed response shortly.\n\nBest regards`,
    };
  } else if (actionType === "calendar_event") {
    const dateMatch = email.body.match(/(\w+day,?\s+\w+\s+\d+,?\s+\d{4})/i);
    const timeMatch = email.body.match(/(\d{1,2}:\d{2}\s*[AP]M)/gi);
    const locationMatch = email.body.match(/(meet\.google\.com\/\S+|zoom\.us\/j\/\S+)/i);
    action = {
      title: email.subject.replace(/^(re:|fwd:|new meeting scheduled:\s*)/i, "").trim(),
      date: dateMatch ? dateMatch[1] : "2026-03-25",
      startTime: timeMatch ? timeMatch[0] : "10:00 AM",
      endTime: timeMatch && timeMatch[1] ? timeMatch[1] : "11:00 AM",
      location: locationMatch ? locationMatch[1] : "",
      description: `Scheduled with ${email.fromName}`,
    };
  } else {
    const lines = email.body.split("\n")
      .filter(l => /^\s*\d+\./.test(l))
      .map(l => l.replace(/^\s*\d+\.\s*/, "").trim())
      .filter(Boolean);
    action = {
      tasks: lines.length > 0
        ? lines
        : [`Review message from ${email.fromName}`, `Reply to: ${email.subject}`, "Follow up if no response within 24 hours"],
    };
  }

  return { priority, summary, actionType, action };
}

triageRouter.post("/", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "email is required" });

  await new Promise(r => setTimeout(r, 600));
  const triage = mockTriage(email);

  // Persist triage result to MySQL
  try {
    await pool.query(
      `INSERT INTO triage_results
         (email_id, priority, summary_1, summary_2, summary_3, action_type, action_data)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         priority=VALUES(priority), summary_1=VALUES(summary_1),
         summary_2=VALUES(summary_2), summary_3=VALUES(summary_3),
         action_type=VALUES(action_type), action_data=VALUES(action_data),
         triaged_at=CURRENT_TIMESTAMP`,
      [email.id, triage.priority,
       triage.summary[0], triage.summary[1], triage.summary[2],
       triage.actionType, JSON.stringify(triage.action)]
    );
  } catch (err) {
    console.warn("Could not persist triage result:", err.message);
  }

  res.json({ emailId: email.id, triage });
});

triageRouter.post("/approve", async (req, res) => {
  const { emailId, actionType, action } = req.body;
  if (!emailId || !actionType || !action) {
    return res.status(400).json({ error: "emailId, actionType, action required" });
  }

  const results = {
    draft_reply:    () => ({ success: true, message: `Reply sent to ${action.to}`, detail: action }),
    calendar_event: () => ({ success: true, message: `Event "${action.title}" added to calendar on ${action.date}`, detail: action }),
    task_list:      () => ({ success: true, message: `${action.tasks.length} tasks added to your task list`, detail: action }),
  };

  const handler = results[actionType];
  if (!handler) return res.status(400).json({ error: "Unknown actionType" });

  const result = handler();

  // Persist approval to MySQL
  try {
    await pool.query(
      `INSERT INTO approved_actions (email_id, action_type, action_data, result)
       VALUES (?, ?, ?, ?)`,
      [emailId, actionType, JSON.stringify(action), JSON.stringify(result)]
    );
  } catch (err) {
    console.warn("Could not persist approved action:", err.message);
  }

  res.json({ emailId, result });
});

// GET triage history from DB
triageRouter.get("/history", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT tr.*, e.from_name, e.subject
       FROM triage_results tr
       JOIN emails e ON e.id = tr.email_id
       ORDER BY tr.triaged_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET approved actions history
triageRouter.get("/approved", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT aa.*, e.from_name, e.subject
       FROM approved_actions aa
       JOIN emails e ON e.id = aa.email_id
       ORDER BY aa.approved_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
