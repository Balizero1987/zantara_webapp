/**
 * ZANTARA WebSocket Client
 * Real-time communication with TS-BACKEND Railway service
 *
 * Features:
 * - Auto-reconnect on disconnect
 * - Heartbeat (ping/pong)
 * - Channel-based pub/sub
 * - Event emitter pattern for easy integration
 *
 * Usage:
 * const ws = new ZantaraWebSocket('user@example.com');
 * ws.on('chat', (data) => console.log('Chat message:', data));
 * ws.subscribe('chat');
 * ws.sendMessage('chat', { text: 'Hello ZANTARA!' });
 */

class ZantaraWebSocket {
  constructor(userId = null, options = {}) {
    // Configuration
    this.userId = userId;
    this.wsUrl = options.wsUrl || 'wss://ts-backend-production-568d.up.railway.app/ws';
    this.autoReconnect = options.autoReconnect !== false; // Default: true
    this.reconnectInterval = options.reconnectInterval || 3000; // 3s
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.debug = options.debug || false;

    // State
    this.ws = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.reconnectTimer = null;
    this.clientId = null;
    this.subscriptions = new Set();

    // Event handlers
    this.eventHandlers = {
      'connected': [],
      'disconnected': [],
      'error': [],
      'message': [],
      'chat': [],
      'notifications': [],
      'analytics': [],
      'documents': []
    };

    // Heartbeat
    this.pingInterval = null;
    this.lastPong = Date.now();

    // Auto-connect
    this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.log('Already connected');
      return;
    }

    // Build URL with userId if provided
    const url = this.userId
      ? `${this.wsUrl}?userId=${encodeURIComponent(this.userId)}`
      : this.wsUrl;

    this.log(`Connecting to ${url}...`);

    try {
      this.ws = new WebSocket(url);
      this.setupEventHandlers();
    } catch (error) {
      this.handleError('Connection failed', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  setupEventHandlers() {
    this.ws.onopen = () => {
      this.log('✅ Connected');
      this.connected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connected', { clientId: this.clientId });
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        this.handleError('Failed to parse message', error);
      }
    };

    this.ws.onerror = (error) => {
      this.handleError('WebSocket error', error);
    };

    this.ws.onclose = (event) => {
      this.log(`Disconnected (code: ${event.code})`);
      this.connected = false;
      this.stopHeartbeat();
      this.emit('disconnected', { code: event.code, reason: event.reason });

      if (this.autoReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.scheduleReconnect();
      }
    };
  }

  /**
   * Handle incoming message
   */
  handleMessage(message) {
    const { type, channel, data } = message;

    // Handle system messages
    if (type === 'message' && channel === 'system') {
      if (data.clientId) {
        this.clientId = data.clientId;
        this.log(`Client ID: ${this.clientId}`);
      }
      if (data.message) {
        this.log(`System: ${data.message}`);
      }
    }

    // Handle pong (heartbeat response)
    if (type === 'pong') {
      this.lastPong = Date.now();
      return;
    }

    // Emit channel-specific events
    if (channel && this.eventHandlers[channel]) {
      this.emit(channel, data);
    }

    // Emit generic message event
    this.emit('message', message);
  }

  /**
   * Subscribe to a channel
   */
  subscribe(channel) {
    if (this.subscriptions.has(channel)) {
      this.log(`Already subscribed to ${channel}`);
      return;
    }

    this.sendRaw({
      type: 'subscribe',
      channel
    });

    this.subscriptions.add(channel);
    this.log(`Subscribed to ${channel}`);
  }

  /**
   * Unsubscribe from a channel
   */
  unsubscribe(channel) {
    if (!this.subscriptions.has(channel)) {
      return;
    }

    this.sendRaw({
      type: 'unsubscribe',
      channel
    });

    this.subscriptions.delete(channel);
    this.log(`Unsubscribed from ${channel}`);
  }

  /**
   * Send message to a channel
   */
  sendMessage(channel, data) {
    this.sendRaw({
      type: 'message',
      channel,
      data
    });
  }

  /**
   * Send raw message (low-level)
   */
  sendRaw(message) {
    if (!this.connected || this.ws.readyState !== WebSocket.OPEN) {
      this.log('Cannot send message: not connected');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      this.handleError('Failed to send message', error);
      return false;
    }
  }

  /**
   * Start heartbeat (ping every 25s)
   */
  startHeartbeat() {
    this.stopHeartbeat(); // Clear existing

    this.pingInterval = setInterval(() => {
      if (this.connected) {
        // Send ping
        this.sendRaw({ type: 'ping' });

        // Check if we received pong recently (60s timeout)
        const timeSinceLastPong = Date.now() - this.lastPong;
        if (timeSinceLastPong > 60000) {
          this.log('Heartbeat timeout - reconnecting');
          this.ws.close();
        }
      }
    }, 25000); // 25s (server expects ping within 60s)
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Schedule reconnect
   */
  scheduleReconnect() {
    if (this.reconnectTimer) {
      return; // Already scheduled
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * Math.min(this.reconnectAttempts, 5); // Exponential backoff (max 5x)

    this.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  /**
   * Event emitter: on()
   */
  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  /**
   * Event emitter: off()
   */
  off(event, handler) {
    if (!this.eventHandlers[event]) {
      return;
    }
    this.eventHandlers[event] = this.eventHandlers[event].filter(h => h !== handler);
  }

  /**
   * Event emitter: emit()
   */
  emit(event, data) {
    if (!this.eventHandlers[event]) {
      return;
    }
    this.eventHandlers[event].forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        this.handleError(`Event handler error (${event})`, error);
      }
    });
  }

  /**
   * Handle errors
   */
  handleError(message, error) {
    const errorData = {
      message,
      error: error?.message || error
    };
    this.log(`❌ ${message}:`, error);
    this.emit('error', errorData);
  }

  /**
   * Disconnect
   */
  disconnect() {
    this.autoReconnect = false; // Disable auto-reconnect
    this.stopHeartbeat();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.connected = false;
    this.log('Disconnected (manual)');
  }

  /**
   * Get connection status
   */
  isConnected() {
    return this.connected && this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get stats
   */
  getStats() {
    return {
      connected: this.connected,
      clientId: this.clientId,
      userId: this.userId,
      subscriptions: Array.from(this.subscriptions),
      reconnectAttempts: this.reconnectAttempts,
      lastPong: new Date(this.lastPong).toISOString()
    };
  }

  /**
   * Logging
   */
  log(...args) {
    if (this.debug) {
      console.log('[ZantaraWS]', ...args);
    }
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZantaraWebSocket;
}
