/**
 * ZANTARA Conversation Persistence
 * Saves and loads conversation history from PostgreSQL backend
 */

class ConversationPersistence {
  constructor() {
    this.apiBase = 'https://scintillating-kindness-production-47e3.up.railway.app';
    this.saveDebounceTimer = null;
    this.saveDebounceDelay = 2000; // Save 2 seconds after last message
  }

  /**
   * Save conversation to database
   * @param {string} userEmail - User's email
   * @param {Array} messages - Conversation history
   * @returns {Promise<boolean>}
   */
  async saveConversation(userEmail, messages) {
    if (!userEmail || !messages || messages.length === 0) {
      console.log('[ConversationPersistence] Nothing to save');
      return false;
    }

    try {
      const response = await fetch(`${this.apiBase}/bali-zero/conversations/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'zantara-internal-dev-key-2025'
        },
        body: JSON.stringify({
          user_email: userEmail,
          messages: messages,
          session_id: this.getSessionId(),
          metadata: {
            saved_at: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ [ConversationPersistence] Saved ${result.messages_saved} messages for ${userEmail}`);
      return true;

    } catch (error) {
      console.error('❌ [ConversationPersistence] Save failed:', error);
      return false;
    }
  }

  /**
   * Save with debounce (waits for user to stop typing)
   * @param {string} userEmail
   * @param {Array} messages
   */
  saveConversationDebounced(userEmail, messages) {
    // Clear existing timer
    if (this.saveDebounceTimer) {
      clearTimeout(this.saveDebounceTimer);
    }

    // Set new timer
    this.saveDebounceTimer = setTimeout(() => {
      this.saveConversation(userEmail, messages);
    }, this.saveDebounceDelay);
  }

  /**
   * Load conversation history from database
   * @param {string} userEmail - User's email
   * @param {number} limit - Max messages to load
   * @returns {Promise<Array>}
   */
  async loadConversation(userEmail, limit = 20) {
    if (!userEmail) {
      console.log('[ConversationPersistence] No user email provided');
      return [];
    }

    try {
      const url = new URL(`${this.apiBase}/bali-zero/conversations/history`);
      url.searchParams.append('user_email', userEmail);
      url.searchParams.append('limit', limit.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'zantara-internal-dev-key-2025'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.messages && result.messages.length > 0) {
        console.log(`✅ [ConversationPersistence] Loaded ${result.messages.length} messages for ${userEmail}`);
        return result.messages;
      }

      console.log('[ConversationPersistence] No previous conversation found');
      return [];

    } catch (error) {
      console.error('❌ [ConversationPersistence] Load failed:', error);
      return [];
    }
  }

  /**
   * Clear conversation history
   * @param {string} userEmail
   * @returns {Promise<boolean>}
   */
  async clearConversation(userEmail) {
    if (!userEmail) return false;

    try {
      const url = new URL(`${this.apiBase}/bali-zero/conversations/clear`);
      url.searchParams.append('user_email', userEmail);

      const response = await fetch(url.toString(), {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'zantara-internal-dev-key-2025'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log(`✅ [ConversationPersistence] Cleared ${result.deleted_count} conversations`);
      return true;

    } catch (error) {
      console.error('❌ [ConversationPersistence] Clear failed:', error);
      return false;
    }
  }

  /**
   * Get or create session ID
   * @returns {string}
   */
  getSessionId() {
    let sessionId = sessionStorage.getItem('zantara-session-id');
    if (!sessionId) {
      sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('zantara-session-id', sessionId);
    }
    return sessionId;
  }

  /**
   * Render loaded messages to UI
   * @param {Array} messages - Messages to render
   */
  renderMessages(messages) {
    if (!messages || messages.length === 0) return;

    const messagesDiv = document.querySelector('.messages');
    if (!messagesDiv) return;

    // Clear welcome message
    const welcome = messagesDiv.querySelector('.welcome');
    if (welcome) {
      messagesDiv.innerHTML = '';
    }

    // Render each message
    messages.forEach(msg => {
      const messageDiv = document.createElement('div');
      messageDiv.className = msg.role === 'user' ? 'user-message' : 'ai-message';

      // For AI messages, apply markdown formatting if available
      if (msg.role === 'assistant' && window.MessageFormatter) {
        messageDiv.innerHTML = MessageFormatter.formatStructuredMessage(msg.content, {
          showCTA: false,
          language: MessageFormatter.detectLanguage(msg.content, 'it')
        });
      } else {
        messageDiv.textContent = msg.content;
      }

      messagesDiv.appendChild(messageDiv);
    });

    // Scroll to bottom
    setTimeout(() => {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 100);

    console.log(`✅ [ConversationPersistence] Rendered ${messages.length} messages to UI`);
  }
}

// Create global instance
window.ConversationPersistence = new ConversationPersistence();

console.log('✅ [ConversationPersistence] Initialized');
