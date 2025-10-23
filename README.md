# ZANTARA Web App

I'm working on ZANTARA WEB APP project at https://balizero1987.github.io/zantara_webapp

Web interface for ZANTARA V2 – Bali Zero AI Assistant

## 🚀 Features
- Team management interface
- Real-time sync with ZANTARA backend
- PWA support
- GitHub Pages deployment ready

## 📦 Setup
1. Clone repository
2. Push to GitHub and enable GitHub Pages (branch main, folder root)
3. Backend: enable CORS on Cloud Run for Origins https://balizero1987.github.io and https://zantara.balizero.com
4. Optional: override API base via localStorage key `zantara-api-base`

Please, before doing anything:
- Read AI_START_HERE.md and ZANTARA_Complete_Test_Suite_WEBAPP.md
- Check HANDOVER_LOG.md for the last working session
- Review TODO_CURRENT.md for current tasks and priorities

LAW (Project Policy):
- Any structural code change (not visual-only) MUST be proposed first and approved for implementation in the Mother Project. Open an issue/PR with rationale and get sign‑off before merging.

## 🔧 Backend Environment (from main project)
Configure these variables on Cloud Run (prefer Secrets for keys). Names and guidance come from the main ZANTARA project.

- OPENAI_API_KEY (Secret) — required for ai.chat
- GEMINI_API_KEY (Secret) — optional if using Gemini routing
- COHERE_API_KEY (Secret) — optional if using Cohere routing
- ANTHROPIC_API_KEY (Secret) — optional if using Claude routing
- API_KEYS_INTERNAL, API_KEYS_EXTERNAL — comma‑separated lists of allowed x‑api-key values (see AI_START_HERE.md)
- API_KEY — some deploy scripts set a single API key for Google Chat integrations
- GOOGLE_APPLICATION_CREDENTIALS — path to mounted SA JSON (via Secret) for Workspace handlers
- USE_OAUTH2=true — enable Google Workspace OAuth2/Impersonation
- IMPERSONATE_USER=zero@balizero.com — optional, for domain‑wide delegation
- CORS_ORIGINS=https://balizero1987.github.io,http://localhost:3000,http://127.0.0.1:3000 — allow webapp origins
- NODE_ENV=production, PORT=8080 — runtime defaults
- Optional: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI, GOOGLE_SCOPES, GOOGLE_OAUTH_TOKENS_SECRET (for OAuth flows)
- Optional: REDIS_URL (if caching layer is used)

Reference (main project files):
- deploy-v520-production.sh (secrets mapping)
- AI_START_HERE.md (x‑api‑key policies)
- config.(ts|js) (schema of required env vars)

## 🔗 Backend
Connected to ZANTARA v5.2.0 production API (Cloud Run)

Quick Links
- AI_START_HERE.md
- ZANTARA_Complete_Test_Suite_WEBAPP.md
- HANDOVER_LOG.md
- TODO_CURRENT.md

Notes
- The client never needs public CORS proxies: backend exposes proper CORS.
- For local development, a small dev proxy runs on port 3003 (`npm run dev`).

## 🔌 Production Base (Cloud Run)

- Service: `zantara-v520-production` (region: `europe-west1`)
- Set base at runtime (DevTools console):
  ```js
  window.ZANTARA_API.setBase('https://<your-cloud-run-service-url>');
  ```
- Or from the Test Console UI (`test-api.html`): field "Set API Base" → Set Base
- Persist locally: saved in `localStorage['zantara-api-base']`

Verify connectivity from CLI or Test Console (Contact Info, Team List, AI Chat should be 200).

## 📝 License
© 2025 Bali Zero. All rights reserved.
