/**
 * ZANTARA Webapp Configuration
 *
 * Client-side configuration that reads from environment variables.
 * API keys are NEVER exposed here - they're handled by proxy/BFF.
 */

export const config = {
  // API Endpoints
  api: {
    // Railway backends (RAG and TypeScript)
    baseUrl: import.meta.env?.VITE_API_BASE_URL || 'https://scintillating-kindness-production-47e3.up.railway.app',
    proxyUrl: import.meta.env?.VITE_PROXY_URL || 'https://ts-backend-production-568d.up.railway.app',
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

// Freeze config to prevent modifications
Object.freeze(config);
Object.freeze(config.api);
Object.freeze(config.auth);
Object.freeze(config.features);
Object.freeze(config.session);

export default config;