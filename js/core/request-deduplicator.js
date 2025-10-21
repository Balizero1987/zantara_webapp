/**
 * Request Deduplication Manager
 * 
 * Prevents multiple simultaneous requests to the same endpoint with same parameters.
 * Returns the same promise for duplicate requests.
 */

class RequestDeduplicator {
  constructor() {
    this.pendingRequests = new Map();
    this.stats = {
      totalRequests: 0,
      deduplicatedRequests: 0,
      uniqueRequests: 0
    };
  }

  getRequestKey(endpoint, params = {}) {
    // Create unique key for endpoint + params
    const paramsStr = JSON.stringify(params, Object.keys(params).sort());
    return `${endpoint}:${paramsStr}`;
  }

  async deduplicate(endpoint, params, requestFunction) {
    const key = this.getRequestKey(endpoint, params);
    this.stats.totalRequests++;

    // Check if same request is already in flight
    if (this.pendingRequests.has(key)) {
      this.stats.deduplicatedRequests++;
      
      if (this.isDevMode()) {
        console.log(`[Dedup] 🔗 Reusing pending request: ${endpoint}`);
      }
      
      // Return existing promise
      return this.pendingRequests.get(key);
    }

    // Create new request
    this.stats.uniqueRequests++;
    
    if (this.isDevMode()) {
      console.log(`[Dedup] 🆕 New request: ${endpoint}`);
    }

    // Execute request and store promise
    const promise = (async () => {
      try {
        const result = await requestFunction();
        return result;
      } finally {
        // Remove from pending after completion (success or failure)
        this.pendingRequests.delete(key);
      }
    })();

    this.pendingRequests.set(key, promise);
    return promise;
  }

  cancel(endpoint, params = null) {
    if (params === null) {
      // Cancel all requests for this endpoint
      let count = 0;
      for (const [key] of this.pendingRequests.entries()) {
        if (key.startsWith(`${endpoint}:`)) {
          this.pendingRequests.delete(key);
          count++;
        }
      }
      
      if (this.isDevMode() && count > 0) {
        console.log(`[Dedup] ❌ Cancelled ${count} pending requests for ${endpoint}`);
      }
      
      return count;
    } else {
      // Cancel specific request
      const key = this.getRequestKey(endpoint, params);
      const deleted = this.pendingRequests.delete(key);
      
      if (this.isDevMode() && deleted) {
        console.log(`[Dedup] ❌ Cancelled pending request: ${key}`);
      }
      
      return deleted ? 1 : 0;
    }
  }

  getStats() {
    const deduplicationRate = this.stats.totalRequests > 0
      ? (this.stats.deduplicatedRequests / this.stats.totalRequests) * 100
      : 0;

    return {
      ...this.stats,
      deduplicationRate: Math.round(deduplicationRate * 100) / 100,
      pendingCount: this.pendingRequests.size,
      pendingRequests: Array.from(this.pendingRequests.keys())
    };
  }

  clear() {
    const count = this.pendingRequests.size;
    this.pendingRequests.clear();
    
    if (this.isDevMode()) {
      console.log(`[Dedup] 🗑️ Cleared ${count} pending requests`);
    }
  }

  isDevMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           new URLSearchParams(window.location.search).get('dev') === 'true';
  }
}

// Export singleton
export const requestDeduplicator = new RequestDeduplicator();

// Expose globally for debugging
if (typeof window !== 'undefined') {
  window.ZANTARA_DEDUP = {
    getStats: () => requestDeduplicator.getStats(),
    clear: () => requestDeduplicator.clear(),
    cancel: (endpoint, params) => requestDeduplicator.cancel(endpoint, params)
  };
}

export default requestDeduplicator;
