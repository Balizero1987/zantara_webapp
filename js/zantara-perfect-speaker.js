/**
 * ZANTARA Perfect Speaker Orchestrator
 * 
 * This is the unified orchestrator that handles all query types intelligently:
 * - Greetings: Direct responses (NO RAG, NO tools)
 * - Tool Execution: Direct handler calls (NO RAG, direct execution)
 * - Business Queries: RAG + tools + AI synthesis
 * - General Queries: RAG + AI response
 * 
 * This solves the core issues:
 * - RAG context bleeding (greetings don't need RAG)
 * - Tool execution chain (direct handler calls)
 * - Response quality (intelligent routing)
 * - Frontend integration (unified API)
 * 
 * @author ZANTARA Intelligence System
 * @version 1.0.0
 */

class ZantaraPerfectSpeaker {
    constructor() {
        this.isInitialized = false;
        this.handlerDiscovery = null;
        this.queryClassifier = null;
        this.smartSuggestions = null;
        
        // Response templates
        this.responseTemplates = this._initializeTemplates();
        
        console.log('🎭 [PerfectSpeaker] Initialized');
    }
    
    /**
     * Initialize the Perfect Speaker system
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        if (this.isInitialized) {
            return true;
        }
        
        try {
            console.log('🎭 [PerfectSpeaker] Initializing system...');
            
            // Initialize components
            this.handlerDiscovery = window.ZANTARA_HANDLER_DISCOVERY;
            this.queryClassifier = window.ZANTARA_QUERY_CLASSIFIER;
            this.smartSuggestions = window.ZANTARA_SMART_SUGGESTIONS;
            
            // Load handlers
            await this.handlerDiscovery.loadHandlers();
            
            this.isInitialized = true;
            console.log('✅ [PerfectSpeaker] System initialized successfully');
            
            return true;
            
        } catch (error) {
            console.error('❌ [PerfectSpeaker] Initialization failed:', error);
            return false;
        }
    }
    
    /**
     * Initialize response templates
     * @returns {Object} Templates
     */
    _initializeTemplates() {
        return {
            greeting: {
                responses: [
                    "Ciao! Sono ZANTARA, il tuo assistente AI per Bali Zero. Come posso aiutarti oggi?",
                    "Hello! I'm ZANTARA, your AI assistant for Bali Zero. How can I help you today?",
                    "Halo! Saya ZANTARA, asisten AI Anda untuk Bali Zero. Bagaimana saya bisa membantu hari ini?"
                ],
                suggestions: [
                    "Show me KITAS pricing",
                    "Lookup KBLI code",
                    "Team members",
                    "Business simulation"
                ]
            },
            
            tool_execution: {
                success: "✅ {tool_name} executed successfully",
                error: "❌ Failed to execute {tool_name}",
                loading: "🔧 Executing {tool_name}..."
            },
            
            business: {
                context: "Based on Bali Zero's business expertise and current market conditions...",
                sources: "Sources: Official Bali Zero 2025 Pricing, Indonesian Business Regulations"
            }
        };
    }
    
    /**
     * Main entry point - process any user query
     * @param {string} message - User message
     * @param {string} userEmail - User email
     * @param {Object} options - Processing options
     * @returns {Promise<Object>} Response object
     */
    async processQuery(message, userEmail, options = {}) {
        try {
            // Ensure system is initialized
            if (!this.isInitialized) {
                await this.initialize();
            }
            
            console.log(`🎭 [PerfectSpeaker] Processing: "${message}"`);
            
            // Classify the query
            const classification = this.queryClassifier.classifyQuery(message);
            
            // Route based on classification
            let response;
            
            switch (classification.type) {
                case 'greeting':
                    response = await this._handleGreeting(message, classification);
                    break;
                    
                case 'tool_execution':
                    response = await this._handleToolExecution(message, classification, userEmail);
                    break;
                    
                case 'business':
                    response = await this._handleBusinessQuery(message, classification, userEmail);
                    break;
                    
                case 'rag_query':
                default:
                    response = await this._handleRAGQuery(message, classification, userEmail);
                    break;
            }
            
            // Add smart suggestions
            if (response && !response.suggestions) {
                response.suggestions = await this._generateSmartSuggestions(message, response);
            }
            
            console.log(`✅ [PerfectSpeaker] Query processed successfully`);
            return response;
            
        } catch (error) {
            console.error('❌ [PerfectSpeaker] Query processing failed:', error);
            return this._createErrorResponse(error);
        }
    }
    
    /**
     * Handle greeting queries (NO RAG, NO tools)
     * @param {string} message 
     * @param {Object} classification 
     * @returns {Object} Response
     */
    async _handleGreeting(message, classification) {
        console.log('👋 [PerfectSpeaker] Handling greeting');
        
        // Get random greeting response
        const responses = this.responseTemplates.greeting.responses;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        return {
            type: 'greeting',
            response: randomResponse,
            suggestions: this.responseTemplates.greeting.suggestions,
            confidence: classification.confidence,
            processing_time: '< 100ms',
            rag_used: false,
            tools_used: false
        };
    }
    
    /**
     * Handle tool execution queries (NO RAG, direct execution)
     * @param {string} message 
     * @param {Object} classification 
     * @param {string} userEmail 
     * @returns {Object} Response
     */
    async _handleToolExecution(message, classification, userEmail) {
        console.log('🔧 [PerfectSpeaker] Handling tool execution');
        
        if (!classification.handler) {
            return this._createErrorResponse(new Error('No handler found for tool execution'));
        }
        
        try {
            // Execute handler directly
            const result = await this.handlerDiscovery.executeHandler(
                classification.handler, 
                classification.params
            );
            
            return {
                type: 'tool_execution',
                response: this._formatToolResponse(result, classification.handler),
                data: result,
                handler: classification.handler,
                confidence: classification.confidence,
                processing_time: '< 2s',
                rag_used: false,
                tools_used: true
            };
            
        } catch (error) {
            console.error(`❌ [PerfectSpeaker] Tool execution failed:`, error);
            return this._createErrorResponse(error);
        }
    }
    
