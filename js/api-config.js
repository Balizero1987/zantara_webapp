// ZANTARA API Configuration
// This file manages API connections with CORS handling

const API_CONFIG = {
  // Production ZANTARA endpoints
  production: {
    // Unified Cloud Run endpoint with CORS enabled
    base: 'https://zantara-v520-chatgpt-patch-himaadsxua-ew.a.run.app',
    call: '/call',
    health: '/health'
  },

  // No public CORS proxies needed (Cloud Run CORS enabled)

  // API Key (should be in environment variable in production)
  apiKey: 'zantara-internal-dev-key-2025',

  // Default headers
  headers: {
    'Content-Type': 'application/json'
  }
};

// Function to make API calls with CORS handling
async function callZantaraAPI(endpoint, data, useProxy = true) {
  try {
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    let apiUrl = API_CONFIG.production.base + endpoint;

    // For development, use local proxy
    if (isDevelopment) {
      apiUrl = 'http://localhost:3003' + endpoint;
      console.log('Using local proxy for development');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        ...API_CONFIG.headers,
        'x-api-key': API_CONFIG.apiKey,
        ...(typeof window !== 'undefined' && window.ZANTARA_SESSION_ID
          ? { 'x-session-id': window.ZANTARA_SESSION_ID }
          : {})
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('API call failed:', error);

    throw error;
  }
}

// Function to check API health
async function checkAPIHealth() {
  try {
    const isGitHubPages = window.location.hostname.includes('github.io');
    let healthUrl = API_CONFIG.production.base + '/health';

    if (isGitHubPages) {
      // For health check, try direct first (no auth needed)
      const response = await fetch(healthUrl);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ ZANTARA API is healthy:', data);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.warn('❌ ZANTARA API health check failed:', error);
    return false;
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  // Allow base override via global or localStorage for flexibility
  try {
    const overrideBase = window.ZANTARA_API_BASE || localStorage.getItem('zantara-api-base');
    if (overrideBase && typeof overrideBase === 'string') {
      API_CONFIG.production.base = overrideBase;
    }
  } catch (_) {}

  window.ZANTARA_API = {
    config: API_CONFIG,
    call: callZantaraAPI,
    checkHealth: checkAPIHealth,
    setBase: (base) => { if (typeof base === 'string' && base.startsWith('http')) API_CONFIG.production.base = base; }
  };
}

// Auto-check health on load
document.addEventListener('DOMContentLoaded', () => {
  checkAPIHealth().then(healthy => {
    if (healthy) {
      console.log('🟢 ZANTARA API connection established');
    } else {
      console.log('🟡 ZANTARA API not reachable, some features may be limited');

      // Show a user-friendly message
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(251, 191, 36, 0.1);
        border: 1px solid rgba(251, 191, 36, 0.3);
        color: #fbbf24;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 9999;
        backdrop-filter: blur(10px);
      `;
      notification.innerHTML = `
        <strong>Limited Mode:</strong> Using demo data.
        <a href="#" style="color: #fbbf24; text-decoration: underline; margin-left: 8px;"
           onclick="this.parentElement.remove(); return false;">Dismiss</a>
      `;
      document.body.appendChild(notification);

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 10000);
    }
  });
});
