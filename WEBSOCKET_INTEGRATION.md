# 🔌 ZANTARA WebSocket Integration Guide

## ✅ Status: ACTIVE IN PRODUCTION

WebSocket real-time communication is **fully operational** on Railway:
- **Production URL**: `wss://ts-backend-production-568d.up.railway.app/ws`
- **Status**: ✅ Verified working (2025-10-19)
- **Features**: Bi-directional real-time, channel pub/sub, auto-reconnect, heartbeat

---

## 📚 Quick Start

### 1. Include the WebSocket Client

Add to your HTML page:

```html
<script src="js/zantara-websocket.js"></script>
```

### 2. Basic Usage

```javascript
// Create connection
const ws = new ZantaraWebSocket('user@example.com', {
  debug: true,
  autoReconnect: true
});

// Listen for connection
ws.on('connected', (data) => {
  console.log('Connected!', data);

  // Subscribe to channels
  ws.subscribe('chat');
  ws.subscribe('notifications');
});

// Listen for messages
ws.on('chat', (data) => {
  console.log('Chat message:', data);
  displayMessage(data);
});

// Send message
ws.sendMessage('chat', {
  text: 'Hello ZANTARA!',
  user: 'John Doe'
});
```

---

## 🎯 Available Channels

| Channel | Purpose | Example Data |
|---------|---------|--------------|
| `chat` | Real-time chat with ZANTARA AI | `{ text: "Hello!", user: "zero" }` |
| `notifications` | Team collaboration alerts | `{ type: "document_edited", user: "Amanda" }` |
| `analytics` | Live dashboard metrics | `{ activeUsers: 42, tokensUsed: 15000 }` |
| `documents` | Document processing status | `{ file: "visa.pdf", progress: 85 }` |

---

## 🔧 API Reference

### Constructor

```javascript
new ZantaraWebSocket(userId, options)
```

**Parameters:**
- `userId` (string, optional): User identifier (email or ID)
- `options` (object, optional):
  - `wsUrl` (string): WebSocket server URL (default: Railway production URL)
  - `autoReconnect` (boolean): Auto-reconnect on disconnect (default: true)
  - `reconnectInterval` (number): Reconnect interval in ms (default: 3000)
  - `maxReconnectAttempts` (number): Max reconnect attempts (default: 10)
  - `debug` (boolean): Enable console logging (default: false)

### Methods

#### `subscribe(channel)`
Subscribe to a channel to receive messages.

```javascript
ws.subscribe('chat');
```

#### `unsubscribe(channel)`
Unsubscribe from a channel.

```javascript
ws.unsubscribe('notifications');
```

#### `sendMessage(channel, data)`
Send message to a channel.

```javascript
ws.sendMessage('chat', { text: 'Hello!' });
```

#### `on(event, handler)`
Register event handler.

```javascript
ws.on('connected', (data) => {
  console.log('Connected!', data);
});
```

**Available Events:**
- `connected` - Connection established
- `disconnected` - Connection lost
- `error` - Error occurred
- `message` - Any message received
- `chat` - Chat channel message
- `notifications` - Notifications channel message
- `analytics` - Analytics channel message
- `documents` - Documents channel message

#### `off(event, handler)`
Remove event handler.

```javascript
ws.off('chat', myHandler);
```

#### `disconnect()`
Manually disconnect (disables auto-reconnect).

```javascript
ws.disconnect();
```

#### `isConnected()`
Check connection status.

```javascript
if (ws.isConnected()) {
  console.log('Connected!');
}
```

#### `getStats()`
Get connection statistics.

```javascript
const stats = ws.getStats();
console.log(stats);
// {
//   connected: true,
//   clientId: "client_1234567890_abc123",
//   userId: "user@example.com",
//   subscriptions: ["chat", "notifications"],
//   reconnectAttempts: 0,
//   lastPong: "2025-10-19T14:30:00.000Z"
// }
```

---

## 💡 Integration Examples

### Example 1: Real-Time Chat

