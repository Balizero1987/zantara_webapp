/**
 * ZANTARA Internationalization (i18n)
 * Supports EN (English - DEFAULT), IT (Italian), ID (Indonesian)
 * 
 * @version 2.0.0
 * Features:
 * - English as primary/default language
 * - Language selector UI with flags
 * - Auto-detect from browser (fallback to EN)
 * - Persistent language preference
 * - Real-time translation updates
 */

const ZANTARA_I18N = {
  translations: {
    en: {
      // Header
      tagline: 'From Zero to Infinity ∞',

      // Sidebar
      conversations: 'Conversations',
      newChat: '+ New',

      // Welcome
      welcomeTitle: 'Welcome to Zantara',
      welcomeSubtitle: 'The Intelligent Soul of Bali Zero',

      // Suggested questions
      suggestedQuestions: {
        kitas: {
          title: '📋 E23 Freelance KITAS',
          subtitle: 'Documents, costs and timeline',
          question: 'How can I get an E23 Freelance KITAS?'
        },
        company: {
          title: '🏢 PT Company Setup',
          subtitle: 'Complete costs and requirements',
          question: 'How much does it cost to open a PT company in Indonesia?'
        },
        investor: {
          title: '💼 Investor Visas',
          subtitle: 'E28A, E33A and comparison',
          question: 'What are the visa options for investors?'
        }
      },

      // Input area
      inputPlaceholder: 'Write a message...',
      voiceInputTitle: 'Voice input',
      sendButtonTitle: 'Send message',

      // Buttons
      exportBtn: '📥 Export',

      // AI label
      aiLabel: 'Zantara:',

      // Messages
      typing: 'Typing',
      errorMessage: 'Unable to respond. Try again in a moment.',

      // Citations
      citationsBadge: '📚 Sources',
      sources: 'sources',

      // Alerts
      voiceNotSupported: 'Voice input not supported in this browser',

      // Login
      loginName: 'Name',
      loginEmail: 'Company email',
      loginPin: 'PIN (6 digits)',
      loginButton: 'Join Team',
      loginTitle: 'Welcome to Zantara',
      loginSubtitle: 'The Intelligent Soul of Bali Zero',

      // Language Selector
      languageSelector: 'Language',
      changeLanguage: 'Change Language'
    },

    it: {
      // Header
      tagline: 'From Zero to Infinity ∞',

      // Sidebar
      conversations: 'Conversazioni',
      newChat: '+ Nuova',

      // Welcome
      welcomeTitle: 'Benvenuto su Zantara',
      welcomeSubtitle: "L'anima intelligente di Bali Zero",

      // Suggested questions
      suggestedQuestions: {
        kitas: {
          title: '📋 E23 Freelance KITAS',
          subtitle: 'Documenti, costi e timeline',
          question: 'Come posso ottenere una E23 Freelance KITAS?'
        },
        company: {
          title: '🏢 PT Company Setup',
          subtitle: 'Costi e requisiti completi',
          question: 'Quanto costa aprire una PT company in Indonesia?'
        },
        investor: {
          title: '💼 Visti Investitori',
          subtitle: 'E28A, E33A e confronto',
          question: 'Quali sono le opzioni di visto per investitori?'
        }
      },

      // Input area
      inputPlaceholder: 'Scrivi un messaggio...',
      voiceInputTitle: 'Input vocale',
      sendButtonTitle: 'Invia messaggio',

      // Buttons
      exportBtn: '📥 Esporta',

      // AI label
      aiLabel: 'Zantara:',

      // Messages
      typing: 'Sta scrivendo',
      errorMessage: 'Impossibile rispondere. Riprova tra un momento.',

      // Citations
      citationsBadge: '📚 Fonti',
      sources: 'fonti',

      // Alerts
      voiceNotSupported: 'Input vocale non supportato in questo browser',

      // Login
      loginName: 'Nome',
      loginEmail: 'Email aziendale',
      loginPin: 'PIN (6 cifre)',
      loginButton: 'Accedi al Team',
      loginTitle: 'Benvenuto su Zantara',
      loginSubtitle: "L'anima intelligente di Bali Zero",

      // Language Selector
      languageSelector: 'Lingua',
      changeLanguage: 'Cambia Lingua'
    },

    id: {
      // Header
      tagline: 'From Zero to Infinity ∞',

      // Sidebar
      conversations: 'Percakapan',
      newChat: '+ Baru',

      // Welcome
      welcomeTitle: 'Selamat Datang di Zantara',
      welcomeSubtitle: 'Jiwa Cerdas dari Bali Zero',

      // Suggested questions
      suggestedQuestions: {
        kitas: {
          title: '📋 E23 Freelance KITAS',
          subtitle: 'Dokumen, biaya dan timeline',
          question: 'Bagaimana cara mendapatkan E23 Freelance KITAS?'
        },
        company: {
          title: '🏢 Pendirian PT',
          subtitle: 'Biaya dan persyaratan lengkap',
          question: 'Berapa biaya mendirikan perusahaan PT di Indonesia?'
        },
        investor: {
          title: '💼 Visa Investor',
          subtitle: 'E28A, E33A dan perbandingan',
          question: 'Apa saja pilihan visa untuk investor?'
        }
      },

      // Input area
      inputPlaceholder: 'Tulis pesan...',
      voiceInputTitle: 'Input suara',
      sendButtonTitle: 'Kirim pesan',

      // Buttons
      exportBtn: '📥 Ekspor',

      // AI label
      aiLabel: 'Zantara:',

      // Messages
      typing: 'Sedang menulis',
      errorMessage: 'Tidak dapat merespons. Coba lagi sebentar lagi.',

      // Citations
      citationsBadge: '📚 Sumber',
      sources: 'sumber',

      // Alerts
      voiceNotSupported: 'Input suara tidak didukung di browser ini',

      // Login
      loginName: 'Nama',
      loginEmail: 'Email perusahaan',
      loginPin: 'PIN (6 digit)',
      loginButton: 'Masuk ke Tim',
      loginTitle: 'Selamat Datang di Zantara',
      loginSubtitle: 'Jiwa Cerdas dari Bali Zero',

      // Language Selector
      languageSelector: 'Bahasa',
      changeLanguage: 'Ubah Bahasa'
    },

    uk: {
      // Header
      tagline: 'From Zero to Infinity ∞',

      // Sidebar
      conversations: 'Розмови',
      newChat: '+ Нова',

      // Welcome
      welcomeTitle: 'Ласкаво просимо до Zantara',
      welcomeSubtitle: 'Розумна душа Bali Zero',

      // Suggested questions
      suggestedQuestions: {
        kitas: {
          title: '📋 E23 Freelance KITAS',
          subtitle: 'Документи, вартість та терміни',
          question: 'Як отримати E23 Freelance KITAS?'
        },
        company: {
          title: '🏢 Реєстрація PT',
          subtitle: 'Повна вартість і вимоги',
          question: 'Скільки коштує відкрити компанію PT в Індонезії?'
        },
        investor: {
          title: '💼 Візи для інвесторів',
          subtitle: 'E28A, E33A та порівняння',
          question: 'Які варіанти віз для інвесторів?'
        }
      },

      // Input area
      inputPlaceholder: 'Напишіть повідомлення...',
      voiceInputTitle: 'Голосовий ввід',
      sendButtonTitle: 'Надіслати повідомлення',

      // Buttons
      exportBtn: '📥 Експорт',

      // AI label
      aiLabel: 'Zantara:',

      // Messages
      typing: 'Друкує',
      errorMessage: 'Неможливо відповісти. Спробуйте ще раз.',

      // Citations
      citationsBadge: '📚 Джерела',
      sources: 'джерела',

      // Alerts
      voiceNotSupported: 'Голосовий ввід не підтримується в цьому браузері',

      // Login
      loginName: "Ім'я",
      loginEmail: 'Корпоративна електронна пошта',
      loginPin: 'PIN (6 цифр)',
      loginButton: 'Приєднатися до команди',
      loginTitle: 'Ласкаво просимо до Zantara',
      loginSubtitle: 'Розумна душа Bali Zero',

      // Language Selector
      languageSelector: 'Мова',
      changeLanguage: 'Змінити мову'
    }
  },

  // Supported languages with metadata
  supportedLanguages: {
    en: {
      code: 'en',
      name: 'English',
      flag: '🇬🇧',
      nativeName: 'English'
    },
    it: {
      code: 'it',
      name: 'Italian',
      flag: '🇮🇹',
      nativeName: 'Italiano'
    },
    id: {
      code: 'id',
      name: 'Indonesian',
      flag: '🇮🇩',
      nativeName: 'Bahasa Indonesia'
    },
    uk: {
      code: 'uk',
      name: 'Ukrainian',
      flag: '🇺🇦',
      nativeName: 'Українська'
    }
  },

  /**
   * Detect browser language
   * @returns {string} Language code (en, it, id)
   */
  detectBrowserLanguage() {
    const browserLang = navigator.language || navigator.userLanguage;
    const langCode = browserLang.split('-')[0].toLowerCase();

    // Map to supported languages
    if (langCode === 'it') return 'it';
    if (langCode === 'id') return 'id';
    
    // Default to English for all other languages
    return 'en';
  },

  /**
   * Get user's preferred language from localStorage
   * Priority: 1) Saved preference, 2) User object, 3) ALWAYS English (NO auto-detect)
   */
  getUserLanguage() {
    try {
      // Check localStorage preference
      const savedLang = localStorage.getItem('zantara-language');
      if (savedLang && this.supportedLanguages[savedLang]) {
        return savedLang;
      }

      // Check user object (legacy support)
      const userStr = localStorage.getItem('zantara-user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userLang = user.language || user.preferredLanguage;
        if (userLang && this.supportedLanguages[userLang]) {
          return userLang;
        }
      }

      // ALWAYS default to English (NO auto-detect)
      return 'en';
    } catch {
      return 'en'; // Fallback to English
    }
  },

  /**
   * Set user's preferred language
   * @param {string} lang - Language code (en, it, id)
   * @param {boolean} reload - Whether to reload translations (default: true)
   */
  setUserLanguage(lang, reload = true) {
    try {
      if (!this.supportedLanguages[lang]) {
        console.warn(`⚠️ Unsupported language: ${lang}, using English`);
        lang = 'en';
      }

      // Save to localStorage
      localStorage.setItem('zantara-language', lang);

      // Update user object if exists (legacy support)
      const userStr = localStorage.getItem('zantara-user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.language = lang;
        user.preferredLanguage = lang;
        localStorage.setItem('zantara-user', JSON.stringify(user));
      }

      console.log(`✅ Language set to: ${lang} (${this.supportedLanguages[lang].name})`);

      // Reload translations
      if (reload) {
        this.applyTranslations();
      }

      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('zantara:languageChanged', { 
        detail: { language: lang } 
      }));
    } catch (error) {
      console.error('Failed to set language:', error);
    }
  },

  /**
   * Translate a key path (supports nested keys with dot notation)
   */
  t(keyPath, lang = null) {
    const language = lang || this.getUserLanguage();
    const keys = keyPath.split('.');

    let value = this.translations[language];
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }

    // Fallback to Italian if translation not found
    if (value === undefined && language !== 'it') {
      value = this.translations.it;
      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }
    }

    return value || keyPath;
  },

  /**
   * Apply translations to the current page
   */
  applyTranslations() {
    const lang = this.getUserLanguage();
    console.log(`🌍 Applying translations for: ${lang}`);

    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key, lang);

      // Update text content or placeholder based on element type
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        if (el.hasAttribute('placeholder')) {
          el.placeholder = translation;
        } else {
          el.value = translation;
        }
      } else {
        el.textContent = translation;
      }
    });

    // Update suggested questions dynamically
    this.updateSuggestedQuestions(lang);
  },

  /**
   * Update suggested questions with translations
   */
  updateSuggestedQuestions(lang = null) {
    const language = lang || this.getUserLanguage();
    const questions = this.translations[language].suggestedQuestions;

    // KITAS question
    const kitasEl = document.querySelector('[data-question-id="kitas"]');
    if (kitasEl) {
      kitasEl.setAttribute('data-question', questions.kitas.question);
      kitasEl.querySelector('.suggested-question-title').textContent = questions.kitas.title;
      kitasEl.querySelector('.suggested-question-subtitle').textContent = questions.kitas.subtitle;
    }

    // Company question
    const companyEl = document.querySelector('[data-question-id="company"]');
    if (companyEl) {
      companyEl.setAttribute('data-question', questions.company.question);
      companyEl.querySelector('.suggested-question-title').textContent = questions.company.title;
      companyEl.querySelector('.suggested-question-subtitle').textContent = questions.company.subtitle;
    }

    // Investor question
    const investorEl = document.querySelector('[data-question-id="investor"]');
    if (investorEl) {
      investorEl.setAttribute('data-question', questions.investor.question);
      investorEl.querySelector('.suggested-question-title').textContent = questions.investor.title;
      investorEl.querySelector('.suggested-question-subtitle').textContent = questions.investor.subtitle;
    }
  }
};

// Make available globally
window.ZANTARA_I18N = ZANTARA_I18N;
