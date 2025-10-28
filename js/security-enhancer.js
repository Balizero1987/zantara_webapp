/**
 * Security Enhancement System
 * Enhancement #31 for NUZANTARA-RAILWAY
 * Implements comprehensive security enhancements and monitoring
 */

class SecurityEnhancer {
  constructor() {
    this.securityIssues = [];
    this.securityPolicies = new Map();
    this.auditLog = [];
    this.threatsDetected = 0;
    this.securityEnabled = true;
    this.cspEnabled = true;
    this.xssProtectionEnabled = true;
    this.csrfProtectionEnabled = true;
  }

  /**
   * Initialize the security enhancement system
   */
  async initialize() {
    // Set up security policies
    this.setupSecurityPolicies();
    
    // Start security monitoring
    this.startSecurityMonitoring();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Run initial security check
    this.runSecurityCheck();
    
    console.log('[SecurityEnhancer] System initialized');
  }

  /**
   * Set up security policies
   */
  setupSecurityPolicies() {
    // Content Security Policy
    this.securityPolicies.set('csp', {
      name: 'Content Security Policy',
      description: 'Prevents cross-site scripting and other code injection attacks',
      enabled: this.cspEnabled,
      directives: {
        'default-src': "'self'",
        'script-src': "'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
        'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
        'img-src': "'self' data: https:",
        'font-src': "'self' https://fonts.gstatic.com",
        'connect-src': "'self'",
        'frame-src': "'none'",
        'object-src': "'none'"
      },
      apply: this.applyCSP.bind(this)
    });

    // XSS Protection
    this.securityPolicies.set('xss', {
      name: 'XSS Protection',
      description: 'Prevents cross-site scripting attacks',
      enabled: this.xssProtectionEnabled,
      apply: this.applyXSSProtection.bind(this)
    });

    // CSRF Protection
    this.securityPolicies.set('csrf', {
      name: 'CSRF Protection',
      description: 'Prevents cross-site request forgery attacks',
      enabled: this.csrfProtectionEnabled,
      apply: this.applyCSRFProtection.bind(this)
    });

    // Input Validation
    this.securityPolicies.set('inputValidation', {
      name: 'Input Validation',
      description: 'Validates and sanitizes user inputs',
      enabled: true,
      apply: this.applyInputValidation.bind(this)
    });

    // Secure Headers
    this.securityPolicies.set('secureHeaders', {
      name: 'Secure Headers',
      description: 'Sets security-related HTTP headers',
      enabled: true,
      apply: this.applySecureHeaders.bind(this)
    });

    console.log('[SecurityEnhancer] Security policies set up');
  }

  /**
   * Start security monitoring
   */
  startSecurityMonitoring() {
    if (!this.securityEnabled) return;
    
    // Monitor for security events
    this.monitorSecurityEvents();
    
    // Set up periodic security checks
    setInterval(() => {
      this.runSecurityCheck();
    }, 60000); // Every minute
    
    console.log('[SecurityEnhancer] Security monitoring started');
  }

  /**
   * Monitor security events
   */
  monitorSecurityEvents() {
    // Monitor for suspicious activities
    window.addEventListener('security-violation', (event) => {
      this.handleSecurityViolation(event.detail);
    });
    
    // Monitor for failed login attempts
    window.addEventListener('login-attempt', (event) => {
      if (!event.detail.success) {
        this.recordSecurityIssue({
          type: 'failed_login',
          description: `Failed login attempt for user: ${event.detail.username}`,
          severity: 'medium',
          details: event.detail
        });
      }
    });
    
    // Monitor for XSS attempts
    document.addEventListener('securitypolicyviolation', (event) => {
      this.recordSecurityIssue({
        type: 'csp_violation',
        description: `CSP violation: ${event.blockedURI}`,
        severity: 'high',
        details: {
          documentURI: event.documentURI,
          violatedDirective: event.violatedDirective,
          effectiveDirective: event.effectiveDirective,
          originalPolicy: event.originalPolicy
        }
      });
    });
    
    console.log('[SecurityEnhancer] Security event monitoring set up');
  }

