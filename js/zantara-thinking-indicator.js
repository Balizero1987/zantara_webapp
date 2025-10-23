/**
 * ZANTARA Thinking Indicator - Elegant Loading Animation
 * ChatGPT/Claude-style loading with progressive status messages
 *
 * Features:
 * - Smooth dot animation (like ChatGPT)
 * - Progressive status messages in IT/EN/ID
 * - Elegant italic styling
 * - Auto-rotation of messages
 */

class ZantaraThinkingIndicator {
  constructor(container) {
    this.container = container;
    this.intervalId = null;
    this.messageIndex = 0;
    this.dotCount = 0;

    // Progressive thinking messages (multilingual)
    this.messages = [
      {
        it: "Sto pensando",
        en: "Thinking",
        id: "Sedang berpikir"
      },
      {
        it: "Consultando la memoria culturale",
        en: "Consulting cultural memory",
        id: "Mengakses memori budaya"
      },
      {
        it: "Analizzando la tua domanda",
        en: "Analyzing your question",
        id: "Menganalisis pertanyaan Anda"
      },
      {
        it: "Preparando la risposta",
        en: "Preparing the response",
        id: "Menyiapkan jawaban"
      },
      {
        it: "Formulando la risposta perfetta",
        en: "Crafting the perfect answer",
        id: "Merumuskan jawaban terbaik"
      }
    ];

    // Detect language from previous messages or default to Italian
    this.language = this.detectLanguage();
  }

  /**
   * Detect language from conversation history
   */
  detectLanguage() {
    // Check if there's a language preference in localStorage
    const storedLang = localStorage.getItem('zantara-preferred-language');
    if (storedLang && ['it', 'en', 'id'].includes(storedLang)) {
      return storedLang;
    }

    // Default: Italian (ZERO's language)
    return 'it';
  }

  /**
   * Start the elegant thinking animation
   */
  start() {
    if (this.intervalId) {
      this.stop(); // Clear any existing animation
    }

    // Create the thinking indicator element
    this.createIndicator();

    // Start animation: dots cycle every 400ms, message rotation every 3s
    this.intervalId = setInterval(() => {
      this.updateDots();
    }, 400);

    // Rotate messages every 3 seconds
    this.messageRotationId = setInterval(() => {
      this.rotateMessage();
    }, 3000);
  }

  /**
   * Create the thinking indicator DOM element
   */
  createIndicator() {
    // Clear container
    this.container.innerHTML = '';
    this.container.className = 'ai-message thinking-indicator';

    // Create animated container
    const wrapper = document.createElement('div');
    wrapper.className = 'thinking-wrapper';
    wrapper.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-style: italic;
      color: #8b9dc3;
      opacity: 0;
      animation: fadeIn 0.3s ease-in forwards;
    `;

    // Animated dots (ChatGPT style)
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'thinking-dots';
    dotsContainer.style.cssText = `
      display: flex;
      gap: 4px;
      align-items: center;
    `;

    for (let i = 0; i < 3; i++) {
      const dot = document.createElement('div');
      dot.className = `thinking-dot dot-${i}`;
      dot.style.cssText = `
        width: 8px;
        height: 8px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        opacity: 0.4;
        animation: pulse-dot 1.4s ease-in-out infinite;
        animation-delay: ${i * 0.2}s;
      `;
      dotsContainer.appendChild(dot);
    }

    // Status text
    const textElement = document.createElement('span');
    textElement.className = 'thinking-text';
    textElement.textContent = this.getCurrentMessage();
    textElement.style.cssText = `
      font-size: 14px;
      font-weight: 400;
    `;

    wrapper.appendChild(dotsContainer);
    wrapper.appendChild(textElement);
    this.container.appendChild(wrapper);

    // Add CSS animations if not already present
    this.injectStyles();
  }

  /**
   * Get current thinking message in selected language
   */
  getCurrentMessage() {
    const currentMsg = this.messages[this.messageIndex];
    return currentMsg[this.language];
  }

  /**
   * Update dots animation (cycle through dot counts)
   */
  updateDots() {
    const textElement = this.container.querySelector('.thinking-text');
    if (!textElement) return;

    // No need to update dots separately - CSS animation handles it
    // Just ensure text is current
    textElement.textContent = this.getCurrentMessage();
  }

  /**
   * Rotate to next thinking message
   */
  rotateMessage() {
    this.messageIndex = (this.messageIndex + 1) % this.messages.length;
    const textElement = this.container.querySelector('.thinking-text');
    if (textElement) {
      // Smooth fade transition
      textElement.style.opacity = '0';
      setTimeout(() => {
        textElement.textContent = this.getCurrentMessage();
        textElement.style.opacity = '1';
        textElement.style.transition = 'opacity 0.3s ease';
      }, 150);
    }
  }

  /**
   * Stop the thinking animation
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.messageRotationId) {
      clearInterval(this.messageRotationId);
      this.messageRotationId = null;
    }
    this.messageIndex = 0;
    this.dotCount = 0;
  }

  /**
   * Inject CSS animations (only once)
   */
  injectStyles() {
    if (document.getElementById('zantara-thinking-styles')) {
      return; // Already injected
    }

    const style = document.createElement('style');
    style.id = 'zantara-thinking-styles';
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @keyframes pulse-dot {
        0%, 100% {
          opacity: 0.4;
          transform: scale(1);
        }
        50% {
          opacity: 1;
          transform: scale(1.2);
        }
      }

      .thinking-indicator {
        background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
        border-left: 3px solid #667eea;
        padding: 16px 20px;
        border-radius: 12px;
        margin: 8px 0;
      }

      .thinking-wrapper {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .thinking-text {
        transition: opacity 0.3s ease;
      }
    `;

    document.head.appendChild(style);
  }
}

// Export for use in chat.html
if (typeof window !== 'undefined') {
  window.ZantaraThinkingIndicator = ZantaraThinkingIndicator;
  console.log('[ZANTARA] Thinking Indicator ready');
}
