/**
 * JWT Authentication Service
 *
 * Handles JWT token management, refresh, and validation.
 * Implements secure authentication flow with token rotation.
 */

import { config } from '../config.js';

class JWTService {
  constructor() {
    this.tokenKey = config.auth.tokenKey;
    this.refreshTokenKey = config.auth.refreshTokenKey;
    this.userKey = config.auth.userKey;
    this.refreshPromise = null;
  }

  /**
   * Store authentication tokens
   */
  setTokens(accessToken, refreshToken, user) {
    localStorage.setItem(this.tokenKey, accessToken);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
    if (user) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  /**
   * Get current access token
   */
  getAccessToken() {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Get current refresh token
   */
  getRefreshToken() {
    return localStorage.getItem(this.refreshTokenKey);
  }

  /**
   * Get current user data
   */
  getUser() {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Clear all authentication data
   */
  clearAuth() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    // Also clear old session data
    localStorage.removeItem('zantara-user-email');
    localStorage.removeItem('zantara-session-id');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = this.getAccessToken();
    if (!token) return false;

    // Check if token is expired
    try {
      const payload = this.decodeToken(token);
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (e) {
      return false;
    }
  }

  /**
   * Decode JWT token (without verification - that's done server-side)
   */
  decodeToken(token) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  }

  /**
   * Check if token needs refresh (5 minutes buffer)
   */
  needsRefresh() {
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      const now = Date.now() / 1000;
      const buffer = config.auth.expiryBuffer;
      return payload.exp < (now + buffer);
    } catch (e) {
      return true;
    }
  }

  /**
   * Refresh access token using refresh token
   * Prevents multiple simultaneous refresh requests
   */
  async refreshAccessToken() {
    // If refresh is already in progress, return the same promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this._performRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  async _performRefresh() {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${config.api.proxyUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Store new tokens
      this.setTokens(data.accessToken, data.refreshToken || refreshToken, data.user);

      return data.accessToken;
    } catch (error) {
      // Refresh failed - clear auth and redirect to login
      this.clearAuth();
      throw error;
    }
  }

  /**
   * Login with email/password
   */
  async login(email, password) {
    try {
      const response = await fetch(`${config.api.proxyUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();

      // Store tokens
      this.setTokens(data.accessToken, data.refreshToken, data.user);

      return data.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout() {
    const refreshToken = this.getRefreshToken();

    // Call logout endpoint (optional - for token blacklisting)
    if (refreshToken) {
      try {
        await fetch(`${config.api.proxyUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getAccessToken()}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (e) {
        // Ignore errors - still clear local auth
      }
    }

    this.clearAuth();
  }

  /**
   * Get authorization header with auto-refresh
   */
  async getAuthHeader() {
    // Check if token needs refresh
    if (this.needsRefresh()) {
      try {
        await this.refreshAccessToken();
      } catch (e) {
        // Refresh failed - user needs to re-login
        window.location.href = '/login.html';
        throw new Error('Session expired');
      }
    }

    const token = this.getAccessToken();
    return token ? `Bearer ${token}` : null;
  }
}

// Export singleton instance
export const jwtService = new JWTService();
export default jwtService;