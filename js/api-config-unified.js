/**
 * ZANTARA API Configuration - UNIFIED
 * 
 * This file manages API connections with CORS handling.
 * Supports both RAG Backend and TypeScript Backend with intelligent routing.
 */

const API_CONFIG = {
  // Mode: 'proxy' in production (recommended), 'direct' only for local/dev
  mode: 'proxy',
  
  // Backend configurations
  backends: {
    // RAG Backend (Python/FastAPI) - for Bali Zero chat and RAG queries
    rag: {
      base: 'https://scintillating-kindness-production-47e3.up.railway.app',
      endpoints: {
        baliZeroChat: '/bali-zero/chat',
        search: '/search',
        query: '/query',
        health: '/health',
        pricing: '/pricing/all'
      }
    },
    
    // TypeScript Backend - for AI chat, team management, and general API
    ts: {
      base: 'https://ts-backend-production-568d.up.railway.app',
      endpoints: {
        call: '/call',
        aiChat: '/ai.chat',
        aiStream: '/ai.chat.stream',
        teamLogin: '/team.login',
        teamMembers: '/team.members',
        teamLogout: '/team.logout',
        health: '/health',
        zantaraBrilliant: '/zantara/brilliant/chat'
      }
    }
  },
  
  // Intelligent routing rules
  routing: {
    // Endpoints that should use RAG backend
    ragEndpoints: [
      'bali.zero.chat',
      'rag.query',
      'rag.search',
      'pricing.official',
      'pricing.search'
    ],
    
    // Endpoints that should use TS backend
    tsEndpoints: [
      'ai.chat',
      'team.login',
      'team.members',
      'team.logout',
      'identity.resolve',
      'memory.query',
      'activity.track'
    ]
  },
  
  // Proxy configuration (BFF layer)
  proxy: {
    production: {
      base: 'https://ts-backend-production-568d.up.railway.app/api/zantara',
      endpoints: {
        call: '/call',
        health: '/health'
      }
    }
  },
  
  // Streaming configuration
  streaming: {
    path: '/chat'
  },
  
  // Default headers
  headers: { 
    'Content-Type': 'application/json' 
  },
  
  // Retry configuration
  retry: {
    attempts: 3,
    delay: 1000,
    backoff: 2
  }
};

/**
 * Get the appropriate backend URL for an endpoint
 */
function getBackendUrl(endpoint) {
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
  
  // Check if endpoint should use RAG backend
  if (API_CONFIG.routing.ragEndpoints.some(ep => endpoint.includes(ep))) {
    return API_CONFIG.backends.rag.base;
  }
  
  // Check if endpoint should use TS backend
  if (API_CONFIG.routing.tsEndpoints.some(ep => endpoint.includes(ep))) {
    return API_CONFIG.backends.ts.base;
  }
  
  // Default to TS backend for unknown endpoints
  return API_CONFIG.backends.ts.base;
}

/**
 * Get the appropriate endpoint path
 */
function getEndpointPath(endpoint, backendType = 'auto') {
  // Auto-detect backend type
  if (backendType === 'auto') {
    if (API_CONFIG.routing.ragEndpoints.some(ep => endpoint.includes(ep))) {
      backendType = 'rag';
    } else if (API_CONFIG.routing.tsEndpoints.some(ep => endpoint.includes(ep))) {
      backendType = 'ts';
    } else {
      backendType = 'ts'; // Default
    }
  }
  
  if (backendType === 'rag') {
    // Map common endpoints to RAG backend paths
    const endpointMap = {
      'bali.zero.chat': API_CONFIG.backends.rag.endpoints.baliZeroChat,
      'rag.query': API_CONFIG.backends.rag.endpoints.query,
      'rag.search': API_CONFIG.backends.rag.endpoints.search,
      'pricing.official': API_CONFIG.backends.rag.endpoints.pricing
    };
    
    return endpointMap[endpoint] || `/bali-zero/chat`;
  } else {
    // TS backend endpoints
    return `/call`;
  }
}

/**
 * Make API call with intelligent backend routing and JWT support
 */
