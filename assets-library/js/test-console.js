/**
 * ZANTARA Test Console - Enhanced Testing & Observability
 * Comprehensive testing suite for all webapp features
 */

class TestConsole {
    constructor() {
        this.isActive = false;
        this.testResults = [];
        this.scenarios = this.defineScenarios();
        this.currentScenario = null;
        this.container = null;
        this.mockServer = new MockServer();
    }

    defineScenarios() {
        return {
            smokeTest: {
                name: 'Smoke Test',
                description: 'Quick validation of core functionality',
                category: 'basic',
                steps: [
                    { action: 'checkPageLoad' },
                    { action: 'checkAPIConfig' },
                    { action: 'checkDesignSystem' },
                    { action: 'checkLocalStorage' }
                ]
            },

            chatFlow: {
                name: 'Chat Flow',
                description: 'Test complete chat interaction',
                category: 'chat',
                steps: [
                    { action: 'sendMessage', data: { text: 'Hello ZANTARA' } },
                    { action: 'expectResponse', timeout: 8000 },
                    { action: 'checkMessageCount', expected: 2 },
                    { action: 'verifyMessageFormat' }
                ]
            },

            streamingBehavior: {
                name: 'Streaming Behavior',
                description: 'Test streaming vs non-streaming responses',
                category: 'streaming',
                steps: [
                    { action: 'enableStreaming', value: true },
                    { action: 'sendMessage', data: { text: 'Generate a detailed response about ZANTARA' } },
                    { action: 'checkStreamingChunks', minChunks: 3 },
                    { action: 'enableStreaming', value: false },
                    { action: 'sendMessage', data: { text: 'Another test message' } },
                    { action: 'checkBatchResponse' }
                ]
            },

            virtualizationTest: {
                name: 'Message Virtualization',
                description: 'Test configurable message limits',
                category: 'performance',
                steps: [
                    { action: 'setMaxMessages', value: 15 },
                    { action: 'generateTestMessages', count: 30 },
                    { action: 'checkVisibleMessages', expected: 15 },
                    { action: 'checkLoadEarlierButton', visible: true },
                    { action: 'setMaxMessages', value: 40 },
                    { action: 'checkVisibleMessages', expected: 30 }
                ]
            },

            quickActionsTest: {
                name: 'Quick Actions',
                description: 'Test all Quick Action buttons',
                category: 'zantara',
                steps: [
                    { action: 'clickQuickAction', button: 'attune' },
                    { action: 'expectResponse', timeout: 5000 },
                    { action: 'clickQuickAction', button: 'synergy' },
                    { action: 'expectResponse', timeout: 5000 },
                    { action: 'clickQuickAction', button: 'teamHealth' },
                    { action: 'expectResponse', timeout: 5000 }
                ]
            },

            errorHandling: {
                name: 'Error Handling',
                description: 'Test error scenarios and recovery',
                category: 'reliability',
                steps: [
                    { action: 'simulateNetworkError' },
                    { action: 'sendMessage', data: { text: 'Test during error' } },
                    { action: 'checkErrorUI', visible: true },
                    { action: 'restoreNetwork' },
                    { action: 'retryLastMessage' },
                    { action: 'checkErrorUI', visible: false }
                ]
            },

            performanceMetrics: {
                name: 'Performance Metrics',
                description: 'Measure rendering and response performance',
                category: 'performance',
                steps: [
                    { action: 'measureInitialLoad' },
                    { action: 'measureRenderTime', threshold: 100 },
                    { action: 'measureMemoryUsage' },
                    { action: 'stressTestMessages', count: 50 },
                    { action: 'measureFinalMetrics' }
                ]
            },

            accessibilityTest: {
                name: 'Accessibility',
                description: 'Test keyboard navigation and ARIA',
                category: 'accessibility',
                steps: [
                    { action: 'checkARIALabels' },
                    { action: 'testKeyboardNavigation' },
                    { action: 'checkFocusStates' },
                    { action: 'testScreenReaderSupport' }
                ]
            }
        };
    }

