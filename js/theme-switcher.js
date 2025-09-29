// Lightweight theme manager for Day/Night modes
class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('zantara-theme') || 'night';
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.createThemeToggle();
    this.detectSystemPreference();
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    // Update core components to allow attribute-based theming
    document.querySelectorAll('.glass-card, .voice-button, .action-card, .message-bubble, .tool-card, .typing-dot')
      .forEach(el => el.setAttribute('data-theme', theme));
    this.currentTheme = theme;
    try { localStorage.setItem('zantara-theme', theme); } catch (_) {}
  }

  createThemeToggle() {
    const btn = document.createElement('button');
    btn.className = 'theme-toggle-fab';
    btn.innerHTML = this.currentTheme === 'day' ? '🌙' : '☀️';
    btn.style.cssText = [
      'position:fixed', 'top:20px', 'right:20px', 'width:50px', 'height:50px', 'border-radius:50%',
      'background: var(--primary-gradient)', 'border:none', 'box-shadow: var(--glass-shadow)',
      'cursor:pointer', 'z-index:1000', 'font-size:24px', 'transition:all .3s ease',
      'color:#fff'
    ].join(';');
    btn.addEventListener('click', () => {
      const next = this.currentTheme === 'day' ? 'night' : 'day';
      this.applyTheme(next);
      btn.innerHTML = next === 'day' ? '🌙' : '☀️';
    });
    document.addEventListener('keydown', (e) => {
      if ((e.key === 't' || e.key === 'T') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault(); btn.click();
      }
    });
    document.body.appendChild(btn);
  }

  detectSystemPreference() {
    try {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        if (!localStorage.getItem('zantara-theme')) this.applyTheme('day');
      }
    } catch (_) {}
  }
}

document.addEventListener('DOMContentLoaded', () => { new ThemeManager(); });

