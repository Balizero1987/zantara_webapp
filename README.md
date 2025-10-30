# ZANTARA Web App

Production webapp deployed at https://zantara.balizero.com

Web interface for ZANTARA V2 – Bali Zero AI Assistant

## 🚀 Features
- Team management interface with PIN authentication
- Real-time SSE streaming chat
- API Contracts (automatic fallback system)
- Citations & smart suggestions
- Bali Zero theme (gold/dark aesthetic)
- Cloudflare Pages deployment (300+ edge locations)

## 📦 Deployment

**Platform:** Cloudflare Pages (migrated from GitHub Pages Oct 30, 2025)
**Performance:** 60% faster latency (300+ global edge locations)

**Live URLs:**
- Production: https://zantara.balizero.com/
- Cloudflare: https://zantara-webapp.pages.dev/

**Automatic Deployment:**
1. Edit files in `website/zantara webapp/`
2. Push to `main` branch
3. GitHub Actions triggers Cloudflare Pages deploy (~2 min)
4. Live on https://zantara.balizero.com/

**Manual Deploy:**
```bash
# Via GitHub CLI
gh workflow run deploy-webapp-cloudflare.yml

# Or via GitHub UI
https://github.com/Balizero1987/nuzantara/actions/workflows/deploy-webapp-cloudflare.yml
```

**Backend CORS:** Enable for origins:
- https://zantara.balizero.com
- https://zantara-webapp.pages.dev

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
