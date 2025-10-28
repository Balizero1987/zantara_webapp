/**
 * AI-Powered Insights System
 * Enhancement #34 for NUZANTARA-RAILWAY
 * Implements intelligent analysis and insights based on user data and activities
 */

class AIPoweredInsights {
  constructor() {
    this.insights = [];
    this.insightModels = new Map();
    this.analysisHistory = [];
    this.maxHistoryItems = 30;
    this.aiEnabled = true;
    this.insightFrequency = 'daily'; // daily, weekly, monthly
  }

  /**
   * Initialize the AI-powered insights system
   */
  async initialize() {
    // Register insight models
    this.registerInsightModels();
    
    // Load previous insights
    this.loadInsights();
    
    // Set up periodic analysis
    this.setupPeriodicAnalysis();
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('[AIPoweredInsights] System initialized');
  }

  /**
   * Register insight models
   */
  registerInsightModels() {
    // User behavior insights
    this.insightModels.set('user_behavior', {
      name: 'User Behavior Analysis',
      description: 'Analyzes user patterns and behaviors',
      priority: 'high',
      generate: this.generateUserBehaviorInsights.bind(this)
    });

    // Performance insights
    this.insightModels.set('performance', {
      name: 'Performance Analysis',
      description: 'Analyzes system performance metrics',
      priority: 'high',
      generate: this.generatePerformanceInsights.bind(this)
    });

    // Handler usage insights
    this.insightModels.set('handler_usage', {
      name: 'Handler Usage Analysis',
      description: 'Analyzes handler usage patterns',
      priority: 'medium',
      generate: this.generateHandlerUsageInsights.bind(this)
    });

    // Conversation insights
    this.insightModels.set('conversation', {
      name: 'Conversation Analysis',
      description: 'Analyzes conversation patterns and topics',
      priority: 'medium',
      generate: this.generateConversationInsights.bind(this)
    });

    // Productivity insights
    this.insightModels.set('productivity', {
      name: 'Productivity Analysis',
      description: 'Analyzes user productivity patterns',
      priority: 'medium',
      generate: this.generateProductivityInsights.bind(this)
    });

    console.log('[AIPoweredInsights] Insight models registered');
  }

  /**
   * Load insights from storage
   */
  loadInsights() {
    try {
      const savedInsights = localStorage.getItem('zantara-ai-insights');
      if (savedInsights) {
        this.insights = JSON.parse(savedInsights);
      }
      
      const savedHistory = localStorage.getItem('zantara-insight-history');
      if (savedHistory) {
        this.analysisHistory = JSON.parse(savedHistory);
      }
      
      console.log('[AIPoweredInsights] Insights loaded');
    } catch (error) {
      console.error('[AIPoweredInsights] Error loading insights:', error);
    }
  }

  /**
   * Save insights to storage
   */
  saveInsights() {
    try {
      localStorage.setItem('zantara-ai-insights', JSON.stringify(this.insights));
      localStorage.setItem('zantara-insight-history', JSON.stringify(this.analysisHistory));
    } catch (error) {
      console.error('[AIPoweredInsights] Error saving insights:', error);
    }
  }

  /**
   * Set up periodic analysis
   */
  setupPeriodicAnalysis() {
    // Run initial analysis
    this.runPeriodicAnalysis();
    
    // Set up interval based on frequency
    let intervalTime;
    switch (this.insightFrequency) {
      case 'hourly':
        intervalTime = 3600000; // 1 hour
        break;
      case 'daily':
        intervalTime = 86400000; // 24 hours
        break;
      case 'weekly':
        intervalTime = 604800000; // 7 days
        break;
      default:
        intervalTime = 86400000; // Default to daily
    }
    
    setInterval(() => {
      this.runPeriodicAnalysis();
    }, intervalTime);
    
    console.log('[AIPoweredInsights] Periodic analysis set up');
  }

  /**
   * Run periodic analysis
   */
  async runPeriodicAnalysis() {
    if (!this.aiEnabled) return;
    
    console.log('[AIPoweredInsights] Running periodic analysis');
    
    // Generate insights from all models
    for (const [modelName, model] of this.insightModels) {
      try {
        await model.generate();
      } catch (error) {
        console.error(`[AIPoweredInsights] Error generating insights from ${modelName}:`, error);
      }
    }
    
    // Save insights
    this.saveInsights();
  }

