/**
 * State Manager
 *
 * Centralized state management using Proxy for reactivity.
 * Implements pub-sub pattern for state change notifications.
 */

class StateManager {
  constructor() {
    this._state = {
      // User state
      user: null,
      isAuthenticated: false,

      // Chat state
      messages: [],
      currentView: 'chat',
      isTyping: false,
      streamingMessage: null,

      // UI state
      theme: 'dark',
      language: 'en',
      sidebarOpen: false,

      // Session state
      sessionId: null,
      lastActivity: Date.now(),
    };

    this._listeners = new Map();
    this._state = this._createReactiveState(this._state);
  }

  /**
   * Create reactive state using Proxy
   */
  _createReactiveState(obj, path = '') {
    const self = this;

    return new Proxy(obj, {
      set(target, property, value) {
        const oldValue = target[property];

        // Set new value
        target[property] = value;

        // Notify listeners
        const fullPath = path ? `${path}.${property}` : property;
        self._notifyListeners(fullPath, value, oldValue);

        return true;
      },

      get(target, property) {
        const value = target[property];

        // If value is object, make it reactive too
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          const fullPath = path ? `${path}.${property}` : property;
          return self._createReactiveState(value, fullPath);
        }

        return value;
      }
    });
  }

  /**
   * Get current state (read-only)
   */
  get state() {
    return this._state;
  }

  /**
   * Update state (batch updates)
   */
  setState(updates) {
    Object.keys(updates).forEach(key => {
      this._state[key] = updates[key];
    });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(path, callback) {
    if (!this._listeners.has(path)) {
      this._listeners.set(path, new Set());
    }
    this._listeners.get(path).add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this._listeners.get(path);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Notify listeners of state changes
   */
  _notifyListeners(path, newValue, oldValue) {
    // Notify exact path listeners
    const listeners = this._listeners.get(path);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (e) {
          console.error('State listener error:', e);
        }
      });
    }

    // Notify wildcard listeners
    const wildcardListeners = this._listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => {
        try {
          callback(newValue, oldValue, path);
        } catch (e) {
          console.error('State listener error:', e);
        }
      });
    }
  }

  /**
   * Add message to chat
   */
  addMessage(message) {
    this._state.messages = [...this._state.messages, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...message
    }];
  }

  /**
   * Clear chat messages
   */
  clearMessages() {
    this._state.messages = [];
  }

  /**
   * Set typing indicator
   */
  setTyping(isTyping) {
    this._state.isTyping = isTyping;
  }

  /**
   * Set current view
   */
  setView(view) {
    this._state.currentView = view;
  }

  /**
   * Set theme
   */
  setTheme(theme) {
    this._state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zantara-theme', theme);
  }

  /**
   * Set language
   */
  setLanguage(language) {
    this._state.language = language;
    localStorage.setItem('zantara-language', language);
  }

  /**
   * Set user
   */
  setUser(user) {
    this._state.user = user;
    this._state.isAuthenticated = !!user;
  }

  /**
   * Update last activity
   */
  updateActivity() {
    this._state.lastActivity = Date.now();
  }

  /**
   * Persist state to localStorage
   */
  persist() {
    const persistable = {
      theme: this._state.theme,
      language: this._state.language,
      messages: this._state.messages.slice(-50), // Keep last 50 messages
    };
    localStorage.setItem('zantara-state', JSON.stringify(persistable));
  }

  /**
   * Restore state from localStorage
   */
  restore() {
    const stored = localStorage.getItem('zantara-state');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.setState(parsed);
      } catch (e) {
        console.error('Failed to restore state:', e);
      }
    }
  }
}

// Export singleton instance
export const stateManager = new StateManager();
export default stateManager;