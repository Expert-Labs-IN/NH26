# GitHub Setup Guide
**For Fadil & Hamood — National Hackathon 2026**

---

## Step 1 — Fadil creates the repo (do this once)

```bash
# On Fadil's machine
mkdir email-triage
cd email-triage
git init
git branch -M main

# Create initial structure
mkdir client server
touch README.md .gitignore

# First commit
git add .
git commit -m "chore: initial repo setup"

# Create repo on GitHub (github.com → New Repository → email-triage → Public)
git remote add origin https://github.com/YOUR_USERNAME/email-triage.git
git push -u origin main
```

---

## Step 2 — Both developers clone and create their branches

**Fadil:**
```bash
git clone https://github.com/YOUR_USERNAME/email-triage.git
cd email-triage
git checkout -b fadil/backend
# Copy your server/ folder in here
git add server/
git commit -m "feat: Phase 1 Express backend + Ollama integration"
git push origin fadil/backend
```

**Hamood:**
```bash
git clone https://github.com/YOUR_USERNAME/email-triage.git
cd email-triage
git checkout -b hamood/ui
# Copy your client/ folder in here
git add client/
git commit -m "feat: Phase 1 React frontend scaffold"
git push origin hamood/ui
```

---

## Step 3 — Merge Phase 1 into main (do together)

```bash
# On GitHub: open Pull Request from fadil/backend → main → Merge
# On GitHub: open Pull Request from hamood/ui → main → Merge

# Both pull latest main locally
git checkout main
git pull origin main

# Test end-to-end:
# Terminal 1: OLLAMA_ORIGINS=* ollama serve
# Terminal 2: cd server && npm install && npm run dev
# Terminal 3: cd client && npm install && npm run dev
```

---

## Step 4 — Continue Phase 2 on your branches

```bash
# Each person continues on their branch
git checkout fadil/backend   # or hamood/ui
# ... make changes ...
git add .
git commit -m "feat: add Groq fallback + rate limiter"
git push origin fadil/backend
```

---

## Commit Message Convention

| Prefix | Use for |
|--------|---------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Config, deps, tooling |
| `style:` | CSS/UI polish only |
| `refactor:` | Code restructure, no behaviour change |
| `docs:` | README, comments |

---

## Branch Rules

- ❌ Never commit directly to `main`
- ✅ Always work on your own branch
- ✅ Merge to `main` only at phase boundaries
- ✅ Test end-to-end before every merge
- ✅ Both `.env` files must be in `.gitignore` — never commit real keys
