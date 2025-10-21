/**
 * WebSocket Manager with Auto-Reconnect
 * 
 * Implements exponential backoff reconnection strategy.
 * Handles connection lifecycle and message queuing.
 */

class WebSocketManager {
  constructor() {
    this.ws = null;
    this.url = null;
    this.isConnecting = false;
    this.isManuallyDisconnected = false;
    
    // Reconnection settings
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000; // Start at 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.reconnectTimer = null;
    
    // Message queue for offline messages
    this.messageQueue = [];
    this.maxQueueSize = 50;
    
    // Event listeners
    this.listeners = {
      open: [],
      close: [],
      error: [],
      message: [],
      reconnecting: [],
      reconnected: []
    };
    
    // Statistics
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      reconnections: 0,
      errors: 0,
      totalUptime: 0,
      connectionStartTime: null
    };
  }

  connect(url, protocols = []) {
    if (this.isConnected()) {
      console.log('[WS] Already connected');
      return;
    }

    if (this.isConnecting) {
      console.log('[WS] Connection already in progress');
      return;
    }

    this.url = url;
    this.isConnecting = true;
    this.isManuallyDisconnected = false;

    try {
      console.log('[WS] Connecting to:', url);
      
      this.ws = new WebSocket(url, protocols);
      
      this.ws.onopen = (event) => this.handleOpen(event);
      this.ws.onclose = (event) => this.handleClose(event);
      this.ws.onerror = (event) => this.handleError(event);
      this.ws.onmessage = (event) => this.handleMessage(event);
      
    } catch (error) {
      console.error('[WS] Connection error:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  disconnect() {
    this.isManuallyDisconnected = true;
    this.cancelReconnect();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    console.log('[WS] Manually disconnected');
  }

  handleOpen(event) {
    console.log('[WS] Connected');
    
    this.isConnecting = false;
    this.stats.connectionStartTime = Date.now();
    
    // Reset reconnection settings on successful connect
    if (this.reconnectAttempts > 0) {
      this.stats.reconnections++;
      this.emit('reconnected', { attempts: this.reconnectAttempts });
    }
    
    this.reconnectAttempts = 0;
    this.reconnectDelay = 1000;
    
    // Send queued messages
    this.flushMessageQueue();
    
    this.emit('open', event);
  }

  handleClose(event) {
    console.log('[WS] Disconnected', event.code, event.reason);
    
    this.isConnecting = false;
    
    // Update uptime stats
    if (this.stats.connectionStartTime) {
      this.stats.totalUptime += Date.now() - this.stats.connectionStartTime;
      this.stats.connectionStartTime = null;
    }
    
    this.emit('close', event);
    
    // Reconnect if not manually disconnected
    if (!this.isManuallyDisconnected) {
      this.scheduleReconnect();
    }
  }

  handleError(event) {
    console.error('[WS] Error:', event);
    
    this.stats.errors++;
    this.emit('error', event);
  }

  handleMessage(event) {
    this.stats.messagesReceived++;
    
    try {
      const data = JSON.parse(event.data);
      this.emit('message', data);
    } catch (error) {
      // Not JSON, pass raw data
      this.emit('message', event.data);
    }
  }

  scheduleReconnect() {
    // Cancel any existing reconnect timer
    this.cancelReconnect();
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('[WS] Max reconnect attempts reached');
      this.emit('reconnecting', {
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        gaveUp: true
      });
      return;
    }

    this.reconnectAttempts++;
    
    // Calculate delay with exponential backoff
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );
    
    console.log(`[WS] Reconnecting in ${delay / 1000}s (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    this.emit('reconnecting', {
      attempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      delay: delay
    });

    this.reconnectTimer = setTimeout(() => {
      this.connect(this.url);
    }, delay);
  }

  cancelReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  send(data) {
    if (!this.isConnected()) {
      // Queue message if not connected
      this.queueMessage(data);
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.ws.send(message);
      this.stats.messagesSent++;
      return true;
    } catch (error) {
      console.error('[WS] Send error:', error);
      this.queueMessage(data);
      return false;
    }
  }

  queueMessage(data) {
    if (this.messageQueue.length >= this.maxQueueSize) {
      // Remove oldest message
      this.messageQueue.shift();
    }
    
    this.messageQueue.push({
      data,
      timestamp: Date.now()
    });
    
    console.log(`[WS] Message queued (${this.messageQueue.length}/${this.maxQueueSize})`);
  }

  flushMessageQueue() {
    if (this.messageQueue.length === 0) return;
    
    console.log(`[WS] Flushing ${this.messageQueue.length} queued messages`);
    
    const queue = [...this.messageQueue];
    this.messageQueue = [];
    
    queue.forEach(({ data }) => {
      this.send(data);
    });
  }

  isConnected() {
    return this.ws && this.ws.readyState === WebSocket.OPEN;
  }

  getReadyState() {
    if (!this.ws) return 'DISCONNECTED';
    
    const states = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
    return states[this.ws.readyState] || 'UNKNOWN';
  }

  // Event listener management
  on(event, callback) {
    if (!this.listeners[event]) {
      throw new Error(`Invalid event: ${event}`);
    }
    
    this.listeners[event].push(callback);
    
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    
    const index = this.listeners[event].indexOf(callback);
    if (index > -1) {
      this.listeners[event].splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[WS] Listener error for ${event}:`, error);
      }
    });
  }

  getStats() {
    return {
      ...this.stats,
      connected: this.isConnected(),
      readyState: this.getReadyState(),
      reconnectAttempts: this.reconnectAttempts,
      queuedMessages: this.messageQueue.length,
      uptime: this.stats.connectionStartTime 
        ? Date.now() - this.stats.connectionStartTime 
        : 0
    };
  }

  clearQueue() {
    const count = this.messageQueue.length;
    this.messageQueue = [];
    console.log(`[WS] Cleared ${count} queued messages`);
  }
}

// Export singleton
export const wsManager = new WebSocketManager();

// Expose globally
if (typeof window !== 'undefined') {
  window.ZANTARA_WS = {
    connect: (url, protocols) => wsManager.connect(url, protocols),
    disconnect: () => wsManager.disconnect(),
    send: (data) => wsManager.send(data),
    on: (event, callback) => wsManager.on(event, callback),
    off: (event, callback) => wsManager.off(event, callback),
    getStats: () => wsManager.getStats(),
    isConnected: () => wsManager.isConnected(),
    clearQueue: () => wsManager.clearQueue()
  };
}

export default wsManager;
