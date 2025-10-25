/**
 * API CONTRACTS - Resilient Frontend Architecture
 * 
 * Sistema di versioning e fallback per evitare che il frontend si rompa
 * quando il backend cambia o è temporaneamente indisponibile.
 * 
 * Features:
 * - API Versioning (v1.0, v1.1, v1.2)
 * - Automatic Fallback Chain
 * - Health Check Integration
 * - Backward Compatibility
 * - Error Recovery
 */

class APIContracts {
  constructor() {
    this.currentVersion = 'v1.2.0';
    this.fallbackVersions = ['v1.1.0', 'v1.0.0'];
    this.healthCheckInterval = 30000; // 30 seconds
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
    
    // Backend URLs with versioning
    this.backends = {
      ts: 'https://ts-backend-production-568d.up.railway.app',
      rag: 'https://scintillating-kindness-production-47e3.up.railway.app'
    };
    
    // Health status cache
    this.healthStatus = {
      ts: { status: 'unknown', lastCheck: 0 },
      rag: { status: 'unknown', lastCheck: 0 }
    };
    
    this.startHealthMonitoring();
  }
  
  /**
   * Get API endpoint with versioning
   */
  getEndpoint(backend, endpoint, version = null) {
    const baseUrl = this.backends[backend];
    
    // FIXED: Backend doesn't use versioned endpoints
    // Always use direct endpoint without versioning
    if (endpoint.startsWith('/')) {
      return `${baseUrl}${endpoint}`;
    }
    
    // For legacy endpoints (no versioning)
    return `${baseUrl}${endpoint}`;
  }
  
  /**
   * Call API with automatic fallback
   */
  async callWithFallback(backend, endpoint, options = {}) {
    const versions = [this.currentVersion, ...this.fallbackVersions];
    
    for (let i = 0; i < versions.length; i++) {
      const version = versions[i];
      const url = this.getEndpoint(backend, endpoint, version);
      
      try {
        console.log(`🔄 Trying ${backend}${endpoint} (${version})`);
        
        const response = await this.makeRequest(url, options);
        
        if (response.ok) {
          console.log(`✅ Success with ${version}`);
          return await response.json();
        }
        
        // If 404, try next version
        if (response.status === 404 && i < versions.length - 1) {
          console.log(`⚠️ ${version} not found, trying next version...`);
          continue;
        }
        
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        
      } catch (error) {
        console.log(`❌ ${version} failed:`, error.message);
        
        // If this is the last version, throw the error
        if (i === versions.length - 1) {
          throw new Error(`All API versions failed. Last error: ${error.message}`);
        }
        
        // Wait before trying next version
        await this.sleep(this.retryDelay);
      }
    }
  }
  
  /**
   * Make HTTP request with retry logic
   */
  async makeRequest(url, options = {}) {
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 seconds
    };
    
    const requestOptions = { ...defaultOptions, ...options };
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), requestOptions.timeout);
        
        const response = await fetch(url, {
          ...requestOptions,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response;
        
      } catch (error) {
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        console.log(`🔄 Retry ${attempt}/${this.maxRetries} for ${url}`);
        await this.sleep(this.retryDelay * attempt);
      }
    }
  }
  
  /**
   * Health check for backend
   */
  async checkHealth(backend) {
    try {
      const healthUrl = `${this.backends[backend]}/health`;
      const response = await fetch(healthUrl, { 
        method: 'GET',
        timeout: 5000 
      });
      
      const isHealthy = response.ok;
      this.healthStatus[backend] = {
        status: isHealthy ? 'healthy' : 'unhealthy',
        lastCheck: Date.now()
      };
      
      console.log(`🏥 ${backend.toUpperCase()} health: ${isHealthy ? '✅' : '❌'}`);
      return isHealthy;
      
    } catch (error) {
      this.healthStatus[backend] = {
        status: 'unhealthy',
        lastCheck: Date.now()
      };
      
      console.log(`🏥 ${backend.toUpperCase()} health: ❌ (${error.message})`);
      return false;
    }
  }
  
  /**
   * Start health monitoring
   */
  startHealthMonitoring() {
    // Initial health check
    this.checkHealth('ts');
    this.checkHealth('rag');
    
    // Periodic health checks
    setInterval(() => {
      this.checkHealth('ts');
      this.checkHealth('rag');
    }, this.healthCheckInterval);
  }
  
  /**
   * Get backend health status
   */
  getHealthStatus(backend) {
    return this.healthStatus[backend];
  }
  
  /**
   * Check if backend is healthy
   */
  isHealthy(backend) {
    const status = this.healthStatus[backend];
    const timeSinceLastCheck = Date.now() - status.lastCheck;
    
    // Consider unhealthy if no check in last 2 minutes
    if (timeSinceLastCheck > 120000) {
      return false;
    }
    
    return status.status === 'healthy';
  }
  
  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get current API version
   */
  getCurrentVersion() {
    return this.currentVersion;
  }
  
  /**
   * Update API version (for future upgrades)
   */
  updateVersion(newVersion) {
    console.log(`🔄 Updating API version: ${this.currentVersion} → ${newVersion}`);
    this.currentVersion = newVersion;
  }
}

// Create global instance
window.API_CONTRACTS = new APIContracts();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = APIContracts;
}
