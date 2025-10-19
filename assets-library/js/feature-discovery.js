/**
 * ZANTARA Feature Discovery - Interactive Tooltips & Contextual Help
 * Provides progressive disclosure of advanced features
 */

class FeatureDiscovery {
    constructor() {
        this.STORAGE_KEY = 'zantara_discovered_features';
        this.DISCOVERY_DELAY = 3000; // Show tooltips after 3 seconds
        this.discoveredFeatures = this.loadDiscoveredFeatures();
        this.activeTooltips = new Map();
        this.features = this.defineFeatures();
    }

    defineFeatures() {
        return {
            // Dev Mode Features
            streamingToggle: {
                selector: '.z-streaming-toggle-container',
                title: 'Streaming Control 🎛️',
                description: 'Toggle streaming responses on/off for testing different user experiences.',
                trigger: 'dev-mode',
                position: 'left',
                category: 'dev',
                discoverable: true
            },

            virtualizationConfig: {
                selector: '.z-virtualization-config-container',
                title: 'Message Optimization ⚡',
                description: 'Adjust message limits based on your device performance. Drag the slider to optimize.',
                trigger: 'dev-mode',
                position: 'left',
                category: 'performance',
                discoverable: true
            },

            // Main UI Features
            quickActions: {
                selector: '.quick-actions',
                title: 'Quick Actions 🚀',
                description: 'One-click access to ZANTARA\'s most powerful features. Try "Attune" for team optimization.',
                trigger: 'first-visit',
                position: 'top',
                category: 'zantara',
                discoverable: true,
                demo: () => this.highlightQuickActions()
            },

            messageInput: {
                selector: '.input-field',
                title: 'Smart Input 💭',
                description: 'Use Enter to send, Shift+Enter for new lines. Try @commands for special functions.',
                trigger: 'interaction',
                position: 'top',
                category: 'basic',
                discoverable: true
            },

            copyButton: {
                selector: '.z-icon-btn[title="Copy"]',
                title: 'Copy Messages 📋',
                description: 'Click to copy any message content. Perfect for sharing ZANTARA insights.',
                trigger: 'message-hover',
                position: 'left',
                category: 'utility',
                discoverable: true
            },

            // Advanced Features
            loadEarlier: {
                selector: '[onclick*="loadEarlier"]',
                title: 'Message History 📚',
                description: 'Load previous messages when needed. The app optimizes performance by showing recent messages first.',
                trigger: 'scroll-top',
                position: 'bottom',
                category: 'performance',
                discoverable: true
            },

            // Keyboard Shortcuts
            keyboardShortcuts: {
                selector: 'body',
                title: 'Keyboard Shortcuts ⌨️',
                description: 'Press F1 for help, Ctrl+Shift+T for test console, and more productivity shortcuts.',
                trigger: 'power-user',
                position: 'center',
                category: 'advanced',
                discoverable: true
            }
        };
    }

