# MailMate - AI-Powered Email Assistant

MailMate is an intelligent email client that connects to Gmail via OAuth, provides AI-driven email analysis, smart reply generation, calendar integration, and a conversational AI assistant -- all within a single polished interface.

## Features

- **Gmail Integration** - Connect your Google account to fetch, read, and send real emails
- **AI Email Analysis** - One-click thread analysis powered by Groq (LLaMA 3.3 70B) that extracts:
  - Executive summary with priority and category classification
  - Smart reply suggestions (accept/decline options)
  - Full drafted replies ready to send
  - Meeting detection with one-click Google Calendar add
  - Task and deadline extraction
  - Key information (dates, links, contacts, amounts)
- **AI Writing Tools** - Fix grammar, formalize, shorten, or elaborate on any draft
- **AI Chat Assistant** - Context-aware chat sidebar for asking questions about any email thread
- **Google Calendar Sync** - Full calendar workspace with event browsing and meeting context
- **Email Composition** - Compose and send new emails or reply directly through the app
- **Smart Inbox Management** - Star, snooze, archive, trash, label, and filter conversations
- **Search and Filters** - Full-text search across emails, contacts, labels, and thread content with priority/category/read filters

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript, React 19 |
| Styling | Tailwind CSS 4 |
| UI Components | Radix UI (shadcn/ui) |
| AI | Groq SDK + Vercel AI SDK (LLaMA 3.3 70B) |
| Auth | NextAuth.js with Google OAuth |
| APIs | Gmail API, Google Calendar API |
| Icons | Lucide React |

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Cloud project with Gmail and Calendar APIs enabled
- A Groq API key ([console.groq.com](https://console.groq.com))

### Installation

```bash
cd submissions/61-Avalon
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Google OAuth (required for Gmail/Calendar)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# NextAuth
NEXTAUTH_SECRET=any-random-secret-string
NEXTAUTH_URL=http://localhost:3000

# AI (required for analysis, chat, and writing tools)
GROQ_API_KEY=your-groq-api-key
```

### Google Cloud Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project and enable **Gmail API** and **Google Calendar API**
3. Create OAuth 2.0 credentials (Web application)
4. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
5. Copy the Client ID and Client Secret into `.env.local`

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page. Click **Get Started** to enter the inbox.

## Project Structure

```
submissions/61-Avalon/
├── app/
│   ├── page.tsx                # Landing page
│   ├── layout.tsx              # Root layout with providers
│   ├── globals.css             # Global styles, CSS variables, animations
│   ├── inbox/
│   │   └── page.tsx            # Main email client interface
│   ├── auth/
│   │   └── signin/page.tsx     # Sign-in page
│   └── api/
│       ├── analyze/            # AI thread analysis endpoint
│       ├── chat/               # AI chat assistant endpoint
│       ├── compose/            # Email composition endpoint
│       ├── rewrite/            # AI writing tools endpoint
│       ├── gmail/              # Gmail API (threads, send, modify)
│       ├── calendar/           # Google Calendar API (events, create)
│       └── auth/               # NextAuth handlers
├── components/
│   ├── landing/                # Landing page sections (12 components)
│   ├── ui/                     # Radix UI component library (40+ components)
│   ├── logo.tsx                # Brand logo component
│   ├── session-provider.tsx    # NextAuth session wrapper
│   └── theme-provider.tsx      # Theme context
├── lib/
│   ├── auth.ts                 # NextAuth configuration with Google provider
│   ├── groq.ts                 # Groq AI functions (analyze, chat, rewrite)
│   ├── gmail.ts                # Gmail API client helpers
│   ├── google-calendar.ts      # Calendar API client helpers
│   └── utils.ts                # Utility functions
├── types/
│   └── index.ts                # TypeScript type definitions
├── data/
│   └── emails.ts               # Mock email dataset for demo mode
└── hooks/
    └── use-mobile.ts           # Responsive breakpoint hook
```

## How It Works

1. **Without Google** - The app loads with mock email data so you can explore all features in demo mode
2. **With Google** - Connect your Gmail account to fetch real emails. All AI features work on your actual inbox
3. **AI Analysis** - Select a thread, click the "AI Analysis" tab, and MailMate analyzes the conversation to extract insights, suggest replies, detect meetings, and identify tasks
4. **AI Chat** - Open the chat sidebar to ask questions about any selected email in natural language

## Deployment

Deploy to Vercel:

```bash
vercel
```

Add all environment variables (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GROQ_API_KEY`) in the Vercel dashboard under Settings > Environment Variables.

Update the Google OAuth redirect URI to match your production URL.

## Team

- **Team Number:** 61
- **Team Name:** Avalon

## License

MIT
