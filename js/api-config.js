// ZANTARA API Configuration
// This file manages API connections with CORS handling

const API_CONFIG = {
  // Production ZANTARA endpoints
  production: {
    base: 'https://zantara-v520-chatgpt-patch-himaadsxua-ew.a.run.app',
    call: '/call',
    health: '/health'
  },

  // CORS proxy options (for GitHub Pages)
  corsProxy: {
    // Option 1: Use a public CORS proxy
    enabled: true,
    service: 'https://corsproxy.io/?',

    // Option 2: Alternative proxies
    alternatives: [
      'https://api.allorigins.win/raw?url=',
      'https://cors-anywhere.herokuapp.com/',
      'https://cors.bridged.cc/'
    ]
  },

  // API Key (should be in environment variable in production)
  apiKey: 'deabf88e8aefda722fbdb8e899d1e1717c8faf66bf56fb82be495c2f3458d30c',

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

    // Use CORS proxy for GitHub Pages
    if (isGitHubPages && useProxy && API_CONFIG.corsProxy.enabled) {
      apiUrl = API_CONFIG.corsProxy.service + encodeURIComponent(apiUrl);
      console.log('Using CORS proxy for GitHub Pages');
    }

    // For development, use local proxy
    if (isDevelopment) {
      apiUrl = 'http://localhost:3003' + endpoint;
      console.log('Using local proxy for development');
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        ...API_CONFIG.headers,
        'x-api-key': API_CONFIG.apiKey
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();

  } catch (error) {
    console.error('API call failed:', error);

    // Try alternative CORS proxies if the first one fails
    if (API_CONFIG.corsProxy.alternatives.length > 0 && useProxy) {
      console.log('Trying alternative CORS proxy...');
      const altProxy = API_CONFIG.corsProxy.alternatives[0];
      API_CONFIG.corsProxy.service = altProxy;
      API_CONFIG.corsProxy.alternatives.shift();
      return callZantaraAPI(endpoint, data, true);
    }

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
  window.ZANTARA_API = {
    config: API_CONFIG,
    call: callZantaraAPI,
    checkHealth: checkAPIHealth
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