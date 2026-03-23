# 🎬 Demo Script — TriageAI
**Judge Presentation · National Hackathon 2026 · Target time: 90 seconds**

---

## Before You Start

- [ ] App is open at `http://localhost:5173` (or Vercel URL)
- [ ] Backend running at `http://localhost:3001`
- [ ] Ollama running (`OLLAMA_ORIGINS=* ollama serve`)
- [ ] Browser is Chrome, DevTools closed
- [ ] Screen is 1440px wide
- [ ] Dark mode is OFF (start in light mode for visibility)

---

## Step 1 — Open the App (5 seconds)

**Action:** Point to the inbox on the left.

**Say:**
> "This is TriageAI — an agentic email assistant. You can see 10 emails in the inbox, already classified by urgency. Red is Urgent, amber is Requires Action, blue is FYI."

---

## Step 2 — Click email_001 — CEO Contract (20 seconds)

**Action:** Click the first email — "URGENT: Contract Review Needed by EOD"

**Say:**
> "Watch what happens when I click this email from the CEO. The AI triages it in real time."

**Wait** for the triage panel to populate (or point to pre-loaded result).

**Say:**
> "Instant three-point summary. The AI has understood that this is a $2.4 million deal with a 5pm deadline today — and classified it as Urgent."

---

## Step 3 — Point to the 3 Action Cards (20 seconds)

**Action:** Scroll down slightly to show all three cards.

**Say:**
> "The AI hasn't just summarised the email. It has drafted a reply, created a calendar event, and extracted three action items — all pre-filled and ready to go."

**Point to each card as you name it.**

---

## Step 4 — Edit the Reply (10 seconds)

**Action:** Click **Edit** on the Reply Draft card. Change one word.

**Say:**
> "Everything is editable before you approve. I can change the reply text, the meeting time, the task items — whatever I need."

---

## Step 5 — Approve & Execute (10 seconds)

**Action:** Click **Approve & Execute** on the Reply card.

**Say:**
> "Human in the loop. Nothing happens without my approval. When I click this, the action is logged."

**Point to the toast notification bottom-right.**

---

## Step 6 — Open Audit Log (5 seconds)

**Action:** Click the 📋 icon in the header.

**Say:**
> "Every action I approve or reject is recorded in the session audit log — full transparency."

---

## Step 7 — Click email_005 — FYI Newsletter (10 seconds)

**Action:** Click email_005 "This Week in AI"

**Say:**
> "Now watch this — a newsletter. The AI knows no meeting is needed here, so no calendar event is suggested. It's just tagged FYI."

---

## Step 8 — Show Filters (5 seconds)

**Action:** Click the **Urgent** filter tab.

**Say:**
> "I can filter by priority instantly. Four urgent emails, all sorted to the top."

---

## Step 9 — GitHub (5 seconds)

**Action:** Open browser tab to the GitHub repo.

**Say:**
> "Full codebase — React frontend, Express backend, Ollama integration, Groq fallback. All documented and runnable in three commands."

---

## ⏱ Total: ~90 seconds

---

## Backup Lines (if questions asked)

**"How does the AI decide urgency?"**
> "The prompt instructs the model to look for CEO or VIP senders, legal or financial keywords, and same-day deadlines. It returns a confidence score with every result."

**"What if the AI is wrong?"**
> "The human always reviews and can edit before approving. Nothing executes automatically — that's the core design principle."

**"What model is it using?"**
> "Ollama running qwen2.5:7b locally on this machine. If Ollama is unavailable, it falls back to Groq's cloud API transparently. The backend never exposes the API key to the client."

**"Could this work with real emails?"**
> "Yes — Phase 2 of the roadmap is OAuth integration with Gmail and Outlook. The prompt engine and triage logic are completely model-agnostic."
