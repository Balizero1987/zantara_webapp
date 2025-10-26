/**
 * ZANTARA Query Classifier
 * 
 * This module classifies user queries into different types to enable
 * intelligent routing and appropriate response handling. This solves
 * the RAG context bleeding issue by identifying queries that don't need
 * RAG processing (like greetings) and those that need direct tool execution.
 * 
 * Query Types:
 * - greeting: Simple greetings (NO RAG, NO tools)
 * - tool_execution: Direct tool/handler calls (NO RAG, direct execution)
 * - business: Business queries (RAG + tools + AI synthesis)
 * - rag_query: General queries (RAG + AI response)
 * 
 * @author ZANTARA Intelligence System
 * @version 1.0.0
 */

class ZantaraQueryClassifier {
    constructor() {
        this.classificationPatterns = this._initializePatterns();
        this.handlerMappings = this._initializeHandlerMappings();
        
        console.log('🎯 [QueryClassifier] Initialized with pattern matching');
    }
    
    /**
     * Initialize classification patterns
     * @returns {Object} Pattern definitions
     */
    _initializePatterns() {
        return {
            greeting: {
                patterns: [
                    /^(ciao|hi|hello|hey|good morning|good afternoon|good evening)$/i,
                    /^(how are you|how's it going|what's up)$/i,
                    /^(thanks|thank you|grazie)$/i,
                    /^(bye|goodbye|see you|arrivederci)$/i
                ],
                weight: 1.0
            },
            
            tool_execution: {
                patterns: [
                    // Pricing queries
                    /(price|pricing|cost|quanto costa|prezzo)/i,
                    /(kitas|visa|pt pma|company setup)/i,
                    
                    // Lookup queries
                    /(lookup|search|find|trova|cerca)/i,
                    /(kbli|business code|classification)/i,
                    
                    // Team queries
                    /(team|members|staff|colleagues)/i,
                    /(who is|chi è|show me)/i,
                    
                    // Memory queries
                    /(remember|save|recall|memorizza)/i,
                    /(history|timeline|cronologia)/i,
                    
                    // Business queries
                    /(oracle|simulate|simulation)/i,
                    /(business plan|strategy|piano)/i
                ],
                weight: 0.9
            },
            
            business: {
                patterns: [
                    /(business|company|corporate|azienda)/i,
                    /(investment|investimento|investire)/i,
                    /(indonesia|bali|jakarta)/i,
                    /(legal|law|legale|diritto)/i,
                    /(tax|tasse|fiscal|fiscale)/i,
                    /(permit|permesso|license|licenza)/i,
                    /(work|lavoro|employment|occupazione)/i,
                    /(residence|residenza|domicilio)/i
                ],
                weight: 0.8
            },
            
            rag_query: {
                patterns: [
                    /(what|how|why|when|where|chi|cosa|come|perché|quando|dove)/i,
                    /(explain|describe|tell me|spiega|descrivi|dimmi)/i,
                    /(help|aiuto|assist|assistenza)/i,
                    /(information|info|informazioni)/i
                ],
                weight: 0.7
            }
        };
    }
    
    /**
     * Initialize handler mappings for tool execution
     * @returns {Object} Handler mappings
     */
    _initializeHandlerMappings() {
        return {
            // Pricing handlers
            'bali.zero.pricing': {
                patterns: [
                    /(price|pricing|cost|quanto costa|prezzo)/i,
                    /(kitas|visa|pt pma|company setup)/i
                ],
                params: {}
            },
            
            // KBLI lookup
            'kbli.lookup': {
                patterns: [
                    /(kbli|business code|classification)/i,
                    /(lookup.*kbli|search.*kbli)/i
                ],
                params: {}
            },
            
            // Team management
            'team.list': {
                patterns: [
                    /(team.*members|show.*team|list.*team)/i,
                    /(who.*team|chi.*team)/i
                ],
                params: {}
            },
            
            'team.members': {
                patterns: [
                    /(team.*members|staff.*list)/i
                ],
                params: {}
            },
            
            // Memory system
            'memory.search': {
                patterns: [
                    /(search.*memory|find.*memory|cerca.*memoria)/i,
                    /(recall|ricorda|remember)/i
                ],
                params: {}
            },
            
            'memory.save': {
                patterns: [
                    /(save.*memory|memorizza|remember.*this)/i,
                    /(store.*information|salva)/i
                ],
                params: {}
            },
            
            // Business services
            'oracle.simulate': {
                patterns: [
                    /(simulate|simulation|oracle)/i,
                    /(business.*plan|piano.*business)/i
                ],
                params: {}
            },
            
            // AI services
            'ai.chat': {
                patterns: [
                    /(chat|conversation|talk)/i
                ],
                params: {}
            }
        };
    }
    