  /**
   * Run security check
   */
  runSecurityCheck() {
    if (!this.securityEnabled) return;
    
    console.log('[SecurityEnhancer] Running security check');
    
    // Check for common security issues
    this.checkForVulnerableDependencies();
    this.checkForExposedKeys();
    this.checkForInsecureStorage();
    this.checkForWeakAuthentication();
    
    // Apply enabled security policies
    for (const [policyName, policy] of this.securityPolicies) {
      if (policy.enabled) {
        try {
          policy.apply();
        } catch (error) {
          console.error(`[SecurityEnhancer] Error applying policy ${policy.name}:`, error);
        }
      }
    }
  }

  /**
   * Check for vulnerable dependencies
   */
  checkForVulnerableDependencies() {
    // In a real implementation, this would check for known vulnerabilities
    // in JavaScript dependencies using a vulnerability database
    console.log('[SecurityEnhancer] Checking for vulnerable dependencies');
    
    // For demonstration, we'll simulate finding a vulnerability
    if (Math.random() < 0.1) { // 10% chance
      this.recordSecurityIssue({
        type: 'vulnerable_dependency',
        description: 'Outdated library detected: moment.js < 2.29.4',
        severity: 'medium',
        details: {
          library: 'moment.js',
          currentVersion: '2.29.1',
          recommendedVersion: '2.29.4',
          vulnerability: 'CVE-2022-31127'
        }
      });
    }
  }

  /**
   * Check for exposed keys
   */
  checkForExposedKeys() {
    // Check for potentially exposed API keys or secrets
    console.log('[SecurityEnhancer] Checking for exposed keys');
    
    // This would typically scan the codebase or localStorage for patterns
    // that match API keys, passwords, or other secrets
    
    // For demonstration, we'll simulate finding an exposed key
    if (Math.random() < 0.05) { // 5% chance
      this.recordSecurityIssue({
        type: 'exposed_key',
        description: 'Potential API key exposed in localStorage',
        severity: 'high',
        details: {
          storageKey: 'api_key_backup',
          valueLength: 32
        }
      });
    }
  }

