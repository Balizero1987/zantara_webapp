/**
 * Intelligent Cache Manager for API Responses
 * 
 * Caches idempotent requests with configurable TTL.
 * Implements LRU eviction and automatic cleanup.
 */

class CacheManager {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0
    };

    // Endpoints che POSSONO essere cachati (idempotenti)
    this.cacheableEndpoints = new Set([
      'contact.info',
      'team.list',
      'team.departments',
      'team.get',
      'bali.zero.pricing',
      'system.handlers.list',
      'config.flags',
      'dashboard.main',
      'dashboard.health',
      'memory.list',
      'memory.entities'
    ]);

    // TTL per tipo di endpoint (millisecondi)
    this.ttlConfig = {
      'contact.info': 5 * 60 * 1000,      // 5 minuti
      'team.list': 2 * 60 * 1000,         // 2 minuti
      'team.departments': 5 * 60 * 1000,  // 5 minuti
      'team.get': 2 * 60 * 1000,          // 2 minuti
      'bali.zero.pricing': 10 * 60 * 1000, // 10 minuti
      'system.handlers.list': 10 * 60 * 1000, // 10 minuti
      'config.flags': 1 * 60 * 1000,      // 1 minuto
      'dashboard.main': 30 * 1000,        // 30 secondi
      'dashboard.health': 30 * 1000,      // 30 secondi
      'memory.list': 2 * 60 * 1000,       // 2 minuti
      'memory.entities': 2 * 60 * 1000,   // 2 minuti
      'default': 1 * 60 * 1000            // 1 minuto default
    };

    // Cleanup expired entries ogni minuto
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  isCacheable(endpoint, params = {}) {
    // Non cachare se params contiene dati sensibili
    const sensitiveKeys = ['password', 'token', 'api_key', 'secret', 'auth', 'credential'];
    const hasSensitiveData = Object.keys(params).some(key =>
      sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))
    );

    if (hasSensitiveData) return false;

    // Non cachare operazioni write
    const writeOperations = ['save', 'create', 'update', 'delete', 'upload', 'send'];
    const isWriteOp = writeOperations.some(op => endpoint.toLowerCase().includes(op));
    
    if (isWriteOp) return false;

    // Verifica se endpoint è in whitelist
    return this.cacheableEndpoints.has(endpoint);
  }

  getCacheKey(endpoint, params = {}) {
    // Crea chiave univoca basata su endpoint + params (sorted per consistenza)
    const paramsStr = JSON.stringify(params, Object.keys(params).sort());
    return `${endpoint}:${paramsStr}`;
  }

  get(endpoint, params = {}) {
    if (!this.isCacheable(endpoint, params)) {
      return null;
    }

    const key = this.getCacheKey(endpoint, params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Verifica se expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }

    // Update access time for LRU
    entry.lastAccess = Date.now();
    entry.accessCount++;
    
    this.stats.hits++;
    
    // Log in dev mode
    if (this.isDevMode()) {
      const age = Math.round((Date.now() - entry.timestamp) / 1000);
      console.log(`[Cache] 💚 HIT: ${endpoint} (age: ${age}s, hits: ${entry.accessCount})`);
    }

    return entry.data;
  }

  set(endpoint, params = {}, data) {
    if (!this.isCacheable(endpoint, params)) {
      return false;
    }

    const key = this.getCacheKey(endpoint, params);
    const ttl = this.ttlConfig[endpoint] || this.ttlConfig.default;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      lastAccess: Date.now(),
      expiresAt: Date.now() + ttl,
      accessCount: 0,
      endpoint,
      params,
      ttl
    });

    this.stats.sets++;

    if (this.isDevMode()) {
      console.log(`[Cache] 💾 SET: ${endpoint} (TTL: ${ttl / 1000}s)`);
    }

    return true;
  }

  invalidate(endpoint, params = null) {
    if (params === null) {
      // Invalida tutti i cache per questo endpoint
      let count = 0;
      for (const [key, entry] of this.cache.entries()) {
        if (entry.endpoint === endpoint) {
          this.cache.delete(key);
          count++;
        }
      }
      
      if (this.isDevMode() && count > 0) {
        console.log(`[Cache] 🗑️ INVALIDATED: ${endpoint} (${count} entries)`);
      }
      
      return count;
    } else {
      // Invalida cache specifico
      const key = this.getCacheKey(endpoint, params);
      const deleted = this.cache.delete(key);
      
      if (this.isDevMode() && deleted) {
        console.log(`[Cache] 🗑️ INVALIDATED: ${key}`);
      }
      
      return deleted ? 1 : 0;
    }
  }

  cleanup() {
    const now = Date.now();
    let evicted = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        evicted++;
      }
    }

    if (evicted > 0) {
      this.stats.evictions += evicted;
      if (this.isDevMode()) {
        console.log(`[Cache] 🧹 Cleanup: evicted ${evicted} expired entries`);
      }
    }
  }

  clear() {
    const size = this.cache.size;
    this.cache.clear();
    
    if (this.isDevMode()) {
      console.log(`[Cache] 🗑️ Cleared ${size} entries`);
    }
  }

  getStats() {
    const hitRate = this.stats.hits + this.stats.misses > 0
      ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
      : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        endpoint: entry.endpoint,
        age: Math.round((Date.now() - entry.timestamp) / 1000),
        ttl: Math.round((entry.expiresAt - Date.now()) / 1000),
        accessCount: entry.accessCount,
        lastAccess: Math.round((Date.now() - entry.lastAccess) / 1000)
      }))
    };
  }

  isDevMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           new URLSearchParams(window.location.search).get('dev') === 'true';
  }

  // Cleanup on page unload
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}

// Export singleton
export const cacheManager = new CacheManager();

// Expose globally for debugging
if (typeof window !== 'undefined') {
  window.ZANTARA_CACHE = {
    getStats: () => cacheManager.getStats(),
    clear: () => cacheManager.clear(),
    invalidate: (endpoint, params) => cacheManager.invalidate(endpoint, params),
    get: (endpoint, params) => cacheManager.get(endpoint, params),
    set: (endpoint, params, data) => cacheManager.set(endpoint, params, data)
  };
}

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    cacheManager.destroy();
  });
}

export default cacheManager;
