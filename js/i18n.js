/**
 * ZANTARA Internationalization (i18n)
 * Supporta IT (Italiano) e ID (Bahasa Indonesia)
 */

const ZANTARA_I18N = {
  translations: {
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
      loginSubtitle: "L'anima intelligente di Bali Zero"
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
      loginSubtitle: 'Jiwa Cerdas dari Bali Zero'
    }
  },

  /**
   * Get user's preferred language from localStorage
   * Default: 'it' (italiano)
   */
  getUserLanguage() {
    try {
      const userStr = localStorage.getItem('zantara-user');
      if (!userStr) return 'it';

      const user = JSON.parse(userStr);
      return user.language || user.preferredLanguage || 'it';
    } catch {
      return 'it';
    }
  },

  /**
   * Set user's preferred language
   */
  setUserLanguage(lang) {
    try {
      const userStr = localStorage.getItem('zantara-user');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      user.language = lang;
      user.preferredLanguage = lang;
      localStorage.setItem('zantara-user', JSON.stringify(user));

      console.log(`✅ Language set to: ${lang}`);
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
