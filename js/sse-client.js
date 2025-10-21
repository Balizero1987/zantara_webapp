/**
 * ZANTARA SSE Streaming Client
 * Handles Server-Sent Events (SSE) streaming from /bali-zero/chat-stream
 *
 * Real-time word-by-word streaming like ChatGPT/Claude
 */

class ZantaraSSEClient {
  constructor() {
    this.eventSource = null;
    this.isStreaming = false;
    this.currentMessage = '';
    this.listeners = new Map();
    this.baseUrl = this.getAPIBase();
  }

  // Get API base URL for SSE streaming
  getAPIBase() {
    // ⚠️ IMPORTANT: SSE streaming is ONLY available on RAG Backend!
    // The TypeScript backend doesn't have /bali-zero/chat-stream endpoint.
    // Always use RAG backend for SSE, regardless of api-config.js settings.

    const RAG_BACKEND = 'https://scintillating-kindness-production-47e3.up.railway.app';

    // Check if config explicitly overrides SSE endpoint
    if (window.ZANTARA_API?.config?.sse_backend) {
      console.log('[ZantaraSSE] Using custom SSE backend:', window.ZANTARA_API.config.sse_backend);
      return window.ZANTARA_API.config.sse_backend;
    }

    // Default: Always use RAG backend for SSE
    console.log('[ZantaraSSE] Using RAG backend for SSE streaming:', RAG_BACKEND);
    return RAG_BACKEND;
  }

  // Event listeners management
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
    return this; // Allow chaining
  }

  off(event, handler) {
    if (!this.listeners.has(event)) return this;
    const handlers = this.listeners.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
    return this;
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(handler => {
      try {
        handler(data);
      } catch (err) {
        console.error('[ZantaraSSE] Handler error:', err);
      }
    });
  }

  /**
   * Start SSE streaming
   *
   * @param {string} query - User message/question
   * @param {string} userEmail - Optional user email for personalization
   * @param {Array} conversationHistory - Optional conversation history for context
   * @returns {Promise<string>} - Resolves with complete message when done
   */
  async stream(query, userEmail = null, conversationHistory = null) {
    if (this.isStreaming) {
      console.warn('[ZantaraSSE] Already streaming, stopping previous stream');
      this.stop();
    }

    return new Promise((resolve, reject) => {
      this.isStreaming = true;
      this.currentMessage = '';

      // Build URL with query parameters
      const url = new URL(`${this.baseUrl}/bali-zero/chat-stream`);
      url.searchParams.append('query', query);

      // Add user email if available
      if (userEmail) {
        url.searchParams.append('user_email', userEmail);
      } else {
        // Try to get from localStorage
        const storedEmail = localStorage.getItem('zantara-user-email');
        if (storedEmail && storedEmail !== 'undefined' && storedEmail !== 'null') {
          url.searchParams.append('user_email', storedEmail);
        }
      }

      // ✨ Add conversation history for context (as JSON)
      if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
        url.searchParams.append('conversation_history', JSON.stringify(conversationHistory));
        console.log('[ZantaraSSE] Sending conversation history:', conversationHistory.length, 'messages');
      }

      console.log('[ZantaraSSE] Connecting to:', url.toString());

      // Create EventSource connection
      this.eventSource = new EventSource(url.toString());

      // Emit start event
      this.emit('start', { query, userEmail });

      // Handle incoming messages
      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Check if stream is done
          if (data.done) {
            this.stop();
            this.emit('complete', { message: this.currentMessage });
            resolve(this.currentMessage);
            return;
          }

          // Check for errors
          if (data.error) {
            this.stop();
            this.emit('error', { error: data.error });
            reject(new Error(data.error));
            return;
          }

          // Process text chunk
          if (data.text) {
            this.currentMessage += data.text;

            // Emit delta event for UI updates
            this.emit('delta', {
              chunk: data.text,
              message: this.currentMessage
            });
          }

        } catch (err) {
          console.error('[ZantaraSSE] Failed to parse event data:', event.data, err);
          this.emit('parse-error', { error: err.message, data: event.data });
        }
      };

      // Handle connection errors
      this.eventSource.onerror = (error) => {
        console.error('[ZantaraSSE] Connection error:', error);
        this.stop();

        // Emit error with context
        const errorMessage = this.currentMessage
          ? 'Stream interrupted - partial message received'
          : 'Failed to connect to streaming service';

        this.emit('error', {
          error: errorMessage,
          partial: this.currentMessage
        });

        reject(new Error(errorMessage));
      };

      // Handle connection open
      this.eventSource.onopen = () => {
        console.log('[ZantaraSSE] Connection established');
        this.emit('connected', {});
      };
    });
  }

  /**
   * Stop streaming and close connection
   */
  stop() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isStreaming = false;
    this.emit('stop', { message: this.currentMessage });
  }

  /**
   * Check if currently streaming
   */
  getIsStreaming() {
    return this.isStreaming;
  }

  /**
   * Get current accumulated message
   */
  getCurrentMessage() {
    return this.currentMessage;
  }

  /**
   * Clear current message buffer
   */
  clearMessage() {
    this.currentMessage = '';
  }
}

// Create singleton instance
const zantaraSSE = new ZantaraSSEClient();

// Expose to window for global access
if (typeof window !== 'undefined') {
  window.ZANTARA_SSE = zantaraSSE;

  // Log availability
  console.log('[ZantaraSSE] Client initialized and ready');
  console.log('[ZantaraSSE] API Base:', zantaraSSE.baseUrl);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZantaraSSEClient;
}
