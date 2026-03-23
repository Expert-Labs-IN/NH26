# NexMail — Agentic AI Email Triage System

NexMail is a full-stack AI-powered email triage application. It automatically analyzes your inbox, classifies email priority, summarises threads, and suggests actions — including creating calendar events, task lists, or drafting and sending reply emails — all with human-in-the-loop approval.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| AI | Google Gemini 2.5 Flash (`@google/genai`) |
| Gmail / Calendar | Google APIs (OAuth 2.0) |

---

## Features

- **AI Triage** — Classify emails as `Urgent`, `Action Required`, or `FYI` with a 3-bullet summary
- **Suggested Actions** — AI picks the right action type: `reply`, `calendar`, or `task`
- **AI Draft Reply + Send** — Review and edit the AI-drafted reply, then send it directly via Gmail
- **Google Calendar Integration** — Create calendar events from meeting request emails
- **Gmail Sync** — Pull real emails from your Gmail inbox via OAuth
- **Real-time Simulation** — Mock emails drip into the inbox to simulate live mail
- **Notifications** — In-app notification feed for sent replies, calendar events, and scans
- **Analytics Dashboard** — Stats on triaged, approved, ignored, and pending emails

---

## Project Structure

```
NexMail/
├── backend/
│   └── src/
│       ├── server.js              # Express app + all API routes
│       ├── config/
│       │   └── db.js              # MongoDB connection
│       ├── models/
│       │   ├── Email.js           # Email + triage schema
│       │   ├── Notification.js    # Notification schema
│       │   └── UserConfig.js      # Google OAuth token storage
│       ├── services/
│       │   ├── aiService.js       # Gemini AI triage pipeline
│       │   ├── calendarService.js # Google Calendar helpers
│       │   └── notificationService.js
│       ├── controllers/
│       │   └── emailController.js
│       ├── routes/
│       │   └── emailRoutes.js
│       └── data/
│           └── mock_emails.json   # Seed data
└── frontend/
    └── src/
        ├── pages/
        │   ├── Inbox.jsx          # Main inbox + email detail view
        │   ├── Analytics.jsx      # Stats dashboard
        │   ├── Calendar.jsx       # Upcoming events
        │   ├── Settings.jsx       # Gmail connect + preferences
        │   └── Landing.jsx        # Marketing landing page
        ├── components/
        │   └── DraftReplyModal.jsx # AI draft review + send modal
        └── services/
            └── api.js             # Axios API client
```

---

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Google AI Studio API key (`GEMINI_API_KEY`)
- Google Cloud project with Gmail & Calendar APIs enabled (for OAuth features)

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/nexmail

# Google Gemini
GEMINI_API_KEY=your_gemini_key_here

# Google OAuth (for Gmail sync + Calendar + Send Reply)
GMAIL_CLIENT_ID=your_client_id
GMAIL_CLIENT_SECRET=your_client_secret
GMAIL_REDIRECT_URI=http://localhost:3000/api/auth/callback
```

```bash
npm run dev
```

Backend runs at: `http://localhost:3000`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API Endpoints

### Emails
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/emails` | List all emails (+ Gmail connection status) |
| `GET` | `/api/emails/:id` | Get a single email |
| `POST` | `/api/triage/:id` | Run AI triage on an email |
| `PATCH` | `/api/actions/approve` | Approve a triage action |
| `PATCH` | `/api/emails/:id/ignore` | Ignore an email |
| `POST` | `/api/emails/:id/send-reply` | Send the AI-drafted reply via Gmail |
| `GET` | `/api/stats` | Triage statistics |

### Gmail & Calendar
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/google` | Start Google OAuth flow |
| `GET` | `/api/auth/callback` | OAuth callback |
| `POST` | `/api/gmail/sync` | Pull latest emails from Gmail |
| `POST` | `/api/emails/scan-calendar` | Bulk-triage untriaged emails |
| `POST` | `/api/calendar/create` | Create a Google Calendar event |
| `GET` | `/api/calendar/events` | List upcoming calendar events |

### Notifications
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/notifications` | Get all notifications |
| `PATCH` | `/api/notifications/:id/read` | Mark notification as read |

---

## AI Triage Response Schema

```json
{
  "summary": ["Bullet 1", "Bullet 2", "Bullet 3"],
  "priority": "Urgent | Action Required | FYI",
  "suggestedAction": {
    "type": "reply | calendar | task",
    "payload": {
      "text": "Draft reply text (for reply type)",
      "title": "Event title (for calendar type)",
      "tasks": [{ "taskName": "...", "dueDate": "YYYY-MM-DD" }]
    }
  },
  "reasoning": "Why this action was chosen."
}
```

---

## Connecting Gmail

1. Go to **Settings** in the app and click **Connect Gmail**
2. Sign in with your Google account and grant the requested permissions:
   - `gmail.readonly` — to sync your inbox
   - `gmail.send` — to send draft replies
   - `calendar.events` — to create calendar events
3. After connecting, use **Sync Gmail** to pull your latest emails

> **Note:** If you previously connected Gmail, you may need to re-authorize to grant the `gmail.send` scope added in the latest update.

---

## Health Check

```
GET http://localhost:3000/health
```

```json
{ "status": "ok", "timestamp": "...", "storage": "mongodb" }
```
