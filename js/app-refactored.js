/**
 * ZANTARA Application - Refactored
 *
 * Modular architecture with separation of concerns:
 * - API Client: HTTP communication
 * - State Manager: Centralized state with reactivity
 * - Router: SPA navigation
 * - Components: UI modules (Chat, Dashboard, etc.)
 * - JWT Service: Authentication
 */

import { config } from './config.js';
import { jwtService } from './auth/jwt-service.js';
import { apiClient } from './core/api-client.js';
import { stateManager } from './core/state-manager.js';
import { router } from './core/router.js';
import { ChatComponent } from './components/ChatComponent.js';

class ZantaraApp {
  constructor() {
    this.initialized = false;
    this.currentComponent = null;
  }

  /**
   * Initialize application
   */
  async init() {
    if (this.initialized) return;

    console.log('🚀 Initializing ZANTARA v5.2.0 (Refactored)');

    // Check authentication
    if (!jwtService.isAuthenticated()) {
      this._redirectToLogin();
      return;
    }

    // Restore persisted state
    stateManager.restore();

    // Set user in state
    const user = jwtService.getUser();
    stateManager.setUser(user);

    // Initialize theme
    this._initTheme();

    // Initialize router
    this._initRouter();

    // Setup session management
    this._setupSessionManagement();

    // Setup global error handling
    this._setupErrorHandling();

    // Health check
    await this._healthCheck();

    // Mark as initialized
    this.initialized = true;

    console.log('✅ ZANTARA initialized successfully');

    // Navigate to current route
    const path = window.location.pathname;
    router.navigate(path || '/chat', false);
  }

  /**
   * Initialize router with routes
   */
  _initRouter() {
    router.registerRoutes({
      '/chat': () => this._loadChatView(),
      '/dashboard': () => this._loadDashboardView(),
      '/team': () => this._loadTeamView(),
      '/settings': () => this._loadSettingsView(),
    });

    // Authentication guard
    router.beforeEach((to, from) => {
      if (!jwtService.isAuthenticated()) {
        this._redirectToLogin();
        return false;
      }
      return true;
    });

    // Activity tracking
    router.afterEach(() => {
      stateManager.updateActivity();
    });
  }

  /**
   * Load chat view
   */
  _loadChatView() {
    const container = document.getElementById('app-container');
    if (!container) return;

    // Destroy current component
    if (this.currentComponent?.destroy) {
      this.currentComponent.destroy();
    }

    // Create chat component
    this.currentComponent = new ChatComponent(container);
    this.currentComponent.init();

    stateManager.setView('chat');
  }

  /**
   * Load dashboard view (placeholder)
   */
  _loadDashboardView() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = `
      <div class="dashboard-view">
        <h1>Dashboard</h1>
        <p>Dashboard functionality coming soon...</p>
      </div>
    `;

    stateManager.setView('dashboard');
  }

  /**
   * Load team view (placeholder)
   */
  _loadTeamView() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = `
      <div class="team-view">
        <h1>Team</h1>
        <p>Team management coming soon...</p>
      </div>
    `;

    stateManager.setView('team');
  }

  /**
   * Load settings view (placeholder)
   */
  _loadSettingsView() {
    const container = document.getElementById('app-container');
    if (!container) return;

    container.innerHTML = `
      <div class="settings-view">
        <h1>Settings</h1>
        <p>Settings coming soon...</p>
      </div>
    `;

    stateManager.setView('settings');
  }

  /**
   * Initialize theme
   */
  _initTheme() {
    const savedTheme = localStorage.getItem('zantara-theme') || 'dark';
    stateManager.setTheme(savedTheme);

    // Listen for theme changes
    stateManager.subscribe('theme', (theme) => {
      document.documentElement.setAttribute('data-theme', theme);
    });
  }

  /**
   * Setup session management
   */
  _setupSessionManagement() {
    // Auto-save state periodically
    setInterval(() => {
      if (stateManager.state.isAuthenticated) {
        stateManager.persist();
      }
    }, 60000); // Every minute

    // Session timeout warning
    const checkSession = () => {
      const idle = Date.now() - stateManager.state.lastActivity;
      const warningTime = config.session.idleTimeout - config.session.warningTime;

      if (idle > config.session.idleTimeout) {
        this._handleSessionTimeout();
      } else if (idle > warningTime && !this.sessionWarningShown) {
        this._showSessionWarning();
        this.sessionWarningShown = true;
      }
    };

    setInterval(checkSession, 60000); // Check every minute
  }

  /**
   * Handle session timeout
   */
  async _handleSessionTimeout() {
    console.warn('Session timeout');
    await jwtService.logout();
    this._redirectToLogin('Session expired due to inactivity');
  }

  /**
   * Show session warning
   */
  _showSessionWarning() {
    // TODO: Implement toast notification
    console.warn('Session expiring soon');
  }

  /**
   * Setup global error handling
   */
  _setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      // TODO: Send to error tracking service
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      // TODO: Send to error tracking service
    });
  }

  /**
   * Health check
   */
  async _healthCheck() {
    try {
      const isHealthy = await apiClient.healthCheck();
      if (!isHealthy) {
        console.warn('Backend health check failed');
        // TODO: Show notification
      }
    } catch (e) {
      console.error('Health check error:', e);
    }
  }

  /**
   * Redirect to login
   */
  _redirectToLogin(message) {
    const params = message ? `?message=${encodeURIComponent(message)}` : '';
    window.location.href = `/login-claude-style.html${params}`;
  }

  /**
   * Logout
   */
  async logout() {
    await jwtService.logout();
    stateManager.clearMessages();
    stateManager.setUser(null);
    this._redirectToLogin();
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.zantaraApp = new ZantaraApp();
    window.zantaraApp.init();
  });
} else {
  window.zantaraApp = new ZantaraApp();
  window.zantaraApp.init();
}

// Export for external use
export default ZantaraApp;