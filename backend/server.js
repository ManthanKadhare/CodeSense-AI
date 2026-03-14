// ============================================================
// CodeSense AI — Secure Backend Server
// ============================================================
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const path       = require('path');
const explainRouter = require('./routes/explain');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(cors());                                // allow all origins (tighten in prod)

// ── Serve frontend static files ───────────────────────────
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// ── API Routes ────────────────────────────────────────────
app.use('/api', explainRouter);

// ── Health check ─────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    time:   new Date().toISOString(),
    apiKey: process.env.OPENROUTER_API_KEY ? '✅ loaded' : '❌ missing!',
  });
});

// ── Catch-all: serve frontend for any unmatched route ─────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// ── Start ─────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════╗');
  console.log('  ║     CodeSense AI — Server        ║');
  console.log(`  ║  Running at http://localhost:${PORT}  ║`);
  console.log('  ╚══════════════════════════════════╝');
  console.log('');
  if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
    console.warn('  ⚠️  WARNING: OPENROUTER_API_KEY not set in .env!');
    console.warn('  ➜  Open backend/.env and paste your key.\n');
  } else {
    console.log('  ✅  API key loaded from .env');
    console.log('  ✅  Frontend served from /frontend\n');
  }
});