  /**
   * Generate user behavior insights
   */
  async generateUserBehaviorInsights() {
    // In a real implementation, this would analyze actual user behavior data
    // For now, we'll simulate insights based on mock data
    
    const insights = [];
    
    // Simulate user behavior analysis
    const userActivity = this.getMockUserActivity();
    
    // Peak usage time insight
    const peakHour = this.analyzePeakUsageTime(userActivity);
    if (peakHour) {
      insights.push({
        id: `insight_${Date.now()}_1`,
        type: 'user_behavior',
        category: 'usage_pattern',
        title: 'Peak Usage Time Identified',
        description: `Most users are active between ${peakHour.start}:00 and ${peakHour.end}:00`,
        severity: 'info',
        recommendation: 'Consider scheduling important notifications during peak hours',
        timestamp: new Date().toISOString(),
        data: { peakHour }
      });
    }
    
    // Activity trend insight
    const trend = this.analyzeActivityTrend(userActivity);
    if (trend) {
      insights.push({
        id: `insight_${Date.now()}_2`,
        type: 'user_behavior',
        category: 'trend',
        title: `Activity Trend: ${trend.direction}`,
        description: `User activity has been ${trend.direction.toLowerCase()} by ${trend.percentage}% over the last period`,
        severity: trend.direction === 'Increasing' ? 'positive' : 'warning',
        recommendation: trend.direction === 'Increasing' 
          ? 'Great! Keep up the good work engaging users'
          : 'Consider implementing new features to increase engagement',
        timestamp: new Date().toISOString(),
        data: { trend }
      });
    }
    
    // Add insights to system
    this.addInsights(insights);
    
    console.log('[AIPoweredInsights] User behavior insights generated');
  }

  /**
   * Generate performance insights
   */
  async generatePerformanceInsights() {
    // In a real implementation, this would analyze actual performance data
    // For now, we'll simulate insights based on mock data
    
    const insights = [];
    
    // Simulate performance analysis
    const performanceData = this.getMockPerformanceData();
    
    // Response time insight
    if (performanceData.avgResponseTime > 200) {
      insights.push({
        id: `insight_${Date.now()}_3`,
        type: 'performance',
        category: 'response_time',
        title: 'Response Time Degradation',
        description: `Average response time is ${performanceData.avgResponseTime}ms, which is above optimal`,
        severity: 'warning',
        recommendation: 'Consider optimizing database queries or implementing caching',
        timestamp: new Date().toISOString(),
        data: { responseTime: performanceData.avgResponseTime }
      });
    }
    
    // Error rate insight
    if (performanceData.errorRate > 2) {
      insights.push({
        id: `insight_${Date.now()}_4`,
        type: 'performance',
        category: 'error_rate',
        title: 'High Error Rate Detected',
        description: `Error rate is ${performanceData.errorRate}%, which is above threshold`,
        severity: 'critical',
        recommendation: 'Investigate server logs and fix recurring errors',
        timestamp: new Date().toISOString(),
        data: { errorRate: performanceData.errorRate }
      });
    }
    
    // Add insights to system
    this.addInsights(insights);
    
    console.log('[AIPoweredInsights] Performance insights generated');
  }

  /**
   * Generate handler usage insights
   */
  async generateHandlerUsageInsights() {
    // In a real implementation, this would analyze actual handler usage data
    // For now, we'll simulate insights based on mock data
    
    const insights = [];
    
    // Simulate handler usage analysis
    const handlerData = this.getMockHandlerUsageData();
    
    // Popular handlers insight
    const popularHandlers = handlerData.filter(h => h.usageCount > 50);
    if (popularHandlers.length > 0) {
      insights.push({
        id: `insight_${Date.now()}_5`,
        type: 'handler_usage',
        category: 'popular',
        title: 'Popular Handlers Identified',
        description: `${popularHandlers.length} handlers are being used frequently`,
        severity: 'info',
        recommendation: 'Consider optimizing these popular handlers for better performance',
        timestamp: new Date().toISOString(),
        data: { popularHandlers: popularHandlers.map(h => h.name) }
      });
    }
    
    // Underutilized handlers insight
    const underutilizedHandlers = handlerData.filter(h => h.usageCount < 5);
    if (underutilizedHandlers.length > 5) {
      insights.push({
        id: `insight_${Date.now()}_6`,
        type: 'handler_usage',
        category: 'underutilized',
        title: 'Underutilized Handlers',
        description: `${underutilizedHandlers.length} handlers are rarely used`,
        severity: 'info',
        recommendation: 'Consider removing or repurposing underutilized handlers',
        timestamp: new Date().toISOString(),
        data: { underutilizedHandlers: underutilizedHandlers.map(h => h.name) }
      });
    }
    
    // Add insights to system
    this.addInsights(insights);
    
    console.log('[AIPoweredInsights] Handler usage insights generated');
  }

