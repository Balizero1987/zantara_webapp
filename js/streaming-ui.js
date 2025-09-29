// ZANTARA Streaming UI Components
// Handles UI updates for streaming responses (browsing pill, citations, etc.)

class StreamingUI {
  constructor() {
    this.browsingPill = null;
    this.citationsContainer = null;
    this.currentMessageElement = null;
    this.isInitialized = false;
  }

  // Initialize UI components
  init() {
    if (this.isInitialized) return;

    // Create browsing pill
    this.createBrowsingPill();

    // Create styles
    this.injectStyles();

    this.isInitialized = true;
  }

  // Inject required styles
  injectStyles() {
    if (document.getElementById('streaming-ui-styles')) return;

    const styles = `
      .browsing-pill {
        position: fixed;
        top: 80px;
        right: 20px;
        background: var(--zantara-primary, #3b82f6);
        color: white;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 14px;
        display: none;
        align-items: center;
        gap: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: pulse 1.5s infinite;
      }

      .browsing-pill.active {
        display: flex;
      }

      .browsing-pill-icon {
        width: 16px;
        height: 16px;
        border: 2px solid white;
        border-radius: 50%;
        border-top-color: transparent;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.7; }
      }

      .tool-status {
        position: fixed;
        top: 120px;
        right: 20px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        max-width: 300px;
        display: none;
        z-index: 999;
      }

      .tool-status.visible {
        display: block;
      }

      .citations-container {
        margin-top: 12px;
        padding: 12px;
        background: var(--surface-secondary, #f3f4f6);
        border-radius: 8px;
        border-left: 3px solid var(--zantara-primary, #3b82f6);
      }

      .citations-title {
        font-size: 12px;
        font-weight: 600;
        color: var(--text-secondary, #6b7280);
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .citation-item {
        display: flex;
        align-items: start;
        gap: 8px;
        padding: 8px 0;
        border-bottom: 1px solid var(--divider, #e5e7eb);
      }

      .citation-item:last-child {
        border-bottom: none;
      }

      .citation-number {
        min-width: 24px;
        height: 24px;
        background: var(--zantara-primary, #3b82f6);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
      }

      .citation-content {
        flex: 1;
      }

      .citation-title {
        font-weight: 500;
        color: var(--text-primary, #111827);
        margin-bottom: 4px;
        line-height: 1.4;
      }

      .citation-link {
        color: var(--zantara-primary, #3b82f6);
        text-decoration: none;
        font-size: 14px;
        word-break: break-all;
      }

      .citation-link:hover {
        text-decoration: underline;
      }

      .citation-snippet {
        font-size: 13px;
        color: var(--text-secondary, #6b7280);
        margin-top: 4px;
        line-height: 1.5;
      }

      .citation-date {
        font-size: 11px;
        color: var(--text-tertiary, #9ca3af);
        margin-top: 4px;
      }

      .copy-citations-btn {
        margin-top: 12px;
        padding: 6px 12px;
        background: var(--surface-primary, white);
        border: 1px solid var(--divider, #e5e7eb);
        border-radius: 6px;
        font-size: 13px;
        color: var(--text-primary, #111827);
        cursor: pointer;
        transition: all 0.2s;
      }

      .copy-citations-btn:hover {
        background: var(--surface-secondary, #f3f4f6);
        border-color: var(--zantara-primary, #3b82f6);
      }

      .copy-citations-btn.copied {
        background: var(--success-light, #d1fae5);
        color: var(--success, #059669);
        border-color: var(--success, #059669);
      }

      .streaming-delta {
        animation: fadeIn 0.3s ease-out;
      }

      @keyframes fadeIn {
        from { opacity: 0.5; }
        to { opacity: 1; }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = 'streaming-ui-styles';
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  // Create browsing pill element
  createBrowsingPill() {
    if (this.browsingPill) return;

    const pill = document.createElement('div');
    pill.className = 'browsing-pill';
    pill.innerHTML = `
      <div class="browsing-pill-icon"></div>
      <span>Browsing the web...</span>
    `;
    document.body.appendChild(pill);
    this.browsingPill = pill;

    // Tool status element
    const status = document.createElement('div');
    status.className = 'tool-status';
    document.body.appendChild(status);
    this.toolStatus = status;
  }

  // Show/hide browsing pill
  showBrowsingPill(show = true) {
    if (!this.browsingPill) this.createBrowsingPill();

    if (show) {
      this.browsingPill.classList.add('active');
    } else {
      this.browsingPill.classList.remove('active');
      this.hideToolStatus();
    }
  }

  // Show tool status message
  showToolStatus(message) {
    if (!this.toolStatus) return;

    this.toolStatus.textContent = message;
    this.toolStatus.classList.add('visible');

    // Auto-hide after 5 seconds
    clearTimeout(this.toolStatusTimer);
    this.toolStatusTimer = setTimeout(() => {
      this.hideToolStatus();
    }, 5000);
  }

  // Hide tool status
  hideToolStatus() {
    if (!this.toolStatus) return;
    this.toolStatus.classList.remove('visible');
  }

  // Render citations
  renderCitations(citations, targetElement) {
    if (!citations || !citations.length || !targetElement) return;

    const container = document.createElement('div');
    container.className = 'citations-container';

    const title = document.createElement('div');
    title.className = 'citations-title';
    title.textContent = 'Sources';
    container.appendChild(title);

    citations.forEach((citation, index) => {
      const item = document.createElement('div');
      item.className = 'citation-item';

      const number = document.createElement('div');
      number.className = 'citation-number';
      number.textContent = index + 1;

      const content = document.createElement('div');
      content.className = 'citation-content';

      const citationTitle = document.createElement('div');
      citationTitle.className = 'citation-title';
      citationTitle.textContent = citation.title || 'Untitled';

      const link = document.createElement('a');
      link.className = 'citation-link';
      link.href = citation.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = citation.url;

      content.appendChild(citationTitle);
      content.appendChild(link);

      if (citation.snippet) {
        const snippet = document.createElement('div');
        snippet.className = 'citation-snippet';
        snippet.textContent = citation.snippet;
        content.appendChild(snippet);
      }

      if (citation.dateLastCrawled) {
        const date = document.createElement('div');
        date.className = 'citation-date';
        const crawlDate = new Date(citation.dateLastCrawled);
        date.textContent = `Last updated: ${crawlDate.toLocaleDateString()}`;
        content.appendChild(date);
      }

      item.appendChild(number);
      item.appendChild(content);
      container.appendChild(item);
    });

    // Add copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-citations-btn';
    copyBtn.textContent = '📋 Copy citations';
    copyBtn.onclick = () => this.copyCitations(citations, copyBtn);
    container.appendChild(copyBtn);

    targetElement.appendChild(container);
    this.citationsContainer = container;
  }

  // Copy citations to clipboard
  async copyCitations(citations, button) {
    const text = citations.map((c, i) =>
      `[${i + 1}] ${c.title}\n${c.url}${c.snippet ? '\n' + c.snippet : ''}`
    ).join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
      button.textContent = '✓ Copied!';
      button.classList.add('copied');

      setTimeout(() => {
        button.textContent = '📋 Copy citations';
        button.classList.remove('copied');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy citations:', err);
      button.textContent = '❌ Copy failed';

      setTimeout(() => {
        button.textContent = '📋 Copy citations';
      }, 2000);
    }
  }

  // Append delta content to current message
  appendDelta(content, targetElement) {
    if (!targetElement) return;

    // If this is plain text element, append directly
    if (targetElement.dataset.streamingText) {
      targetElement.textContent += content;
    } else {
      // For HTML elements, create spans for each delta
      const span = document.createElement('span');
      span.className = 'streaming-delta';
      span.textContent = content;
      targetElement.appendChild(span);
    }
  }

  // Set final message content
  setFinalContent(content, targetElement) {
    if (!targetElement) return;
    targetElement.textContent = content;
  }

  // Create a message element for streaming
  createStreamingMessage(role = 'assistant') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    messageDiv.dataset.streaming = 'true';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.dataset.streamingText = 'true';

    messageDiv.appendChild(contentDiv);
    this.currentMessageElement = contentDiv;

    return messageDiv;
  }

  // Get current message element
  getCurrentMessageElement() {
    return this.currentMessageElement;
  }

  // Clear current message element reference
  clearCurrentMessage() {
    this.currentMessageElement = null;
  }

  // Clean up
  destroy() {
    if (this.browsingPill) {
      this.browsingPill.remove();
      this.browsingPill = null;
    }

    if (this.toolStatus) {
      this.toolStatus.remove();
      this.toolStatus = null;
    }

    if (this.citationsContainer) {
      this.citationsContainer.remove();
      this.citationsContainer = null;
    }

    this.isInitialized = false;
  }
}

// Create singleton instance
const streamingUI = new StreamingUI();

// Expose to window for global access
if (typeof window !== 'undefined') {
  window.ZANTARA_STREAMING_UI = streamingUI;
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StreamingUI;
}