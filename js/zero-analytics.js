/**
 * ZERO Analytics Handler
 * Handles special queries from ZERO to get real team data
 * Replaces fake data with real backend analytics
 */

class ZeroAnalyticsHandler {
  constructor() {
    this.apiBase = 'https://scintillating-kindness-production-47e3.up.railway.app';
    this.isZero = false;
    
    this.init();
  }

  async init() {
    this.isZero = this.checkIfZero();
    
    if (this.isZero) {
      console.log('🎯 [ZeroAnalytics] ZERO access detected - enabling real analytics');
      this.setupQueryHandlers();
    }
  }

  checkIfZero() {
    const user = this.getCurrentUser();
    if (!user) return false;
    
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
      return null;
    }
    
    return null;
  }

  setupQueryHandlers() {
    // Override the chat processing to handle ZERO queries
    const originalProcessWithZantara = window.zantaraApp?.processWithZantara;
    
    if (window.zantaraApp) {
      window.zantaraApp.processWithZantara = async (query) => {
        // Check if this is a ZERO analytics query
        if (this.isZeroAnalyticsQuery(query)) {
          return await this.handleZeroQuery(query);
        }
        
        // Otherwise, use original processing
        if (originalProcessWithZantara) {
          return originalProcessWithZantara.call(window.zantaraApp, query);
        }
      };
    }
  }

  isZeroAnalyticsQuery(query) {
    const analyticsKeywords = [
      'chi si è loggato',
      'login oggi',
      'team status',
      'collaboratori',
      'ore lavoro',
      'performance',
      'dashboard',
      'report team',
      'analytics',
      'monitoring'
    ];
    
    const queryLower = query.toLowerCase();
    return analyticsKeywords.some(keyword => queryLower.includes(keyword));
  }

  async handleZeroQuery(query) {
    try {
      console.log('📊 [ZeroAnalytics] Processing ZERO query:', query);
      
      // Get real team data from backend
      const teamData = await this.getRealTeamData();
      
      if (teamData) {
        return this.formatTeamResponse(teamData, query);
      } else {
        return this.getErrorMessage();
      }
    } catch (error) {
      console.error('❌ [ZeroAnalytics] Query failed:', error);
      return this.getErrorMessage();
    }
  }

  async getRealTeamData() {
    try {
      const response = await fetch(`${this.apiBase}/bali-zero/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: 'get_real_team_analytics',
          user_email: 'zero@balizero.com',
          report_type: 'comprehensive',
          include_sessions: true,
          include_performance: true,
          date: new Date().toISOString().split('T')[0]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (error) {
      console.error('❌ [ZeroAnalytics] Backend request failed:', error);
    }
    
    return null;
  }

  formatTeamResponse(data, query) {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('chi si è loggato') || queryLower.includes('login oggi')) {
      return this.formatLoginReport(data);
    } else if (queryLower.includes('ore lavoro') || queryLower.includes('performance')) {
      return this.formatPerformanceReport(data);
    } else if (queryLower.includes('team status') || queryLower.includes('dashboard')) {
      return this.formatTeamStatus(data);
    } else {
      return this.formatGeneralReport(data);
    }
  }

  formatLoginReport(data) {
    const activeMembers = data.team_members?.filter(m => m.status === 'active') || [];
    const inactiveMembers = data.team_members?.filter(m => m.status === 'inactive') || [];
    
    let response = `╔══════════════════════════════════════════════════════════════╗\n`;
    response += `║                    ZERO DASHBOARD - TEAM STATUS                ║\n`;
    response += `║                        ${new Date().toLocaleDateString('it-IT')}                        ║\n`;
    response += `╚══════════════════════════════════════════════════════════════╝\n\n`;
    
    if (activeMembers.length > 0) {
      response += `🟢 ATTUALMENTE ATTIVI (${activeMembers.length})\n`;
      response += `┌─────────────────────────────────────────────────────────────┐\n`;
      activeMembers.forEach(member => {
        const time = member.login_time || 'N/A';
        const role = member.role || 'N/A';
        response += `│ ${member.name.padEnd(20)} │ ${role.padEnd(15)} │ ${time.padEnd(12)} │\n`;
      });
      response += `└─────────────────────────────────────────────────────────────┘\n\n`;
    }
    
    if (inactiveMembers.length > 0) {
      response += `🔴 DISCONNESSI (${inactiveMembers.length})\n`;
      response += `┌─────────────────────────────────────────────────────────────┐\n`;
      inactiveMembers.forEach(member => {
        const lastActivity = member.last_activity || 'N/A';
        const role = member.role || 'N/A';
        response += `│ ${member.name.padEnd(20)} │ ${role.padEnd(15)} │ ${lastActivity.padEnd(12)} │\n`;
      });
      response += `└─────────────────────────────────────────────────────────────┘\n\n`;
    }
    
    response += `📈 STATISTICHE GIORNALIERE\n`;
    response += `┌─────────────────────────────────────────────────────────────┐\n`;
    response += `│ Ore totali lavorate    │ ${String(data.total_hours || 0).padEnd(25)} │\n`;
    response += `│ Conversazioni totali   │ ${String(data.total_conversations || 0).padEnd(25)} │\n`;
    response += `│ Sessioni attive        │ ${String(data.active_sessions || 0).padEnd(25)} │\n`;
    response += `└─────────────────────────────────────────────────────────────┘\n`;
    
    return response;
  }

  formatPerformanceReport(data) {
    let response = `╔══════════════════════════════════════════════════════════════╗\n`;
    response += `║                  ZERO DASHBOARD - PERFORMANCE                 ║\n`;
    response += `║                        ${new Date().toLocaleDateString('it-IT')}                        ║\n`;
    response += `╚══════════════════════════════════════════════════════════════╝\n\n`;
    
    response += `⏰ ORE LAVORO\n`;
    response += `┌─────────────────────────────────────────────────────────────┐\n`;
    response += `│ Totale ore              │ ${String(data.total_hours || 0).padEnd(25)} │\n`;
    response += `│ Media per membro         │ ${String(data.average_hours_per_member || 0).padEnd(25)} │\n`;
    response += `│ Ore più produttive       │ ${String(data.most_productive_hours || 'N/A').padEnd(25)} │\n`;
    response += `└─────────────────────────────────────────────────────────────┘\n\n`;
    
    response += `💬 ATTIVITÀ CHAT\n`;
    response += `┌─────────────────────────────────────────────────────────────┐\n`;
    response += `│ Conversazioni totali     │ ${String(data.total_conversations || 0).padEnd(25)} │\n`;
    response += `│ Media per membro         │ ${String(data.average_conversations_per_member || 0).padEnd(25)} │\n`;
    response += `│ Tempo risposta medio     │ ${String(data.average_response_time || 'N/A').padEnd(25)} │\n`;
    response += `└─────────────────────────────────────────────────────────────┘\n\n`;
    
    if (data.top_performers && data.top_performers.length > 0) {
      response += `🏆 TOP PERFORMERS\n`;
      response += `┌─────────────────────────────────────────────────────────────┐\n`;
      data.top_performers.forEach((performer, index) => {
        const rank = `${index + 1}.`.padEnd(3);
        const name = performer.name.padEnd(15);
        const hours = `${performer.hours_worked}h`.padEnd(8);
        const chats = `${performer.conversations} chat`;
        response += `│ ${rank} ${name} │ ${hours} │ ${chats.padEnd(15)} │\n`;
      });
      response += `└─────────────────────────────────────────────────────────────┘\n`;
    }
    
    return response;
  }

  formatTeamStatus(data) {
    let response = `╔══════════════════════════════════════════════════════════════╗\n`;
    response += `║                ZERO DASHBOARD - TEAM STATUS                   ║\n`;
    response += `║                        ${new Date().toLocaleDateString('it-IT')}                        ║\n`;
    response += `╚══════════════════════════════════════════════════════════════╝\n\n`;
    
    response += `📊 OVERVIEW\n`;
    response += `┌─────────────────────────────────────────────────────────────┐\n`;
    response += `│ Membri totali           │ ${String(data.total_members || 0).padEnd(25)} │\n`;
    response += `│ Attualmente online       │ ${String(data.active_members || 0).padEnd(25)} │\n`;
    response += `│ Offline                 │ ${String(data.inactive_members || 0).padEnd(25)} │\n`;
    response += `│ Ore lavorate oggi       │ ${String(data.total_hours || 0).padEnd(25)} │\n`;
    response += `└─────────────────────────────────────────────────────────────┘\n\n`;
    
    if (data.departments) {
      response += `🏢 PER DIPARTIMENTO\n`;
      response += `┌─────────────────────────────────────────────────────────────┐\n`;
      Object.entries(data.departments).forEach(([dept, info]) => {
        const deptName = dept.padEnd(20);
        const active = `${info.active}/${info.total}`.padEnd(8);
        const hours = `${info.hours}h`.padEnd(8);
        response += `│ ${deptName} │ ${active} │ ${hours} │\n`;
      });
      response += `└─────────────────────────────────────────────────────────────┘\n`;
    }
    
    return response;
  }

  formatGeneralReport(data) {
    let response = `╔══════════════════════════════════════════════════════════════╗\n`;
    response += `║                ZERO DASHBOARD - REPORT GENERALE               ║\n`;
    response += `║                        ${new Date().toLocaleDateString('it-IT')}                        ║\n`;
    response += `╚══════════════════════════════════════════════════════════════╝\n\n`;
    
    response += `👥 TEAM OVERVIEW\n`;
    response += `┌─────────────────────────────────────────────────────────────┐\n`;
    response += `│ Membri totali           │ ${String(data.total_members || 0).padEnd(25)} │\n`;
    response += `│ Sessioni attive         │ ${String(data.active_sessions || 0).padEnd(25)} │\n`;
    response += `│ Ore totali              │ ${String(data.total_hours || 0).padEnd(25)} │\n`;
    response += `│ Conversazioni           │ ${String(data.total_conversations || 0).padEnd(25)} │\n`;
    response += `└─────────────────────────────────────────────────────────────┘\n\n`;
    
    if (data.team_members && data.team_members.length > 0) {
      response += `👤 DETTAGLIO MEMBRI\n`;
      response += `┌─────────────────────────────────────────────────────────────┐\n`;
      data.team_members.forEach(member => {
        const status = member.status === 'active' ? '🟢' : '🔴';
        const name = member.name.padEnd(20);
        const role = member.role.padEnd(15);
        const hours = `${member.hours_worked || 0}h`.padEnd(8);
        response += `│ ${status} ${name} │ ${role} │ ${hours} │\n`;
      });
      response += `└─────────────────────────────────────────────────────────────┘\n`;
    }
    
    return response;
  }

  getErrorMessage() {
    return `╔══════════════════════════════════════════════════════════════╗\n║                    ERRORE SISTEMA TRACKING                    ║\n╚══════════════════════════════════════════════════════════════╝\n\n❌ Non riesco a recuperare i dati reali del team.\n\n┌─────────────────────────────────────────────────────────────┐\n│ Possibili cause:                                           │\n│ • Backend non disponibile                                  │\n│ • Database non accessibile                                 │\n│ • Sistema di tracking disattivato                          │\n└─────────────────────────────────────────────────────────────┘\n\nContatta il team tecnico per risolvere il problema.`;
  }
}

// Initialize analytics handler
let zeroAnalytics = null;

document.addEventListener('DOMContentLoaded', () => {
  zeroAnalytics = new ZeroAnalyticsHandler();
});

// Export for global access
window.ZeroAnalyticsHandler = ZeroAnalyticsHandler;
window.zeroAnalytics = zeroAnalytics;
