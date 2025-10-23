/**
 * Security Manager
 * Input validation, XSS protection, rate limiting, security hardening
 */

class SecurityManager {
    constructor() {
        this.rateLimits = new Map();
        this.bannedPatterns = [
            /<script[^>]*>.*?<\/script>/gi,
            /<iframe[^>]*>.*?<\/iframe>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi, // onclick, onerror, etc.
            /<embed[^>]*>/gi,
            /<object[^>]*>/gi
        ];
        
        this.maxRequestsPerMinute = 60;
        this.maxMessageLength = 5000;
        
        console.log('🔐 Security Manager initialized');
    }
    
    /**
     * Sanitize user input (XSS protection)
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return input;
        }
        
        let sanitized = input;
        
        // Remove dangerous patterns
        this.bannedPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        // HTML encode special characters
        sanitized = sanitized
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        
        return sanitized;
    }
    
    /**
     * Validate message input
     */
    validateMessage(message) {
        if (!message || typeof message !== 'string') {
            return {
                valid: false,
                error: 'Messaggio non valido'
            };
        }
        
        const trimmed = message.trim();
        
        if (trimmed.length === 0) {
            return {
                valid: false,
                error: 'Messaggio vuoto'
            };
        }
        
        if (trimmed.length > this.maxMessageLength) {
            return {
                valid: false,
                error: `Messaggio troppo lungo (max ${this.maxMessageLength} caratteri)`
            };
        }
        
        // Check for suspicious patterns
        if (this.hasSuspiciousContent(trimmed)) {
            return {
                valid: false,
                error: 'Contenuto non valido rilevato'
            };
        }
        
        return {
            valid: true,
            sanitized: this.sanitizeInput(trimmed)
        };
    }
    
    /**
     * Check for suspicious content
     */
    hasSuspiciousContent(text) {
        return this.bannedPatterns.some(pattern => pattern.test(text));
    }
    
    /**
     * Rate limiting check
     */
    checkRateLimit(userId = 'anonymous') {
        const now = Date.now();
        const userRequests = this.rateLimits.get(userId) || [];
        
        // Remove requests older than 1 minute
        const recentRequests = userRequests.filter(time => now - time < 60000);
        
        if (recentRequests.length >= this.maxRequestsPerMinute) {
            return {
                allowed: false,
                error: 'Rate limit exceeded. Riprova tra un minuto.',
                retryAfter: 60
            };
        }
        
        // Add current request
        recentRequests.push(now);
        this.rateLimits.set(userId, recentRequests);
        
        return {
            allowed: true,
            remaining: this.maxRequestsPerMinute - recentRequests.length
        };
    }
    
    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * Validate PIN format (6 digits)
     */
    validatePIN(pin) {
        const pinRegex = /^\d{6}$/;
        return pinRegex.test(pin);
    }
    
    /**
     * Content Security Policy check
     */
    checkCSP() {
        const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
        if (!csp) {
            console.warn('⚠️  CSP not configured - recommended for production');
            return false;
        }
        return true;
    }
    
    /**
     * Secure localStorage operations
     */
    secureSet(key, value) {
        try {
            // Add prefix for namespace isolation
            const secureKey = `zantara-${key}`;
            const data = {
                value: value,
                timestamp: Date.now(),
                checksum: this.generateChecksum(JSON.stringify(value))
            };
            localStorage.setItem(secureKey, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('❌ Secure storage failed:', error);
            return false;
        }
    }
    
    /**
     * Secure localStorage retrieval
     */
    secureGet(key) {
        try {
            const secureKey = `zantara-${key}`;
            const stored = localStorage.getItem(secureKey);
            if (!stored) return null;
            
            const data = JSON.parse(stored);
            
            // Verify checksum
            const expectedChecksum = this.generateChecksum(JSON.stringify(data.value));
            if (data.checksum !== expectedChecksum) {
                console.warn('⚠️  Data integrity check failed');
                return null;
            }
            
            return data.value;
        } catch (error) {
            console.error('❌ Secure retrieval failed:', error);
            return null;
        }
    }
    
    /**
     * Generate simple checksum
     */
    generateChecksum(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    }
    
    /**
     * Prevent clickjacking
     */
    preventClickjacking() {
        if (window.top !== window.self) {
            console.warn('⚠️  Clickjacking attempt detected');
            window.top.location = window.self.location;
        }
    }
    
    /**
     * Initialize security features
     */
    init() {
        this.checkCSP();
        this.preventClickjacking();
        
        // Clear old rate limit data periodically
        setInterval(() => {
            const now = Date.now();
            this.rateLimits.forEach((requests, userId) => {
                const recent = requests.filter(time => now - time < 60000);
                if (recent.length === 0) {
                    this.rateLimits.delete(userId);
                } else {
                    this.rateLimits.set(userId, recent);
                }
            });
        }, 60000); // Every minute
        
        console.log('🔐 Security features initialized');
    }
    
    /**
     * Security audit report
     */
    getSecurityAudit() {
        return {
            csp: this.checkCSP(),
            clickjacking: window.top === window.self,
            https: window.location.protocol === 'https:',
            rateLimit: this.rateLimits.size,
            recommendations: this.getRecommendations()
        };
    }
    
    /**
     * Get security recommendations
     */
    getRecommendations() {
        const recommendations = [];
        
        if (!this.checkCSP()) {
            recommendations.push('Configure Content-Security-Policy header');
        }
        
        if (window.location.protocol !== 'https:') {
            recommendations.push('Use HTTPS in production');
        }
        
        return recommendations;
    }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityManager;
} else {
    window.SecurityManager = SecurityManager;
}

