# TODO_CURRENT – ZANTARA WEBAPP

P1 – Coordination with Mother Project
- [ ] Propose SSE integration plan (backend stream endpoint) and align client implementation
- [ ] Confirm long‑term model routing (server‑side fallback vs client‑side fallback toggling)
- [ ] Define contract for V2 handler params (stabilize schemas)

P2 – Frontend UX/Perf
- [x] **Streaming Toggle**: Optional toggle for streaming on/off (dev flag) ✅
- [x] **Virtualization**: make `MAX_RENDER_MESSAGES` configurable via localStorage ✅
- [x] **Accessibility**: add ARIA roles to actionable buttons; keyboard focus states ✅

P3 – Tests & Observability
- [x] **Enhanced Test Console**: 8 test scenarios, performance metrics, export functionality ✅
- [x] Add basic telemetry (counts/latency) surfaced in console logs for quick triage ✅

P4 – Docs & Onboarding
- [x] **Complete Onboarding System**: Welcome flow (6 steps), feature discovery, help center, F1/? shortcuts ✅
- [x] **Keep HANDOVER_LOG.md updated per session** ✅
- [ ] Add short GIFs/screenshots (Pages) for quick onboarding

LAW (Project Policy)
- Any structural code change MUST be requested and approved for the Mother Project (open issue/PR with context and get sign‑off). Visual‑only tweaks are exempt.
