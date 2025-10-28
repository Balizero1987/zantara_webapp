/**
 * Customizable Dashboard Widgets System
 * Enhancement #23 for NUZANTARA-RAILWAY
 * Implements a flexible widget system for the dashboard
 */

class DashboardWidgets {
  constructor() {
    this.widgets = new Map();
    this.widgetLayout = [];
    this.userPreferences = {};
    this.defaultLayout = [
      { id: 'system-status', type: 'systemStatus', x: 0, y: 0, width: 2, height: 1 },
      { id: 'handler-stats', type: 'handlerStats', x: 2, y: 0, width: 2, height: 1 },
      { id: 'ai-insights', type: 'aiInsights', x: 0, y: 1, width: 2, height: 1 },
      { id: 'recent-activity', type: 'recentActivity', x: 2, y: 1, width: 2, height: 1 },
      { id: 'performance-metrics', type: 'performanceMetrics', x: 0, y: 2, width: 4, height: 1 }
    ];
  }

  /**
   * Initialize the dashboard widgets system
   */
  async initialize() {
    // Load user preferences
    this.loadUserPreferences();
    
    // Register default widgets
    this.registerDefaultWidgets();
    
    // Load widget layout
    this.loadWidgetLayout();
    
    // Render dashboard
    await this.renderDashboard();
    
    console.log('[DashboardWidgets] System initialized');
  }

  /**
   * Load user preferences from localStorage
   */
  loadUserPreferences() {
    try {
      const savedPreferences = localStorage.getItem('zantara-dashboard-preferences');
      if (savedPreferences) {
        this.userPreferences = JSON.parse(savedPreferences);
      }
    } catch (error) {
      console.error('[DashboardWidgets] Error loading preferences:', error);
    }
  }

  /**
   * Save user preferences to localStorage
   */
  saveUserPreferences() {
    try {
      localStorage.setItem('zantara-dashboard-preferences', 
        JSON.stringify(this.userPreferences));
    } catch (error) {
      console.error('[DashboardWidgets] Error saving preferences:', error);
    }
  }

  /**
   * Load widget layout from localStorage
   */
  loadWidgetLayout() {
    try {
      const savedLayout = localStorage.getItem('zantara-dashboard-layout');
      if (savedLayout) {
        this.widgetLayout = JSON.parse(savedLayout);
      } else {
        // Use default layout
        this.widgetLayout = this.defaultLayout;
      }
    } catch (error) {
      console.error('[DashboardWidgets] Error loading layout:', error);
      this.widgetLayout = this.defaultLayout;
    }
  }

  /**
   * Save widget layout to localStorage
   */
  saveWidgetLayout() {
    try {
      localStorage.setItem('zantara-dashboard-layout', 
        JSON.stringify(this.widgetLayout));
    } catch (error) {
      console.error('[DashboardWidgets] Error saving layout:', error);
    }
  }

  /**
   * Register default widgets
   */
  registerDefaultWidgets() {
    // System Status Widget
    this.registerWidget('systemStatus', {
      title: 'System Status',
      description: 'Real-time system health and status',
      render: this.renderSystemStatusWidget.bind(this),
      update: this.updateSystemStatusWidget.bind(this),
      minWidth: 1,
      minHeight: 1
    });

    // Handler Stats Widget
    this.registerWidget('handlerStats', {
      title: 'Handler Integration',
      description: 'Statistics on handler integration progress',
      render: this.renderHandlerStatsWidget.bind(this),
      update: this.updateHandlerStatsWidget.bind(this),
      minWidth: 1,
      minHeight: 1
    });

    // AI Insights Widget
    this.registerWidget('aiInsights', {
      title: 'AI Insights',
      description: 'Information about AI models and capabilities',
      render: this.renderAIInsightsWidget.bind(this),
      update: this.updateAIInsightsWidget.bind(this),
      minWidth: 1,
      minHeight: 1
    });

    // Recent Activity Widget
    this.registerWidget('recentActivity', {
      title: 'Recent Activity',
      description: 'Latest system activities and events',
      render: this.renderRecentActivityWidget.bind(this),
      update: this.updateRecentActivityWidget.bind(this),
      minWidth: 1,
      minHeight: 1
    });

    // Performance Metrics Widget
    this.registerWidget('performanceMetrics', {
      title: 'Performance Metrics',
      description: 'System performance and response times',
      render: this.renderPerformanceMetricsWidget.bind(this),
      update: this.updatePerformanceMetricsWidget.bind(this),
      minWidth: 2,
      minHeight: 1
    });
  }

