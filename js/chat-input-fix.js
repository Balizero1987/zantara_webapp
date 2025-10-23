/**
 * Chat Input Fix - Centralized Enter Key Handling
 * 
 * This module provides a robust solution for the Enter key issue in chat.
 * It handles all edge cases and conflicts between different chat implementations.
 */

class ChatInputFix {
  constructor() {
    this.isInitialized = false;
    this.activeInputs = new Set();
    this.eventListeners = new Map();
  }

  /**
   * Initialize the fix for all chat inputs on the page
   */
  init() {
    if (this.isInitialized) return;
    
    console.log('[ChatInputFix] Initializing...');
    
    // Find all potential chat input elements
    const inputSelectors = [
      '#chatInput',
      '#messageInput', 
      '#inputField',
      'textarea[placeholder*="message" i]',
      'textarea[placeholder*="type" i]',
      'input[type="text"][placeholder*="message" i]'
    ];
    
    const inputs = [];
    inputSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => inputs.push(el));
    });
    
    // Also check for dynamically created inputs
    this.observeNewInputs();
    
    // Apply fix to existing inputs
    inputs.forEach(input => this.fixInput(input));
    
    this.isInitialized = true;
    console.log(`[ChatInputFix] Fixed ${inputs.length} inputs`);
  }

  /**
   * Fix a specific input element
   */
  fixInput(input) {
    if (!input || this.activeInputs.has(input)) return;
    
    console.log('[ChatInputFix] Fixing input:', input.id || input.className);
    
    // Remove any existing event listeners to prevent conflicts
    this.removeExistingListeners(input);
    
    // Add our robust event listeners
    const keydownHandler = (e) => this.handleKeydown(e, input);
    const keypressHandler = (e) => this.handleKeypress(e, input);
    
    input.addEventListener('keydown', keydownHandler, { passive: false });
    input.addEventListener('keypress', keypressHandler, { passive: false });
    
    // Store references for cleanup
    this.eventListeners.set(input, { keydownHandler, keypressHandler });
    this.activeInputs.add(input);
    
    // Add visual indicator that fix is active
    input.setAttribute('data-chat-fix', 'active');
  }

  /**
   * Handle keydown events
   */
  handleKeydown(e, input) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('[ChatInputFix] Enter key detected (keydown)');
      this.sendMessage(input);
      
      return false;
    }
  }

  /**
   * Handle keypress events (fallback)
   */
  handleKeypress(e, input) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      console.log('[ChatInputFix] Enter key detected (keypress fallback)');
      this.sendMessage(input);
      
      return false;
    }
  }

  /**
   * Send message using the appropriate method
   */
  sendMessage(input) {
    const message = input.value.trim();
    if (!message) return;
    
    console.log('[ChatInputFix] Sending message:', message);
    
    // Try different send methods based on what's available
    if (typeof sendMessage === 'function') {
      sendMessage();
    } else if (typeof window.sendMessage === 'function') {
      window.sendMessage();
    } else if (typeof window.sendChatMessage === 'function') {
      window.sendChatMessage();
    } else {
      // Fallback: trigger click on send button
      const sendButton = document.querySelector('#sendButton, #sendBtn, .send-button, [data-action="send"]');
      if (sendButton) {
        sendButton.click();
      } else {
        console.warn('[ChatInputFix] No send method found');
      }
    }
    
    // Clear input after sending
    input.value = '';
    
    // Trigger resize for textareas
    if (input.tagName === 'TEXTAREA') {
      input.style.height = 'auto';
      input.style.height = input.scrollHeight + 'px';
    }
  }

  /**
   * Remove existing event listeners to prevent conflicts
   */
  removeExistingListeners(input) {
    // Clone the element to remove all event listeners
    const newInput = input.cloneNode(true);
    input.parentNode.replaceChild(newInput, input);
    
    // Return the new element
    return newInput;
  }

  /**
   * Observe for new inputs added dynamically
   */
  observeNewInputs() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is an input
            if (node.matches && node.matches('input, textarea')) {
              this.fixInput(node);
            }
            
            // Check for inputs within the added node
            const inputs = node.querySelectorAll ? node.querySelectorAll('input, textarea') : [];
            inputs.forEach(input => this.fixInput(input));
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Cleanup method
   */
  destroy() {
    this.activeInputs.forEach(input => {
      const listeners = this.eventListeners.get(input);
      if (listeners) {
        input.removeEventListener('keydown', listeners.keydownHandler);
        input.removeEventListener('keypress', listeners.keypressHandler);
      }
    });
    
    this.activeInputs.clear();
    this.eventListeners.clear();
    this.isInitialized = false;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.chatInputFix = new ChatInputFix();
    window.chatInputFix.init();
  });
} else {
  window.chatInputFix = new ChatInputFix();
  window.chatInputFix.init();
}

// Export for manual use
if (typeof window !== 'undefined') {
  window.ChatInputFix = ChatInputFix;
}

export default ChatInputFix;
