# Streaming NDJSON — How to test

## Overview
POST streaming implementation using NDJSON (newline-delimited JSON) for real-time AI responses with web search capabilities.

## Configuration

### 1) Production (proxy-first) - DEFAULT
- `API_CONFIG.mode = 'proxy'` is set by default
- Visit `/syncra.html?streaming=true`
- Endpoint: `/api/zantara/chat` (via proxy)
- Test prompt: "cerca sul web ultimi aggiornamenti ZANTARA B211A"
- Expected: Browsing badge appears + citations rendered

### 2) Direct Mode (debug only)
- Set `API_CONFIG.mode = 'direct'` in api-config.js
- Tests against `https://<cloud-run-backend>/api/chat` directly
- Requires CORS configuration on backend

## Quick Test URLs

### Local Development
- http://localhost:3000/syncra.html?streaming=true&dev=true
- http://localhost:3000/test-streaming.html

### Production
- https://zantara.balizero.com/syncra.html?streaming=true&dev=true
- https://balizero1987.github.io/zantara_webapp/test-streaming.html

## Expected Behavior

### Stream Chunks (NDJSON format)
```json
{"type":"delta","content":"partial text..."}
{"type":"tool","name":"web_search","status":"start","args":{"query":"..."}}
{"type":"tool","name":"web_search","status":"result","data":[{...}]}
{"type":"final","content":"complete message"}
{"event":"done"}
```

### UI Indicators
1. **Browsing Pill**: Animated indicator during web_search
2. **Tool Status**: Shows "Searching: [query]" briefly
3. **Citations**: Rendered with copy button after search
4. **Progressive Text**: Delta chunks appear as they stream
5. **Stop Button**: Aborts stream cleanly without UI freeze

## Test Scenarios (test-streaming.html)

1. **Simple Question**: Basic response without tools
2. **Web Search**: Triggers browsing + citations
3. **Multi-Tool**: Multiple tool invocations
4. **Long Response**: Tests streaming performance
5. **Error Test**: Validates error handling
6. **Abort Test**: Stop after 5 seconds

## Troubleshooting

### No Streaming
- Verify backend implements `/api/chat` with NDJSON response
- Check `?streaming=true` flag or localStorage setting
- Confirm modules loaded: check console for "[Syncra] Streaming modules loaded"

### No Chunks Appearing
- Backend must not use compression on `/api/chat` endpoint
- Response must be `Content-Type: application/x-ndjson`
- Check network tab for streaming response

### CORS Errors
- Backend must allowlist webapp domains:
  - `https://zantara.balizero.com`
  - `https://balizero1987.github.io`
  - `http://localhost:*` (dev)

### Stop Not Working
- Verify AbortController support in browser
- Check console for abort events

## Feature Flags

### Enable Streaming
- URL param: `?streaming=true`
- LocalStorage: `localStorage.setItem('zantara-streaming', 'true')`
- Dev mode required: `?dev=true` or localhost

### Debug Output
- Open browser console
- Look for `[Streaming]` prefixed messages
- Check Network tab for NDJSON response

## API Contract

### Request
```
POST /api/chat (or /api/zantara/chat via proxy)
Headers:
  Content-Type: application/json
  Accept: application/x-ndjson
  x-user-id: <optional>

Body:
{
  "sessionId": "sess_123",
  "messages": [
    {"role": "user", "content": "..."}
  ]
}
```

### Response
```
Content-Type: application/x-ndjson
Transfer-Encoding: chunked

<NDJSON lines as shown above>
```

## Module Architecture

### Client-side Modules
- `streaming-client.js`: NDJSON parser, event emitter
- `streaming-ui.js`: UI components (pill, citations)
- `streaming-toggle-ui.js`: Dev mode toggle

### Namespaces
- `window.ZANTARA_STREAMING_CLIENT`: Real streaming client
- `window.ZANTARA_STREAMING_TOGGLE`: Legacy simulation
- `window.ZANTARA_API.getStreamingUrl()`: URL helper

### Conditional Loading
Modules load only when streaming is enabled to reduce bundle size.

## Backend Requirements (PROGETTO MADRE)

1. Implement `POST /api/chat` endpoint
2. Stream NDJSON chunks (no buffering)
3. Integrate `web_search` tool with Bing/Google API
4. Enable CORS for webapp domains
5. No compression on streaming endpoint
6. Support AbortController (client disconnect)