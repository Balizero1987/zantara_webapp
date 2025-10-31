/**
 * ZANTARA Real Team Tracking Service
 * Connects to PostgreSQL database for authentic team monitoring
 */

class RealTeamTrackingService {
  constructor() {
    this.apiBase = window.ZANTARA_API?.config?.backend_url || 'https://nuzantara-rag.fly.dev';
    this.userId = null;
    this.userName = null;
    this.userEmail = null;
    this.sessionId = null;
    this.heartbeatInterval = null;
    this.lastActivity = Date.now();

    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.loadUserInfo();
      if (this.userEmail) {
        this.startRealSession();
        this.startHeartbeat();
        this.setupActivityListeners();
      }
    });
  }

  loadUserInfo() {
    const user = window.ZantaraStorage?.getUser();
    if (user) {
      this.userId = user.id || user.email;
      this.userName = user.name;
      this.userEmail = user.email;
      console.log(`[RealTeamTracking] User loaded: ${this.userName} (${this.userEmail})`);
    } else {
      console.warn('[RealTeamTracking] No user info found in ZantaraStorage.');
    }
  }

  async startRealSession() {
    if (!this.userId || !this.userEmail) {
      console.warn('[RealTeamTracking] Cannot start session: user info missing.');
      return;
    }

    try {
      const response = await fetch(`${this.apiBase}/bali-zero/work-session/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: this.userId,
          user_name: this.userName,
          user_email: this.userEmail,
          session_type: 'webapp',
          device_info: navigator.userAgent,
          ip_address: 'unknown' // Will be filled by backend
        }),
      });

      const data = await response.json();
      if (data.ok && data.session_id) {
        this.sessionId = data.session_id;
        console.log(`[RealTeamTracking] Real session started: ${this.sessionId}`);
      } else {
        console.error('[RealTeamTracking] Failed to start real session:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('[RealTeamTracking] Error starting real session:', error);
    }
  }

  startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = setInterval(() => this.sendRealHeartbeat(), 60 * 1000); // Every 1 minute
    console.log('[RealTeamTracking] Real heartbeat started.');
  }

  async sendRealHeartbeat() {
    if (!this.sessionId) return;

    try {
      const response = await fetch(`${this.apiBase}/bali-zero/work-session/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          last_activity: new Date(this.lastActivity).toISOString(),
          activity_type: 'webapp_interaction'
        }),
      });

      const data = await response.json();
      if (data.ok) {
        // console.log(`[RealTeamTracking] Real heartbeat sent for session ${this.sessionId}`);
      } else {
        console.warn('[RealTeamTracking] Real heartbeat failed:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('[RealTeamTracking] Error sending real heartbeat:', error);
    }
  }

  setupActivityListeners() {
    document.addEventListener('mousemove', () => this.recordActivity());
    document.addEventListener('keypress', () => this.recordActivity());
    document.addEventListener('click', () => this.recordActivity());
    document.addEventListener('scroll', () => this.recordActivity());
  }

  recordActivity() {
    this.lastActivity = Date.now();
  }

  async endRealSession() {
    if (!this.sessionId) return;

    try {
      const response = await fetch(`${this.apiBase}/bali-zero/work-session/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: this.sessionId,
          end_reason: 'user_logout'
        }),
      });

      const data = await response.json();
      if (data.ok) {
        console.log(`[RealTeamTracking] Real session ended: ${this.sessionId}`);
        clearInterval(this.heartbeatInterval);
        this.sessionId = null;
      } else {
        console.error('[RealTeamTracking] Failed to end real session:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('[RealTeamTracking] Error ending real session:', error);
    }
  }

  // Expose for global access
  static getInstance() {
    if (!window._realTeamTrackingService) {
      window._realTeamTrackingService = new RealTeamTrackingService();
    }
    return window._realTeamTrackingService;
  }
}

// Initialize globally
window.RealTeamTrackingService = RealTeamTrackingService.getInstance();

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (window._realTeamTrackingService) {
    window._realTeamTrackingService.endRealSession();
  }
});