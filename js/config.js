/**
 * ZANTARA Webapp Configuration
 *
 * Client-side configuration that reads from environment variables.
 * API keys are NEVER exposed here - they're handled by proxy/BFF.
 */

export const config = {
  // API Endpoints
  api: {
    // Updated to point to new RAG backend with mock auth (2025-10-02)
    baseUrl: import.meta.env?.VITE_API_BASE_URL || 'https://zantara-rag-backend-1064094238013.europe-west1.run.app',
    proxyUrl: import.meta.env?.VITE_PROXY_URL || 'https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app',

    // Gateway endpoints (new - 2025-10-12)
    gatewayUrl: import.meta.env?.VITE_GATEWAY_URL || 'https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app',

    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // JWT Configuration (client-side only)
  auth: {
    tokenKey: 'zantara-auth-token',
    refreshTokenKey: 'zantara-refresh-token',
    userKey: 'zantara-user',
    expiryBuffer: 300, // 5 minutes buffer before token expiry
  },

  // Feature Flags
  features: {
    streaming: import.meta.env?.VITE_ENABLE_STREAMING !== 'false',
    voice: import.meta.env?.VITE_ENABLE_VOICE !== 'false',
    virtualization: import.meta.env?.VITE_ENABLE_VIRTUALIZATION !== 'false',
    analytics: true,

    // Gateway feature flag (default: false for gradual rollout)
    // Enable with: localStorage.setItem('feature_gateway', 'true')
    useGateway: (() => {
      try {
        return localStorage.getItem('feature_gateway') === 'true';
      } catch {
        return false;
      }
    })(),
  },

  // Session Configuration
  session: {
    idleTimeout: 30 * 60 * 1000, // 30 minutes
    warningTime: 5 * 60 * 1000,  // 5 minutes before timeout
  },

  // Environment
  env: import.meta.env?.VITE_APP_ENV || 'production',
  isDevelopment: import.meta.env?.VITE_APP_ENV === 'development',
  isProduction: import.meta.env?.VITE_APP_ENV === 'production',
};

// Don't freeze config to allow runtime feature flag checks
export default config;
