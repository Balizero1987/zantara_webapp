// Team synchronization with ZANTARA backend

async function syncTeamFromBackend() {
  try {
    // Determine API endpoint based on environment
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const isNetlify = window.location.hostname.includes('netlify');

    let apiUrl;
    if (isLocalhost) {
      apiUrl = 'http://localhost:3003/call'; // Local proxy
    } else if (isNetlify) {
      apiUrl = '/.netlify/functions/zantara-proxy'; // Netlify function
    } else {
      apiUrl = 'https://zantara-v520-chatgpt-patch-1064094238013.europe-west1.run.app/call';
    }

    console.log('Syncing team from:', apiUrl);

    // Fetch team data from ZANTARA
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'deabf88e8aefda722fbdb8e899d1e1717c8faf66bf56fb82be495c2f3458d30c'
      },
      body: JSON.stringify({
        key: 'team.list',
        params: {}
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();

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

// Auto-sync on load
if (typeof window !== 'undefined') {
  window.syncTeamFromBackend = syncTeamFromBackend;

  // Sync team data when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncTeamFromBackend);
  } else {
    syncTeamFromBackend();
  }

  // Sync every 5 minutes
  setInterval(syncTeamFromBackend, 5 * 60 * 1000);
}