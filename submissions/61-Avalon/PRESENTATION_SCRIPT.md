# MailMate - 15 Minute Presentation Script

**Team 61 - Avalon | 3 Speakers**

> Read this naturally. Pause where you see [pause]. Lines starting with [ACTION] mean do something on screen.

---

## SPEAKER 1 — Problem, Solution & Product Vision (5 minutes)

### Opening (0:00 - 1:00)

Good morning/afternoon everyone. We are Team 61 - Avalon. I'm [Name], and with me are [Name 2] and [Name 3].

Today we're presenting **MailMate** — an AI-powered email assistant that we built during this hackathon.

Before I show you the product, let me start with a question. [pause]

How many of you checked your email this morning? [pause] And how many of you felt like you spent way too long doing it?

### The Problem (1:00 - 2:30)

Here's the reality. The average professional spends **2 to 3 hours every single day** just on email. And most of that time isn't even writing replies. It's reading long threads, trying to understand context, figuring out what's urgent, what needs a response, what has a deadline, and what meetings are buried somewhere in paragraph three of an email from last Tuesday.

It's repetitive cognitive work. You're essentially doing the same thing over and over — read, understand, prioritize, respond, extract action items, schedule meetings. Every single day.

And the tools we have right now don't solve this. Gmail gives you 3 short smart replies like "Sounds good" or "Thanks." That's it. You still have to do all the heavy lifting yourself.

### Our Solution (2:30 - 4:00)

So we built MailMate. [pause]

MailMate connects to your real Gmail account and becomes your AI-powered email assistant. With one click, it analyzes any email thread and gives you everything you need — a summary of the conversation, the priority level, a full drafted reply, detected meetings that you can add to Google Calendar instantly, extracted tasks with deadlines, and even key information like links, contacts, and amounts mentioned in the email.

But it's not just analysis. You can actually reply to emails, compose new ones, and use AI writing tools to polish your drafts — fix grammar, make it more formal, shorten it, or elaborate on it. And if you need to ask a specific question about an email, there's a built-in AI chat assistant that understands the full context of whatever thread you're looking at.

The key idea here is **human-in-the-loop**. The AI does the heavy lifting — reading, summarizing, drafting — but you make every final decision. You review the summary, you edit the reply, you choose whether to add that meeting to your calendar. AI assists, you decide.

### What Makes It Different (4:00 - 5:00)

Three things make MailMate stand out.

First — it's a **real email client**, not a toy demo. When you connect your Google account, it fetches your actual emails, sends real replies through Gmail, and creates real events on your Google Calendar.

Second — the analysis is **comprehensive**. We're not just giving you a summary. One API call extracts summary, priority, category, smart replies, a full draft, meetings, tasks, deadlines, key info, follow-up detection, and sender importance. All structured, all actionable.

Third — it works **without an account too**. We have a full demo mode with realistic mock emails, so you can explore every feature without connecting your Gmail. Which is exactly what [Speaker 2] is about to show you.

[Speaker 2], take it away.

---

## SPEAKER 2 — Live Demo (5 minutes)

### Landing Page (5:00 - 5:30)

Thanks [Speaker 1].

[ACTION: Open the app in browser - localhost:3000 or deployed URL]

So this is MailMate. You're looking at our landing page right now. It gives users an overview of the product — features, how it works, integrations, security, and pricing tiers. This is the marketing side.

[ACTION: Scroll through 2-3 sections quickly]

But the real product is inside. Let me click "Get Started."

[ACTION: Click the Get Started / CTA button]

### Inbox Overview (5:30 - 6:30)

And here's the inbox. Let me walk you through the layout.

[ACTION: Point to each section as you describe it]

On the left, we have the **sidebar** — this is your navigation. Inbox, Starred, Snoozed, Sent, Drafts, Calendar, Trash, All Mail. Below that you can see categories like Work, Personal, Finance — these are quick filters. And below that, custom labels that you can create yourself.

