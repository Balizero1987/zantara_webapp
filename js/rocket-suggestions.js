/**
 * Rocket Suggestions - Enhanced Smart Suggestions System
 * Takes the existing smart suggestions to the next level with contextual awareness
 */

class RocketSuggestions {
  constructor() {
    this.suggestionTemplates = [
      {
        id: 'business_setup',
        title: 'Business Setup',
        description: 'Get help with establishing your company in Indonesia',
        icon: '🏢',
        triggers: ['company', 'business', 'pt', 'establish', 'setup', 'found'],
        handler: 'bali-zero.oracle.business_setup',
        parameters: {}
      },
      {
        id: 'visa_application',
        title: 'Visa Application',
        description: 'Learn about visa requirements and application process',
        icon: '🛂',
        triggers: ['visa', 'kitas', 'kitap', 'application', 'permit', 'immigration'],
        handler: 'bali-zero.oracle.visa_application',
        parameters: {}
      },
      {
        id: 'tax_obligations',
        title: 'Tax Obligations',
        description: 'Understand your tax requirements and filings',
        icon: '💰',
        triggers: ['tax', 'pajak', 'filings', 'obligations', 'npwp'],
        handler: 'bali-zero.oracle.tax_obligations',
        parameters: {}
      },
      {
        id: 'team_management',
        title: 'Team Management',
        description: 'Manage your team members and permissions',
        icon: '👥',
        triggers: ['team', 'member', 'user', 'permission', 'access'],
        handler: 'team.list',
        parameters: {}
      },
      {
        id: 'pricing_info',
        title: 'Pricing Information',
        description: 'Get detailed pricing for our services',
        icon: '💸',
        triggers: ['price', 'cost', 'fee', 'pricing', 'charge'],
        handler: 'bali-zero.pricing.get',
        parameters: { service_type: 'general' }
      },
      {
        id: 'legal_docs',
        title: 'Legal Documents',
        description: 'Access important legal documents and templates',
        icon: '📜',
        triggers: ['document', 'legal', 'contract', 'template', 'form'],
        handler: 'drive.search',
        parameters: { query: 'legal documents' }
      }
    ];
    
    this.contextHistory = [];
    this.maxHistory = 10;
  }

  /**
   * Generate suggestions based on user input and context
   */
  generateSuggestions(userInput = '', context = {}) {
    // Add current context to history
    this.updateContextHistory(context);
    
    // Score templates based on input and context
    const scoredSuggestions = this.suggestionTemplates
      .map(template => ({
        ...template,
        score: this.calculateRelevanceScore(template, userInput, context)
      }))
      .filter(suggestion => suggestion.score > 0.3) // Only relevant suggestions
      .sort((a, b) => b.score - a.score) // Sort by relevance
      .slice(0, 5); // Top 5 suggestions
    
    return scoredSuggestions;
  }

  /**
   * Calculate relevance score for a suggestion template
   */
  calculateRelevanceScore(template, userInput, context) {
    let score = 0;
    
    // Check input keywords match (highest weight)
    if (userInput) {
      const inputLower = userInput.toLowerCase();
      const matches = template.triggers.filter(trigger => 
        inputLower.includes(trigger)
      ).length;
      
      score += (matches / template.triggers.length) * 0.5;
    }
    
    // Check context history (medium weight)
    if (this.contextHistory.length > 0) {
      const recentContext = this.contextHistory[this.contextHistory.length - 1];
      if (recentContext.category && template.triggers.some(trigger => 
        recentContext.category.toLowerCase().includes(trigger))) {
        score += 0.3;
      }
    }
    
    // Check conversation topics (lower weight)
    if (context.topics) {
      const topicMatches = context.topics.filter(topic => 
        template.triggers.some(trigger => trigger.includes(topic))
      ).length;
      
      score += (topicMatches / context.topics.length) * 0.2;
    }
    
    return Math.min(score, 1); // Cap at 1.0
  }

  /**
   * Update context history for better suggestions
   */
  updateContextHistory(context) {
    this.contextHistory.push(context);
    
    // Keep only the most recent contexts
    if (this.contextHistory.length > this.maxHistory) {
      this.contextHistory.shift();
    }
  }

  /**
   * Render suggestions in the UI
   */
  renderSuggestions(suggestions, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (suggestions.length === 0) {
      container.innerHTML = '<p class="no-suggestions">No suggestions available</p>';
      return;
    }
    
    container.innerHTML = `
      <div class="rocket-suggestions">
        <h3>🚀 Quick Actions</h3>
        <div class="suggestions-grid">
          ${suggestions.map(suggestion => `
            <div class="suggestion-card" data-handler="${suggestion.handler}">
              <div class="suggestion-icon">${suggestion.icon}</div>
              <div class="suggestion-content">
                <h4>${suggestion.title}</h4>
                <p>${suggestion.description}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
    
    // Add click handlers
    container.querySelectorAll('.suggestion-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const handler = card.getAttribute('data-handler');
        this.onSuggestionClick(handler);
      });
    });
  }

  /**
   * Handle suggestion click
   */
  onSuggestionClick(handlerName) {
    console.log(`[RocketSuggestions] Suggestion clicked: ${handlerName}`);
    
    // Dispatch event for other components to handle
    window.dispatchEvent(new CustomEvent('suggestion-selected', {
      detail: { handler: handlerName }
    }));
    
    // If HandlerDiscovery is available, execute the handler
    if (window.HandlerDiscovery && window.HandlerDiscovery.initialized) {
      const handler = window.HandlerDiscovery.getHandler(handlerName);
      if (handler) {
        // In a real implementation, you would execute the handler here
        console.log(`[RocketSuggestions] Ready to execute: ${handlerName}`);
      }
    }
  }

  /**
   * Add new suggestion template dynamically
   */
  addSuggestionTemplate(template) {
    this.suggestionTemplates.push(template);
  }

  /**
   * Get all suggestion templates
   */
  getAllTemplates() {
    return this.suggestionTemplates;
  }
}

// Initialize Rocket Suggestions
document.addEventListener('DOMContentLoaded', () => {
  window.RocketSuggestions = new RocketSuggestions();
  
  console.log('[RocketSuggestions] System ready');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RocketSuggestions;
}