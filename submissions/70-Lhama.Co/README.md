# TriageAI — Agentic Email Assistant

> **National Hackathon 2026** · Built by Fadil Faisal & Hamood Ayoob Khan

An AI-powered email triage system that reads incoming emails, understands context, classifies urgency, and autonomously prepares the three most likely next actions — reply draft, calendar event, and task list — for the user to approve with a single click.

**The human stays in control. The AI does the cognitive labour.**

---

## 🔗 Live Demo

| Service | URL |
|---------|-----|
| Frontend (Vercel) | `https://email-triage.vercel.app` |
| Backend (Railway) | `https://email-triage-api.railway.app` |
| Health Check | `https://email-triage-api.railway.app/api/health` |

> **No backend?** The frontend works standalone using pre-cached AI responses for all 10 demo emails.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🧠 **AI Triage** | Classifies every email as Urgent, Requires Action, or FYI |
| 📋 **3-Bullet Summary** | Concise AI-generated summary of each email |
| ✍️ **Reply Draft** | Context-aware professional reply, fully editable before sending |
| 📅 **Calendar Extraction** | Automatically detects meetings and creates calendar events |
| ✅ **Task List** | Extracts action items from email body |
| 👤 **Human-in-the-Loop** | Nothing executes without explicit user approval |
| 🕵️ **Audit Log** | Session timeline of every approved and rejected action |
| 🌙 **Dark Mode** | Full dark/light theme toggle |

---

## 🏗️ Architecture

```
┌─────────────────────┐     POST /api/triage      ┌──────────────────────┐
│                     │ ─────────────────────────► │                      │
│   React Frontend    │                            │   Express Backend    │
│   (Vite + Zustand)  │ ◄───────────────────────── │   (Node.js + TS)     │
│                     │     TriageResult JSON       │                      │
└─────────────────────┘                            └──────────┬───────────┘
                                                              │
                                              ┌───────────────┴──────────────┐
                                              │                              │
                                   ┌──────────▼──────────┐    ┌─────────────▼──────────┐
                                   │   Ollama (Local)     │    │   Groq Cloud (Fallback) │
                                   │   qwen2.5:7b         │    │   llama-3.1-8b-instant  │
                                   └─────────────────────┘    └────────────────────────┘
```

**Three-tier architecture:**
1. **React frontend** — handles UI, state management (Zustand), human-in-the-loop approval
2. **Express backend proxy** — routes AI requests, keeps API keys server-side, applies rate limiting
3. **AI layer** — Ollama (local, primary) with Groq cloud fallback; responses cached in-memory

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm 9+
- Git
- [Ollama](https://ollama.ai) installed with `qwen2.5:7b` pulled *(see Fadil's setup below)*
- Free [Groq API key](https://console.groq.com) for cloud fallback

---

### Terminal 1 — Start Ollama

```bash
OLLAMA_ORIGINS=* ollama serve
```

> First time? Pull the model first: `ollama pull qwen2.5:7b` (4–5 GB download)

---

### Terminal 2 — Start Backend

```bash
cd server
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
npm install
npm run dev
```

✅ Verify: open [http://localhost:3001/api/health](http://localhost:3001/api/health)

---

### Terminal 3 — Start Frontend

```bash
cd client
cp .env.example .env.local
# .env.local should contain: VITE_API_URL=http://localhost:3001
npm install
npm run dev
```

✅ Open [http://localhost:5173](http://localhost:5173) in Chrome

---

## 🌍 Environment Variables

### `server/.env`

| Variable | Description | Required |
|----------|-------------|----------|
| `GROQ_API_KEY` | From [console.groq.com](https://console.groq.com) | Yes |
| `OLLAMA_MODEL` | Model name (default: `qwen2.5:7b`) | No |
| `PORT` | Server port (default: `3001`) | No |
| `ALLOWED_ORIGIN` | Frontend URL for CORS (default: `http://localhost:5173`) | No |

### `client/.env.local`

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_API_URL` | Backend URL (default: `http://localhost:3001`) | Yes |

---

## 📁 Project Structure

```
email-triage/
├── README.md
├── .gitignore
│
├── client/                    # React frontend (Hamood)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/        # UI components
│   │   ├── stores/            # Zustand state (email, triage, action, app)
│   │   ├── api/               # fetch wrappers for all 3 endpoints
│   │   ├── data/              # Mock emails + pre-cached triage results
│   │   └── types/             # Shared TypeScript interfaces
│   └── package.json
│
└── server/                    # Express backend (Fadil)
    ├── src/
    │   ├── index.ts           # Express entry point
    │   ├── routes/            # triage, emails, actions, health
    │   ├── services/          # promptBuilder, ollamaService, groqService, cache
    │   ├── middleware/        # rateLimiter, errorHandler
    │   └── data/              # mockEmails.json
    └── package.json
```

---

## 🔌 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Ollama + Groq status, uptime |
| `/api/emails` | GET | Fetch mock email inbox (`?priority=urgent\|action\|fyi\|all`) |
| `/api/triage` | POST | Triage an email — returns priority, summary, reply, calendar, tasks |
| `/api/actions/approve` | POST | Human-in-the-loop approval of an AI action |

---

## 🐛 Troubleshooting

| Symptom | Fix |
|---------|-----|
| CORS error in browser | Run Ollama with `OLLAMA_ORIGINS=* ollama serve` |
| POST /api/triage returns 503 | Check Terminal 1 (Ollama) + verify `GROQ_API_KEY` in `.env` |
| Inbox shows 0 emails | Check server terminal; verify `mockEmails.json` path |
| Action cards not appearing | Check browser DevTools → Network tab for triage response |
| Slow inference (>30s) | Pre-cached responses activate automatically — no wait needed |
| Vite build fails | Run `npx tsc --noEmit` in `client/` to see TypeScript errors |

---

## 👥 Team

| Name | Role | Responsibilities |
|------|------|-----------------|
| **Fadil Faisal** | Backend & AI Lead | Express API, Ollama/Groq integration, prompt engine, Railway deploy |
| **Hamood Ayoob Khan** | Frontend & UX Lead | React UI, Zustand stores, action cards, dark mode, Vercel deploy |

---

## 📄 Tech Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand, Lucide React

**Backend:** Node.js, Express, TypeScript, Zod, express-rate-limit

**AI:** Ollama (`qwen2.5:7b` local), Groq Cloud (`llama-3.1-8b-instant` fallback)

**Deploy:** Vercel (frontend) + Railway (backend)

---

## ⚖️ Ethical Considerations

- **Human-in-the-loop:** Every action requires explicit user approval — the AI never sends emails autonomously
- **Data privacy:** Only synthetic mock data used; no real emails processed
- **Transparency:** All AI suggestions are clearly labelled as AI-generated
- **Model-agnostic:** Prompt engine works with any OpenAI-compatible API
