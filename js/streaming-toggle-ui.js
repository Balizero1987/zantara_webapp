// ZANTARA Streaming Toggle UI Component
// Adds a toggle in the UI to enable/disable streaming mode

class StreamingToggleUI {
  constructor() {
    this.isEnabled = false;
    this.toggleElement = null;
  }

  init() {
    // Check saved state
    this.isEnabled = localStorage.getItem('zantara-streaming') === 'true';

    // Check URL params
    const params = new URLSearchParams(window.location.search);
    if (params.has('streaming')) {
      this.isEnabled = params.get('streaming') === 'true';
      localStorage.setItem('zantara-streaming', this.isEnabled ? 'true' : 'false');
    }

    // Only show in dev mode
    const isDev = window.location.hostname === 'localhost' ||
                  window.location.hostname === '127.0.0.1' ||
                  params.get('dev') === 'true';

    if (isDev) {
      this.createToggle();
    }
  }

  createToggle() {
    // Check if toggle already exists
    if (document.getElementById('streaming-toggle-container')) return;

    const container = document.createElement('div');
    container.id = 'streaming-toggle-container';
    container.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 20px;
      background: white;
      border-radius: 12px;
      padding: 12px 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 1000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      transition: all 0.3s ease;
    `;

    const label = document.createElement('span');
    label.textContent = 'POST Streaming';
    label.style.cssText = `
      color: #374151;
      font-weight: 500;
    `;

    const toggleWrapper = document.createElement('div');
    toggleWrapper.style.cssText = `
      position: relative;
      width: 48px;
      height: 24px;
      background: ${this.isEnabled ? '#3b82f6' : '#d1d5db'};
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.3s ease;
    `;

    const toggleSlider = document.createElement('div');
    toggleSlider.style.cssText = `
      position: absolute;
      width: 20px;
      height: 20px;
      background: white;
      border-radius: 50%;
      top: 2px;
      left: ${this.isEnabled ? '26px' : '2px'};
      transition: left 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;

    const status = document.createElement('span');
    status.id = 'streaming-status';
    status.textContent = this.isEnabled ? 'ON' : 'OFF';
    status.style.cssText = `
      color: ${this.isEnabled ? '#059669' : '#6b7280'};
      font-weight: 600;
      font-size: 12px;
      background: ${this.isEnabled ? '#d1fae5' : '#f3f4f6'};
      padding: 2px 8px;
      border-radius: 4px;
    `;

    toggleWrapper.appendChild(toggleSlider);

    toggleWrapper.addEventListener('click', () => {
      this.toggle();

      // Update visual state
      const newState = this.isEnabled;
      toggleWrapper.style.background = newState ? '#3b82f6' : '#d1d5db';
      toggleSlider.style.left = newState ? '26px' : '2px';
      status.textContent = newState ? 'ON' : 'OFF';
      status.style.color = newState ? '#059669' : '#6b7280';
      status.style.background = newState ? '#d1fae5' : '#f3f4f6';

      // Show confirmation
      this.showToast(newState ? 'Streaming enabled' : 'Streaming disabled');
    });

    container.appendChild(label);
    container.appendChild(toggleWrapper);
    container.appendChild(status);

    // Add info icon
    const infoIcon = document.createElement('div');
    infoIcon.innerHTML = '?';
    infoIcon.style.cssText = `
      width: 18px;
      height: 18px;
      background: #e5e7eb;
      color: #6b7280;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      cursor: help;
      font-weight: bold;
    `;
    infoIcon.title = 'When enabled, uses POST streaming for AI responses with web search support';
    container.appendChild(infoIcon);

    document.body.appendChild(container);
    this.toggleElement = container;
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    localStorage.setItem('zantara-streaming', this.isEnabled ? 'true' : 'false');

    // Update app if available
    if (window.zantaraApp) {
      window.zantaraApp.useStreaming = this.isEnabled;
    }

    // Emit event
    window.dispatchEvent(new CustomEvent('streaming-toggle', {
      detail: { enabled: this.isEnabled }
    }));
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 150px;
      right: 20px;
      background: #1f2937;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease, slideOut 0.3s ease 2s forwards;
    `;

    // Add animation styles if not present
    if (!document.getElementById('streaming-toast-styles')) {
      const style = document.createElement('style');
      style.id = 'streaming-toast-styles';
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 2500);
  }

  getIsEnabled() {
    return this.isEnabled;
  }

  destroy() {
    if (this.toggleElement) {
      this.toggleElement.remove();
      this.toggleElement = null;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const toggleUI = new StreamingToggleUI();
    toggleUI.init();
    window.ZANTARA_STREAMING_TOGGLE = toggleUI;
  });
} else {
  const toggleUI = new StreamingToggleUI();
  toggleUI.init();
  window.ZANTARA_STREAMING_TOGGLE = toggleUI;
}