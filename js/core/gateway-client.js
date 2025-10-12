/**
 * Gateway Client - Modern API Gateway Integration
 *
 * Implements /app/bootstrap and /app/event endpoints
 * Provides session management, CSRF protection, and structured responses
 *
 * @version 1.0.0
 * @since 2025-10-12
 */

class GatewayClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl || 'https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app';
    this.sessionId = null;
    this.csrfToken = null;
    this.schema = null;
    this.flags = null;
    this.sessionKey = 'zantara_gateway_session';
  }

  /**
   * Initialize session with backend
   * @param {string} user - User email/identifier
   * @returns {Promise<Object>} Session data with schema and flags
   */
  async bootstrap(user) {
    try {
      const response = await fetch(`${this.baseUrl}/app/bootstrap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({ user })
      });

      if (!response.ok) {
        throw new Error(`Bootstrap failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.ok || !data.data) {
        throw new Error('Invalid bootstrap response');
      }

      // Store session data
      this.sessionId = data.data.sessionId;
      this.csrfToken = data.data.csrfToken;
      this.schema = data.data.schema;
      this.flags = data.data.flags;

      // Persist to localStorage
      this._saveSession();

      console.log('✅ Gateway session initialized:', this.sessionId);
      return data.data;

    } catch (error) {
      console.error('❌ Bootstrap error:', error);
      throw error;
    }
  }

  /**
   * Send event to gateway
   * @param {string} action - Action name (chat_send, tool_run, etc)
   * @param {Object} payload - Action payload
   * @param {Object} meta - Optional metadata (conversation_history, etc)
   * @returns {Promise<Object>} Event result with patches
   */
  async sendEvent(action, payload, meta = {}) {
    if (!this.sessionId || !this.csrfToken) {
      throw new Error('Session not initialized. Call bootstrap() first.');
    }

    try {
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
          idempotencyKey: this._generateIdempotencyKey()
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `Event failed: ${response.status}`);
      }

      const result = await response.json();

      console.log(`✅ Gateway event [${action}]:`, result);
      return result;

    } catch (error) {
      console.error(`❌ Gateway event error [${action}]:`, error);
      throw error;
    }
  }

  /**
   * Send chat message (convenience method)
   * @param {string} query - User message
   * @param {Array} conversationHistory - Previous messages
   * @returns {Promise<Object>} Chat result with patches
   */
  async sendChat(query, conversationHistory = []) {
    return this.sendEvent('chat_send',
      { query },
      { conversation_history: conversationHistory }
    );
  }

  /**
   * Execute tool/handler (convenience method)
   * @param {string} toolName - Handler name (e.g., 'kbli.validate')
   * @param {Object} params - Tool parameters
   * @returns {Promise<Object>} Tool result with patches
   */
  async executeTool(toolName, params) {
    return this.sendEvent('tool_run', {
      tool: toolName,
      ...params
    });
  }

  /**
   * Save memory (convenience method)
   * @param {Object} memoryData - Data to save
   * @returns {Promise<Object>} Save result
   */
  async saveMemory(memoryData) {
    return this.sendEvent('memory_save', memoryData);
  }

  /**
   * Save lead (convenience method)
   * @param {Object} leadData - Lead information
   * @returns {Promise<Object>} Save result
   */
  async saveLead(leadData) {
    return this.sendEvent('lead_save', leadData);
  }

  /**
   * Restore session from localStorage
   * @returns {boolean} True if session was restored
   */
  restoreSession() {
    try {
      const stored = localStorage.getItem(this.sessionKey);
      if (!stored) return false;

      const data = JSON.parse(stored);

      // Check if session is still valid (< 24h)
      const age = Date.now() - data.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (age > maxAge) {
        console.log('⚠️ Session expired, clearing...');
        this.clearSession();
        return false;
      }

      // Restore session
      this.sessionId = data.sessionId;
      this.csrfToken = data.csrfToken;
      this.schema = data.schema;
      this.flags = data.flags;

      console.log('✅ Session restored:', this.sessionId);
      return true;

    } catch (error) {
      console.error('❌ Session restore error:', error);
      this.clearSession();
      return false;
    }
  }

  /**
   * Clear session data
   */
  clearSession() {
    this.sessionId = null;
    this.csrfToken = null;
    this.schema = null;
    this.flags = null;
    localStorage.removeItem(this.sessionKey);
    console.log('🗑️ Session cleared');
  }

  /**
   * Check if session is initialized
   * @returns {boolean}
   */
  isInitialized() {
    return !!(this.sessionId && this.csrfToken);
  }

  /**
   * Get current session info
   * @returns {Object}
   */
  getSessionInfo() {
    return {
      sessionId: this.sessionId,
      initialized: this.isInitialized(),
      schema: this.schema,
      flags: this.flags
    };
  }

  /**
   * Save session to localStorage
   * @private
   */
  _saveSession() {
    const data = {
      sessionId: this.sessionId,
      csrfToken: this.csrfToken,
      schema: this.schema,
      flags: this.flags,
      timestamp: Date.now()
    };

    localStorage.setItem(this.sessionKey, JSON.stringify(data));
  }

  /**
   * Generate unique idempotency key
   * @private
   * @returns {string}
   */
  _generateIdempotencyKey() {
    // Use crypto.randomUUID() if available, fallback to timestamp-based
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Fallback: timestamp + random
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Create and export singleton instance
export const gatewayClient = new GatewayClient();

// Also export class for testing/custom instances
export { GatewayClient };