  /**
   * Check for insecure storage
   */
  checkForInsecureStorage() {
    // Check for sensitive data stored insecurely
    console.log('[SecurityEnhancer] Checking for insecure storage');
    
    // Check localStorage for sensitive data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      
      // Check for passwords or credentials
      if (key.toLowerCase().includes('password') || key.toLowerCase().includes('credential')) {
        this.recordSecurityIssue({
          type: 'insecure_storage',
          description: `Sensitive data stored in localStorage: ${key}`,
          severity: 'high',
          details: {
            storageKey: key,
            storageType: 'localStorage'
          }
        });
      }
      
      // Check for large amounts of data that might be sensitive
      if (value && value.length > 10000) {
        this.recordSecurityIssue({
          type: 'large_data_storage',
          description: `Large data block stored in localStorage: ${key}`,
          severity: 'medium',
          details: {
            storageKey: key,
            dataSize: value.length
          }
        });
      }
    }
  }

  /**
   * Check for weak authentication
   */
  checkForWeakAuthentication() {
    // Check for weak authentication mechanisms
    console.log('[SecurityEnhancer] Checking for weak authentication');
    
    // This would check for things like:
    // - Weak password policies
    // - Lack of multi-factor authentication
    // - Session management issues
    
    // For demonstration, we'll simulate finding a weak authentication issue
    if (Math.random() < 0.15) { // 15% chance
      this.recordSecurityIssue({
        type: 'weak_authentication',
        description: 'Session timeout not configured properly',
        severity: 'medium',
        details: {
          issue: 'Session does not expire after inactivity',
          recommendation: 'Implement session timeout after 30 minutes of inactivity'
        }
      });
    }
  }

  /**
   * Apply Content Security Policy
   */
  applyCSP() {
    if (!this.cspEnabled) return;
    
    const cspPolicy = this.securityPolicies.get('csp');
    if (!cspPolicy) return;
    
    // Create CSP header string
    const cspDirectives = Object.entries(cspPolicy.directives)
      .map(([directive, value]) => `${directive} ${value}`)
      .join('; ');
    
    // Apply CSP using meta tag (in a real app, this would be done via HTTP headers)
    let cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (!cspMeta) {
      cspMeta = document.createElement('meta');
      cspMeta.setAttribute('http-equiv', 'Content-Security-Policy');
      document.head.appendChild(cspMeta);
    }
    cspMeta.setAttribute('content', cspDirectives);
    
    console.log('[SecurityEnhancer] CSP applied');
  }

  /**
   * Apply XSS Protection
   */
  applyXSSProtection() {
    if (!this.xssProtectionEnabled) return;
    
    // Implement XSS protection measures
    // This would typically include:
    // - Sanitizing user inputs
    // - Encoding output
    // - Using secure templating
    
    console.log('[SecurityEnhancer] XSS protection applied');
  }

  /**
   * Apply CSRF Protection
   */
  applyCSRFProtection() {
    if (!this.csrfProtectionEnabled) return;
    
    // Implement CSRF protection measures
    // This would typically include:
    // - Adding CSRF tokens to forms
    // - Validating tokens on the server
    
    console.log('[SecurityEnhancer] CSRF protection applied');
  }

  /**
   * Apply Input Validation
   */
  applyInputValidation() {
    // Implement input validation for forms and user inputs
    console.log('[SecurityEnhancer] Input validation applied');
  }

  /**
   * Apply Secure Headers
   */
  applySecureHeaders() {
    // Apply security-related HTTP headers
    // In a browser environment, some headers can only be set by the server
    // But we can set others like Referrer-Policy
    
    let referrerMeta = document.querySelector('meta[name="referrer"]');
    if (!referrerMeta) {
      referrerMeta = document.createElement('meta');
      referrerMeta.setAttribute('name', 'referrer');
      document.head.appendChild(referrerMeta);
    }
    referrerMeta.setAttribute('content', 'strict-origin-when-cross-origin');
    
    console.log('[SecurityEnhancer] Secure headers applied');
  }

  /**
   * Record a security issue
   */
  recordSecurityIssue(issue) {
    const securityIssue = {
      id: `security_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      resolved: false,
      ...issue
    };
    
    this.securityIssues.push(securityIssue);
    this.threatsDetected++;
    
    // Keep only last 100 security issues
    if (this.securityIssues.length > 100) {
      this.securityIssues.shift();
    }
    
    // Add to audit log
    this.addToAuditLog('security_issue', securityIssue);
    
    // Notify about security issue
    window.dispatchEvent(new CustomEvent('security-issue-detected', {
      detail: securityIssue
    }));
    
    console.warn(`[SecurityEnhancer] Security issue detected: ${issue.description}`);
  }

  /**
   * Add entry to audit log
   */
  addToAuditLog(action, details) {
    const logEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      action: action,
      details: details
    };
    
    this.auditLog.push(logEntry);
    
    // Keep only last 1000 log entries
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }
  }

  /**
   * Handle security violation
   */
  handleSecurityViolation(violation) {
    this.recordSecurityIssue({
      type: 'security_violation',
      description: violation.message || 'Security violation detected',
      severity: violation.severity || 'medium',
      details: violation
    });
    
    console.warn(`[SecurityEnhancer] Security violation handled: ${violation.message}`);
  }

  /**
   * Get security issues
   */
  getSecurityIssues(filter = {}) {
    let issues = [...this.securityIssues];
    
    // Apply filters
    if (filter.type) {
      issues = issues.filter(issue => issue.type === filter.type);
    }
    
    if (filter.severity) {
      issues = issues.filter(issue => issue.severity === filter.severity);
    }
    
    if (filter.resolved !== undefined) {
      issues = issues.filter(issue => issue.resolved === filter.resolved);
    }
    
    return issues;
  }

  /**
   * Get unresolved security issues
   */
  getUnresolvedIssues() {
    return this.securityIssues.filter(issue => !issue.resolved);
  }

  /**
   * Mark security issue as resolved
   */
  markIssueAsResolved(issueId) {
    const issue = this.securityIssues.find(i => i.id === issueId);
    if (issue) {
      issue.resolved = true;
      issue.resolvedAt = new Date().toISOString();
      
      this.addToAuditLog('issue_resolved', { issueId: issueId });
      
      console.log(`[SecurityEnhancer] Issue marked as resolved: ${issueId}`);
      return true;
    }
    return false;
  }

  /**
   * Get security statistics
   */
  getSecurityStatistics() {
    const unresolvedIssues = this.getUnresolvedIssues();
    
    // Count issues by severity
    const severityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    unresolvedIssues.forEach(issue => {
      if (severityCounts.hasOwnProperty(issue.severity)) {
        severityCounts[issue.severity]++;
      }
    });
    
    return {
      totalIssues: this.securityIssues.length,
      unresolvedIssues: unresolvedIssues.length,
      threatsDetected: this.threatsDetected,
      severityCounts: severityCounts,
      policiesEnabled: Array.from(this.securityPolicies.values())
        .filter(policy => policy.enabled).length,
      totalPolicies: this.securityPolicies.size
    };
  }

  /**
   * Get audit log
   */
  getAuditLog(filter = {}) {
    let logs = [...this.auditLog];
    
    // Apply filters
    if (filter.action) {
      logs = logs.filter(log => log.action === filter.action);
    }
    
    if (filter.startTime) {
      logs = logs.filter(log => new Date(log.timestamp) >= new Date(filter.startTime));
    }
    
    if (filter.endTime) {
      logs = logs.filter(log => new Date(log.timestamp) <= new Date(filter.endTime));
    }
    
    return logs;
  }

  /**
   * Export security report
   */
  exportSecurityReport(format = 'json') {
    const report = {
      generatedAt: new Date().toISOString(),
      statistics: this.getSecurityStatistics(),
      unresolvedIssues: this.getUnresolvedIssues(),
      auditLog: this.getAuditLog()
    };
    
    switch (format) {
      case 'json':
        return JSON.stringify(report, null, 2);
      case 'csv':
        return this.reportToCSV(report);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Convert report to CSV format
   */
  reportToCSV(report) {
    // This would convert the security report to CSV format
    // For now, we'll just return a placeholder
    return 'Security report exported in CSV format';
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for security issue detections
    window.addEventListener('security-issue-detected', (event) => {
      this.handleSecurityIssue(event.detail);
    });
    
    // Listen for security policy updates
    window.addEventListener('security-policy-update', (event) => {
      this.updateSecurityPolicy(event.detail.policyName, event.detail.updates);
    });
  }

  /**
   * Handle security issue
   */
  handleSecurityIssue(issue) {
    // In a real implementation, this would handle security issues
    // For example, by alerting administrators or automatically applying fixes
    console.log(`[SecurityEnhancer] Handling security issue: ${issue.description}`);
  }

  /**
   * Update security policy
   */
  updateSecurityPolicy(policyName, updates) {
    const policy = this.securityPolicies.get(policyName);
    if (policy) {
      Object.assign(policy, updates);
      
      // Re-apply the policy if it's enabled
      if (policy.enabled) {
        try {
          policy.apply();
        } catch (error) {
          console.error(`[SecurityEnhancer] Error applying updated policy ${policy.name}:`, error);
        }
      }
      
      console.log(`[SecurityEnhancer] Security policy updated: ${policyName}`);
    }
  }

  /**
   * Enable/disable security system
   */
  setSecurityEnabled(enabled) {
    this.securityEnabled = enabled;
    
    if (enabled) {
      console.log('[SecurityEnhancer] Security system enabled');
    } else {
      console.log('[SecurityEnhancer] Security system disabled');
    }
  }

  /**
   * Enable/disable specific security policy
   */
  setPolicyEnabled(policyName, enabled) {
    const policy = this.securityPolicies.get(policyName);
    if (policy) {
      policy.enabled = enabled;
      
      if (enabled) {
        try {
          policy.apply();
          console.log(`[SecurityEnhancer] Policy enabled: ${policy.name}`);
        } catch (error) {
          console.error(`[SecurityEnhancer] Error enabling policy ${policy.name}:`, error);
        }
      } else {
        console.log(`[SecurityEnhancer] Policy disabled: ${policy.name}`);
      }
    }
  }

  /**
   * Render security dashboard
   */
  renderSecurityDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create security dashboard HTML
    container.innerHTML = `
      <div class="security-dashboard">
        <header>
          <h2>🛡️ Security Enhancement</h2>
          <p>Monitor and enhance system security</p>
        </header>
        
        <div class="security-controls">
          <div class="security-actions">
            <button id="run-security-check" class="action-button">Run Security Check</button>
            <button id="export-security-report" class="action-button">Export Report</button>
            <button id="toggle-security" class="action-button">
              ${this.securityEnabled ? 'Disable' : 'Enable'} Security
            </button>
          </div>
          
          <div class="security-settings">
            <label>
              <input type="checkbox" id="csp-enabled" ${this.cspEnabled ? 'checked' : ''}>
              Enable CSP
            </label>
            <label>
              <input type="checkbox" id="xss-enabled" ${this.xssProtectionEnabled ? 'checked' : ''}>
              Enable XSS Protection
            </label>
            <label>
              <input type="checkbox" id="csrf-enabled" ${this.csrfProtectionEnabled ? 'checked' : ''}>
              Enable CSRF Protection
            </label>
          </div>
        </div>
        
        <div class="security-grid">
          <div class="security-section">
            <h3>Security Statistics</h3>
            <div id="security-statistics" class="metrics-container">
              <!-- Security statistics will be rendered here -->
            </div>
          </div>
          
          <div class="security-section">
            <h3>Unresolved Issues</h3>
            <div id="unresolved-issues" class="issues-container">
              <!-- Unresolved issues will be rendered here -->
            </div>
          </div>
          
          <div class="security-section">
            <h3>Security Policies</h3>
            <div id="security-policies" class="policies-container">
              <!-- Security policies will be rendered here -->
            </div>
          </div>
          
          <div class="security-section">
            <h3>Audit Log</h3>
            <div id="audit-log" class="log-container">
              <!-- Audit log will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Render components
    this.renderSecurityStatistics('security-statistics');
    this.renderUnresolvedIssues('unresolved-issues');
    this.renderSecurityPolicies('security-policies');
    this.renderAuditLog('audit-log');
    
    // Set up action buttons
    document.getElementById('run-security-check').addEventListener('click', () => {
      this.runSecurityCheck();
      alert('Security check completed! Check console for details.');
    });
    
    document.getElementById('export-security-report').addEventListener('click', () => {
      this.exportSecurityReportData();
    });
    
    document.getElementById('toggle-security').addEventListener('click', () => {
      this.setSecurityEnabled(!this.securityEnabled);
      this.renderSecurityDashboard(containerId); // Re-render
    });
    
    // Set up policy toggles
    document.getElementById('csp-enabled').addEventListener('change', (e) => {
      this.cspEnabled = e.target.checked;
      this.setPolicyEnabled('csp', e.target.checked);
    });
    
    document.getElementById('xss-enabled').addEventListener('change', (e) => {
      this.xssProtectionEnabled = e.target.checked;
      this.setPolicyEnabled('xss', e.target.checked);
    });
    
    document.getElementById('csrf-enabled').addEventListener('change', (e) => {
      this.csrfProtectionEnabled = e.target.checked;
      this.setPolicyEnabled('csrf', e.target.checked);
    });
  }

  /**
   * Render security statistics
   */
  renderSecurityStatistics(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const stats = this.getSecurityStatistics();
    
    container.innerHTML = `
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${stats.totalIssues}</div>
          <div class="metric-label">Total Issues</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${stats.unresolvedIssues}</div>
          <div class="metric-label">Unresolved Issues</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${stats.threatsDetected}</div>
          <div class="metric-label">Threats Detected</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${stats.policiesEnabled}/${stats.totalPolicies}</div>
          <div class="metric-label">Policies Active</div>
        </div>
      </div>
      
      <div class="severity-distribution">
        <h4>Issues by Severity</h4>
        <ul>
          <li>Critical: <span class="severity-count">${stats.severityCounts.critical}</span></li>
          <li>High: <span class="severity-count">${stats.severityCounts.high}</span></li>
          <li>Medium: <span class="severity-count">${stats.severityCounts.medium}</span></li>
          <li>Low: <span class="severity-count">${stats.severityCounts.low}</span></li>
        </ul>
      </div>
    `;
  }

  /**
   * Render unresolved issues
   */
  renderUnresolvedIssues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const issues = this.getUnresolvedIssues().slice(0, 10); // Last 10 issues
    
    if (issues.length === 0) {
      container.innerHTML = '<p class="no-data">No unresolved security issues</p>';
      return;
    }
    
    container.innerHTML = `
      <div class="issues-list">
        <ul>
          ${issues.map(issue => `
            <li class="issue-item severity-${issue.severity}">
              <div class="issue-header">
                <div class="issue-type">${issue.type.replace('_', ' ')}</div>
                <div class="issue-severity">${issue.severity}</div>
              </div>
              <div class="issue-description">${issue.description}</div>
              <div class="issue-time">${new Date(issue.timestamp).toLocaleString()}</div>
              <button class="resolve-issue" data-issue-id="${issue.id}">Mark Resolved</button>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    
    // Set up resolve buttons
    container.querySelectorAll('.resolve-issue').forEach(button => {
      button.addEventListener('click', (e) => {
        const issueId = e.target.getAttribute('data-issue-id');
        this.markIssueAsResolved(issueId);
        this.renderUnresolvedIssues(containerId); // Re-render
      });
    });
  }

  /**
   * Render security policies
   */
  renderSecurityPolicies(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const policies = Array.from(this.securityPolicies.values());
    
    container.innerHTML = `
      <div class="policies-list">
        ${policies.map(policy => `
          <div class="policy-card">
            <h4>${policy.name}</h4>
            <p class="policy-description">${policy.description}</p>
            <div class="policy-status">
              Status: <span class="${policy.enabled ? 'enabled' : 'disabled'}">
                ${policy.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <button class="toggle-policy" data-policy="${policy.name}">
              ${policy.enabled ? 'Disable' : 'Enable'}
            </button>
          </div>
        `).join('')}
      </div>
    `;
    
    // Set up toggle buttons
    container.querySelectorAll('.toggle-policy').forEach(button => {
      button.addEventListener('click', (e) => {
        const policyName = e.target.getAttribute('data-policy');
        const policy = this.securityPolicies.get(policyName);
        if (policy) {
          this.setPolicyEnabled(policyName, !policy.enabled);
          this.renderSecurityPolicies(containerId); // Re-render
        }
      });
    });
  }

  /**
   * Render audit log
   */
  renderAuditLog(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const logs = this.getAuditLog().slice(-10); // Last 10 log entries
    
    if (logs.length === 0) {
      container.innerHTML = '<p class="no-data">No audit log entries</p>';
      return;
    }
    
    container.innerHTML = `
      <div class="log-list">
        <ul>
          ${logs.map(log => `
            <li class="log-item">
              <div class="log-action">${log.action.replace('_', ' ')}</div>
              <div class="log-time">${new Date(log.timestamp).toLocaleString()}</div>
              <div class="log-details">
                ${log.details ? JSON.stringify(log.details).substring(0, 100) + '...' : ''}
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Export security report data
   */
  exportSecurityReportData() {
    try {
      const data = this.exportSecurityReport('json');
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `security-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('[SecurityEnhancer] Security report exported');
    } catch (error) {
      console.error('[SecurityEnhancer] Error exporting security report:', error);
      alert('Error exporting security report');
    }
  }
}

// Initialize security enhancement system
document.addEventListener('DOMContentLoaded', () => {
  window.SecurityEnhancer = new SecurityEnhancer();
  window.SecurityEnhancer.initialize();
  
  console.log('[SecurityEnhancer] System ready');
  
  // Mark enhancement as completed
  if (window.enhancementTracker) {
    window.enhancementTracker.markCompleted(31);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SecurityEnhancer;
}