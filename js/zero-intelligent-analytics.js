/**
 * ZERO Intelligent Analytics Handler
 * Combines visual dashboard + natural language queries
 *
 * Features:
 * - Natural language queries ("chi si è loggato oggi?", "team status", etc.)
 * - Real-time visual dashboard
 * - Multiple ZERO email recognition
 * - Smart response formatting
 */

class ZeroIntelligentAnalytics {
  constructor() {
    this.apiBase = window.ZANTARA_API?.config?.backend_url || 'https://scintillating-kindness-production-47e3.up.railway.app';
    this.isZero = false;
    this.dashboardElement = null;
    this.updateInterval = null;

    this.init();
  }

  async init() {
    this.isZero = this.checkIfZero();

    if (this.isZero) {
      console.log('🎯 [ZeroIntelligent] ZERO access detected - enabling analytics (natural language only)');
      this.setupNaturalLanguageHandler();
      // ❌ DISABLED: Visual dashboard causing duplicate widgets
      // this.setupVisualDashboard();
    } else {
      console.log('[ZeroIntelligent] Not ZERO - analytics disabled');
    }
  }

  checkIfZero() {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Multiple ways to identify ZERO
    const zeroEmails = [
      'zero@balizero.com',
      'antonello@balizero.com',
      'antonello.siano@balizero.com',
      'antonellosiano@gmail.com'
    ];

    return zeroEmails.includes(user.email?.toLowerCase()) ||
           user.role?.toLowerCase().includes('ceo') ||
           user.role?.toLowerCase().includes('owner') ||
           user.name?.toLowerCase().includes('antonello') ||
           user.name?.toLowerCase().includes('zero');
  }