In the middle, we have the **thread list**. Each email shows the sender, subject line, a preview of the content, the timestamp, and if it's been analyzed, you'll see priority dots and category badges.

On the right is where the **email content** appears when you click on a thread.

Let me click on this email here — "Q2 Budget Review."

[ACTION: Click on a thread with good mock data]

### Email View (6:30 - 7:30)

So now you can see the full email conversation. This tab says "Emails" — it shows every message in the thread with sender info, timestamps, and the full body.

You can see there are action buttons up here — star, snooze, archive, trash, mark as unread. And we have labels — I can add custom labels to any thread.

Now, here's where the magic happens. Watch what happens when I click the **AI Analysis** tab.

[ACTION: Click "AI Analysis" tab]

### AI Analysis (7:30 - 9:00)

[ACTION: Wait for analysis to load — there will be a loading spinner]

And there it is. [pause] In about a second, the AI has analyzed the entire email thread. Let me walk you through what we get.

At the top — **Executive Summary**. Three bullet points that capture the entire conversation. No need to read through paragraphs of back-and-forth.

Right below that — **Priority** is marked as urgent, and the **category** is work. The AI figured that out from the content.

Next — **Quick Replies**. Two options — one positive, one negative. If I click one of these...

[ACTION: Click a smart reply]

...it loads directly into the reply composer at the bottom. Ready to send.

Here's the **full drafted reply** — a complete professional response generated from the thread context. You can copy it or edit it.

Now look at this — **Meeting Actions**. The AI detected a meeting mentioned in the email. It extracted the title, date, time, and attendees. And see this button? "Add to Calendar." One click and it creates a Google Calendar event. That's a real API call.

Below that — **Extracted Tasks** with deadlines and priority levels. And **Deadlines** that are flagged as urgent if they're within 3 days.

And finally — **Key Information**. Dates, links, contacts, and monetary amounts pulled out of the thread so you don't miss anything.

### AI Writing Tools & Chat (9:00 - 10:00)

Let me show you two more things quickly.

[ACTION: Click into the reply composer, type or use the loaded reply]

See these buttons below the text area? **Fix Grammar, Formalize, Shorten, Elaborate**. These are AI writing tools. Let me click "Formalize."

[ACTION: Click Formalize]

The AI just rewrote the reply in a more professional tone. And it knows the recipient's name from the email thread, so it uses real names — no "[Recipient Name]" placeholders.

One more thing — let me open the **AI Chat**.

[ACTION: Click "AI Chat" button in header]

This is a conversational assistant. It knows the context of whatever email I have selected. So I can ask it things like...

[ACTION: Type "What are the key action items from this email?" and send]

And it gives me a direct answer based on the email content.

That's the full product. [Speaker 3] will now explain how we built it.

---

## SPEAKER 3 — Tech Stack, Architecture & Closing (5 minutes)

### Tech Stack (10:00 - 11:30)

Thanks [Speaker 2].

Let me break down how we built this.

The entire application runs on **Next.js 15** with **TypeScript** and **React 19**. Next.js gives us both the frontend that you just saw, and the backend API routes that handle all the server-side logic — all in one project.

For the UI, we used **Tailwind CSS** for styling and **Radix UI** — also known as shadcn/ui — for our component library. That's what gives us all those polished buttons, dropdowns, dialogs, and scroll areas you saw in the demo.

The AI is powered by **Groq**. Groq runs Meta's **LLaMA 3.3 70B** model — that's a 70 billion parameter language model — with extremely fast inference. When you saw the analysis load in about a second during the demo? That's Groq. We chose it over OpenAI specifically because of the speed and the free tier.

For authentication, we use **NextAuth.js** with **Google OAuth 2.0**. That's what lets users sign in with their Google account and gives us access to the **Gmail API** for reading and sending emails, and the **Google Calendar API** for viewing and creating events.

### Architecture (11:30 - 13:00)

Let me explain the data flow because this is important for understanding the security model.

