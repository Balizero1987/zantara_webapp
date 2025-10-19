/**
 * Zantara Widget SDK
 * Easy integration for any website or workspace
 */

(function(window, document) {
    'use strict';

    const WIDGET_URL = 'https://zantara-bridge-v2-prod-1064094238013.asia-southeast2.run.app/widget';
    const API_URL = 'https://zantara-bridge-v2-prod-1064094238013.asia-southeast2.run.app';

    class ZantaraWidget {
        constructor(config = {}) {
            this.config = {
                position: config.position || 'bottom-right',
                theme: config.theme || 'default',
                apiKey: config.apiKey || null,
                userId: config.userId || null,
                autoLoad: config.autoLoad !== false,
                services: config.services || ['sheets', 'gmail', 'calendar', 'drive'],
                customStyles: config.customStyles || {},
                onReady: config.onReady || null,
                onError: config.onError || null
            };

            this.iframe = null;
            this.isLoaded = false;
            this.messageQueue = [];

            if (this.config.autoLoad) {
                this.init();
            }
        }

        init() {
            // Create container
            const container = document.createElement('div');
            container.id = 'zantara-widget-container';
            container.style.cssText = this.getContainerStyles();
            
            // Create iframe
            this.iframe = document.createElement('iframe');
            this.iframe.id = 'zantara-widget-iframe';
            this.iframe.src = WIDGET_URL;
            this.iframe.style.cssText = this.getIframeStyles();
            this.iframe.setAttribute('frameborder', '0');
            this.iframe.setAttribute('allowtransparency', 'true');
            
            // Add to container
            container.appendChild(this.iframe);
            document.body.appendChild(container);

            // Setup message listener
            this.setupMessageListener();

            // Setup load listener
            this.iframe.onload = () => {
                this.isLoaded = true;
                this.processMessageQueue();
                if (this.config.onReady) {
                    this.config.onReady(this);
                }
            };

            return this;
        }

        getContainerStyles() {
            const positions = {
                'bottom-right': 'bottom: 20px; right: 20px;',
                'bottom-left': 'bottom: 20px; left: 20px;',
                'top-right': 'top: 20px; right: 20px;',
                'top-left': 'top: 20px; left: 20px;'
            };

            return `
                position: fixed;
                ${positions[this.config.position]}
                z-index: 999999;
                width: 60px;
                height: 60px;
                transition: all 0.3s ease;
            `;
        }

        getIframeStyles() {
            return `
                width: 100%;
                height: 100%;
                border: none;
                background: transparent;
            `;
        }

        setupMessageListener() {
            window.addEventListener('message', (event) => {
                // Verify origin
                if (!event.origin.includes('zantara-bridge')) return;

                const { type, data } = event.data;
                this.handleMessage(type, data);
            });
        }

        handleMessage(type, data) {
            switch(type) {
                case 'widget-ready':
                    this.sendConfig();
                    break;
                case 'widget-expanded':
                    this.expandContainer();
                    break;
                case 'widget-collapsed':
                    this.collapseContainer();
                    break;
                case 'api-response':
                    this.handleApiResponse(data);
                    break;
                case 'error':
                    if (this.config.onError) {
                        this.config.onError(data);
                    }
                    break;
            }
        }

        expandContainer() {
            const container = document.getElementById('zantara-widget-container');
            if (container) {
                container.style.width = '380px';
                container.style.height = '680px';
            }
        }

        collapseContainer() {
            const container = document.getElementById('zantara-widget-container');
            if (container) {
                container.style.width = '60px';
                container.style.height = '60px';
            }
        }

        sendConfig() {
            this.postMessage('config', this.config);
        }

        postMessage(type, data) {
            const message = { type, data, timestamp: Date.now() };
            
            if (this.isLoaded && this.iframe) {
                this.iframe.contentWindow.postMessage(message, '*');
            } else {
                this.messageQueue.push(message);
            }
        }

        processMessageQueue() {
            while (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                this.iframe.contentWindow.postMessage(message, '*');
            }
        }

        // Public API Methods
        
        show() {
            const container = document.getElementById('zantara-widget-container');
            if (container) {
                container.style.display = 'block';
            }
            return this;
        }

        hide() {
            const container = document.getElementById('zantara-widget-container');
            if (container) {
                container.style.display = 'none';
            }
            return this;
        }

        toggle() {
            this.postMessage('toggle', {});
            return this;
        }

        // Service Methods

        async createSpreadsheet(title, headers = []) {
            return this.callAPI('/api/sheets/create', 'POST', { title, headers });
        }

        async sendEmail(to, subject, body) {
            return this.callAPI('/api/gmail/send', 'POST', { to, subject, body });
        }

        async scheduleEvent(summary, start, end, description = '') {
            return this.callAPI('/api/calendar/create-event', 'POST', {
                summary, start, end, description
            });
        }

        async saveMemory(userId, facts = [], summary = '') {
            return this.callAPI('/memory/save', 'POST', {
                userId,
                profile_facts: facts,
                summary
            });
        }

        async getMemory(userId) {
            return this.callAPI(`/memory/get?userId=${userId}`, 'GET');
        }

        async callAPI(endpoint, method = 'GET', body = null) {
            const options = {
                method,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            if (body && method !== 'GET') {
                options.body = JSON.stringify(body);
            }

            try {
                const response = await fetch(API_URL + endpoint, options);
                const data = await response.json();
                return data;
            } catch (error) {
                if (this.config.onError) {
                    this.config.onError(error);
                }
                throw error;
            }
        }

        // Utility Methods

        setUserId(userId) {
            this.config.userId = userId;
            this.postMessage('set-user', { userId });
            return this;
        }

        setTheme(theme) {
            this.config.theme = theme;
            this.postMessage('set-theme', { theme });
            return this;
        }

        destroy() {
            const container = document.getElementById('zantara-widget-container');
            if (container) {
                container.remove();
            }
            this.iframe = null;
            this.isLoaded = false;
        }
    }

    // Export to window
    window.ZantaraWidget = ZantaraWidget;

    // Auto-initialize if data attribute present
    document.addEventListener('DOMContentLoaded', () => {
        const script = document.querySelector('script[data-zantara-auto-init]');
        if (script) {
            const config = {};
            
            // Parse data attributes
            ['position', 'theme', 'api-key', 'user-id'].forEach(attr => {
                const value = script.getAttribute(`data-${attr}`);
                if (value) {
                    const key = attr.replace('-', '');
                    config[key] = value;
                }
            });

            // Initialize widget
            window.zantaraWidget = new ZantaraWidget(config);
        }
    });

})(window, document);

// Usage Examples:
/*

// Method 1: Auto-init with data attributes
<script src="zantara-sdk.js" 
    data-zantara-auto-init 
    data-position="bottom-right"
    data-theme="dark"
    data-user-id="user123">
</script>

// Method 2: Manual initialization
<script src="zantara-sdk.js"></script>
<script>
    const widget = new ZantaraWidget({
        position: 'bottom-right',
        theme: 'default',
        userId: 'user123',
        onReady: (w) => {
            console.log('Widget ready!');
        },
        onError: (err) => {
            console.error('Widget error:', err);
        }
    });

    // Use the API
    widget.createSpreadsheet('My Sheet', ['Name', 'Email', 'Date'])
        .then(data => console.log('Sheet created:', data));

    widget.saveMemory('user123', ['Likes coffee'], 'Regular customer')
        .then(data => console.log('Memory saved:', data));
</script>

*/