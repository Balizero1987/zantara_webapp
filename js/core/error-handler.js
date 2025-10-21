/**
 * Enhanced Error Handler with Context
 * 
 * Provides detailed error information for debugging and user-friendly messages.
 * Automatically catches unhandled errors and promise rejections.
 */

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 50;
    this.listeners = [];
    
    // Setup global error handlers
    this.setupGlobalHandlers();
  }

  setupGlobalHandlers() {
    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handle({
        type: 'unhandled_promise',
        error: event.reason,
        promise: event.promise
      });
      
      // Prevent default console error
      event.preventDefault();
    });

    // Catch global errors
    window.addEventListener('error', (event) => {
      // Skip if it's from script loading
      if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
        return;
      }
      
      this.handle({
        type: 'global_error',
        error: event.error,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
      
      // Prevent default console error for handled errors
      event.preventDefault();
    });
  }

  handle(errorContext) {
    const enrichedError = this.enrichError(errorContext);
    
    // Log to console in dev mode
    if (this.isDevMode()) {
      console.group('❌ Error Caught by ZANTARA Error Handler');
      console.error('Type:', enrichedError.type);
      console.error('Message:', enrichedError.message);
      console.error('Severity:', enrichedError.severity);
      console.error('Context:', enrichedError.context);
      if (enrichedError.stack) {
        console.error('Stack:', enrichedError.stack);
      }
      console.groupEnd();
    }

    // Add to error log
    this.errorLog.push(enrichedError);
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Notify listeners
    this.notifyListeners(enrichedError);

    // Send to backend (only high severity in production)
    if (this.shouldReportToBackend(enrichedError)) {
      this.reportToBackend(enrichedError).catch(e => {
        console.warn('Failed to report error to backend:', e.message);
      });
    }

    // Show user-friendly message
    this.showUserMessage(enrichedError);
  }

  enrichError(errorContext) {
    const error = errorContext.error || {};
    
    return {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type: errorContext.type || 'unknown',
      message: error.message || errorContext.message || 'Unknown error',
      stack: error.stack || '',
      context: {
        url: window.location.href,
        pathname: window.location.pathname,
        userAgent: navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        online: navigator.onLine,
        storage: {
          hasToken: !!localStorage.getItem('zantara-auth-token'),
          hasUser: !!localStorage.getItem('zantara-user'),
          hasSessionId: !!localStorage.getItem('zantara-session-id')
        },
        api: {
          baseUrl: window.ZANTARA_API?.config?.production?.base,
          proxyUrl: window.ZANTARA_API?.config?.proxy?.production?.base,
          mode: window.ZANTARA_API?.config?.mode
        },
        filename: errorContext.filename,
        lineno: errorContext.lineno,
        colno: errorContext.colno
      },
      severity: this.determineSeverity(error),
      userImpact: this.determineUserImpact(error),
      category: this.categorizeError(error)
    };
  }

  determineSeverity(error) {
    if (!error) return 'low';
    
    const message = (error.message || '').toLowerCase();
    
    // Critical errors
    if (message.includes('script error') || 
        message.includes('chunk') || 
        message.includes('module')) {
      return 'critical';
    }
    
    // High severity
    if (message.includes('network') || 
        message.includes('fetch') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('500')) {
      return 'high';
    }
    
    // Medium severity
    if (message.includes('not authenticated') || 
        message.includes('unauthorized') ||
        message.includes('401') ||
        message.includes('timeout') ||
        message.includes('403')) {
      return 'medium';
    }
    
    return 'low';
  }

  categorizeError(error) {
    const message = (error?.message || '').toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) return 'network';
    if (message.includes('auth') || message.includes('401') || message.includes('403')) return 'auth';
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('502') || message.includes('503')) return 'backend';
    if (message.includes('not found') || message.includes('404')) return 'not_found';
    if (message.includes('syntax') || message.includes('reference')) return 'code';
    
    return 'unknown';
  }

  determineUserImpact(error) {
    const message = (error?.message || '').toLowerCase();
    
    if (message.includes('network') || message.includes('failed to fetch')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    if (message.includes('502') || message.includes('503')) {
      return 'Service temporarily unavailable. Retrying automatically...';
    }
    if (message.includes('500')) {
      return 'Server error. Our team has been notified.';
    }
    if (message.includes('401') || message.includes('not authenticated')) {
      return 'Your session has expired. Please log in again.';
    }
    if (message.includes('403')) {
      return 'You don\'t have permission to perform this action.';
    }
    if (message.includes('timeout')) {
      return 'Request took too long. Please try again.';
    }
    if (message.includes('handler_not_found') || message.includes('404')) {
      return 'Feature not available. Please contact support if this persists.';
    }
    
    return 'Something went wrong. Please try again.';
  }

  shouldReportToBackend(error) {
    // Only report high/critical severity errors in production
    return !this.isDevMode() && 
           (error.severity === 'high' || error.severity === 'critical');
  }

  async reportToBackend(error) {
    try {
      // Don't use apiClient to avoid circular errors
      const response = await fetch('https://ts-backend-production-568d.up.railway.app/call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        body: JSON.stringify({
          key: 'system.error.report',
          params: {
            error: {
              id: error.id,
              type: error.type,
              message: error.message,
              severity: error.severity,
              category: error.category,
              timestamp: error.timestamp,
              context: {
                url: error.context.url,
                pathname: error.context.pathname,
                userAgent: error.context.userAgent,
                viewport: error.context.viewport,
                online: error.context.online
              }
            }
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Report failed: ${response.status}`);
      }
    } catch (e) {
      // Silently fail - don't create error loop
      if (this.isDevMode()) {
        console.warn('[ErrorHandler] Failed to report error to backend:', e.message);
      }
    }
  }

  showUserMessage(error) {
    // Only show for medium/high/critical severity
    if (error.severity === 'low') return;

    // Check if notification already visible
    if (document.querySelector('.zantara-error-notification')) return;

    const notification = document.createElement('div');
    notification.className = 'zantara-error-notification';
    
    // Different styles based on severity
    const colors = {
      critical: { bg: 'rgba(220, 38, 38, 0.95)', icon: '🔴' },
      high: { bg: 'rgba(239, 68, 68, 0.95)', icon: '⚠️' },
      medium: { bg: 'rgba(251, 146, 60, 0.95)', icon: '⚡' }
    };
    
    const style = colors[error.severity] || colors.high;
    
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      max-width: 400px;
      background: ${style.bg};
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      z-index: 10000;
      animation: slideInRight 0.3s ease;
      backdrop-filter: blur(10px);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    notification.innerHTML = `
      <div style="display: flex; align-items: start; gap: 12px;">
        <div style="font-size: 24px; line-height: 1;">${style.icon}</div>
        <div style="flex: 1;">
          <div style="font-weight: 600; font-size: 15px; margin-bottom: 6px;">
            ${error.severity === 'critical' ? 'Critical Error' : 
              error.severity === 'high' ? 'Error' : 'Warning'}
          </div>
          <div style="font-size: 14px; opacity: 0.95; line-height: 1.4;">
            ${error.userImpact}
          </div>
          ${this.isDevMode() ? `
            <div style="font-size: 11px; opacity: 0.7; margin-top: 8px; font-family: monospace;">
              ${error.category} • ${error.id}
            </div>
          ` : ''}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: none; border: none; color: white; cursor: pointer; 
                       font-size: 24px; padding: 0; line-height: 1; opacity: 0.8;
                       transition: opacity 0.2s;"
                onmouseover="this.style.opacity='1'"
                onmouseout="this.style.opacity='0.8'">
          ×
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after duration based on severity
    const duration = error.severity === 'critical' ? 10000 : 
                    error.severity === 'high' ? 7000 : 5000;
    
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
      }
    }, duration);
  }

  onError(callback) {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  notifyListeners(error) {
    this.listeners.forEach(callback => {
      try {
        callback(error);
      } catch (e) {
        console.error('[ErrorHandler] Listener error:', e);
      }
    });
  }

  getErrorLog() {
    return [...this.errorLog];
  }

  getErrorStats() {
    const byType = {};
    const bySeverity = { low: 0, medium: 0, high: 0, critical: 0 };
    const byCategory = {};

    this.errorLog.forEach(error => {
      byType[error.type] = (byType[error.type] || 0) + 1;
      bySeverity[error.severity]++;
      byCategory[error.category] = (byCategory[error.category] || 0) + 1;
    });

    return {
      total: this.errorLog.length,
      byType,
      bySeverity,
      byCategory,
      recentErrors: this.errorLog.slice(-5).map(e => ({
        id: e.id,
        type: e.type,
        message: e.message,
        severity: e.severity,
        category: e.category,
        timestamp: e.timestamp
      }))
    };
  }

  clearErrorLog() {
    this.errorLog = [];
    console.log('[ErrorHandler] Error log cleared');
  }

  isDevMode() {
    return window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1' ||
           new URLSearchParams(window.location.search).get('dev') === 'true';
  }

  // Manual error reporting (for try-catch blocks)
  report(error, context = {}) {
    this.handle({
      type: 'manual_report',
      error,
      ...context
    });
  }
}

// CSS animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from {
        transform: translateX(450px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(450px);
        opacity: 0;
      }
    }

    .zantara-error-notification button:focus {
      outline: 2px solid rgba(255, 255, 255, 0.5);
      outline-offset: 2px;
      border-radius: 4px;
    }
  `;
  document.head.appendChild(style);
}

// Export singleton
export const errorHandler = new ErrorHandler();

// Expose globally for debugging
if (typeof window !== 'undefined') {
  window.ZANTARA_ERROR_HANDLER = {
    getLog: () => errorHandler.getErrorLog(),
    getStats: () => errorHandler.getErrorStats(),
    clear: () => errorHandler.clearErrorLog(),
    report: (error, context) => errorHandler.report(error, context),
    onError: (callback) => errorHandler.onError(callback)
  };
}

export default errorHandler;
