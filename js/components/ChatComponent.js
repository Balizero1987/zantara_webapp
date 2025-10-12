/**
 * Chat Component
 *
 * Handles chat UI rendering and interactions.
 * Now supports both legacy API and new Gateway.
 */

import DOMPurify from 'dompurify';
import { apiClient } from '../core/api-client.js';
import { gatewayClient } from '../core/gateway-client.js';
import { stateManager } from '../core/state-manager.js';
import { config } from '../config.js';
import { jwtService } from '../auth/jwt-service.js';

export class ChatComponent {
  constructor(container) {
    this.container = container;
    this.messagesContainer = null;
    this.inputField = null;
    this.sendButton = null;
    this.useGateway = config.features.useGateway;
    this.gatewayInitialized = false;

    this._setupEventListeners();
  }

  /**
   * Initialize component
   */
  async init() {
    this.render();
    this._subscribeToState();
    this._scrollToBottom();

    // Initialize gateway if enabled
    if (this.useGateway) {
      await this._initializeGateway();
    }
  }

  /**
   * Initialize gateway session
   * @private
   */
  async _initializeGateway() {
    try {
      // Try to restore existing session
      if (gatewayClient.restoreSession()) {
        console.log('✅ Gateway session restored');
        this.gatewayInitialized = true;
        this._showSystemMessage('Gateway session restored');
        return;
      }

      // Bootstrap new session
      const user = jwtService.getUser();
      const userEmail = user?.email || 'guest@zantara.io';

      await gatewayClient.bootstrap(userEmail);
      this.gatewayInitialized = true;

      console.log('✅ Gateway session initialized');
      this._showSystemMessage('Connected via Gateway API');

    } catch (error) {
      console.error('❌ Gateway initialization failed:', error);
      this._showSystemMessage('Gateway unavailable, using legacy API');
      this.useGateway = false;
    }
  }

  /**
   * Show system message
   * @private
   */
  _showSystemMessage(text) {
    // Optional: show system messages in UI
    console.log(`[SYSTEM] ${text}`);
  }

  /**
   * Render chat UI
   */
  render() {
    this.container.innerHTML = DOMPurify.sanitize(`
      <div class="chat-messages" id="chatMessages">
        ${this._renderMessages()}
      </div>
      <div class="typing-indicator" id="typingIndicator" style="display: none;">
        <span></span><span></span><span></span>
      </div>
      <div class="chat-input-container">
        <textarea
          id="chatInput"
          class="chat-input"
          placeholder="Type your message..."
          rows="1"
        ></textarea>
        <button id="sendButton" class="send-button">
          <span class="send-icon">➤</span>
        </button>
      </div>
    `);

    this.messagesContainer = document.getElementById('chatMessages');
    this.inputField = document.getElementById('chatInput');
    this.sendButton = document.getElementById('sendButton');
    this.typingIndicator = document.getElementById('typingIndicator');

    this._attachEventHandlers();
  }

  /**
   * Render messages
   */
  _renderMessages() {
    const messages = stateManager.state.messages;

    if (messages.length === 0) {
      const apiMode = this.useGateway ? 'Gateway' : 'Legacy';
      return `
        <div class="empty-state">
          <h2>Welcome to ZANTARA</h2>
          <p>Start a conversation to get assistance with your needs.</p>
          <small style="color: #888; margin-top: 10px; display: block;">
            API Mode: ${apiMode}
            ${this.useGateway ? '✨' : ''}
          </small>
        </div>
      `;
    }

    return messages.map(msg => this._renderMessage(msg)).join('');
  }

  /**
   * Render single message
   */
  _renderMessage(message) {
    const isUser = message.role === 'user';
    const avatar = isUser
      ? '<svg class="user-icon"><!-- User icon --></svg>'
      : '<img src="public/images/zantara-logo.jpeg" alt="ZANTARA" class="assistant-avatar">';

    // Show sources if available (gateway response)
    const sourcesHtml = message.sources && message.sources.length > 0
      ? `<div class="message-sources">
          <details>
            <summary>📚 ${message.sources.length} sources</summary>
            <ul>
              ${message.sources.map(s => `
                <li>
                  <strong>${s.title || 'Document'}</strong>
                  <span class="source-score">Score: ${(s.score || 0).toFixed(2)}</span>
                </li>
              `).join('')}
            </ul>
          </details>
        </div>`
      : '';

    return `
      <div class="message ${isUser ? 'user-message' : 'assistant-message'}">
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
          <div class="message-text">${this._formatMessage(message.content)}</div>
          ${sourcesHtml}
          <div class="message-timestamp">${this._formatTime(message.timestamp)}</div>
        </div>
      </div>
    `;
  }

