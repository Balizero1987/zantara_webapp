/**
 * ZANTARA API Layer - Clean & Simple
 * Allineato con backend Railway (Ottobre 2025)
 * 
 * Backend:
 * - TS-BACKEND: https://ts-backend-production-568d.up.railway.app
 * - RAG-BACKEND: https://scintillating-kindness-production-47e3.up.railway.app
 * 
 * Auth: Demo auth middleware (no API key needed)
 */

const ZANTARA_API = {
  // Backend URLs
  backends: {
    ts: 'https://ts-backend-production-568d.up.railway.app',
    rag: 'https://scintillating-kindness-production-47e3.up.railway.app'
  },
  
  /**
   * Team Login
   */
  async teamLogin(email, pin, name) {
    try {
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
        // Save to localStorage
        localStorage.setItem('zantara-session', data.sessionId);
        localStorage.setItem('zantara-token', data.token); // JWT token for API calls
        localStorage.setItem('zantara-user', JSON.stringify(data.user));
        localStorage.setItem('zantara-email', data.user.email);
        localStorage.setItem('zantara-name', data.user.name);
        
        console.log('✅ Login successful:', data.user.name);
        console.log('🔑 JWT Token saved');
        return { success: true, user: data.user, message: data.personalizedResponse };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Chat with Zantara (Haiku 4.5)
   * Supports both regular and SSE streaming
   */
  async chat(message, userEmail = null, useSSE = false) {
    try {
      const email = userEmail || localStorage.getItem('zantara-email') || 'guest@zantara.com';
      const token = localStorage.getItem('zantara-token');
      
      // If SSE requested and ZANTARA_SSE available, use streaming
      if (useSSE && window.ZANTARA_SSE) {
        return await window.ZANTARA_SSE.stream(message, email);
      }
      
      // Otherwise use regular fetch
      // Build headers with JWT if available
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