async function callZantaraAPI(endpoint, data, options = {}) {
  const {
    useProxy = true,
    useStreaming = false,
    timeout = 30000,
    useJWT = true
  } = options;
  
  try {
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    const forceDirect = new URLSearchParams(location.search).get('direct') === 'true';
    
    let baseUrl, endpointPath;
    
    if (useProxy && !forceDirect) {
      // Use proxy/BFF layer
      baseUrl = API_CONFIG.proxy.production.base;
      endpointPath = API_CONFIG.proxy.endpoints.call;
    } else {
      // Direct backend call
      baseUrl = getBackendUrl(endpoint);
      endpointPath = getEndpointPath(endpoint);
    }
    
    const apiUrl = `${baseUrl}${endpointPath}`;
    
    // Build headers with JWT support
    const headers = await buildHeaders(useJWT, useProxy, forceDirect);
    
    console.log(`[API] Calling ${endpoint} via ${useProxy ? 'proxy' : 'direct'}: ${apiUrl}`);
    
    // Make request with retry logic
    const response = await makeRequestWithRetry(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
      timeout
    });
    
    if (!response.ok) {
      // Handle JWT token expiration
      if (response.status === 401 && useJWT) {
        console.log('[API] Token expired, attempting refresh...');
        const refreshed = await refreshJWTToken();
        if (refreshed) {
          // Retry with new token
          const newHeaders = await buildHeaders(useJWT, useProxy, forceDirect);
          const retryResponse = await makeRequestWithRetry(apiUrl, {
            method: 'POST',
            headers: newHeaders,
            body: JSON.stringify(data),
            timeout
          });
          
          if (retryResponse.ok) {
            const result = await retryResponse.json();
            console.log(`[API] ✅ ${endpoint} success (after refresh)`);
            return result;
          }
        }
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Log success
    console.log(`[API] ✅ ${endpoint} success`);
    
    return result;
    
  } catch (error) {
    console.error(`[API] ❌ ${endpoint} failed:`, error);
    throw error;
  }
}

/**
 * Build headers with JWT support
 */
async function buildHeaders(useJWT, useProxy, forceDirect) {
  const headers = { ...API_CONFIG.headers };
  
  if (useJWT) {
    // Try to get JWT token
    const jwtToken = await getJWTToken();
    if (jwtToken) {
      headers['Authorization'] = `Bearer ${jwtToken}`;
    }
  }
  
  // Add user ID for tracking
  const userId = localStorage.getItem('zantara-user-email') || 
                 localStorage.getItem('zantara-user') || '';
  if (userId) {
    headers['x-user-id'] = userId;
  }
  
  // API key no longer needed - using demo auth middleware on backend
  // JWT token will be added if available (from login)
  // Demo auth allows calls without API key for safe handlers
  
  return headers;
}

/**
 * Get JWT token with auto-refresh
 */
async function getJWTToken() {
  const token = localStorage.getItem('zantara-auth-token');
  if (!token) return null;
  
  // Check if token is expired
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Date.now() / 1000;
    
    // If token expires in less than 5 minutes, refresh it
    if (payload.exp < (now + 300)) {
      console.log('[JWT] Token expiring soon, refreshing...');
      await refreshJWTToken();
      return localStorage.getItem('zantara-auth-token');
    }
    
    return token;
  } catch (e) {
    console.error('[JWT] Invalid token:', e);
    return null;
  }
}

/**
 * Refresh JWT token
 */
async function refreshJWTToken() {
  try {
    const refreshToken = localStorage.getItem('zantara-refresh-token');
    if (!refreshToken) {
      console.log('[JWT] No refresh token available');
      return false;
    }
    
    const response = await fetch(`${API_CONFIG.backends.ts.base}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });
    
    if (!response.ok) {
      console.error('[JWT] Refresh failed:', response.status);
      return false;
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
    console.error('[JWT] Refresh error:', error);
    return false;
  }
}

/**
 * Make request with exponential backoff retry
 */
async function makeRequestWithRetry(url, options, attempt = 1) {
  const { timeout, ...fetchOptions } = options;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Retry on 429 or 5xx errors
    if ((response.status === 429 || response.status >= 500) && 
        attempt < API_CONFIG.retry.attempts) {
      
      const delay = API_CONFIG.retry.delay * Math.pow(API_CONFIG.retry.backoff, attempt - 1);
      console.log(`[API] Retrying ${url} in ${delay}ms (attempt ${attempt + 1})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return makeRequestWithRetry(url, options, attempt + 1);
    }
    
    return response;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}

/**
 * Health check for all backends
 */
async function healthCheck() {
  const results = {};
  
  // Check RAG backend
  try {
    const ragResponse = await fetch(`${API_CONFIG.backends.rag.base}/health`, {
      method: 'GET',
      timeout: 5000
    });
    results.rag = ragResponse.ok;
  } catch (e) {
    results.rag = false;
  }
  
  // Check TS backend
  try {
    const tsResponse = await fetch(`${API_CONFIG.backends.ts.base}/health`, {
      method: 'GET',
      timeout: 5000
    });
    results.ts = tsResponse.ok;
  } catch (e) {
    results.ts = false;
  }
  
  return results;
}

// Export for global use
if (typeof window !== 'undefined') {
  window.ZANTARA_API = {
    call: callZantaraAPI,
    healthCheck,
    getBackendUrl,
    getEndpointPath,
    config: API_CONFIG
  };
}

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    callZantaraAPI,
    healthCheck,
    getBackendUrl,
    getEndpointPath,
    API_CONFIG
  };
}
