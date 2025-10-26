/**
 * Smart Reply Suggestions - Enhancement 14
 * Context-aware quick reply suggestions based on AI response
 * 
 * Features:
 * - Analyzes AI response to generate relevant follow-up questions
 * - 3-5 smart suggestions per message
 * - One-click to send suggested reply
 * - Context-aware based on conversation topic
 * - Learn from user selection patterns
 * 
 * @module SmartReply
 * @version 1.0.0
 */

const SmartReply = (() => {
    'use strict';

    // Suggestion templates by topic
    const SUGGESTION_PATTERNS = {
        visa: [
            "What documents do I need?",
            "How long does it take?",
            "What is the cost?",
            "Can you help me with the application?",
            "What are the requirements?"
        ],
        business: [
            "How much does it cost to setup?",
            "What is the timeline?",
            "Do you handle company registration?",
            "What are the legal requirements?",
            "Can foreigners own 100%?"
        ],
        tax: [
            "What are the tax rates?",
            "Do you provide accounting services?",
            "How to file taxes?",
            "What is the deadline?",
            "Can you help with tax compliance?"
        ],
        property: [
            "Can foreigners buy property?",
            "What is the Hak Pakai process?",
            "How much are the fees?",
            "Do you help with property purchase?",
            "What about property taxes?"
        ],
        accounting: [
            "What services do you offer?",
            "How much does it cost?",
            "Do you handle payroll?",
            "What about monthly reporting?",
            "Can you help with tax filing?"
        ],
        pricing: [
            "Do you offer package deals?",
            "What is included in the price?",
            "Are there any hidden fees?",
            "Can I get a quote?",
            "Do you have payment plans?"
        ],
        general: [
            "Tell me more",
            "What are my options?",
            "How can you help?",
            "What do you recommend?",
            "Can we schedule a call?"
        ]
    };

    let currentSuggestions = [];
    let suggestionContainer = null;
    let userSelectionHistory = new Map(); // Track user preferences

    /**
     * Initialize Smart Reply system
     */
    function init() {
        console.log('[SmartReply] Initializing...');
        createSuggestionContainer();
        attachEventListeners();
        console.log('[SmartReply] Initialized');
    }

    /**
     * Create suggestion container UI
     */
    function createSuggestionContainer() {
        // Check if already exists
        if (document.getElementById('smartReplySuggestions')) {
            return;
        }

        const container = document.createElement('div');
        container.id = 'smartReplySuggestions';
        container.className = 'smart-reply-container';
        container.style.display = 'none';

        // Insert above message input
        const chatInputArea = document.querySelector('.chat-input-area');
        if (chatInputArea) {
            chatInputArea.parentNode.insertBefore(container, chatInputArea);
            suggestionContainer = container;
        } else {
            console.warn('[SmartReply] Chat input area not found');
        }
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners() {
        // Listen for new AI messages
        window.addEventListener('zantara:messageReceived', (event) => {
            const message = event.detail;
            if (message && message.type === 'ai') {
                generateSuggestions(message.text);
            }
        });

        // Clean up on new user message
        window.addEventListener('zantara:messageSent', () => {
            hideSuggestions();
        });
    }

    /**
     * Generate smart suggestions based on AI response
     * @param {string} aiResponse - The AI response text
     */
    function generateSuggestions(aiResponse) {
        console.log('[SmartReply] Generating suggestions for response');

        // Detect topic from response
        const topic = detectTopic(aiResponse);
        console.log('[SmartReply] Detected topic:', topic);

        // Get base suggestions for topic
        let suggestions = SUGGESTION_PATTERNS[topic] || SUGGESTION_PATTERNS.general;

        // Contextual enhancement
        suggestions = enhanceSuggestionsWithContext(suggestions, aiResponse, topic);

        // Select top 3-5 based on relevance and user history
        const selectedSuggestions = selectTopSuggestions(suggestions, topic, 4);

        // Display suggestions
        displaySuggestions(selectedSuggestions);
    }

    /**
     * Detect conversation topic from AI response
     * @param {string} text - AI response text
     * @returns {string} Detected topic
     */
    function detectTopic(text) {
        const lowerText = text.toLowerCase();

        // Topic keywords
        const topicKeywords = {
            visa: ['visa', 'kitas', 'kitap', 'permit', 'immigration', 'e23', 'e28'],
            business: ['company', 'pt', 'pma', 'cv', 'registration', 'business', 'setup'],
            tax: ['tax', 'pajak', 'npwp', 'pph', 'ppn', 'tax rate', 'filing'],
            property: ['property', 'real estate', 'hak pakai', 'leasehold', 'villa', 'land'],
            accounting: ['accounting', 'bookkeeping', 'payroll', 'reporting', 'financial'],
            pricing: ['price', 'cost', 'fee', 'payment', 'idr', 'million', 'package']
        };

        // Count keyword matches
        const scores = {};
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            scores[topic] = keywords.filter(keyword => lowerText.includes(keyword)).length;
        }

        // Get highest scoring topic
        const topTopic = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
        
        return topTopic[1] > 0 ? topTopic[0] : 'general';
    }

    /**
     * Enhance suggestions with context from AI response
     * @param {Array} baseSuggestions - Base suggestion templates
     * @param {string} aiResponse - AI response text
     * @param {string} topic - Detected topic
     * @returns {Array} Enhanced suggestions
     */
    function enhanceSuggestionsWithContext(baseSuggestions, aiResponse, topic) {
        const enhanced = [...baseSuggestions];

        // Extract entities from response
        const entities = extractEntities(aiResponse);

        // Add entity-specific suggestions
        if (entities.prices.length > 0) {
            enhanced.unshift("Can you break down the costs?");
        }

        if (entities.timeframes.length > 0) {
            enhanced.unshift("Can we speed up the process?");
        }

        if (entities.documents.length > 0) {
            enhanced.unshift("Where do I submit these documents?");
        }

        // Add contextual follow-ups
        if (aiResponse.includes('options') || aiResponse.includes('choose')) {
            enhanced.unshift("What would you recommend?");
        }

        if (aiResponse.includes('depends') || aiResponse.includes('vary')) {
            enhanced.unshift("What applies to my situation?");
        }

        return enhanced;
    }

    /**
     * Extract entities from text (prices, timeframes, documents)
     * @param {string} text - Text to analyze
     * @returns {Object} Extracted entities
     */
    function extractEntities(text) {
        return {
            prices: text.match(/\d+[\d,]*\s*(idr|million|juta|m)/gi) || [],
            timeframes: text.match(/\d+[-\d]*\s*(day|week|month|year|hari|minggu|bulan|tahun)s?/gi) || [],
            documents: text.match(/(passport|ktp|npwp|certificate|deed|akta)/gi) || []
        };
    }

    /**
     * Select top suggestions based on relevance and user history
     * @param {Array} suggestions - All suggestions
     * @param {string} topic - Current topic
     * @param {number} count - Number to select
     * @returns {Array} Selected suggestions
     */
    function selectTopSuggestions(suggestions, topic, count) {
        // Score suggestions based on user history
        const scored = suggestions.map(suggestion => {
            const historyScore = userSelectionHistory.get(suggestion) || 0;
            return { text: suggestion, score: historyScore };
        });

        // Sort by score (descending)
        scored.sort((a, b) => b.score - a.score);

        // Take top N unique suggestions
        const selected = scored.slice(0, count).map(s => s.text);

        return selected;
    }

    /**
     * Display suggestions in UI
     * @param {Array} suggestions - Suggestions to display
     */
    function displaySuggestions(suggestions) {
        if (!suggestionContainer || suggestions.length === 0) {
            return;
        }

        currentSuggestions = suggestions;

        // Build HTML
        const html = `
            <div class="smart-reply-header">
                <span class="smart-reply-icon">💡</span>
                <span class="smart-reply-title">Quick Replies</span>
                <button class="smart-reply-close" onclick="SmartReply.hideSuggestions()">✕</button>
            </div>
            <div class="smart-reply-chips">
                ${suggestions.map((suggestion, index) => `
                    <button class="smart-reply-chip" onclick="SmartReply.selectSuggestion(${index})">
                        <span class="chip-text">${suggestion}</span>
                        <span class="chip-icon">→</span>
                    </button>
                `).join('')}
            </div>
        `;

        suggestionContainer.innerHTML = html;
        suggestionContainer.style.display = 'block';

        // Fade in animation
        setTimeout(() => {
            suggestionContainer.classList.add('visible');
        }, 10);

        console.log('[SmartReply] Displayed', suggestions.length, 'suggestions');
    }

    /**
     * Hide suggestions
     */
    function hideSuggestions() {
        if (suggestionContainer) {
            suggestionContainer.classList.remove('visible');
            setTimeout(() => {
                suggestionContainer.style.display = 'none';
            }, 300);
        }
    }

    /**
     * User selected a suggestion
     * @param {number} index - Index of selected suggestion
     */
    function selectSuggestion(index) {
        if (index < 0 || index >= currentSuggestions.length) {
            return;
        }

        const suggestion = currentSuggestions[index];

        // Update user selection history
        const currentCount = userSelectionHistory.get(suggestion) || 0;
        userSelectionHistory.set(suggestion, currentCount + 1);

        // Insert into message input
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.value = suggestion;
            messageInput.focus();

            // Trigger send
            const sendBtn = document.getElementById('sendBtn');
            if (sendBtn) {
                sendBtn.click();
            }

            console.log('[SmartReply] Suggestion selected:', suggestion);
        }

        hideSuggestions();
    }

    /**
     * Get user selection statistics
     * @returns {Object} Statistics
     */
    function getStats() {
        return {
            totalSelections: Array.from(userSelectionHistory.values()).reduce((a, b) => a + b, 0),
            uniqueSuggestions: userSelectionHistory.size,
            topSuggestions: Array.from(userSelectionHistory.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([text, count]) => ({ text, count }))
        };
    }

    // Public API
    return {
        init,
        generateSuggestions,
        selectSuggestion,
        hideSuggestions,
        getStats
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', SmartReply.init);
} else {
    SmartReply.init();
}

// Export for global access
window.SmartReply = SmartReply;
