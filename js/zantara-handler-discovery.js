/**
 * ZANTARA Handler Discovery System
 * 
 * This module provides dynamic discovery and execution of the 164 available
 * TypeScript backend handlers, enabling ZANTARA to access the full backend
 * capabilities instead of being limited to just the RAG chat endpoint.
 * 
 * Architecture:
 * - Discovers handlers via /system.handlers.list
 * - Gets handler details via /system.handlers.get
 * - Executes handlers via /system.handler.execute
 * - Caches handler metadata for performance
 * 
 * @author ZANTARA Intelligence System
 * @version 1.0.0
 */

class ZantaraHandlerDiscovery {
    constructor() {
        this.availableHandlers = new Map();
        this.handlerCapabilities = new Map();
        this.handlerCategories = new Map();
        this.isLoaded = false;
        this.loadPromise = null;
        
        // Cache configuration
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.lastLoadTime = 0;
        
        console.log('🔍 [HandlerDiscovery] Initialized');
    }
    
    /**
     * Load all available handlers from TS Backend
     * @returns {Promise<boolean>} Success status
     */
    async loadHandlers() {
        // Return cached promise if already loading
        if (this.loadPromise) {
            return this.loadPromise;
        }
        
        // Check if cache is still valid
        const now = Date.now();
        if (this.isLoaded && (now - this.lastLoadTime) < this.cacheTimeout) {
            console.log('🔍 [HandlerDiscovery] Using cached handlers');
            return true;
        }
        
        this.loadPromise = this._loadHandlersFromBackend();
        return this.loadPromise;
    }
    
    async _loadHandlersFromBackend() {
        try {
            console.log('🔍 [HandlerDiscovery] Loading handlers from TS Backend...');
            
            // Call the system.handlers.list endpoint
            const response = await window.API_CONTRACTS.call('ts', '/system.handlers.list');
            
            if (!response || !response.handlers) {
                throw new Error('Invalid response from handlers.list endpoint');
            }
            
            // Process handlers into categories
            this._processHandlersIntoCategories(response.handlers);
            
            this.isLoaded = true;
            this.lastLoadTime = Date.now();
            
            console.log(`🔍 [HandlerDiscovery] Loaded ${this.availableHandlers.size} handlers across ${this.handlerCategories.size} categories`);
            
            return true;
            
        } catch (error) {
            console.error('❌ [HandlerDiscovery] Failed to load handlers:', error);
            this.isLoaded = false;
            return false;
        } finally {
            this.loadPromise = null;
        }
    }
    
    /**
     * Process handlers into organized categories
     * @param {Object} handlers - Raw handlers from backend
     */
    _processHandlersIntoCategories(handlers) {
        this.availableHandlers.clear();
        this.handlerCategories.clear();
        
        for (const [handlerName, handlerInfo] of Object.entries(handlers)) {
            // Store handler info
            this.availableHandlers.set(handlerName, handlerInfo);
            
            // Categorize by prefix
            const category = this._getHandlerCategory(handlerName);
            if (!this.handlerCategories.has(category)) {
                this.handlerCategories.set(category, []);
            }
            this.handlerCategories.get(category).push({
                name: handlerName,
                ...handlerInfo
            });
        }
    }
    
    /**
     * Determine handler category based on name prefix
     * @param {string} handlerName 
     * @returns {string} Category name
     */
    _getHandlerCategory(handlerName) {
        const prefix = handlerName.split('.')[0];
        
        const categoryMap = {
            'identity': 'Identity & AMBARADAM',
            'team': 'Team Management',
            'business': 'Business Services',
            'ai': 'AI Services',
            'google': 'Google Workspace',
            'memory': 'Memory System',
            'communication': 'Communication',
            'analytics': 'Analytics',
            'zantara': 'ZANTARA Intelligence',
            'system': 'System Introspection',
            'bali': 'Bali Zero Services',
            'kbli': 'KBLI Services',
            'oracle': 'Oracle Services',
            'slack': 'Slack Integration',
            'whatsapp': 'WhatsApp Integration',
            'instagram': 'Instagram Integration',
            'dashboard': 'Dashboard Services'
        };
        
        return categoryMap[prefix] || 'Other Services';
    }
    
