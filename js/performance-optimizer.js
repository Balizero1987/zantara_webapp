/**
 * Performance Optimizer
 * Lazy loading, code splitting, performance monitoring
 */

class PerformanceOptimizer {
    constructor() {
        this.metrics = {
            loadTime: 0,
            apiCalls: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0
        };
        
        this.observers = new Map();
        this.measureLoadTime();
        
        console.log('⚡ Performance Optimizer initialized');
    }
    
    /**
     * Measure page load time
     */
    measureLoadTime() {
        if (window.performance && window.performance.timing) {
            window.addEventListener('load', () => {
                const timing = performance.timing;
                this.metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
                console.log(`⚡ Page load time: ${this.metrics.loadTime}ms`);
                
                // Log Core Web Vitals
                this.measureCoreWebVitals();
            });
        }
    }
    
    /**
     * Measure Core Web Vitals
     */
    measureCoreWebVitals() {
        if ('PerformanceObserver' in window) {
            // Largest Contentful Paint (LCP)
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log(`⚡ LCP: ${lastEntry.renderTime || lastEntry.loadTime}ms`);
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', lcpObserver);
            
            // First Input Delay (FID)
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    console.log(`⚡ FID: ${entry.processingStart - entry.startTime}ms`);
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
            this.observers.set('fid', fidObserver);
            
            // Cumulative Layout Shift (CLS)
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        console.log(`⚡ CLS: ${clsValue.toFixed(4)}`);
                    }
                }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', clsObserver);
        }
    }
    
    /**
     * Lazy load module on demand
     */
    async lazyLoadModule(modulePath) {
        try {
            const module = await import(modulePath);
            console.log(`⚡ Lazy loaded: ${modulePath}`);
            return module;
        } catch (error) {
            console.error(`❌ Failed to lazy load ${modulePath}:`, error);
            return null;
        }
    }
    
    /**
     * Prefetch resource
     */
    prefetch(url) {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = url;
        document.head.appendChild(link);
        console.log(`⚡ Prefetching: ${url}`);
    }
    
    /**
     * Debounce function calls
     */
    debounce(func, wait = 300) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    /**
     * Throttle function calls
     */
    throttle(func, limit = 1000) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    /**
     * Track API call performance
     */
    trackAPICall(duration, success) {
        this.metrics.apiCalls++;
        if (success) {
            console.log(`⚡ API call: ${duration}ms`);
        } else {
            this.metrics.errors++;
            console.log(`❌ API call failed: ${duration}ms`);
        }
    }
    
    /**
     * Track cache performance
     */
    trackCache(hit) {
        if (hit) {
            this.metrics.cacheHits++;
            console.log('💾 Cache hit');
        } else {
            this.metrics.cacheMisses++;
            console.log('💾 Cache miss');
        }
    }
    
    /**
     * Get performance report
     */
    getReport() {
        const cacheHitRate = this.metrics.cacheHits / (this.metrics.cacheHits + this.metrics.cacheMisses) * 100;
        const errorRate = this.metrics.errors / this.metrics.apiCalls * 100;
        
        return {
            loadTime: `${this.metrics.loadTime}ms`,
            apiCalls: this.metrics.apiCalls,
            cacheHitRate: `${cacheHitRate.toFixed(1)}%`,
            errorRate: `${errorRate.toFixed(1)}%`,
            totalCacheHits: this.metrics.cacheHits,
            totalCacheMisses: this.metrics.cacheMisses,
            totalErrors: this.metrics.errors
        };
    }
    
    /**
     * Optimize images lazy loading
     */
    setupLazyImages() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });
            
            document.querySelectorAll('img.lazy').forEach(img => {
                imageObserver.observe(img);
            });
            
            console.log('⚡ Lazy image loading enabled');
        }
    }
    
    /**
     * Cleanup on page unload
     */
    cleanup() {
        this.observers.forEach((observer, key) => {
            observer.disconnect();
            console.log(`⚡ Disconnected observer: ${key}`);
        });
        this.observers.clear();
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
} else {
    window.PerformanceOptimizer = PerformanceOptimizer;
}

