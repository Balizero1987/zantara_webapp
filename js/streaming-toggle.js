/**
 * ZANTARA Streaming Toggle - Dev Mode Only
 * Provides UI toggle for enabling/disabling adaptive streaming
 */

import DOMPurify from 'dompurify';

class StreamingToggle {
    constructor() {
        this.STORAGE_KEY = 'zantara_streaming_enabled';
        this.DEV_MODE_KEY = 'zantara_dev_mode';
        this.isEnabled = this.loadPreference();
        this.isDevMode = this.checkDevMode();
        this.toggleElement = null;
    }

    checkDevMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const hasDevParam = urlParams.get('dev') === 'true';
        const hasDevStorage = localStorage.getItem(this.DEV_MODE_KEY) === 'true';
        const isLocalhost = window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1';

        // GitHub Pages dev mode
        const isGitHubPagesDev = window.location.hostname === 'balizero1987.github.io' && hasDevParam;

        const devMode = hasDevParam || hasDevStorage || isLocalhost || isGitHubPagesDev;

        if (hasDevParam) {
            localStorage.setItem(this.DEV_MODE_KEY, 'true');
        }

        return devMode;
    }

    loadPreference() {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved !== null ? saved === 'true' : true; // Default: streaming ON
    }

    savePreference(value) {
        this.isEnabled = value;
        localStorage.setItem(this.STORAGE_KEY, value.toString());

        // Dispatch event for other components to listen
        window.dispatchEvent(new CustomEvent('zantaraStreamingToggled', {
            detail: {
                enabled: value,
                timestamp: Date.now()
            }
        }));

        console.log(`[ZANTARA] Streaming ${value ? 'enabled' : 'disabled'}`);
    }

    createToggleElement() {
        if (!this.isDevMode) return null;

        const container = document.createElement('div');
        container.className = 'z-streaming-toggle-container';
        container.innerHTML = DOMPurify.sanitize(`
            <div class="z-streaming-toggle">
                <div class="toggle-info">
                    <span class="toggle-title">🔧 Dev Mode</span>
                    <span class="toggle-label">Streaming: <span class="toggle-status">${this.isEnabled ? 'ON' : 'OFF'}</span></span>
                </div>
                <label class="z-toggle-switch">
                    <input type="checkbox"
                           id="zantara-streaming-toggle"
                           ${this.isEnabled ? 'checked' : ''}>
                    <span class="z-toggle-slider"></span>
                </label>
            </div>
        `);

        const input = container.querySelector('#zantara-streaming-toggle');
        const status = container.querySelector('.toggle-status');

        input.addEventListener('change', (e) => {
            this.savePreference(e.target.checked);
            status.textContent = e.target.checked ? 'ON' : 'OFF';

            // Visual feedback
            container.classList.add('toggle-changed');
            setTimeout(() => container.classList.remove('toggle-changed'), 300);
        });

        return container;
    }

    init() {
        if (!this.isDevMode) {
            console.log('[ZANTARA] Dev mode not active. Use ?dev=true to enable.');
            return;
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        // Wait for DOM to be ready, then inject toggle
        setTimeout(() => {
            this.injectToggle();
        }, 100);
    }

    injectToggle() {
        // Find best insertion point
        const targetElement = document.querySelector('.chat-container') ||
                            document.querySelector('.app-container') ||
                            document.body;

        this.toggleElement = this.createToggleElement();
        if (this.toggleElement && targetElement) {
            targetElement.appendChild(this.toggleElement);
            console.log('[ZANTARA] Streaming toggle initialized (dev mode active)');
        }
    }

    // Public API
    isStreamingEnabled() {
        return this.isEnabled;
    }

    setStreamingEnabled(enabled) {
        if (typeof enabled === 'boolean') {
            this.savePreference(enabled);

            // Update UI if toggle exists
            if (this.toggleElement) {
                const input = this.toggleElement.querySelector('#zantara-streaming-toggle');
                const status = this.toggleElement.querySelector('.toggle-status');
                if (input) input.checked = enabled;
                if (status) status.textContent = enabled ? 'ON' : 'OFF';
            }
        }
    }

    isDevModeActive() {
        return this.isDevMode;
    }

    destroy() {
        if (this.toggleElement && this.toggleElement.parentNode) {
            this.toggleElement.parentNode.removeChild(this.toggleElement);
            this.toggleElement = null;
        }
    }
}

// Initialize and make globally available
const zantaraStreamingToggle = new StreamingToggle();
zantaraStreamingToggle.init();

// Global API
window.ZANTARA_STREAMING = {
    toggle: zantaraStreamingToggle,
    isEnabled: () => zantaraStreamingToggle.isStreamingEnabled(),
    setEnabled: (enabled) => zantaraStreamingToggle.setStreamingEnabled(enabled),
    isDevMode: () => zantaraStreamingToggle.isDevModeActive()
};

// Export for modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StreamingToggle;
}