  /**
   * Generate conversation insights
   */
  async generateConversationInsights() {
    // In a real implementation, this would analyze actual conversation data
    // For now, we'll simulate insights based on mock data
    
    const insights = [];
    
    // Simulate conversation analysis
    const conversationData = this.getMockConversationData();
    
    // Conversation length insight
    if (conversationData.avgMessagesPerConversation > 10) {
      insights.push({
        id: `insight_${Date.now()}_7`,
        type: 'conversation',
        category: 'length',
        title: 'Lengthy Conversations',
        description: `Average conversation length is ${conversationData.avgMessagesPerConversation} messages`,
        severity: 'info',
        recommendation: 'Users are having in-depth conversations. Consider conversation summarization features',
        timestamp: new Date().toISOString(),
        data: { avgMessages: conversationData.avgMessagesPerConversation }
      });
    }
    
    // Common topics insight
    if (conversationData.commonTopics.length > 0) {
      insights.push({
        id: `insight_${Date.now()}_8`,
        type: 'conversation',
        category: 'topics',
        title: 'Common Conversation Topics',
        description: `Most common topics: ${conversationData.commonTopics.slice(0, 3).join(', ')}`,
        severity: 'info',
        recommendation: 'Consider creating dedicated handlers for these common topics',
        timestamp: new Date().toISOString(),
        data: { topics: conversationData.commonTopics.slice(0, 5) }
      });
    }
    
    // Add insights to system
    this.addInsights(insights);
    
    console.log('[AIPoweredInsights] Conversation insights generated');
  }

  /**
   * Generate productivity insights
   */
  async generateProductivityInsights() {
    // In a real implementation, this would analyze actual productivity data
    // For now, we'll simulate insights based on mock data
    
    const insights = [];
    
    // Simulate productivity analysis
    const productivityData = this.getMockProductivityData();
    
    // Task completion insight
    if (productivityData.completionRate < 80) {
      insights.push({
        id: `insight_${Date.now()}_9`,
        type: 'productivity',
        category: 'completion',
        title: 'Task Completion Rate',
        description: `Task completion rate is ${productivityData.completionRate}%`,
        severity: productivityData.completionRate < 50 ? 'warning' : 'info',
        recommendation: productivityData.completionRate < 50 
          ? 'Identify barriers preventing task completion'
          : 'Maintain current productivity levels',
        timestamp: new Date().toISOString(),
        data: { completionRate: productivityData.completionRate }
      });
    }
    
    // Peak productivity insight
    if (productivityData.peakProductivityHour) {
      insights.push({
        id: `insight_${Date.now()}_10`,
        type: 'productivity',
        category: 'peak_time',
        title: 'Peak Productivity Time',
        description: `Peak productivity occurs around ${productivityData.peakProductivityHour}:00`,
        severity: 'positive',
        recommendation: 'Schedule important tasks during peak productivity hours',
        timestamp: new Date().toISOString(),
        data: { peakHour: productivityData.peakProductivityHour }
      });
    }
    
    // Add insights to system
    this.addInsights(insights);
    
    console.log('[AIPoweredInsights] Productivity insights generated');
  }

  /**
   * Add insights to the system
   */
  addInsights(newInsights) {
    if (!Array.isArray(newInsights)) {
      newInsights = [newInsights];
    }
    
    newInsights.forEach(insight => {
      this.insights.unshift(insight);
    });
    
    // Limit insights array size
    if (this.insights.length > 100) {
      this.insights = this.insights.slice(0, 100);
    }
    
    // Add to analysis history
    this.analysisHistory.unshift({
      id: `analysis_${Date.now()}`,
      timestamp: new Date().toISOString(),
      insightsCount: newInsights.length,
      models: Array.from(this.insightModels.keys())
    });
    
    // Limit history size
    if (this.analysisHistory.length > this.maxHistoryItems) {
      this.analysisHistory.pop();
    }
    
    // Save insights
    this.saveInsights();
    
    // Notify about new insights
    window.dispatchEvent(new CustomEvent('ai-insights-generated', {
      detail: { insights: newInsights }
    }));
  }

