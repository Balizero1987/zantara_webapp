/**
 * DEPRECATED - Use zantara-api.js instead
 * This file is kept for backward compatibility only
 */

console.warn('⚠️ api-config-unified.js is DEPRECATED - Please use zantara-api.js instead');

// Redirect to new API
if (typeof window !== 'undefined' && window.ZANTARA_API) {
  // New API is available, this file should not be used
  console.log('✅ Using new ZANTARA_API instead of api-config-unified.js');
}