  /**
   * Format message content (markdown-like)
   */
  _formatMessage(content) {
    return content
      // Headers (must come before bold to avoid conflicts)
      .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
      .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
      // Lists
      .replace(/^- (.*?)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*?)$/gm, '<li>$2</li>')
      // Bold and italic
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code blocks
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Line breaks
      .replace(/\n/g, '<br>');
  }

  /**
   * Format timestamp
   */
  _formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Attach event handlers
   */
  _attachEventHandlers() {
    // Send button
    this.sendButton.addEventListener('click', () => this.sendMessage());

    // Enter key to send
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea
    this.inputField.addEventListener('input', () => {
      this.inputField.style.height = 'auto';
      this.inputField.style.height = this.inputField.scrollHeight + 'px';
    });
  }

  /**
   * Setup state listeners
   */
  _subscribeToState() {
    // Listen for new messages
    stateManager.subscribe('messages', () => {
      this._updateMessages();
    });

    // Listen for typing indicator
    stateManager.subscribe('isTyping', (isTyping) => {
      this.typingIndicator.style.display = isTyping ? 'flex' : 'none';
    });
  }

  /**
   * Update messages display
   */
  _updateMessages() {
    this.messagesContainer.innerHTML = DOMPurify.sanitize(this._renderMessages());
    this._scrollToBottom();
  }

  /**
   * Send message
   */
  async sendMessage() {
    const text = this.inputField.value.trim();
    if (!text) return;

    // Add user message
    stateManager.addMessage({
      role: 'user',
      content: text,
    });

    // Clear input
    this.inputField.value = '';
    this.inputField.style.height = 'auto';

    // Show typing indicator
    stateManager.setTyping(true);

    try {
      if (this.useGateway && this.gatewayInitialized) {
        await this._sendViaGateway(text);
      } else {
        await this._sendViaLegacy(text);
      }
    } catch (error) {
      console.error('Chat error:', error);
      stateManager.addMessage({
        role: 'assistant',
        content: `❌ Error: ${error.message}`,
      });
    } finally {
      stateManager.setTyping(false);
    }
  }

  /**
   * Send message via gateway
   * @private
   */
  async _sendViaGateway(text) {
    const history = stateManager.state.messages
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content }));

    const result = await gatewayClient.sendChat(text, history);

    if (!result.ok) {
      throw new Error(result.message || 'Gateway request failed');
    }

    // Process patches
    this._applyPatches(result.patches || []);
  }

  /**
   * Apply gateway patches to state
   * @private
   */
  _applyPatches(patches) {
    let assistantMessage = null;
    let sources = null;

    patches.forEach(patch => {
      switch (patch.op) {
        case 'append':
          if (patch.target === 'timeline' && patch.data.role === 'assistant') {
            assistantMessage = patch.data.content;
          }
          break;

        case 'set':
          if (patch.target === 'sources') {
            sources = patch.data;
          }
          break;

        case 'notify':
          console.log(`[${patch.level}] ${patch.message}`);
          break;
      }
    });

    // Add assistant message with sources
    if (assistantMessage) {
      stateManager.addMessage({
        role: 'assistant',
        content: assistantMessage,
        sources: sources || [],
      });
    }
  }

  /**
   * Send message via legacy API
   * @private
   */
  async _sendViaLegacy(text) {
    const history = stateManager.state.messages.slice(-10);

    const response = await apiClient.call('ai.chat', {
      message: text,
      history: history,
    });

    // Add assistant response
    stateManager.addMessage({
      role: 'assistant',
      content: response.result || response.message || 'No response',
    });
  }

  /**
   * Scroll to bottom
   */
  _scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 100);
  }

  /**
   * Setup event listeners
   */
  _setupEventListeners() {
    // Activity tracking
    ['click', 'keydown', 'scroll'].forEach(event => {
      document.addEventListener(event, () => {
        stateManager.updateActivity();
      });
    });
  }

  /**
   * Clear chat
   */
  clearChat() {
    if (confirm('Clear all messages?')) {
      stateManager.clearMessages();
    }
  }

  /**
   * Toggle API mode (for testing)
   */
  toggleGateway() {
    this.useGateway = !this.useGateway;
    localStorage.setItem('feature_gateway', this.useGateway.toString());
    location.reload();
  }
}
