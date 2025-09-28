/**
 * ZANTARA Onboarding System - Welcome Flow & Feature Discovery
 * Provides guided introduction for first-time users and contextual help
 */

class OnboardingSystem {
    constructor() {
        this.STORAGE_KEY = 'zantara_onboarding_completed';
        this.TOUR_STEP_KEY = 'zantara_tour_step';
        this.isActive = false;
        this.currentStep = 0;
        this.tourSteps = this.defineTourSteps();
        this.tooltips = [];

        // Check if user needs onboarding
        this.needsOnboarding = !localStorage.getItem(this.STORAGE_KEY);
    }

    defineTourSteps() {
        return [
            {
                id: 'welcome',
                title: 'Benvenuto in ZANTARA! 🌟',
                content: 'Il tuo assistente AI per comunicazione efficace e gestione team. Iniziamo con un tour rapido delle funzionalità principali.',
                position: 'center',
                showSkip: true,
                actions: [
                    { text: 'Inizia il Tour', action: 'next', primary: true },
                    { text: 'Salta', action: 'skip', secondary: true }
                ]
            },
            {
                id: 'chat-area',
                title: 'Area Chat Principale',
                content: 'Qui puoi conversare direttamente con ZANTARA. Digita la tua domanda o richiesta e riceverai risposte personalizzate.',
                target: '.messages-container',
                position: 'bottom',
                actions: [
                    { text: 'Continua', action: 'next', primary: true }
                ]
            },
            {
                id: 'quick-actions',
                title: 'Quick Actions ⚡',
                content: 'Accesso rapido alle funzioni più usate: Attune per ottimizzare dinamiche team, Synergy per mappare collaborazioni, e altro.',
                target: '.quick-actions',
                position: 'top',
                actions: [
                    { text: 'Prova una Quick Action', action: 'demo-quick-action', primary: true },
                    { text: 'Continua', action: 'next', secondary: true }
                ]
            },
            {
                id: 'message-input',
                title: 'Area di Input',
                content: 'Scrivi qui i tuoi messaggi. Puoi usare Enter per inviare, Shift+Enter per andare a capo. Prova a scrivere "Ciao ZANTARA".',
                target: '.input-container',
                position: 'top',
                actions: [
                    { text: 'Prova a scrivere', action: 'demo-message', primary: true },
                    { text: 'Continua', action: 'next', secondary: true }
                ]
            },
            {
                id: 'features-overview',
                title: 'Funzionalità Avanzate 🔧',
                content: 'ZANTARA include funzionalità avanzate come streaming responses, virtualizzazione messaggi e test console per sviluppatori.',
                position: 'center',
                showAdvanced: true,
                actions: [
                    { text: 'Esplora Funzionalità', action: 'show-advanced', primary: true },
                    { text: 'Continua', action: 'next', secondary: true }
                ]
            },
            {
                id: 'completion',
                title: 'Sei pronto! 🚀',
                content: 'Hai completato il tour di ZANTARA. Puoi sempre accedere all\'aiuto tramite il pulsante ? o rivisitare questo tour dalle impostazioni.',
                position: 'center',
                actions: [
                    { text: 'Inizia a usare ZANTARA', action: 'complete', primary: true },
                    { text: 'Ripeti il Tour', action: 'restart', secondary: true }
                ]
            }
        ];
    }

    async init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        // Add help button always
        this.createHelpButton();

        // Show onboarding for new users
        if (this.needsOnboarding) {
            // Small delay to ensure page is fully loaded
            setTimeout(() => {
                this.startOnboarding();
            }, 1000);
        }