  /**
   * Register a new widget type
   */
  registerWidget(type, widgetDefinition) {
    this.widgets.set(type, widgetDefinition);
    console.log(`[DashboardWidgets] Registered widget type: ${type}`);
  }

  /**
   * Add a new widget to the dashboard
   */
  addWidget(widgetConfig) {
    // Generate ID if not provided
    if (!widgetConfig.id) {
      widgetConfig.id = `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // Set default position if not provided
    if (typeof widgetConfig.x === 'undefined') {
      widgetConfig.x = 0;
      widgetConfig.y = Math.max(...this.widgetLayout.map(w => w.y), 0) + 1;
    }
    
    // Set default size if not provided
    if (typeof widgetConfig.width === 'undefined') {
      widgetConfig.width = 1;
    }
    
    if (typeof widgetConfig.height === 'undefined') {
      widgetConfig.height = 1;
    }
    
    // Add to layout
    this.widgetLayout.push(widgetConfig);
    
    // Save layout
    this.saveWidgetLayout();
    
    // Re-render dashboard
    this.renderDashboard();
    
    console.log(`[DashboardWidgets] Added widget: ${widgetConfig.id}`);
    return widgetConfig.id;
  }

  /**
   * Remove a widget from the dashboard
   */
  removeWidget(widgetId) {
    const index = this.widgetLayout.findIndex(w => w.id === widgetId);
    if (index !== -1) {
      this.widgetLayout.splice(index, 1);
      this.saveWidgetLayout();
      this.renderDashboard();
      console.log(`[DashboardWidgets] Removed widget: ${widgetId}`);
      return true;
    }
    return false;
  }

  /**
   * Update widget position and size
   */
  updateWidgetLayout(widgetId, newLayout) {
    const widget = this.widgetLayout.find(w => w.id === widgetId);
    if (widget) {
      Object.assign(widget, newLayout);
      this.saveWidgetLayout();
      this.renderDashboard();
      console.log(`[DashboardWidgets] Updated widget layout: ${widgetId}`);
      return true;
    }
    return false;
  }

  /**
   * Render the complete dashboard
   */
  async renderDashboard() {
    const dashboardContainer = document.getElementById('rocket-dashboard');
    if (!dashboardContainer) return;
    
    // Sort widgets by position
    const sortedWidgets = [...this.widgetLayout].sort((a, b) => {
      if (a.y !== b.y) return a.y - b.y;
      return a.x - b.x;
    });
    
    // Create dashboard grid
    let dashboardHTML = `
      <div class="dashboard-widgets-grid">
        ${sortedWidgets.map(widgetConfig => this.renderWidgetPlaceholder(widgetConfig)).join('')}
      </div>
    `;
    
    dashboardContainer.innerHTML = dashboardHTML;
    
    // Render each widget content
    for (const widgetConfig of sortedWidgets) {
      await this.renderWidgetContent(widgetConfig);
    }
    
    // Set up widget interactions
    this.setupWidgetInteractions();
  }

  /**
   * Render widget placeholder
   */
  renderWidgetPlaceholder(widgetConfig) {
    const widgetDef = this.widgets.get(widgetConfig.type);
    const title = widgetDef ? widgetDef.title : 'Unknown Widget';
    
    return `
      <div class="dashboard-widget" 
           id="widget-${widgetConfig.id}"
           data-widget-id="${widgetConfig.id}"
           data-widget-type="${widgetConfig.type}"
           style="grid-column: ${widgetConfig.x + 1} / span ${widgetConfig.width}; 
                  grid-row: ${widgetConfig.y + 1} / span ${widgetConfig.height};">
        <div class="widget-header">
          <h3>${title}</h3>
          <div class="widget-controls">
            <button class="widget-refresh" title="Refresh">&#x21bb;</button>
            <button class="widget-remove" title="Remove">&times;</button>
          </div>
        </div>
        <div class="widget-content" id="widget-content-${widgetConfig.id}">
          <div class="widget-loading">Loading...</div>
        </div>
      </div>
    `;
  }

  /**
   * Render widget content
   */
  async renderWidgetContent(widgetConfig) {
    const widgetDef = this.widgets.get(widgetConfig.type);
    if (!widgetDef) {
      document.getElementById(`widget-content-${widgetConfig.id}`).innerHTML = 
        '<div class="widget-error">Widget type not found</div>';
      return;
    }
    
    try {
      const content = await widgetDef.render(widgetConfig);
      const contentElement = document.getElementById(`widget-content-${widgetConfig.id}`);
      if (contentElement) {
        contentElement.innerHTML = content;
      }
    } catch (error) {
      console.error(`[DashboardWidgets] Error rendering widget ${widgetConfig.id}:`, error);
      document.getElementById(`widget-content-${widgetConfig.id}`).innerHTML = 
        `<div class="widget-error">Error: ${error.message}</div>`;
    }
  }

  /**
   * Set up widget interactions
   */
  setupWidgetInteractions() {
    // Refresh buttons
    document.querySelectorAll('.widget-refresh').forEach(button => {
      button.addEventListener('click', (e) => {
        const widgetElement = e.target.closest('.dashboard-widget');
        const widgetId = widgetElement.getAttribute('data-widget-id');
        this.refreshWidget(widgetId);
      });
    });
    
    // Remove buttons
    document.querySelectorAll('.widget-remove').forEach(button => {
      button.addEventListener('click', (e) => {
        const widgetElement = e.target.closest('.dashboard-widget');
        const widgetId = widgetElement.getAttribute('data-widget-id');
        this.removeWidget(widgetId);
      });
    });
  }

  /**
   * Refresh a specific widget
   */
  async refreshWidget(widgetId) {
    const widgetConfig = this.widgetLayout.find(w => w.id === widgetId);
    if (!widgetConfig) return;
    
    const widgetDef = this.widgets.get(widgetConfig.type);
    if (!widgetDef) return;
    
    // Show loading state
    const contentElement = document.getElementById(`widget-content-${widgetId}`);
    if (contentElement) {
      contentElement.innerHTML = '<div class="widget-loading">Refreshing...</div>';
    }
    
    // Call update function if available, otherwise re-render
    try {
      if (widgetDef.update) {
        const updatedContent = await widgetDef.update(widgetConfig);
        if (contentElement) {
          contentElement.innerHTML = updatedContent;
        }
      } else {
        await this.renderWidgetContent(widgetConfig);
      }
    } catch (error) {
      console.error(`[DashboardWidgets] Error refreshing widget ${widgetId}:`, error);
      if (contentElement) {
        contentElement.innerHTML = `<div class="widget-error">Refresh error: ${error.message}</div>`;
      }
    }
  }

  /**
   * Render system status widget
   */
  async renderSystemStatusWidget() {
    // In a real implementation, this would fetch real data
    return `
      <div class="system-status-widget">
        <div class="status-grid">
          <div class="status-item">
            <span class="status-label">Backend Status</span>
            <span class="status-value status-ok">Operational</span>
          </div>
          <div class="status-item">
            <span class="status-label">Version</span>
            <span class="status-value">v5.2.0</span>
          </div>
          <div class="status-item">
            <span class="status-label">Handlers</span>
            <span class="status-value">122</span>
          </div>
          <div class="status-item">
            <span class="status-label">Tools</span>
            <span class="status-value">164</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update system status widget
   */
  async updateSystemStatusWidget() {
    // Simulate updating with fresh data
    return this.renderSystemStatusWidget();
  }

  /**
   * Render handler stats widget
   */
  async renderHandlerStatsWidget() {
    // In a real implementation, this would use real data from HandlerDiscovery
    const totalHandlers = 122;
    const integratedHandlers = 25;
    const integrationPercentage = Math.round((integratedHandlers / totalHandlers) * 100);
    
    return `
      <div class="handler-stats-widget">
        <div class="stats-visualization">
          <div class="progress-container">
            <div class="progress-label">
              <span>Integration Progress</span>
              <span>${integrationPercentage}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${integrationPercentage}%"></div>
            </div>
          </div>
          
          <div class="stats-numbers">
            <div class="stat-item">
              <span class="stat-value">${integratedHandlers}</span>
              <span class="stat-label">Integrated</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${totalHandlers - integratedHandlers}</span>
              <span class="stat-label">Available</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">${totalHandlers}</span>
              <span class="stat-label">Total</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update handler stats widget
   */
  async updateHandlerStatsWidget() {
    return this.renderHandlerStatsWidget();
  }

  /**
   * Render AI insights widget
   */
  async renderAIInsightsWidget() {
    return `
      <div class="ai-insights-widget">
        <div class="insights-content">
          <div class="insight-item">
            <h4>🤖 AI Models</h4>
            <ul>
              <li>Claude Haiku 4.5 - Frontend (100%)</li>
              <li>ZANTARA Llama 3.1 - Background</li>
              <li>DevAI Qwen 2.5 - Development</li>
            </ul>
          </div>
          
          <div class="insight-item">
            <h4>⚡ Performance</h4>
            <ul>
              <li>Golden Answers: 50-60% cache hit</li>
              <li>Response Time: 10-20ms (cached) / 1-2s (RAG)</li>
              <li>Cost Reduction: 70-80% with caching</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update AI insights widget
   */
  async updateAIInsightsWidget() {
    return this.renderAIInsightsWidget();
  }

  /**
   * Render recent activity widget
   */
  async renderRecentActivityWidget() {
    // In a real implementation, this would fetch actual activity data
    const activities = [
      { time: '2 min ago', action: 'Handler executed: team.list', user: 'System' },
      { time: '5 min ago', action: 'New conversation started', user: 'User' },
      { time: '10 min ago', action: 'Dashboard accessed', user: 'Admin' },
      { time: '15 min ago', action: 'Settings updated', user: 'User' }
    ];
    
    return `
      <div class="recent-activity-widget">
        <ul class="activity-list">
          ${activities.map(activity => `
            <li class="activity-item">
              <div class="activity-time">${activity.time}</div>
              <div class="activity-content">${activity.action}</div>
              <div class="activity-user">by ${activity.user}</div>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Update recent activity widget
   */
  async updateRecentActivityWidget() {
    return this.renderRecentActivityWidget();
  }

  /**
   * Render performance metrics widget
   */
  async renderPerformanceMetricsWidget() {
    // In a real implementation, this would show actual performance data
    return `
      <div class="performance-metrics-widget">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">127ms</div>
            <div class="metric-label">Avg. Response Time</div>
            <div class="metric-trend">↓ 5%</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">99.2%</div>
            <div class="metric-label">Uptime</div>
            <div class="metric-trend">↑ 0.1%</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">1.2k</div>
            <div class="metric-label">Requests/Min</div>
            <div class="metric-trend">↑ 12%</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">24</div>
            <div class="metric-label">Active Users</div>
            <div class="metric-trend">↑ 3</div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Update performance metrics widget
   */
  async updatePerformanceMetricsWidget() {
    return this.renderPerformanceMetricsWidget();
  }

  /**
   * Get available widget types
   */
  getAvailableWidgetTypes() {
    const types = [];
    for (const [type, definition] of this.widgets) {
      types.push({
        type,
        title: definition.title,
        description: definition.description
      });
    }
    return types;
  }

  /**
   * Reset to default layout
   */
  resetToDefaultLayout() {
    this.widgetLayout = [...this.defaultLayout];
    this.saveWidgetLayout();
    this.renderDashboard();
    console.log('[DashboardWidgets] Reset to default layout');
  }

  /**
   * Get dashboard statistics
   */
  getStatistics() {
    const widgetTypes = {};
    this.widgetLayout.forEach(widget => {
      widgetTypes[widget.type] = (widgetTypes[widget.type] || 0) + 1;
    });
    
    return {
      totalWidgets: this.widgetLayout.length,
      widgetTypes,
      layoutComplexity: this.calculateLayoutComplexity()
    };
  }

  /**
   * Calculate layout complexity score
   */
  calculateLayoutComplexity() {
    // Simple complexity calculation based on layout diversity
    const positions = new Set();
    const sizes = new Set();
    
    this.widgetLayout.forEach(widget => {
      positions.add(`${widget.x},${widget.y}`);
      sizes.add(`${widget.width},${widget.height}`);
    });
    
    return {
      uniquePositions: positions.size,
      uniqueSizes: sizes.size,
      totalWidgets: this.widgetLayout.length
    };
  }
}

// Initialize dashboard widgets system
document.addEventListener('DOMContentLoaded', () => {
  window.DashboardWidgets = new DashboardWidgets();
  window.DashboardWidgets.initialize();
  
  console.log('[DashboardWidgets] System ready');
  
  // Mark enhancement as completed
  if (window.enhancementTracker) {
    window.enhancementTracker.markCompleted(23);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardWidgets;
}