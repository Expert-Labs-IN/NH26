# MailMate - Team Knowledge Base & Presentation Guide

**Team 61 - Avalon | NH26 Hackathon**

Use this document to prepare for judging, Q&A, and the 10-minute presentation.

---

## Table of Contents

1. [What is MailMate (Elevator Pitch)](#1-what-is-mailmate)
2. [How It Works (Simple Explanation)](#2-how-it-works)
3. [Feature Walkthrough](#3-feature-walkthrough)
4. [Tech Stack Explained Simply](#4-tech-stack-explained-simply)
5. [Architecture & Data Flow](#5-architecture--data-flow)
6. [Edge Cases & How We Handle Them](#6-edge-cases--how-we-handle-them)
7. [Common Judge Questions & Answers](#7-common-judge-questions--answers)
8. [10-Minute Presentation Plan](#8-10-minute-presentation-plan)
9. [Demo Script](#9-demo-script)
10. [Glossary](#10-glossary)

---

## 1. What is MailMate

**One-liner:** MailMate is an AI-powered email assistant that connects to your Gmail, analyzes conversations, and helps you reply, schedule meetings, and manage tasks -- all from one interface.

**Problem it solves:** People spend 2-3 hours daily on email. Most of that time is reading, understanding context, drafting replies, and extracting action items. MailMate automates all of that with AI.

**What makes it different:**
- It's not just a chatbot -- it's a full email client with built-in AI
- One-click analysis gives you summary, replies, meetings, tasks, and deadlines instantly
- It works with your real Gmail (not just mock data)
- AI writing tools let you fix, formalize, shorten, or elaborate on any draft
- Calendar integration means meetings detected in emails can be added to Google Calendar in one click

---

## 2. How It Works

### Without Google Sign-In (Demo Mode)
The app loads with 12 realistic mock email threads. All features work -- you can analyze threads, generate replies, use AI chat, etc. This is great for demoing when you don't want to expose a real inbox.

### With Google Sign-In
1. User clicks "Connect Gmail" and signs in with Google OAuth
2. App gets permission to read Gmail and Google Calendar
3. Real emails are fetched from Gmail API and shown in the inbox
4. User selects an email thread and clicks "AI Analysis" tab
5. The thread content is sent to our server, which calls Groq AI (LLaMA 3.3 70B model)
6. AI returns a structured JSON with summary, priority, replies, meetings, tasks, etc.
7. User can reply using smart replies or the draft, send it via Gmail, add meetings to Calendar

### Where is the data?
- **Email data**: Fetched live from Gmail API (not stored on any server)
- **AI analysis results**: Cached in the browser's localStorage (stays on user's device)
- **Thread metadata** (starred, read, labels): Also in localStorage
- **No database**: We don't store any user data on a server

---

## 3. Feature Walkthrough

### Landing Page
- Modern animated landing page with sections for features, how-it-works, infrastructure, metrics, integrations, security, developers, pricing, and CTA
- Responsive design that works on all screen sizes
- "Get Started" button takes you to the inbox

### Inbox Interface (Main App)

**Header Bar:**
- Logo (links back to landing page)
- Search bar (full-text search across all email content)
- Refresh button (re-fetches emails from Gmail)
- Compose button (opens new email dialog)
- Gmail Connected badge (shows connection status)
- AI Chat toggle
- User account menu (sign out)

**Sidebar Navigation:**
- Collapsible sidebar (pin or hover-to-expand)
- Folders: Inbox, Starred, Snoozed, Sent, Drafts, Calendar, Trash, All Mail
- Categories: Work, Personal, Finance, Updates, Spam (quick filters)
- Labels: User-created custom labels with create/delete
- Calendar: Mini preview of upcoming events with links

**Thread List (Middle Panel):**
- Shows sender avatar, name, subject, 2-line preview
- Priority dot (red=urgent, amber=important, gray=normal)
- Category badge, follow-up indicator, snooze indicator
- Star on hover, timestamp
- Click to open thread

**Email View (Right Panel):**
Two tabs:
1. **Emails Tab** - Shows all messages in the thread with sender avatars, timestamps, and full body text. Reply button at bottom.
2. **AI Analysis Tab** - Click to trigger AI analysis. Shows:
   - Executive summary (3 bullets) with priority and category badges
   - Follow-up alert (if AI detects you need to respond)
   - Quick replies (accept/decline options, click to load into composer)
   - Full drafted reply (copy to clipboard)
   - Meeting actions (detected meetings with "Add to Calendar" button)
   - Extracted tasks (with deadlines and priority)
   - Deadlines (urgent ones highlighted in red)
   - Key information (dates, links, contacts, amounts)

**Reply Composer:**
- Appears at bottom of thread view
- Textarea with AI writing tools: Fix Grammar, Formalize, Shorten, Elaborate
- Word count display
- Send via Gmail button (or plain Send in demo mode)

**New Email Composer:**
- Modal dialog with To, Subject, Body fields
- Same AI writing tools available
- Send via Gmail API

**AI Chat Sidebar:**
- Right-side panel, toggled from header
- Context-aware: knows which email thread is selected
- Conversational interface with message bubbles
- Ask questions like "What are the action items?" or "Summarize this for my manager"

**Calendar Workspace:**
- Full calendar view with date picker
- Stats: upcoming events count, today's events, next meeting
- Agenda view for selected date
- Event cards with attendees and Google Calendar links

---

## 4. Tech Stack Explained Simply

| Technology | What It Is | Why We Used It |
|-----------|-----------|----------------|
| **Next.js 15** | A React framework by Vercel | Gives us both the frontend (what users see) and backend (API routes) in one project. Server-side rendering makes the landing page fast. |
| **React 19** | UI library by Meta | The most popular way to build interactive web apps. Components, state management, hooks. |
| **TypeScript** | JavaScript with types | Catches bugs before they happen. Every variable, function, and API response has a defined shape. |
| **Tailwind CSS 4** | Utility-first CSS framework | Write styles directly in HTML classes instead of separate CSS files. Fast to build, easy to customize. |
| **Radix UI (shadcn/ui)** | Headless UI component library | Pre-built accessible components (buttons, dropdowns, dialogs, scroll areas) that we style ourselves. |
| **Groq SDK** | AI inference API | Runs LLaMA 3.3 70B model with extremely fast inference (10x faster than OpenAI for our use case). Free tier available. |
| **Vercel AI SDK** | AI toolkit by Vercel | Standardized way to call AI models. Handles streaming, error handling, and structured output. |
| **NextAuth.js** | Authentication library | Handles Google OAuth flow, token storage, and automatic token refresh. Industry standard for Next.js. |
| **Gmail API** | Google's email API | Read threads, send emails, modify labels (star, archive, trash) on the user's real mailbox. |
| **Google Calendar API** | Google's calendar API | Read upcoming events, create new events from meetings detected by AI. |
| **localStorage** | Browser storage | Caches AI analyses and user preferences so they persist across page refreshes without needing a database. |

---

## 5. Architecture & Data Flow

```
USER'S BROWSER                         OUR SERVER (Next.js)                    EXTERNAL
+------------------+                   +------------------------+              +------------------+
|                  |   HTTP Request     |                        |   API Call   |                  |
|  React Frontend  | ----------------> |  /api/analyze          | -----------> |  Groq AI         |
|  (inbox/page.tsx)|                   |  /api/chat             |              |  (LLaMA 3.3 70B) |
|                  | <---------------- |  /api/rewrite          | <----------- |                  |
|                  |   JSON Response   |                        |   AI Result  +------------------+
|                  |                   |                        |
|                  | ----------------> |  /api/gmail/threads    | -----------> +------------------+
|                  |   OAuth Token     |  /api/gmail/send       |   API Call   |  Gmail API       |
|                  | <---------------- |  /api/gmail/modify     | <----------- |  (Google)        |
|                  |   Email Data      |                        |   Email Data +------------------+
|                  |                   |                        |
|                  | ----------------> |  /api/calendar/events  | -----------> +------------------+
|                  |                   |  /api/calendar/create  |              |  Calendar API    |
|                  | <---------------- |                        | <----------- |  (Google)        |
|  localStorage    |                   |  /api/auth/[...next]   |              +------------------+
|  (cache/prefs)   |                   |  (NextAuth handler)    |
+------------------+                   +------------------------+
```

**Key security point:** The Groq API key stays on the server. The user's OAuth token is managed by NextAuth (stored in an encrypted session cookie). No secrets are exposed to the browser.

---

## 6. Edge Cases & How We Handle Them

| Edge Case | How We Handle It |
|-----------|-----------------|
| **No Google account connected** | App falls back to 12 mock email threads so all features still work in demo mode |
| **Gmail API fails** | Error banner shown. Cached conversations remain accessible. User can retry with refresh button. |
| **AI analysis fails** | Error state shown with "Analysis unavailable" message. Doesn't crash the app. |
| **AI returns malformed JSON** | We strip markdown wrapping (`\`\`\`json`), parse with try/catch, and provide safe defaults for every field |
| **Empty email thread** | "No messages available" empty state is displayed |
| **OAuth token expires** | NextAuth automatically refreshes the token using the refresh token stored in the session |
| **User sends empty message in chat** | Input validation rejects blank messages (both client and server side) |
| **AI rewrite with no text** | Button is disabled when textarea is empty |
| **Calendar event has no attendees** | Shows "No attendee list" badge instead of crashing |
| **Email has no preview text** | Preview is generated by truncating the email body to 140 characters |
| **Thread has no analysis yet** | Analysis only runs when user clicks the "AI Analysis" tab (on-demand, not automatic) |
| **Multiple rapid clicks on Analyze** | Loading state prevents duplicate API calls |
| **Long email threads** | ScrollArea components handle overflow with native-like scrolling |
| **Sidebar overflow on small screens** | Sidebar collapses to icon-only mode (w-16) and expands on hover |
| **AI chat panel layout overflow** | Flex container with `min-h-0` and `overflow-hidden` prevents white space bugs |

---

## 7. Common Judge Questions & Answers

### General

**Q: What problem does this solve?**
A: Professionals spend 2-3 hours daily on email. MailMate uses AI to instantly analyze threads, generate replies, detect meetings, extract tasks, and identify deadlines -- reducing email processing time by 60-70%.

**Q: How is this different from Gmail's built-in smart replies?**
A: Gmail gives you 3 short auto-replies. MailMate gives you a full analysis: priority classification, category, full draft reply, meeting detection with calendar integration, task extraction, deadline tracking, key information extraction, and a conversational AI assistant. It's a complete email workflow tool, not just reply suggestions.

**Q: Is this a real working application?**
A: Yes. When connected to a Google account, it reads real emails via Gmail API, sends real emails, and creates real Google Calendar events. Without a Google account, it works with realistic mock data for demonstration.

### Technical

**Q: Why Groq instead of OpenAI/Claude?**
A: Groq provides extremely fast inference (sub-second responses for most queries) with the LLaMA 3.3 70B model on their free tier. For a hackathon, speed and cost matter -- Groq gives us both.

**Q: How does the AI analysis work technically?**
A: We send the full email thread to Groq's API with a structured system prompt that defines the exact JSON schema we expect. The AI returns a JSON object with summary, priority, category, smart replies, draft reply, meetings, tasks, deadlines, key info, labels, follow-up status, and sender importance. We validate and parse every field with safe defaults.

**Q: Where is user data stored?**
A: We don't store any data on a server. Email data comes live from Gmail API. AI analysis results are cached in the browser's localStorage. All preferences (starred, labels, drafts) are also in localStorage. If the user clears their browser data, it resets.

**Q: How do you handle authentication securely?**
A: We use NextAuth.js with Google OAuth 2.0. The OAuth flow gives us access tokens and refresh tokens. Access tokens expire after 1 hour and are automatically refreshed. The Groq API key is only used server-side in API routes -- it never reaches the client browser.

**Q: What happens if the AI gives a wrong analysis?**
A: The analysis is a suggestion, not an action. Users review everything before acting. They can edit draft replies, ignore suggested meetings, and dismiss tasks. This is a "human-in-the-loop" design -- AI assists, human decides.

**Q: Can this scale to production?**
A: The current architecture uses localStorage which limits it to single-device use. For production: replace localStorage with a database (Supabase/PostgreSQL), add server-side caching for AI results, implement rate limiting on API routes, and add team/multi-user support.

**Q: Why Next.js App Router instead of Pages Router?**
A: App Router (introduced in Next.js 13+) supports React Server Components, streaming, and file-based API routes. It's the modern standard and what Vercel recommends for new projects.

### Design

**Q: Why does the landing page look different from the app?**
A: Intentional. The landing page is a marketing/product page (dark theme, animations, feature highlights). The app is a productivity tool (light, clean, minimal distractions). This is the same pattern used by products like Linear, Notion, and Vercel.

**Q: How is the UI responsive?**
A: Tailwind CSS utility classes handle responsive breakpoints. The sidebar collapses on smaller screens. The landing page sections stack vertically on mobile. Thread list and detail panels are sized with flex containers.

---

## 8. 10-Minute Presentation Plan

### Slide/Section Breakdown (3 speakers)

**Speaker 1 - Problem & Solution (3 minutes)**

| Time | Content |
|------|---------|
| 0:00 | Introduce the team (Team 61 - Avalon, 3 members) |
| 0:30 | **The Problem**: "Professionals spend 2-3 hours daily on email. Reading, understanding context, drafting replies, scheduling meetings, tracking tasks -- it's repetitive cognitive work." |
| 1:00 | **Our Solution**: "MailMate -- an AI-powered email assistant that connects to your Gmail and does the heavy lifting. One-click analysis gives you summary, replies, meetings, tasks, and deadlines." |
| 1:30 | **Key Differentiators**: Real Gmail integration (not just mock data), comprehensive AI analysis (not just smart replies), calendar integration, conversational AI assistant |
| 2:30 | Transition: "Let me show you how it works." |

**Speaker 2 - Live Demo (4 minutes)**

| Time | Content |
|------|---------|
| 3:00 | Show landing page briefly (30 seconds) - point out professional design |
| 3:30 | Enter inbox -- show mock data loaded, explain sidebar folders |
| 4:00 | Click an email thread -- show the Emails tab with full conversation |
| 4:30 | **Key demo moment**: Click "AI Analysis" tab -- show the analysis loading and results appearing (summary, priority, category, smart replies, draft, meetings, tasks) |
| 5:15 | Click a smart reply -- show it load into the composer. Show AI writing tools (Formalize, Shorten) |
| 5:45 | Show "Add to Calendar" button for a detected meeting |
| 6:00 | Open AI Chat sidebar -- ask "What are the action items in this email?" |
| 6:30 | Show search and filters briefly |
| 6:45 | Transition: "Now let me walk you through the technology." |

**Speaker 3 - Tech Stack & Architecture (3 minutes)**

| Time | Content |
|------|---------|
| 7:00 | **Tech stack overview**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI, Groq AI, Gmail API, Calendar API, NextAuth |
| 7:30 | **Architecture**: "Frontend sends requests to our API routes. API routes call either Groq AI or Google APIs. No user data stored on server -- everything cached in browser." |
| 8:00 | **AI approach**: "We use Groq's LLaMA 3.3 70B model. We send the email thread with a structured prompt. AI returns JSON that we validate and display. Sub-second response times." |
| 8:30 | **Security**: "OAuth 2.0 for Google, API keys server-side only, no user data persistence on our servers." |
| 9:00 | **Edge cases**: "Demo mode when not signed in, graceful error handling, AI output validation with safe defaults." |
| 9:30 | **Future scope**: Database integration, multi-user teams, email scheduling, mobile app |
| 10:00 | "Thank you. Questions?" |

---

## 9. Demo Script

If you need to do a live demo, follow this sequence:

1. **Open the app** at localhost:3000 (or deployed URL)
2. **Landing page** - Scroll briefly through 2-3 sections. "This is our product page."
3. **Click "Get Started"** - Enter the inbox
4. **Point out the layout** - "Sidebar for navigation, thread list in the middle, email content on the right"
5. **Click any email** (try "Q2 Budget Review" -- it has meetings and tasks)
6. **Show Emails tab** - "Here's the full conversation thread"
7. **Click AI Analysis tab** - Wait for analysis to load
8. **Walk through each section**:
   - "AI detected this as urgent priority, categorized as work"
   - "Here's a 3-bullet summary"
   - "Two smart reply options -- accept and decline"
   - "A full drafted reply we can copy or send"
   - "It detected a meeting -- we can add it to Google Calendar in one click"
   - "Extracted tasks with deadlines"
9. **Click a smart reply** - Show it loads into the compose panel
10. **Show AI writing tools** - Click "Formalize" to rewrite the reply
11. **Open AI Chat** - Type "What should I prioritize in this email?"
12. **Show Calendar** - Click Calendar in sidebar to show the workspace

**If demo breaks:** Switch to talking about the architecture. "The demo is running locally but let me show you the code structure..." Open the codebase and walk through the API routes.

---

## 10. Glossary

| Term | Meaning |
|------|---------|
| **OAuth 2.0** | Industry standard protocol for authorization. Lets our app access Gmail on behalf of the user without seeing their password. |
| **API Route** | A server-side endpoint in our Next.js app (e.g., `/api/analyze`). Runs on the server, not in the browser. |
| **Groq** | An AI inference company. We use their API to run the LLaMA 3.3 70B language model. |
| **LLaMA 3.3 70B** | A large language model by Meta with 70 billion parameters. Good at understanding and generating text. |
| **Inference** | Running an AI model to get a prediction/output. When we send an email to Groq, the "inference" is the AI generating the analysis. |
| **NextAuth.js** | A library that handles sign-in flows (Google OAuth) for Next.js apps. Manages tokens and sessions. |
| **Access Token** | A temporary key (expires in ~1 hour) that lets our app make Gmail/Calendar API calls on behalf of the user. |
| **Refresh Token** | A long-lived key used to get new access tokens when the old one expires. Managed by NextAuth automatically. |
| **localStorage** | Browser storage that persists data across page refreshes. We use it to cache AI analyses and user preferences. |
| **SSR** | Server-Side Rendering. The server generates the HTML before sending it to the browser. Makes the landing page load fast. |
| **App Router** | Next.js 13+ routing system. File-based routing where each folder under `/app` becomes a URL path. |
| **Radix UI** | Headless (unstyled) UI component library. Gives us accessible dropdowns, dialogs, scroll areas, etc. that we style with Tailwind. |
| **shadcn/ui** | Not a library you install. It's a collection of copy-paste Radix UI components pre-styled with Tailwind. We have ~40 components in `/components/ui/`. |
| **Tailwind CSS** | Utility-first CSS framework. Instead of writing `.button { background: blue }`, you write `className="bg-blue-500"` directly in JSX. |
| **Human-in-the-loop** | Design pattern where AI makes suggestions but the human makes the final decision. The user reviews and approves every AI-generated action. |