        // Listen for help requests
        this.setupEventListeners();
    }

    createHelpButton() {
        const helpButton = document.createElement('div');
        helpButton.className = 'z-help-button';
        helpButton.innerHTML = `
            <button class="help-btn" title="Aiuto e Tour Guidato">
                <span class="help-icon">?</span>
                <span class="help-pulse"></span>
            </button>
        `;

        helpButton.addEventListener('click', () => {
            this.showHelpMenu();
        });

        document.body.appendChild(helpButton);
    }

    showHelpMenu() {
        const menu = document.createElement('div');
        menu.className = 'z-help-menu';
        menu.innerHTML = `
            <div class="help-menu-content">
                <div class="help-menu-header">
                    <h3>Centro Aiuto</h3>
                    <button class="close-help-menu">×</button>
                </div>
                <div class="help-menu-body">
                    <div class="help-option" data-action="restart-tour">
                        <div class="help-option-icon">🎯</div>
                        <div class="help-option-content">
                            <h4>Tour Guidato</h4>
                            <p>Rivedi le funzionalità principali</p>
                        </div>
                    </div>
                    <div class="help-option" data-action="quick-tips">
                        <div class="help-option-icon">💡</div>
                        <div class="help-option-content">
                            <h4>Tips & Trucchi</h4>
                            <p>Suggerimenti per usare al meglio ZANTARA</p>
                        </div>
                    </div>
                    <div class="help-option" data-action="keyboard-shortcuts">
                        <div class="help-option-icon">⌨️</div>
                        <div class="help-option-content">
                            <h4>Scorciatoie Tastiera</h4>
                            <p>Comandi rapidi disponibili</p>
                        </div>
                    </div>
                    <div class="help-option" data-action="feature-discovery">
                        <div class="help-option-icon">🔍</div>
                        <div class="help-option-content">
                            <h4>Scopri Funzionalità</h4>
                            <p>Esplora tutte le capacità di ZANTARA</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        menu.querySelector('.close-help-menu').addEventListener('click', () => {
            menu.remove();
        });

        menu.querySelectorAll('.help-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleHelpAction(action);
                menu.remove();
            });
        });

        // Close on outside click
        menu.addEventListener('click', (e) => {
            if (e.target === menu) {
                menu.remove();
            }
        });

        document.body.appendChild(menu);
    }

    handleHelpAction(action) {
        switch (action) {
            case 'restart-tour':
                this.startOnboarding(true);
                break;
            case 'quick-tips':
                this.showQuickTips();
                break;
            case 'keyboard-shortcuts':
                this.showKeyboardShortcuts();
                break;
            case 'feature-discovery':
                this.startFeatureDiscovery();
                break;
        }
    }

    startOnboarding(force = false) {
        if (!force && !this.needsOnboarding) return;

        this.isActive = true;
        this.currentStep = 0;
        this.showStep(this.tourSteps[0]);
    }

    showStep(step) {
        // Remove existing tour elements
        this.clearTourElements();

        const tourElement = document.createElement('div');
        tourElement.className = 'z-tour-step';
        tourElement.dataset.stepId = step.id;

        // Position the tour element
        if (step.target) {
            const target = document.querySelector(step.target);
            if (target) {
                this.positionNearTarget(tourElement, target, step.position);
                this.highlightTarget(target);
            }
        } else {
            // Center position
            tourElement.classList.add('tour-center');
        }

        tourElement.innerHTML = `
            <div class="tour-content">
                <div class="tour-header">
                    <h3>${step.title}</h3>
                    ${step.showSkip ? '<button class="tour-skip">Salta Tour</button>' : ''}
                </div>
                <div class="tour-body">
                    <p>${step.content}</p>
                    ${step.showAdvanced ? this.renderAdvancedFeatures() : ''}
                </div>
                <div class="tour-actions">
                    ${step.actions.map(action => `
                        <button class="tour-btn ${action.primary ? 'primary' : ''} ${action.secondary ? 'secondary' : ''}"
                                data-action="${action.action}">
                            ${action.text}
                        </button>
                    `).join('')}
                </div>
                <div class="tour-progress">
                    <div class="progress-dots">
                        ${this.tourSteps.map((_, index) => `
                            <div class="progress-dot ${index === this.currentStep ? 'active' : ''} ${index < this.currentStep ? 'completed' : ''}"></div>
                        `).join('')}
                    </div>
                    <span class="progress-text">${this.currentStep + 1} di ${this.tourSteps.length}</span>
                </div>
            </div>
        `;

        // Add backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'tour-backdrop';
        document.body.appendChild(backdrop);

        document.body.appendChild(tourElement);

        // Add event listeners
        this.setupTourStepListeners(tourElement, step);

        // Auto-focus for accessibility
        tourElement.querySelector('.tour-btn.primary')?.focus();
    }

    setupTourStepListeners(element, step) {
        element.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleTourAction(action, step);
            });
        });

        const skipBtn = element.querySelector('.tour-skip');
        if (skipBtn) {
            skipBtn.addEventListener('click', () => {
                this.skipTour();
            });
        }

        // Keyboard navigation
        element.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.skipTour();
            }
        });
    }

    handleTourAction(action, step) {
        switch (action) {
            case 'next':
                this.nextStep();
                break;
            case 'skip':
                this.skipTour();
                break;
            case 'complete':
                this.completeTour();
                break;
            case 'restart':
                this.startOnboarding(true);
                break;
            case 'demo-quick-action':
                this.demoQuickAction();
                break;
            case 'demo-message':
                this.demoMessage();
                break;
            case 'show-advanced':
                this.showAdvancedFeatures();
                break;
        }
    }

    nextStep() {
        this.currentStep++;
        if (this.currentStep < this.tourSteps.length) {
            this.showStep(this.tourSteps[this.currentStep]);
        } else {
            this.completeTour();
        }
    }

    skipTour() {
        this.clearTourElements();
        this.isActive = false;
        this.completeTour();
    }

    completeTour() {
        localStorage.setItem(this.STORAGE_KEY, 'true');
        this.needsOnboarding = false;
        this.clearTourElements();
        this.isActive = false;
        this.showCompletionMessage();
    }

    showCompletionMessage() {
        const notification = document.createElement('div');
        notification.className = 'tour-completion-notification';
        notification.innerHTML = `
            <div class="completion-content">
                <div class="completion-icon">🎉</div>
                <div class="completion-text">
                    <h4>Tour Completato!</h4>
                    <p>Sei pronto per usare ZANTARA al massimo delle sue potenzialità.</p>
                </div>
                <button class="completion-close">×</button>
            </div>
        `;

        notification.querySelector('.completion-close').addEventListener('click', () => {
            notification.remove();
        });

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    // Demo Actions
    async demoQuickAction() {
        const attuneBtn = document.querySelector('[onclick*="attune"]');
        if (attuneBtn) {
            attuneBtn.style.animation = 'pulse 1s ease-in-out 3';
            await this.delay(1000);
            attuneBtn.click();
        }
        this.nextStep();
    }

    async demoMessage() {
        const input = document.getElementById('messageInput');
        if (input) {
            input.focus();
            const demoText = 'Ciao ZANTARA! 👋';

            // Simulate typing
            for (let i = 0; i < demoText.length; i++) {
                input.value = demoText.substring(0, i + 1);
                input.dispatchEvent(new Event('input'));
                await this.delay(100);
            }
        }
        this.nextStep();
    }

    showAdvancedFeatures() {
        const features = [
            {
                title: 'Streaming Responses',
                description: 'Risposte progressive per un\'esperienza più fluida',
                demo: () => window.ZANTARA_STREAMING?.toggle?.show()
            },
            {
                title: 'Message Virtualization',
                description: 'Ottimizzazione automatica basata sul dispositivo',
                demo: () => window.ZANTARA_VIRTUALIZATION?.instance?.show()
            },
            {
                title: 'Test Console',
                description: 'Strumenti di testing per sviluppatori (Ctrl+Shift+T)',
                demo: () => window.ZANTARA_TEST_CONSOLE?.show()
            }
        ];

        // Show features in a modal
        const modal = this.createAdvancedFeaturesModal(features);
        document.body.appendChild(modal);
    }

    // Utility Methods
    positionNearTarget(element, target, position) {
        const rect = target.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        switch (position) {
            case 'top':
                element.style.top = `${rect.top - elementRect.height - 20}px`;
                element.style.left = `${rect.left + (rect.width - elementRect.width) / 2}px`;
                break;
            case 'bottom':
                element.style.top = `${rect.bottom + 20}px`;
                element.style.left = `${rect.left + (rect.width - elementRect.width) / 2}px`;
                break;
            case 'left':
                element.style.top = `${rect.top + (rect.height - elementRect.height) / 2}px`;
                element.style.left = `${rect.left - elementRect.width - 20}px`;
                break;
            case 'right':
                element.style.top = `${rect.top + (rect.height - elementRect.height) / 2}px`;
                element.style.left = `${rect.right + 20}px`;
                break;
        }
    }

    highlightTarget(target) {
        target.classList.add('tour-highlight');
        target.style.position = 'relative';
        target.style.zIndex = '10001';
    }

    clearTourElements() {
        document.querySelectorAll('.z-tour-step, .tour-backdrop, .tour-highlight').forEach(el => {
            if (el.classList.contains('tour-highlight')) {
                el.classList.remove('tour-highlight');
                el.style.position = '';
                el.style.zIndex = '';
            } else {
                el.remove();
            }
        });
    }

    renderAdvancedFeatures() {
        return `
            <div class="advanced-features-preview">
                <div class="feature-item">
                    <span class="feature-icon">⚡</span>
                    <span class="feature-name">Streaming Responses</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">📊</span>
                    <span class="feature-name">Message Virtualization</span>
                </div>
                <div class="feature-item">
                    <span class="feature-icon">🧪</span>
                    <span class="feature-name">Test Console</span>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1' || (e.ctrlKey && e.key === '?')) {
                e.preventDefault();
                this.showHelpMenu();
            }
        });
    }

    showQuickTips() {
        const tips = [
            'Usa Enter per inviare messaggi rapidamente',
            'Prova le Quick Actions per operazioni comuni',
            'Ctrl+Shift+T apre la console di test per sviluppatori',
            'F1 o Ctrl+? apre sempre il menu di aiuto',
            'I messaggi si adattano automaticamente al tuo dispositivo'
        ];

        this.showTipsModal(tips);
    }

    showKeyboardShortcuts() {
        const shortcuts = [
            { key: 'Enter', description: 'Invia messaggio' },
            { key: 'Shift + Enter', description: 'Nuova riga' },
            { key: 'Ctrl + Shift + T', description: 'Apri Test Console' },
            { key: 'F1', description: 'Menu aiuto' },
            { key: 'Ctrl + ?', description: 'Menu aiuto (alternativo)' },
            { key: 'Esc', description: 'Chiudi tour/modal' }
        ];

        this.showShortcutsModal(shortcuts);
    }

    // Placeholder methods for modals (simplified for brevity)
    showTipsModal(tips) {
        console.log('Tips modal:', tips);
    }

    showShortcutsModal(shortcuts) {
        console.log('Shortcuts modal:', shortcuts);
    }

    createAdvancedFeaturesModal(features) {
        const modal = document.createElement('div');
        modal.className = 'advanced-features-modal';
        // Simplified implementation
        return modal;
    }

    startFeatureDiscovery() {
        // Highlight all interactive elements briefly
        const elements = document.querySelectorAll('button, input, [onclick]');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.style.animation = 'pulse 0.5s ease-in-out';
                setTimeout(() => el.style.animation = '', 500);
            }, index * 100);
        });
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Public API
    show() {
        this.showHelpMenu();
    }

    restart() {
        this.startOnboarding(true);
    }

    isOnboardingActive() {
        return this.isActive;
    }

    hasCompletedOnboarding() {
        return !this.needsOnboarding;
    }
}

// Initialize Onboarding System
const zantaraOnboarding = new OnboardingSystem();
zantaraOnboarding.init();

// Make globally accessible
window.ZANTARA_ONBOARDING = zantaraOnboarding;