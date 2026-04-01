# MailMate - Feature Overview

**Team 61 - Avalon | NH26 Hackathon**

---

## Core Features

### 1. Gmail Integration (OAuth 2.0)
- Users sign in with their Google account via NextAuth.js
- App requests Gmail and Calendar API scopes
- Fetches real email threads from the user's inbox
- Sends real emails through Gmail on behalf of the user
- Falls back to mock data when not signed in (demo mode)

### 2. AI Email Analysis
One-click analysis of any email thread using Groq LLM (LLaMA 3.3 70B). Extracts:
- **Executive Summary** - 3-bullet condensed overview of the thread
- **Priority Classification** - Urgent, Important, Normal, or Low
- **Category Detection** - Work, Personal, Finance, Updates, or Spam
- **Smart Replies** - 5 one-click reply options (accept/decline tones)
- **Full Draft Reply** - Professional reply generated from thread context
- **Meeting Detection** - Dates, times, attendees extracted from the thread
- **Task Extraction** - Action items with deadlines and priority levels
- **Deadline Detection** - Time-sensitive dates flagged as urgent if within 3 days
- **Key Information** - Dates, links, contacts, and monetary amounts pulled out
- **Follow-up Detection** - Flags threads that need a response with suggestions
- **Sender Importance** - Classifies sender as VIP, Regular, or Unknown

### 3. AI Writing Tools
Four rewrite actions available in both reply and compose panels:
- **Fix Grammar** - Corrects spelling, punctuation, and grammar
- **Formalize** - Converts casual text into professional tone
- **Shorten** - Condenses the message while keeping meaning
- **Elaborate** - Expands the message with more detail

### 4. AI Chat Assistant
- Context-aware sidebar chat panel
- When an email is selected, the AI has full thread context
- Users can ask natural language questions about any email
- Powered by Groq LLM with conversation history

### 5. Google Calendar Integration
- Full calendar workspace view with date picker
- Shows synced events from Google Calendar
- One-click "Add to Calendar" for meetings detected by AI
- Event cards show attendees, time, and direct link to Google Calendar

### 6. Email Composition
- **Reply Panel** - Inline reply composer with AI writing tools and word count
- **New Email Modal** - Full compose dialog with To, Subject, Body fields
- Sends via Gmail API when authenticated
- Draft auto-save to local storage

### 7. Inbox Management
- **Folders** - Inbox, Starred, Snoozed, Sent, Drafts, Calendar, Trash, All Mail
- **Star/Unstar** - Mark important conversations
- **Snooze** - Temporarily hide emails (reappear after timer)
- **Archive/Trash** - Move conversations out of inbox
- **Mark Read/Unread** - Toggle read status
- **Custom Labels** - Create and apply user-defined labels to threads
- **Gmail Actions** - Star, archive, trash, and read status sync back to Gmail

### 8. Search and Filtering
- Full-text search across subjects, bodies, sender names, emails, and labels
- Filter by read status (All, Unread, Read)
- Filter by priority (Urgent, Important, Normal, Low)
- Filter by category (Work, Personal, Finance, Updates, Spam)
- Category quick-filters from sidebar

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 15 (App Router) | Server-side rendering, API routes, file-based routing |
| Language | TypeScript + React 19 | Type safety, modern React with hooks |
| Styling | Tailwind CSS 4 | Utility-first responsive design |
| UI Components | Radix UI (shadcn/ui) | Accessible, composable headless components |
| AI Engine | Groq SDK + Vercel AI SDK | Fast inference with LLaMA 3.3 70B model |
| Authentication | NextAuth.js | Google OAuth 2.0 with token refresh |
| Email API | Gmail API v1 | Read threads, send emails, modify labels |
| Calendar API | Google Calendar API v3 | Read events, create events |
| State | React useState + localStorage | Client-side persistence for analyses and metadata |
| Icons | Lucide React | Consistent icon library |

---

## Architecture

```
Browser (React SPA)
    |
    +-- Next.js App Router
    |       |
    |       +-- /api/analyze    --> Groq AI (thread analysis)
    |       +-- /api/chat       --> Groq AI (conversational)
    |       +-- /api/rewrite    --> Groq AI (text rewriting)
    |       +-- /api/gmail/*    --> Gmail API (threads, send, modify)
    |       +-- /api/calendar/* --> Google Calendar API (events, create)
    |       +-- /api/auth/*     --> NextAuth (Google OAuth)
    |
    +-- localStorage (analyses cache, thread metadata, labels, sidebar state)
```

All AI processing happens server-side through Next.js API routes. The Groq API key never reaches the client. Gmail and Calendar API calls use the user's OAuth access token, refreshed automatically by NextAuth.
