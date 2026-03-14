const express = require('express');
const fetch   = require('node-fetch');
const router  = express.Router();

// ── Model to use (free tier)
// Using OpenRouter's "free models router" so that if any one
// underlying free model is down, OpenRouter will automatically
// route the request to another available free model.
const MODEL = 'openrouter/free';

// ── POST /api/explain  ────────────────────────────────────
// Body: { code, language, mode, type }
//   code     : user's code string
//   language : detected language label
//   mode     : beginner | developer | deep | eli5 | summary
//   type     : "analyze" | "chat"
//   messages : (only for chat) full chat history array
// ─────────────────────────────────────────────────────────
router.post('/explain', async (req, res) => {
  try {
    const { code, language, mode, type, messages } = req.body;

    if (!type) {
      return res.status(400).json({ error: '"type" field is required (analyze | chat)' });
    }

    // ── Build messages array depending on request type
    let apiMessages = [];

    if (type === 'analyze') {
      if (!code) return res.status(400).json({ error: '"code" field is required for analyze' });

      const modeLabels = {
        beginner:  'beginner-friendly',
        developer: 'professional developer',
        deep:      'technical deep dive',
        eli5:      "explain like I'm 5 years old",
        summary:   'concise summary',
      };
      const modePrompt = modeLabels[mode] || 'developer';
      const lang = language && language !== 'Auto' ? language : '';

      const prompt = `You are a senior software engineer. Analyze this ${lang} code with a ${modePrompt} approach.

Return ONLY valid JSON with exactly these keys:
{
  "explanation": "...",
  "bugs": [{"title": "...", "description": "..."}],
  "optimizations": [{"title": "...", "description": "..."}],
  "refactored": "...",
  "language": "..."
}

CODE:
\`\`\`
${code.substring(0, 6000)}
\`\`\``;

      apiMessages = [{ role: 'user', content: prompt }];

    } else if (type === 'chat') {
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: '"messages" array is required for chat' });
      }
      apiMessages = messages; // already contains system prompt + history

    } else {
      return res.status(400).json({ error: 'Unknown type. Use "analyze" or "chat"' });
    }

    // ── Call OpenRouter API (key stays on server — never exposed)
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer':  process.env.SITE_URL  || 'http://localhost:3000',
        'X-Title':       process.env.SITE_NAME || 'CodeSense AI',
      },
      body: JSON.stringify({
        model:      MODEL,
        max_tokens: type === 'chat' ? 1000 : 4096,
        messages:   apiMessages,
      }),
    });

    if (!response.ok) {
      let msg = `OpenRouter error: ${response.status}`;
      try {
        const errData = await response.json();
        msg = errData?.error?.message || msg;
      } catch (e) {
        // If the body isn't JSON, keep the default message.
      }

      // Provide a slightly more actionable message for the frontend,
      // especially when OpenRouter itself just says "Failed to fetch".
      if (msg === 'Failed to fetch') {
        msg = 'OpenRouter could not reach the underlying model provider. Please try again in a minute, or switch to a different model.';
      }

      return res.status(response.status).json({ error: msg });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';

    // ── For analyze: parse JSON and return structured result
    if (type === 'analyze') {
      let result;
      try {
        result = JSON.parse(content.replace(/```json|```/g, '').trim());
      } catch {
        const match = content.match(/\{[\s\S]*\}/);
        if (match) result = JSON.parse(match[0]);
        else return res.status(500).json({ error: 'Could not parse AI response as JSON' });
      }
      return res.json({ ok: true, result });
    }

    // ── For chat: return raw text reply
    return res.json({ ok: true, reply: content });

  } catch (err) {
    console.error('[/api/explain] Error:', err.message);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

module.exports = router;
