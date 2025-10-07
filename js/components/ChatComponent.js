/**
 * Chat Component
 *
 * Handles chat UI rendering and interactions.
 */

import DOMPurify from 'dompurify';
import { apiClient } from '../core/api-client.js';
import { stateManager } from '../core/state-manager.js';

export class ChatComponent {
  constructor(container) {
    this.container = container;
    this.messagesContainer = null;
    this.inputField = null;
    this.sendButton = null;

    this._setupEventListeners();
  }

  /**
   * Initialize component
   */
  init() {
    this.render();
    this._subscribeToState();
    this._scrollToBottom();
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
      return `
        <div class="empty-state">
          <h2>Welcome to ZANTARA</h2>
          <p>Start a conversation to get assistance with your needs.</p>
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

    return `
      <div class="message ${isUser ? 'user-message' : 'assistant-message'}">
        <div class="message-avatar">${avatar}</div>
        <div class="message-content">
          <div class="message-text">${this._formatMessage(message.content)}</div>
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
      // Call API
      const response = await apiClient.call('ai.chat', {
        message: text,
        history: stateManager.state.messages.slice(-10),
      });

      // Add assistant response
      stateManager.addMessage({
        role: 'assistant',
        content: response.result || response.message || 'No response',
      });
    } catch (error) {
      console.error('Chat error:', error);
      stateManager.addMessage({
        role: 'assistant',
        content: `Error: ${error.message}`,
      });
    } finally {
      stateManager.setTyping(false);
    }
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
   * Destroy component
   */
  destroy() {
    // Cleanup event listeners
    this.container.innerHTML = '';
  }
}

export default ChatComponent;