    /**
     * Get detailed information about a specific handler
     * @param {string} handlerName 
     * @returns {Promise<Object>} Handler details
     */
    async getHandlerInfo(handlerName) {
        try {
            if (!this.isLoaded) {
                await this.loadHandlers();
            }
            
            // Check cache first
            if (this.availableHandlers.has(handlerName)) {
                return this.availableHandlers.get(handlerName);
            }
            
            // Fetch from backend if not cached
            const response = await window.API_CONTRACTS.call('ts', '/system.handlers.get', {
                params: { handler: handlerName }
            });
            
            return response;
            
        } catch (error) {
            console.error(`❌ [HandlerDiscovery] Failed to get handler info for ${handlerName}:`, error);
            return null;
        }
    }
    
    /**
     * Execute a handler with parameters
     * @param {string} handlerName 
     * @param {Object} params 
     * @returns {Promise<Object>} Handler execution result
     */
    async executeHandler(handlerName, params = {}) {
        try {
            console.log(`🔧 [HandlerDiscovery] Executing handler: ${handlerName}`, params);
            
            const response = await window.API_CONTRACTS.call('ts', '/system.handler.execute', {
                method: 'POST',
                body: JSON.stringify({ 
                    handler: handlerName, 
                    params: params 
                })
            });
            
            console.log(`✅ [HandlerDiscovery] Handler ${handlerName} executed successfully`);
            return response;
            
        } catch (error) {
            console.error(`❌ [HandlerDiscovery] Failed to execute handler ${handlerName}:`, error);
            throw error;
        }
    }
    
    /**
     * Get all handlers in a specific category
     * @param {string} category 
     * @returns {Array} Handlers in category
     */
    getHandlersByCategory(category) {
        if (!this.isLoaded) {
            console.warn('⚠️ [HandlerDiscovery] Handlers not loaded yet');
            return [];
        }
        
        return this.handlerCategories.get(category) || [];
    }
    
    /**
     * Get all available categories
     * @returns {Array<string>} Categories
     */
    getCategories() {
        if (!this.isLoaded) {
            return [];
        }
        
        return Array.from(this.handlerCategories.keys());
    }
    
    /**
     * Search handlers by name or description
     * @param {string} query 
     * @returns {Array} Matching handlers
     */
    searchHandlers(query) {
        if (!this.isLoaded) {
            return [];
        }
        
        const results = [];
        const searchTerm = query.toLowerCase();
        
        for (const [handlerName, handlerInfo] of this.availableHandlers) {
            if (handlerName.toLowerCase().includes(searchTerm) ||
                (handlerInfo.description && handlerInfo.description.toLowerCase().includes(searchTerm))) {
                results.push({
                    name: handlerName,
                    ...handlerInfo
                });
            }
        }
        
        return results;
    }
    
    /**
     * Get handler statistics
     * @returns {Object} Statistics
     */
    getStats() {
        if (!this.isLoaded) {
            return { total: 0, categories: 0 };
        }
        
        return {
            total: this.availableHandlers.size,
            categories: this.handlerCategories.size,
            lastLoadTime: this.lastLoadTime,
            cacheValid: (Date.now() - this.lastLoadTime) < this.cacheTimeout
        };
    }
    
    /**
     * Get high-value handlers for quick access
     * @returns {Array} High-value handlers
     */
    getHighValueHandlers() {
        const highValuePatterns = [
            'bali.zero.pricing',
            'kbli.lookup',
            'team.list',
            'team.members',
            'memory.search',
            'memory.save',
            'ai.chat',
            'business.pricing',
            'oracle.simulate',
            'zantara.personality.profile'
        ];
        
        return highValuePatterns
            .map(pattern => this.availableHandlers.get(pattern))
            .filter(Boolean);
    }
}

// Initialize global instance
window.ZANTARA_HANDLER_DISCOVERY = new ZantaraHandlerDiscovery();

// Auto-load handlers when API_CONTRACTS is available
if (window.API_CONTRACTS) {
    window.ZANTARA_HANDLER_DISCOVERY.loadHandlers();
} else {
    // Wait for API_CONTRACTS to be available
    const checkAPI = setInterval(() => {
        if (window.API_CONTRACTS) {
            clearInterval(checkAPI);
            window.ZANTARA_HANDLER_DISCOVERY.loadHandlers();
        }
    }, 100);
}

console.log('🔍 [HandlerDiscovery] Module loaded and ready');


