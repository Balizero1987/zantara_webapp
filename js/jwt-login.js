/**
 * JWT Login System
 * 
 * Handles JWT authentication with the backend.
 * Integrates with existing team login system.
 */

class JWTLogin {
  constructor() {
    this.apiBase = 'https://nuzantara-backend.fly.dev';
    this.isLoggedIn = false;
  }

  /**
   * Login with email and password
   */
  async login(email, password) {
    try {
      console.log('[JWT Login] Attempting login for:', email);
      
      const response = await fetch(`${this.apiBase}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.ok && data.data) {
        // Store tokens
        localStorage.setItem('zantara-auth-token', data.data.accessToken);
        localStorage.setItem('zantara-refresh-token', data.data.refreshToken);
        localStorage.setItem('zantara-user', JSON.stringify(data.data.user));
        
        this.isLoggedIn = true;
        
        console.log('[JWT Login] ✅ Login successful');
        
        return {
          success: true,
          user: data.data.user,
          message: 'Login successful'
        };
      } else {
        throw new Error(data.error || 'Login failed');
      }
      
    } catch (error) {
      console.error('[JWT Login] ❌ Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Logout
   */
  async logout() {
    try {
      const refreshToken = localStorage.getItem('zantara-refresh-token');
      
      if (refreshToken) {
        // Call logout endpoint
        await fetch(`${this.apiBase}/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('zantara-auth-token')}`
          },
          body: JSON.stringify({ refreshToken })
        });
      }
      
    } catch (error) {
      console.warn('[JWT Logout] Warning:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('zantara-auth-token');
      localStorage.removeItem('zantara-refresh-token');
      localStorage.removeItem('zantara-user');
      
      this.isLoggedIn = false;
      
      console.log('[JWT Logout] ✅ Logged out');
    }
  }

  /**
   * Check if user is logged in
   */
  isAuthenticated() {
    const token = localStorage.getItem('zantara-auth-token');
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get current user
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('zantara-user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get auth header
   */
  getAuthHeader() {
    const token = localStorage.getItem('zantara-auth-token');
    return token ? `Bearer ${token}` : null;
  }

  /**
   * Refresh token
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('zantara-refresh-token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await fetch(`${this.apiBase}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken })
      });
      
      if (!response.ok) {
        throw new Error('Token refresh failed');
      }
      
      const data = await response.json();
      
      if (data.ok && data.data) {
        localStorage.setItem('zantara-auth-token', data.data.accessToken);
        if (data.data.user) {
          localStorage.setItem('zantara-user', JSON.stringify(data.data.user));
        }
        
        console.log('[JWT] Token refreshed successfully');
        return true;
      }
      
      return false;
      
    } catch (error) {
      console.error('[JWT Refresh] Error:', error);
      return false;
    }
  }
}

// Create global instance
const jwtLogin = new JWTLogin();

// Export for global use
if (typeof window !== 'undefined') {
  window.JWTLogin = jwtLogin;
}

export default jwtLogin;
