/**
 * API Client Layer
 *
 * Handles all HTTP communication with ZANTARA backend.
 * Implements retry logic, error handling, and JWT authentication.
 */

import { config } from '../config.js';
import { jwtService } from '../auth/jwt-service.js';

class APIClient {
  constructor() {
    this.baseUrl = config.api.proxyUrl;
    this.timeout = config.api.timeout;
    this.retryAttempts = config.api.retryAttempts;
    this.retryDelay = config.api.retryDelay;
  }

  /**
   * Make authenticated API call
   */
  async call(endpoint, params = {}, useStreaming = false) {
    const authHeader = await jwtService.getAuthHeader();

    if (!authHeader) {
      throw new Error('Not authenticated');
    }

    const user = jwtService.getUser();
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
      'x-user-id': user?.email || 'guest@zantara.io',
      'x-session-id': this._getSessionId(),
    };

    const body = {
      key: endpoint.startsWith('/') ? endpoint.slice(1) : endpoint,
      params,
    };

    if (useStreaming) {
      return this._streamingCall(headers, body);
    } else {
      return this._standardCall(headers, body);
    }
  }

  /**
   * Standard (non-streaming) API call with retry logic
   */
  async _standardCall(headers, body, attempt = 1) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/call`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle rate limiting and server errors with retry
      if ((response.status === 429 || response.status >= 500) && attempt < this.retryAttempts) {
        const delay = this.retryDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await this._sleep(delay);
        return this._standardCall(headers, body, attempt + 1);
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  }

  /**
   * Streaming API call
   */
  async _streamingCall(headers, body) {
    const response = await fetch(`${this.baseUrl}/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.body;
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        timeout: 5000,
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get or create session ID
   */
  _getSessionId() {
    let sessionId = localStorage.getItem('zantara-session-id');
    if (!sessionId) {
      sessionId = this._generateSessionId();
      localStorage.setItem('zantara-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Generate unique session ID
   */
  _generateSessionId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Sleep utility for retry delays
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const apiClient = new APIClient();
export default apiClient;