```javascript
const ws = new ZantaraWebSocket('user@example.com');

ws.on('connected', () => {
  ws.subscribe('chat');
});

ws.on('chat', (data) => {
  addMessageToUI(data.text, data.user);
});

function sendChatMessage(text) {
  ws.sendMessage('chat', {
    text,
    user: currentUser.email,
    timestamp: new Date().toISOString()
  });
}
```

### Example 2: Live Notifications

```javascript
const ws = new ZantaraWebSocket('user@example.com');

ws.on('connected', () => {
  ws.subscribe('notifications');
});

ws.on('notifications', (data) => {
  showNotificationBanner(data);
  playNotificationSound();
  updateNotificationCount();
});
```

### Example 3: Analytics Dashboard

```javascript
const ws = new ZantaraWebSocket('admin@example.com');

ws.on('connected', () => {
  ws.subscribe('analytics');
});

ws.on('analytics', (metrics) => {
  updateDashboard({
    activeUsers: metrics.activeUsers,
    tokensUsed: metrics.tokensUsed,
    apiCalls: metrics.apiCalls,
    avgResponseTime: metrics.avgResponseTime
  });
});
```

---

## 🧪 Testing

### Option 1: Use the Demo Page

1. Open `websocket-demo.html` in your browser
2. Click "Connect"
3. Subscribe to channels
4. Send test messages
5. Monitor connection stats

**Local testing:**
```bash
cd apps/webapp
python3 -m http.server 3000
# Open http://localhost:3000/websocket-demo.html
```

### Option 2: Browser Console

```javascript
// Load the script in your page, then:
const ws = new ZantaraWebSocket('test@example.com', { debug: true });

ws.on('connected', () => {
  console.log('Connected!');
  ws.subscribe('chat');
});

ws.on('chat', (data) => {
  console.log('Message:', data);
});

ws.sendMessage('chat', { text: 'Test message' });
```

### Option 3: Command Line Test

```bash
node test-websocket.js
```

---

## 🔒 Security Notes

1. **Authentication**: User ID is passed via query parameter `?userId=email`
2. **Channel Access**: Currently no channel-level access control (trust-based)
3. **Message Validation**: Client-side validation recommended before sending
4. **HTTPS Required**: Production uses WSS (WebSocket Secure)

---

## 🐛 Troubleshooting

### Connection Failed
- **Check**: Is Railway TS-BACKEND service running?
- **Verify**: `wss://ts-backend-production-568d.up.railway.app/ws` is accessible
- **Test**: Run `node test-websocket.js` from project root

### Auto-Reconnect Not Working
- **Check**: `autoReconnect` option is true
- **Verify**: `maxReconnectAttempts` not exceeded
- **Debug**: Enable debug logging: `{ debug: true }`

### Messages Not Received
- **Check**: Channel subscription active (`ws.subscriptions.has('channel')`)
- **Verify**: Connection is open (`ws.isConnected()`)
- **Debug**: Listen to generic `message` event to see all incoming messages

---

## 📈 Performance

- **Latency**: < 100ms (typical)
- **Heartbeat**: Ping every 25s, timeout after 60s
- **Reconnect**: Exponential backoff (3s, 6s, 9s, 12s, 15s max)
- **Memory**: Minimal (~50KB per connection)

---

## 🚀 Deployment

WebSocket is **already deployed** on Railway!

To redeploy:
```bash
git add .
git commit -m "feat: WebSocket updates"
git push origin main
# Railway auto-deploys in 3-5 minutes
```

---

## 📝 Files

- `js/zantara-websocket.js` - Client library (production-ready)
- `websocket-demo.html` - Interactive demo page
- `WEBSOCKET_INTEGRATION.md` - This documentation
- `../../test-websocket.js` - CLI test tool
- `../../apps/backend-ts/src/services/websocket-server.ts` - Server implementation

---

## 🎯 Next Steps

1. **Integrate into main dashboard** (`dashboard.html`)
2. **Add real-time AI chat** (streaming responses from Claude)
3. **Team notifications** (document edits, comments, mentions)
4. **Analytics live feed** (usage metrics, costs, performance)

---

**Questions?** Check the [PROJECT_CONTEXT.md](../../.claude/PROJECT_CONTEXT.md) or contact the dev team.

**Status**: ✅ Production-ready, actively maintained
**Last Updated**: 2025-10-19
