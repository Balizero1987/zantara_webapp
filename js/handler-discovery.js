/**
 * Handler Discovery System for NUZANTARA-RAILWAY
 * This system automatically discovers and integrates backend handlers with the frontend
 * to maximize platform utilization.
 */

class HandlerDiscovery {
  constructor() {
    this.apiBase = 'https://ts-backend-production-568d.up.railway.app';
    this.handlers = [];
    this.categories = [];
    this.initialized = false;
  }

  /**
   * Initialize the handler discovery system
   */
  async initialize() {
    try {
      console.log('[HandlerDiscovery] Initializing...');
      
      // Fetch all available handlers
      await this.fetchHandlers();
      
      // Categorize handlers
      this.categorizeHandlers();
      
      // Mark as initialized
      this.initialized = true;
      
      console.log(`[HandlerDiscovery] Initialized with ${this.handlers.length} handlers across ${this.categories.length} categories`);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('handlers-loaded', {
        detail: { handlers: this.handlers, categories: this.categories }
      }));
      
      return true;
    } catch (error) {
      console.error('[HandlerDiscovery] Initialization failed:', error);
      return false;
    }
  }

  /**
   * Fetch all available handlers from backend
   */
  async fetchHandlers() {
    try {
      const response = await fetch(`${this.apiBase}/system.handlers.list`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.ok && data.data && data.data.handlers) {
        this.handlers = data.data.handlers;
        console.log(`[HandlerDiscovery] Fetched ${this.handlers.length} handlers`);
        return this.handlers;
      } else {
        throw new Error(data.error || 'Failed to fetch handlers');
      }
    } catch (error) {
      console.error('[HandlerDiscovery] Error fetching handlers:', error);
      // Fallback to static list if API fails
      this.handlers = this.getFallbackHandlers();
      return this.handlers;
    }
  }

  /**
   * Categorize handlers by type/function
   */
  categorizeHandlers() {
    const categoryMap = {};
    
    this.handlers.forEach(handler => {
      const category = handler.category || 'Other';
      if (!categoryMap[category]) {
        categoryMap[category] = [];
      }
      categoryMap[category].push(handler);
    });
    
    this.categories = Object.keys(categoryMap).map(category => ({
      name: category,
      handlers: categoryMap[category],
      count: categoryMap[category].length
    }));
    
    console.log('[HandlerDiscovery] Categorized handlers:', this.categories);
  }

  /**
   * Get handler by name
   */
  getHandler(name) {
    return this.handlers.find(handler => handler.name === name);
  }

  /**
   * Get handlers by category
   */
  getHandlersByCategory(category) {
    return this.categories.find(cat => cat.name === category) || { handlers: [] };
  }

  /**
   * Execute a handler with parameters
   */
  async executeHandler(handlerName, params = {}) {
    try {
      console.log(`[HandlerDiscovery] Executing handler: ${handlerName}`, params);
      
      const response = await fetch(`${this.apiBase}/system.handler.execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          handler: handlerName,
          params: params
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.ok) {
        console.log(`[HandlerDiscovery] Handler ${handlerName} executed successfully`);
        return data.data;
      } else {
        throw new Error(data.error || `Handler ${handlerName} execution failed`);
      }
    } catch (error) {
      console.error(`[HandlerDiscovery] Error executing handler ${handlerName}:`, error);
      throw error;
    }
  }

  /**
   * Get fallback handlers when API is unavailable
   */
  getFallbackHandlers() {
    return [
      {
        name: "team.list",
        category: "Team Management",
        description: "List all team members",
        parameters: []
      },
      {
        name: "team.login",
        category: "Authentication",
        description: "Team member login",
        parameters: ["email", "pin", "name"]
      },
      {
        name: "bali-zero.pricing.get",
        category: "Pricing",
        description: "Get service pricing information",
        parameters: ["service_type"]
      },
      {
        name: "ai.chat",
        category: "AI Services",
        description: "Chat with AI assistant",
        parameters: ["message", "context"]
      },
      {
        name: "analytics.dashboard",
        category: "Analytics",
        description: "Get dashboard analytics",
        parameters: []
      }
    ];
  }

  /**
   * Search handlers by keyword
   */
  searchHandlers(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    return this.handlers.filter(handler => 
      handler.name.toLowerCase().includes(lowerKeyword) ||
      handler.description.toLowerCase().includes(lowerKeyword) ||
      handler.category.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Get system statistics
   */
  getStatistics() {
    return {
      totalHandlers: this.handlers.length,
      categories: this.categories.length,
      initialized: this.initialized
    };
  }
}

// Initialize the handler discovery system
document.addEventListener('DOMContentLoaded', async () => {
  window.HandlerDiscovery = new HandlerDiscovery();
  await window.HandlerDiscovery.initialize();
  
  console.log('[HandlerDiscovery] System ready');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HandlerDiscovery;
}