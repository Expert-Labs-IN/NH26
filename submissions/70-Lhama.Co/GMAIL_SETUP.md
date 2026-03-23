# Gmail Integration Setup Guide
**Complete step-by-step — takes about 10 minutes. Completely free.**

---

## What This Unlocks

Once set up, clicking "📧 Gmail" in the app will:
- Load your **real Gmail inbox** instead of mock emails
- **Actually send replies** from your Gmail when you click Approve Reply
- **Actually create events** in your Google Calendar
- **Actually create tasks** in your Google Tasks

---

## Step 1 — Go to Google Cloud Console

Open **[https://console.cloud.google.com](https://console.cloud.google.com)**

Sign in with the **Gmail account** whose inbox you want to use.

---

## Step 2 — Create a Project

1. Click the **project dropdown** at the top (next to "Google Cloud")
2. Click **"New Project"**
3. Name: `TriageAI`
4. Click **Create**
5. Wait a few seconds, then select the new project from the dropdown

---

## Step 3 — Enable Required APIs

You need to enable 4 APIs. For each one:
1. Click the **search bar** at the top
2. Search for the API name
3. Click it → Click **Enable**

Enable these 4:

| API | What it does |
|-----|-------------|
| **Gmail API** | Read inbox + send emails |
| **Google Calendar API** | Create calendar events |
| **Tasks API** | Create Google Tasks |
| **People API** | Get your display name |

---

## Step 4 — Configure OAuth Consent Screen

Before creating credentials, Google needs to know about your app.

1. Left sidebar → **APIs & Services → OAuth consent screen**
2. Select **External** → Click **Create**
3. Fill in **App information**:

| Field | Value |
|-------|-------|
| App name | `TriageAI` |
| User support email | Your Gmail address |
| Developer contact email | Your Gmail address |

4. Click **Save and Continue**
5. On the **Scopes** screen → Click **Save and Continue** (skip for now)
6. On the **Test users** screen:
   - Click **+ Add Users**
   - Add your Gmail address
   - Click **Save and Continue**
7. Click **Back to Dashboard**

> **Why "Test users"?** While the app is in "Testing" mode (not published), only accounts you add as test users can log in. For the hackathon, just add your own email.

---

## Step 5 — Create OAuth Credentials

1. Left sidebar → **APIs & Services → Credentials**
2. Click **+ Create Credentials → OAuth client ID**
3. Application type: **Web application**
4. Name: `TriageAI`
5. Under **Authorized redirect URIs** → click **+ Add URI**
6. Add: `http://localhost:3001/api/auth/google/callback`
7. Click **Create**

A dialog appears with your credentials. **Copy both values:**
- **Client ID** — looks like `123456789-abc.apps.googleusercontent.com`
- **Client Secret** — looks like `GOCSPX-abc123xyz`

> Click **Download JSON** too as a backup.

---

## Step 6 — Add Credentials to Your .env File

Open `server/.env` and add:

```env
GOOGLE_CLIENT_ID=paste_your_client_id_here
GOOGLE_CLIENT_SECRET=paste_your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback
```

---

## Step 7 — Restart the Backend

```bash
cd server
# Press Ctrl+C to stop, then:
npm run dev
```

You should see:
```
[server] Google OAuth: ✅ configured
```

---

## Step 8 — Connect Gmail in the App

1. Open `http://localhost:5173`
2. Click the **📧 Gmail** button in the header
3. Google login page opens — sign in with your Gmail account
4. Click **Allow** on the permissions screen
5. You're redirected back to the app
6. Toast shows **"✓ Connected to Gmail — your@gmail.com"**
7. Inbox reloads with your real Gmail messages

---

## What Happens When You Approve Actions

| Action | With Gmail connected | Without Gmail |
|--------|---------------------|---------------|
| **Approve Reply** | Email sent from your Gmail account | Logged locally |
| **Add to Calendar** | Event created in Google Calendar | Logged locally |
| **Create Tasks** | Tasks created in Google Tasks | Logged locally |

---

## Priority Order (when both are configured)

If you connect **both** Gmail and Outlook, the app uses:
```
Gmail first → Outlook second → Mock data last
```

You can connect both simultaneously — one for the inbox, disconnect and connect the other.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "GOOGLE_NOT_CONFIGURED" | Check `GOOGLE_CLIENT_ID` is in `server/.env` |
| "redirect_uri_mismatch" | The redirect URI in Google Cloud must exactly match your `.env` — check for trailing slashes |
| "Access blocked: app not verified" | You're not in test users list — go to OAuth consent screen → Test users → add your email |
| "No refresh token received" | The login URL includes `prompt=consent` which forces re-consent. Try logging out and back in. If issue persists, go to [https://myaccount.google.com/permissions](https://myaccount.google.com/permissions), revoke TriageAI, then reconnect. |
| Tasks not appearing | Open **Google Tasks** in Gmail sidebar or [tasks.google.com](https://tasks.google.com) |
| Calendar event not visible | Check [calendar.google.com](https://calendar.google.com) — events created in UTC timezone |
| Reply not sending | Check Gmail Sent folder to confirm |
| Only 20 emails show | The app fetches latest 20 inbox emails by default (excluding Promotions and Social) |

---

## For Production Deployment

If you deploy to Railway/Vercel, add the production redirect URI:

1. Google Cloud → APIs & Services → Credentials → click your OAuth client
2. Under "Authorized redirect URIs" → **+ Add URI**
3. Add: `https://your-railway-app.railway.app/api/auth/google/callback`
4. Click **Save**
5. Update `GOOGLE_REDIRECT_URI` in Railway environment variables

---

## Quick Summary

```
console.cloud.google.com
  → New Project (TriageAI)
  → Enable: Gmail API, Calendar API, Tasks API, People API
  → OAuth consent screen → External → add your email as test user
  → Credentials → OAuth client ID → Web → add redirect URI
    http://localhost:3001/api/auth/google/callback
  → Copy Client ID + Client Secret

server/.env:
  GOOGLE_CLIENT_ID=<client id>
  GOOGLE_CLIENT_SECRET=<client secret>
  GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

Restart server → Click "📧 Gmail" → Done ✅
```
