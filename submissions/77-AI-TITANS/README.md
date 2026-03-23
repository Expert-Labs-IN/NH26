# 🤖 Agentic Email Assistant

AI-Powered Email Triage & Automated Action Workflow System

![Project Banner](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)
![Claude AI](https://img.shields.io/badge/Claude%20AI-Sonnet%204-purple?style=for-the-badge)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [How It Works](#how-it-works)
- [API Documentation](#api-documentation)
- [Demo Features](#demo-features)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [Future Enhancements](#future-enhancements)

## 🎯 Overview

The Agentic Email Assistant is a sophisticated web-based email client prototype that leverages Claude AI (Anthropic) to automatically analyze incoming emails and suggest intelligent automated actions. It drastically reduces inbox management time by preparing executable actions for user approval.

### Problem Statement

Professionals suffer from massive inbox overload, spending hours reading and categorizing emails rather than doing deep work. This system acts as a proactive virtual assistant that:

1. **Reads** incoming emails and understands context
2. **Analyzes** the email thread and extracts key information
3. **Prepares** logical next steps (replies, calendar events, tasks)
4. **Presents** actions for human approval with one-click execution

## ✨ Features

### Core Capabilities

✅ **Contextual Thread Summarization**
- Condenses long email chains into 3-bullet-point summaries
- Identifies key topics and themes
- Tracks conversation history

✅ **Automated Action Drafting** (3 Types Demonstrated)
1. **Draft Reply**: AI pre-fills professional responses based on email content
2. **Calendar Event Creation**: Extracts meeting details and creates event proposals
3. **Task List Extraction**: Converts action items into structured task lists

✅ **Human-in-the-Loop Approval**
- Clean UI for reviewing AI-suggested actions
- Edit capability for all drafted content
- One-click "Approve & Execute" workflow
- Reject option for unwanted actions

✅ **Priority Tagging System**
- Automatically flags emails as 'Urgent', 'Requires Action', or 'FYI'
- Visual indicators for VIP senders
- Sentiment analysis (Positive/Neutral/Negative)

### Technical Features

- **Real-time AI Analysis**: Claude Sonnet 4 integration via Anthropic API
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark Mode Support**: Automatic theme switching
- **Mock Email Dataset**: 8 realistic email scenarios for testing
- **TypeScript**: Full type safety across the application
- **Modern UI**: Tailwind CSS with gradient accents and smooth animations

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Beautiful icon set
- **date-fns** - Date formatting utilities

### Backend/API
- **Next.js API Routes** - Serverless API endpoints
- **Anthropic Claude API** - AI analysis engine
- **@anthropic-ai/sdk** - Official Anthropic SDK

### Development
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixes

## 📁 Project Structure

```
agentic-email-assistant/
├── app/
│   ├── api/
│   │   └── analyze-email/
│   │       └── route.ts          # AI analysis API endpoint
│   ├── globals.css               # Global styles with Tailwind
│   ├── layout.tsx                # Root layout component
│   └── page.tsx                  # Main application page
├── components/
│   ├── EmailList.tsx             # Email inbox list component
│   ├── EmailDetail.tsx           # Email content viewer
│   ├── AnalysisPanel.tsx         # AI analysis results display
│   └── ActionCard.tsx            # Individual action card component
├── data/
│   └── emails.json               # Mock email dataset (8 emails)
├── types/
│   └── index.ts                  # TypeScript type definitions
├── public/                       # Static assets
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── next.config.js                # Next.js configuration
└── README.md                     # This file
```

## 📦 Prerequisites

Before installation, ensure you have:

- **Node.js** version 18.x or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Anthropic API Key** ([Get one here](https://console.anthropic.com/))

## 🚀 Installation

### Step 1: Extract the Project

```bash
unzip agentic-email-assistant.zip
cd agentic-email-assistant
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

This will install all required packages including:
- Next.js and React
- Anthropic SDK
- Tailwind CSS
- TypeScript
- All other dependencies

### Step 3: Set Up Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
```

**🔑 Getting an API Key:**
1. Visit [console.anthropic.com](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into `.env.local`

## ⚙️ Configuration

### API Model Selection

The application uses **Claude Sonnet 4** by default. To change the model, edit:

```typescript
// app/api/analyze-email/route.ts
const message = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514', // Change this to use a different model
  max_tokens: 4096,
  // ...
});
```

Available models:
- `claude-opus-4-20250514` - Most capable, slower
- `claude-sonnet-4-20250514` - Balanced (recommended)
- `claude-haiku-4-20250301` - Fastest, more economical

### Customizing Mock Emails

Edit `data/emails.json` to add your own test emails:

```json
{
  "id": "email-009",
  "from": {
    "name": "Your Name",
    "email": "you@example.com",
    "isVIP": false
  },
  "subject": "Your Subject",
  "body": "Your email content...",
  "timestamp": "2026-03-23T10:00:00Z",
  "thread": [],
  "priority": "action_required",
  "hasAttachments": false
}
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
# or
yarn build
yarn start
```

### Linting

```bash
npm run lint
# or
yarn lint
```

## 🎮 How It Works

### User Workflow

1. **Browse Inbox**: View list of emails with priority indicators
2. **Select Email**: Click on an email to view full content
3. **Trigger AI**: Click "🤖 AI Analyze" button
4. **Review Analysis**: 
   - Read 3-point summary
   - Check sentiment and priority assessment
   - Review suggested actions (replies, calendar events, tasks)
5. **Approve/Reject**: 
   - Click "Approve & Execute" to perform action
   - Click "Reject" to dismiss
   - Click "Edit" to modify before approval
6. **Track Actions**: Monitor executed actions counter in header

### AI Analysis Process

```
Email Content → Claude API → JSON Response → Parse Actions → Display UI
```

The AI analyzes:
- **Email body** and **subject line**
- **Previous thread** context (if available)
- **Sender information** (VIP status, email address)
- **Priority level** and **attachments** presence

It generates:
- **Summary**: 3 bullet points capturing key information
- **Key Topics**: Extracted themes
- **Suggested Actions**: 1-3 automated responses
- **Metadata**: Sentiment, priority, action requirement

## 📚 API Documentation

### POST /api/analyze-email

Analyzes an email and returns AI-generated insights and suggested actions.

**Request Body:**

```json
{
  "email": {
    "id": "email-001",
    "from": {
      "name": "John Doe",
      "email": "john@example.com",
      "isVIP": true
    },
    "subject": "Project Update",
    "body": "Email content here...",
    "timestamp": "2026-03-23T09:15:00Z",
    "thread": [],
    "priority": "urgent",
    "hasAttachments": false
  }
}
```

**Response:**

```json
{
  "emailId": "email-001",
  "summary": {
    "points": [
      "Summary point 1",
      "Summary point 2",
      "Summary point 3"
    ],
    "keyTopics": ["topic1", "topic2"]
  },
  "suggestedActions": [
    {
      "type": "reply",
      "data": {
        "subject": "Re: Project Update",
        "body": "Thank you for the update...",
        "tone": "professional"
      },
      "confidence": 0.9,
      "reasoning": "Explanation of why this action is suggested"
    }
  ],
  "priority": "urgent",
  "sentiment": "neutral",
  "requiresAction": true
}
```

## 🎨 Demo Features

The application includes 8 pre-loaded mock emails demonstrating various scenarios:

1. **Urgent VIP Meeting Request** - Triggers calendar event creation
2. **Action Required: Review Request** - Generates task list
3. **Client Follow-up with Questions** - Drafts professional reply
4. **System Maintenance Notice** - Marked as FYI
5. **Partnership Opportunity** - Suggests calendar scheduling
6. **Weekly Newsletter** - Auto-categorized as FYI
7. **Project Status with Blockers** - Extracts action items
8. **Invoice Payment Due** - Flags as action required

## 🎨 Customization

### Styling

The application uses Tailwind CSS. To customize:

1. **Colors**: Edit `tailwind.config.js`
2. **Global Styles**: Edit `app/globals.css`
3. **Component Styles**: Modify inline Tailwind classes in component files

### AI Prompt

To customize how the AI analyzes emails, edit the `ANALYSIS_PROMPT` in:

```typescript
// app/api/analyze-email/route.ts
const ANALYSIS_PROMPT = `Your custom instructions here...`;
```

### Adding New Action Types

1. Update TypeScript types in `types/index.ts`
2. Add new action type to `ActionCard.tsx` render logic
3. Update AI prompt to generate new action format
4. Add execution logic in `app/page.tsx`

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Failed to analyze email" error

**Solutions**:
- Verify your `ANTHROPIC_API_KEY` is set correctly in `.env.local`
- Check API key has sufficient credits
- Ensure you're using a valid model name
- Check browser console for detailed error messages

---

**Issue**: Emails not loading

**Solutions**:
- Verify `data/emails.json` exists and is valid JSON
- Check browser console for fetch errors
- Try hard refresh (Cmd+Shift+R or Ctrl+Shift+F5)

---

**Issue**: Styling looks broken

**Solutions**:
- Run `npm install` to ensure all dependencies are installed
- Clear `.next` cache: `rm -rf .next`
- Restart development server

---

**Issue**: TypeScript errors

**Solutions**:
- Run `npm install` to install type definitions
- Check `tsconfig.json` is present
- Restart your code editor/IDE

## 🔮 Future Enhancements

Potential features for production deployment:

- [ ] **Real Email Integration**: Connect to Gmail, Outlook, Exchange APIs
- [ ] **Multi-account Support**: Manage multiple email accounts
- [ ] **Action Execution**: Actually send emails, create calendar events
- [ ] **Learning System**: Train on user preferences over time
- [ ] **Email Composition**: AI-assisted email writing from scratch
- [ ] **Advanced Search**: Semantic search across email history
- [ ] **Mobile App**: Native iOS/Android applications
- [ ] **Team Features**: Shared inboxes and delegation
- [ ] **Analytics Dashboard**: Email productivity metrics
- [ ] **Custom Rules**: User-defined automation rules
- [ ] **Integration Hub**: Connect with Slack, Asana, Jira, etc.
- [ ] **Voice Commands**: Voice-activated email management

## 📄 License

This project is provided as-is for educational and demonstration purposes.

## 🙏 Acknowledgments

- **Anthropic** for Claude AI API
- **Next.js** team for the excellent framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for beautiful icons

## 📞 Support

For issues, questions, or contributions:
- Check the troubleshooting section above
- Review code comments for implementation details
- Consult [Next.js Documentation](https://nextjs.org/docs)
- Consult [Anthropic API Documentation](https://docs.anthropic.com/)

---

**Built with ❤️ using Next.js and Claude AI**

Last Updated: March 2026
