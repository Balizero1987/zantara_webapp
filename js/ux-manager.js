/**
 * 🌟 ZANTARA UX Manager
 *
 * Gestisce tutte le animazioni e interazioni UX avanzate
 * Created: 2025-10-21
 * Focus: Typing indicators, smooth animations, auto-resize input
 */

class ZantaraUXManager {
  constructor() {
    this.typingIndicator = null;
    this.scrollIndicator = null;
    this.connectionStatus = null;
    // Don't call init() here - wait for DOM to be ready
  }

  init() {
    console.log('🎨 [UX Manager] Initializing...');
    this.setupScrollIndicator();
    this.setupConnectionStatus();
    this.setupAutoResizeInput();
    this.setupKeyboardShortcuts();
    this.observeScroll();
    console.log('✅ [UX Manager] Ready');
  }

  /**
   * Show beautiful typing indicator when AI is thinking
   */
  showTypingIndicator() {
    const messagesDiv = document.querySelector('.messages');
    if (!messagesDiv) return null;

    // Remove existing typing indicator if present
    this.removeTypingIndicator();

    // Create new typing indicator
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <div class="dot"></div>
      <div class="dot"></div>
      <div class="dot"></div>
    `;
    indicator.id = 'typing-indicator';

    messagesDiv.appendChild(indicator);
    this.typingIndicator = indicator;

    // Scroll to show indicator
    this.scrollToBottom();

    return indicator;
  }

  /**
   * Remove typing indicator
   */
  removeTypingIndicator() {
    if (this.typingIndicator) {
      this.typingIndicator.remove();
      this.typingIndicator = null;
    }

    // Also remove by ID (fallback)
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
  }

  /**
   * Create message with wrapper (avatar + content)
   */
  createMessage(type, content, options = {}) {
    const wrapper = document.createElement('div');
    wrapper.className = `message-wrapper ${type}`;

    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';

    if (type === 'user') {
      const userPhoto = localStorage.getItem('zantara-user-photo');
      if (userPhoto) {
        avatar.innerHTML = `<img src="${userPhoto}" alt="User" />`;
      } else {
        avatar.textContent = '👤';
      }
    } else {
      // AI avatar - use ZANTARA logo
      avatar.innerHTML = '<img src="assets/logoscon.png" alt="ZANTARA" />';
    }

    // Message content
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-content';

    const bubble = document.createElement('div');
    bubble.className = `${type}-message`;

    if (options.html) {
      bubble.innerHTML = content;
    } else {
      bubble.textContent = content;
    }

    messageDiv.appendChild(bubble);

    // Optional timestamp
    if (options.showTime) {
      const time = document.createElement('div');
      time.className = 'message-time';
      time.textContent = new Date().toLocaleTimeString('it-IT', {
        hour: '2-digit',
        minute: '2-digit'
      });
      messageDiv.appendChild(time);
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(messageDiv);

    return wrapper;
  }

  /**
   * Scroll to bottom with smooth animation
   */
  scrollToBottom(smooth = true) {
    const messagesDiv = document.querySelector('.messages');
    if (!messagesDiv) return;

    if (smooth) {
      requestAnimationFrame(() => {
        messagesDiv.scrollTo({
          top: messagesDiv.scrollHeight,
          behavior: 'smooth'
        });
      });
    } else {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }
  }

  /**
   * Setup scroll indicator (appears when not at bottom)
   */
  setupScrollIndicator() {
    const chatWrapper = document.querySelector('.chat-wrapper');
    if (!chatWrapper) return;

    // Create scroll indicator
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.onclick = () => this.scrollToBottom(true);
    chatWrapper.appendChild(indicator);

    this.scrollIndicator = indicator;
  }

  /**
   * Observe scroll position
   */
  observeScroll() {
    const messagesDiv = document.querySelector('.messages');
    if (!messagesDiv) return;

    messagesDiv.addEventListener('scroll', () => {
      if (!this.scrollIndicator) return;

      const isAtBottom = messagesDiv.scrollHeight - messagesDiv.scrollTop <= messagesDiv.clientHeight + 100;

      if (isAtBottom) {
        this.scrollIndicator.classList.remove('show');
      } else {
        this.scrollIndicator.classList.add('show');
      }
    });
  }

  /**
   * Setup connection status indicator
   */
  setupConnectionStatus() {
    const status = document.createElement('div');
    status.className = 'connection-status online';
    status.innerHTML = 'Connected';
    document.body.appendChild(status);

    this.connectionStatus = status;

    // Show briefly on load
    setTimeout(() => {
      status.classList.add('show');
      setTimeout(() => {
        status.classList.remove('show');
      }, 2000);
    }, 1000);
  }

  /**
   * Show connection status
   */
  showConnectionStatus(online = true) {
    if (!this.connectionStatus) return;

    this.connectionStatus.className = `connection-status ${online ? 'online' : 'offline'}`;
    this.connectionStatus.textContent = online ? 'Connected' : 'Disconnected';
    this.connectionStatus.classList.add('show');

    setTimeout(() => {
      this.connectionStatus.classList.remove('show');
    }, 3000);
  }

  /**
   * Auto-resize textarea as user types
   */
  setupAutoResizeInput() {
    const input = document.querySelector('.input');
    if (!input) return;

    // Convert to textarea for multi-line support
    if (input.tagName === 'INPUT') {
      const textarea = document.createElement('textarea');
      textarea.className = input.className;
      textarea.placeholder = input.placeholder;
      textarea.rows = 1;
      textarea.style.overflow = 'hidden';
      textarea.style.resize = 'none';

      input.parentNode.replaceChild(textarea, input);

      // Auto-resize on input
      textarea.addEventListener('input', () => {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      });

      // Prevent Enter from submitting (use Shift+Enter for new line)
      textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const sendBtn = document.getElementById('sendBtn');
          if (sendBtn) sendBtn.click();
        }
      });
    }
  }

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K: Focus input
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const input = document.querySelector('.input');
        if (input) input.focus();
      }

      // Escape: Clear input or close modals
      if (e.key === 'Escape') {
        const input = document.querySelector('.input');
        if (input && input.value) {
          input.value = '';
          input.style.height = 'auto';
        }
      }
    });
  }

  /**
   * Add quick action suggestions to welcome screen
   */
  addQuickActions(actions) {
    const welcome = document.querySelector('.welcome');
    if (!welcome) return;

    // Check if already added
    if (welcome.querySelector('.quick-actions')) return;

    const quickActionsDiv = document.createElement('div');
    quickActionsDiv.className = 'quick-actions';

    actions.forEach(action => {
      const btn = document.createElement('button');
      btn.className = 'quick-action';
      btn.innerHTML = `${action.icon} ${action.label}`;
      btn.onclick = () => {
        const input = document.querySelector('.input');
        if (input) {
          input.value = action.query;
          input.focus();
          // Trigger auto-resize if it's a textarea
          if (input.tagName === 'TEXTAREA') {
            input.dispatchEvent(new Event('input'));
          }
        }
      };
      quickActionsDiv.appendChild(btn);
    });

    welcome.appendChild(quickActionsDiv);
  }

  /**
   * Show send button loading state
   */
  setSendButtonLoading(loading = true) {
    const sendBtn = document.getElementById('sendBtn');
    if (!sendBtn) return;

    if (loading) {
      sendBtn.classList.add('sending');
      sendBtn.disabled = true;
    } else {
      sendBtn.classList.remove('sending');
      sendBtn.disabled = false;
    }
  }

  /**
   * Show message error state with shake animation
   */
  showMessageError(messageElement) {
    if (messageElement) {
      messageElement.classList.add('message-error');
      setTimeout(() => {
        messageElement.classList.remove('message-error');
      }, 600);
    }
  }

  /**
   * Show message success state
   */
  showMessageSuccess(messageElement) {
    if (messageElement) {
      messageElement.classList.add('message-sent');
      setTimeout(() => {
        messageElement.classList.remove('message-sent');
      }, 600);
    }
  }

  /**
   * Create shimmer loading effect for skeleton
   */
  createShimmer(width = '100%', height = '20px') {
    const shimmer = document.createElement('div');
    shimmer.className = 'shimmer';
    shimmer.style.width = width;
    shimmer.style.height = height;
    shimmer.style.borderRadius = '8px';
    return shimmer;
  }
}

// Initialize and expose globally
window.ZantaraUX = new ZantaraUXManager();

// Initialize when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  // Initialize UX Manager (setup all DOM-dependent features)
  window.ZantaraUX.init();

  // Quick actions for welcome screen
  const quickActions = [
    {
      icon: '🛂',
      label: 'Visa Help',
      query: 'Come posso rinnovare il mio KITAS?'
    },
    {
      icon: '🏢',
      label: 'Company Setup',
      query: 'Quanto costa aprire una PT PMA a Bali?'
    },
    {
      icon: '💰',
      label: 'Tax Info',
      query: 'Quali sono gli obblighi fiscali per expat?'
    },
    {
      icon: '🏠',
      label: 'Property',
      query: 'Come funziona il leasehold in Indonesia?'
    }
  ];

  // Add quick actions after a short delay (wrapped in separate setTimeout)
  setTimeout(() => {
    window.ZantaraUX.addQuickActions(quickActions);
  }, 500);
});

console.log('🎨 [UX Manager] Loaded successfully');
