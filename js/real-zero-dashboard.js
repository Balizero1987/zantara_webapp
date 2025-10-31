/**
 * ZERO Real Dashboard Service
 * Displays authentic team analytics from PostgreSQL database
 */

class RealZeroDashboardService {
  constructor() {
    this.apiBase = window.ZANTARA_API?.config?.backend_url || 'https://nuzantara-rag.fly.dev';
    this.isZero = false;
    this.dashboardElement = null;
    this.updateInterval = null;

    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      const user = window.ZantaraStorage?.getUser();
      if (user && user.email === 'zero@balizero.com') {
        this.isZero = true;
        console.log('[RealZeroDashboard] Identified as ZERO. Initializing real dashboard.');
        this.fetchAndRenderRealDashboard();
        this.startAutoUpdate();
      } else {
        console.log('[RealZeroDashboard] Not ZERO, real dashboard not enabled.');
      }
    });
  }

  startAutoUpdate() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = setInterval(() => this.fetchAndRenderRealDashboard(), 5 * 60 * 1000); // Every 5 minutes
    console.log('[RealZeroDashboard] Real auto-update started (every 5 minutes).');
  }

  async fetchAndRenderRealDashboard() {
    if (!this.isZero) return;

    try {
      const response = await fetch(`${this.apiBase}/bali-zero/analytics/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.ok && data.data) {
        this.renderRealDashboard(data.data);
      } else {
        console.error('[RealZeroDashboard] Failed to fetch real dashboard data:', data.error || 'Unknown error');
        this.showErrorMessage();
      }
    } catch (error) {
      console.error('[RealZeroDashboard] Error fetching real dashboard data:', error);
      this.showErrorMessage();
    }
  }

  renderRealDashboard(data) {
    if (!this.dashboardElement) {
      this.dashboardElement = this.createRealDashboardWidget(data);
      const chatContainer = document.querySelector('.chat-wrapper');
      if (chatContainer) {
        chatContainer.insertBefore(this.dashboardElement, chatContainer.firstChild);
      }
    } else {
      // Update existing widget content with real data
      this.updateRealDashboardContent(data);
    }
  }

  createRealDashboardWidget(data) {
    const widget = document.createElement('div');
    widget.className = 'real-zero-dashboard-widget';
    widget.innerHTML = `
      <div class="dashboard-header">
        <div class="dashboard-title">
          <span class="title-icon">📊</span>
          <span class="title-text">ZERO Real Dashboard</span>
          <span class="title-subtitle">Live Team Data</span>
        </div>
        <div class="last-updated">
          <span class="update-label">Last updated:</span>
          <span class="update-time">${new Date().toLocaleTimeString()}</span>
        </div>
      </div>
      <div class="dashboard-content">
        <div class="metrics-grid">
          <div class="metric-card active-sessions">
            <div class="metric-icon">🟢</div>
            <div class="metric-content">
              <div class="metric-label">Active Sessions</div>
              <div class="metric-value">${data.active_sessions || 0}</div>
            </div>
          </div>
          <div class="metric-card total-hours">
            <div class="metric-icon">⏰</div>
            <div class="metric-content">
              <div class="metric-label">Total Hours Today</div>
              <div class="metric-value">${data.total_hours_today || 0}h</div>
            </div>
          </div>
          <div class="metric-card conversations">
            <div class="metric-icon">💬</div>
            <div class="metric-content">
              <div class="metric-label">Conversations</div>
              <div class="metric-value">${data.total_conversations || 0}</div>
            </div>
          </div>
        </div>
        <div class="team-section">
          <div class="section-header">
            <span class="section-icon">👥</span>
            <span class="section-title">Real Team Activity</span>
          </div>
          <div class="members-grid">
            ${this.renderRealTeamMembers(data.team_members || [])}
          </div>
        </div>
      </div>
    `;

    // Add CSS
    this.addRealDashboardCSS();
    
    return widget;
  }

  updateRealDashboardContent(data) {
    if (!this.dashboardElement) return;
    
    this.dashboardElement.querySelector('.update-time').textContent = new Date().toLocaleTimeString();
    this.dashboardElement.querySelector('.active-sessions .metric-value').textContent = data.active_sessions || 0;
    this.dashboardElement.querySelector('.total-hours .metric-value').textContent = `${data.total_hours_today || 0}h`;
    this.dashboardElement.querySelector('.conversations .metric-value').textContent = data.total_conversations || 0;
    this.dashboardElement.querySelector('.members-grid').innerHTML = this.renderRealTeamMembers(data.team_members || []);
  }

  renderRealTeamMembers(members) {
    if (!members || members.length === 0) {
      return '<div class="no-data">No real team data available</div>';
    }

    return members.map(member => `
      <div class="member-card ${member.status}">
        <div class="member-avatar">
          <div class="avatar-circle ${member.status}">
            ${member.name.charAt(0).toUpperCase()}
          </div>
        </div>
        <div class="member-details">
          <div class="member-name">${member.name}</div>
          <div class="member-role">${member.role || 'Team Member'}</div>
          <div class="member-metrics">
            <span class="metric-item">
              <span class="metric-icon">⏰</span>
              <span class="metric-value">${member.hours_worked || 0}h</span>
            </span>
            <span class="metric-item">
              <span class="metric-icon">💬</span>
              <span class="metric-value">${member.conversations || 0}</span>
            </span>
          </div>
        </div>
        <div class="member-status">
          <div class="status-indicator ${member.status}"></div>
          <div class="status-text">${member.status}</div>
        </div>
      </div>
    `).join('');
  }

  addRealDashboardCSS() {
    if (document.getElementById('real-zero-dashboard-css')) return;

    const style = document.createElement('style');
    style.id = 'real-zero-dashboard-css';
    style.textContent = `
      .real-zero-dashboard-widget {
        background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #2d2d2d 100%);
        border: 1px solid #333;
        border-radius: 16px;
        padding: 24px;
        margin: 20px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        position: relative;
        overflow: hidden;
      }
      
      .real-zero-dashboard-widget::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #10B981, #3B82F6, #8B5CF6);
      }
      
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #333;
      }
      
      .dashboard-title {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .title-icon {
        font-size: 24px;
      }
      
      .title-text {
        color: #fff;
        font-size: 20px;
        font-weight: 600;
      }
      
      .title-subtitle {
        color: #888;
        font-size: 14px;
        font-weight: 400;
      }
      
      .last-updated {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
      }
      
      .update-label {
        color: #666;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .update-time {
        color: #10B981;
        font-size: 12px;
        font-weight: 500;
      }
      
      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
        margin-bottom: 24px;
      }
      
      .metric-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid #333;
        border-radius: 12px;
        transition: all 0.3s ease;
      }
      
      .metric-card:hover {
        background: rgba(255, 255, 255, 0.05);
        border-color: #444;
        transform: translateY(-2px);
      }
      
      .metric-icon {
        font-size: 24px;
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
      }
      
      .metric-content {
        flex: 1;
      }
      
      .metric-label {
        color: #aaa;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }
      
      .metric-value {
        color: #fff;
        font-size: 24px;
        font-weight: 700;
      }
      
      .team-section {
        margin-top: 24px;
      }
      
      .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;
      }
      
      .section-icon {
        font-size: 20px;
      }
      
      .section-title {
        color: #fff;
        font-size: 16px;
        font-weight: 600;
      }
      
      .members-grid {
        display: grid;
        gap: 12px;
      }
      
      .member-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid #333;
        border-radius: 12px;
        transition: all 0.3s ease;
      }
      
      .member-card:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: #444;
      }
      
      .member-card.active {
        border-left: 4px solid #10B981;
      }
      
      .member-card.inactive {
        border-left: 4px solid #EF4444;
      }
      
      .member-avatar {
        flex-shrink: 0;
      }
      
      .avatar-circle {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 16px;
        color: #fff;
      }
      
      .avatar-circle.active {
        background: linear-gradient(135deg, #10B981, #059669);
      }
      
      .avatar-circle.inactive {
        background: linear-gradient(135deg, #EF4444, #DC2626);
      }
      
      .member-details {
        flex: 1;
      }
      
      .member-name {
        color: #fff;
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 2px;
      }
      
      .member-role {
        color: #aaa;
        font-size: 12px;
        margin-bottom: 8px;
      }
      
      .member-metrics {
        display: flex;
        gap: 16px;
      }
      
      .metric-item {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #888;
        font-size: 11px;
      }
      
      .metric-icon {
        font-size: 12px;
      }
      
      .metric-value {
        font-weight: 500;
      }
      
      .member-status {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }
      
      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }
      
      .status-indicator.active {
        background: #10B981;
        box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
      }
      
      .status-indicator.inactive {
        background: #EF4444;
        box-shadow: 0 0 8px rgba(239, 68, 68, 0.4);
      }
      
      .status-text {
        color: #aaa;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .no-data {
        color: #666;
        text-align: center;
        padding: 40px;
        font-style: italic;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 12px;
        border: 1px dashed #444;
      }
    `;
    
    document.head.appendChild(style);
  }

  showErrorMessage() {
    if (this.dashboardElement) {
      this.dashboardElement.innerHTML = `
        <div class="real-zero-dashboard-widget error-state">
          <div class="dashboard-header">
            <div class="dashboard-title">
              <span class="title-icon">❌</span>
              <span class="title-text">ZERO Real Dashboard Error</span>
            </div>
            <div class="last-updated">
              <span class="update-time">${new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <div class="dashboard-content">
            <p class="error-message">
              Non riesco a recuperare i dati reali del team dal database.
              <br>
              Verifica la connessione al backend PostgreSQL.
            </p>
          </div>
        </div>
      `;
      this.addRealDashboardCSS();
    }
  }
}

// Initialize real analytics handler
let realZeroAnalytics = null;
document.addEventListener('DOMContentLoaded', () => {
  realZeroAnalytics = new RealZeroDashboardService();
});