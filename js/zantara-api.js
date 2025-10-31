/**
 * ZANTARA API Layer - Clean & Simple
 * Allineato con backend Fly.io (Ottobre 2025)
 * 
 * Backend:
 * - TS-BACKEND: https://nuzantara-backend.fly.dev
 * - RAG-BACKEND: https://nuzantara-rag.fly.dev
 * 
 * Auth: Demo auth middleware (no API key needed)
 * Contracts: API versioning and fallback system
 */

const ZANTARA_API = {
  // Backend URLs (Fly.io deployment - Oct 29, 2025)
  backends: {
    ts: 'https://nuzantara-backend.fly.dev',
    rag: 'https://nuzantara-rag.fly.dev'
  },
  
  /**
   * Team Login (with API Contracts fallback)
   */
  async teamLogin(email, pin, name) {
    try {
      // Try with API Contracts first (resilient)
      if (window.API_CONTRACTS) {
        console.log('🔄 Using API Contracts for login...');
        
        const data = await window.API_CONTRACTS.callWithFallback('ts', '/team.login', {
          method: 'POST',
          body: JSON.stringify({ email, pin, name })
        });
        
        if (data.success) {
          this._saveLoginData(data);
          return { success: true, user: data.user, message: data.personalizedResponse };
        }
        
        return { success: false, error: 'Login failed' };
      }
      
      // Fallback to direct call (legacy)
      console.log('⚠️ Using legacy API call (no contracts)');
      const response = await fetch(`${this.backends.ts}/team.login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin, name })
      });
      
      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        this._saveLoginData(data);
        return { success: true, user: data.user, message: data.personalizedResponse };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Save login data to localStorage
   */
  _saveLoginData(data) {
    localStorage.setItem('zantara-session', data.sessionId);
    localStorage.setItem('zantara-token', data.token); // JWT token for API calls
    localStorage.setItem('zantara-user', JSON.stringify(data.user));
    localStorage.setItem('zantara-email', data.user.email);
    localStorage.setItem('zantara-name', data.user.name);
    
    console.log('✅ Login successful:', data.user.name);
    console.log('🔑 JWT Token saved');
  },
  
  /**
   * Chat with Zantara (Haiku 4.5)
   * Supports both regular and SSE streaming with API Contracts
   */
  async chat(message, userEmail = null, useSSE = false) {
    try {
      const email = userEmail || localStorage.getItem('zantara-email') || 'guest@zantara.com';
      const token = localStorage.getItem('zantara-token');
      
      // If SSE requested and ZANTARA_SSE available, use streaming
      if (useSSE && window.ZANTARA_SSE) {
        return await window.ZANTARA_SSE.stream(message, email);
      }
      
      // Try with API Contracts first (resilient)
      if (window.API_CONTRACTS) {
        console.log('🔄 Using API Contracts for chat...');
        
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const data = await window.API_CONTRACTS.callWithFallback('rag', '/bali-zero/chat', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({
            query: message,
            user_email: email,
            user_role: 'member'
          })
        });
        
        if (data.success) {
          return {
            success: true,
            response: data.response,
            model: data.model_used,
            ai: data.ai_used
          };
        }
        
        return { success: false, error: 'Chat failed' };
      }
      
      // Fallback to direct call (legacy)
      console.log('⚠️ Using legacy API call (no contracts)');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${this.backends.rag}/bali-zero/chat`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          query: message,
          user_email: email,
          user_role: 'member'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Chat failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return {
          success: true,
          response: data.response,
          model: data.model_used,
          ai: data.ai_used
        };
      }
      
      return { success: false, error: 'Chat failed' };
    } catch (error) {
      console.error('Chat error:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    const session = localStorage.getItem('zantara-session');
    const token = localStorage.getItem('zantara-token');
    const user = localStorage.getItem('zantara-user');
    return !!(session && token && user);
  },
  
  /**
   * Get current user
   */
  getUser() {
    try {
      const userStr = localStorage.getItem('zantara-user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  },
  
  /**
   * Get JWT token
   */
  getToken() {
    return localStorage.getItem('zantara-token');
  },
  
  /**
   * Logout
   */
  logout() {
    localStorage.removeItem('zantara-session');
    localStorage.removeItem('zantara-token');
    localStorage.removeItem('zantara-user');
    localStorage.removeItem('zantara-email');
    localStorage.removeItem('zantara-name');
    console.log('✅ Logged out');
  }
};

// Make available globally
window.ZANTARA_API = ZANTARA_API;

