# ZANTARA Proxy/BFF – Cloudflare Worker

Server-side proxy that injects `x-api-key` and forwards requests to the ZANTARA Cloud Run backend. The web-app calls the Worker, sending `x-user-id` (email) for context.

## Endpoints
- POST /api/zantara/call → ${ZANTARA_BASE_URL}/call
- POST /api/zantara/ai-chat → ${ZANTARA_BASE_URL}/ai.chat
- POST /api/zantara/pricing-official → ${ZANTARA_BASE_URL}/pricing.official
- POST /api/zantara/price-lookup → ${ZANTARA_BASE_URL}/price.lookup
- (opt) GET/POST /api/zantara/ai-chat.stream → ${ZANTARA_BASE_URL}/ai.chat.stream
- GET /api/zantara/health → ${ZANTARA_BASE_URL}/health

CORS is allowed for `ALLOW_ORIGIN`.

## Setup
1. Install Wrangler: `npm i -g wrangler`
2. Login: `wrangler login`
3. Set secrets:
   - `wrangler secret put ZANTARA_API_KEY`
4. Deploy:
   - `cd proxy-worker`
   - `wrangler deploy`

## Config
- `wrangler.toml` Vars:
  - `ZANTARA_BASE_URL` – Cloud Run base URL
  - `ALLOW_ORIGIN` – `https://zantara.balizero.com`

## Frontend wiring
In browser console (temporary), set the proxy base so the client uses the Worker:
```js
localStorage.setItem('zantara-proxy-base', 'https://<your-worker>.<account>.workers.dev/api/zantara');
// or
window.ZANTARA_PROXY_BASE = 'https://<your-worker>.<account>.workers.dev/api/zantara';
```
The client is already in `proxy` mode by default.

## Notes
- Never expose `x-api-key` in the client.
- The Worker passes `x-user-id` through to the backend to enable context/memory.
