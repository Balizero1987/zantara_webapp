# Gateway Integration Guide

## 🎯 Overview

Il backend NUZANTARA v5.2.0 ora include un **nuovo Gateway moderno** con endpoints:
- `POST /app/bootstrap` - Inizializzazione sessione
- `POST /app/event` - Gestione eventi (chat, tool execution, etc)

## 📊 Status Attuale

### Webapp (questo repo)
- ❌ **NON usa ancora il gateway**
- ✅ Usa legacy endpoint `/call` (RPC-style)
- 📍 File principale: `js/core/api-client.js`

### Backend API
- ✅ Gateway completato e deployato
- ✅ Production URL: `https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app`
- ✅ Revision: 00161-8w6 (deployed 2025-10-12)
- ✅ Feature flag `ENABLE_APP_GATEWAY: true`

## 🔄 Architettura Gateway

### Flow Completo

```
┌─────────────────────────────────────────────┐
│  WEBAPP (zantara.balizero.com)              │
│  - Chat interface                           │
│  - User interaction                         │
└──────────────────┬──────────────────────────┘
                   │
                   │ 1. Bootstrap (init session)
                   ↓
┌─────────────────────────────────────────────┐
│  POST /app/bootstrap                        │
│  Request:                                   │
│    { user: "email@example.com" }            │
│  Response:                                  │
│    {                                        │
│      sessionId: "sess_xxx",                 │
│      csrfToken: "xxx",                      │
│      schema: { ... },                       │
│      flags: { ... }                         │
│    }                                        │
└──────────────────┬──────────────────────────┘
                   │
                   │ 2. Store session + CSRF
                   ↓
┌─────────────────────────────────────────────┐
│  WEBAPP Local Storage                       │
│  - sessionId                                │
│  - csrfToken                                │
│  - schema (UI config)                       │
└──────────────────┬──────────────────────────┘
                   │
                   │ 3. Send events
                   ↓
┌─────────────────────────────────────────────┐
│  POST /app/event                            │
│  Headers:                                   │
│    x-csrf-token: <from bootstrap>           │
│    Origin: https://zantara.balizero.com     │
│  Body:                                      │
│    {                                        │
│      sessionId: "sess_xxx",                 │
│      action: "chat_send",                   │
│      payload: { query: "..." },             │
│      idempotencyKey: "uuid"                 │
│    }                                        │
│  Response:                                  │
│    {                                        │
│      ok: true,                              │
│      patches: [                             │
│        { op: "append", target: "timeline",  │
│          data: { role: "assistant", ... }   │
│        }                                    │
│      ]                                      │
│    }                                        │
└──────────────────┬──────────────────────────┘
                   │
                   │ 4. Handler execution
                   ↓
┌─────────────────────────────────────────────┐
│  GATEWAY ROUTER                             │
│  - CSRF validation                          │
│  - Origin check                             │
│  - Idempotency                              │
│  - Capability routing                       │
└──────────────────┬──────────────────────────┘
                   │
                   │ 5. Handler execution
                   ↓
┌─────────────────────────────────────────────┐
│  HANDLER REGISTRY (118+ handlers)           │
│  - bali.zero.chat (RAG backend)             │
│  - kbli.validate                            │
│  - team.list                                │
│  - etc...                                   │
└──────────────────┬──────────────────────────┘
                   │
                   │ 6. RAG query
                   ↓
┌─────────────────────────────────────────────┐
│  RAG BACKEND                                │
│  URL: zantara-rag-backend-himaadsxua-ew... │
│  - ChromaDB: 14,365 documents               │
│  - Claude Haiku/Sonnet routing              │
│  - Reranker: +400% precision                │
└─────────────────────────────────────────────┘
```

## 🔧 Implementation Plan

### Phase 1: Add Gateway Client (Non-Breaking)

Creare nuovo file: `js/core/gateway-client.js`

