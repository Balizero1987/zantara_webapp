/**
 * Message Search Module - Enhancement 17
 * In-conversation search with highlighting and navigation
 * Features: Text search, regex support, match highlighting, keyboard shortcuts (Ctrl+F)
 */

(function() {
    'use strict';

    // Search State
    let searchActive = false;
    let currentQuery = '';
    let searchMatches = [];
    let currentMatchIndex = -1;
    let searchRegex = null;

    /**
     * Initialize Message Search system
     */
    function initialize() {
        console.log('[MessageSearch] Initializing...');
        
        // Create search UI
        createSearchPanel();
        
        // Set up keyboard shortcuts
        setupKeyboardShortcuts();
        
        console.log('[MessageSearch] Initialized successfully');
    }

    /**
     * Create search panel UI
     */
    function createSearchPanel() {
        const searchHTML = `
            <div id="messageSearchPanel" class="message-search-panel" style="display:none;">
                <div class="search-panel-content">
                    <input 
                        type="text" 
                        id="messageSearchInput" 
                        class="search-input" 
                        placeholder="Search messages... (Ctrl+F)"
                        autocomplete="off"
                    >
                    <label class="search-option">
                        <input type="checkbox" id="searchRegexMode">
                        <span>Regex</span>
                    </label>
                    <label class="search-option">
                        <input type="checkbox" id="searchCaseSensitive">
                        <span>Aa</span>
                    </label>
                    <div class="search-navigation">
                        <span class="search-counter" id="searchCounter">0 of 0</span>
                        <button class="search-nav-btn" id="searchPrevBtn" title="Previous (Shift+Enter)">
                            <svg viewBox="0 0 16 16" width="14" height="14">
                                <path d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5z"/>
                            </svg>
                        </button>
                        <button class="search-nav-btn" id="searchNextBtn" title="Next (Enter)">
                            <svg viewBox="0 0 16 16" width="14" height="14">
                                <path d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z"/>
                            </svg>
                        </button>
                    </div>
                    <button class="search-close-btn" id="searchCloseBtn" title="Close (Esc)">
                        <svg viewBox="0 0 16 16" width="14" height="14">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        // Insert at top of chat container
        const chatContainer = document.getElementById('chatMessages')?.parentElement || document.querySelector('.chat-container') || document.body;
        chatContainer.insertAdjacentHTML('afterbegin', searchHTML);
        
        // Bind event listeners
        bindSearchEvents();
    }

    /**
     * Bind search panel event listeners
     */
    function bindSearchEvents() {
        const searchInput = document.getElementById('messageSearchInput');
        const searchPrevBtn = document.getElementById('searchPrevBtn');
        const searchNextBtn = document.getElementById('searchNextBtn');
        const searchCloseBtn = document.getElementById('searchCloseBtn');
        const regexMode = document.getElementById('searchRegexMode');
        const caseSensitive = document.getElementById('searchCaseSensitive');
        
        // Search input
        searchInput?.addEventListener('input', debounce((e) => {
            performSearch(e.target.value);
        }, 300));
        
        searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (e.shiftKey) {
                    navigateToPrevious();
                } else {
                    navigateToNext();
                }
            } else if (e.key === 'Escape') {
                closeSearch();
            }
        });
        
        // Navigation buttons
        searchPrevBtn?.addEventListener('click', navigateToPrevious);
        searchNextBtn?.addEventListener('click', navigateToNext);
        searchCloseBtn?.addEventListener('click', closeSearch);
        
        // Options
        regexMode?.addEventListener('change', () => {
            if (currentQuery) performSearch(currentQuery);
        });
        
        caseSensitive?.addEventListener('change', () => {
            if (currentQuery) performSearch(currentQuery);
        });
    }

    /**
     * Set up keyboard shortcuts
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+F or Cmd+F to open search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                openSearch();
            }
            
            // Escape to close search
            if (e.key === 'Escape' && searchActive) {
                closeSearch();
            }
        });
    }

    /**
     * Open search panel
     */
    function openSearch() {
        const searchPanel = document.getElementById('messageSearchPanel');
        const searchInput = document.getElementById('messageSearchInput');
        
        if (searchPanel && searchInput) {
            searchPanel.style.display = 'block';
            searchInput.focus();
            searchActive = true;
            
            // Select existing text if any
            if (searchInput.value) {
                searchInput.select();
            }
            
            console.log('[MessageSearch] Search opened');
        }
    }

    /**
     * Close search panel
     */
    function closeSearch() {
        const searchPanel = document.getElementById('messageSearchPanel');
        const searchInput = document.getElementById('messageSearchInput');
        
        if (searchPanel) {
            searchPanel.style.display = 'none';
            searchActive = false;
            
            // Clear highlights
            clearHighlights();
            
            // Clear search state
            currentQuery = '';
            searchMatches = [];
            currentMatchIndex = -1;
            
            console.log('[MessageSearch] Search closed');
        }
    }

    /**
     * Perform search
     */
    function performSearch(query) {
        currentQuery = query;
        
        // Clear previous highlights
        clearHighlights();
        
        if (!query || query.length < 2) {
            updateSearchCounter(0, 0);
            return;
        }
        
        // Build search regex
        const regexMode = document.getElementById('searchRegexMode')?.checked || false;
        const caseSensitive = document.getElementById('searchCaseSensitive')?.checked || false;
        
        try {
            if (regexMode) {
                searchRegex = new RegExp(query, caseSensitive ? 'g' : 'gi');
            } else {
                // Escape special regex characters
                const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                searchRegex = new RegExp(escaped, caseSensitive ? 'g' : 'gi');
            }
        } catch (error) {
            console.error('[MessageSearch] Invalid regex:', error);
            updateSearchCounter(0, 0);
            return;
        }
        
        // Search in all messages
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) return;
        
        const messages = chatMessages.querySelectorAll('.message-content, [class*="message"]');
        searchMatches = [];
        
        messages.forEach((messageElement, index) => {
            const text = messageElement.textContent || '';
            const matches = text.matchAll(searchRegex);
            
            for (const match of matches) {
                searchMatches.push({
                    element: messageElement,
                    text: match[0],
                    index: match.index,
                    messageIndex: index
                });
                
                // Highlight match
                highlightMatch(messageElement, match.index, match[0].length);
            }
        });
        
        console.log(`[MessageSearch] Found ${searchMatches.length} matches for "${query}"`);
        
        // Update counter
        updateSearchCounter(searchMatches.length > 0 ? 1 : 0, searchMatches.length);
        
        // Navigate to first match
        if (searchMatches.length > 0) {
            currentMatchIndex = 0;
            scrollToMatch(0);
        }
    }

    /**
     * Highlight search match
     */
    function highlightMatch(element, startIndex, length) {
        const text = element.textContent || '';
        
        // Don't highlight if already has highlights
        if (element.querySelector('.search-highlight')) {
            return;
        }
        
        // Create highlighted version
        const before = text.substring(0, startIndex);
        const match = text.substring(startIndex, startIndex + length);
        const after = text.substring(startIndex + length);
        
        element.innerHTML = `${escapeHtml(before)}<span class="search-highlight">${escapeHtml(match)}</span>${escapeHtml(after)}`;
    }

    /**
     * Clear all highlights
     */
    function clearHighlights() {
        const highlights = document.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentElement;
            if (parent) {
                parent.textContent = parent.textContent; // Remove HTML, restore text
            }
        });
        
        // Remove active highlight
        const active = document.querySelector('.search-highlight-active');
        if (active) {
            active.classList.remove('search-highlight-active');
        }
    }

    /**
     * Navigate to next match
     */
    function navigateToNext() {
        if (searchMatches.length === 0) return;
        
        currentMatchIndex = (currentMatchIndex + 1) % searchMatches.length;
        scrollToMatch(currentMatchIndex);
        updateSearchCounter(currentMatchIndex + 1, searchMatches.length);
    }

    /**
     * Navigate to previous match
     */
    function navigateToPrevious() {
        if (searchMatches.length === 0) return;
        
        currentMatchIndex = currentMatchIndex - 1;
        if (currentMatchIndex < 0) {
            currentMatchIndex = searchMatches.length - 1;
        }
        scrollToMatch(currentMatchIndex);
        updateSearchCounter(currentMatchIndex + 1, searchMatches.length);
    }

    /**
     * Scroll to specific match
     */
    function scrollToMatch(index) {
        if (index < 0 || index >= searchMatches.length) return;
        
        const match = searchMatches[index];
        
        // Remove previous active highlight
        const prevActive = document.querySelector('.search-highlight-active');
        if (prevActive) {
            prevActive.classList.remove('search-highlight-active');
        }
        
        // Add active class to current match
        const highlight = match.element.querySelector('.search-highlight');
        if (highlight) {
            highlight.classList.add('search-highlight-active');
        }
        
        // Scroll into view
        match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    /**
     * Update search counter
     */
    function updateSearchCounter(current, total) {
        const counter = document.getElementById('searchCounter');
        if (counter) {
            counter.textContent = `${current} of ${total}`;
        }
    }

    /**
     * Escape HTML
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Debounce helper
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Public API
     */
    window.MessageSearch = {
        open: openSearch,
        close: closeSearch,
        search: performSearch,
        next: navigateToNext,
        previous: navigateToPrevious,
        getMatches: () => searchMatches,
        getCurrentMatch: () => searchMatches[currentMatchIndex]
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
