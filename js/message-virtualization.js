/**
 * ZANTARA Message Virtualization - Configurable Rendering
 * Allows dynamic configuration of MAX_RENDER_MESSAGES for performance optimization
 */

class MessageVirtualization {
    constructor() {
        this.STORAGE_KEY = 'zantara_max_render_messages';
        this.DEV_MODE_KEY = 'zantara_dev_mode';

        // Defaults based on device performance characteristics
        this.defaults = {
            mobile: 20,
            tablet: 50,
            desktop: 100
        };

        this.maxMessages = this.loadPreference();
        this.isDevMode = this.checkDevMode();
        this.configElement = null;
    }

    checkDevMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const hasDevParam = urlParams.get('dev') === 'true';
        const hasDevStorage = localStorage.getItem(this.DEV_MODE_KEY) === 'true';
        const isLocalhost = window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1';
        const isGitHubPagesDev = window.location.hostname === 'balizero1987.github.io' && hasDevParam;

        return hasDevParam || hasDevStorage || isLocalhost || isGitHubPagesDev;
    }

    detectDeviceType() {
        const width = window.innerWidth;
        if (width <= 600) return 'mobile';
        if (width <= 960) return 'tablet';
        return 'desktop';
    }

    loadPreference() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved !== null) {
            const value = parseInt(saved, 10);
            if (!isNaN(value) && value >= 5 && value <= 500) {
                return value;
            }
        }

        // Smart default based on device
        const deviceType = this.detectDeviceType();
        return this.defaults[deviceType];
    }

    savePreference(value) {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue) || numValue < 5 || numValue > 500) {
            console.warn(`[ZANTARA] Invalid MAX_RENDER_MESSAGES value: ${value}. Must be 5-500.`);
            return false;
        }

        this.maxMessages = numValue;
        localStorage.setItem(this.STORAGE_KEY, numValue.toString());

        // Dispatch event for listeners
        window.dispatchEvent(new CustomEvent('zantaraVirtualizationChanged', {
            detail: {
                maxMessages: numValue,
                previousValue: this.maxMessages,
                timestamp: Date.now()
            }
        }));

        console.log(`[ZANTARA] Message virtualization set to: ${numValue}`);
        return true;
    }

    createConfigUI() {
        if (!this.isDevMode) return null;

        const container = document.createElement('div');
        container.className = 'z-virtualization-config-container';
        container.innerHTML = `
            <div class="z-virtualization-config">
                <div class="config-header">
                    <span class="config-title">⚡ Virtualization</span>
                    <span class="config-current">Max: <span class="config-value">${this.maxMessages}</span></span>
                </div>
                <input type="range"
                       id="zantara-max-messages-slider"
                       min="5"
                       max="200"
                       step="5"
                       value="${this.maxMessages}"
                       class="config-slider">
                <div class="config-presets">
                    <button class="preset-btn" data-preset="mobile" title="Mobile optimized (20)">📱</button>
                    <button class="preset-btn" data-preset="tablet" title="Tablet optimized (50)">📊</button>
                    <button class="preset-btn" data-preset="desktop" title="Desktop optimized (100)">💻</button>
                    <button class="preset-btn" data-preset="auto" title="Auto-detect device">🔄</button>
                </div>
            </div>
        `;

        this.setupEventListeners(container);
        return container;
    }

    setupEventListeners(container) {
        const slider = container.querySelector('#zantara-max-messages-slider');
        const valueDisplay = container.querySelector('.config-value');
        const presetButtons = container.querySelectorAll('[data-preset]');

        // Slider input (live preview)
        slider.addEventListener('input', (e) => {
            valueDisplay.textContent = e.target.value;
        });

        // Slider change (save preference)
        slider.addEventListener('change', (e) => {
            this.savePreference(e.target.value);
            this.showFeedback(`Messages limit: ${e.target.value}`);
        });

        // Preset buttons
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.dataset.preset;
                let value;

                if (preset === 'auto') {
                    const deviceType = this.detectDeviceType();
                    value = this.defaults[deviceType];
                    this.showFeedback(`Auto-detected: ${deviceType} (${value})`);
                } else {
                    value = this.defaults[preset];
                    this.showFeedback(`${preset} preset: ${value}`);
                }

                slider.value = value;
                valueDisplay.textContent = value;
                this.savePreference(value);

                // Visual feedback on button
                btn.style.transform = 'scale(0.95)';
                setTimeout(() => btn.style.transform = '', 150);
            });
        });
    }

    showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.className = 'virtualization-feedback';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            background: var(--z-bg-elevated, #fff);
            border: 1px solid var(--z-border-default, #e5e7eb);
            border-radius: 8px;
            padding: 8px 12px;
            z-index: 10001;
            font-size: 12px;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => feedback.remove(), 300);
        }, 2000);
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        // Always initialize core functionality
        console.log(`[ZANTARA] Message virtualization initialized: ${this.maxMessages} messages`);

        // Add dev UI if in dev mode
        if (this.isDevMode) {
            setTimeout(() => {
                const targetElement = document.querySelector('.chat-container') ||
                                    document.querySelector('.app-container') ||
                                    document.body;

                this.configElement = this.createConfigUI();
                if (this.configElement && targetElement) {
                    targetElement.appendChild(this.configElement);
                    console.log('[ZANTARA] Virtualization config UI initialized (dev mode)');
                }
            }, 200);
        }

        // Listen for window resize to auto-adjust defaults
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Only auto-adjust if user hasn't explicitly set a value
                const hasCustomValue = localStorage.getItem(this.STORAGE_KEY) !== null;
                if (!hasCustomValue) {
                    const newDefault = this.defaults[this.detectDeviceType()];
                    if (newDefault !== this.maxMessages) {
                        this.maxMessages = newDefault;
                        console.log(`[ZANTARA] Auto-adjusted virtualization to ${newDefault} for current viewport`);
                    }
                }
            }, 250);
        });
    }

    // Public API
    getMaxMessages() {
        return this.maxMessages;
    }

    setMaxMessages(value) {
        if (this.savePreference(value)) {
            // Update UI if it exists
            if (this.configElement) {
                const slider = this.configElement.querySelector('#zantara-max-messages-slider');
                const valueDisplay = this.configElement.querySelector('.config-value');
                if (slider) slider.value = value;
                if (valueDisplay) valueDisplay.textContent = value;
            }
            return true;
        }
        return false;
    }

    virtualizeMessages(messages) {
        if (!Array.isArray(messages)) {
            console.warn('[ZANTARA] virtualizeMessages expects an array');
            return { visible: [], hidden: 0, total: 0 };
        }

        if (messages.length <= this.maxMessages) {
            return {
                visible: messages,
                hidden: 0,
                total: messages.length,
                hasMore: false
            };
        }

        // Keep only the most recent messages
        const visibleMessages = messages.slice(-this.maxMessages);

        return {
            visible: visibleMessages,
            hidden: messages.length - this.maxMessages,
            total: messages.length,
            hasMore: true
        };
    }

    isDevModeActive() {
        return this.isDevMode;
    }

    getDeviceType() {
        return this.detectDeviceType();
    }

    getDefaults() {
        return { ...this.defaults };
    }

    destroy() {
        if (this.configElement && this.configElement.parentNode) {
            this.configElement.parentNode.removeChild(this.configElement);
            this.configElement = null;
        }
    }
}

// Initialize and make globally available
const zantaraMessageVirtualization = new MessageVirtualization();
zantaraMessageVirtualization.init();

// Global API
window.ZANTARA_VIRTUALIZATION = {
    instance: zantaraMessageVirtualization,
    getMaxMessages: () => zantaraMessageVirtualization.getMaxMessages(),
    setMaxMessages: (value) => zantaraMessageVirtualization.setMaxMessages(value),
    virtualizeMessages: (messages) => zantaraMessageVirtualization.virtualizeMessages(messages),
    isDevMode: () => zantaraMessageVirtualization.isDevModeActive(),
    getDeviceType: () => zantaraMessageVirtualization.getDeviceType(),
    getDefaults: () => zantaraMessageVirtualization.getDefaults()
};

// Export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MessageVirtualization;
}