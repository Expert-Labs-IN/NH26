-- ============================================================
-- InboxAI — MySQL Database Schema
-- National Hackathon 2026 · P1
-- ============================================================

CREATE DATABASE IF NOT EXISTS inboxai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE inboxai;

-- ── Emails ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS emails (
  id            VARCHAR(10)   PRIMARY KEY,
  from_email    VARCHAR(255)  NOT NULL,
  from_name     VARCHAR(255)  NOT NULL,
  to_email      VARCHAR(255)  NOT NULL,
  subject       TEXT          NOT NULL,
  body          LONGTEXT      NOT NULL,
  received_at   DATETIME      NOT NULL,
  is_vip        TINYINT(1)    DEFAULT 0,
  is_spam       TINYINT(1)    DEFAULT 0,
  created_at    DATETIME      DEFAULT CURRENT_TIMESTAMP
);

-- ── Thread messages ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_threads (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  email_id      VARCHAR(10)   NOT NULL,
  from_email    VARCHAR(255)  NOT NULL,
  thread_date   DATE          NOT NULL,
  snippet       TEXT          NOT NULL,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);

-- ── Triage results ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS triage_results (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  email_id      VARCHAR(10)   NOT NULL UNIQUE,
  priority      ENUM('Urgent','Requires Action','FYI') NOT NULL,
  summary_1     TEXT          NOT NULL,
  summary_2     TEXT          NOT NULL,
  summary_3     TEXT          NOT NULL,
  action_type   ENUM('draft_reply','calendar_event','task_list') NOT NULL,
  action_data   JSON          NOT NULL,
  triaged_at    DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);

-- ── Approved actions ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approved_actions (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  email_id      VARCHAR(10)   NOT NULL,
  action_type   ENUM('draft_reply','calendar_event','task_list') NOT NULL,
  action_data   JSON          NOT NULL,
  result        JSON          NOT NULL,
  approved_at   DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);

-- ── Spam reports ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS spam_reports (
  id            INT           AUTO_INCREMENT PRIMARY KEY,
  email_id      VARCHAR(10)   NOT NULL,
  reported_at   DATETIME      DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
);
