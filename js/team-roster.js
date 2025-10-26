/**
 * Team Roster Module - Feature 6
 * Displays Bali Zero team members with department filtering and search
 */

const TeamRoster = (() => {
  // Backend API base URL
  const API_BASE_URL = 'https://ts-backend-production-568d.up.railway.app';
  
  // Department color mapping (from backend)
  const DEPARTMENT_COLORS = {
    management: '#6366f1',
    setup: '#10b981',
    tax: '#f59e0b',
    marketing: '#ef4444',
    reception: '#06b6d4',
    advisory: '#8b5cf6',
    technology: '#ec4899'
  };

  // Department icons (from backend)
  const DEPARTMENT_ICONS = {
    management: '👑',
    setup: '⚡',
    tax: '📊',
    marketing: '🎤',
    reception: '🌸',
    advisory: '🧐',
    technology: '🚀'
  };

  // State
  let allMembers = [];
  let departments = {};
  let stats = {};
  let currentFilter = 'all';
  let searchQuery = '';

  /**
   * Initialize the team roster
   */
  async function init() {
    try {
      console.log('[TeamRoster] Initializing...');
      await loadTeamData();
      renderDepartmentTabs();
      renderStats();
      renderTeamGrid();
      console.log('[TeamRoster] Initialization complete');
    } catch (error) {
      console.error('[TeamRoster] Initialization error:', error);
      showError('Failed to load team data. Please try again later.');
    }
  }

  /**
   * Load team data from backend
   */
  async function loadTeamData() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/bali-zero/team/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.ok) {
        throw new Error(result.error || 'Failed to load team data');
      }

      allMembers = result.data.members || [];
      departments = result.data.departments || {};
      stats = result.data.stats || {};

      console.log('[TeamRoster] Loaded:', {
        members: allMembers.length,
        departments: Object.keys(departments).length,
        stats
      });
    } catch (error) {
      console.error('[TeamRoster] Load error:', error);
      throw error;
    }
  }

  /**
   * Render department filter tabs
   */
  function renderDepartmentTabs() {
    const tabsContainer = document.getElementById('departmentTabs');
    if (!tabsContainer) return;

    const tabs = [];

    // All tab
    tabs.push(`
      <button 
        class="department-tab ${currentFilter === 'all' ? 'active' : ''}" 
        onclick="TeamRoster.filterByDepartment('all')"
        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;"
      >
        🌐 Tutti (${allMembers.length})
      </button>
    `);

    // Department tabs
    Object.entries(departments).forEach(([key, dept]) => {
      const color = DEPARTMENT_COLORS[key] || '#999';
      const icon = DEPARTMENT_ICONS[key] || '📁';
      const count = stats.byDepartment?.[key] || 0;
      const isActive = currentFilter === key;

      tabs.push(`
        <button 
          class="department-tab ${isActive ? 'active' : ''}" 
          onclick="TeamRoster.filterByDepartment('${key}')"
          style="background-color: ${color}; color: white;"
        >
          ${icon} ${dept.name} (${count})
        </button>
      `);
    });

    tabsContainer.innerHTML = tabs.join('');
  }

  /**
   * Render statistics bar
   */
  function renderStats() {
    const statsBar = document.getElementById('statsBar');
    if (!statsBar) return;

    const totalMembers = allMembers.length;
    const totalDepartments = Object.keys(departments).length;
    const languageStats = stats.byLanguage || {};
    const filteredMembers = getFilteredMembers();

    statsBar.innerHTML = `
      <div class="stat-item">
        <div class="stat-value">${filteredMembers.length}</div>
        <div class="stat-label">
          ${currentFilter === 'all' ? 'Membri Totali' : 'Membri Filtrati'}
        </div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${totalDepartments}</div>
        <div class="stat-label">Dipartimenti</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${languageStats.Indonesian || 0}</div>
        <div class="stat-label">🇮🇩 Indonesiani</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${languageStats.Ukrainian || 0}</div>
        <div class="stat-label">🇺🇦 Ucraini</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${languageStats.Italian || 0}</div>
        <div class="stat-label">🇮🇹 Italiani</div>
      </div>
    `;
  }

  /**
   * Get filtered members based on current filters
   */
  function getFilteredMembers() {
    let filtered = allMembers;

    // Department filter
    if (currentFilter !== 'all') {
      filtered = filtered.filter(m => m.department === currentFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(m => {
        return (
          m.name.toLowerCase().includes(query) ||
          m.role.toLowerCase().includes(query) ||
          m.email.toLowerCase().includes(query) ||
          m.department.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }

  /**
   * Render team member grid
   */
  function renderTeamGrid() {
    const gridContainer = document.getElementById('teamGrid');
    if (!gridContainer) return;

    const filtered = getFilteredMembers();

    if (filtered.length === 0) {
      gridContainer.innerHTML = `
        <div class="error">
          😕 Nessun membro trovato con i filtri attuali.
        </div>
      `;
      return;
    }

    const cards = filtered.map(member => createMemberCard(member)).join('');
    gridContainer.innerHTML = cards;
  }

  /**
   * Create a member card HTML
   */
  function createMemberCard(member) {
    const deptColor = DEPARTMENT_COLORS[member.department] || '#999';
    const deptIcon = DEPARTMENT_ICONS[member.department] || '📁';
    const deptName = departments[member.department]?.name || member.department;

    // Language flag
    const languageFlag = member.language === 'Indonesian' ? '🇮🇩' 
                       : member.language === 'Ukrainian' ? '🇺🇦'
                       : member.language === 'Italian' ? '🇮🇹'
                       : '🌐';

    return `
      <div class="member-card" style="border-left-color: ${deptColor};">
        <span class="member-badge">${member.badge}</span>
        <div class="member-name">${member.name}</div>
        <div class="member-role">${member.role}</div>
        
        <div class="member-details">
          <div class="member-detail">
            <span class="member-detail-icon">📧</span>
            <a href="mailto:${member.email}" style="color: #667eea; text-decoration: none;">
              ${member.email}
            </a>
          </div>
          <div class="member-detail">
            <span class="member-detail-icon">${languageFlag}</span>
            ${member.language}
          </div>
          <div class="member-detail">
            <span class="member-detail-icon">🆔</span>
            ID: ${member.id}
          </div>
        </div>

        <span class="department-badge" style="background-color: ${deptColor};">
          ${deptIcon} ${deptName}
        </span>
      </div>
    `;
  }

  /**
   * Filter by department
   */
  function filterByDepartment(department) {
    console.log('[TeamRoster] Filter by department:', department);
    currentFilter = department;
    renderDepartmentTabs();
    renderStats();
    renderTeamGrid();
  }

  /**
   * Search team members
   */
  function search() {
    const input = document.getElementById('searchInput');
    if (!input) return;

    searchQuery = input.value;
    console.log('[TeamRoster] Search:', searchQuery);
    renderStats();
    renderTeamGrid();
  }

  /**
   * Show error message
   */
  function showError(message) {
    const gridContainer = document.getElementById('teamGrid');
    if (gridContainer) {
      gridContainer.innerHTML = `
        <div class="error">
          ❌ ${message}
        </div>
      `;
    }
  }

  // Public API
  return {
    init,
    filterByDepartment,
    search
  };
})();

// Make TeamRoster globally accessible
window.TeamRoster = TeamRoster;
