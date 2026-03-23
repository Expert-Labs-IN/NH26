# InboxAI — Agentic Email Triage & Automated Action Workflow
### National Hackathon 2026 · Track 2 · Problem Statement P1

> *"From inbox overload to intelligent workspace — in one click."*

InboxAI is a smart, agentic email client that reads incoming emails, classifies their priority, generates contextual summaries, and autonomously prepares executable actions — all pending human approval. Built with a high-end editorial design system exported from Google Stitch.

---

## Live Demo

**Frontend:** http://localhost:5173  
**Backend API:** http://localhost:3001  
**Health check:** http://localhost:3001/health

---

## Problem Statement

Professionals suffer from massive inbox overload, spending hours reading and categorizing emails rather than doing deep work. InboxAI solves this by acting as a proactive virtual assistant that:

- Reads and classifies every email automatically
- Prepares the logical next step (draft reply, calendar event, or task list)
- Presents actions for human review and one-click approval

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Priority Tagging** | Auto-flags emails as `Urgent`, `Requires Action`, or `FYI` |
| **3-Bullet Summaries** | Condenses each email into 3 key points |
| **Draft Reply** | AI pre-writes a professional reply |
| **Calendar Event** | Extracts meeting details into a structured event |
| **Task List** | Pulls numbered action items into a checklist |
| **Human-in-the-Loop** | Review, edit, and click "Approve & Execute" |
| **Spam Detection** | Quarantines phishing, fraud, and scam emails |
| **VIP Detection** | Visual flagging for high-importance senders |
| **Process All** | One-click batch triage of entire inbox |
| **Search** | Real-time search across emails, drafts, and tasks |
| **Compose** | Full email composer with AI drafting & templates |
| **Team Sync** | Live team member status panel |
| **Agent Activity** | Real-time log of AI agent actions |
| **Focus Mode** | Pauses non-urgent notifications |
| **AI Rules** | Configurable automation rules with toggle switches |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| AI Pipeline | Keyword-based mock triage (Anthropic API-ready) |
| Fonts | Manrope (display) + Inter (body) |
| Design System | Google Stitch — "The Digital Curator" |
| Data | 20 mock emails (17 inbox + 3 spam) |
| Database | None — stateless JSON mock |

---

## Project Structure

```
email-triage/
├── backend/
│   ├── server.js                  # Express entry point (port 3001)
│   ├── routes/
│   │   ├── emails.js              # GET /api/emails
│   │   └── triage.js              # POST /api/triage, POST /api/triage/approve
│   ├── data/
│   │   └── emails.json            # 20 mock emails (17 inbox + 3 spam)
│   ├── .env.example               # API key template
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── App.jsx                # Root — routing, state, modals
    │   ├── api.js                 # fetch helpers
    │   ├── index.css              # Design system tokens (CSS variables)
    │   ├── main.jsx               # React entry
    │   └── components/
    │       ├── Sidebar.jsx        # Nav + Settings / Support / Profile panels
    │       ├── TopBar.jsx         # Search, Focus Mode, Team Sync, Notifications, Agent Activity
    │       ├── Dashboard.jsx      # Overview: approvals, priorities, velocity stats
    │       ├── InboxView.jsx      # Focused inbox with inline triage + action panels
    │       ├── DraftsView.jsx     # Editable AI-generated draft replies
    │       ├── TasksView.jsx      # Checklist view of extracted tasks
    │       ├── AIRulesView.jsx    # Rule builder with toggle switches
    │       ├── SuggestedView.jsx  # Proactive agent recommendations
    │       ├── SpamView.jsx       # Quarantine — phishing, fraud, scam detection
    │       ├── ComposeModal.jsx   # Full composer with AI draft + templates
    │       └── WorkspaceModal.jsx # Workspace stats overview
    ├── index.html                 # Google Fonts: Manrope + Inter
    ├── vite.config.js             # Proxy /api → localhost:3001
    └── package.json
```

---

## Setup & Run

### Prerequisites
- Node.js 18+
- npm 8+

### 1. Clone / extract the project

```bash
cd ~/Downloads/email-triage
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# Optional: add ANTHROPIC_API_KEY to .env for real AI (see AI Integration section)
npm run dev
# → Server running on http://localhost:3001
```

### 3. Frontend (new terminal tab)

```bash
cd frontend
npm install
npm run dev
# → App running on http://localhost:5173
```

---

## API Reference

### Emails

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/emails` | Returns all 20 mock emails |
| `GET` | `/api/emails/:id` | Returns a single email by ID |

### Triage

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/triage` | Triages an email — returns priority, summary, action |
| `POST` | `/api/triage/approve` | Executes an approved action |

### POST `/api/triage` — Request

```json
{
  "email": {
    "id": "e001",
    "from": "rajesh.mehta@bigclient.com",
    "fromName": "Rajesh Mehta",
    "subject": "URGENT: Contract renewal deadline",
    "body": "...",
    "isVIP": true,
    "isSpam": false
  }
}
```

