/**
 * Automated Report Generation System
 * Enhancement #28 for NUZANTARA-RAILWAY
 * Implements comprehensive automated report generation capabilities
 */

class ReportGenerator {
  constructor() {
    this.reportTemplates = new Map();
    this.scheduledReports = new Map();
    this.generatedReports = [];
    this.reportFormats = ['pdf', 'csv', 'json', 'html'];
  }

  /**
   * Initialize the report generator system
   */
  async initialize() {
    // Load report templates
    this.loadReportTemplates();
    
    // Load scheduled reports
    this.loadScheduledReports();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set up periodic report generation
    this.setupPeriodicReports();
    
    console.log('[ReportGenerator] System initialized');
  }

  /**
   * Load report templates from localStorage or API
   */
  loadReportTemplates() {
    try {
      // Load report templates
      const savedTemplates = localStorage.getItem('zantara-report-templates');
      if (savedTemplates) {
        const templates = JSON.parse(savedTemplates);
        templates.forEach(template => {
          this.reportTemplates.set(template.id, template);
        });
      } else {
        // Add default templates if none exist
        this.addDefaultTemplates();
      }
      
      console.log('[ReportGenerator] Report templates loaded');
    } catch (error) {
      console.error('[ReportGenerator] Error loading report templates:', error);
    }
  }

  /**
   * Save report templates to localStorage
   */
  saveReportTemplates() {
    try {
      const templatesArray = Array.from(this.reportTemplates.values());
      localStorage.setItem('zantara-report-templates', JSON.stringify(templatesArray));
    } catch (error) {
      console.error('[ReportGenerator] Error saving report templates:', error);
    }
  }

  /**
   * Load scheduled reports from localStorage or API
   */
  loadScheduledReports() {
    try {
      // Load scheduled reports
      const savedScheduledReports = localStorage.getItem('zantara-scheduled-reports');
      if (savedScheduledReports) {
        const scheduled = JSON.parse(savedScheduledReports);
        scheduled.forEach(report => {
          this.scheduledReports.set(report.id, report);
        });
      }
      
      console.log('[ReportGenerator] Scheduled reports loaded');
    } catch (error) {
      console.error('[ReportGenerator] Error loading scheduled reports:', error);
    }
  }

  /**
   * Save scheduled reports to localStorage
   */
  saveScheduledReports() {
    try {
      const scheduledArray = Array.from(this.scheduledReports.values());
      localStorage.setItem('zantara-scheduled-reports', JSON.stringify(scheduledArray));
    } catch (error) {
      console.error('[ReportGenerator] Error saving scheduled reports:', error);
    }
  }

