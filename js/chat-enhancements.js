/**
 * 🚀 ZANTARA Chat Enhancements
 * Complete feature set for professional chat experience
 */

(function() {
  'use strict';

  // ============================================================================
  // 📝 MARKDOWN RENDERING
  // ============================================================================

  /**
   * Render markdown in AI messages
   */
  function renderMarkdown(text) {
    if (typeof marked === 'undefined') {
      console.warn('Marked.js not loaded, returning plain text');
      return text;
    }

    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false,
      mangle: false
    });

    return marked.parse(text);
  }

  /**
   * Apply markdown rendering to AI message element
   */
  function applyMarkdownToMessage(messageElement) {
    const originalText = messageElement.textContent;
    const htmlContent = renderMarkdown(originalText);
    messageElement.innerHTML = htmlContent;

    // Highlight code blocks after rendering
    highlightCodeBlocks(messageElement);

    // Add copy buttons to code blocks
    addCopyButtonsToCodeBlocks(messageElement);
  }

  // ============================================================================
  // 💻 CODE HIGHLIGHTING
  // ============================================================================

  /**
   * Highlight all code blocks in element
   */
  function highlightCodeBlocks(element) {
    if (typeof hljs === 'undefined') {
      console.warn('Highlight.js not loaded');
      return;
    }

    const codeBlocks = element.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
      hljs.highlightElement(block);
    });
  }

  /**
   * Add copy buttons to all code blocks
   */
  function addCopyButtonsToCodeBlocks(element) {
    const codeBlocks = element.querySelectorAll('pre');

    codeBlocks.forEach(pre => {
      // Wrap in container if not already
      if (!pre.parentElement.classList.contains('code-block-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);
      }

      // Add copy button
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-code-btn';
      copyBtn.textContent = 'Copy';
      copyBtn.onclick = () => copyCodeToClipboard(pre, copyBtn);

      pre.parentElement.insertBefore(copyBtn, pre);
    });
  }

  /**
   * Copy code block content to clipboard
   */
  function copyCodeToClipboard(pre, button) {
    const code = pre.querySelector('code');
    const text = code ? code.textContent : pre.textContent;

    navigator.clipboard.writeText(text).then(() => {
      button.textContent = '✓ Copied!';
      button.classList.add('copied');

      setTimeout(() => {
        button.textContent = 'Copy';
        button.classList.remove('copied');
      }, 2000);

      if (window.IndonesianBadges && window.IndonesianBadges.showToast) {
        window.IndonesianBadges.showToast('✓ Code copied to clipboard', 'success');
      }
    }).catch(err => {
      console.error('Failed to copy:', err);
      button.textContent = '✗ Failed';

      setTimeout(() => {
        button.textContent = 'Copy';
      }, 2000);
    });
  }

  // ============================================================================
  // ⌨️ TYPING INDICATOR
  // ============================================================================

  /**
   * Create typing indicator element
   */
  function createTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.id = 'typing-indicator';
    indicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    return indicator;
  }

  /**
   * Show typing indicator
   */
  function showTypingIndicator() {
    const messagesDiv = document.querySelector('.messages');
    if (!messagesDiv) return;

    // Remove any existing indicator
    hideTypingIndicator();

    const indicator = createTypingIndicator();
    messagesDiv.appendChild(indicator);

    // Scroll to bottom
    setTimeout(() => {
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }, 50);
  }

  /**
   * Hide typing indicator
   */
  function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      indicator.remove();
    }
  }

  // ============================================================================
  // 🔗 LINK PREVIEW
  // ============================================================================

  /**
   * Detect and create link previews
   */
  function createLinkPreviews(messageElement) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const text = messageElement.textContent;
    const urls = text.match(urlRegex);

    if (!urls || urls.length === 0) return;

    urls.forEach(url => {
      // Simple preview card (full metadata would require backend)
      const previewCard = createSimpleLinkPreview(url);
      messageElement.appendChild(previewCard);
    });
  }

  /**
   * Create simple link preview card
   */
  function createSimpleLinkPreview(url) {
    const card = document.createElement('a');
    card.className = 'link-preview-card';
    card.href = url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname.replace('www.', '');

      card.innerHTML = `
        <div class="link-preview-content">
          <div class="link-preview-title">🔗 ${domain}</div>
          <div class="link-preview-description">${url}</div>
          <div class="link-preview-domain">${domain}</div>
        </div>
      `;
    } catch (e) {
      card.innerHTML = `
        <div class="link-preview-content">
          <div class="link-preview-title">🔗 Link</div>
          <div class="link-preview-description">${url}</div>
        </div>
      `;
    }

    return card;
  }

  // ============================================================================
  // 📱 MOBILE BOTTOM NAVIGATION
  // ============================================================================

  /**
   * Create mobile bottom navigation
   */
  function createMobileBottomNav() {
    // Check if already exists
    if (document.querySelector('.mobile-bottom-nav')) return;

    const nav = document.createElement('div');
    nav.className = 'mobile-bottom-nav';
    nav.innerHTML = `
      <button class="nav-item active" data-action="chat">
        <span class="nav-item-icon">💬</span>
        <span>Chat</span>
      </button>
      <button class="nav-item" data-action="history">
        <span class="nav-item-icon">📜</span>
        <span>History</span>
      </button>
      <button class="nav-item" data-action="intel">
        <span class="nav-item-icon">📰</span>
        <span>Intel</span>
      </button>
      <button class="nav-item" data-action="profile">
        <span class="nav-item-icon">👤</span>
        <span>Profile</span>
      </button>
    `;

    document.body.appendChild(nav);

    // Add click handlers
    nav.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => handleMobileNavClick(item));
    });
  }

  /**
   * Handle mobile nav click
   */
  function handleMobileNavClick(item) {
    const action = item.dataset.action;

    // Update active state
    document.querySelectorAll('.nav-item').forEach(nav => {
      nav.classList.remove('active');
    });
    item.classList.add('active');

    // Perform action
    const leftToggle = document.getElementById('leftToggle');
    const rightToggle = document.getElementById('rightToggle');
    const chatHistory = document.getElementById('chatHistory');
    const articles = document.getElementById('articlesPanel');

    switch (action) {
      case 'chat':
        // Close both sidebars
        chatHistory.classList.remove('open');
        articles.classList.remove('open');
        if (leftToggle) leftToggle.textContent = '☰';
        if (rightToggle) rightToggle.textContent = '☰';
        break;

      case 'history':
        // Open left sidebar
        chatHistory.classList.add('open');
        articles.classList.remove('open');
        if (leftToggle) leftToggle.textContent = '✕';
        if (rightToggle) rightToggle.textContent = '☰';
        break;

      case 'intel':
        // Open right sidebar
        articles.classList.add('open');
        chatHistory.classList.remove('open');
        if (leftToggle) leftToggle.textContent = '☰';
        if (rightToggle) rightToggle.textContent = '✕';
        break;

      case 'profile':
        // Toggle user dropdown
        const userBtn = document.getElementById('userBtn');
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
          userDropdown.classList.toggle('show');
        }
        break;
    }
  }

  // ============================================================================
  // 👆 SWIPE GESTURES (MOBILE)
  // ============================================================================

  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  /**
   * Initialize swipe gesture detection
   */
  function initializeSwipeGestures() {
    const chatWrapper = document.querySelector('.chat-wrapper');
    if (!chatWrapper) return;

    chatWrapper.addEventListener('touchstart', handleTouchStart, { passive: true });
    chatWrapper.addEventListener('touchmove', handleTouchMove, { passive: true });
    chatWrapper.addEventListener('touchend', handleTouchEnd);
  }

  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }

  function handleTouchMove(e) {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
  }

  function handleTouchEnd() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    // Only trigger if horizontal swipe is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right → open left sidebar (history)
        handleSwipeRight();
      } else {
        // Swipe left → open right sidebar (intel)
        handleSwipeLeft();
      }
    }
  }

  function handleSwipeRight() {
    const leftToggle = document.getElementById('leftToggle');
    const chatHistory = document.getElementById('chatHistory');
    const articles = document.getElementById('articlesPanel');

    if (chatHistory && !chatHistory.classList.contains('open')) {
      chatHistory.classList.add('open');
      articles.classList.remove('open');
      if (leftToggle) leftToggle.textContent = '✕';
    }
  }

  function handleSwipeLeft() {
    const rightToggle = document.getElementById('rightToggle');
    const articles = document.getElementById('articlesPanel');
    const chatHistory = document.getElementById('chatHistory');

    if (articles && !articles.classList.contains('open')) {
      articles.classList.add('open');
      chatHistory.classList.remove('open');
      if (rightToggle) rightToggle.textContent = '✕';
    }
  }

  // ============================================================================
  // 🎵 GAMELAN SOUND EFFECT
  // ============================================================================

  let gamelanSound = null;

  /**
   * Initialize gamelan sound
   */
  function initializeGamelanSound() {
    // Try to load gamelan sound if available
    gamelanSound = new Audio();
    gamelanSound.src = 'assets/sounds/gamelan-note.mp3';

    // Preload
    gamelanSound.load();

    // Error handling
    gamelanSound.onerror = () => {
      console.warn('Gamelan sound file not found. Add gamelan-note.mp3 to assets/sounds/');
      gamelanSound = null;
    };
  }

  /**
   * Play gamelan sound
   */
  function playGamelanSound() {
    if (!gamelanSound) return;

    try {
      gamelanSound.currentTime = 0; // Reset to start
      gamelanSound.volume = 0.3; // Gentle volume
      gamelanSound.play().catch(err => {
        console.warn('Could not play gamelan sound:', err);
      });
    } catch (err) {
      console.warn('Gamelan sound playback error:', err);
    }
  }

  // ============================================================================
  // 📊 UPLOAD PROGRESS
  // ============================================================================

  /**
   * Create upload progress UI
   */
  function createUploadProgress(fileName) {
    const progress = document.createElement('div');
    progress.className = 'upload-progress';
    progress.id = 'upload-progress';
    progress.innerHTML = `
      <div class="upload-progress-header">
        <div class="upload-progress-title">📎 Uploading ${fileName}</div>
        <button class="upload-progress-close" onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
      <div class="progress-bar-container">
        <div class="progress-bar-fill" style="width: 0%"></div>
      </div>
      <div class="upload-progress-info">
        <span>${fileName}</span>
        <span class="progress-percentage">0%</span>
      </div>
    `;

    document.body.appendChild(progress);
    return progress;
  }

  /**
   * Update upload progress
   */
  function updateUploadProgress(percentage) {
    const progress = document.getElementById('upload-progress');
    if (!progress) return;

    const fill = progress.querySelector('.progress-bar-fill');
    const percentageText = progress.querySelector('.progress-percentage');

    if (fill) fill.style.width = `${percentage}%`;
    if (percentageText) percentageText.textContent = `${percentage}%`;

    // Remove when complete
    if (percentage >= 100) {
      setTimeout(() => {
        progress.remove();
      }, 1000);
    }
  }

  // ============================================================================
  // 🎯 ENHANCE CHAT MESSAGES
  // ============================================================================

  /**
   * Enhance a chat message with all features
   */
  function enhanceMessage(messageElement, options = {}) {
    // Apply markdown if it's an AI message
    if (messageElement.classList.contains('ai-message')) {
      applyMarkdownToMessage(messageElement);

      // Create link previews
      if (options.linkPreviews !== false) {
        createLinkPreviews(messageElement);
      }

      // Play gamelan sound for AI responses
      if (options.playSound !== false) {
        playGamelanSound();
      }
    }
  }

  // ============================================================================
  // 🚀 INITIALIZE
  // ============================================================================

  /**
   * Initialize all chat enhancements
   */
  function initialize() {
    console.log('🚀 Initializing ZANTARA Chat Enhancements...');

    // Create mobile bottom nav
    if (window.innerWidth <= 768) {
      createMobileBottomNav();
    }

    // Initialize swipe gestures
    initializeSwipeGestures();

    // Initialize gamelan sound
    initializeGamelanSound();

    // Observe new messages and enhance them
    observeNewMessages();

    console.log('✅ Chat Enhancements ready!');
  }

  /**
   * Observe DOM for new messages
   */
  function observeNewMessages() {
    const messagesContainer = document.querySelector('.messages');
    if (!messagesContainer) return;

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            if (node.classList && (node.classList.contains('ai-message') || node.classList.contains('user-message'))) {
              enhanceMessage(node);
            }
          }
        });
      });
    });

    observer.observe(messagesContainer, {
      childList: true,
      subtree: true
    });
  }

  // ============================================================================
  // 📤 EXPORT API
  // ============================================================================

  window.ChatEnhancements = {
    renderMarkdown,
    highlightCodeBlocks,
    showTypingIndicator,
    hideTypingIndicator,
    createLinkPreviews,
    playGamelanSound,
    createUploadProgress,
    updateUploadProgress,
    enhanceMessage
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

})();