    loadDiscoveredFeatures() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    saveDiscoveredFeatures() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.discoveredFeatures));
        } catch (e) {
            console.warn('[Feature Discovery] Could not save discovered features');
        }
    }

    markAsDiscovered(featureId) {
        this.discoveredFeatures[featureId] = {
            discovered: true,
            timestamp: Date.now()
        };
        this.saveDiscoveredFeatures();
    }

    isDiscovered(featureId) {
        return this.discoveredFeatures[featureId]?.discovered || false;
    }

    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        // Wait for other systems to load
        setTimeout(() => {
            this.setupFeatureDiscovery();
        }, 1000);
    }

    setupFeatureDiscovery() {
        // Check for first visit features
        this.checkFirstVisitFeatures();

        // Setup interaction triggers
        this.setupInteractionTriggers();

        // Setup dev mode features
        this.setupDevModeFeatures();

        // Setup scroll and hover triggers
        this.setupAdvancedTriggers();

        // Periodic check for new features
        setInterval(() => {
            this.checkForNewFeatures();
        }, 5000);
    }

    checkFirstVisitFeatures() {
        const firstVisitFeatures = Object.entries(this.features)
            .filter(([_, feature]) => feature.trigger === 'first-visit');

        firstVisitFeatures.forEach(([featureId, feature]) => {
            if (!this.isDiscovered(featureId)) {
                setTimeout(() => {
                    this.showFeatureTooltip(featureId, feature);
                }, this.DISCOVERY_DELAY);
            }
        });
    }

    setupInteractionTriggers() {
        // Message input focus
        const messageInput = document.querySelector('.input-field');
        if (messageInput) {
            let focusCount = 0;
            messageInput.addEventListener('focus', () => {
                focusCount++;
                if (focusCount === 2 && !this.isDiscovered('messageInput')) {
                    this.showFeatureTooltip('messageInput', this.features.messageInput);
                }
            });
        }

        // Hover triggers for copy buttons
        this.setupHoverTriggers();
    }

    setupHoverTriggers() {
        // Use delegation for dynamic copy buttons
        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('.z-icon-btn[title="Copy"]') ||
                e.target.closest('.z-icon-btn[title="Copy"]')) {

                if (!this.isDiscovered('copyButton')) {
                    setTimeout(() => {
                        this.showFeatureTooltip('copyButton', this.features.copyButton);
                    }, 1000);
                }
            }
        });
    }

    setupDevModeFeatures() {
        // Check for dev mode periodically
        const checkDevMode = () => {
            const devModeFeatures = Object.entries(this.features)
                .filter(([_, feature]) => feature.trigger === 'dev-mode');

            devModeFeatures.forEach(([featureId, feature]) => {
                const element = document.querySelector(feature.selector);
                if (element && !this.isDiscovered(featureId)) {
                    setTimeout(() => {
                        this.showFeatureTooltip(featureId, feature);
                    }, 1000);
                }
            });
        };

        // Check immediately and then periodically
        checkDevMode();
        setInterval(checkDevMode, 3000);
    }

    setupAdvancedTriggers() {
        // Power user detection (multiple interactions)
        let interactionCount = 0;
        const interactions = ['click', 'keydown', 'input'];

        interactions.forEach(event => {
            document.addEventListener(event, () => {
                interactionCount++;
                if (interactionCount > 50 && !this.isDiscovered('keyboardShortcuts')) {
                    this.showFeatureTooltip('keyboardShortcuts', this.features.keyboardShortcuts);
                }
            });
        });

        // Scroll to top detection
        let scrollDetection = false;
        window.addEventListener('scroll', () => {
            if (window.scrollY === 0 && !scrollDetection) {
                scrollDetection = true;
                const loadEarlierBtn = document.querySelector('[onclick*="loadEarlier"]');
                if (loadEarlierBtn && !this.isDiscovered('loadEarlier')) {
                    setTimeout(() => {
                        this.showFeatureTooltip('loadEarlier', this.features.loadEarlier);
                    }, 1000);
                }
            }
        });
    }

    checkForNewFeatures() {
        // Dynamically check for new elements that might have tooltips
        Object.entries(this.features).forEach(([featureId, feature]) => {
            if (!this.isDiscovered(featureId) && !this.activeTooltips.has(featureId)) {
                const element = document.querySelector(feature.selector);
                if (element && this.shouldShowFeature(featureId, feature)) {
                    this.showFeatureTooltip(featureId, feature);
                }
            }
        });
    }

    shouldShowFeature(featureId, feature) {
        // Check various conditions for showing features
        switch (feature.trigger) {
            case 'dev-mode':
                return this.isDevModeActive();
            case 'first-visit':
                return !localStorage.getItem('zantara_onboarding_completed');
            default:
                return true;
        }
    }

    isDevModeActive() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('dev') === 'true' ||
               window.location.hostname === 'localhost' ||
               localStorage.getItem('zantara_dev_mode') === 'true';
    }

    showFeatureTooltip(featureId, feature) {
        const element = document.querySelector(feature.selector);
        if (!element || this.activeTooltips.has(featureId)) return;

        const tooltip = this.createTooltip(featureId, feature);
        this.positionTooltip(tooltip, element, feature.position);

        document.body.appendChild(tooltip);
        this.activeTooltips.set(featureId, tooltip);

        // Auto-dismiss after 8 seconds
        setTimeout(() => {
            this.dismissTooltip(featureId);
        }, 8000);

        // Track analytics
        this.trackFeatureDiscovery(featureId, 'shown');
    }

    createTooltip(featureId, feature) {
        const tooltip = document.createElement('div');
        tooltip.className = `z-feature-tooltip ${feature.category}`;
        tooltip.dataset.featureId = featureId;

        tooltip.innerHTML = `
            <div class="tooltip-content">
                <div class="tooltip-header">
                    <h4>${feature.title}</h4>
                    <button class="tooltip-close" aria-label="Close tooltip">×</button>
                </div>
                <div class="tooltip-body">
                    <p>${feature.description}</p>
                    ${feature.demo ? '<button class="tooltip-demo-btn">Try it</button>' : ''}
                </div>
                <div class="tooltip-actions">
                    <button class="tooltip-got-it">Got it!</button>
                    <button class="tooltip-dont-show">Don't show again</button>
                </div>
                <div class="tooltip-arrow"></div>
            </div>
        `;

        // Add event listeners
        this.setupTooltipListeners(tooltip, featureId, feature);

        return tooltip;
    }

    setupTooltipListeners(tooltip, featureId, feature) {
        // Close button
        tooltip.querySelector('.tooltip-close').addEventListener('click', () => {
            this.dismissTooltip(featureId);
        });

        // Got it button
        tooltip.querySelector('.tooltip-got-it').addEventListener('click', () => {
            this.markAsDiscovered(featureId);
            this.dismissTooltip(featureId);
            this.trackFeatureDiscovery(featureId, 'acknowledged');
        });

        // Don't show again
        tooltip.querySelector('.tooltip-dont-show').addEventListener('click', () => {
            this.markAsDiscovered(featureId);
            this.dismissTooltip(featureId);
            this.trackFeatureDiscovery(featureId, 'dismissed');
        });

        // Demo button (if exists)
        const demoBtn = tooltip.querySelector('.tooltip-demo-btn');
        if (demoBtn && feature.demo) {
            demoBtn.addEventListener('click', () => {
                feature.demo();
                this.trackFeatureDiscovery(featureId, 'demo');
            });
        }

        // Auto-dismiss on click outside
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!tooltip.contains(e.target)) {
                    this.dismissTooltip(featureId);
                }
            }, { once: true });
        }, 100);

        // Keyboard accessibility
        tooltip.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.dismissTooltip(featureId);
            }
        });
    }

    positionTooltip(tooltip, target, position) {
        // Position tooltip relative to target element
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top, left;

        switch (position) {
            case 'top':
                top = rect.top - tooltipRect.height - 10;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                tooltip.classList.add('position-top');
                break;
            case 'bottom':
                top = rect.bottom + 10;
                left = rect.left + (rect.width - tooltipRect.width) / 2;
                tooltip.classList.add('position-bottom');
                break;
            case 'left':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.left - tooltipRect.width - 10;
                tooltip.classList.add('position-left');
                break;
            case 'right':
                top = rect.top + (rect.height - tooltipRect.height) / 2;
                left = rect.right + 10;
                tooltip.classList.add('position-right');
                break;
            case 'center':
                top = window.innerHeight / 2 - tooltipRect.height / 2;
                left = window.innerWidth / 2 - tooltipRect.width / 2;
                tooltip.classList.add('position-center');
                break;
        }

        // Ensure tooltip stays within viewport
        top = Math.max(10, Math.min(top, window.innerHeight - tooltipRect.height - 10));
        left = Math.max(10, Math.min(left, window.innerWidth - tooltipRect.width - 10));

        tooltip.style.position = 'fixed';
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
        tooltip.style.zIndex = '10003';
    }

    dismissTooltip(featureId) {
        const tooltip = this.activeTooltips.get(featureId);
        if (tooltip) {
            tooltip.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => {
                if (tooltip.parentNode) {
                    tooltip.parentNode.removeChild(tooltip);
                }
                this.activeTooltips.delete(featureId);
            }, 300);
        }
    }

    // Demo Functions
    highlightQuickActions() {
        const quickActions = document.querySelectorAll('.quick-btn');
        quickActions.forEach((btn, index) => {
            setTimeout(() => {
                btn.style.animation = 'pulse 0.6s ease-in-out';
                setTimeout(() => btn.style.animation = '', 600);
            }, index * 200);
        });
    }

    // Analytics
    trackFeatureDiscovery(featureId, action) {
        console.log(`[Feature Discovery] ${featureId}: ${action}`);

        // You can integrate with analytics services here
        if (window.gtag) {
            gtag('event', 'feature_discovery', {
                feature_id: featureId,
                action: action,
                timestamp: Date.now()
            });
        }
    }

    // Public API
    showAllFeatures() {
        Object.entries(this.features).forEach(([featureId, feature]) => {
            const element = document.querySelector(feature.selector);
            if (element) {
                this.showFeatureTooltip(featureId, feature);
            }
        });
    }

    resetDiscoveredFeatures() {
        this.discoveredFeatures = {};
        this.saveDiscoveredFeatures();
        console.log('[Feature Discovery] Reset all discovered features');
    }

    getDiscoveryStats() {
        const total = Object.keys(this.features).length;
        const discovered = Object.keys(this.discoveredFeatures).length;

        return {
            total,
            discovered,
            percentage: Math.round((discovered / total) * 100),
            features: this.discoveredFeatures
        };
    }

    forceShowFeature(featureId) {
        const feature = this.features[featureId];
        if (feature) {
            this.showFeatureTooltip(featureId, feature);
        }
    }
}

// Initialize Feature Discovery
const zantaraFeatureDiscovery = new FeatureDiscovery();
zantaraFeatureDiscovery.init();

// Make globally accessible
window.ZANTARA_FEATURE_DISCOVERY = zantaraFeatureDiscovery;