# AI_START_HERE

Scope
- ZANTARA Web App (GitHub Pages) is the front door for ZANTARA V2 (Cloud Run).
- Persona V2, memory hooks (retrieve/save), Quick Actions, and CORS are enabled.

Environments
- Frontend: GitHub Pages (static) → https://balizero1987.github.io/zantara_webapp
- Backend: Cloud Run (production) with CORS for the Pages origin
  - Base URL override: `window.ZANTARA_API_BASE` or `localStorage['zantara-api-base']`

Authentication
- Header: `x-api-key`
- The key is validated on the backend (never store secrets in the client for production).

Identity & Memory
- On load: `identity.resolve` (accepts `{ email }`) + `memory.retrieve`
- On each turn: `memory.save` with `last_user_message`, `last_ai_message`, `language_pref`, `last_intent`, `current_track`

Persona
- The active persona text is loaded from `persona/instructions.md` (fallback to default embedded).
- Override locally (dev): `localStorage.setItem('zantara-persona','...')` then reload.

Testing
- Open `test-api.html` on Pages
  - Buttons: Health, Team List, Contact Info, AI Chat
  - Training + Integration runner: “Run Training”, “Run Integration Tests”, “Run All”
  - Google Workspace tests (opt‑in) if OAuth2/Impersonation is configured

Dev Commands (local)
- `npm run dev` → starts local proxy (port 3003) that forwards to localhost:8080
- `npm run serve` → static server for the webapp folder

UX/Performance
- Adaptive streaming (progressive rendering) unless reduced‑motion, save‑data, or slow 2g/3g network
- Virtualized chat history (renders last 50 messages; “Load earlier” to reveal more)
- Team sync every 5’ (visible tab) / 30’ (hidden tab), with exponential backoff

LAW (Project Policy)
- Any structural code change MUST be proposed and approved for the Mother Project first (open issue/PR with rationale and obtain sign‑off). Visual-only changes are exempt.
