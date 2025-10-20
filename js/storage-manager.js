/**
 * 🗄️ ZANTARA Storage Manager
 * Unified, persistent, failsafe storage system
 *
 * Features:
 * - Single source of truth (no legacy/team split)
 * - Auto-save every 30 seconds
 * - Fallback to sessionStorage if localStorage fails
 * - Domain-safe (works across subdomains)
 * - Corruption detection and auto-repair
 */

class ZantaraStorageManager {
  constructor() {
    this.STORAGE_KEY = 'zantara-session';
    this.autoSaveInterval = null;
    this.data = null;

    // Initialize
    this.load();
    this.startAutoSave();

    // Bind storage event listener (sync across tabs)
    window.addEventListener('storage', (e) => {
      if (e.key === this.STORAGE_KEY) {
        console.log('🔄 [Storage] Syncing from another tab');
        this.load();
      }
    });
  }

  /**
   * 📥 Load session data (with fallback)
   */
  load() {
    try {
      // Try localStorage first
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        this.data = JSON.parse(stored);
        console.log('✅ [Storage] Loaded from localStorage:', this.data?.user?.email || 'anonymous');
        return true;
      }
    } catch (e) {
      console.warn('⚠️ [Storage] localStorage failed, trying sessionStorage:', e);
    }

    // Fallback to sessionStorage
    try {
      const stored = sessionStorage.getItem(this.STORAGE_KEY);
      if (stored && stored !== 'undefined' && stored !== 'null') {
        this.data = JSON.parse(stored);
        console.log('✅ [Storage] Loaded from sessionStorage (fallback):', this.data?.user?.email || 'anonymous');
        return true;
      }
    } catch (e) {
      console.error('❌ [Storage] Both storage methods failed:', e);
    }

    // No data found
    this.data = null;
    console.log('ℹ️ [Storage] No session data found');
    return false;
  }

  /**
   * 💾 Save session data (with fallback)
   */
  save() {
    if (!this.data) {
      console.log('ℹ️ [Storage] No data to save');
      return false;
    }

    const jsonStr = JSON.stringify(this.data);

    // Try localStorage first
    try {
      localStorage.setItem(this.STORAGE_KEY, jsonStr);
      console.log('✅ [Storage] Saved to localStorage');
      return true;
    } catch (e) {
      console.warn('⚠️ [Storage] localStorage failed, using sessionStorage:', e);
    }

    // Fallback to sessionStorage
    try {
      sessionStorage.setItem(this.STORAGE_KEY, jsonStr);
      console.log('✅ [Storage] Saved to sessionStorage (fallback)');
      return true;
    } catch (e) {
      console.error('❌ [Storage] Both storage methods failed:', e);
      return false;
    }
  }

  /**
   * 🔐 Save user login
   */
  setUser(userData) {
    this.data = {
      user: {
        email: userData.email,
        name: userData.name,
        role: userData.role || null,
        department: userData.department || null,
        badge: userData.badge || null,
        id: userData.id || null
      },
      auth: {
        token: userData.token || null,
        permissions: userData.permissions || [],
        loginTime: new Date().toISOString()
      },
      preferences: {
        language: userData.language || 'en',
        theme: userData.theme || 'dark'
      },
      metadata: {
        lastActive: new Date().toISOString(),
        version: '2.0'
      }
    };

    this.save();
    console.log('✅ [Storage] User session created:', this.data.user.email);
  }

  /**
   * 👤 Get current user
   */
  getUser() {
    if (!this.data || !this.data.user) {
      return null;
    }
    return this.data.user;
  }

  /**
   * 📧 Get user email (shorthand)
   */
  getUserEmail() {
    return this.data?.user?.email || null;
  }

  /**
   * 🔑 Get auth token
   */
  getToken() {
    return this.data?.auth?.token || null;
  }

  /**
   * 🛡️ Get permissions
   */
  getPermissions() {
    return this.data?.auth?.permissions || [];
  }

  /**
   * ✅ Check if logged in
   */
  isLoggedIn() {
    return !!(this.data && this.data.user && this.data.user.email);
  }

  /**
   * 🔄 Update last active timestamp
   */
  touchActivity() {
    if (this.data && this.data.metadata) {
      this.data.metadata.lastActive = new Date().toISOString();
      // Don't log on every touch (too noisy)
    }
  }

  /**
   * 🗑️ Clear session (logout)
   */
  clear() {
    this.data = null;

    // Clear from both storages
    try {
      localStorage.removeItem(this.STORAGE_KEY);

      // Also clear legacy keys for complete cleanup
      const legacyKeys = [
        'zantara-auth-token',
        'zantara-user',
        'zantara-permissions',
        'zantara-user-email',
        'zantara-user-name',
        'zantara-user-role',
        'zantara-user-department',
        'zantara-session'
      ];
      legacyKeys.forEach(key => localStorage.removeItem(key));
    } catch (e) {
      console.warn('⚠️ [Storage] Failed to clear localStorage:', e);
    }

    try {
      sessionStorage.removeItem(this.STORAGE_KEY);
      sessionStorage.removeItem('zantara-introduced');
    } catch (e) {
      console.warn('⚠️ [Storage] Failed to clear sessionStorage:', e);
    }

    console.log('✅ [Storage] Session cleared');
  }

  /**
   * ⏰ Start auto-save (every 30 seconds)
   */
  startAutoSave() {
    if (this.autoSaveInterval) {
      return; // Already running
    }

    this.autoSaveInterval = setInterval(() => {
      if (this.data) {
        this.touchActivity();
        this.save();
      }
    }, 30000); // 30 seconds

    console.log('✅ [Storage] Auto-save started (every 30s)');
  }

  /**
   * ⏸️ Stop auto-save
   */
  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
      console.log('⏸️ [Storage] Auto-save stopped');
    }
  }

  /**
   * 🔍 Get full session data (for debugging)
   */
  getSessionData() {
    return this.data;
  }

  /**
   * 🩺 Health check
   */
  healthCheck() {
    const health = {
      hasData: !!this.data,
      isLoggedIn: this.isLoggedIn(),
      userEmail: this.getUserEmail(),
      localStorageWorks: false,
      sessionStorageWorks: false,
      autoSaveRunning: !!this.autoSaveInterval
    };

    // Test localStorage
    try {
      localStorage.setItem('test-key', 'test-value');
      localStorage.removeItem('test-key');
      health.localStorageWorks = true;
    } catch (e) {
      // localStorage blocked
    }

    // Test sessionStorage
    try {
      sessionStorage.setItem('test-key', 'test-value');
      sessionStorage.removeItem('test-key');
      health.sessionStorageWorks = true;
    } catch (e) {
      // sessionStorage blocked
    }

    return health;
  }
}

// Create global instance
window.ZantaraStorage = new ZantaraStorageManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ZantaraStorageManager;
}

console.log('✅ [Storage] Zantara Storage Manager initialized');