    /**
     * Classify a user query
     * @param {string} message - User message
     * @returns {Object} Classification result
     */
    classifyQuery(message) {
        const msg = message.trim();
        
        if (!msg) {
            return {
                type: 'empty',
                confidence: 0,
                handler: null,
                params: {}
            };
        }
        
        // Calculate scores for each classification type
        const scores = {};
        
        for (const [type, config] of Object.entries(this.classificationPatterns)) {
            scores[type] = this._calculateScore(msg, config);
        }
        
        // Find the best classification
        const bestType = Object.keys(scores).reduce((a, b) => 
            scores[a] > scores[b] ? a : b
        );
        
        const confidence = scores[bestType];
        
        // Get handler mapping if it's a tool execution
        let handler = null;
        let params = {};
        
        if (bestType === 'tool_execution') {
            const mapping = this._getHandlerMapping(msg);
            if (mapping) {
                handler = mapping.handler;
                params = mapping.params;
            }
        }
        
        const result = {
            type: bestType,
            confidence: confidence,
            handler: handler,
            params: params,
            scores: scores
        };
        
        console.log(`🎯 [QueryClassifier] "${msg}" → ${bestType} (${confidence.toFixed(2)})`, result);
        
        return result;
    }
    
    /**
     * Calculate classification score for a message
     * @param {string} message 
     * @param {Object} config 
     * @returns {number} Score
     */
    _calculateScore(message, config) {
        let score = 0;
        const patterns = config.patterns;
        const weight = config.weight || 1.0;
        
        for (const pattern of patterns) {
            if (pattern.test(message)) {
                score += weight;
            }
        }
        
        return Math.min(score, 1.0); // Cap at 1.0
    }
    
    /**
     * Get handler mapping for tool execution
     * @param {string} message 
     * @returns {Object|null} Handler mapping
     */
    _getHandlerMapping(message) {
        for (const [handlerName, mapping] of Object.entries(this.handlerMappings)) {
            for (const pattern of mapping.patterns) {
                if (pattern.test(message)) {
                    return {
                        handler: handlerName,
                        params: mapping.params
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * Check if query is a greeting (no RAG needed)
     * @param {string} message 
     * @returns {boolean}
     */
    isGreeting(message) {
        const classification = this.classifyQuery(message);
        return classification.type === 'greeting' && classification.confidence > 0.5;
    }
    
    /**
     * Check if query needs tool execution
     * @param {string} message 
     * @returns {boolean}
     */
    needsToolExecution(message) {
        const classification = this.classifyQuery(message);
        return classification.type === 'tool_execution' && classification.confidence > 0.5;
    }
    
    /**
     * Check if query is business-related
     * @param {string} message 
     * @returns {boolean}
     */
    isBusinessQuery(message) {
        const classification = this.classifyQuery(message);
        return classification.type === 'business' && classification.confidence > 0.5;
    }
    
    /**
     * Get suggested handler for a query
     * @param {string} message 
     * @returns {Object|null} Suggested handler
     */
    getSuggestedHandler(message) {
        const classification = this.classifyQuery(message);
        
        if (classification.type === 'tool_execution' && classification.handler) {
            return {
                handler: classification.handler,
                params: classification.params,
                confidence: classification.confidence
            };
        }
        
        return null;
    }
    
    /**
     * Get classification statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            totalPatterns: Object.values(this.classificationPatterns)
                .reduce((sum, config) => sum + config.patterns.length, 0),
            totalHandlers: Object.keys(this.handlerMappings).length,
            categories: Object.keys(this.classificationPatterns).length
        };
    }
}

// Initialize global instance
window.ZANTARA_QUERY_CLASSIFIER = new ZantaraQueryClassifier();

console.log('🎯 [QueryClassifier] Module loaded and ready');


