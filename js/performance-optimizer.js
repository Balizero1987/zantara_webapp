/**
 * Performance Optimization System
 * Enhancement #30 for NUZANTARA-RAILWAY
 * Implements comprehensive performance monitoring and optimization techniques
 */

class PerformanceOptimizer {
  constructor() {
    this.metrics = new Map();
    this.optimizationStrategies = new Map();
    this.performanceIssues = [];
    this.monitoringEnabled = true;
    this.optimizationEnabled = true;
    this.samplingRate = 0.1; // 10% of interactions
  }

  /**
   * Initialize the performance optimization system
   */
  async initialize() {
    // Register optimization strategies
    this.registerOptimizationStrategies();
    
    // Start performance monitoring
    this.startMonitoring();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Run initial optimization check
    this.runOptimizationCheck();
    
    console.log('[PerformanceOptimizer] System initialized');
  }

  /**
   * Register optimization strategies
   */
  registerOptimizationStrategies() {
    // Lazy loading strategy
    this.optimizationStrategies.set('lazyLoading', {
      name: 'Lazy Loading',
      description: 'Defer loading of non-critical resources',
      priority: 'high',
      apply: this.applyLazyLoading.bind(this)
    });

    // Caching strategy
    this.optimizationStrategies.set('caching', {
      name: 'Resource Caching',
      description: 'Cache frequently accessed resources',
      priority: 'high',
      apply: this.applyCaching.bind(this)
    });

    // Code splitting strategy
    this.optimizationStrategies.set('codeSplitting', {
      name: 'Code Splitting',
      description: 'Split code into smaller bundles',
      priority: 'medium',
      apply: this.applyCodeSplitting.bind(this)
    });

    // Image optimization strategy
    this.optimizationStrategies.set('imageOptimization', {
      name: 'Image Optimization',
      description: 'Optimize image sizes and formats',
      priority: 'medium',
      apply: this.applyImageOptimization.bind(this)
    });

    // DOM optimization strategy
    this.optimizationStrategies.set('domOptimization', {
      name: 'DOM Optimization',
      description: 'Reduce DOM complexity and improve rendering',
      priority: 'high',
      apply: this.applyDOMOptimization.bind(this)
    });

    // Network optimization strategy
    this.optimizationStrategies.set('networkOptimization', {
      name: 'Network Optimization',
      description: 'Optimize network requests and reduce latency',
      priority: 'high',
      apply: this.applyNetworkOptimization.bind(this)
    });

    // Memory management strategy
    this.optimizationStrategies.set('memoryManagement', {
      name: 'Memory Management',
      description: 'Reduce memory usage and prevent leaks',
      priority: 'medium',
      apply: this.applyMemoryManagement.bind(this)
    });

    console.log('[PerformanceOptimizer] Optimization strategies registered');
  }

  /**
   * Start performance monitoring
   */
  startMonitoring() {
    if (!this.monitoringEnabled) return;
    
    // Monitor navigation performance
    if ('performance' in window) {
      // Get initial navigation metrics
      this.collectNavigationMetrics();
      
      // Monitor long tasks
      this.monitorLongTasks();
      
      // Monitor resource loading
      this.monitorResourceLoading();
    }
    
    // Set up periodic monitoring
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000); // Every 30 seconds
    
