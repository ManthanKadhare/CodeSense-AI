# CodeSense AI — Secure Full-Stack Setup

## 📁 Folder Structure

```
CodeSense-AI/
├── frontend/
│   └── index.html          ← Full UI (HTML + CSS + JS)
│
├── backend/
│   ├── server.js           ← Express server (serves frontend + API)
│   ├── routes/
│   │   └── explain.js      ← POST /api/explain handler
│   ├── .env                ← 🔒 Your secret API key (never commit this!)
│   ├── .gitignore
│   └── package.json
│
└── README.md
```

---

## ⚙️ How It Works

```
User Browser  →  /api/explain  →  Express Server  →  OpenRouter API
                  (no key!)         (key hidden)
```

- Frontend calls `/api/explain` — **no API key exposed**
- Backend reads key from `.env` — **fully secure**
- OpenRouter is never called from the browser

---

## 🚀 Local Setup (Step by Step)

### Step 1 — Install Node.js
Download from: https://nodejs.org (LTS version)

### Step 2 — Install dependencies
```bash
cd CodeSense-AI/backend
npm install
```

### Step 3 — Add your API key
Open `backend/.env` and replace the placeholder:
```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```
Get your free key at: https://openrouter.ai/keys

### Step 4 — Start the server
```bash
cd CodeSense-AI/backend
npm start
```

### Step 5 — Open in browser
```
http://localhost:3000
```

That's it! Your app is running securely. ✅

---

## 🔄 Development Mode (auto-restart)
```bash
cd CodeSense-AI/backend
npm run dev
```

---

## 🌐 Deploy to Render (Free — Recommended)

1. Push your project to **GitHub** (`.env` is in `.gitignore` — safe!)
2. Go to https://render.com → **New Web Service**
3. Connect your GitHub repo
4. Set these settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add **Environment Variable:**
   - Key: `OPENROUTER_API_KEY`
   - Value: `sk-or-v1-your-key`
6. Click **Deploy** → Live in ~2 minutes! 🎉

---

## 🌐 Deploy to Railway (Alternative Free Option)

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Set root to `backend/`
4. Add env var: `OPENROUTER_API_KEY=your-key`
5. Done!

---

## 🌐 Deploy to Vercel

Already have a Vercel setup (`codesense-vercel.zip`) from before.
Use that for Vercel-specific serverless deployment.

---

## 🔒 Security Checklist

- [x] API key is in `.env` — never in frontend code
- [x] `.env` is in `.gitignore` — never pushed to GitHub
- [x] Frontend has zero API keys — inspect all you want!
- [x] Backend validates all incoming requests
- [x] CORS enabled (restrict to your domain in production)

---

## 🔧 API Endpoint Reference

### POST `/api/explain`

**For code analysis:**
```json
{
  "type": "analyze",
  "code": "function hello() { ... }",
  "language": "JavaScript",
  "mode": "beginner"
}
```

**For AI chat:**
```json
{
  "type": "chat",
  "messages": [
    { "role": "system", "content": "You are a coding assistant..." },
    { "role": "user", "content": "What does this code do?" }
  ]
}
```

**Response (analyze):**
```json
{
  "ok": true,
  "result": {
    "explanation": "...",
    "bugs": [...],
    "optimizations": [...],
    "refactored": "...",
    "language": "JavaScript"
  }
}
```

**Response (chat):**
```json
{
  "ok": true,
  "reply": "This function does..."
}
```

### GET `/health`
Returns server status and confirms API key is loaded.

---

## ❓ Troubleshooting

| Problem | Solution |
|---------|----------|
| `Failed to fetch` | Make sure server is running on port 3000 |
| `API key missing` | Check backend/.env has your key |
| `Cannot find module` | Run `npm install` in backend/ folder |
| Port already in use | Change PORT in .env to 3001 |