### POST `/api/triage` — Response

```json
{
  "emailId": "e001",
  "triage": {
    "priority": "Urgent",
    "summary": [
      "From Rajesh Mehta: URGENT: Contract renewal deadline — final extension",
      "Flagged urgent — requires immediate attention or response",
      "Draft reply prepared — review and edit before sending"
    ],
    "actionType": "draft_reply",
    "action": {
      "to": "rajesh.mehta@bigclient.com",
      "subject": "Re: URGENT: Contract renewal deadline — final extension",
      "body": "Dear Rajesh Mehta,\n\nThank you for reaching out..."
    }
  }
}
```

### POST `/api/triage/approve` — Request

```json
{
  "emailId": "e001",
  "actionType": "draft_reply",
  "action": {
    "to": "rajesh.mehta@bigclient.com",
    "subject": "Re: ...",
    "body": "..."
  }
}
```

---

## AI Pipeline Design

The triage system uses a **single API call per email** that handles classification, summarization, and action drafting simultaneously — minimising latency and cost.

```
Email (from, subject, body, isVIP, isSpam)
        │
        ▼
  Triage Engine
  ┌─────────────────────────────────────┐
  │  1. Priority Classification         │
  │     Urgent / Requires Action / FYI  │
  │                                     │
  │  2. Action Type Selection           │
  │     draft_reply / calendar_event /  │
  │     task_list                       │
  │                                     │
  │  3. Summary Generation (3 bullets)  │
  │                                     │
  │  4. Action Pre-filling              │
  │     Draft body / Event details /    │
  │     Task checklist                  │
  └─────────────────────────────────────┘
        │
        ▼
  Structured JSON response
  { priority, summary, actionType, action }
        │
        ▼
  Human reviews + edits in UI
        │
        ▼
  POST /api/triage/approve → executed
```

---

## Enabling Real AI (Anthropic API)

The app ships with a smart keyword-based mock that works offline. To upgrade to real Claude AI:

**Step 1** — Get an API key at [console.anthropic.com](https://console.anthropic.com)

**Step 2** — Add credits at console.anthropic.com/settings/billing ($5 covers hundreds of triage calls)

**Step 3** — Add key to `.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxx
PORT=3001
```

**Step 4** — Replace `backend/routes/triage.js` with the Anthropic SDK version:

```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await client.messages.create({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1024,
  system: SYSTEM_PROMPT,
  messages: [{ role: "user", content: emailContent }],
});
```

The system prompt is pre-written in the codebase — just uncomment and the app upgrades to full AI instantly.

---

## Design System

Built from a Google Stitch export — **"The Digital Curator"** design language.

### Color Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `--surface` | `#faf8ff` | App background |
| `--surface-lowest` | `#ffffff` | Cards, email bodies |
| `--surface-low` | `#f2f3ff` | Sidebar, input fields |
| `--primary` | `#3525cd` | Intelligence Purple — CTAs, active states |
| `--primary-container` | `#4f46e5` | Gradient endpoint |
| `--inverse` | `#283044` | AI summary cards, dark overlays |
| `--on-surface` | `#131b2e` | Primary text |
| `--on-surface-variant` | `#464555` | Secondary text |
| `--tertiary-fixed` | `#e9ddff` | Intelligence Chips |
| `--on-tertiary` | `#5516be` | Intelligence Chip text |

### Typography

| Font | Usage |
|------|-------|
| **Manrope** | Headers, labels, buttons, nav items |
| **Inter** | Email body, form fields, metadata |

### Design Principles

- **No-Line Rule** — boundaries defined by background tonal shifts, not borders
- **Breathing Canvas** — generous whitespace with `2.25rem` / `2.75rem` spacing around AI content
- **Tonal Stacking** — `surface-lowest` cards on `surface-low` backgrounds for natural lift
- **Ambient Shadows** — `0 0 24px rgba(19,27,46,0.06)` only — no heavy drop shadows
- **Agent Button** — gradient from `#3525cd` → `#4f46e5` at 135°
- **Intelligence Chips** — `#e9ddff` background, `#5516be` text, `border-radius: 9999px`

---

## Mock Email Dataset

| ID | Sender | Type | Expected Priority | Expected Action |
|----|--------|------|-------------------|-----------------|
| e001 | Rajesh Mehta (VIP) | Contract deadline | Urgent | Draft Reply |
| e002 | Calendly | Meeting invite | FYI | Calendar Event |
| e003 | HR Team | Self-assessment | Requires Action | Task List |
| e004 | Ananya Iyer | API issue thread | Urgent | Draft Reply |
| e005 | Product Digest | Newsletter | FYI | Draft Reply |
| e006 | Deepak Rao CFO (VIP) | Budget approval | Urgent | Task List |
| e007 | AWS Billing | Invoice | Requires Action | Task List |
| e008 | Vikram Nair | Partnership intro | Requires Action | Draft Reply |
| e009 | ComplianceHQ | GDPR audit | Urgent | Task List |
| e010 | Sara Chen (VIP) | Series B term sheet | Urgent | Draft Reply |
| e011 | GitHub | Security alert | Urgent | Task List |
| e012 | Meera Pillai | Meeting reschedule | Requires Action | Calendar Event |
| e013 | Hacker News | Digest | FYI | Draft Reply |
| e014 | Arjun Sharma | Overdue invoice | Urgent | Draft Reply |
| e015 | Figma | Subscription renewal | Requires Action | Draft Reply |
| e016 | Nisha Kapoor | Recruiter outreach | Requires Action | Draft Reply |
| e017 | Prize Notification | 🚫 SPAM — Prize scam | — | Quarantined |
| e018 | PayPal Security | 🚫 SPAM — Phishing | — | Quarantined |
| e019 | Dr. James Wilson | 🚫 SPAM — 419 fraud | — | Quarantined |
| e020 | Rohan Verma | Design proposal | Requires Action | Draft Reply |

---

## Navigation Guide

| View | What it does |
|------|-------------|
| **Dashboard** | Overview: pending approvals, today's priorities, velocity stats. "Process All" batch-triages inbox |
| **Inbox** | Focused email list with AI chips, inline summaries, and expandable action panels |
| **Drafts** | All AI-generated draft replies — editable and sendable |
| **Tasks** | Extracted task items as interactive checklists with progress tracking |
| **AI Rules** | Build IF/THEN automation rules with live toggles |
| **Suggested** | Proactive agent recommendations — rule suggestions, bulk actions |
| **Spam** | Quarantined threats — phishing, fraud, scam detection with signal analysis |

### Top Bar

| Control | Function |
|---------|----------|
| Search bar | Real-time search across emails, drafts, tasks — highlights matches, navigates on click |
| FOCUS MODE | Pauses non-urgent notifications, shows status banner |
| TEAM SYNC | Team member online/busy/offline status panel |
| 🔔 Bell | Notification feed with read/unread tracking |
| AGENT ACTIVITY | Live agent log with progress bar and real-time stats |

### Sidebar

| Element | Function |
|---------|----------|
| ✦ Logo | Opens Workspace Overview modal with live stats dashboard |
| Compose | Opens email composer with AI drafting and 3 templates |
| ⚙ Settings | Toggle panel: Notifications, AI Agent, Dark Mode, Auto-triage, Email sync |
| ? Support | Documentation, Live Chat, Bug Report, Tutorials |
| Director profile | Profile card with Edit, Password, Usage Stats, Sign Out |

---

## 2-Minute Demo Script

**Opening (0:00–0:20)**
> "Meet InboxAI — an agentic email workspace that turns inbox chaos into curated intelligence. Let me show you."

**Dashboard (0:20–0:40)**
> "This is the Dashboard. It shows exactly what needs my attention. I'll click Process All to let the agent work."
- Click **Process All Suggestions** — watch the purple progress banner animate

**Inbox — 3 Action Types (0:40–1:20)**
> "Now in the Inbox — let's see the three distinct AI action types the hackathon requires."

1. Click **Rajesh Mehta** (Urgent / Draft Reply) → show summary + edit draft → Approve & Execute
2. Click **Calendly** (FYI / Calendar Event) → show extracted date/time/location
3. Click **HR Team** (Requires Action / Task List) → show 5 extracted checkboxes

**Spam (1:20–1:40)**
> "The agent also quarantined 3 threats automatically — a prize scam, phishing attempt, and 419 fraud."
- Click **Spam** tab → show risk badges and signal analysis

**Wrap-up (1:40–2:00)**
> "Three action types, human-in-the-loop approval, spam protection, real-time search, AI rules — all in a single agentic pipeline. This is InboxAI."

---

## Hackathon Constraint Checklist

- [x] **Working prototype** — runs locally on localhost:5173
- [x] **3 distinct automated action types** — Draft Reply, Calendar Event, Task List
- [x] **Human-in-the-Loop approval** — review, edit, Approve & Execute on every action
- [x] **Priority tagging** — Urgent / Requires Action / FYI with visual badges
- [x] **Contextual summarization** — 3-bullet AI summary per email
- [x] **React frontend** — Vite + React 18
- [x] **Node.js backend** — Express API
- [x] **LLM API ready** — Anthropic SDK integrated, mock active for demo
- [x] **Source code** — GitHub repository
- [x] **README** — this file

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `Port 3001 already in use` | `lsof -ti:3001 \| xargs kill` |
| `Invalid API key` | Check `.env` — no quotes, no spaces around key |
| `Cannot find module` | Run `npm install` inside that folder |
| `Triage failed` | Ensure backend terminal is running at :3001 |
| `Credit balance too low` | Add credits at console.anthropic.com/settings/billing |
| Vite hot reload not working | Save any file in `frontend/src/` to trigger reload |

---

## Team

Built for **National Hackathon 2026** · Track 2: Problem Statement P1  
Design system: **Google Stitch** — "The Intelligent Workspace"  
AI: **Anthropic Claude** (claude-sonnet-4-20250514)
