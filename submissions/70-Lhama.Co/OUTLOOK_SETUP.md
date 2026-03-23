# Outlook Integration Setup Guide
**Complete step-by-step — takes about 10 minutes**

---

## What This Unlocks

Once set up, clicking "Connect Outlook" in the app will:
- Load your **real Outlook inbox** instead of mock emails
- **Actually send replies** from your Outlook account when you click Approve
- **Actually create calendar events** in your Outlook calendar
- **Actually create tasks** in your Microsoft To-Do

---

## Step 1 — Sign in to Azure Portal

Go to **[https://portal.azure.com](https://portal.azure.com)**

Sign in with your Microsoft account (the same one whose Outlook inbox you want to use). This can be:
- A personal Outlook.com / Hotmail / Live account
- A work or school Microsoft 365 account

> **Note:** If you use a work account, your IT admin may need to approve the app. Personal accounts work instantly.

---

## Step 2 — Create an App Registration

1. In the Azure Portal search bar, type **"App registrations"** and click it
2. Click **"+ New registration"**
3. Fill in the form:

| Field | Value |
|-------|-------|
| **Name** | `TriageAI` |
| **Supported account types** | `Accounts in any organizational directory and personal Microsoft accounts` |
| **Redirect URI (platform)** | `Web` |
| **Redirect URI (value)** | `http://localhost:3001/api/auth/callback` |

4. Click **Register**

You'll land on the app's Overview page. **Copy the "Application (client) ID"** — you need this.

---

## Step 3 — Create a Client Secret

1. In the left sidebar, click **"Certificates & secrets"**
2. Click **"+ New client secret"**
3. Fill in:

| Field | Value |
|-------|-------|
| **Description** | `TriageAI Secret` |
| **Expires** | `180 days` (or longer) |

4. Click **Add**
5. **IMMEDIATELY copy the "Value" column** — it only shows once!

> ⚠️ The secret value is only visible right after creation. If you navigate away, you'll need to create a new one.

---

## Step 4 — Add API Permissions

1. In the left sidebar, click **"API permissions"**
2. Click **"+ Add a permission"**
3. Click **"Microsoft Graph"**
4. Click **"Delegated permissions"**
5. Search for and add each of these:

| Permission | What it enables |
|-----------|----------------|
| `Mail.Read` | Read your inbox emails |
| `Mail.Send` | Send emails from your account |
| `Calendars.ReadWrite` | Create calendar events |
| `Tasks.ReadWrite` | Create Microsoft To-Do tasks |
| `User.Read` | Get your name and email address |
| `offline_access` | Stay connected without re-logging in |

6. After adding all 6, click **"Grant admin consent for [your name]"** and confirm

> The status column should show green checkmarks for all permissions.

---

## Step 5 — Add Redirect URI for Production (optional)

If you're deploying to Railway, add a second redirect URI:

1. In the left sidebar, click **"Authentication"**
2. Under "Web" → "Redirect URIs", click **"+ Add URI"**
3. Add: `https://your-railway-app.railway.app/api/auth/callback`
4. Click **Save**

---

## Step 6 — Add Credentials to Your .env File

Open `server/.env` and add:

```env
# Microsoft OAuth credentials
MICROSOFT_CLIENT_ID=paste_your_client_id_here
MICROSOFT_CLIENT_SECRET=paste_your_client_secret_here
MICROSOFT_REDIRECT_URI=http://localhost:3001/api/auth/callback
```

Replace the values with what you copied from steps 2 and 3.

---

## Step 7 — Restart the Backend

```bash
# In Terminal 2 (server)
# Press Ctrl+C to stop, then:
npm run dev
```

You should see:
```
[server] Microsoft OAuth: ✅ configured
```

---

## Step 8 — Connect Outlook in the App

1. Open the app at `http://localhost:5173`
2. Click **"Connect Outlook"** in the header
3. A Microsoft login page opens
4. Sign in with your Microsoft account
5. Grant the requested permissions
6. You're redirected back to the app
7. A toast shows **"✓ Connected to Outlook — your@email.com"**
8. The inbox reloads with your real emails

---

## What Happens When You Approve Actions

| Action | With Outlook connected | Without Outlook |
|--------|----------------------|-----------------|
| **Approve Reply** | Email is sent from your Outlook account | Logged locally only |
| **Add to Calendar** | Event created in your Outlook calendar | Logged locally only |
| **Create Tasks** | Tasks created in Microsoft To-Do | Logged locally only |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "MICROSOFT_NOT_CONFIGURED" error | Check `MICROSOFT_CLIENT_ID` is in `server/.env` |
| Redirect error after login | Verify the Redirect URI in Azure exactly matches your `.env` |
| "AADSTS50011" error | Redirect URI mismatch — check Azure → Authentication → Redirect URIs |
| "Permission denied" error | Go back to Azure → API permissions → Grant admin consent |
| Work account blocked | Ask your IT admin to approve the app, or use a personal account |
| Token expired mid-demo | The app auto-refreshes tokens — just click Connect again if it fails |
| Tasks not appearing | Check Microsoft To-Do app — they may be in a list called "Tasks" |
| Calendar event not visible | Check Outlook calendar — it may be created in UTC timezone |

---

## Quick Summary

```
Azure Portal
  → App registrations
    → New registration (name: TriageAI, redirect: http://localhost:3001/api/auth/callback)
      → Copy Application (client) ID
      → Certificates & secrets → New secret → Copy Value
      → API permissions → Add: Mail.Read, Mail.Send, Calendars.ReadWrite, Tasks.ReadWrite, User.Read, offline_access
      → Grant admin consent

server/.env:
  MICROSOFT_CLIENT_ID=<client id>
  MICROSOFT_CLIENT_SECRET=<secret value>
  MICROSOFT_REDIRECT_URI=http://localhost:3001/api/auth/callback

Restart server → Click "Connect Outlook" → Done ✅
```
