/**
 * Theme Toggle Module
 * Switch between Dark and Light themes with persistence
 */

class ThemeToggle {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.createToggleButton();
        this.attachEventListeners();
    }

    loadTheme() {
        // Check localStorage first
        const saved = localStorage.getItem('zantara_theme');
        if (saved) return saved;

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        }

        return 'dark'; // Default
    }

    saveTheme(theme) {
        localStorage.setItem('zantara_theme', theme);
    }

    createToggleButton() {
        const button = document.createElement('button');
        button.id = 'themeToggleBtn';
        button.className = 'theme-toggle-btn';
        button.innerHTML = this.getIcon(this.currentTheme);
        button.title = 'Toggle theme (Ctrl+T)';

        // Add to top right corner
        const container = document.createElement('div');
        container.className = 'theme-toggle-container';
        container.appendChild(button);
        document.body.appendChild(container);
    }

    getIcon(theme) {
        if (theme === 'dark') {
            return `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
            `;
        } else {
            return `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"/>
                    <line x1="12" y1="1" x2="12" y2="3"/>
                    <line x1="12" y1="21" x2="12" y2="23"/>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                    <line x1="1" y1="12" x2="3" y2="12"/>
                    <line x1="21" y1="12" x2="23" y2="12"/>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
            `;
        }
    }

    attachEventListeners() {
        // Button click
        document.getElementById('themeToggleBtn').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Keyboard shortcut Ctrl+T
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 't') {
                e.preventDefault();
                this.toggleTheme();
            }
        });

        // Listen to system preference changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                if (!localStorage.getItem('zantara_theme')) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.currentTheme = newTheme;
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);

        // Update button icon
        document.getElementById('themeToggleBtn').innerHTML = this.getIcon(newTheme);

        // Show toast
        this.showToast(`${newTheme === 'dark' ? '🌙' : '☀️'} ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme activated`);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);

        if (theme === 'light') {
            this.applyLightTheme();
        } else {
            this.applyDarkTheme();
        }
    }

    applyDarkTheme() {
        const root = document.documentElement;
        root.style.setProperty('--black', '#090920');
        root.style.setProperty('--red', '#FF0000');
        root.style.setProperty('--cream', '#e8d5b7');
        root.style.setProperty('--gold', '#D4AF37');
        root.style.setProperty('--navy', '#1a1f3a');
        root.style.setProperty('--off-white', '#f5f5f5');
        root.style.setProperty('--bg-primary', '#090920');
        root.style.setProperty('--bg-secondary', '#1a1f3a');
        root.style.setProperty('--text-primary', '#f5f5f5');
        root.style.setProperty('--text-secondary', 'rgba(255, 255, 255, 0.7)');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
    }

    applyLightTheme() {
        const root = document.documentElement;
        root.style.setProperty('--black', '#f5f5f5');
        root.style.setProperty('--red', '#FF0000');
        root.style.setProperty('--cream', '#fdf8f3');
        root.style.setProperty('--gold', '#D4AF37');
        root.style.setProperty('--navy', '#ffffff');
        root.style.setProperty('--off-white', '#090920');
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f5f5f5');
        root.style.setProperty('--text-primary', '#090920');
        root.style.setProperty('--text-secondary', 'rgba(0, 0, 0, 0.7)');
        root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Initialize when DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.themeToggle = new ThemeToggle();
    });
} else {
    window.themeToggle = new ThemeToggle();
}