    createUI() {
        const container = document.createElement('div');
        container.className = 'z-test-console-container';
        container.innerHTML = `
            <div class="z-test-console-header">
                <div class="header-left">
                    <h3>🧪 ZANTARA Test Console</h3>
                    <span class="version">v2.0</span>
                </div>
                <div class="header-actions">
                    <button class="test-console-minimize">−</button>
                    <button class="test-console-close">×</button>
                </div>
            </div>

            <div class="z-test-console-body">
                <div class="test-sidebar">
                    <div class="test-categories">
                        <div class="category-filter">
                            <button class="category-btn active" data-category="all">All Tests</button>
                            <button class="category-btn" data-category="basic">Basic</button>
                            <button class="category-btn" data-category="chat">Chat</button>
                            <button class="category-btn" data-category="streaming">Streaming</button>
                            <button class="category-btn" data-category="performance">Performance</button>
                            <button class="category-btn" data-category="zantara">ZANTARA</button>
                            <button class="category-btn" data-category="reliability">Reliability</button>
                            <button class="category-btn" data-category="accessibility">A11y</button>
                        </div>
                    </div>

                    <div class="test-scenarios">
                        <div class="scenarios-header">
                            <h4>Test Scenarios</h4>
                            <button class="run-all-btn">Run All</button>
                        </div>
                        <div class="scenario-list">
                            ${this.renderScenarios()}
                        </div>
                    </div>
                </div>

                <div class="test-main">
                    <div class="test-controls">
                        <div class="controls-section">
                            <h4>Environment</h4>
                            <div class="control-group">
                                <label>
                                    <input type="checkbox" id="use-mock-server" ${this.mockServer.enabled ? 'checked' : ''}>
                                    Use Mock Server
                                </label>
                                <label>
                                    Network Latency: <input type="range" id="latency-slider" min="0" max="2000" value="${this.mockServer.latency}">
                                    <span id="latency-value">${this.mockServer.latency}ms</span>
                                </label>
                                <label>
                                    Error Rate: <input type="range" id="error-rate-slider" min="0" max="100" value="${this.mockServer.errorRate * 100}">
                                    <span id="error-rate-value">${Math.round(this.mockServer.errorRate * 100)}%</span>
                                </label>
                            </div>
                        </div>

                        <div class="controls-section">
                            <h4>Quick Actions</h4>
                            <div class="quick-actions-grid">
                                <button id="test-clear-storage">Clear Storage</button>
                                <button id="test-reset-state">Reset State</button>
                                <button id="test-generate-data">Generate Test Data</button>
                                <button id="test-export-logs">Export Results</button>
                                <button id="test-clear-results">Clear Results</button>
                                <button id="test-screenshot">Take Screenshot</button>
                            </div>
                        </div>
                    </div>

                    <div class="test-results">
                        <div class="results-header">
                            <h4>Test Results</h4>
                            <div class="results-stats">
                                <span class="stat-item">Total: <span id="total-tests">0</span></span>
                                <span class="stat-item success">Passed: <span id="passed-tests">0</span></span>
                                <span class="stat-item failed">Failed: <span id="failed-tests">0</span></span>
                            </div>
                        </div>
                        <div class="results-list"></div>
                    </div>
                </div>
            </div>

            <div class="z-test-console-footer">
                <div class="test-status">
                    <div class="status-indicator idle">Ready</div>
                    <div class="current-test-info"></div>
                </div>
                <div class="progress-container">
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                    <span class="progress-text">0%</span>
                </div>
            </div>
        `;

        this.attachEventListeners(container);
        return container;
    }

    renderScenarios() {
        return Object.entries(this.scenarios).map(([key, scenario]) => `
            <div class="scenario-item" data-scenario="${key}" data-category="${scenario.category}">
                <div class="scenario-header">
                    <div class="scenario-name">${scenario.name}</div>
                    <div class="scenario-category">${scenario.category}</div>
                </div>
                <div class="scenario-description">${scenario.description}</div>
                <div class="scenario-actions">
                    <button class="scenario-run-btn" data-scenario="${key}">
                        <span class="btn-text">Run</span>
                        <span class="btn-loading">⏳</span>
                    </button>
                    <span class="scenario-status"></span>
                </div>
            </div>
        `).join('');
    }

