// Team synchronization with ZANTARA backend

async function syncTeamFromBackend() {
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.log('Sync skipped: offline');
      return null;
    }
    // Use centralized API helper (handles GitHub Pages CORS via proxy)
    if (!window.ZANTARA_API || typeof window.ZANTARA_API.call !== 'function') {
      throw new Error('API helper not available');
    }

    const result = await window.ZANTARA_API.call('/call', {
      key: 'team.list',
      params: {}
    }, true);

    if (result.ok && result.data && result.data.members) {
      // Transform backend data to match frontend format
      const transformedMembers = {};

      result.data.members.forEach(member => {
        transformedMembers[member.email] = {
          id: member.id,
          name: member.name.toUpperCase(),
          role: member.role,
          department: member.department,
          badge: member.badge || '👤',
          permissions: getPermissionsForRole(member.role),
          welcomeMessage: generateWelcomeMessage(member),
          dashboardWidgets: getDashboardWidgets(member.department)
        };
      });

      // Update global TEAM_MEMBERS
      window.TEAM_MEMBERS = transformedMembers;
      window.DEPARTMENTS = result.data.departments;

      console.log('✅ Team synced:', Object.keys(transformedMembers).length, 'members');
      return transformedMembers;
    } else {
      console.warn('⚠️ No team data in response, using local fallback');
      return null;
    }
  } catch (error) {
    console.error('❌ Team sync failed:', error);
    console.log('Using local team data as fallback');
    return null;
  }
}

function getPermissionsForRole(role) {
  const roleLower = role.toLowerCase();

  if (roleLower.includes('ceo') || roleLower.includes('board')) {
    return ['admin', 'all_dashboards', 'financial_data', 'team_management'];
  } else if (roleLower.includes('lead') || roleLower.includes('supervisor')) {
    return ['supervisor', 'team_oversight', 'performance_metrics', 'resource_allocation'];
  } else if (roleLower.includes('manager')) {
    return ['management', 'department_oversight', 'reporting'];
  } else if (roleLower.includes('junior')) {
    return ['task_execution', 'learning_access', 'collaboration_tools'];
  } else {
    return ['standard_access', 'collaboration_tools'];
  }
}

function generateWelcomeMessage(member) {
  const messages = {
    'zainal': 'Welcome CEO! Ready to lead Bali Zero to new heights? 🚀',
    'zero': 'Welcome back Zero! Ready to scale Bali Zero to infinity? ∞',
    'adit': 'Halo Adit! Ada aplikasi visa atau company yang perlu di-handle hari ini?',
    'angel': 'Hello Angel! Ready untuk handle urusan pajak dan NPWP hari ini?',
    'amanda': 'Hi Amanda! Siap organize dan dokumentasi semua dengan detail? 📝',
    'nina': 'Hello Nina! Ready to create inspiring content yang motivasi team dan client?'
  };

  return messages[member.id] || `Welcome ${member.name}! Ready to make today productive?`;
}

function getDashboardWidgets(department) {
  const widgets = {
    'management': ['revenue_overview', 'team_performance', 'client_pipeline', 'ai_insights'],
    'setup': ['active_applications', 'team_workload', 'priority_cases', 'completion_rates'],
    'tax': ['tax_applications', 'compliance_status', 'npwp_tracker', 'deadline_alerts'],
    'marketing': ['campaign_performance', 'content_calendar', 'brand_metrics', 'engagement_stats'],
    'technology': ['system_health', 'api_metrics', 'deployment_status', 'error_logs'],
    'advisory': ['client_advisory', 'market_analysis', 'strategic_insights'],
    'reception': ['appointment_calendar', 'client_inquiries', 'satisfaction_scores']
  };

  return widgets[department] || ['general_dashboard'];
}

// Auto-sync on load with visibility-aware scheduling
if (typeof window !== 'undefined') {
  window.syncTeamFromBackend = syncTeamFromBackend;

  // Sync team data when DOM is ready
  const start = () => {
    try { syncTeamFromBackend(); } catch (_) {}
    scheduleNextSync();
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  let syncTimer = null;
  let backoff = 1; // exponential backoff factor
  const VISIBLE_MS = 5 * 60 * 1000;   // 5 minutes when tab visible
  const HIDDEN_MS  = 30 * 60 * 1000;  // 30 minutes when tab hidden

  function scheduleNextSync() {
    if (syncTimer) clearTimeout(syncTimer);
    const base = document.hidden ? HIDDEN_MS : VISIBLE_MS;
    const delay = base * backoff;
    syncTimer = setTimeout(async () => {
      try {
        const res = await syncTeamFromBackend();
        // If we got data, reset backoff; otherwise increase up to x8
        if (res) backoff = 1; else backoff = Math.min(backoff * 2, 8);
      } catch (_) {
        backoff = Math.min(backoff * 2, 8);
      }
      scheduleNextSync();
    }, delay);
  }

  document.addEventListener('visibilitychange', () => {
    scheduleNextSync();
  });

  window.addEventListener('online', scheduleNextSync);
  window.addEventListener('offline', scheduleNextSync);
}
