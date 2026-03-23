# 🚀 Quick Start Guide

Get the Agentic Email Assistant running in 5 minutes!

## Prerequisites Check

✅ Node.js 18+ installed? → `node --version`
✅ Have an Anthropic API key? → [Get one here](https://console.anthropic.com/)

## Installation Steps

### 1. Install Dependencies (2 minutes)

```bash
npm install
```

### 2. Configure API Key (1 minute)

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local and add your key
# ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

### 3. Run the Application (30 seconds)

```bash
npm run dev
```

### 4. Open Browser (10 seconds)

Navigate to: **http://localhost:3000**

## First Steps

1. **Browse the Inbox** - You'll see 8 mock emails pre-loaded
2. **Select an Email** - Click on any email to view details
3. **Click "🤖 AI Analyze"** - Watch the AI analyze the email
4. **Review Suggestions** - See AI-generated summaries and actions
5. **Approve an Action** - Click "Approve & Execute" to simulate execution

## Testing Different Scenarios

The mock dataset includes:

- 📧 **VIP urgent meeting request** → Creates calendar event
- 📋 **Project with action items** → Extracts task list  
- 💬 **Client questions** → Drafts professional reply
- ℹ️ **Newsletter** → Auto-categorized as FYI

## Troubleshooting

**"Failed to analyze email" error?**
→ Check your API key in `.env.local`

**Emails not showing?**
→ Hard refresh browser (Cmd+Shift+R)

**Port 3000 in use?**
→ Use `npm run dev -- -p 3001` to run on different port

## Next Steps

- 📖 Read full [README.md](README.md) for detailed documentation
- 🎨 Customize the UI in `components/` directory
- 🤖 Modify AI prompts in `app/api/analyze-email/route.ts`
- 📧 Add your own test emails in `data/emails.json`

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run linter

# Troubleshooting
rm -rf .next           # Clear Next.js cache
rm -rf node_modules    # Remove dependencies
npm install            # Reinstall dependencies
```

## Need Help?

- Check the detailed [README.md](README.md)
- Review code comments in source files
- Check browser console for errors
- Verify API key has credits at [console.anthropic.com](https://console.anthropic.com/)

---

**Happy coding! 🎉**
