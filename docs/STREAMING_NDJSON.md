# Streaming NDJSON — How to test (Prod: proxy-first)

## Config
- `API_CONFIG.mode = 'proxy'`
- `getStreamingUrl()` → `https://<PROXY>/api/zantara/chat`
- Backend Cloud Run: **europe-west1**

## Test (browser)
`/syncra.html?streaming=true&dev=true`
1) Prompt semplice → delta a pezzi + `{"event":"done"}`
2) "cerca sul web ..." → pill **Browsing** + citazioni
3) "Stop" → stream chiuso, UI reattiva

## cURL (debug)
```bash
curl -N -X POST https://<PROXY>/api/zantara/chat \
  -H 'Content-Type: application/json' \
  -H 'x-user-id: test@balizero.com' \
  -d '{"messages":[{"role":"user","content":"cerca sul web aggiornamenti B211A"}]}'
```

## Proxy Worker Features
- Health check sempre 200 (evita warning UI)
- NDJSON pass-through senza buffer
- CORS headers automatici
- API key injection dal worker

## Expected Stream Format
```ndjson
{"type":"delta","content":"partial text..."}
{"type":"tool","name":"web_search","status":"start","args":{"query":"..."}}
{"type":"tool","name":"web_search","status":"result","data":[{...}]}
{"type":"final","content":"complete message"}
{"event":"done"}
```

## Troubleshooting
- **No chunks**: verifica che backend non abbia compression su /api/chat
- **CORS**: domini allowlistati sul backend
- **Stop not working**: check AbortController support