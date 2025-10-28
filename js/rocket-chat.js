/**
 * Rocket Chat - Enhanced Chat Interface for NUZANTARA-RAILWAY
 * Integrates handler discovery and smart suggestions into the chat experience
 */

class RocketChat {
  constructor() {
    this.apiBase = 'https://ts-backend-production-568d.up.railway.app';
    this.messageHistory = [];
    this.currentContext = {};
  }

  /**
   * Initialize the rocket chat system
   */
  async initialize() {
    console.log('[RocketChat] Initializing rocket chat...');
    
    // Wait for handler discovery to be ready
    if (window.HandlerDiscovery && !window.HandlerDiscovery.initialized) {
      // Wait a bit for initialization
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (window.HandlerDiscovery.initialized) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
    }
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Initialize context
    this.updateContext();
    
    console.log('[RocketChat] Rocket chat initialized');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for handler updates
    window.addEventListener('handlers-loaded', () => {
      console.log('[RocketChat] Handlers loaded, updating interface');
    });
    
    // Listen for suggestion selections
    window.addEventListener('suggestion-selected', (event) => {
      this.handleSuggestionSelection(event.detail.handler);
    });
    
    // Listen for message sends
    window.addEventListener('message-sent', (event) => {
      this.handleUserMessage(event.detail.message);
    });
  }

  /**
   * Handle user message input
   */
  async handleUserMessage(message) {
    console.log(`[RocketChat] Handling user message: ${message}`);
    
    // Add to message history
    this.messageHistory.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    // Update context with message
    this.updateContextWithMessage(message);
    
    // Generate and show suggestions
    this.generateSuggestions(message);
    
    // In a full implementation, you would also send the message to the AI
    // and handle the response
  }

  /**
   * Handle suggestion selection
   */
  async handleSuggestionSelection(handlerName) {
    console.log(`[RocketChat] Handling suggestion: ${handlerName}`);
    
    // In a real implementation, you would execute the handler
    if (window.HandlerDiscovery && window.HandlerDiscovery.initialized) {
      try {
        // Show that we're working on it
        this.showSystemMessage(`🚀 Executing ${handlerName}...`);
        
        // Execute the handler
        const result = await window.HandlerDiscovery.executeHandler(handlerName);
        
        // Show the result
        this.showSystemMessage(`✅ Completed: ${handlerName}`, 'success');
        if (result) {
          this.showSystemMessage(JSON.stringify(result, null, 2), 'result');
        }
      } catch (error) {
        console.error(`[RocketChat] Error executing handler ${handlerName}:`, error);
        this.showSystemMessage(`❌ Error executing ${handlerName}: ${error.message}`, 'error');
      }
    } else {
      this.showSystemMessage(`⚠️ Handler system not ready. Please try again.`, 'warning');
    }
  }

  /**
   * Generate smart suggestions based on user input
   */
  generateSuggestions(userInput) {
    if (window.RocketSuggestions) {
      const suggestions = window.RocketSuggestions.generateSuggestions(
        userInput, 
        this.currentContext
      );
      
      // Render suggestions in the UI
      window.RocketSuggestions.renderSuggestions(
        suggestions, 
        'smart-suggestions-container'
      );
    }
  }

  /**
   * Update context with new message
   */
  updateContextWithMessage(message) {
    // Extract topics from message (simplified)
    const topics = this.extractTopics(message);
    
    // Update current context
    this.currentContext = {
      ...this.currentContext,
      topics: topics,
      lastMessage: message,
      timestamp: new Date()
    };
    
    // Update context history
    if (window.RocketSuggestions) {
      window.RocketSuggestions.updateContextHistory(this.currentContext);
    }
  }

  /**
   * Extract topics from message (simplified implementation)
   */
  extractTopics(message) {
    const commonTopics = [
      'business', 'visa', 'tax', 'team', 'pricing', 
      'legal', 'documents', 'setup', 'application'
    ];
    
    const topics = [];
    const messageLower = message.toLowerCase();
    
    commonTopics.forEach(topic => {
      if (messageLower.includes(topic)) {
        topics.push(topic);
      }
    });
    
    return topics;
  }

  /**
   * Update overall context
   */
  updateContext() {
    this.currentContext = {
      timestamp: new Date(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      // In a real implementation, you would add more context
    };
  }

  /**
   * Show a system message in the chat
   */
  showSystemMessage(message, type = 'info') {
    // This would integrate with the existing chat UI
    console.log(`[System ${type}]: ${message}`);
    
    // In a full implementation, you would add this to the chat display
    // For now, we'll just log it
  }

  /**
   * Get chat statistics
   */
  getStatistics() {
    return {
      messages: this.messageHistory.length,
      context: this.currentContext,
      handlersAvailable: window.HandlerDiscovery ? 
        window.HandlerDiscovery.handlers.length : 0
    };
  }
}

// Initialize Rocket Chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.rocketChat = new RocketChat();
  window.rocketChat.initialize();
  
  console.log('[RocketChat] System ready');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RocketChat;
}