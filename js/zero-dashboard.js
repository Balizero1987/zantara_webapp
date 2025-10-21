/**
 * ZERO Dashboard Service
 * Real-time team analytics and monitoring for ZERO (CEO)
 * Connects to backend tracking system for real data
 */

class ZeroDashboardService {
  constructor() {
    this.apiBase = 'https://scintillating-kindness-production-47e3.up.railway.app';
    this.isZero = false;
    this.refreshInterval = null;
    this.currentData = null;
    
    this.init();
  }

  async init() {
    // Check if current user is ZERO
    this.isZero = this.checkIfZero();
    
    if (this.isZero) {
      console.log('🎯 [ZeroDashboard] ZERO access detected - enabling dashboard');
      await this.loadTeamData();
      this.setupAutoRefresh();
    } else {
      console.log('👤 [ZeroDashboard] Regular user - dashboard disabled');
    }
  }

  checkIfZero() {
    const user = this.getCurrentUser();
    if (!user) return false;
    
    // Check if user is ZERO (CEO)
    const zeroEmails = [
      'zero@balizero.com',
      'antonello@balizero.com', 
      'antonello.siano@balizero.com'
    ];
    
    return zeroEmails.includes(user.email?.toLowerCase()) || 
           user.role?.toLowerCase().includes('ceo') ||
           user.name?.toLowerCase().includes('antonello');
  }

  getCurrentUser() {
    if (window.ZantaraStorage && window.ZantaraStorage.isLoggedIn()) {
      return window.ZantaraStorage.getUser();
    }
    
    try {
      const userStr = localStorage.getItem('zantara-user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.warn('⚠️ [ZeroDashboard] Could not parse user data');
    }
    
    return null;
  }

  async loadTeamData() {
    try {
      console.log('📊 [ZeroDashboard] Loading real team data...');
      
      const response = await fetch(`${this.apiBase}/bali-zero/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'get_team_analytics',
          user_email: 'zero@balizero.com',
          report_type: 'comprehensive',
          include_sessions: true,
          include_performance: true
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.currentData = data;
        this.displayTeamData(data);
      } else {
        console.error('❌ [ZeroDashboard] Failed to load team data');
        this.showErrorMessage();
      }
    } catch (error) {
      console.error('❌ [ZeroDashboard] Load failed:', error);
      this.showErrorMessage();
    }
  }

  displayTeamData(data) {
    // Create dashboard widget
    const dashboard = this.createDashboardWidget(data);
    
    // Insert into chat interface
    const chatContainer = document.querySelector('.chat-wrapper');
    if (chatContainer) {
      chatContainer.insertBefore(dashboard, chatContainer.firstChild);
    }
  }

  createDashboardWidget(data) {
    const widget = document.createElement('div');
    widget.className = 'zero-dashboard-widget';
    widget.innerHTML = `
      <div class="dashboard-header">
        <h3>📊 ZERO Dashboard - Team Status</h3>
        <span class="last-updated">Last updated: ${new Date().toLocaleTimeString()}</span>
      </div>
      <div class="dashboard-content">
        <div class="team-summary">
          <div class="metric">
            <span class="label">Active Sessions:</span>
            <span class="value">${data.active_sessions || 0}</span>
          </div>
          <div class="metric">
            <span class="label">Total Hours Today:</span>
            <span class="value">${data.total_hours || 0}h</span>
          </div>
          <div class="metric">
            <span class="label">Conversations:</span>
            <span class="value">${data.total_conversations || 0}</span>
          </div>
        </div>
        <div class="team-members">
          <h4>👥 Team Activity</h4>
          <div class="members-list">
            ${this.renderTeamMembers(data.team_members || [])}
          </div>
        </div>
      </div>
    `;

    // Add CSS
    this.addDashboardCSS();
    
    return widget;
  }

  renderTeamMembers(members) {
    if (!members || members.length === 0) {
      return '<div class="no-data">No team data available</div>';
    }

    return members.map(member => `
      <div class="member-card ${member.status}">
        <div class="member-info">
          <span class="name">${member.name}</span>
          <span class="role">${member.role}</span>
        </div>
        <div class="member-status">
          <span class="status-indicator ${member.status}"></span>
          <span class="status-text">${member.status}</span>
        </div>
        <div class="member-metrics">
          <span class="hours">${member.hours_worked || 0}h</span>
          <span class="conversations">${member.conversations || 0} chats</span>
        </div>
      </div>
    `).join('');
  }

  addDashboardCSS() {
    if (document.getElementById('zero-dashboard-css')) return;

    const style = document.createElement('style');
    style.id = 'zero-dashboard-css';
    style.textContent = `
      .zero-dashboard-widget {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border: 1px solid #444;
        border-radius: 12px;
        padding: 20px;
        margin: 20px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid #444;
      }
      
      .dashboard-header h3 {
        color: #fff;
        margin: 0;
        font-size: 18px;
      }
      
      .last-updated {
        color: #888;
        font-size: 12px;
      }
      
      .team-summary {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .metric {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        min-width: 100px;
      }
      
      .metric .label {
        color: #aaa;
        font-size: 12px;
        margin-bottom: 5px;
      }
      
      .metric .value {
        color: #fff;
        font-size: 24px;
        font-weight: bold;
      }
      
      .team-members h4 {
        color: #fff;
        margin: 0 0 15px 0;
        font-size: 16px;
      }
      
      .members-list {
        display: grid;
        gap: 10px;
      }
      
      .member-card {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        border-left: 4px solid #444;
      }
      
      .member-card.active {
        border-left-color: #10B981;
      }
      
      .member-card.inactive {
        border-left-color: #EF4444;
      }
      
      .member-info {
        display: flex;
        flex-direction: column;
      }
      
      .member-info .name {
        color: #fff;
        font-weight: 500;
      }
      
      .member-info .role {
        color: #aaa;
        font-size: 12px;
      }
      
      .member-status {
        display: flex;
        align-items: center;
        gap: 5px;
      }
      
      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #444;
      }
      
      .status-indicator.active {
        background: #10B981;
      }
      
      .status-indicator.inactive {
        background: #EF4444;
      }
      
      .status-text {
        color: #aaa;
        font-size: 12px;
      }
      
      .member-metrics {
        display: flex;
        gap: 15px;
        color: #aaa;
        font-size: 12px;
      }
      
      .no-data {
        color: #666;
        text-align: center;
        padding: 20px;
        font-style: italic;
      }
    `;
    
    document.head.appendChild(style);
  }

  showErrorMessage() {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'zero-dashboard-error';
    errorDiv.innerHTML = `
      <div style="background: #EF4444; color: white; padding: 15px; border-radius: 8px; margin: 20px;">
        <strong>⚠️ Dashboard Error</strong><br>
        Could not load team data. Backend may be unavailable.
      </div>
    `;
    
    const chatContainer = document.querySelector('.chat-wrapper');
    if (chatContainer) {
      chatContainer.insertBefore(errorDiv, chatContainer.firstChild);
    }
  }

  setupAutoRefresh() {
    // Refresh data every 5 minutes
    this.refreshInterval = setInterval(() => {
      this.loadTeamData();
    }, 5 * 60 * 1000);
  }

  cleanup() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}

// Initialize dashboard service
let zeroDashboard = null;

document.addEventListener('DOMContentLoaded', () => {
  zeroDashboard = new ZeroDashboardService();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (zeroDashboard) {
    zeroDashboard.cleanup();
  }
});

// Export for global access
window.ZeroDashboardService = ZeroDashboardService;
window.zeroDashboard = zeroDashboard;
