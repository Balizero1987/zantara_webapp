/**
 * Memory/History Panel Module - Feature 8
 * Displays user conversation history and profile statistics
 */

const MemoryPanel = (() => {
  // Backend API base URLs
  const RAG_BACKEND_URL = 'https://scintillating-kindness-production-47e3.up.railway.app';
  
  // State
  let isOpen = false;
  let currentUserEmail = null;
  let conversationHistory = [];
  let stats = null;

  /**
   * Initialize the memory panel
   */
  function init() {
    console.log('[MemoryPanel] Initializing...');
    
    // Get current user email from ZANTARA_API
    if (window.ZANTARA_API && window.ZANTARA_API.isLoggedIn()) {
      const userInfo = window.ZANTARA_API.getUserInfo();
      currentUserEmail = userInfo?.email || null;
      console.log('[MemoryPanel] User email:', currentUserEmail);
    }

    // Create panel UI
    createPanelUI();
    
    // Add keyboard shortcut (Ctrl/Cmd + H)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        toggle();
      }
    });

    console.log('[MemoryPanel] Initialized');
  }

  /**
   * Create the memory panel UI
   */
  function createPanelUI() {
    // Check if panel already exists
    if (document.getElementById('memoryPanel')) {
      return;
    }

    const panelHTML = `
      <div id="memoryPanel" class="memory-panel">
        <div class="memory-panel-overlay" onclick="MemoryPanel.close()"></div>
        <div class="memory-panel-container">
          <!-- Header -->
          <div class="memory-panel-header">
            <h2>📚 Storia & Profilo</h2>
            <button class="memory-panel-close" onclick="MemoryPanel.close()">✕</button>
          </div>

          <!-- Stats Section -->
          <div class="memory-stats-section" id="memoryStatsSection">
            <div class="memory-stats-loading">
              ⏳ Caricamento statistiche...
            </div>
          </div>

          <!-- Tabs -->
          <div class="memory-tabs">
            <button class="memory-tab active" data-tab="history" onclick="MemoryPanel.switchTab('history')">
              💬 Conversazioni
            </button>
            <button class="memory-tab" data-tab="profile" onclick="MemoryPanel.switchTab('profile')">
              👤 Profilo
            </button>
          </div>

          <!-- Content -->
          <div class="memory-content">
            <!-- History Tab -->
            <div id="memoryHistoryTab" class="memory-tab-content active">
              <div class="memory-history-list" id="memoryHistoryList">
                <div class="memory-loading">⏳ Caricamento cronologia...</div>
              </div>
            </div>

            <!-- Profile Tab -->
            <div id="memoryProfileTab" class="memory-tab-content">
              <div class="memory-profile-info" id="memoryProfileInfo">
                <div class="memory-loading">⏳ Caricamento profilo...</div>
              </div>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="memory-panel-footer">
            <button class="memory-action-btn" onclick="MemoryPanel.refresh()">
              🔄 Aggiorna
            </button>
            <button class="memory-action-btn danger" onclick="MemoryPanel.clearHistory()">
              🗑️ Cancella Cronologia
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', panelHTML);
  }

  /**
   * Open the memory panel
   */
  async function open() {
    if (!currentUserEmail) {
      alert('Devi essere loggato per vedere la cronologia');
      return;
    }

    isOpen = true;
    const panel = document.getElementById('memoryPanel');
    if (panel) {
      panel.classList.add('active');
      await loadData();
    }
  }

  /**
   * Close the memory panel
   */
  function close() {
    isOpen = false;
    const panel = document.getElementById('memoryPanel');
    if (panel) {
      panel.classList.remove('active');
    }
  }

  /**
   * Toggle panel open/close
   */
  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  /**
   * Switch between tabs
   */
  function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.memory-tab').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    // Update tab content
    document.querySelectorAll('.memory-tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `memory${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tab`);
    });
  }

  /**
   * Load all data (stats + history)
   */
  async function loadData() {
    await Promise.all([
      loadStats(),
      loadHistory()
    ]);
  }

  /**
   * Load conversation statistics
   */
  async function loadStats() {
    try {
      const response = await fetch(
        `${RAG_BACKEND_URL}/bali-zero/conversations/stats?user_email=${encodeURIComponent(currentUserEmail)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      stats = await response.json();
      renderStats();
      
      console.log('[MemoryPanel] Stats loaded:', stats);
    } catch (error) {
      console.error('[MemoryPanel] Failed to load stats:', error);
      showStatsError();
    }
  }

  /**
   * Render statistics
   */
  function renderStats() {
    const statsSection = document.getElementById('memoryStatsSection');
    if (!statsSection || !stats) return;

    const lastConversation = stats.last_conversation 
      ? new Date(stats.last_conversation).toLocaleDateString('it-IT', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Mai';

    statsSection.innerHTML = `
      <div class="memory-stat-card">
        <div class="memory-stat-value">${stats.total_conversations || 0}</div>
        <div class="memory-stat-label">Conversazioni</div>
      </div>
      <div class="memory-stat-card">
        <div class="memory-stat-value">${stats.total_messages || 0}</div>
        <div class="memory-stat-label">Messaggi</div>
      </div>
      <div class="memory-stat-card">
        <div class="memory-stat-value">${lastConversation}</div>
        <div class="memory-stat-label">Ultima Chat</div>
      </div>
    `;
  }

  /**
   * Show stats error
   */
  function showStatsError() {
    const statsSection = document.getElementById('memoryStatsSection');
    if (statsSection) {
      statsSection.innerHTML = `
        <div class="memory-error">
          ❌ Impossibile caricare le statistiche
        </div>
      `;
    }
  }

  /**
   * Load conversation history
   */
  async function loadHistory() {
    try {
      const response = await fetch(
        `${RAG_BACKEND_URL}/bali-zero/conversations/history?user_email=${encodeURIComponent(currentUserEmail)}&limit=50`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      conversationHistory = data.messages || [];
      renderHistory();
      
      console.log('[MemoryPanel] History loaded:', conversationHistory.length, 'messages');
    } catch (error) {
      console.error('[MemoryPanel] Failed to load history:', error);
      showHistoryError();
    }
  }

  /**
   * Render conversation history
   */
  function renderHistory() {
    const historyList = document.getElementById('memoryHistoryList');
    if (!historyList) return;

    if (conversationHistory.length === 0) {
      historyList.innerHTML = `
        <div class="memory-empty">
          😕 Nessuna conversazione trovata
        </div>
      `;
      return;
    }

    const messagesHTML = conversationHistory.map((msg, idx) => {
      const isUser = msg.role === 'user';
      const icon = isUser ? '👤' : '🤖';
      const roleClass = isUser ? 'user' : 'assistant';
      
      // Truncate long messages
      let content = msg.content || '';
      if (content.length > 150) {
        content = content.substring(0, 150) + '...';
      }

      return `
        <div class="memory-message ${roleClass}">
          <div class="memory-message-header">
            <span class="memory-message-icon">${icon}</span>
            <span class="memory-message-role">${isUser ? 'Tu' : 'ZANTARA'}</span>
          </div>
          <div class="memory-message-content">${escapeHtml(content)}</div>
        </div>
      `;
    }).join('');

    historyList.innerHTML = messagesHTML;
  }

  /**
   * Show history error
   */
  function showHistoryError() {
    const historyList = document.getElementById('memoryHistoryList');
    if (historyList) {
      historyList.innerHTML = `
        <div class="memory-error">
          ❌ Impossibile caricare la cronologia
        </div>
      `;
    }
  }

  /**
   * Refresh all data
   */
  async function refresh() {
    console.log('[MemoryPanel] Refreshing data...');
    
    // Show loading indicators
    const statsSection = document.getElementById('memoryStatsSection');
    const historyList = document.getElementById('memoryHistoryList');
    
    if (statsSection) {
      statsSection.innerHTML = '<div class="memory-stats-loading">⏳ Aggiornamento...</div>';
    }
    if (historyList) {
      historyList.innerHTML = '<div class="memory-loading">⏳ Aggiornamento...</div>';
    }

    await loadData();
  }

  /**
   * Clear conversation history
   */
  async function clearHistory() {
    if (!confirm('Sei sicuro di voler cancellare tutta la cronologia? Questa azione è irreversibile.')) {
      return;
    }

    try {
      console.log('[MemoryPanel] Clearing history...');

      const response = await fetch(
        `${RAG_BACKEND_URL}/bali-zero/conversations/clear?user_email=${encodeURIComponent(currentUserEmail)}`,
        { method: 'DELETE' }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('[MemoryPanel] Cleared:', result.deleted_count, 'conversations');

      alert(`✅ Cancellati ${result.deleted_count} conversazioni`);
      
      // Reload data
      await refresh();
    } catch (error) {
      console.error('[MemoryPanel] Failed to clear history:', error);
      alert('❌ Errore durante la cancellazione della cronologia');
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API
  return {
    init,
    open,
    close,
    toggle,
    switchTab,
    refresh,
    clearHistory
  };
})();

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => MemoryPanel.init());
} else {
  MemoryPanel.init();
}

// Export to window for global access
window.MemoryPanel = MemoryPanel;