  /**
   * Get mock user activity data
   */
  getMockUserActivity() {
    // Simulate user activity data
    return {
      hourlyActivity: Array(24).fill(0).map(() => Math.floor(Math.random() * 100)),
      dailyActivity: Array(7).fill(0).map(() => Math.floor(Math.random() * 500)),
      monthlyActivity: Array(30).fill(0).map(() => Math.floor(Math.random() * 200))
    };
  }

  /**
   * Analyze peak usage time
   */
  analyzePeakUsageTime(activityData) {
    const hourlyActivity = activityData.hourlyActivity;
    let maxActivity = 0;
    let peakHour = -1;
    
    for (let i = 0; i < hourlyActivity.length; i++) {
      if (hourlyActivity[i] > maxActivity) {
        maxActivity = hourlyActivity[i];
        peakHour = i;
      }
    }
    
    if (peakHour >= 0) {
      return {
        start: peakHour,
        end: (peakHour + 1) % 24,
        activity: maxActivity
      };
    }
    
    return null;
  }

  /**
   * Analyze activity trend
   */
  analyzeActivityTrend(activityData) {
    const dailyActivity = activityData.dailyActivity;
    if (dailyActivity.length < 2) return null;
    
    const recentAvg = dailyActivity.slice(-7).reduce((a, b) => a + b, 0) / 7;
    const previousAvg = dailyActivity.slice(-14, -7).reduce((a, b) => a + b, 0) / 7;
    
    if (previousAvg === 0) return null;
    
    const percentageChange = ((recentAvg - previousAvg) / previousAvg) * 100;
    
    return {
      direction: percentageChange > 0 ? 'Increasing' : 'Decreasing',
      percentage: Math.abs(percentageChange).toFixed(1),
      recentAverage: recentAvg.toFixed(1),
      previousAverage: previousAvg.toFixed(1)
    };
  }

  /**
   * Get mock performance data
   */
  getMockPerformanceData() {
    // Simulate performance data
    return {
      avgResponseTime: Math.floor(Math.random() * 500) + 50, // 50-550ms
      errorRate: Math.floor(Math.random() * 5), // 0-5%
      uptime: 99 + (Math.random() * 0.9) // 99-99.9%
    };
  }

