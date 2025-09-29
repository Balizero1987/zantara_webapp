// Lightweight theme manager for Day/Night modes
class ThemeManager {
  constructor() {
    this.override = localStorage.getItem('zantara-theme-override') || '';
    this.currentTheme = localStorage.getItem('zantara-theme') || (this.override || this.computeBaliTheme());
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.createThemeToggle();
    this.scheduleAutoSwitch();
    // Day beams variant via query or localStorage (soft|power)
    try {
      const qp = new URLSearchParams(location.search).get('dayVariant');
      const pref = qp || localStorage.getItem('zantara-day-variant') || 'soft';
      document.body.setAttribute('data-day-variant', (pref === 'power') ? 'power' : 'soft');
      if (qp) localStorage.setItem('zantara-day-variant', pref);
    } catch (_) {}
  }

  // Compute theme by Bali timezone (WITA, UTC+8)
  computeBaliTheme() {
    try {
      const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Makassar' });
      const parts = fmt.format(new Date()).split(':');
      const hh = parseInt(parts[0], 10);
      const mm = parseInt(parts[1], 10);
      const minutes = (isNaN(hh) ? 0 : hh) * 60 + (isNaN(mm) ? 0 : mm);
      // Day: 06:00–18:00 (inclusive). Night: otherwise.
      return (minutes >= 360 && minutes <= 1080) ? 'day' : 'night';
    } catch (_) { return 'night'; }
  }

  // Schedule switch at next boundary (06:00 or 18:01 Bali time)
  scheduleAutoSwitch() {
    if (this.override) return; // manual override blocks auto
    try {
      const now = new Date();
      const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: 'Asia/Makassar' });
      const parts = fmt.format(now).split(':');
      const hh = parseInt(parts[0], 10);
      const mm = parseInt(parts[1], 10);
      const minutes = (isNaN(hh) ? 0 : hh) * 60 + (isNaN(mm) ? 0 : mm);
      // Next boundary in minutes-of-day
      const isDay = (minutes >= 360 && minutes <= 1080);
      const nextBoundary = isDay ? 1081 : 360; // 18:01 to move into night, 06:00 to day
      let delta = nextBoundary - minutes;
      if (delta <= 0) delta += 1440; // wrap to next day
      const ms = delta * 60 * 1000;
      setTimeout(() => {
        if (!this.override) {
          const t = this.computeBaliTheme();
          this.applyTheme(t);
          this.scheduleAutoSwitch();
        }
      }, Math.min(ms, 6 * 60 * 60 * 1000)); // cap at 6h for safety
    } catch (_) {}
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    document.querySelectorAll('.glass-card, .voice-button, .action-card, .message-bubble, .tool-card, .typing-dot, .input-area, .action-chip')
      .forEach(el => el.setAttribute('data-theme', theme));
    // Swap lotus asset per theme
    try {
      const headerLogo = document.querySelector('.lotus-logo');
      const splashLogo = document.querySelector('.lotus-splash');
      const day = 'assets/lotus-day.svg';
      const night = 'assets/lotus-night.svg';
      const src = theme === 'day' ? day : night;
      if (headerLogo) headerLogo.setAttribute('src', src);
      if (splashLogo) splashLogo.setAttribute('src', src);
    } catch (_) {}
    // Sync theme on FAB if present
    document.querySelectorAll('.theme-toggle-fab').forEach(el => el.setAttribute('data-theme', theme));
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
      'cursor:pointer', 'z-index:1000', 'font-size:24px', 'transition:all .3s ease', 'color:#fff'
    ].join(';');
    btn.title = 'Switch theme (Ctrl/Cmd+T). Long-press to return to Bali time auto.';
    btn.addEventListener('click', () => {
      const next = this.currentTheme === 'day' ? 'night' : 'day';
      this.override = next;
      try { localStorage.setItem('zantara-theme-override', this.override); } catch (_) {}
      this.applyTheme(next);
      btn.innerHTML = next === 'day' ? '🌙' : '☀️';
    });
    // Long-press (800ms) clears override and returns to auto (Bali time)
    let pressTimer = null;
    btn.addEventListener('mousedown', () => { pressTimer = setTimeout(() => { this.clearOverride(btn); }, 800); });
    ['mouseup','mouseleave'].forEach(ev => btn.addEventListener(ev, () => { if (pressTimer) { clearTimeout(pressTimer); pressTimer = null; } }));

    document.addEventListener('keydown', (e) => {
      if ((e.key === 't' || e.key === 'T') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); btn.click(); }
    });
    document.body.appendChild(btn);
  }

  clearOverride(btn) {
    this.override = '';
    try { localStorage.removeItem('zantara-theme-override'); } catch (_) {}
    const t = this.computeBaliTheme();
    this.applyTheme(t);
    if (btn) btn.innerHTML = t === 'day' ? '🌙' : '☀️';
    this.scheduleAutoSwitch();
  }
}

document.addEventListener('DOMContentLoaded', () => { new ThemeManager(); });
