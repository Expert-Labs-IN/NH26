import express from "express";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import pool from "../db/database.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const jsonEmails = JSON.parse(
  readFileSync(join(__dirname, "../data/emails.json"), "utf-8")
);

export const emailsRouter = express.Router();

function rowToEmail(row, threads = []) {
  return {
    id:          row.id,
    from:        row.from_email,
    fromName:    row.from_name,
    to:          row.to_email,
    subject:     row.subject,
    body:        row.body,
    receivedAt:  row.received_at instanceof Date
                   ? row.received_at.toISOString()
                   : row.received_at,
    isVIP:       !!row.is_vip,
    isSpam:      !!row.is_spam,
    thread:      threads,
  };
}

emailsRouter.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM emails ORDER BY received_at DESC");
    const [threadRows] = await pool.query("SELECT * FROM email_threads");

    const threadsByEmail = {};
    threadRows.forEach(t => {
      if (!threadsByEmail[t.email_id]) threadsByEmail[t.email_id] = [];
      threadsByEmail[t.email_id].push({
        from: t.from_email,
        date: t.thread_date instanceof Date
                ? t.thread_date.toISOString().split("T")[0]
                : t.thread_date,
        snippet: t.snippet,
      });
    });

    res.json(rows.map(r => rowToEmail(r, threadsByEmail[r.id] || [])));
  } catch (err) {
    console.warn("DB error, using JSON fallback:", err.message);
    res.json(jsonEmails);
  }
});

emailsRouter.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM emails WHERE id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Email not found" });

    const [threads] = await pool.query(
      "SELECT * FROM email_threads WHERE email_id = ? ORDER BY thread_date ASC",
      [req.params.id]
    );
    res.json(rowToEmail(rows[0], threads.map(t => ({
      from: t.from_email,
      date: t.thread_date instanceof Date
              ? t.thread_date.toISOString().split("T")[0]
              : t.thread_date,
      snippet: t.snippet,
    }))));
  } catch (err) {
    console.warn("DB error, using JSON fallback:", err.message);
    const email = jsonEmails.find(e => e.id === req.params.id);
    if (!email) return res.status(404).json({ error: "Email not found" });
    res.json(email);
  }
});
