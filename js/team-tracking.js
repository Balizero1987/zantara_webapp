/**
 * ZANTARA Team Tracking Service
 * Real-time team monitoring and analytics for ZERO
 * Connects to RAG backend tracking system
 */

class TeamTrackingService {
  constructor() {
    this.apiBase = 'https://scintillating-kindness-production-47e3.up.railway.app';
    this.isTracking = false;
    this.currentUser = null;
    this.sessionId = null;
    this.heartbeatInterval = null;
    this.lastActivity = Date.now();
    
    // Initialize tracking
    this.init();
  }

  async init() {
    try {
      // Get current user from storage
      this.currentUser = this.getCurrentUser();
      
      if (this.currentUser && this.currentUser.email) {
        console.log('🎯 [TeamTracking] Initializing for:', this.currentUser.email);
        await this.startSession();
        this.setupHeartbeat();
        this.setupActivityTracking();
      } else {
        console.log('👤 [TeamTracking] Anonymous user - no tracking');
      }
    } catch (error) {
      console.error('❌ [TeamTracking] Init failed:', error);
    }
  }

  getCurrentUser() {
    // Try unified storage first
    if (window.ZantaraStorage && window.ZantaraStorage.isLoggedIn()) {
      return window.ZantaraStorage.getUser();
    }
    
    // Fallback to manual storage
    try {
      const userStr = localStorage.getItem('zantara-user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.warn('⚠️ [TeamTracking] Could not parse user data');
    }
    
    return null;
  }

  async startSession() {
    if (!this.currentUser) return;

    try {
      const response = await fetch(`${this.apiBase}/bali-zero/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'start_session',
          user_email: this.currentUser.email,
          user_name: this.currentUser.name,
          user_role: this.currentUser.role,
          department: this.currentUser.department
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ [TeamTracking] Session started:', data);
        this.sessionId = data.session_id || Date.now().toString();
      }
    } catch (error) {
      console.error('❌ [TeamTracking] Session start failed:', error);
    }
  }

  setupHeartbeat() {
    // Send heartbeat every 5 minutes to keep session alive
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, 5 * 60 * 1000);
  }

  async sendHeartbeat() {
    if (!this.currentUser || !this.sessionId) return;

    try {
      await fetch(`${this.apiBase}/bali-zero/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'heartbeat',
          user_email: this.currentUser.email,
          session_id: this.sessionId,
          activity: 'active'
        })
      });
    } catch (error) {
      console.warn('⚠️ [TeamTracking] Heartbeat failed:', error);
    }
  }

  setupActivityTracking() {
    // Track user activity
    const events = ['click', 'keypress', 'scroll', 'mousemove'];
    
    events.forEach(event => {
      document.addEventListener(event, () => {
        this.lastActivity = Date.now();
      }, { passive: true });
    });

    // Check for inactivity every minute
    setInterval(() => {
      const inactiveTime = Date.now() - this.lastActivity;
      if (inactiveTime > 10 * 60 * 1000) { // 10 minutes inactive
        this.markInactive();
      }
    }, 60 * 1000);
  }

  async markInactive() {
    if (!this.currentUser || !this.sessionId) return;

    try {
      await fetch(`${this.apiBase}/bali-zero/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'inactive',
          user_email: this.currentUser.email,
          session_id: this.sessionId
        })
      });
    } catch (error) {
      console.warn('⚠️ [TeamTracking] Inactive mark failed:', error);
    }
  }

  async endSession() {
    if (!this.currentUser || !this.sessionId) return;

    try {
      await fetch(`${this.apiBase}/bali-zero/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'logout today',
          user_email: this.currentUser.email,
          session_id: this.sessionId
        })
      });

      console.log('✅ [TeamTracking] Session ended');
    } catch (error) {
      console.error('❌ [TeamTracking] Session end failed:', error);
    }
  }

  // Get real team data for ZERO
  async getTeamStatus() {
    try {
      const response = await fetch(`${this.apiBase}/bali-zero/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'team_status_report',
          user_email: 'zero@balizero.com', // ZERO's special access
          report_type: 'real_time'
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('❌ [TeamTracking] Team status failed:', error);
      return null;
    }
  }

  // Get daily analytics for ZERO
  async getDailyAnalytics() {
    try {
      const response = await fetch(`${this.apiBase}/bali-zero/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'daily_analytics_report',
          user_email: 'zero@balizero.com',
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('❌ [TeamTracking] Daily analytics failed:', error);
      return null;
    }
  }

  // Cleanup on page unload
  cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.endSession();
  }
}

// Initialize tracking service
let teamTracking = null;

document.addEventListener('DOMContentLoaded', () => {
  teamTracking = new TeamTrackingService();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (teamTracking) {
    teamTracking.cleanup();
  }
});

// Export for global access
window.TeamTrackingService = TeamTrackingService;
window.teamTracking = teamTracking;
