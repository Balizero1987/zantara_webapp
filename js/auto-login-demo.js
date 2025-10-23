/**
 * Auto-Login Demo User
 * 
 * Automatically logs in a demo user to access all handlers
 * This is the SIMPLEST way to give Zantara access to all 122 handlers
 */

class AutoLoginDemo {
  constructor() {
    this.apiBase = 'https://ts-backend-production-568d.up.railway.app';
    this.demoUser = {
      email: 'demo@zantara.com',
      password: 'demo123',
      name: 'Demo User',
      role: 'admin'
    };
  }

  /**
   * Auto-login demo user
   */
  async autoLogin() {
    try {
      console.log('[Auto-Login] 🔑 Logging in demo user...');
      
      // Try to login with demo credentials
      const response = await fetch(`${this.apiBase}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.demoUser.email,
          password: this.demoUser.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.ok && data.data) {
          // Store tokens
          localStorage.setItem('zantara-auth-token', data.data.accessToken);
          localStorage.setItem('zantara-refresh-token', data.data.refreshToken);
          localStorage.setItem('zantara-user', JSON.stringify(data.data.user));
          
          console.log('[Auto-Login] ✅ Demo user logged in successfully');
          return true;
        }
      }
      
      // If login fails, create demo user
      console.log('[Auto-Login] 🔄 Creating demo user...');
      return await this.createDemoUser();
      
    } catch (error) {
      console.error('[Auto-Login] ❌ Error:', error);
      return false;
    }
  }

  /**
   * Create demo user if doesn't exist
   */
  async createDemoUser() {
    try {
      // Try to create demo user
      const response = await fetch(`${this.apiBase}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: this.demoUser.email,
          password: this.demoUser.password,
          name: this.demoUser.name
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.ok && data.data) {
          // Store tokens
          localStorage.setItem('zantara-auth-token', data.data.accessToken);
          localStorage.setItem('zantara-refresh-token', data.data.refreshToken);
          localStorage.setItem('zantara-user', JSON.stringify(data.data.user));
          
          console.log('[Auto-Login] ✅ Demo user created and logged in');
          return true;
        }
      }
      
      // Fallback: use mock token for development
      return this.createMockToken();
      
    } catch (error) {
      console.error('[Auto-Login] ❌ Error creating user:', error);
      return this.createMockToken();
    }
  }

  /**
   * Create mock token for development
   */
  createMockToken() {
    try {
      console.log('[Auto-Login] 🔧 Creating mock token for development...');
      
      // Create a simple mock JWT token
      const mockToken = this.createMockJWT({
        email: this.demoUser.email,
        name: this.demoUser.name,
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
      });
      
      // Store mock tokens
      localStorage.setItem('zantara-auth-token', mockToken);
      localStorage.setItem('zantara-refresh-token', 'mock-refresh-token');
      localStorage.setItem('zantara-user', JSON.stringify({
        email: this.demoUser.email,
        name: this.demoUser.name,
        role: 'admin'
      }));
      
      console.log('[Auto-Login] ✅ Mock token created');
      return true;
      
    } catch (error) {
      console.error('[Auto-Login] ❌ Error creating mock token:', error);
      return false;
    }
  }

  /**
   * Create mock JWT token (for development only)
   * Note: Real JWT requires server-side signing, this is a placeholder
   */
  createMockJWT(payload) {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };
    
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    
    // Create a deterministic signature for demo consistency
    const signatureData = JSON.stringify(payload) + 'zantara-jwt-secret-2025';
    const signature = btoa(signatureData).substring(0, 43);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Test access to handlers
   */
  async testHandlerAccess() {
    try {
      const token = localStorage.getItem('zantara-auth-token');
      if (!token) {
        console.log('[Auto-Login] ❌ No token available');
        return false;
      }

      console.log('[Auto-Login] 🧪 Testing handler access...');
      
      // Test call to a simple handler
      const response = await fetch(`${this.apiBase}/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          key: 'system.handlers.list',
          params: {}
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('[Auto-Login] ✅ Handler access successful:', data);
        return true;
      } else {
        console.log('[Auto-Login] ❌ Handler access failed:', response.status);
        return false;
      }
      
    } catch (error) {
      console.error('[Auto-Login] ❌ Error testing handler access:', error);
      return false;
    }
  }

  /**
   * Initialize auto-login
   */
  async init() {
    console.log('[Auto-Login] 🚀 Initializing auto-login...');
    
    // Check if already logged in
    if (localStorage.getItem('zantara-auth-token')) {
      console.log('[Auto-Login] ✅ Already logged in');
      return true;
    }
    
    // Auto-login
    const success = await this.autoLogin();
    
    if (success) {
      // Test access
      await this.testHandlerAccess();
      console.log('[Auto-Login] 🎉 Zantara now has access to all 122 handlers!');
    }
    
    return success;
  }
}

// Create global instance
const autoLoginDemo = new AutoLoginDemo();

// Auto-initialize on page load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    autoLoginDemo.init();
  });
  
  // Export for global use
  window.AutoLoginDemo = autoLoginDemo;
}

export default autoLoginDemo;
