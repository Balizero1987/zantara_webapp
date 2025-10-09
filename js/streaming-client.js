// ZANTARA POST Streaming Client (NDJSON)
// Handles streaming responses from /api/chat endpoint

class StreamingClient {
  constructor() {
    this.abortController = null;
    this.isStreaming = false;
    this.currentBuffer = '';
    this.listeners = new Map();
  }

  // Event listeners management
  on(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  off(event, handler) {
    if (!this.listeners.has(event)) return;
    const handlers = this.listeners.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) handlers.splice(index, 1);
  }

  emit(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(handler => {
      try {
        handler(data);
      } catch (err) {
        console.error('[StreamingClient] Handler error:', err);
      }
    });
  }

  // Get API base URL from config
  getAPIBase() {
    // Use the getStreamingUrl helper if available
    if (window.ZANTARA_API?.getStreamingUrl) {
      return window.ZANTARA_API.getStreamingUrl();
    }

    // Fallback to config
    const config = window.ZANTARA_API?.config;
    if (!config) {
      console.warn('[StreamingClient] No ZANTARA_API config found');
      return 'https://zantara-v520-production-1064094238013.europe-west1.run.app/api/chat';
    }

    const isProxy = config.mode === 'proxy';
    if (isProxy && config.proxy?.production?.base) {
      return `${config.proxy.production.base}/chat`;
    }
    return `${config.production?.base || 'https://zantara-v520-production-1064094238013.europe-west1.run.app'}/api/chat`;
  }

  // Main streaming function
  async streamChat(messages, sessionId = null) {
    if (this.isStreaming) {
      console.warn('[StreamingClient] Already streaming, aborting previous');
      this.stop();
    }

    this.isStreaming = true;
    this.currentBuffer = '';
    this.abortController = new AbortController();

    const url = this.getAPIBase(); // Now returns the full URL including /chat

    try {
      // Emit start event
      this.emit('start', { sessionId, messages });

      // Get user ID if available
      const userId = window.ZANTARA_ID?.get?.() || localStorage.getItem('zantara-user-id') || '';

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/x-ndjson',
          'x-user-id': userId
        },
        body: JSON.stringify({
          sessionId: sessionId || `sess_${Date.now()}`,
          messages: messages
        }),
        signal: this.abortController.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('No response body available');
      }

      // Process streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        let lineEnd;
        while ((lineEnd = buffer.indexOf('\n')) >= 0) {
          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (!line) continue;

          try {
            const chunk = JSON.parse(line);
            this.handleChunk(chunk);
          } catch (err) {
            console.error('[StreamingClient] Failed to parse chunk:', line, err);
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        try {
          const chunk = JSON.parse(buffer.trim());
          this.handleChunk(chunk);
        } catch (err) {
          console.error('[StreamingClient] Failed to parse final chunk:', buffer, err);
        }
      }

      this.emit('complete', {});

    } catch (err) {
      if (err.name === 'AbortError') {
        this.emit('abort', {});
      } else {
        this.emit('error', { error: err.message });
        console.error('[StreamingClient] Stream error:', err);
      }
    } finally {
      this.isStreaming = false;
      this.abortController = null;
    }
  }

  // Handle individual NDJSON chunks
  handleChunk(chunk) {
    // Handle different chunk types based on the contract
    if (chunk.type === 'delta') {
      // Partial content token
      this.currentBuffer += chunk.content || '';
      this.emit('delta', {
        content: chunk.content,
        buffer: this.currentBuffer
      });

    } else if (chunk.type === 'tool') {
      // Tool call events
      if (chunk.status === 'start') {
        this.emit('tool-start', {
          name: chunk.name,
          args: chunk.args
        });
      } else if (chunk.status === 'result') {
        this.emit('tool-result', {
          name: chunk.name,
          data: chunk.data
        });
      }

    } else if (chunk.type === 'final') {
      // Final complete message
      this.currentBuffer = chunk.content || '';
      this.emit('final', { content: chunk.content });

    } else if (chunk.event === 'done') {
      // Stream completed
      this.emit('done', {});
    }
  }

  // Stop streaming
  stop() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.isStreaming = false;
    this.emit('stop', {});
  }

  // Check if currently streaming
  getIsStreaming() {
    return this.isStreaming;
  }

  // Get current buffer content
  getCurrentBuffer() {
    return this.currentBuffer;
  }
}

// Create singleton instance
const streamingClient = new StreamingClient();

// Expose to window for global access (renamed to avoid conflicts)
if (typeof window !== 'undefined') {
  window.ZANTARA_STREAMING_CLIENT = streamingClient;
  // Keep legacy name for backward compatibility
  window.ZANTARA_STREAMING = streamingClient;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StreamingClient;
}