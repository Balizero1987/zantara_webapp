/**
 * ZANTARA - Language Selector Component
 * Interactive language switcher with flags and smooth transitions
 * 
 * Features:
 * - Dropdown selector with flags (🇬🇧 EN, 🇮🇹 IT, 🇮🇩 ID)
 * - Real-time language switching
 * - Persistent preference (localStorage)
 * - Smooth animations
 * - Auto-detect browser language on first visit
 * - English as default fallback
 * 
 * @module LanguageSelector
 * @version 1.0.0
 */

const LanguageSelector = (() => {
    'use strict';

    let currentLanguage = 'en';

    /**
     * Initialize Language Selector
     */
    function init() {
        console.log('🌍 Initializing Language Selector...');

        // Get current language
        currentLanguage = ZANTARA_I18N.getUserLanguage();
        console.log(`📍 Current language: ${currentLanguage}`);

        // Create selector UI if not exists
        createSelectorUI();

        // Update UI to show current language
        updateCurrentLanguageDisplay();

        // Listen for language change events
        window.addEventListener('zantara:languageChanged', (event) => {
            currentLanguage = event.detail.language;
            updateCurrentLanguageDisplay();
        });

        console.log('✅ Language Selector ready');
    }

    /**
     * Create language selector UI
     */
    function createSelectorUI() {
        // Check if already exists
        if (document.getElementById('language-selector')) {
            return;
        }

        const selector = document.createElement('div');
        selector.id = 'language-selector';
        selector.className = 'language-selector';

        const languages = ZANTARA_I18N.supportedLanguages;

        selector.innerHTML = `
            <button class="language-selector-btn" id="languageSelectorBtn" title="Change Language">
                <span class="current-lang-flag" id="currentLangFlag">${languages[currentLanguage].flag}</span>
                <span class="current-lang-code" id="currentLangCode">${currentLanguage.toUpperCase()}</span>
                <span class="selector-arrow">▼</span>
            </button>
            <div class="language-dropdown" id="languageDropdown">
                ${Object.values(languages).map(lang => `
                    <button 
                        class="language-option ${lang.code === currentLanguage ? 'active' : ''}" 
                        data-lang="${lang.code}"
                        onclick="LanguageSelector.selectLanguage('${lang.code}')"
                    >
                        <span class="lang-flag">${lang.flag}</span>
                        <div class="lang-info">
                            <span class="lang-name">${lang.name}</span>
                            <span class="lang-native">${lang.nativeName}</span>
                        </div>
                        <span class="lang-check">✓</span>
                    </button>
                `).join('')}
            </div>
        `;

        // Insert in header actions (before export button)
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
            const exportBtn = document.getElementById('exportBtn');
            if (exportBtn) {
                headerActions.insertBefore(selector, exportBtn);
            } else {
                headerActions.appendChild(selector);
            }
        } else {
            // Fallback: add to body
            document.body.appendChild(selector);
        }

        // Attach event listeners
        attachEventListeners();
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners() {
        const btn = document.getElementById('languageSelectorBtn');
        const dropdown = document.getElementById('languageDropdown');

        if (!btn || !dropdown) return;

        // Toggle dropdown
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('open');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.language-selector')) {
                dropdown.classList.remove('open');
            }
        });

        // Close dropdown on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dropdown.classList.remove('open');
            }
        });
    }

    /**
     * Select a language
     * @param {string} langCode - Language code (en, it, id)
     */
    function selectLanguage(langCode) {
        console.log(`🌍 Switching to: ${langCode}`);

        // Close dropdown
        const dropdown = document.getElementById('languageDropdown');
        if (dropdown) {
            dropdown.classList.remove('open');
        }

        // Update language
        ZANTARA_I18N.setUserLanguage(langCode);
        currentLanguage = langCode;

        // Update UI
        updateCurrentLanguageDisplay();

        // Show confirmation toast
        showLanguageChangeToast(langCode);
    }

    /**
     * Update current language display in selector button
     */
    function updateCurrentLanguageDisplay() {
        const flagEl = document.getElementById('currentLangFlag');
        const codeEl = document.getElementById('currentLangCode');

        if (!flagEl || !codeEl) return;

        const lang = ZANTARA_I18N.supportedLanguages[currentLanguage];
        flagEl.textContent = lang.flag;
        codeEl.textContent = currentLanguage.toUpperCase();

        // Update active state in dropdown
        document.querySelectorAll('.language-option').forEach(option => {
            if (option.dataset.lang === currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    /**
     * Show language change confirmation toast
     * @param {string} langCode - Language code
     */
    function showLanguageChangeToast(langCode) {
        const lang = ZANTARA_I18N.supportedLanguages[langCode];
        
        // Remove existing toast
        const existingToast = document.querySelector('.language-toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create toast
        const toast = document.createElement('div');
        toast.className = 'language-toast';
        toast.innerHTML = `
            <span class="toast-flag">${lang.flag}</span>
            <span class="toast-text">Language: <strong>${lang.nativeName}</strong></span>
        `;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    function getCurrentLanguage() {
        return currentLanguage;
    }

    // Public API
    return {
        init,
        selectLanguage,
        getCurrentLanguage
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', LanguageSelector.init);
} else {
    LanguageSelector.init();
}

// Export for global access
window.LanguageSelector = LanguageSelector;
