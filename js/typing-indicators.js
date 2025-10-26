/**
 * Typing Indicators Module
 * Show "AI is typing..." animated indicator during response generation
 */

class TypingIndicators {
    constructor() {
        this.typingIndicator = null;
        this.init();
    }

    init() {
        this.createTypingIndicator();
        this.attachToSendMessage();
    }

    createTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="typing-indicator-content">
                <div class="typing-avatar">🤖</div>
                <div class="typing-text">
                    <span>ZANTARA is typing</span>
                    <div class="typing-dots">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                    </div>
                </div>
            </div>
        `;
        this.typingIndicator = indicator;
    }

    show() {
        if (!this.typingIndicator) return;

        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            // Remove if already exists
            const existing = document.getElementById('typingIndicator');
            if (existing) existing.remove();

            // Add to chat
            chatMessages.appendChild(this.typingIndicator);
            
            // Scroll to bottom
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 100);

            console.log('[TypingIndicator] Shown');
        }
    }

    hide() {
        if (this.typingIndicator && this.typingIndicator.parentNode) {
            this.typingIndicator.remove();
            console.log('[TypingIndicator] Hidden');
        }
    }

    attachToSendMessage() {
        // Intercept sendMessage function
        if (window.sendMessage) {
            const originalSendMessage = window.sendMessage;
            
            window.sendMessage = async function(...args) {
                // Show typing indicator
                if (window.typingIndicators) {
                    window.typingIndicators.show();
                }

                try {
                    // Call original function
                    const result = await originalSendMessage.apply(this, args);
                    return result;
                } finally {
                    // Hide typing indicator after response
                    setTimeout(() => {
                        if (window.typingIndicators) {
                            window.typingIndicators.hide();
                        }
                    }, 500);
                }
            };

            console.log('[TypingIndicator] Attached to sendMessage');
        }

        // Also listen to custom events
        document.addEventListener('ai-response-start', () => {
            this.show();
        });

        document.addEventListener('ai-response-complete', () => {
            this.hide();
        });

        document.addEventListener('ai-response-error', () => {
            this.hide();
        });
    }
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.typingIndicators = new TypingIndicators();
    });
} else {
    window.typingIndicators = new TypingIndicators();
}