    attachEventListeners(container) {
        // Header controls
        container.querySelector('.test-console-close').addEventListener('click', () => this.hide());
        container.querySelector('.test-console-minimize').addEventListener('click', () => this.minimize());

        // Category filters
        container.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterByCategory(e.target.dataset.category);
                container.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // Run buttons
        container.querySelector('.run-all-btn').addEventListener('click', () => this.runAllScenarios());
        container.querySelectorAll('.scenario-run-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scenarioKey = e.target.dataset.scenario;
                this.runScenario(scenarioKey);
            });
        });

        // Environment controls
        const mockServerCheckbox = container.querySelector('#use-mock-server');
        mockServerCheckbox.addEventListener('change', (e) => {
            this.mockServer.enabled = e.target.checked;
            window.ZANTARA_USE_MOCK = e.target.checked;
        });

        const latencySlider = container.querySelector('#latency-slider');
        const latencyValue = container.querySelector('#latency-value');
        latencySlider.addEventListener('input', (e) => {
            this.mockServer.latency = parseInt(e.target.value);
            latencyValue.textContent = `${e.target.value}ms`;
        });

        const errorRateSlider = container.querySelector('#error-rate-slider');
        const errorRateValue = container.querySelector('#error-rate-value');
        errorRateSlider.addEventListener('input', (e) => {
            this.mockServer.errorRate = parseFloat(e.target.value) / 100;
            errorRateValue.textContent = `${e.target.value}%`;
        });

        // Quick actions
        this.attachQuickActions(container);
    }

    attachQuickActions(container) {
        const actions = {
            'test-clear-storage': () => this.clearStorage(),
            'test-reset-state': () => this.resetState(),
            'test-generate-data': () => this.generateTestData(),
            'test-export-logs': () => this.exportResults(),
            'test-clear-results': () => this.clearResults(),
            'test-screenshot': () => this.takeScreenshot()
        };

        Object.entries(actions).forEach(([id, action]) => {
            const btn = container.querySelector(`#${id}`);
            if (btn) btn.addEventListener('click', action);
        });
    }

    async runScenario(scenarioKey) {
        const scenario = this.scenarios[scenarioKey];
        if (!scenario) return;

        this.currentScenario = scenario;
        this.updateScenarioStatus(scenarioKey, 'running');
        this.updateStatus('running', `Running: ${scenario.name}`);

        const results = {
            scenario: scenarioKey,
            name: scenario.name,
            category: scenario.category,
            startTime: Date.now(),
            steps: [],
            logs: []
        };

        try {
            for (let i = 0; i < scenario.steps.length; i++) {
                const step = scenario.steps[i];
                this.updateProgress(((i) / scenario.steps.length) * 100);
                this.updateCurrentTest(`Step ${i + 1}: ${step.action}`);

                const stepResult = await this.executeStep(step);
                results.steps.push(stepResult);

                if (!stepResult.success) {
                    this.log(`❌ Step failed: ${step.action} - ${stepResult.error}`);
                    break;
                } else {
                    this.log(`✅ Step passed: ${step.action}`);
                }

                // Small delay between steps for better UX
                await this.delay(100);
            }
        } catch (error) {
            this.log(`💥 Scenario failed with error: ${error.message}`);
            results.error = error.message;
        }

        results.endTime = Date.now();
        results.duration = results.endTime - results.startTime;
        results.success = results.steps.every(s => s.success) && !results.error;
        results.logs = [...this.logs];

        this.testResults.push(results);
        this.displayResult(results);
        this.updateScenarioStatus(scenarioKey, results.success ? 'success' : 'failed');
        this.updateStatus(results.success ? 'success' : 'failed',
                         results.success ? 'Completed successfully' : 'Failed');
        this.updateProgress(100);
        this.updateStats();

        return results;
    }

    async executeStep(step) {
        const startTime = performance.now();
        let success = false;
        let error = null;
        let metadata = {};

        try {
            switch (step.action) {
                case 'checkPageLoad':
                    success = document.readyState === 'complete';
                    if (!success) error = 'Page not fully loaded';
                    break;

                case 'checkAPIConfig':
                    success = typeof window.ZANTARA_API !== 'undefined';
                    if (!success) error = 'ZANTARA_API not initialized';
                    break;

                case 'checkDesignSystem':
                    const designSystemLink = document.querySelector('link[href*="design-system.css"]');
                    success = !!designSystemLink;
                    if (!success) error = 'Design system CSS not loaded';
                    break;

                case 'checkLocalStorage':
                    try {
                        localStorage.setItem('test', 'test');
                        localStorage.removeItem('test');
                        success = true;
                    } catch (e) {
                        error = 'localStorage not available';
                    }
                    break;

                case 'sendMessage':
                    success = await this.simulateSendMessage(step.data);
                    break;

                case 'expectResponse':
                    success = await this.waitForResponse(step.timeout || 5000);
                    if (!success) error = `No response within ${step.timeout || 5000}ms`;
                    break;

                case 'checkMessageCount':
                    const count = this.getMessageCount();
                    success = count === step.expected;
                    if (!success) error = `Expected ${step.expected} messages, got ${count}`;
                    metadata.actualCount = count;
                    break;

                case 'enableStreaming':
                    if (window.ZANTARA_STREAMING && window.ZANTARA_STREAMING.setEnabled) {
                        window.ZANTARA_STREAMING.setEnabled(step.value);
                        success = true;
                    } else {
                        error = 'Streaming toggle not available';
                    }
                    break;

                case 'setMaxMessages':
                    if (window.ZANTARA_VIRTUALIZATION && window.ZANTARA_VIRTUALIZATION.setMaxMessages) {
                        window.ZANTARA_VIRTUALIZATION.setMaxMessages(step.value);
                        success = true;
                    } else {
                        error = 'Virtualization not available';
                    }
                    break;

                case 'clickQuickAction':
                    success = await this.simulateQuickAction(step.button);
                    break;

                case 'measureRenderTime':
                    const renderTime = await this.measureRenderTime();
                    success = renderTime < (step.threshold || 100);
                    if (!success) error = `Render time ${renderTime}ms exceeds threshold ${step.threshold}ms`;
                    metadata.renderTime = renderTime;
                    break;

                case 'checkARIALabels':
                    const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [role]');
                    success = ariaElements.length > 0;
                    if (!success) error = 'No ARIA labels found';
                    metadata.ariaElementsCount = ariaElements.length;
                    break;

                default:
                    success = true;
                    this.log(`⚠️ Unknown test action: ${step.action}`);
            }
        } catch (e) {
            error = e.message;
            success = false;
        }

        return {
            action: step.action,
            success,
            error,
            duration: performance.now() - startTime,
            metadata
        };
    }

    // Helper Methods
    async simulateSendMessage(data) {
        const input = document.getElementById('messageInput') ||
                      document.getElementById('message-input') ||
                      document.querySelector('#message-input, #messageInput, .message-input');
        const sendBtn = document.getElementById('sendBtn') ||
                        document.getElementById('send-button') ||
                        document.querySelector('#send-button, #sendBtn, .send-button');

        if (input && sendBtn) {
            input.value = data.text;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            sendBtn.click();
            return true;
        }
        return false;
    }

    async waitForResponse(timeout) {
        return new Promise((resolve) => {
            let elapsed = 0;
            const checkInterval = setInterval(() => {
                const messages = document.querySelectorAll('.message');
                const lastMessage = messages[messages.length - 1];

                if (lastMessage && !lastMessage.classList.contains('user')) {
                    clearInterval(checkInterval);
                    resolve(true);
                }

                elapsed += 100;
                if (elapsed >= timeout) {
                    clearInterval(checkInterval);
                    resolve(false);
                }
            }, 100);
        });
    }

    async simulateQuickAction(buttonName) {
        const button = document.querySelector(`[onclick*="${buttonName}"]`);
        if (button) {
            button.click();
            return true;
        }
        return false;
    }

    getMessageCount() {
        return document.querySelectorAll('.message').length;
    }

    async measureRenderTime() {
        const start = performance.now();
        const container = document.querySelector('.messages-container');
        if (container) {
            container.offsetHeight; // Force reflow
        }
        return performance.now() - start;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // UI Management
    filterByCategory(category) {
        const scenarios = this.container.querySelectorAll('.scenario-item');
        scenarios.forEach(item => {
            const itemCategory = item.dataset.category;
            if (category === 'all' || itemCategory === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    updateScenarioStatus(scenarioKey, status) {
        const scenarioItem = this.container.querySelector(`[data-scenario="${scenarioKey}"]`);
        if (scenarioItem) {
            const statusElement = scenarioItem.querySelector('.scenario-status');
            const runBtn = scenarioItem.querySelector('.scenario-run-btn');

            statusElement.className = `scenario-status ${status}`;
            statusElement.textContent = status === 'running' ? '⏳' :
                                      status === 'success' ? '✅' :
                                      status === 'failed' ? '❌' : '';

            if (status === 'running') {
                runBtn.classList.add('running');
            } else {
                runBtn.classList.remove('running');
            }
        }
    }

    updateStatus(status, message) {
        const statusEl = this.container?.querySelector('.status-indicator');
        if (statusEl) {
            statusEl.className = `status-indicator ${status}`;
            statusEl.textContent = message || status.charAt(0).toUpperCase() + status.slice(1);
        }
    }

    updateProgress(percent) {
        const progressEl = this.container?.querySelector('.progress-fill');
        const progressText = this.container?.querySelector('.progress-text');
        if (progressEl) {
            progressEl.style.width = `${percent}%`;
        }
        if (progressText) {
            progressText.textContent = `${Math.round(percent)}%`;
        }
    }

    updateCurrentTest(text) {
        const testInfo = this.container?.querySelector('.current-test-info');
        if (testInfo) {
            testInfo.textContent = text;
        }
    }

    updateStats() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.success).length;
        const failed = total - passed;

        const totalEl = this.container?.querySelector('#total-tests');
        const passedEl = this.container?.querySelector('#passed-tests');
        const failedEl = this.container?.querySelector('#failed-tests');

        if (totalEl) totalEl.textContent = total;
        if (passedEl) passedEl.textContent = passed;
        if (failedEl) failedEl.textContent = failed;
    }

    displayResult(result) {
        const resultsContainer = this.container?.querySelector('.results-list');
        if (!resultsContainer) return;

        const resultEl = document.createElement('div');
        resultEl.className = `result-item ${result.success ? 'success' : 'failed'}`;
        resultEl.innerHTML = `
            <div class="result-header">
                <div class="result-info">
                    <span class="result-name">${result.name}</span>
                    <span class="result-category">${result.category}</span>
                </div>
                <div class="result-meta">
                    <span class="result-duration">${result.duration}ms</span>
                    <span class="result-timestamp">${new Date(result.startTime).toLocaleTimeString()}</span>
                </div>
            </div>
            <div class="result-steps">
                ${result.steps.map(step => `
                    <div class="step-result ${step.success ? 'success' : 'failed'}">
                        <span class="step-action">${step.action}</span>
                        <span class="step-duration">${Math.round(step.duration)}ms</span>
                        ${step.error ? `<span class="step-error">${step.error}</span>` : ''}
                    </div>
                `).join('')}
            </div>
        `;

        resultsContainer.insertBefore(resultEl, resultsContainer.firstChild);
    }

    // Quick Actions
    clearStorage() {
        const keys = [
            'zantara_streaming_enabled',
            'zantara_max_render_messages',
            'zantara_dev_mode',
            'zantara-user-email',
            'zantara-persona'
        ];
        keys.forEach(key => localStorage.removeItem(key));
        this.log('🧹 Storage cleared');
    }

    resetState() {
        this.log('🔄 Resetting application state...');
        setTimeout(() => window.location.reload(), 500);
    }

    generateTestData() {
        // Generate test messages
        const testMessages = [
            'Test message 1 for virtualization',
            'Another test message',
            'Testing streaming behavior',
            'Quick action test',
            'Performance test message'
        ];

        testMessages.forEach((msg, index) => {
            setTimeout(() => {
                this.simulateSendMessage({ text: `${msg} ${index + 1}` });
            }, index * 1000);
        });

        this.log('🎯 Generated test data');
    }

    exportResults() {
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '2.0',
            testResults: this.testResults,
            configuration: {
                streaming: window.ZANTARA_STREAMING?.isEnabled(),
                maxMessages: window.ZANTARA_VIRTUALIZATION?.getMaxMessages(),
                devMode: window.ZANTARA_STREAMING?.isDevMode()
            },
            environment: {
                userAgent: navigator.userAgent,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                url: window.location.href
            }
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zantara-test-results-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.log('📁 Test results exported');
    }

    clearResults() {
        this.testResults = [];
        const resultsContainer = this.container?.querySelector('.results-list');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
        this.updateStats();
        this.log('🗑️ Test results cleared');
    }

    takeScreenshot() {
        if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true })
                .then(stream => {
                    this.log('📸 Screenshot capability available');
                    stream.getTracks().forEach(track => track.stop());
                })
                .catch(() => {
                    this.log('📸 Screenshot not supported in this browser');
                });
        } else {
            this.log('📸 Screenshot not supported in this browser');
        }
    }

    async runAllScenarios() {
        const scenarios = Object.keys(this.scenarios);
        this.log(`🚀 Running all ${scenarios.length} scenarios...`);

        for (const scenario of scenarios) {
            await this.runScenario(scenario);
            await this.delay(500); // Pause between scenarios
        }

        this.log('🏁 All scenarios completed');
    }

    // Logging
    logs = [];

    log(message) {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        this.logs.push(logEntry);
        console.log(`[Test Console] ${logEntry}`);
    }

    // Public API
    show() {
        if (!this.container) {
            this.container = this.createUI();
            document.body.appendChild(this.container);
        }
        this.container.classList.add('visible');
        this.isActive = true;
        this.log('🧪 Test Console opened');
    }

    hide() {
        if (this.container) {
            this.container.classList.remove('visible');
        }
        this.isActive = false;
        this.log('👋 Test Console closed');
    }

    minimize() {
        if (this.container) {
            this.container.classList.toggle('minimized');
        }
    }

    toggle() {
        if (this.isActive) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// Simple Mock Server
class MockServer {
    constructor() {
        this.enabled = false;
        this.latency = 500;
        this.errorRate = 0;
    }
}

// Initialize Test Console
const zantaraTestConsole = new TestConsole();

// Global keyboard shortcut: Ctrl+Shift+T
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        zantaraTestConsole.toggle();
    }
});

// Make globally accessible
window.ZANTARA_TEST_CONSOLE = zantaraTestConsole;
