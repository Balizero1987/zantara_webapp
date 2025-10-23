/**
 * ZANTARA i18n Engine
 * Simple internationalization system for multi-language support
 * Supports: English (en), Italian (it), Indonesian (id)
 */

class I18n {
  constructor() {
    this.currentLang = this.detectLanguage();
    this.translations = {};
    this.fallbackLang = 'en';
    this.supportedLanguages = [
      'en', 'zh', 'es', 'hi', 'ar', 'bn', 'pt', 'ru', 'ja', 'de',
      'ko', 'fr', 'tr', 'vi', 'it', 'pl', 'id', 'uk', 'nl', 'th'
    ];
  }

  /**
   * Detect user's preferred language
   * Priority: localStorage > browser language > fallback (en)
   */
  detectLanguage() {
    // Check localStorage first
    const savedLang = localStorage.getItem('zantara_lang');
    if (savedLang && this.supportedLanguages.includes(savedLang)) {
      return savedLang;
    }

    // Detect from browser
    const browserLang = navigator.language.split('-')[0]; // 'it' from 'it-IT'
    if (this.supportedLanguages.includes(browserLang)) {
      return browserLang;
    }

    // Default fallback
    return this.fallbackLang;
  }

  /**
   * Load translations for a specific language
   */
  async loadTranslations(lang) {
    if (!this.supportedLanguages.includes(lang)) {
      console.warn(`Language ${lang} not supported, using fallback: ${this.fallbackLang}`);
      lang = this.fallbackLang;
    }

    try {
      const response = await fetch(`/static/i18n/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load translations: ${response.status}`);
      }
      this.translations = await response.json();
      this.currentLang = lang;

      // Save to localStorage
      localStorage.setItem('zantara_lang', lang);

      // Update HTML lang attribute
      document.documentElement.lang = lang;

      return true;
    } catch (error) {
      console.error('Error loading translations:', error);

      // Load fallback if main language fails
      if (lang !== this.fallbackLang) {
        return this.loadTranslations(this.fallbackLang);
      }

      return false;
    }
  }

  /**
   * Get translation for a key
   */
  t(key, fallback = null) {
    return this.translations[key] || fallback || key;
  }

  /**
   * Apply translations to DOM elements with data-i18n attribute
   */
  applyTranslations() {
    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        // Don't translate input values, only placeholders
        if (el.hasAttribute('data-i18n-placeholder')) {
          el.placeholder = translation;
        }
      } else {
        el.textContent = translation;
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = this.t(key);
    });

    // Translate titles/tooltips
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = this.t(key);
    });

    // Update document title
    const titleKey = document.body.getAttribute('data-i18n-title');
    if (titleKey) {
      document.title = this.t(titleKey);
    }
  }

  /**
   * Switch to a different language
   */
  async switchLanguage(lang) {
    const success = await this.loadTranslations(lang);
    if (success) {
      this.applyTranslations();

      // Dispatch event for other parts of the app to react
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { language: lang }
      }));

      return true;
    }
    return false;
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLang;
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return this.supportedLanguages;
  }

  /**
   * Get language name in native script
   */
  getLanguageName(code) {
    const names = {
      'en': '🇬🇧 English',
      'zh': '🇨🇳 中文',
      'es': '🇪🇸 Español',
      'hi': '🇮🇳 हिन्दी',
      'ar': '🇸🇦 العربية',
      'bn': '🇧🇩 বাংলা',
      'pt': '🇵🇹 Português',
      'ru': '🇷🇺 Русский',
      'ja': '🇯🇵 日本語',
      'de': '🇩🇪 Deutsch',
      'ko': '🇰🇷 한국어',
      'fr': '🇫🇷 Français',
      'tr': '🇹🇷 Türkçe',
      'vi': '🇻🇳 Tiếng Việt',
      'it': '🇮🇹 Italiano',
      'pl': '🇵🇱 Polski',
      'id': '🇮🇩 Bahasa',
      'uk': '🇺🇦 Українська',
      'nl': '🇳🇱 Nederlands',
      'th': '🇹🇭 ไทย'
    };
    return names[code] || code;
  }
}

// Create global i18n instance
const i18n = new I18n();

/**
 * Initialize i18n system when DOM is ready
 */
async function initI18n() {
  try {
    // Load translations for detected/saved language
    await i18n.loadTranslations(i18n.currentLang);

    // Apply translations to DOM
    i18n.applyTranslations();

    // Update language selector if exists
    const langSelector = document.getElementById('language-selector');
    if (langSelector) {
      langSelector.value = i18n.currentLang;

      // Add change listener
      langSelector.addEventListener('change', async (e) => {
        const newLang = e.target.value;
        await i18n.switchLanguage(newLang);
      });
    }

    console.log(`✅ i18n initialized: ${i18n.currentLang}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize i18n:', error);
    return false;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initI18n);
} else {
  initI18n();
}

// Export for use in other scripts
window.i18n = i18n;
window.initI18n = initI18n;