  getCurrentUser() {
    // Try ZantaraStorage first
    if (window.ZantaraStorage && window.ZantaraStorage.isLoggedIn()) {
      return window.ZantaraStorage.getUser();
    }

    // Fallback to localStorage
    try {
      const userStr = localStorage.getItem('zantara-user');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (e) {
      console.error('[ZeroIntelligent] Error parsing user:', e);
    }

    return null;
  }

  // ============================================================================
  // NATURAL LANGUAGE QUERY SYSTEM
  // ============================================================================

  setupNaturalLanguageHandler() {
    console.log('🧠 [ZeroIntelligent] Setting up natural language query handler');

    // Intercept messages before they go to ZANTARA AI
    const originalSendMessage = window.sendMessage;

    if (typeof originalSendMessage === 'function') {
      window.sendMessage = async () => {
        const inputField = document.getElementById('userInput');
        if (!inputField) return;

        const query = inputField.value.trim();

        // Check if this is a ZERO analytics query
        if (this.isZeroAnalyticsQuery(query)) {
          console.log('📊 [ZeroIntelligent] Detected analytics query:', query);

          // Clear input immediately
          inputField.value = '';

          // Add user message to chat
          this.addMessageToChat('user', query);

          // Process query and show response
          const response = await this.handleZeroQuery(query);
          this.addMessageToChat('ai', response);

          return; // Don't send to normal ZANTARA
        }

        // Otherwise, use original sendMessage
        originalSendMessage.call(window);
      };

      console.log('✅ [ZeroIntelligent] Natural language handler installed');
    } else {
      console.warn('[ZeroIntelligent] sendMessage function not found - will retry');
      setTimeout(() => this.setupNaturalLanguageHandler(), 1000);
    }
  }

  isZeroAnalyticsQuery(query) {
    const analyticsKeywords = [
      'chi si è loggato',
      'chi è online',
      'login oggi',
      'team status',
      'collaboratori',
      'ore lavoro',
      'ore oggi',
      'performance',
      'dashboard',
      'report team',
      'analytics',
      'monitoring',
      'sessioni attive',
      'chi sta lavorando',
      'attività team',
      'statistiche',
      'produttività'
    ];

    const queryLower = query.toLowerCase();
    return analyticsKeywords.some(keyword => queryLower.includes(keyword));
  }

  async handleZeroQuery(query) {
    try {
      console.log('📊 [ZeroIntelligent] Processing ZERO query:', query);

      // Show typing indicator
      this.showTypingIndicator();

      // Get real team data from backend
      const teamData = await this.getRealTeamData();

      // Hide typing indicator
      this.hideTypingIndicator();

      if (teamData && teamData.ok) {
        return this.formatTeamResponse(teamData.data, query);
      } else {
        return this.getErrorMessage(teamData?.error || 'Unknown error');
      }
    } catch (error) {
      console.error('❌ [ZeroIntelligent] Query failed:', error);
      this.hideTypingIndicator();
      return this.getErrorMessage(error.message);
    }
  }

  async getRealTeamData() {
    try {
      const response = await fetch(`${this.apiBase}/bali-zero/analytics/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        return await response.json();
      } else {
        const error = await response.text();
        return { ok: false, error: `HTTP ${response.status}: ${error}` };
      }
    } catch (error) {
      console.error('❌ [ZeroIntelligent] Backend request failed:', error);
      return { ok: false, error: error.message };
    }
  }

  formatTeamResponse(data, query) {
    const queryLower = query.toLowerCase();

    if (queryLower.includes('chi si è loggato') ||
        queryLower.includes('login oggi') ||
        queryLower.includes('chi è online') ||
        queryLower.includes('chi sta lavorando')) {
      return this.formatLoginReport(data);
    }
    else if (queryLower.includes('ore lavoro') ||
             queryLower.includes('ore oggi') ||
             queryLower.includes('performance') ||
             queryLower.includes('produttività')) {
      return this.formatPerformanceReport(data);
    }
    else if (queryLower.includes('team status') ||
             queryLower.includes('dashboard') ||
             queryLower.includes('statistiche')) {
      return this.formatTeamStatus(data);
    }
    else {
      return this.formatGeneralReport(data);
    }
  }

  formatLoginReport(data) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
    const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    let response = `📊 **REPORT LOGIN TEAM**\n`;
    response += `📅 ${dateStr} alle ${timeStr}\n\n`;

    const activeSessions = data.active_sessions || 0;
    const totalMembers = data.total_members || 0;

    if (activeSessions > 0) {
      response += `🟢 **ATTUALMENTE ONLINE: ${activeSessions}/${totalMembers}**\n\n`;

      if (data.active_members && data.active_members.length > 0) {
        data.active_members.forEach(member => {
          const duration = this.formatDuration(member.session_duration_minutes);
          response += `• **${member.name}** (${member.department})\n`;
          response += `  └─ Online da ${duration}\n`;
          if (member.conversations_today > 0) {
            response += `  └─ ${member.conversations_today} conversazioni\n`;
          }
        });
      }
    } else {
      response += `🔴 **Nessun collaboratore online al momento**\n\n`;
    }

    response += `\n📈 **STATISTICHE GIORNALIERE:**\n`;
    response += `• Ore totali lavorate: **${(data.total_hours_today || 0).toFixed(1)}h**\n`;
    response += `• Conversazioni totali: **${data.total_conversations_today || 0}**\n`;
    response += `• Membri attivi oggi: **${data.members_worked_today || 0}**\n`;

    return response;
  }

  formatPerformanceReport(data) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });

    let response = `📈 **REPORT PERFORMANCE TEAM**\n`;
    response += `📅 ${dateStr}\n\n`;

    response += `⏰ **ORE LAVORO:**\n`;
    response += `• Totale oggi: **${(data.total_hours_today || 0).toFixed(1)}h**\n`;
    response += `• Media per membro: **${(data.avg_hours_per_member || 0).toFixed(1)}h**\n`;
    response += `• Membri attivi: **${data.members_worked_today || 0}/${data.total_members || 0}**\n\n`;

    response += `💬 **ATTIVITÀ CONVERSAZIONI:**\n`;
    response += `• Conversazioni totali: **${data.total_conversations_today || 0}**\n`;
    response += `• Media per membro: **${(data.avg_conversations_per_member || 0).toFixed(1)}**\n\n`;

    if (data.top_performers && data.top_performers.length > 0) {
      response += `🏆 **TOP PERFORMERS OGGI:**\n`;
      data.top_performers.slice(0, 5).forEach((performer, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  ';
        response += `${medal} **${performer.name}** - ${performer.hours_worked.toFixed(1)}h (${performer.conversations} chat)\n`;
      });
    }

    return response;
  }

  formatTeamStatus(data) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    let response = `🎯 **STATUS TEAM IN TEMPO REALE**\n`;
    response += `🕐 Aggiornato alle ${timeStr}\n\n`;

    response += `📊 **OVERVIEW:**\n`;
    response += `• Membri totali: **${data.total_members || 0}**\n`;
    response += `• Online adesso: **${data.active_sessions || 0}** 🟢\n`;
    response += `• Offline: **${(data.total_members || 0) - (data.active_sessions || 0)}** 🔴\n`;
    response += `• Ore lavorate oggi: **${(data.total_hours_today || 0).toFixed(1)}h**\n\n`;

    if (data.by_department) {
      response += `🏢 **PER DIPARTIMENTO:**\n`;
      Object.entries(data.by_department).forEach(([dept, info]) => {
        const activeCount = info.active_sessions || 0;
        const totalCount = info.total_members || 0;
        const hours = (info.total_hours || 0).toFixed(1);
        response += `• **${dept}**: ${activeCount}/${totalCount} online (${hours}h oggi)\n`;
      });
    }

    return response;
  }

  formatGeneralReport(data) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });

    let response = `📋 **REPORT GENERALE TEAM**\n`;
    response += `📅 ${dateStr}\n\n`;

    response += `👥 **OVERVIEW:**\n`;
    response += `• Membri totali: **${data.total_members || 0}**\n`;
    response += `• Sessioni attive: **${data.active_sessions || 0}**\n`;
    response += `• Ore totali oggi: **${(data.total_hours_today || 0).toFixed(1)}h**\n`;
    response += `• Conversazioni: **${data.total_conversations_today || 0}**\n\n`;

    if (data.active_members && data.active_members.length > 0) {
      response += `👤 **MEMBRI ONLINE ADESSO:**\n`;
      data.active_members.forEach(member => {
        response += `🟢 **${member.name}** (${member.department}) - ${(member.hours_today || 0).toFixed(1)}h\n`;
      });
    } else {
      response += `🔴 Nessun collaboratore online al momento\n`;
    }

    return response;
  }

  getErrorMessage(error) {
    return `❌ **ERRORE SISTEMA TRACKING**\n\nNon riesco a recuperare i dati reali del team.\n\n**Errore**: ${error}\n\n**Possibili cause:**\n• Backend RAG non disponibile\n• Database PostgreSQL non accessibile\n• Sistema di tracking disattivato\n\nContatta il team tecnico per risolvere il problema.`;
  }

  formatDuration(minutes) {
    if (!minutes) return '0m';

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }

  // ============================================================================
  // VISUAL DASHBOARD SYSTEM
  // ============================================================================

  setupVisualDashboard() {
    console.log('📊 [ZeroIntelligent] Setting up visual dashboard');

    document.addEventListener('DOMContentLoaded', () => {
      if (this.isZero) {
        this.fetchAndRenderDashboard();
        this.startAutoUpdate();
      }
    });
  }

  startAutoUpdate() {
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.updateInterval = setInterval(() => this.fetchAndRenderDashboard(), 5 * 60 * 1000); // Every 5 minutes
    console.log('✅ [ZeroIntelligent] Auto-update started (every 5 minutes)');
  }

  async fetchAndRenderDashboard() {
    if (!this.isZero) return;

    try {
      const response = await fetch(`${this.apiBase}/bali-zero/analytics/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.ok && result.data) {
        this.renderDashboard(result.data);
      } else {
        console.error('[ZeroIntelligent] Failed to fetch dashboard:', result.error);
      }
    } catch (error) {
      console.error('[ZeroIntelligent] Error fetching dashboard:', error);
    }
  }

  renderDashboard(data) {
    // Check if dashboard widget already exists
    if (!this.dashboardElement) {
      this.dashboardElement = this.createDashboardWidget(data);
      const chatWrapper = document.querySelector('.chat-wrapper') || document.querySelector('.messages');
      if (chatWrapper && chatWrapper.parentElement) {
        chatWrapper.parentElement.insertBefore(this.dashboardElement, chatWrapper);
      }
    } else {
      this.updateDashboardContent(data);
    }
  }

  createDashboardWidget(data) {
    const widget = document.createElement('div');
    widget.className = 'zero-dashboard-widget';
    widget.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 12px;
      margin: 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;

    widget.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
        <div>
          <h3 style="margin: 0; font-size: 1.2em;">📊 ZERO Dashboard</h3>
          <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 0.9em;">Live Team Analytics</p>
        </div>
        <div style="text-align: right; font-size: 0.85em; opacity: 0.8;">
          <div id="dashboard-last-update">Caricamento...</div>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;" id="dashboard-metrics">
        <!-- Metrics will be inserted here -->
      </div>

      <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.3); font-size: 0.85em; opacity: 0.9;">
        💡 <strong>Tip:</strong> Chiedi "chi si è loggato oggi?" per report dettagliato
      </div>
    `;

    this.updateDashboardContent(data);

    return widget;
  }

  updateDashboardContent(data) {
    const metricsContainer = document.getElementById('dashboard-metrics');
    const lastUpdateEl = document.getElementById('dashboard-last-update');

    if (!metricsContainer || !lastUpdateEl) return;

    const now = new Date();
    lastUpdateEl.textContent = `Aggiornato: ${now.toLocaleTimeString('it-IT')}`;

    metricsContainer.innerHTML = `
      <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
        <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 5px;">Online Adesso</div>
        <div style="font-size: 2em; font-weight: 700;">${data.active_sessions || 0}</div>
      </div>

      <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
        <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 5px;">Ore Oggi</div>
        <div style="font-size: 2em; font-weight: 700;">${(data.total_hours_today || 0).toFixed(1)}h</div>
      </div>

      <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
        <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 5px;">Conversazioni</div>
        <div style="font-size: 2em; font-weight: 700;">${data.total_conversations_today || 0}</div>
      </div>

      <div style="background: rgba(255,255,255,0.15); padding: 15px; border-radius: 8px; backdrop-filter: blur(10px);">
        <div style="font-size: 0.85em; opacity: 0.9; margin-bottom: 5px;">Team Attivi</div>
        <div style="font-size: 2em; font-weight: 700;">${data.members_worked_today || 0}/${data.total_members || 0}</div>
      </div>
    `;
  }

  // ============================================================================
  // CHAT UI HELPERS
  // ============================================================================

  addMessageToChat(type, text) {
    const messagesDiv = document.querySelector('.messages');
    if (!messagesDiv) return;

    // Remove welcome if present
    const welcome = messagesDiv.querySelector('.welcome');
    if (welcome) welcome.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'user' ? 'user-message' : 'ai-message';

    if (type === 'ai') {
      // Format markdown for AI messages
      messageDiv.innerHTML = this.formatMarkdown(text);
    } else {
      messageDiv.textContent = text;
    }

    messagesDiv.appendChild(messageDiv);

    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  showTypingIndicator() {
    const messagesDiv = document.querySelector('.messages');
    if (!messagesDiv) return;

    const indicator = document.createElement('div');
    indicator.className = 'ai-message typing-indicator';
    indicator.id = 'zero-typing-indicator';
    indicator.textContent = '⏳ Analizzando dati team...';
    messagesDiv.appendChild(indicator);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  hideTypingIndicator() {
    const indicator = document.getElementById('zero-typing-indicator');
    if (indicator) indicator.remove();
  }

  formatMarkdown(text) {
    // Simple markdown formatting
    return text
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(/• /g, '&nbsp;&nbsp;• ');
  }
}

// Initialize
let zeroIntelligentAnalytics = null;

// Initialize after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    zeroIntelligentAnalytics = new ZeroIntelligentAnalytics();
  });
} else {
  zeroIntelligentAnalytics = new ZeroIntelligentAnalytics();
}

// Export for global access
window.ZeroIntelligentAnalytics = ZeroIntelligentAnalytics;
window.zeroIntelligentAnalytics = zeroIntelligentAnalytics;