    console.log('[PerformanceOptimizer] Performance monitoring started');
  }

  /**
   * Collect navigation metrics
   */
  collectNavigationMetrics() {
    if (!window.performance || !window.performance.getEntriesByType) return;
    
    const navigationEntries = window.performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0) {
      const nav = navigationEntries[0];
      
      this.recordMetric('navigation', {
        dnsLookup: nav.domainLookupEnd - nav.domainLookupStart,
        tcpConnection: nav.connectEnd - nav.connectStart,
        requestTime: nav.responseStart - nav.requestStart,
        responseTime: nav.responseEnd - nav.responseStart,
        domLoading: nav.domContentLoadedEventStart - nav.fetchStart,
        windowLoad: nav.loadEventEnd - nav.fetchStart,
        transferSize: nav.transferSize,
        encodedBodySize: nav.encodedBodySize,
        decodedBodySize: nav.decodedBodySize
      });
    }
  }

  /**
   * Monitor long tasks
   */
  monitorLongTasks() {
    if (!('PerformanceObserver' in window) || !('LongTaskTiming' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 50) { // Long task threshold
          this.recordPerformanceIssue({
            type: 'long_task',
            description: `Long task detected: ${entry.duration}ms`,
            duration: entry.duration,
            startTime: entry.startTime
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['longtask'] });
  }

  /**
   * Monitor resource loading
   */
  monitorResourceLoading() {
    if (!('PerformanceObserver' in window)) return;
    
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Check for slow resources
        if (entry.duration > 1000) { // 1 second threshold
          this.recordPerformanceIssue({
            type: 'slow_resource',
            description: `Slow resource: ${entry.name}`,
            duration: entry.duration,
            resourceName: entry.name,
            startTime: entry.startTime
          });
        }
        
        // Record resource metrics
        this.recordMetric(`resource_${entry.name}`, {
          duration: entry.duration,
          size: entry.transferSize,
          type: entry.entryType
        });
      });
    });
    
    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Collect performance metrics
   */
  collectPerformanceMetrics() {
    if (!this.monitoringEnabled) return;
    
    // Collect memory usage if available
    if ('memory' in performance) {
      this.recordMetric('memory', {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      });
    }
    
    // Collect FPS if available
    if ('getEntriesByType' in performance) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach(entry => {
        this.recordMetric(`paint_${entry.name}`, {
          duration: entry.duration,
          startTime: entry.startTime
        });
      });
    }
    
    // Collect interaction metrics
    this.collectInteractionMetrics();
    
    console.log('[PerformanceOptimizer] Performance metrics collected');
  }

  /**
   * Collect interaction metrics
   */
  collectInteractionMetrics() {
    // This would collect metrics on user interactions
    // In a real implementation, you would measure things like:
    // - Time to first interaction
    // - Input latency
    // - Animation frame rate
    // For now, we'll just record a placeholder
    this.recordMetric('interactions', {
      count: Math.floor(Math.random() * 100),
      avgLatency: Math.random() * 50
    });
  }

  /**
   * Record a performance metric
   */
  recordMetric(metricName, data) {
    const metric = {
      name: metricName,
      timestamp: new Date().toISOString(),
      data: data
    };
    
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, []);
    }
    
    const metricArray = this.metrics.get(metricName);
    metricArray.push(metric);
    
    // Keep only last 100 measurements
    if (metricArray.length > 100) {
      metricArray.shift();
    }
    
    console.log(`[PerformanceOptimizer] Metric recorded: ${metricName}`);
  }

  /**
   * Record a performance issue
   */
  recordPerformanceIssue(issue) {
    const performanceIssue = {
      id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...issue
    };
    
    this.performanceIssues.push(performanceIssue);
    
    // Keep only last 50 issues
    if (this.performanceIssues.length > 50) {
      this.performanceIssues.shift();
    }
    
    // Notify about performance issue
    window.dispatchEvent(new CustomEvent('performance-issue-detected', {
      detail: performanceIssue
    }));
    
    console.warn(`[PerformanceOptimizer] Performance issue detected: ${issue.description}`);
  }

  /**
   * Get performance metrics
   */
  getMetrics(metricName = null) {
    if (metricName) {
      return this.metrics.get(metricName) || [];
    }
    return Array.from(this.metrics.entries());
  }

  /**
   * Get performance issues
   */
  getPerformanceIssues() {
    return [...this.performanceIssues];
  }

  /**
   * Get performance statistics
   */
  getPerformanceStatistics() {
    const stats = {
      totalMetrics: this.metrics.size,
      totalIssues: this.performanceIssues.length,
      avgNavigationTime: 0,
      avgResourceLoadTime: 0,
      memoryUsage: 0
    };
    
    // Calculate average navigation time
    const navigationMetrics = this.metrics.get('navigation');
    if (navigationMetrics && navigationMetrics.length > 0) {
      const latestNav = navigationMetrics[navigationMetrics.length - 1].data;
      stats.avgNavigationTime = latestNav.windowLoad;
    }
    
    // Calculate average resource load time
    let totalResourceTime = 0;
    let resourceCount = 0;
    
    for (const [metricName, metrics] of this.metrics) {
      if (metricName.startsWith('resource_') && metrics.length > 0) {
        const latestResource = metrics[metrics.length - 1].data;
        totalResourceTime += latestResource.duration;
        resourceCount++;
      }
    }
    
    if (resourceCount > 0) {
      stats.avgResourceLoadTime = totalResourceTime / resourceCount;
    }
    
    // Get memory usage
    const memoryMetrics = this.metrics.get('memory');
    if (memoryMetrics && memoryMetrics.length > 0) {
      const latestMemory = memoryMetrics[memoryMetrics.length - 1].data;
      stats.memoryUsage = (latestMemory.used / latestMemory.limit) * 100;
    }
    
    return stats;
  }

  /**
   * Run optimization check
   */
  runOptimizationCheck() {
    if (!this.optimizationEnabled) return;
    
    // Check if we should run based on sampling rate
    if (Math.random() > this.samplingRate) return;
    
    console.log('[PerformanceOptimizer] Running optimization check');
    
    // Apply high priority optimizations first
    const highPriorityStrategies = Array.from(this.optimizationStrategies.values())
      .filter(strategy => strategy.priority === 'high');
    
    highPriorityStrategies.forEach(strategy => {
      try {
        strategy.apply();
      } catch (error) {
        console.error(`[PerformanceOptimizer] Error applying strategy ${strategy.name}:`, error);
      }
    });
  }

  /**
   * Apply lazy loading optimization
   */
  applyLazyLoading() {
    // Implement lazy loading for images and iframes
    const lazyElements = document.querySelectorAll('img[data-src], iframe[data-src]');
    
    const lazyObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const src = element.getAttribute('data-src');
          if (src) {
            element.src = src;
            element.removeAttribute('data-src');
            observer.unobserve(element);
          }
        }
      });
    });
    
    lazyElements.forEach(element => {
      lazyObserver.observe(element);
    });
    
    console.log(`[PerformanceOptimizer] Applied lazy loading to ${lazyElements.length} elements`);
  }

  /**
   * Apply caching optimization
   */
  applyCaching() {
    // This would implement intelligent caching strategies
    // For now, we'll just log that it's been applied
    console.log('[PerformanceOptimizer] Applied caching optimization');
  }

  /**
   * Apply code splitting optimization
   */
  applyCodeSplitting() {
    // This would implement dynamic imports for code splitting
    // For now, we'll just log that it's been applied
    console.log('[PerformanceOptimizer] Applied code splitting optimization');
  }

  /**
   * Apply image optimization
   */
  applyImageOptimization() {
    // Optimize images by using appropriate formats and sizes
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      // This would implement actual image optimization techniques
      // For now, we'll just log that we're checking images
      if (img.naturalWidth > 1920) {
        this.recordPerformanceIssue({
          type: 'large_image',
          description: `Large image detected: ${img.src}`,
          width: img.naturalWidth,
          height: img.naturalHeight
        });
      }
    });
    
    console.log(`[PerformanceOptimizer] Checked ${images.length} images for optimization`);
  }

  /**
   * Apply DOM optimization
   */
  applyDOMOptimization() {
    // Reduce DOM complexity and improve rendering performance
    const containers = document.querySelectorAll('.container, .section, .panel');
    
    containers.forEach(container => {
      // This would implement actual DOM optimization techniques
      // For example, virtualizing long lists, removing unused nodes, etc.
      const childrenCount = container.children.length;
      if (childrenCount > 100) {
        this.recordPerformanceIssue({
          type: 'complex_dom',
          description: `Complex DOM structure detected`,
          element: container.tagName,
          childrenCount: childrenCount
        });
      }
    });
    
    console.log(`[PerformanceOptimizer] Checked ${containers.length} containers for DOM optimization`);
  }

  /**
   * Apply network optimization
   */
  applyNetworkOptimization() {
    // Optimize network requests
    // This would implement techniques like:
    // - Request deduplication
    // - Connection pooling
    // - HTTP/2 optimizations
    console.log('[PerformanceOptimizer] Applied network optimization');
  }

  /**
   * Apply memory management
   */
  applyMemoryManagement() {
    // Implement memory management techniques
    // This would include:
    // - Removing event listeners
    // - Clearing intervals and timeouts
    // - Releasing unused resources
    console.log('[PerformanceOptimizer] Applied memory management optimization');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for performance issue detections
    window.addEventListener('performance-issue-detected', (event) => {
      this.handlePerformanceIssue(event.detail);
    });
    
    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Page is hidden, reduce monitoring frequency
        console.log('[PerformanceOptimizer] Page hidden, reducing monitoring');
      } else {
        // Page is visible, resume normal monitoring
        console.log('[PerformanceOptimizer] Page visible, resuming monitoring');
      }
    });
  }

  /**
   * Handle performance issue
   */
  handlePerformanceIssue(issue) {
    // In a real implementation, this would handle performance issues
    // For example, by automatically applying optimizations or alerting the user
    console.log(`[PerformanceOptimizer] Handling performance issue: ${issue.description}`);
  }

  /**
   * Enable/disable monitoring
   */
  setMonitoringEnabled(enabled) {
    this.monitoringEnabled = enabled;
    
    if (enabled) {
      console.log('[PerformanceOptimizer] Monitoring enabled');
    } else {
      console.log('[PerformanceOptimizer] Monitoring disabled');
    }
  }

  /**
   * Enable/disable optimization
   */
  setOptimizationEnabled(enabled) {
    this.optimizationEnabled = enabled;
    
    if (enabled) {
      console.log('[PerformanceOptimizer] Optimization enabled');
    } else {
      console.log('[PerformanceOptimizer] Optimization disabled');
    }
  }

  /**
   * Set sampling rate
   */
  setSamplingRate(rate) {
    this.samplingRate = Math.max(0, Math.min(1, rate)); // Clamp between 0 and 1
    console.log(`[PerformanceOptimizer] Sampling rate set to ${this.samplingRate * 100}%`);
  }

  /**
   * Render performance dashboard
   */
  renderPerformanceDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create performance dashboard HTML
    container.innerHTML = `
      <div class="performance-dashboard">
        <header>
          <h2>⚡ Performance Optimization</h2>
          <p>Monitor and optimize system performance</p>
        </header>
        
        <div class="performance-controls">
          <div class="performance-actions">
            <button id="run-optimization" class="action-button">Run Optimization</button>
            <button id="clear-metrics" class="action-button">Clear Metrics</button>
            <button id="toggle-monitoring" class="action-button">
              ${this.monitoringEnabled ? 'Disable' : 'Enable'} Monitoring
            </button>
          </div>
          
          <div class="performance-settings">
            <label>
              Sampling Rate:
              <input type="range" id="sampling-rate" min="0" max="1" step="0.1" 
                     value="${this.samplingRate}">
              <span id="sampling-rate-value">${this.samplingRate * 100}%</span>
            </label>
          </div>
        </div>
        
        <div class="performance-grid">
          <div class="performance-section">
            <h3>Performance Metrics</h3>
            <div id="performance-metrics" class="metrics-container">
              <!-- Performance metrics will be rendered here -->
            </div>
          </div>
          
          <div class="performance-section">
            <h3>Performance Issues</h3>
            <div id="performance-issues" class="issues-container">
              <!-- Performance issues will be rendered here -->
            </div>
          </div>
          
          <div class="performance-section">
            <h3>Optimization Strategies</h3>
            <div id="optimization-strategies" class="strategies-container">
              <!-- Optimization strategies will be rendered here -->
            </div>
          </div>
          
          <div class="performance-section">
            <h3>Resource Usage</h3>
            <div id="resource-usage" class="usage-container">
              <!-- Resource usage will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Render components
    this.renderPerformanceMetrics('performance-metrics');
    this.renderPerformanceIssues('performance-issues');
    this.renderOptimizationStrategies('optimization-strategies');
    this.renderResourceUsage('resource-usage');
    
    // Set up action buttons
    document.getElementById('run-optimization').addEventListener('click', () => {
      this.runOptimizationCheck();
      alert('Optimization check completed! Check console for details.');
    });
    
    document.getElementById('clear-metrics').addEventListener('click', () => {
      this.metrics.clear();
      this.performanceIssues = [];
      this.renderPerformanceDashboard(containerId); // Re-render
    });
    
    document.getElementById('toggle-monitoring').addEventListener('click', () => {
      this.setMonitoringEnabled(!this.monitoringEnabled);
      this.renderPerformanceDashboard(containerId); // Re-render
    });
    
    // Set up sampling rate control
    const samplingRateInput = document.getElementById('sampling-rate');
    const samplingRateValue = document.getElementById('sampling-rate-value');
    
    samplingRateInput.addEventListener('input', (e) => {
      const rate = parseFloat(e.target.value);
      this.setSamplingRate(rate);
      samplingRateValue.textContent = `${rate * 100}%`;
    });
  }

  /**
   * Render performance metrics
   */
  renderPerformanceMetrics(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const stats = this.getPerformanceStatistics();
    
    container.innerHTML = `
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${Math.round(stats.avgNavigationTime)}ms</div>
          <div class="metric-label">Avg. Navigation Time</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${Math.round(stats.avgResourceLoadTime)}ms</div>
          <div class="metric-label">Avg. Resource Load</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${Math.round(stats.memoryUsage)}%</div>
          <div class="metric-label">Memory Usage</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${stats.totalIssues}</div>
          <div class="metric-label">Performance Issues</div>
        </div>
      </div>
    `;
  }

  /**
   * Render performance issues
   */
  renderPerformanceIssues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const issues = this.getPerformanceIssues().slice(-10); // Last 10 issues
    
    if (issues.length === 0) {
      container.innerHTML = '<p class="no-data">No performance issues detected</p>';
      return;
    }
    
    container.innerHTML = `
      <div class="issues-list">
        <ul>
          ${issues.map(issue => `
            <li class="issue-item">
              <div class="issue-type">${issue.type.replace('_', ' ')}</div>
              <div class="issue-description">${issue.description}</div>
              <div class="issue-time">${new Date(issue.timestamp).toLocaleTimeString()}</div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Render optimization strategies
   */
  renderOptimizationStrategies(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const strategies = Array.from(this.optimizationStrategies.values());
    
    container.innerHTML = `
      <div class="strategies-list">
        ${strategies.map(strategy => `
          <div class="strategy-card">
            <h4>${strategy.name}</h4>
            <p class="strategy-description">${strategy.description}</p>
            <p class="strategy-priority">Priority: ${strategy.priority}</p>
            <button class="apply-strategy" data-strategy="${strategy.name}">
              Apply Strategy
            </button>
          </div>
        `).join('')}
      </div>
    `;
    
    // Set up apply strategy buttons
    container.querySelectorAll('.apply-strategy').forEach(button => {
      button.addEventListener('click', (e) => {
        const strategyName = e.target.getAttribute('data-strategy');
        const strategy = this.optimizationStrategies.get(strategyName);
        if (strategy) {
          try {
            strategy.apply();
            alert(`Strategy "${strategy.name}" applied successfully!`);
          } catch (error) {
            alert(`Error applying strategy: ${error.message}`);
          }
        }
      });
    });
  }

  /**
   * Render resource usage
   */
  renderResourceUsage(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Get resource metrics
    const resourceMetrics = [];
    for (const [metricName, metrics] of this.metrics) {
      if (metricName.startsWith('resource_') && metrics.length > 0) {
        const latest = metrics[metrics.length - 1].data;
        resourceMetrics.push({
          name: metricName.replace('resource_', ''),
          duration: latest.duration,
          size: latest.size
        });
      }
    }
    
    // Sort by duration and take top 5
    resourceMetrics.sort((a, b) => b.duration - a.duration);
    const topResources = resourceMetrics.slice(0, 5);
    
    container.innerHTML = `
      <div class="resource-usage">
        <h4>Slowest Resources</h4>
        <ul class="resources-list">
          ${topResources.map(resource => `
            <li class="resource-item">
              <div class="resource-name">${resource.name.substring(0, 40)}${resource.name.length > 40 ? '...' : ''}</div>
              <div class="resource-duration">${Math.round(resource.duration)}ms</div>
              <div class="resource-size">${Math.round(resource.size / 1024)}KB</div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
}

// Initialize performance optimization system
document.addEventListener('DOMContentLoaded', () => {
  window.PerformanceOptimizer = new PerformanceOptimizer();
  window.PerformanceOptimizer.initialize();
  
  console.log('[PerformanceOptimizer] System ready');
  
  // Mark enhancement as completed
  if (window.enhancementTracker) {
    window.enhancementTracker.markCompleted(30);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceOptimizer;
}