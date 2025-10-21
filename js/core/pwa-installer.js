/**
 * PWA Installer and Manager
 * 
 * Handles service worker registration and PWA install prompt.
 */

class PWAInstaller {
  constructor() {
    this.deferredPrompt = null;
    this.isInstalled = false;
    this.swRegistration = null;
    
    this.init();
  }

  async init() {
    // Check if already installed
    this.isInstalled = this.checkIfInstalled();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await this.registerServiceWorker();
        console.log('[PWA] Service worker registered');
      } catch (error) {
        console.error('[PWA] Service worker registration failed:', error);
      }
    }

    // Setup install prompt
    this.setupInstallPrompt();
    
    // Listen for updates
    this.setupUpdateListener();
  }

  async registerServiceWorker() {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/'
    });

    // Check for updates every hour
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);

    return registration;
  }

  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      // Prevent default install prompt
      event.preventDefault();
      
      // Store for later use
      this.deferredPrompt = event;
      
      // Show custom install button
      this.showInstallButton();
      
      console.log('[PWA] Install prompt available');
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed');
      this.isInstalled = true;
      this.hideInstallButton();
    });
  }

  setupUpdateListener() {
    if (!navigator.serviceWorker) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // New service worker has taken control
      this.showUpdateNotification();
    });
  }

  checkIfInstalled() {
    // Check if running in standalone mode (PWA installed)
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  async showInstallPrompt() {
    if (!this.deferredPrompt) {
      console.log('[PWA] Install prompt not available');
      return false;
    }

    // Show the install prompt
    this.deferredPrompt.prompt();

    // Wait for user response
    const choiceResult = await this.deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('[PWA] User accepted install');
      this.isInstalled = true;
    } else {
      console.log('[PWA] User dismissed install');
    }

    // Clear the prompt
    this.deferredPrompt = null;
    this.hideInstallButton();

    return choiceResult.outcome === 'accepted';
  }

  showInstallButton() {
    // Create install button if not exists
    let installBtn = document.getElementById('pwa-install-btn');
    
    if (!installBtn) {
      installBtn = document.createElement('button');
      installBtn.id = 'pwa-install-btn';
      installBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
        </svg>
        <span>Install App</span>
      `;
      installBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        z-index: 9999;
        animation: slideInUp 0.3s ease;
        transition: transform 0.2s, box-shadow 0.2s;
      `;

      installBtn.addEventListener('click', () => {
        this.showInstallPrompt();
      });

      installBtn.addEventListener('mouseenter', () => {
        installBtn.style.transform = 'translateY(-2px)';
        installBtn.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
      });

      installBtn.addEventListener('mouseleave', () => {
        installBtn.style.transform = 'translateY(0)';
        installBtn.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
      });

      document.body.appendChild(installBtn);
    }

    installBtn.style.display = 'flex';
  }

  hideInstallButton() {
    const installBtn = document.getElementById('pwa-install-btn');
    if (installBtn) {
      installBtn.style.display = 'none';
    }
  }

  showUpdateNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      max-width: 400px;
      background: rgba(59, 130, 246, 0.95);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      backdrop-filter: blur(10px);
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="font-size: 24px;">🔄</div>
        <div style="flex: 1;">
          <div style="font-weight: 600; margin-bottom: 6px;">Update Available</div>
          <div style="font-size: 14px; opacity: 0.95; margin-bottom: 12px;">
            A new version of ZANTARA is available.
          </div>
          <button onclick="window.location.reload()" 
                  style="background: white; color: #3b82f6; border: none; 
                         padding: 8px 16px; border-radius: 6px; font-weight: 600; 
                         cursor: pointer; font-size: 13px;">
            Reload Now
          </button>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: white; 
                       cursor: pointer; font-size: 24px; padding: 0;">
          ×
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 30 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 30000);
  }

  async getCacheSize() {
    if (!this.swRegistration) return 0;

    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.size);
      };

      this.swRegistration.active.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      );
    });
  }

  async clearCache() {
    if (!this.swRegistration) return;

    this.swRegistration.active.postMessage({ type: 'CLEAR_CACHE' });
    console.log('[PWA] Cache cleared');
  }

  getStatus() {
    return {
      installed: this.isInstalled,
      swRegistered: !!this.swRegistration,
      updateAvailable: false, // Would need more complex logic
      canInstall: !!this.deferredPrompt
    };
  }
}

// CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInUp {
    from {
      transform: translateY(100px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @keyframes slideInRight {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Export singleton
export const pwaInstaller = new PWAInstaller();

// Expose globally
if (typeof window !== 'undefined') {
  window.ZANTARA_PWA = {
    install: () => pwaInstaller.showInstallPrompt(),
    getStatus: () => pwaInstaller.getStatus(),
    getCacheSize: () => pwaInstaller.getCacheSize(),
    clearCache: () => pwaInstaller.clearCache()
  };
}

export default pwaInstaller;