```javascript
/**
 * Gateway Client - New API format
 * Implements /app/bootstrap and /app/event
 */

class GatewayClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.sessionId = null;
    this.csrfToken = null;
    this.schema = null;
  }

  /**
   * Initialize session with backend
   */
  async bootstrap(user) {
    const response = await fetch(`${this.baseUrl}/app/bootstrap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      body: JSON.stringify({ user })
    });

    if (!response.ok) {
      throw new Error(`Bootstrap failed: ${response.status}`);
    }

    const data = await response.json();

    // Store session data
    this.sessionId = data.data.sessionId;
    this.csrfToken = data.data.csrfToken;
    this.schema = data.data.schema;

    // Persist to localStorage
    localStorage.setItem('gateway_session', JSON.stringify({
      sessionId: this.sessionId,
      csrfToken: this.csrfToken,
      schema: this.schema,
      timestamp: Date.now()
    }));

    return data.data;
  }

  /**
   * Send event to gateway
   */
  async sendEvent(action, payload, meta = {}) {
    if (!this.sessionId || !this.csrfToken) {
      throw new Error('Session not initialized. Call bootstrap() first.');
    }

    const response = await fetch(`${this.baseUrl}/app/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': window.location.origin,
        'x-csrf-token': this.csrfToken
      },
      body: JSON.stringify({
        sessionId: this.sessionId,
        action,
        payload,
        meta,
        idempotencyKey: crypto.randomUUID()
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Event failed: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Send chat message
   */
  async sendChat(query, conversationHistory = []) {
    return this.sendEvent('chat_send',
      { query },
      { conversation_history: conversationHistory }
    );
  }

  /**
   * Execute tool/handler
   */
  async executeTool(toolName, params) {
    return this.sendEvent('tool_run', {
      tool: toolName,
      ...params
    });
  }

  /**
   * Restore session from localStorage
   */
  restoreSession() {
    const stored = localStorage.getItem('gateway_session');
    if (!stored) return false;

    const data = JSON.parse(stored);

    // Check if session is still valid (< 24h)
    const age = Date.now() - data.timestamp;
    if (age > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('gateway_session');
      return false;
    }

    this.sessionId = data.sessionId;
    this.csrfToken = data.csrfToken;
    this.schema = data.schema;
    return true;
  }
}

export const gatewayClient = new GatewayClient(
  'https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app'
);
```

### Phase 2: Update Chat Component

Modificare `js/components/ChatComponent.js`:

```javascript
import { gatewayClient } from '../core/gateway-client.js';

class ChatComponent {
  async initialize() {
    // Try to restore existing session
    if (!gatewayClient.restoreSession()) {
      // Bootstrap new session
      const user = this.getCurrentUser(); // from auth
      await gatewayClient.bootstrap(user);
    }
  }

  async sendMessage(text) {
    try {
      // Get conversation history
      const history = this.getConversationHistory();

      // Send via gateway
      const result = await gatewayClient.sendChat(text, history);

      // Process patches
      if (result.ok && result.patches) {
        result.patches.forEach(patch => {
          this.applyPatch(patch);
        });
      }
    } catch (error) {
      console.error('Gateway error:', error);
      // Fallback to legacy API if needed
    }
  }

  applyPatch(patch) {
    switch (patch.op) {
      case 'append':
        if (patch.target === 'timeline') {
          this.appendMessage(patch.data);
        }
        break;
      case 'set':
        if (patch.target === 'sources') {
          this.displaySources(patch.data);
        }
        break;
      case 'notify':
        this.showNotification(patch.level, patch.message);
        break;
    }
  }
}
```

### Phase 3: Feature Flag (Safe Rollout)

Aggiungere in `js/config.js`:

```javascript
export const config = {
  features: {
    useGateway: localStorage.getItem('feature_gateway') === 'true',
    // Default: false (keep legacy behavior)
  },

  api: {
    legacy: 'https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app/call',
    gateway: 'https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app',
  }
};

// Enable gateway for testing:
// localStorage.setItem('feature_gateway', 'true')
```

### Phase 4: Testing

1. **Local Testing**:
   ```bash
   # Enable feature flag
   localStorage.setItem('feature_gateway', 'true')

   # Test bootstrap
   await gatewayClient.bootstrap('test@example.com')

   # Test chat
   await gatewayClient.sendChat('Come aprire un ristorante a Bali?')
   ```

2. **Integration Tests**:
   - Bootstrap creates valid session
   - CSRF token persists correctly
   - Chat messages route to RAG backend
   - Patches apply to UI correctly
   - Fallback to legacy API on error

3. **Production Rollout**:
   - Week 1: 10% users (feature flag)
   - Week 2: 50% users
   - Week 3: 100% users
   - Remove legacy API client

## 🔒 Security Features

Gateway provides:
- ✅ **CSRF Protection**: Session-bound tokens
- ✅ **Origin Allowlist**: Only zantara.balizero.com allowed
- ✅ **Idempotency**: 5-minute window prevents duplicate actions
- ✅ **Rate Limiting**: Per-action tier limits
- ✅ **Session TTL**: Channel-based expiration

## 📊 Actions Available

Gateway supports these actions:

| Action | Handler | Use Case |
|--------|---------|----------|
| `chat_send` | `bali.zero.chat` | AI chat queries |
| `tool_run` | Dynamic | Execute any handler |
| `open_view` | `system.handlers.list` | Open UI view |
| `memory_save` | `memory.save` | Save conversation |
| `lead_save` | `lead.save` | Save lead info |
| `set_language` | `identity.resolve` | Set user language |

## 🚀 Benefits of Gateway

### vs Legacy `/call` Endpoint

| Feature | Legacy `/call` | Gateway `/app/*` |
|---------|---------------|------------------|
| Session Management | ❌ No | ✅ Yes (CSRF, TTL) |
| Security | ⚠️ Basic | ✅ Enterprise (CSRF, Origin) |
| UI Schema | ❌ No | ✅ Yes (dynamic UI) |
| Idempotency | ❌ No | ✅ Yes (5min window) |
| Rate Limiting | ⚠️ Global | ✅ Per-action tiers |
| Error Handling | ⚠️ Basic | ✅ Structured patches |
| Real-time Updates | ❌ No | ✅ Patch-based |

## 📝 Next Steps

1. ✅ **Review this document** with team
2. ⬜ **Create gateway-client.js** (Phase 1)
3. ⬜ **Add feature flag** to config.js
4. ⬜ **Test locally** with feature flag enabled
5. ⬜ **Update ChatComponent** to use gateway
6. ⬜ **Deploy to staging** (GitHub Pages)
7. ⬜ **Gradual rollout** with monitoring
8. ⬜ **Remove legacy client** once stable

## 🔗 Resources

- **Backend API Health**: https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app/health
- **Feature Flags**: https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app/config/flags
- **Gateway Implementation**: `NUZANTARA-2/src/app-gateway/`
- **Handler Registry**: `NUZANTARA-2/src/core/handler-registry.ts`

## 📞 Support

Questions? Check:
1. This document
2. `NUZANTARA-2/.claude/diaries/2025-10-12_sonnet-4.5_m6.md`
3. Backend `/health` endpoint for system status

---

**Last Updated**: 2025-10-12
**Gateway Version**: v5.2.0 (revision 00161-8w6)
**Status**: ✅ Production Ready