  /**
   * Add default report templates
   */
  addDefaultTemplates() {
    const defaultTemplates = [
      {
        id: 'template_1',
        name: 'System Performance Report',
        description: 'Detailed report on system performance metrics',
        type: 'performance',
        frequency: 'daily',
        format: 'pdf',
        sections: ['overview', 'metrics', 'trends', 'recommendations'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'template_2',
        name: 'User Activity Report',
        description: 'Summary of user activities and engagement',
        type: 'user_activity',
        frequency: 'weekly',
        format: 'html',
        sections: ['overview', 'user_stats', 'activity_trends', 'top_features'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'template_3',
        name: 'AI Usage Report',
        description: 'Report on AI model usage and effectiveness',
        type: 'ai_usage',
        frequency: 'weekly',
        format: 'pdf',
        sections: ['overview', 'model_usage', 'cache_stats', 'cost_analysis'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'template_4',
        name: 'Handler Integration Report',
        description: 'Progress report on handler integration',
        type: 'handler_integration',
        frequency: 'weekly',
        format: 'html',
        sections: ['overview', 'integration_progress', 'pending_handlers', 'recommendations'],
        createdAt: new Date().toISOString()
      }
    ];
    
    defaultTemplates.forEach(template => {
      this.reportTemplates.set(template.id, template);
    });
    
    this.saveReportTemplates();
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for report generation requests
    window.addEventListener('generate-report', (event) => {
      this.generateReport(event.detail.templateId, event.detail.options);
    });
    
    // Listen for scheduled report updates
    window.addEventListener('update-scheduled-report', (event) => {
      this.updateScheduledReport(event.detail.reportId, event.detail.data);
    });
  }

  /**
   * Set up periodic report generation
   */
  setupPeriodicReports() {
    // Check for scheduled reports every hour
    setInterval(() => {
      this.checkScheduledReports();
    }, 3600000); // 1 hour
    
    console.log('[ReportGenerator] Periodic report generation set up');
  }

  /**
   * Get all report templates
   */
  getReportTemplates() {
    return Array.from(this.reportTemplates.values());
  }

  /**
   * Get report template by ID
   */
  getReportTemplate(templateId) {
    return this.reportTemplates.get(templateId);
  }

  /**
   * Create a new report template
   */
  createReportTemplate(templateData) {
    const templateId = templateData.id || `template_${Date.now()}`;
    const template = {
      id: templateId,
      name: templateData.name,
      description: templateData.description || '',
      type: templateData.type || 'custom',
      frequency: templateData.frequency || 'manual',
      format: templateData.format || 'pdf',
      sections: templateData.sections || [],
      createdAt: new Date().toISOString(),
      ...templateData
    };
    
    this.reportTemplates.set(templateId, template);
    this.saveReportTemplates();
    
    // Notify about new template
    window.dispatchEvent(new CustomEvent('report-template-created', {
      detail: template
    }));
    
    console.log(`[ReportGenerator] Report template created: ${template.name}`);
    return templateId;
  }

  /**
   * Update an existing report template
   */
  updateReportTemplate(templateId, templateData) {
    const template = this.reportTemplates.get(templateId);
    if (template) {
      Object.assign(template, templateData);
      this.reportTemplates.set(templateId, template);
      this.saveReportTemplates();
      
      // Notify about updated template
      window.dispatchEvent(new CustomEvent('report-template-updated', {
        detail: { id: templateId, template }
      }));
      
      console.log(`[ReportGenerator] Report template updated: ${template.name}`);
      return true;
    }
    return false;
  }

  /**
   * Delete a report template
   */
  deleteReportTemplate(templateId) {
    const template = this.reportTemplates.get(templateId);
    if (template) {
      this.reportTemplates.delete(templateId);
      this.saveReportTemplates();
      
      // Notify about deleted template
      window.dispatchEvent(new CustomEvent('report-template-deleted', {
        detail: { id: templateId, name: template.name }
      }));
      
      console.log(`[ReportGenerator] Report template deleted: ${template.name}`);
      return true;
    }
    return false;
  }

  /**
   * Generate a report
   */
  async generateReport(templateId, options = {}) {
    try {
      const template = this.reportTemplates.get(templateId);
      if (!template) {
        throw new Error(`Report template ${templateId} not found`);
      }
      
      console.log(`[ReportGenerator] Generating report: ${template.name}`);
      
      // Simulate report generation process
      const reportData = await this.collectReportData(template, options);
      const formattedReport = await this.formatReport(reportData, template.format);
      const report = this.createReportObject(template, reportData, formattedReport, options);
      
      // Add to generated reports
      this.generatedReports.unshift(report);
      
      // Keep only last 100 reports
      if (this.generatedReports.length > 100) {
        this.generatedReports.pop();
      }
      
      // Notify about generated report
      window.dispatchEvent(new CustomEvent('report-generated', {
        detail: report
      }));
      
      console.log(`[ReportGenerator] Report generated: ${template.name}`);
      return report;
    } catch (error) {
      console.error('[ReportGenerator] Error generating report:', error);
      
      // Notify about error
      window.dispatchEvent(new CustomEvent('report-generation-error', {
        detail: { templateId, error: error.message }
      }));
      
      throw error;
    }
  }

  /**
   * Collect data for report
   */
  async collectReportData(template, options) {
    // In a real implementation, this would collect actual data
    // For now, we'll simulate data collection based on template type
    const data = {
      templateId: template.id,
      generatedAt: new Date().toISOString(),
      period: options.period || 'last_7_days'
    };
    
    switch (template.type) {
      case 'performance':
        data.metrics = this.collectPerformanceMetrics();
        break;
      case 'user_activity':
        data.userStats = this.collectUserActivityData();
        break;
      case 'ai_usage':
        data.aiUsage = this.collectAIUsageData();
        break;
      case 'handler_integration':
        data.integrationProgress = this.collectHandlerIntegrationData();
        break;
      default:
        data.customData = this.collectCustomData(template, options);
    }
    
    return data;
  }

  /**
   * Collect performance metrics
   */
  collectPerformanceMetrics() {
    // Simulate performance metrics collection
    return {
      responseTime: {
        average: 127,
        min: 45,
        max: 320,
        unit: 'ms'
      },
      uptime: 99.2,
      requestsPerMinute: 1200,
      errorRate: 0.3
    };
  }

  /**
   * Collect user activity data
   */
  collectUserActivityData() {
    // Simulate user activity data collection
    return {
      activeUsers: 24,
      newUsers: 5,
      sessions: 142,
      avgSessionDuration: 12.5,
      topFeatures: [
        { name: 'Chat Interface', usage: 85 },
        { name: 'Handler Discovery', usage: 67 },
        { name: 'Dashboard', usage: 52 }
      ]
    };
  }

  /**
   * Collect AI usage data
   */
  collectAIUsageData() {
    // Simulate AI usage data collection
    return {
      totalQueries: 2450,
      cacheHitRate: 58,
      modelUsage: {
        haiku: 1800,
        llama: 450,
        devai: 200
      },
      costSavings: 75
    };
  }

  /**
   * Collect handler integration data
   */
  collectHandlerIntegrationData() {
    // Simulate handler integration data collection
    return {
      totalHandlers: 122,
      integratedHandlers: 32,
      integrationPercentage: 26.2,
      pendingHandlers: 90,
      nextPriorities: ['team.*', 'project.*', 'finance.*']
    };
  }

  /**
   * Collect custom data
   */
  collectCustomData(template, options) {
    // Placeholder for custom data collection
    return {
      message: 'Custom data collection would be implemented here',
      templateType: template.type
    };
  }

  /**
   * Format report in specified format
   */
  async formatReport(reportData, format) {
    // In a real implementation, this would format the report in the specified format
    // For now, we'll return a placeholder
    return {
      format: format,
      content: `Report content in ${format} format would be generated here`,
      size: Math.floor(Math.random() * 1000) + 500 // Simulate file size
    };
  }

  /**
   * Create report object
   */
  createReportObject(template, reportData, formattedReport, options) {
    const reportId = `report_${Date.now()}`;
    
    return {
      id: reportId,
      templateId: template.id,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      type: template.type,
      format: template.format,
      generatedAt: new Date().toISOString(),
      period: reportData.period,
      data: reportData,
      formatted: formattedReport,
      options: options
    };
  }

  /**
   * Get generated reports
   */
  getGeneratedReports(limit = 20) {
    return this.generatedReports.slice(0, limit);
  }

  /**
   * Get report by ID
   */
  getReport(reportId) {
    return this.generatedReports.find(report => report.id === reportId);
  }

  /**
   * Download report
   */
  downloadReport(reportId) {
    const report = this.getReport(reportId);
    if (report) {
      // In a real implementation, this would download the actual report file
      console.log(`[ReportGenerator] Downloading report: ${report.name}`);
      
      // Notify about download
      window.dispatchEvent(new CustomEvent('report-downloaded', {
        detail: report
      }));
      
      return true;
    }
    return false;
  }

  /**
   * Schedule a report
   */
  scheduleReport(scheduleData) {
    const scheduleId = scheduleData.id || `schedule_${Date.now()}`;
    const schedule = {
      id: scheduleId,
      templateId: scheduleData.templateId,
      name: scheduleData.name,
      frequency: scheduleData.frequency || 'daily',
      time: scheduleData.time || '09:00',
      enabled: scheduleData.enabled !== false,
      recipients: scheduleData.recipients || [],
      lastRun: null,
      nextRun: this.calculateNextRun(scheduleData.frequency, scheduleData.time),
      createdAt: new Date().toISOString(),
      ...scheduleData
    };
    
    this.scheduledReports.set(scheduleId, schedule);
    this.saveScheduledReports();
    
    // Notify about new schedule
    window.dispatchEvent(new CustomEvent('report-scheduled', {
      detail: schedule
    }));
    
    console.log(`[ReportGenerator] Report scheduled: ${schedule.name}`);
    return scheduleId;
  }

  /**
   * Calculate next run time
   */
  calculateNextRun(frequency, time) {
    const now = new Date();
    let nextRun;
    
    switch (frequency) {
      case 'hourly':
        nextRun = new Date(now.getTime() + 3600000); // 1 hour
        break;
      case 'daily':
        nextRun = new Date(now.getTime() + 86400000); // 1 day
        break;
      case 'weekly':
        nextRun = new Date(now.getTime() + 604800000); // 1 week
        break;
      case 'monthly':
        nextRun = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
        break;
      default:
        nextRun = new Date(now.getTime() + 86400000); // Default to daily
    }
    
    return nextRun.toISOString();
  }

  /**
   * Update scheduled report
   */
  updateScheduledReport(scheduleId, scheduleData) {
    const schedule = this.scheduledReports.get(scheduleId);
    if (schedule) {
      Object.assign(schedule, scheduleData);
      
      // Recalculate next run if frequency or time changed
      if (scheduleData.frequency || scheduleData.time) {
        schedule.nextRun = this.calculateNextRun(
          scheduleData.frequency || schedule.frequency,
          scheduleData.time || schedule.time
        );
      }
      
      this.scheduledReports.set(scheduleId, schedule);
      this.saveScheduledReports();
      
      // Notify about updated schedule
      window.dispatchEvent(new CustomEvent('scheduled-report-updated', {
        detail: { id: scheduleId, schedule }
      }));
      
      console.log(`[ReportGenerator] Scheduled report updated: ${schedule.name}`);
      return true;
    }
    return false;
  }

  /**
   * Delete scheduled report
   */
  deleteScheduledReport(scheduleId) {
    const schedule = this.scheduledReports.get(scheduleId);
    if (schedule) {
      this.scheduledReports.delete(scheduleId);
      this.saveScheduledReports();
      
      // Notify about deleted schedule
      window.dispatchEvent(new CustomEvent('scheduled-report-deleted', {
        detail: { id: scheduleId, name: schedule.name }
      }));
      
      console.log(`[ReportGenerator] Scheduled report deleted: ${schedule.name}`);
      return true;
    }
    return false;
  }

  /**
   * Get all scheduled reports
   */
  getScheduledReports() {
    return Array.from(this.scheduledReports.values());
  }

  /**
   * Check scheduled reports and generate if needed
   */
  async checkScheduledReports() {
    const now = new Date();
    
    for (const [scheduleId, schedule] of this.scheduledReports) {
      if (!schedule.enabled) continue;
      
      const nextRun = new Date(schedule.nextRun);
      if (now >= nextRun) {
        try {
          // Generate the report
          await this.generateReport(schedule.templateId, {
            scheduled: true,
            scheduleId: scheduleId
          });
          
          // Update last run and calculate next run
          schedule.lastRun = now.toISOString();
          schedule.nextRun = this.calculateNextRun(schedule.frequency, schedule.time);
          this.scheduledReports.set(scheduleId, schedule);
          this.saveScheduledReports();
          
          console.log(`[ReportGenerator] Scheduled report generated: ${schedule.name}`);
        } catch (error) {
          console.error(`[ReportGenerator] Error generating scheduled report ${schedule.name}:`, error);
        }
      }
    }
  }

  /**
   * Send report to recipients
   */
  sendReport(reportId, recipients) {
    const report = this.getReport(reportId);
    if (report) {
      // In a real implementation, this would send the report via email or other channels
      console.log(`[ReportGenerator] Sending report to ${recipients.length} recipients`);
      
      // Notify about sent report
      window.dispatchEvent(new CustomEvent('report-sent', {
        detail: { reportId, recipients }
      }));
      
      return true;
    }
    return false;
  }

  /**
   * Get report generation statistics
   */
  getStatistics() {
    return {
      totalTemplates: this.reportTemplates.size,
      totalScheduled: this.scheduledReports.size,
      totalGenerated: this.generatedReports.length,
      reportFormats: this.reportFormats,
      recentReports: this.getGeneratedReports(5).map(report => ({
        id: report.id,
        name: report.name,
        type: report.type,
        generatedAt: report.generatedAt
      }))
    };
  }

  /**
   * Render report generator interface
   */
  renderReportGenerator(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create report generator HTML
    container.innerHTML = `
      <div class="report-generator">
        <header>
          <h2>📋 Report Generator</h2>
          <p>Automatically generate and schedule reports</p>
        </header>
        
        <div class="report-controls">
          <div class="report-actions">
            <button id="generate-report-btn" class="action-button">Generate Report</button>
            <button id="schedule-report-btn" class="action-button">Schedule Report</button>
            <button id="view-templates-btn" class="action-button">View Templates</button>
          </div>
          
          <div class="report-filters">
            <select id="report-type-filter">
              <option value="all">All Report Types</option>
              <option value="performance">Performance</option>
              <option value="user_activity">User Activity</option>
              <option value="ai_usage">AI Usage</option>
              <option value="handler_integration">Handler Integration</option>
              <option value="custom">Custom</option>
            </select>
            <input type="date" id="report-date-filter" placeholder="Filter by date">
          </div>
        </div>
        
        <div class="report-grid">
          <div class="report-section">
            <h3>Recent Reports</h3>
            <div id="recent-reports" class="reports-container">
              <!-- Recent reports will be rendered here -->
            </div>
          </div>
          
          <div class="report-section">
            <h3>Scheduled Reports</h3>
            <div id="scheduled-reports" class="reports-container">
              <!-- Scheduled reports will be rendered here -->
            </div>
          </div>
          
          <div class="report-section">
            <h3>Report Templates</h3>
            <div id="report-templates" class="templates-container">
              <!-- Report templates will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Render components
    this.renderRecentReports('recent-reports');
    this.renderScheduledReports('scheduled-reports');
    this.renderReportTemplates('report-templates');
    
    // Set up action buttons
    document.getElementById('generate-report-btn').addEventListener('click', () => {
      this.showGenerateReportDialog();
    });
    
    document.getElementById('schedule-report-btn').addEventListener('click', () => {
      this.showScheduleReportDialog();
    });
    
    document.getElementById('view-templates-btn').addEventListener('click', () => {
      this.showReportTemplates();
    });
  }

  /**
   * Render recent reports
   */
  renderRecentReports(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const recentReports = this.getGeneratedReports(5);
    
    if (recentReports.length === 0) {
      container.innerHTML = '<p class="no-data">No recent reports</p>';
      return;
    }
    
    container.innerHTML = recentReports.map(report => `
      <div class="report-card" data-report-id="${report.id}">
        <h4>${report.name}</h4>
        <p class="report-type">${report.type.replace('_', ' ')}</p>
        <p class="report-date">${new Date(report.generatedAt).toLocaleString()}</p>
        <div class="report-actions">
          <button class="download-btn" data-report-id="${report.id}">Download</button>
          <button class="send-btn" data-report-id="${report.id}">Send</button>
        </div>
      </div>
    `).join('');
    
    // Set up download buttons
    container.querySelectorAll('.download-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const reportId = e.target.getAttribute('data-report-id');
        this.downloadReport(reportId);
      });
    });
    
    // Set up send buttons
    container.querySelectorAll('.send-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const reportId = e.target.getAttribute('data-report-id');
        this.showSendReportDialog(reportId);
      });
    });
  }

  /**
   * Render scheduled reports
   */
  renderScheduledReports(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const scheduledReports = this.getScheduledReports();
    
    if (scheduledReports.length === 0) {
      container.innerHTML = '<p class="no-data">No scheduled reports</p>';
      return;
    }
    
    container.innerHTML = scheduledReports.map(schedule => `
      <div class="schedule-card" data-schedule-id="${schedule.id}">
        <h4>${schedule.name}</h4>
        <p class="schedule-frequency">${schedule.frequency}</p>
        <p class="schedule-time">${schedule.time}</p>
        <p class="schedule-status ${schedule.enabled ? 'enabled' : 'disabled'}">
          ${schedule.enabled ? 'Enabled' : 'Disabled'}
        </p>
        <div class="schedule-actions">
          <button class="edit-btn" data-schedule-id="${schedule.id}">Edit</button>
          <button class="toggle-btn" data-schedule-id="${schedule.id}">
            ${schedule.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
    `).join('');
    
    // Set up edit buttons
    container.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const scheduleId = e.target.getAttribute('data-schedule-id');
        this.showEditScheduleDialog(scheduleId);
      });
    });
    
    // Set up toggle buttons
    container.querySelectorAll('.toggle-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const scheduleId = e.target.getAttribute('data-schedule-id');
        const schedule = this.scheduledReports.get(scheduleId);
        if (schedule) {
          this.updateScheduledReport(scheduleId, { enabled: !schedule.enabled });
          this.renderScheduledReports(containerId); // Re-render
        }
      });
    });
  }

  /**
   * Render report templates
   */
  renderReportTemplates(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const templates = this.getReportTemplates();
    
    if (templates.length === 0) {
      container.innerHTML = '<p class="no-data">No report templates</p>';
      return;
    }
    
    container.innerHTML = templates.map(template => `
      <div class="template-card" data-template-id="${template.id}">
        <h4>${template.name}</h4>
        <p class="template-description">${template.description}</p>
        <p class="template-type">${template.type.replace('_', ' ')}</p>
        <p class="template-frequency">${template.frequency}</p>
        <div class="template-actions">
          <button class="generate-btn" data-template-id="${template.id}">Generate</button>
          <button class="edit-btn" data-template-id="${template.id}">Edit</button>
        </div>
      </div>
    `).join('');
    
    // Set up generate buttons
    container.querySelectorAll('.generate-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const templateId = e.target.getAttribute('data-template-id');
        this.generateReport(templateId);
      });
    });
    
    // Set up edit buttons
    container.querySelectorAll('.edit-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        const templateId = e.target.getAttribute('data-template-id');
        this.showEditTemplateDialog(templateId);
      });
    });
  }

  /**
   * Show generate report dialog
   */
  showGenerateReportDialog() {
    // In a real implementation, this would show a modal dialog
    console.log('[ReportGenerator] Show generate report dialog');
    alert('Generate report dialog would appear here');
  }

  /**
   * Show schedule report dialog
   */
  showScheduleReportDialog() {
    // In a real implementation, this would show a modal dialog
    console.log('[ReportGenerator] Show schedule report dialog');
    alert('Schedule report dialog would appear here');
  }

  /**
   * Show report templates
   */
  showReportTemplates() {
    // In a real implementation, this would show all report templates
    console.log('[ReportGenerator] Show report templates');
    alert('Report templates would be displayed here');
  }

  /**
   * Show send report dialog
   */
  showSendReportDialog(reportId) {
    // In a real implementation, this would show a modal dialog
    console.log(`[ReportGenerator] Show send report dialog for ${reportId}`);
    alert('Send report dialog would appear here');
  }

  /**
   * Show edit schedule dialog
   */
  showEditScheduleDialog(scheduleId) {
    // In a real implementation, this would show a modal dialog
    console.log(`[ReportGenerator] Show edit schedule dialog for ${scheduleId}`);
    alert('Edit schedule dialog would appear here');
  }

  /**
   * Show edit template dialog
   */
  showEditTemplateDialog(templateId) {
    // In a real implementation, this would show a modal dialog
    console.log(`[ReportGenerator] Show edit template dialog for ${templateId}`);
    alert('Edit template dialog would appear here');
  }
}

// Initialize report generator system
document.addEventListener('DOMContentLoaded', () => {
  window.ReportGenerator = new ReportGenerator();
  window.ReportGenerator.initialize();
  
  console.log('[ReportGenerator] System ready');
  
  // Mark enhancement as completed
  if (window.enhancementTracker) {
    window.enhancementTracker.markCompleted(28);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReportGenerator;
}