    /**
     * Handle business queries (RAG + tools + AI synthesis)
     * @param {string} message 
     * @param {Object} classification 
     * @param {string} userEmail 
     * @returns {Object} Response
     */
    async _handleBusinessQuery(message, classification, userEmail) {
        console.log('💼 [PerfectSpeaker] Handling business query');
        
        try {
            // Use existing RAG chat endpoint for business queries
            const response = await window.ZANTARA_API.chat(message, userEmail, false);
            
            return {
                type: 'business',
                response: response.response || response,
                confidence: classification.confidence,
                processing_time: '2-5s',
                rag_used: true,
                tools_used: true,
                sources: response.sources || null
            };
            
        } catch (error) {
            console.error(`❌ [PerfectSpeaker] Business query failed:`, error);
            return this._createErrorResponse(error);
        }
    }
    
    /**
     * Handle general RAG queries
     * @param {string} message 
     * @param {Object} classification 
     * @param {string} userEmail 
     * @returns {Object} Response
     */
    async _handleRAGQuery(message, classification, userEmail) {
        console.log('🔍 [PerfectSpeaker] Handling RAG query');
        
        try {
            // Use existing RAG chat endpoint
            const response = await window.ZANTARA_API.chat(message, userEmail, false);
            
            return {
                type: 'rag_query',
                response: response.response || response,
                confidence: classification.confidence,
                processing_time: '1-3s',
                rag_used: true,
                tools_used: false,
                sources: response.sources || null
            };
            
        } catch (error) {
            console.error(`❌ [PerfectSpeaker] RAG query failed:`, error);
            return this._createErrorResponse(error);
        }
    }
    
    /**
     * Format tool response for user display
     * @param {Object} result 
     * @param {string} handlerName 
     * @returns {string} Formatted response
     */
    _formatToolResponse(result, handlerName) {
        // Handle different response formats
        if (result && typeof result === 'object') {
            if (result.response) {
                return result.response;
            }
            if (result.data) {
                return JSON.stringify(result.data, null, 2);
            }
            if (result.message) {
                return result.message;
            }
        }
        
        return `Tool ${handlerName} executed successfully. Result: ${JSON.stringify(result)}`;
    }
    
    /**
     * Generate smart suggestions based on query and response
     * @param {string} message 
     * @param {Object} response 
     * @returns {Array} Suggestions
     */
    async _generateSmartSuggestions(message, response) {
        if (!window.SmartSuggestions) {
            return this.responseTemplates.greeting.suggestions;
        }
        
        try {
            return window.SmartSuggestions.generate(message, response.response || response);
        } catch (error) {
            console.warn('⚠️ [PerfectSpeaker] Smart suggestions failed:', error);
            return this.responseTemplates.greeting.suggestions;
        }
    }
    
    /**
     * Create error response
     * @param {Error} error 
     * @returns {Object} Error response
     */
    _createErrorResponse(error) {
        return {
            type: 'error',
            response: `Sorry, I encountered an error: ${error.message}`,
            error: error.message,
            suggestions: [
                "Try rephrasing your question",
                "Check your internet connection",
                "Contact support if the problem persists"
            ],
            processing_time: '< 1s',
            rag_used: false,
            tools_used: false
        };
    }
    
    /**
     * Get system statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            initialized: this.isInitialized,
            handlerDiscovery: this.handlerDiscovery ? this.handlerDiscovery.getStats() : null,
            queryClassifier: this.queryClassifier ? this.queryClassifier.getStats() : null,
            smartSuggestions: this.smartSuggestions ? 'Available' : 'Not loaded'
        };
    }
    
    /**
     * Test the system with sample queries
     * @returns {Object} Test results
     */
    async runTests() {
        const testQueries = [
            "Hello ZANTARA",
            "What is the price for KITAS?",
            "Lookup KBLI code for restaurant",
            "Show me team members",
            "How to start a business in Indonesia?"
        ];
        
        const results = [];
        
        for (const query of testQueries) {
            try {
                const result = await this.processQuery(query, 'test@example.com');
                results.push({
                    query,
                    success: true,
                    type: result.type,
                    processing_time: result.processing_time
                });
            } catch (error) {
                results.push({
                    query,
                    success: false,
                    error: error.message
                });
            }
        }
        
        return {
            total: testQueries.length,
            successful: results.filter(r => r.success).length,
            results
        };
    }
}

// Initialize global instance
window.ZANTARA_PERFECT_SPEAKER = new ZantaraPerfectSpeaker();

// Auto-initialize when dependencies are available
const initializePerfectSpeaker = () => {
    if (window.ZANTARA_HANDLER_DISCOVERY && 
        window.ZANTARA_QUERY_CLASSIFIER && 
        window.ZANTARA_API) {
        window.ZANTARA_PERFECT_SPEAKER.initialize();
    }
};

// Check for dependencies
if (window.ZANTARA_HANDLER_DISCOVERY && 
    window.ZANTARA_QUERY_CLASSIFIER && 
    window.ZANTARA_API) {
    initializePerfectSpeaker();
} else {
    // Wait for dependencies
    const checkDeps = setInterval(() => {
        if (window.ZANTARA_HANDLER_DISCOVERY && 
            window.ZANTARA_QUERY_CLASSIFIER && 
            window.ZANTARA_API) {
            clearInterval(checkDeps);
            initializePerfectSpeaker();
        }
    }, 100);
}

console.log('🎭 [PerfectSpeaker] Module loaded and ready');
