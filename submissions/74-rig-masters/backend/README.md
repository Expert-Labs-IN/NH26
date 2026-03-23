# Agentic AI Email Triage — Backend API

FastAPI + PostgreSQL + Gemini backend for the **Agentic AI Email Triage & Automated Action Workflow** system.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI (async) |
| Database | PostgreSQL via SQLAlchemy 2.0 (async) |
| Migrations | Alembic |
| AI | Google Gemini 1.5 Flash |
| HTTP Client | httpx (async) |
| Validation | Pydantic v2 |

---

## Project Structure

```
email-triage/
├── app/
│   ├── main.py                  # FastAPI app, lifespan, CORS, router registration
│   ├── database.py              # Async engine, session, Base, init_db
│   ├── core/
│   │   └── config.py            # Settings from .env
│   ├── models/
│   │   ├── email.py             # Email table
│   │   ├── action.py            # DraftedAction table
│   │   ├── event.py             # Event table
│   │   └── task.py              # Task table
│   ├── schemas/
│   │   ├── email.py             # Email Pydantic schemas
│   │   ├── action.py            # Action Pydantic schemas
│   │   └── event_task.py        # Event & Task Pydantic schemas
│   ├── routers/
│   │   ├── emails.py            # /api/emails
│   │   ├── ai.py                # /api/ai
│   │   ├── actions.py           # /api/actions
│   │   ├── events.py            # /api/events
│   │   └── tasks.py             # /api/tasks
│   └── services/
│       ├── gemini_service.py    # All Gemini API calls
│       ├── ingest_service.py    # JSON → DB ingestion
│       └── action_service.py   # Approve & Execute logic
├── alembic/
│   ├── env.py                   # Async-compatible alembic env
│   └── versions/                # Migration files
├── scripts/
│   └── mock_emails.json         # 10 mock emails for testing
├── alembic.ini
├── requirements.txt
└── .env.example
```

---

## Setup

### 1. Clone & install dependencies

```bash
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@localhost:5432/email_triage
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

Get your Gemini API key at: https://aistudio.google.com/app/apikey

### 3. Create the database

```bash
createdb email_triage
```

### 4. Run migrations

```bash
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

### 5. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

## API Endpoints

### 📧 Emails — `/api/emails`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/emails/ingest` | Upload mock_emails.json to populate DB (AI labels each email on ingest) |
| `GET` | `/api/emails/` | List all emails. Filter: `?priority=urgent\|requires_action\|fyi` `&is_read=true\|false` |
| `GET` | `/api/emails/{id}` | Get email. Auto-generates & caches 3-bullet summary on first open |
| `PATCH` | `/api/emails/{id}/read` | Mark read/unread → body: `{ "is_read": true }` |

### 🤖 AI — `/api/ai`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/ai/summarize/{email_id}` | Force-regenerate summary (refreshes cache) |
| `POST` | `/api/ai/draft/{email_id}` | Draft an action → body: `{ "action_type": "reply\|calendar_event\|task_extraction" }` |
| `POST` | `/api/ai/label/{email_id}` | Re-run priority labeling |

### ✏️ Actions — `/api/actions`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/actions/{email_id}` | Get all drafted actions for an email |
| `PATCH` | `/api/actions/{id}` | Edit action content → body: `{ "edited_content": {...} }` |
| `POST` | `/api/actions/{id}/regenerate` | Regenerate with custom prompt → body: `{ "prompt": "make it more formal" }` |
| `POST` | `/api/actions/{id}/approve` | Approve & execute (creates event/tasks or simulates send) |
| `POST` | `/api/actions/{id}/reject` | Reject action |

### 📅 Events — `/api/events`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events/` | List events. Filter: `?status=pending\|confirmed\|cancelled` |
| `GET` | `/api/events/{id}` | Get event |
| `PATCH` | `/api/events/{id}` | Update event details |
| `PATCH` | `/api/events/{id}/status` | Update status → body: `{ "status": "confirmed" }` |
| `DELETE` | `/api/events/{id}` | Delete event |

### ✅ Tasks — `/api/tasks`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tasks/` | List tasks. Filter: `?status=todo\|in_progress\|done` `&priority=urgent\|normal\|low` |
| `GET` | `/api/tasks/{id}` | Get task |
| `PATCH` | `/api/tasks/{id}` | Update task details |
| `PATCH` | `/api/tasks/{id}/status` | Update status → body: `{ "status": "in_progress" }` |
| `DELETE` | `/api/tasks/{id}` | Delete task |

---

## Typical Workflow

```
1. POST /api/emails/ingest          (upload mock_emails.json)
        ↓ Gemini labels each email as urgent / requires_action / fyi

2. GET /api/emails/?priority=urgent
        ↓ See filtered inbox

3. GET /api/emails/{id}
        ↓ Gemini auto-generates 3-bullet summary on first open

4. POST /api/ai/draft/{email_id}    body: { "action_type": "reply" }
        ↓ Gemini drafts a reply, stored as DraftedAction (status: pending)

5. PATCH /api/actions/{id}          (optional: manually edit)
   POST /api/actions/{id}/regenerate (optional: regenerate with custom prompt)

6. POST /api/actions/{id}/approve
        ↓ reply       → status=executed, execution_payload logged (simulated send)
        ↓ calendar_event → Event record created
        ↓ task_extraction → Task records bulk created
```

---

## Data Models

### Email
```
id, message_id, sender, recipient, subject, body,
received_at, priority_label, priority_reasoning,
summary_bullets (JSONB cached), is_read, raw_json
```

### DraftedAction
```
id, email_id, action_type, content (JSONB),
edited_content (JSONB), status,
executed_at, execution_payload (JSONB),
regeneration_prompt
```

### Event
```
id, email_id, title, description, location,
start_datetime, end_datetime, status
```

### Task
```
id, email_id, title, description,
due_date, priority, status
```

---

## Mock Email Dataset

`scripts/mock_emails.json` contains 10 realistic emails covering:
- Production server outage (→ urgent reply)
- Sprint planning meeting invite (→ calendar event)
- Contract with deadline (→ task extraction)
- Client escalation (→ reply)
- Security MFA deadline (→ task)
- HR review deadline (→ task)
- Partnership meeting request (→ calendar event / reply)
- Newsletter (→ fyi, no action)
