

# 🌪️ EmailAssist AI: Your Smart Email Helper

Ever feel **overwhelmed** by your inbox? EmailAssist AI is like having a **personal assistant** that reads, organizes, and even replies to your emails for you — powered by Artificial Intelligence.

---

## 🤔 What Does It Actually Do?

Imagine opening your email and instead of 50 unread messages screaming for attention, you see a **clean dashboard** that tells you:

- ✅ Which emails **need your attention right now**
- 📋 Which ones are just **"for your info"** (skip for later)
- 📅 Which ones have **meetings or deadlines** hidden in them
- ✍️ **Draft replies** already written for you in the right tone

That's EmailAssist AI.

---

## ✨ Key Features (In Plain English)

### 🧠 Smart Summaries
Long email thread with 47 replies? The AI reads it all and gives you a **one-line summary** so you get the gist in seconds.

### 🚥 Auto Priority Sorting
Every email gets tagged automatically:
| Tag | What It Means |
|-----|---------------|
| 🔴 **Urgent** | Drop everything — this needs a reply NOW |
| 🟡 **Requires Action** | You need to do something, but it can wait a bit |
| 🟢 **FYI** | Just informational — read when you have time |

### ⚡ Autopilot Mode
Set rules in **plain English** and the AI follows them. For example:
> *"If my boss emails about a meeting, auto-accept and add it to my calendar."*
> *"Always reply formally to emails from investors."*
> *"Flag any email mentioning 'invoice' as urgent."*

The AI reads every incoming email, checks your rules, and **takes action automatically**.

### 📅 Meeting & Task Detection
If someone says *"Let's meet Thursday at 3 PM"* buried in a paragraph, the AI **catches it** and can create a calendar event for you with one click.

### ✍️ Tone-Aware Reply Writing
Need to reply but don't know what to say? The AI drafts a reply for you. You can choose the tone:
- 👔 **Formal** — for clients and executives
- 😊 **Friendly** — for teammates and friends
- 📝 **Concise** — short and to the point
- 🤝 **Professional** — balanced and polished

### 🧠 It Remembers You
The AI **learns your preferences** over time. It remembers who you are, what you do, and your past interactions — so every suggestion gets **more personalized** the more you use it.

### 🔒 Safe & Secure
- You log in with your **Google account** (the same way you sign into other apps with "Sign in with Google")
- We **never store your Google password**
- Your data stays private

---

## 🎯 How It Works (The Simple Version)

```
1. 🔑 You sign in with your Google account
         ↓
2. 📬 The app pulls your latest emails from Gmail
         ↓
3. 🤖 AI reads and analyzes every email
         ↓
4. 📊 You see a clean dashboard with summaries,
      priorities, tasks, and draft replies
         ↓
5. ✅ You approve, edit, or dismiss suggestions
      with a single click
```

That's it. No complicated setup, no learning curve.

---

## 🧰 What's Under the Hood?

> *You don't need to understand this section to use EmailAssist AI.
> This is for developers or curious minds who want to know how it's built.*

<details>
<summary>🖥️ <b>Frontend (What You See)</b> — Click to expand</summary>

| Tool | What It Does |
|------|-------------|
| **Next.js 15** | The framework that builds the website |
| **React 19** | Makes the interface interactive (buttons, clicks, etc.) |
| **Tailwind CSS v4** | Makes everything look clean and modern |
| **Framer Motion** | Adds smooth animations |
| **Next-Auth v5** | Handles "Sign in with Google" securely |

</details>

<details>
<summary>⚙️ <b>Backend (The Brain)</b> — Click to expand</summary>

| Tool | What It Does |
|------|-------------|
| **FastAPI** | The server that processes your emails behind the scenes |
| **Llama-3.3-70b** | The AI model that reads and understands your emails (hosted by NVIDIA) |
| **Supermemory** | Gives the AI long-term memory about you and your preferences |
| **MongoDB** | The database that stores your settings and data |

</details>

<details>
<summary>🔗 <b>Services & APIs</b> — Click to expand</summary>

| Service | What It Does |
|---------|-------------|
| **Gmail API** | Lets the app read and send emails on your behalf (with your permission) |
| **Google Calendar API** | Lets the app create calendar events for detected meetings |
| **NVIDIA NIM** | Runs the powerful AI model in the cloud |
| **Supermemory API** | Stores and retrieves context about you for personalized results |

</details>

---

## 🚀 Want to Run It Yourself?

> **Who is this for?** Developers who want to set up their own copy of EmailAssist AI.
> If you just want to use the app, you can skip this section.

### What You'll Need
- **Node.js** (v18 or newer) — [Download here](https://nodejs.org/)
- **Python** (3.12 or newer) — [Download here](https://www.python.org/)
- **uv** (a modern Python tool) — [Get it here](https://github.com/astral-sh/uv)

### Step 1: Download the Code
```bash
git clone https://github.com/your-repo/emailassist-ai.git
cd emailassist-ai
```

### Step 2: Set Up the Backend (the AI brain)
```bash
cd "Auro University"
uv sync
```

Create a file called `.env` in this folder and add your API keys:
```env
NVIDIA_NIM_API_KEY=paste_your_nvidia_key_here
SUPERMEMORY_API_KEY=paste_your_supermemory_key_here
```
> 💡 **Where do I get these keys?**
> - NVIDIA NIM API Key → [NVIDIA Developer Portal](https://build.nvidia.com/)
> - Supermemory API Key → [Supermemory.ai](https://supermemory.ai)

Start the backend:
```bash
uv run python main.py
```

### Step 3: Set Up the Frontend (the website)
Open a **new terminal** and run:
```bash
cd emailassist
npm install
```

Create a file called `.env.local` and add:
```env
# Google Sign-In (get these from Google Cloud Console)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Security key (any random 32-character string)
NEXTAUTH_SECRET=your_32_character_random_secret
NEXTAUTH_URL=http://localhost:3000

# Database connection
MONGODB_URI=mongodb://127.0.0.1:27017/emailassist

# Where the backend is running
FASTAPI_URL=http://127.0.0.1:8000
```

Start the website:
```bash
npm run dev
```

Now open **http://localhost:3000** in your browser! 🎉

---

## 💡 Tips for Best Results

> **For Autopilot rules**, be specific:
> - ✅ *"If an email from Sarah mentions 'meeting', accept and add to calendar"*
> - ❌ *"Handle Sarah's emails"* (too vague)

> **The AI gets smarter over time.** The more you use it, the better it understands your preferences and communication style.

---

## 📄 License
This project is **open source** under the MIT License — meaning anyone can use, modify, and share it freely.

---

Built with ❤️ by the **Auro-Strawhats** Team.