  /**
   * Get mock handler usage data
   */
  getMockHandlerUsageData() {
    // Simulate handler usage data
    const handlers = [
      'team.create', 'team.list', 'project.create', 'project.list',
      'task.create', 'task.assign', 'report.generate', 'user.profile',
      'settings.update', 'notification.send', 'file.upload', 'search.query'
    ];
    
    return handlers.map(name => ({
      name: name,
      usageCount: Math.floor(Math.random() * 100),
      lastUsed: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000)
    }));
  }

  /**
   * Get mock conversation data
   */
  getMockConversationData() {
    // Simulate conversation data
    return {
      avgMessagesPerConversation: Math.floor(Math.random() * 20) + 1,
      commonTopics: ['project management', 'team collaboration', 'task assignment', 'reporting', 'scheduling'],
      sentimentDistribution: {
        positive: Math.floor(Math.random() * 50) + 30,
        neutral: Math.floor(Math.random() * 30) + 20,
        negative: Math.floor(Math.random() * 20) + 10
      }
    };
  }

  /**
   * Get mock productivity data
   */
  getMockProductivityData() {
    // Simulate productivity data
    return {
      completionRate: Math.floor(Math.random() * 100),
      tasksCompleted: Math.floor(Math.random() * 50),
      peakProductivityHour: Math.floor(Math.random() * 24),
      avgTaskDuration: Math.floor(Math.random() * 120) + 10 // 10-130 minutes
    };
  }

  /**
   * Get all insights
   */
  getInsights(filter = {}) {
    let filteredInsights = [...this.insights];
    
    // Apply filters
    if (filter.type) {
      filteredInsights = filteredInsights.filter(insight => insight.type === filter.type);
    }
    
    if (filter.category) {
      filteredInsights = filteredInsights.filter(insight => insight.category === filter.category);
    }
    
    if (filter.severity) {
      filteredInsights = filteredInsights.filter(insight => insight.severity === filter.severity);
    }
    
    return filteredInsights;
  }

  /**
   * Get recent insights
   */
  getRecentInsights(limit = 10) {
    return this.insights.slice(0, limit);
  }

  /**
   * Get insights by type
   */
  getInsightsByType(type) {
    return this.insights.filter(insight => insight.type === type);
  }

  /**
   * Get insights by severity
   */
  getInsightsBySeverity(severity) {
    return this.insights.filter(insight => insight.severity === severity);
  }

  /**
   * Get insight statistics
   */
  getInsightStatistics() {
    const stats = {
      totalInsights: this.insights.length,
      insightsByType: {},
      insightsBySeverity: {},
      recentInsights: this.getRecentInsights(5)
    };
    
    // Count insights by type
    this.insights.forEach(insight => {
      stats.insightsByType[insight.type] = (stats.insightsByType[insight.type] || 0) + 1;
    });
    
    // Count insights by severity
    this.insights.forEach(insight => {
      stats.insightsBySeverity[insight.severity] = (stats.insightsBySeverity[insight.severity] || 0) + 1;
    });
    
    return stats;
  }

  /**
   * Dismiss an insight
   */
  dismissInsight(insightId) {
    this.insights = this.insights.filter(insight => insight.id !== insightId);
    this.saveInsights();
    
    console.log(`[AIPoweredInsights] Insight dismissed: ${insightId}`);
  }

  /**
   * Set AI enabled/disabled
   */
  setAIEnabled(enabled) {
    this.aiEnabled = enabled;
    
    if (enabled) {
      console.log('[AIPoweredInsights] AI insights enabled');
    } else {
      console.log('[AIPoweredInsights] AI insights disabled');
    }
  }

  /**
   * Set insight frequency
   */
  setInsightFrequency(frequency) {
    this.insightFrequency = frequency;
    console.log(`[AIPoweredInsights] Insight frequency set to: ${frequency}`);
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for requests to generate insights
    window.addEventListener('generate-ai-insights', () => {
      this.runPeriodicAnalysis();
    });
    
    // Listen for insight dismissal
    window.addEventListener('dismiss-insight', (event) => {
      this.dismissInsight(event.detail.insightId);
    });
  }

  /**
   * Render AI insights dashboard
   */
  renderInsightsDashboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create insights dashboard HTML
    container.innerHTML = `
      <div class="ai-insights-dashboard">
        <header>
          <h2>🧠 AI-Powered Insights</h2>
          <p>Intelligent analysis and recommendations</p>
        </header>
        
        <div class="insights-controls">
          <div class="insights-actions">
            <button id="generate-insights" class="action-button">Generate Insights</button>
            <button id="clear-insights" class="action-button">Clear Insights</button>
            <button id="toggle-ai" class="action-button">
              ${this.aiEnabled ? 'Disable' : 'Enable'} AI Insights
            </button>
          </div>
          
          <div class="insights-settings">
            <label>
              Frequency:
              <select id="insight-frequency">
                <option value="hourly" ${this.insightFrequency === 'hourly' ? 'selected' : ''}>Hourly</option>
                <option value="daily" ${this.insightFrequency === 'daily' ? 'selected' : ''}>Daily</option>
                <option value="weekly" ${this.insightFrequency === 'weekly' ? 'selected' : ''}>Weekly</option>
              </select>
            </label>
            <label>
              <input type="checkbox" id="auto-generate" checked>
              Auto-generate Insights
            </label>
          </div>
        </div>
        
        <div class="insights-grid">
          <div class="insights-section">
            <h3>Insight Statistics</h3>
            <div id="insight-statistics" class="metrics-container">
              <!-- Insight statistics will be rendered here -->
            </div>
          </div>
          
          <div class="insights-section">
            <h3>Recent Insights</h3>
            <div id="recent-insights" class="insights-container">
              <!-- Recent insights will be rendered here -->
            </div>
          </div>
          
          <div class="insights-section">
            <h3>Insights by Type</h3>
            <div id="insights-by-type" class="types-container">
              <!-- Insights by type will be rendered here -->
            </div>
          </div>
          
          <div class="insights-section">
            <h3>Insights by Severity</h3>
            <div id="insights-by-severity" class="severity-container">
              <!-- Insights by severity will be rendered here -->
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Render components
    this.renderInsightStatistics('insight-statistics');
    this.renderRecentInsights('recent-insights');
    this.renderInsightsByType('insights-by-type');
    this.renderInsightsBySeverity('insights-by-severity');
    
    // Set up action buttons
    document.getElementById('generate-insights').addEventListener('click', () => {
      this.runPeriodicAnalysis();
      alert('Generating insights... Check back in a moment.');
    });
    
    document.getElementById('clear-insights').addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all insights?')) {
        this.insights = [];
        this.saveInsights();
        this.renderInsightsDashboard(containerId); // Re-render
      }
    });
    
    document.getElementById('toggle-ai').addEventListener('click', () => {
      this.setAIEnabled(!this.aiEnabled);
      this.renderInsightsDashboard(containerId); // Re-render
    });
    
    // Set up frequency control
    document.getElementById('insight-frequency').addEventListener('change', (e) => {
      this.setInsightFrequency(e.target.value);
    });
  }

  /**
   * Render insight statistics
   */
  renderInsightStatistics(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const stats = this.getInsightStatistics();
    
    container.innerHTML = `
      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-value">${stats.totalInsights}</div>
          <div class="metric-label">Total Insights</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${Object.keys(stats.insightsByType).length}</div>
          <div class="metric-label">Insight Types</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${Object.keys(stats.insightsBySeverity).length}</div>
          <div class="metric-label">Severity Levels</div>
        </div>
        <div class="metric-card">
          <div class="metric-value">${this.analysisHistory.length}</div>
          <div class="metric-label">Analysis Runs</div>
        </div>
      </div>
    `;
  }

  /**
   * Render recent insights
   */
  renderRecentInsights(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const recentInsights = this.getRecentInsights(5);
    
    if (recentInsights.length === 0) {
      container.innerHTML = '<p class="no-data">No insights available</p>';
      return;
    }
    
    container.innerHTML = `
      <div class="insights-list">
        ${recentInsights.map(insight => `
          <div class="insight-card severity-${insight.severity}">
            <div class="insight-header">
              <h4>${insight.title}</h4>
              <span class="insight-type">${insight.type.replace('_', ' ')}</span>
            </div>
            <div class="insight-description">${insight.description}</div>
            <div class="insight-recommendation">
              <strong>Recommendation:</strong> ${insight.recommendation}
            </div>
            <div class="insight-footer">
              <span class="insight-time">${new Date(insight.timestamp).toLocaleString()}</span>
              <button class="dismiss-insight" data-insight-id="${insight.id}">Dismiss</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    // Set up dismiss buttons
    container.querySelectorAll('.dismiss-insight').forEach(button => {
      button.addEventListener('click', (e) => {
        const insightId = e.target.getAttribute('data-insight-id');
        this.dismissInsight(insightId);
        this.renderRecentInsights(containerId); // Re-render
      });
    });
  }

  /**
   * Render insights by type
   */
  renderInsightsByType(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const stats = this.getInsightStatistics();
    const types = Object.entries(stats.insightsByType);
    
    if (types.length === 0) {
      container.innerHTML = '<p class="no-data">No insights by type</p>';
      return;
    }
    
    container.innerHTML = `
      <div class="types-list">
        <ul>
          ${types.map(([type, count]) => `
            <li class="type-item">
              <span class="type-name">${type.replace('_', ' ')}</span>
              <span class="type-count">${count} insights</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * Render insights by severity
   */
  renderInsightsBySeverity(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const stats = this.getInsightStatistics();
    const severities = Object.entries(stats.insightsBySeverity);
    
    if (severities.length === 0) {
      container.innerHTML = '<p class="no-data">No insights by severity</p>';
      return;
    }
    
    container.innerHTML = `
      <div class="severities-list">
        <ul>
          ${severities.map(([severity, count]) => `
            <li class="severity-item">
              <span class="severity-name">${severity}</span>
              <span class="severity-count">${count} insights</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }
}

// Initialize AI-powered insights system
document.addEventListener('DOMContentLoaded', () => {
  window.AIPoweredInsights = new AIPoweredInsights();
  window.AIPoweredInsights.initialize();
  
  console.log('[AIPoweredInsights] System ready');
  
  // Mark enhancement as completed
  if (window.enhancementTracker) {
    window.enhancementTracker.markCompleted(34);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIPoweredInsights;
}