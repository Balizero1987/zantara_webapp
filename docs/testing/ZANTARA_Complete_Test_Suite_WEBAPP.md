# ZANTARA Complete Test Suite – WEBAPP

Entry Points
- Chat: `/chat.html`
- Test Console: `/test-api.html`

Prerequisites
- Cloud Run CORS enabled for `https://balizero1987.github.io`
- Backend keys set (e.g., OPENAI_API_KEY) and handlers deployed

Smoke Tests (Test Console)
1) Health (Contact Info) → OK
2) Identity Resolve (`{ email }`) → OK
3) AI Chat (`{ prompt }`) → OK
4) Pricing (`bali.zero.pricing`) → options list
5) Lead Save → leadId or OK response

ZANTARA V2 (Core)
- `zantara.personality.profile` (collaboratorId)
- `zantara.attune` (interaction_context)
- `zantara.synergy.map` (project_context, team_members)
- `zantara.dashboard.overview`
- `zantara.communication.adapt` (message_content)
- `zantara.conflict.mediate` (involved_parties)
- `zantara.growth.track` (timeframe)
- `zantara.celebration.orchestrate` (achievement_type)

Training Runner
- “Run Training”: saves 7 memory snapshots (relationship‑first) with `profile_facts` and `summary`
- Verify via console log: all memory.save → OK

Integration Runner
- “Run Integration Tests”: executes core business + V2
- Optionally include Google tests via checkbox

Google Workspace (optional)
- Requires OAuth2/Impersonation configured on backend
- Tests: calendar.create, docs.create, sheets.create, drive.list

Chat Page Manual Checks
- Quick Actions: Attune, Synergy, Team Health, Mediate, Celebrate
- Streaming: progressive rendering on good networks; instant on slow/Save‑Data/reduced‑motion
- Offline: banner visible; sending disabled; resumes on online
- History: only last 50 messages; “Load earlier” shows previous batches

Troubleshooting
- “OPENAI_API_KEY not configured” → set keys on Cloud Run or use another provider
- 401/403 → check `x-api-key` and allowlist
- 404/handler_not_found → router not updated in backend
- CORS errors → verify Cloud Run response headers
