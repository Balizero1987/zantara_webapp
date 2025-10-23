/**
 * I18n Service - Multi-language support
 * Supporto IT/EN/ID per ZANTARA webapp
 */

class I18nService {
    constructor() {
        this.currentLang = 'it'; // Default italiano
        this.fallbackLang = 'en';
        
        this.translations = {
            it: {
                // Common
                'common.welcome': 'Benvenuto',
                'common.loading': 'Caricamento...',
                'common.error': 'Errore',
                'common.success': 'Successo',
                'common.cancel': 'Annulla',
                'common.confirm': 'Conferma',
                'common.save': 'Salva',
                'common.delete': 'Elimina',
                
                // Login
                'login.title': 'Accedi a ZANTARA',
                'login.email': 'Email aziendale',
                'login.pin': 'PIN (6 cifre)',
                'login.button': 'Accedi al Team',
                'login.error': 'Credenziali non valide',
                
                // Chat
                'chat.title': 'Chat con ZANTARA',
                'chat.placeholder': 'Scrivi un messaggio...',
                'chat.send': 'Invia',
                'chat.thinking': 'Sto pensando...',
                'chat.welcome': "L'anima intelligente di Bali Zero",
                
                // Dashboard
                'dashboard.title': 'Dashboard',
                'dashboard.handlers': 'Handlers Disponibili',
                'dashboard.team': 'Team Members Attivi',
                'dashboard.conversations': 'Conversazioni Oggi',
                'dashboard.performance': 'Performance',
                
                // Errors
                'error.network': 'Errore di rete. Riprova.',
                'error.auth': 'Autenticazione fallita',
                'error.generic': 'Qualcosa è andato storto'
            },
            
            en: {
                // Common
                'common.welcome': 'Welcome',
                'common.loading': 'Loading...',
                'common.error': 'Error',
                'common.success': 'Success',
                'common.cancel': 'Cancel',
                'common.confirm': 'Confirm',
                'common.save': 'Save',
                'common.delete': 'Delete',
                
                // Login
                'login.title': 'Login to ZANTARA',
                'login.email': 'Business email',
                'login.pin': 'PIN (6 digits)',
                'login.button': 'Login to Team',
                'login.error': 'Invalid credentials',
                
                // Chat
                'chat.title': 'Chat with ZANTARA',
                'chat.placeholder': 'Type a message...',
                'chat.send': 'Send',
                'chat.thinking': 'Thinking...',
                'chat.welcome': "The intelligent soul of Bali Zero",
                
                // Dashboard
                'dashboard.title': 'Dashboard',
                'dashboard.handlers': 'Available Handlers',
                'dashboard.team': 'Active Team Members',
                'dashboard.conversations': 'Conversations Today',
                'dashboard.performance': 'Performance',
                
                // Errors
                'error.network': 'Network error. Please try again.',
                'error.auth': 'Authentication failed',
                'error.generic': 'Something went wrong'
            },
            
            id: {
                // Common
                'common.welcome': 'Selamat datang',
                'common.loading': 'Memuat...',
                'common.error': 'Kesalahan',
                'common.success': 'Berhasil',
                'common.cancel': 'Batal',
                'common.confirm': 'Konfirmasi',
                'common.save': 'Simpan',
                'common.delete': 'Hapus',
                
                // Login
                'login.title': 'Masuk ke ZANTARA',
                'login.email': 'Email perusahaan',
                'login.pin': 'PIN (6 digit)',
                'login.button': 'Masuk ke Tim',
                'login.error': 'Kredensial tidak valid',
                
                // Chat
                'chat.title': 'Chat dengan ZANTARA',
                'chat.placeholder': 'Ketik pesan...',
                'chat.send': 'Kirim',
                'chat.thinking': 'Sedang berpikir...',
                'chat.welcome': "Jiwa cerdas Bali Zero",
                
                // Dashboard
                'dashboard.title': 'Dasbor',
                'dashboard.handlers': 'Handler Tersedia',
                'dashboard.team': 'Anggota Tim Aktif',
                'dashboard.conversations': 'Percakapan Hari Ini',
                'dashboard.performance': 'Performa',
                
                // Errors
                'error.network': 'Kesalahan jaringan. Silakan coba lagi.',
                'error.auth': 'Autentikasi gagal',
                'error.generic': 'Terjadi kesalahan'
            }
        };
        
        // Auto-detect language from browser
        this.detectLanguage();
        
        console.log('🌐 I18n Service initialized');
        console.log('   Current language:', this.currentLang);
    }
    
    /**
     * Detect browser language
     */
    detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const lang = browserLang.split('-')[0]; // 'it-IT' -> 'it'
        
        // Check if we support this language
        if (this.translations[lang]) {
            this.currentLang = lang;
        } else {
            // Check localStorage preference
            const savedLang = localStorage.getItem('zantara-language');
            if (savedLang && this.translations[savedLang]) {
                this.currentLang = savedLang;
            }
        }
    }
    
    /**
     * Get translation for key
     */
    t(key, fallback = key) {
        const lang = this.translations[this.currentLang];
        if (lang && lang[key]) {
            return lang[key];
        }
        
        // Try fallback language
        const fallbackLangData = this.translations[this.fallbackLang];
        if (fallbackLangData && fallbackLangData[key]) {
            return fallbackLangData[key];
        }
        
        return fallback;
    }
    
    /**
     * Change language
     */
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLang = lang;
            localStorage.setItem('zantara-language', lang);
            console.log(`🌐 Language changed to: ${lang}`);
            
            // Trigger re-render event
            window.dispatchEvent(new CustomEvent('language-changed', { detail: { lang } }));
            
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
     * Get available languages
     */
    getAvailableLanguages() {
        return Object.keys(this.translations);
    }
    
    /**
     * Translate all elements with data-i18n attribute
     */
    translatePage() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
        
        console.log('🌐 Page translated to:', this.currentLang);
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nService;
} else {
    window.I18nService = I18nService;
}

