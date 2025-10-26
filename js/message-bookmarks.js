/**
 * Message Bookmarks - Enhancement 15
 * Star/bookmark important messages for quick access
 * 
 * Features:
 * - ⭐ Star button on each AI message
 * - Bookmarks panel with all starred messages
 * - Search within bookmarks
 * - Export bookmarks
 * - Jump to original message in conversation
 * - Persistent storage (localStorage)
 * - Keyboard shortcut: Ctrl+B to toggle bookmark
 * 
 * @module MessageBookmarks
 * @version 1.0.0
 */

const MessageBookmarks = (() => {
    'use strict';

    // Storage
    let bookmarks = new Map(); // messageId -> bookmark data
    let bookmarksPanel = null;

    /**
     * Initialize bookmark system
     */
    function init() {
        console.log('[MessageBookmarks] Initializing...');
        loadBookmarks();
        createBookmarksPanel();
        attachEventListeners();
        console.log('[MessageBookmarks] Initialized with', bookmarks.size, 'bookmarks');
    }

    /**
     * Load bookmarks from localStorage
     */
    function loadBookmarks() {
        try {
            const stored = localStorage.getItem('zantara_bookmarks');
            if (stored) {
                const data = JSON.parse(stored);
                bookmarks = new Map(data);
                console.log('[MessageBookmarks] Loaded', bookmarks.size, 'bookmarks');
            }
        } catch (error) {
            console.error('[MessageBookmarks] Error loading bookmarks:', error);
        }
    }

    /**
     * Save bookmarks to localStorage
     */
    function saveBookmarks() {
        try {
            const data = Array.from(bookmarks.entries());
            localStorage.setItem('zantara_bookmarks', JSON.stringify(data));
            console.log('[MessageBookmarks] Saved', bookmarks.size, 'bookmarks');
        } catch (error) {
            console.error('[MessageBookmarks] Error saving bookmarks:', error);
        }
    }

    /**
     * Create bookmarks panel UI
     */
    function createBookmarksPanel() {
        if (document.getElementById('bookmarksPanel')) {
            return;
        }

        const panelHTML = `
            <div id="bookmarksPanel" class="bookmarks-panel">
                <div class="bookmarks-panel-overlay" onclick="MessageBookmarks.closePanel()"></div>
                <div class="bookmarks-panel-container">
                    <!-- Header -->
                    <div class="bookmarks-panel-header">
                        <h2>⭐ Starred Messages</h2>
                        <button class="bookmarks-panel-close" onclick="MessageBookmarks.closePanel()">✕</button>
                    </div>

                    <!-- Search -->
                    <div class="bookmarks-search">
                        <input 
                            type="text" 
                            id="bookmarksSearchInput" 
                            placeholder="Search bookmarks..." 
                            class="bookmarks-search-input"
                        />
                    </div>

                    <!-- Content -->
                    <div class="bookmarks-content" id="bookmarksContent">
                        <!-- Populated dynamically -->
                    </div>

                    <!-- Footer -->
                    <div class="bookmarks-panel-footer">
                        <button class="bookmark-action-btn" onclick="MessageBookmarks.exportBookmarks()">
                            📥 Export
                        </button>
                        <button class="bookmark-action-btn danger" onclick="MessageBookmarks.clearAll()">
                            🗑️ Clear All
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', panelHTML);
        bookmarksPanel = document.getElementById('bookmarksPanel');

        // Add search listener
        const searchInput = document.getElementById('bookmarksSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                filterBookmarks(e.target.value);
            });
        }
    }

    /**
     * Attach event listeners
     */
    function attachEventListeners() {
        // Keyboard shortcut Ctrl+B
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                togglePanel();
            }
        });

        // Listen for new messages to add bookmark buttons
        window.addEventListener('zantara:messageReceived', (event) => {
            const message = event.detail;
            if (message && message.type === 'ai') {
                setTimeout(() => addBookmarkButton(message), 100);
            }
        });
    }

    /**
     * Add bookmark button to a message
     * @param {Object} message - Message data
     */
    function addBookmarkButton(message) {
        // Find message element by ID or timestamp
        const messageElements = document.querySelectorAll('.ai-message');
        const messageElement = Array.from(messageElements).find(el => {
            return el.dataset.messageId === message.id || 
                   el.textContent.includes(message.text.substring(0, 50));
        });

        if (!messageElement) {
            console.warn('[MessageBookmarks] Message element not found');
            return;
        }

        // Check if button already exists
        if (messageElement.querySelector('.bookmark-btn')) {
            return;
        }

        // Create bookmark button
        const isBookmarked = bookmarks.has(message.id);
        const button = document.createElement('button');
        button.className = 'bookmark-btn' + (isBookmarked ? ' bookmarked' : '');
        button.innerHTML = isBookmarked ? '⭐' : '☆';
        button.title = 'Bookmark this message (Ctrl+B)';
        button.onclick = () => toggleBookmark(message, messageElement);

        // Insert button in message header
        const messageHeader = messageElement.querySelector('.message-header');
        if (messageHeader) {
            messageHeader.appendChild(button);
        } else {
            messageElement.insertBefore(button, messageElement.firstChild);
        }
    }

    /**
     * Toggle bookmark for a message
     * @param {Object} message - Message data
     * @param {HTMLElement} messageElement - Message DOM element
     */
    function toggleBookmark(message, messageElement) {
        const messageId = message.id || generateMessageId(message);

        if (bookmarks.has(messageId)) {
            // Remove bookmark
            bookmarks.delete(messageId);
            updateBookmarkButton(messageElement, false);
            console.log('[MessageBookmarks] Removed bookmark:', messageId);
        } else {
            // Add bookmark
            const bookmark = {
                id: messageId,
                text: message.text,
                timestamp: message.timestamp || Date.now(),
                conversationId: getCurrentConversationId(),
                preview: message.text.substring(0, 200)
            };
            bookmarks.set(messageId, bookmark);
            updateBookmarkButton(messageElement, true);
            console.log('[MessageBookmarks] Added bookmark:', messageId);
        }

        saveBookmarks();
        
        // Update panel if open
        if (bookmarksPanel && bookmarksPanel.classList.contains('active')) {
            renderBookmarks();
        }
    }

    /**
     * Update bookmark button appearance
     * @param {HTMLElement} messageElement - Message DOM element
     * @param {boolean} isBookmarked - Bookmark state
     */
    function updateBookmarkButton(messageElement, isBookmarked) {
        const button = messageElement.querySelector('.bookmark-btn');
        if (button) {
            button.innerHTML = isBookmarked ? '⭐' : '☆';
            if (isBookmarked) {
                button.classList.add('bookmarked');
            } else {
                button.classList.remove('bookmarked');
            }
        }
    }

    /**
     * Generate message ID from message content
     * @param {Object} message - Message data
     * @returns {string} Generated ID
     */
    function generateMessageId(message) {
        const text = message.text || '';
        const timestamp = message.timestamp || Date.now();
        return `msg_${timestamp}_${text.substring(0, 20).replace(/\s/g, '_')}`;
    }

    /**
     * Get current conversation ID
     * @returns {string} Conversation ID
     */
    function getCurrentConversationId() {
        // Try to get from ZANTARA_API
        if (window.ZANTARA_API && window.ZANTARA_API.getCurrentConversationId) {
            return window.ZANTARA_API.getCurrentConversationId();
        }
        return 'default';
    }

    /**
     * Open bookmarks panel
     */
    function openPanel() {
        if (bookmarksPanel) {
            bookmarksPanel.classList.add('active');
            renderBookmarks();
        }
    }

    /**
     * Close bookmarks panel
     */
    function closePanel() {
        if (bookmarksPanel) {
            bookmarksPanel.classList.remove('active');
        }
    }

    /**
     * Toggle panel open/close
     */
    function togglePanel() {
        if (bookmarksPanel && bookmarksPanel.classList.contains('active')) {
            closePanel();
        } else {
            openPanel();
        }
    }

    /**
     * Render bookmarks in panel
     * @param {Array} filteredBookmarks - Optional filtered bookmarks
     */
    function renderBookmarks(filteredBookmarks = null) {
        const content = document.getElementById('bookmarksContent');
        if (!content) return;

        const bookmarksToRender = filteredBookmarks || Array.from(bookmarks.values());

        if (bookmarksToRender.length === 0) {
            content.innerHTML = `
                <div class="bookmarks-empty">
                    <p>⭐ No bookmarks yet</p>
                    <p class="empty-hint">Star important messages to save them here</p>
                </div>
            `;
            return;
        }

        // Sort by timestamp (newest first)
        bookmarksToRender.sort((a, b) => b.timestamp - a.timestamp);

        const html = bookmarksToRender.map(bookmark => `
            <div class="bookmark-item" data-bookmark-id="${bookmark.id}">
                <div class="bookmark-header">
                    <span class="bookmark-time">${formatTimestamp(bookmark.timestamp)}</span>
                    <button class="bookmark-remove" onclick="MessageBookmarks.removeBookmark('${bookmark.id}')">
                        ✕
                    </button>
                </div>
                <div class="bookmark-preview">${bookmark.preview}</div>
                <div class="bookmark-actions">
                    <button class="bookmark-action-link" onclick="MessageBookmarks.jumpToMessage('${bookmark.id}')">
                        Jump to message →
                    </button>
                </div>
            </div>
        `).join('');

        content.innerHTML = html;
    }

    /**
     * Filter bookmarks by search query
     * @param {string} query - Search query
     */
    function filterBookmarks(query) {
        if (!query.trim()) {
            renderBookmarks();
            return;
        }

        const lowerQuery = query.toLowerCase();
        const filtered = Array.from(bookmarks.values()).filter(bookmark => {
            return bookmark.text.toLowerCase().includes(lowerQuery) ||
                   bookmark.preview.toLowerCase().includes(lowerQuery);
        });

        renderBookmarks(filtered);
    }

    /**
     * Remove a specific bookmark
     * @param {string} messageId - Message ID to remove
     */
    function removeBookmark(messageId) {
        bookmarks.delete(messageId);
        saveBookmarks();
        renderBookmarks();
        console.log('[MessageBookmarks] Removed bookmark:', messageId);
    }

    /**
     * Clear all bookmarks
     */
    function clearAll() {
        if (confirm('Are you sure you want to clear all bookmarks?')) {
            bookmarks.clear();
            saveBookmarks();
            renderBookmarks();
            console.log('[MessageBookmarks] Cleared all bookmarks');
        }
    }

    /**
     * Export bookmarks as JSON
     */
    function exportBookmarks() {
        const data = Array.from(bookmarks.values());
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `zantara-bookmarks-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('[MessageBookmarks] Exported', data.length, 'bookmarks');
    }

    /**
     * Jump to original message in conversation
     * @param {string} messageId - Message ID
     */
    function jumpToMessage(messageId) {
        // Find message element
        const messageElements = document.querySelectorAll('.ai-message');
        const targetElement = Array.from(messageElements).find(el => {
            return el.dataset.messageId === messageId;
        });

        if (targetElement) {
            closePanel();
            targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetElement.classList.add('highlight-message');
            setTimeout(() => {
                targetElement.classList.remove('highlight-message');
            }, 2000);
            console.log('[MessageBookmarks] Jumped to message:', messageId);
        } else {
            alert('Original message not found in current conversation');
        }
    }

    /**
     * Format timestamp for display
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Formatted time
     */
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString();
    }

    /**
     * Get bookmark statistics
     * @returns {Object} Stats
     */
    function getStats() {
        return {
            total: bookmarks.size,
            oldest: bookmarks.size > 0 ? Math.min(...Array.from(bookmarks.values()).map(b => b.timestamp)) : null,
            newest: bookmarks.size > 0 ? Math.max(...Array.from(bookmarks.values()).map(b => b.timestamp)) : null
        };
    }

    // Public API
    return {
        init,
        toggleBookmark,
        openPanel,
        closePanel,
        togglePanel,
        removeBookmark,
        clearAll,
        exportBookmarks,
        jumpToMessage,
        getStats
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', MessageBookmarks.init);
} else {
    MessageBookmarks.init();
}

// Export for global access
window.MessageBookmarks = MessageBookmarks;