When a user clicks "AI Analysis," here's what happens:

Step one — the browser sends the email thread content to our Next.js API route at `/api/analyze`.

Step two — our server takes that content, adds a structured system prompt that defines exactly what we want back, and sends it to Groq's API.

Step three — Groq's AI model processes the thread and returns a structured JSON response with all the fields — summary, priority, replies, meetings, tasks, everything.

Step four — our server validates that JSON, applies safe defaults for any missing fields, and sends it back to the browser.

The important thing here — the **Groq API key never leaves our server**. The user's browser never sees it. Same with the Gmail API calls — the user's OAuth token is managed by NextAuth in an encrypted session cookie.

And here's a design decision we made — **we don't store any user data on a server**. All the analysis results, your starred emails, your labels, your drafts — everything is cached in the browser's localStorage. This means there's no database to manage, no privacy concerns about storing someone's email data, and the app works entirely offline after the initial load.

### Edge Cases & Reliability (13:00 - 14:00)

We put a lot of thought into handling edge cases.

If the **Gmail API fails** — maybe there's a network issue — we show an error banner but the app keeps working with whatever data was already loaded. Users can retry with the refresh button.

If the **AI returns malformed output** — which can happen with large language models — we strip any markdown wrapping, parse with try-catch, and provide safe defaults for every single field. The app never crashes because of a bad AI response.

If the user **isn't signed into Google**, the app automatically loads with 12 realistic mock email threads. Every feature works — analysis, chat, replies, everything. This is our demo mode and it's what you saw in the presentation today.

We also handle **token expiration** automatically. Google access tokens expire after one hour, and NextAuth refreshes them in the background using the refresh token. The user never gets logged out mid-session.

### Future Scope & Closing (14:00 - 15:00)

If we were to take this further, the next steps would be:

- Replace localStorage with a database like **Supabase** or **PostgreSQL** for server-side persistence and multi-device sync — we've already scaffolded the integration code for this
- Add **team collaboration** — shared inboxes, delegated replies, shared labels
- Build a **mobile app** using React Native with the same API routes
- Add **email scheduling** — write now, send later
- Implement **batch analysis** — analyze your entire inbox at once and surface what needs attention

But even without those features, what we have today is a fully functional AI email assistant that connects to real Gmail, provides comprehensive AI analysis, and helps users manage their inbox significantly faster.

[pause]

Thank you. We're happy to take any questions.

---

## BACKUP: If Something Breaks During Demo

If the app crashes or the AI doesn't respond:

**Speaker 2 says:** "Looks like we're having a connectivity issue. Let me switch to showing you the code structure instead."

Then open the project in VS Code or a file browser and talk through:
- "Here's our API route for analysis — it takes the email thread, sends it to Groq with this structured prompt, and parses the response"
- "Here's the inbox page — about 2,600 lines of React that handles the entire email client interface"
- "And here are our 12 landing page components"

This shows judges you understand the codebase even if the live demo fails.

---

## QUICK REFERENCE: If Judges Ask Rapid-Fire Questions

| Question | Short Answer |
|----------|-------------|
| What AI model? | LLaMA 3.3 70B via Groq |
| Why not OpenAI? | Groq is faster and has a free tier |
| Where's user data stored? | Browser localStorage only, no server database |
| Is it a real email client? | Yes, sends/receives real Gmail with OAuth |
| How do you handle bad AI output? | JSON validation with safe defaults for every field |
| What's the tech stack? | Next.js 15, React 19, TypeScript, Tailwind, Radix UI, Groq, NextAuth, Gmail API, Calendar API |
| Can it scale? | Yes — swap localStorage for a database, add rate limiting, deploy on Vercel |
| What about privacy? | No server-side data storage, API keys server-only, OAuth 2.0 standard |
| How long did it take? | Built during the hackathon |
| What's the hardest part? | Getting structured JSON output from the AI reliably and handling all edge cases |
