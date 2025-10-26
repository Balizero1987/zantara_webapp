/**
 * Clarification Prompts Module - Feature 7
 * Detects ambiguous queries and displays interactive clarification options
 */

const ClarificationPrompts = (() => {
  // Ambiguity detection patterns (client-side, mirrors backend logic)
  const VAGUE_PATTERNS = ['tell me about', 'what about', 'how about', 'info on', 'explain', 'describe'];
  const VAGUE_TRIGGERS = ['visa', 'tax', 'business', 'company', 'permit', 'service', 'it', 'this', 'that'];
  const INCOMPLETE_PATTERNS = ['how much', 'how long', 'when can', 'where is', 'who can'];
  const PRONOUNS = ['it', 'this', 'that', 'these', 'those', 'they', 'them'];

  /**
   * Detect if a query is ambiguous
   * @param {string} query - User's query
   * @param {boolean} hasConversationHistory - Whether there's prior conversation
   * @returns {object} Ambiguity detection result
   */
  function detectAmbiguity(query, hasConversationHistory = false) {
    const queryLower = query.toLowerCase().trim();
    const words = query.split(/\s+/);
    let confidence = 0.0;
    let ambiguityType = 'none';
    const reasons = [];

    // 1. VAGUE QUESTIONS
    for (const pattern of VAGUE_PATTERNS) {
      if (queryLower.includes(pattern)) {
        for (const trigger of VAGUE_TRIGGERS) {
          if (queryLower.includes(trigger)) {
            confidence += 0.3;
            reasons.push(`Vague question: '${pattern} ${trigger}' without specifics`);
            ambiguityType = 'vague';
            break;
          }
        }
      }
    }

    // 2. INCOMPLETE QUESTIONS
    for (const pattern of INCOMPLETE_PATTERNS) {
      if (queryLower.startsWith(pattern) && words.length <= 4) {
        confidence += 0.4;
        reasons.push(`Incomplete question: starts with '${pattern}' but lacks context`);
        ambiguityType = 'incomplete';
      }
    }

    // 3. PRONOUN WITHOUT ANTECEDENT
    if (!hasConversationHistory) {
      for (const pronoun of PRONOUNS) {
        if (queryLower.startsWith(pronoun + ' ') || queryLower.includes(` ${pronoun} `)) {
          confidence += 0.5;
          reasons.push(`Pronoun '${pronoun}' used without prior context`);
          ambiguityType = 'unclear_context';
        }
      }
    }

    // 4. MULTIPLE INTERPRETATIONS
    const multiKeywords = {
      'work': ['work visa', 'work permit', 'job', 'employment'],
      'cost': ['registration cost', 'service cost', 'government fee', 'annual cost'],
      'register': ['company registration', 'tax registration', 'visa registration'],
      'open': ['open company', 'open bank account', 'open office']
    };

    for (const [keyword, interpretations] of Object.entries(multiKeywords)) {
      if (queryLower.includes(keyword) && words.length <= 5) {
        confidence += 0.3;
        reasons.push(`Keyword '${keyword}' has multiple interpretations`);
        ambiguityType = 'multiple';
      }
    }

    // 5. TOO SHORT
    const greetings = ['hi', 'hello', 'ciao', 'halo'];
    if (words.length < 3 && !greetings.some(g => queryLower.includes(g))) {
      confidence += 0.2;
      reasons.push(`Very short query (${words.length} words) - may need more detail`);
    }

    const isAmbiguous = confidence >= 0.6;
    const clarificationNeeded = isAmbiguous && ambiguityType !== 'none';

    return {
      isAmbiguous,
      confidence: Math.min(confidence, 1.0),
      ambiguityType,
      reasons,
      clarificationNeeded
    };
  }

  /**
   * Generate clarification options based on query topic
   * @param {string} query - User's query
   * @returns {array} Array of clarification button options
   */
  function generateClarificationOptions(query) {
    const queryLower = query.toLowerCase();
    
    // Visa-related
    if (queryLower.includes('visa') || queryLower.includes('permit') || queryLower.includes('visto')) {
      return [
        { text: '🏖️ Tourist Visa', query: 'Tell me about tourist visa requirements for Indonesia' },
        { text: '💼 Business Visa (KITAS)', query: 'What are the requirements for KITAS business visa?' },
        { text: '💪 Work Permit', query: 'How do I get a work permit for Indonesia?' },
        { text: '🔄 Visa Extension', query: 'How can I extend my visa in Indonesia?' }
      ];
    }

    // Tax-related
    if (queryLower.includes('tax') || queryLower.includes('pajak') || queryLower.includes('npwp')) {
      return [
        { text: '🏢 Corporate Tax', query: 'Tell me about corporate tax requirements in Indonesia' },
        { text: '👤 Personal Income Tax', query: 'How does personal income tax work in Indonesia?' },
        { text: '📊 VAT/PPN', query: 'Explain VAT (PPN) in Indonesia' },
        { text: '📝 NPWP Registration', query: 'How do I register for NPWP tax number?' }
      ];
    }

    // Business/Company related
    if (queryLower.includes('business') || queryLower.includes('company') || queryLower.includes('pt pma')) {
      return [
        { text: '🚀 Start New Company', query: 'How do I start a new company in Indonesia?' },
        { text: '🏛️ PT PMA Registration', query: 'What are the requirements for PT PMA company?' },
        { text: '📜 Business Licenses', query: 'What business licenses do I need in Indonesia?' },
        { text: '💰 Capital Requirements', query: 'What are the capital requirements for PT PMA?' }
      ];
    }

    // Cost-related
    if (queryLower.includes('cost') || queryLower.includes('price') || queryLower.includes('fee') || queryLower.includes('biaya')) {
      return [
        { text: '🏢 Company Setup Cost', query: 'How much does it cost to set up a PT PMA company?' },
        { text: '💼 KITAS Cost', query: 'What is the cost of KITAS business visa?' },
        { text: '📊 Accounting Services', query: 'How much do accounting services cost per month?' },
        { text: '📝 NPWP Registration', query: 'What is the cost for NPWP tax registration?' }
      ];
    }

    // Work-related
    if (queryLower.includes('work') && queryLower.split(/\s+/).length <= 3) {
      return [
        { text: '💼 Work Visa', query: 'What is required for a work visa in Indonesia?' },
        { text: '📄 Work Permit', query: 'How do I get a work permit (IMTA)?' },
        { text: '👔 Employment Contract', query: 'What should be in my employment contract?' },
        { text: '🏢 Working in PT PMA', query: 'Can foreigners work in PT PMA companies?' }
      ];
    }

    // Generic options for unclear queries
    return [
      { text: '🏢 Company Setup', query: 'I want to set up a PT PMA company in Bali' },
      { text: '💼 KITAS Visa', query: 'How do I get a KITAS business visa?' },
      { text: '📊 Tax Services', query: 'Tell me about tax services for businesses in Indonesia' },
      { text: '💬 Speak to Expert', query: 'I need to speak with a Bali Zero expert about my situation' }
    ];
  }

  /**
   * Render clarification prompt UI in chat
   * @param {string} query - User's ambiguous query
   * @param {object} ambiguityInfo - Result from detectAmbiguity()
   * @param {HTMLElement} messageContainer - Container to render in
   */
  function renderClarificationPrompt(query, ambiguityInfo, messageContainer) {
    const options = generateClarificationOptions(query);

    // Create clarification container
    const clarificationDiv = document.createElement('div');
    clarificationDiv.className = 'clarification-prompt';
    
    // Header message
    const headerText = getClarificationMessage(ambiguityInfo.ambiguityType);
    
    clarificationDiv.innerHTML = `
      <div class="clarification-header">
        <span class="clarification-icon">🤔</span>
        <span class="clarification-text">${headerText}</span>
      </div>
      <div class="clarification-options" id="clarificationOptions-${Date.now()}">
        ${options.map((opt, idx) => `
          <button 
            class="clarification-button" 
            data-query="${escapeHtml(opt.query)}"
            data-index="${idx}"
          >
            ${opt.text}
          </button>
        `).join('')}
      </div>
      <div class="clarification-footer">
        Or continue typing to provide more details...
      </div>
    `;

    // Add event listeners to buttons
    clarificationDiv.querySelectorAll('.clarification-button').forEach(btn => {
      btn.addEventListener('click', function() {
        const selectedQuery = this.getAttribute('data-query');
        handleClarificationSelection(selectedQuery, clarificationDiv);
      });
    });

    messageContainer.appendChild(clarificationDiv);
    
    console.log('[ClarificationPrompts] Rendered:', {
      type: ambiguityInfo.ambiguityType,
      confidence: ambiguityInfo.confidence,
      options: options.length
    });
  }

  /**
   * Get clarification message based on ambiguity type
   * @param {string} ambiguityType - Type of ambiguity detected
   * @returns {string} Clarification message
   */
  function getClarificationMessage(ambiguityType) {
    const messages = {
      'vague': 'Per aiutarti meglio, potresti specificare cosa ti interessa esattamente?',
      'incomplete': 'Ho bisogno di qualche informazione in più per darti la risposta giusta.',
      'multiple': 'Ci sono diverse interpretazioni possibili. Quale di queste ti interessa?',
      'unclear_context': 'Vorrei aiutarti! Potresti darmi un po\' più di contesto?'
    };

    return messages[ambiguityType] || messages.vague;
  }

  /**
   * Handle clarification option selection
   * @param {string} selectedQuery - The clarified query selected
   * @param {HTMLElement} clarificationDiv - The clarification UI element to remove
   */
  function handleClarificationSelection(selectedQuery, clarificationDiv) {
    console.log('[ClarificationPrompts] Selected:', selectedQuery);

    // Remove clarification UI with fade animation
    clarificationDiv.style.opacity = '0';
    clarificationDiv.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      clarificationDiv.remove();
    }, 300);

    // Insert selected query into chat input and trigger send
    const chatInput = document.getElementById('userInput');
    if (chatInput) {
      chatInput.value = selectedQuery;
      
      // Trigger send function if available
      if (window.sendMessage) {
        window.sendMessage();
      } else {
        // Fallback: dispatch enter key event
        const event = new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true
        });
        chatInput.dispatchEvent(event);
      }
    }
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Check if clarification should be shown for this query
   * @param {string} query - User's query
   * @param {boolean} hasConversationHistory - Whether there's conversation history
   * @returns {boolean} True if clarification should be shown
   */
  function shouldShowClarification(query, hasConversationHistory = false) {
    if (!query || query.trim().length === 0) {
      return false;
    }

    const ambiguityInfo = detectAmbiguity(query, hasConversationHistory);
    
    // Show if high confidence ambiguity detected
    return ambiguityInfo.clarificationNeeded && ambiguityInfo.confidence >= 0.7;
  }

  /**
   * Initialize clarification prompts integration
   */
  function init() {
    console.log('[ClarificationPrompts] Initialized');
    
    // Hook into chat input to detect ambiguity before sending
    const chatInput = document.getElementById('userInput');
    if (chatInput) {
      // Add subtle indicator for ambiguous queries while typing
      let typingTimeout;
      chatInput.addEventListener('input', function() {
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
          const query = this.value.trim();
          if (query.length > 3) {
            const ambiguity = detectAmbiguity(query, false);
            if (ambiguity.isAmbiguous) {
              // Add subtle visual hint (optional)
              chatInput.style.borderColor = '#f59e0b';
            } else {
              chatInput.style.borderColor = '';
            }
          }
        }, 500);
      });
    }
  }

  // Public API
  return {
    init,
    detectAmbiguity,
    generateClarificationOptions,
    renderClarificationPrompt,
    shouldShowClarification
  };
})();

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ClarificationPrompts.init());
} else {
  ClarificationPrompts.init();
}

// Export to window for global access
window.ClarificationPrompts = ClarificationPrompts;
