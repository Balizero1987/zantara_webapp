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
    
    let response = `📊 **REPORT LOGIN TEAM - ${new Date().toLocaleDateString('it-IT')}**\n\n`;
    
    if (activeMembers.length > 0) {
      response += `🟢 **ATTUALMENTE ATTIVI (${activeMembers.length}):**\n`;
      activeMembers.forEach(member => {
        response += `• ${member.name} (${member.role}) - online da ${member.login_time || 'N/A'}\n`;
      });
      response += '\n';
    }
    
    if (inactiveMembers.length > 0) {
      response += `🔴 **DISCONNESSI (${inactiveMembers.length}):**\n`;
      inactiveMembers.forEach(member => {
        response += `• ${member.name} (${member.role}) - ultimo accesso: ${member.last_activity || 'N/A'}\n`;
      });
      response += '\n';
    }
    
    response += `📈 **STATISTICHE GIORNALIERE:**\n`;
    response += `• Ore totali lavorate: ${data.total_hours || 0}h\n`;
    response += `• Conversazioni totali: ${data.total_conversations || 0}\n`;
    response += `• Sessioni attive: ${data.active_sessions || 0}\n`;
    
    return response;
  }

  formatPerformanceReport(data) {
    let response = `📈 **REPORT PERFORMANCE TEAM - ${new Date().toLocaleDateString('it-IT')}**\n\n`;
    
    response += `⏰ **ORE LAVORO:**\n`;
    response += `• Totale ore: ${data.total_hours || 0}h\n`;
    response += `• Media per membro: ${data.average_hours_per_member || 0}h\n`;
    response += `• Ore più produttive: ${data.most_productive_hours || 'N/A'}\n\n`;
    
    response += `💬 **ATTIVITÀ CHAT:**\n`;
    response += `• Conversazioni totali: ${data.total_conversations || 0}\n`;
    response += `• Media per membro: ${data.average_conversations_per_member || 0}\n`;
    response += `• Tempo di risposta medio: ${data.average_response_time || 'N/A'}\n\n`;
    
    if (data.top_performers && data.top_performers.length > 0) {
      response += `🏆 **TOP PERFORMERS:**\n`;
      data.top_performers.forEach((performer, index) => {
        response += `${index + 1}. ${performer.name} - ${performer.hours_worked}h (${performer.conversations} chat)\n`;
      });
    }
    
    return response;
  }

  formatTeamStatus(data) {
    let response = `🎯 **STATUS TEAM IN TEMPO REALE**\n\n`;
    
    response += `📊 **OVERVIEW:**\n`;
    response += `• Membri totali: ${data.total_members || 0}\n`;
    response += `• Attualmente online: ${data.active_members || 0}\n`;
    response += `• Offline: ${data.inactive_members || 0}\n`;
    response += `• Ore lavorate oggi: ${data.total_hours || 0}h\n\n`;
    
    if (data.departments) {
      response += `🏢 **PER DIPARTIMENTO:**\n`;
      Object.entries(data.departments).forEach(([dept, info]) => {
        response += `• ${dept}: ${info.active}/${info.total} attivi (${info.hours}h)\n`;
      });
    }
    
    return response;
  }

  formatGeneralReport(data) {
    let response = `📋 **REPORT GENERALE TEAM - ${new Date().toLocaleDateString('it-IT')}**\n\n`;
    
    response += `👥 **TEAM OVERVIEW:**\n`;
    response += `• Membri totali: ${data.total_members || 0}\n`;
    response += `• Sessioni attive: ${data.active_sessions || 0}\n`;
    response += `• Ore totali: ${data.total_hours || 0}h\n`;
    response += `• Conversazioni: ${data.total_conversations || 0}\n\n`;
    
    if (data.team_members && data.team_members.length > 0) {
      response += `👤 **DETTAGLIO MEMBRI:**\n`;
      data.team_members.forEach(member => {
        const status = member.status === 'active' ? '🟢' : '🔴';
        response += `${status} ${member.name} (${member.role}) - ${member.hours_worked || 0}h\n`;
      });
    }
    
    return response;
  }

  getErrorMessage() {
    return `❌ **ERRORE SISTEMA TRACKING**\n\nNon riesco a recuperare i dati reali del team. Possibili cause:\n• Backend non disponibile\n• Database non accessibile\n• Sistema di tracking disattivato\n\nContatta il team tecnico per risolvere il problema.`;
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
