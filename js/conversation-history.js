/**
 * ZANTARA - Conversation History Manager
 * Manages past conversations list in sidebar with search and load functionality
 * 
 * Features:
 * - Save conversations to localStorage with metadata
 * - Display conversation list in sidebar
 * - Search conversations by title/content
 * - Load conversation on click
 * - Delete conversations
 * - Auto-save current conversation
 * - Smart titles based on first message
 * - Import/Export conversation history
 * - Enhanced error handling
 * - Improved search with fuzzy matching
 * 
 * @module ConversationHistory
 * @version 1.1.0
 */

const ConversationHistory = (() => {
    'use strict';

    // Configuration
    const CONFIG = {
        maxConversations: 100, // Max conversations to store
        autoSaveInterval: 30000, // Auto-save every 30 seconds
        storageKey: 'zantara_conversations',
        currentConversationKey: 'zantara_current_conversation_id'
    };

    // State
    let conversations = [];
    let currentConversationId = null;
    let autoSaveTimer = null;

    /**
     * Initialize Conversation History
     */
    function init() {
        console.log('💬 Initializing Conversation History...');

        // Load conversations from storage
        loadConversations();

        // Get or create current conversation ID
        currentConversationId = localStorage.getItem(CONFIG.currentConversationKey) || 
                                Date.now().toString();
        localStorage.setItem(CONFIG.currentConversationKey, currentConversationId);

        // Render conversation list
        renderConversationList();

        // Start auto-save timer
        startAutoSave();

        // Listen for new messages to update current conversation
        window.addEventListener('zantara:messageAdded', handleMessageAdded);

        // Listen for new chat button
        const newChatBtn = document.getElementById('newChatBtn');
        if (newChatBtn) {
            newChatBtn.addEventListener('click', createNewConversation);
        }

        // Listen for export button if it exists
        const exportBtn = document.getElementById('exportConversationsBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportConversations);
        }

        // Listen for import button if it exists
        const importBtn = document.getElementById('importConversationsBtn');
        if (importBtn) {
            importBtn.addEventListener('click', importConversations);
        }

        // Listen for clear button if it exists
        const clearBtn = document.getElementById('clearConversationsBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', clearAllConversations);
        }

        // Listen for favorite button if it exists
        const favoriteBtn = document.getElementById('favoriteConversationsBtn');
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', filterFavorites);
        }

        console.log('✅ Conversation History ready');
    }

    /**
     * Load conversations from localStorage
     */
    function loadConversations() {
        try {
            const stored = localStorage.getItem(CONFIG.storageKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                // Validate data structure
                if (Array.isArray(parsed)) {
                    // Ensure backward compatibility for favorited and tags properties
                    conversations = parsed.map(conversation => {
                        // Ensure favorited property exists
                        if (typeof conversation.favorited === 'undefined') {
                            conversation.favorited = false;
                        }
                        
                        // Ensure tags property exists
                        if (!Array.isArray(conversation.tags)) {
                            conversation.tags = [];
                        }
                        
                        return conversation;
                    });
                    console.log(`📋 Loaded ${conversations.length} conversations`);
                } else {
                    console.warn('⚠️ Invalid conversation data structure, resetting');
                    conversations = [];
                }
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            // Try to recover by clearing corrupted data
            try {
                localStorage.removeItem(CONFIG.storageKey);
                conversations = [];
                console.log('🗑️ Cleared corrupted conversation data');
            } catch (clearError) {
                console.error('Error clearing corrupted data:', clearError);
            }
        }
    }

    /**
     * Save conversations to localStorage
     */
    function saveConversations() {
        try {
            // Keep only last N conversations
            const toSave = conversations.slice(0, CONFIG.maxConversations);
            localStorage.setItem(CONFIG.storageKey, JSON.stringify(toSave));
        } catch (error) {
            console.error('Error saving conversations:', error);
            // Notify user of storage issue
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                console.error('LocalStorage quota exceeded. Consider deleting old conversations.');
            }
        }
    }

    /**
     * Handle message added event
     */
    function handleMessageAdded(event) {
        const { message, isUser } = event.detail;
        
        // Find or create current conversation
        let conversation = conversations.find(c => c.id === currentConversationId);
        
        if (!conversation) {
            // Create new conversation
            conversation = {
                id: currentConversationId,
                title: 'New Chat',
                messages: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                favorited: false,
                tags: []  // Add tags array
            };
            conversations.unshift(conversation);
        }

        // Add message to conversation
        conversation.messages.push({
            role: isUser ? 'user' : 'assistant',
            content: message,
            timestamp: new Date().toISOString()
        });

        // Update title if first user message
        if (isUser && conversation.messages.length === 1) {
            conversation.title = generateConversationTitle(message);
        }

        // Update timestamp
        conversation.updatedAt = new Date().toISOString();

        // Ensure backward compatibility for favorited and tags properties
        if (typeof conversation.favorited === 'undefined') {
            conversation.favorited = false;
        }
        
        if (!Array.isArray(conversation.tags)) {
            conversation.tags = [];
        }

        // Save and re-render
        saveConversations();
        renderConversationList();
    }

    /**
     * Generate conversation title from first message
     */
    function generateConversationTitle(message) {
        // Truncate to 50 chars
        let title = message.substring(0, 50);
        if (message.length > 50) {
            title += '...';
        }

        // Remove extra whitespace
        title = title.replace(/\s+/g, ' ').trim();

        return title || 'New Chat';
    }

    /**
     * Perform fuzzy search on conversations
     * @param {string} query - Search query
     * @param {Array} conversations - Array of conversations to search
     * @returns {Array} - Filtered array of conversations
     */
    function fuzzySearch(query, conversations) {
        if (!query) return conversations;
        
        const searchTerm = query.toLowerCase();
        return conversations.filter(conversation => {
            // Check title match
            if (conversation.title.toLowerCase().includes(searchTerm)) {
                return true;
            }
            
            // Check messages content
            return conversation.messages.some(message => 
                message.content.toLowerCase().includes(searchTerm)
            );
        });
    }

    /**
     * Render conversation list in sidebar
     */
    function renderConversationList(filterText = '') {
        const listContainer = document.getElementById('conversationList');
        if (!listContainer) return;

        // Filter conversations with fuzzy search
        let filtered = conversations;
        if (filterText) {
            filtered = fuzzySearch(filterText, conversations);
        }

        // Group by date
        const grouped = groupConversationsByDate(filtered);

        if (filtered.length === 0) {
            listContainer.innerHTML = `
                <div class="conversation-empty">
                    <p>📭 ${filterText ? 'No conversations found' : 'No conversations yet'}</p>
                    <p class="empty-hint">${filterText ? 'Try a different search' : 'Start chatting to create history'}</p>
                </div>
            `;
            return;
        }

        // Render grouped conversations
        let html = '';

        for (const [group, convs] of Object.entries(grouped)) {
            html += `<div class="conversation-group">`;
            html += `<div class="conversation-group-title">${group}</div>`;

            convs.forEach(conversation => {
                const isActive = conversation.id === currentConversationId;
                const messageCount = conversation.messages.length;
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                const preview = lastMessage ? 
                    (lastMessage.content.substring(0, 60) + (lastMessage.content.length > 60 ? '...' : '')) : 
                    'No messages';

                // Create tags HTML
                let tagsHtml = '';
                if (conversation.tags && conversation.tags.length > 0) {
                    tagsHtml = `<div class="conversation-tags">`;
                    conversation.tags.forEach(tag => {
                        tagsHtml += `<span class="conversation-tag">${escapeHtml(tag)}</span>`;
                    });
                    tagsHtml += `</div>`;
                }

                html += `
                    <div class="conversation-item ${isActive ? 'active' : ''} ${conversation.favorited ? 'favorited' : ''}" 
                         data-conversation-id="${conversation.id}"
                         onclick="ConversationHistory.loadConversation('${conversation.id}')">
                        <div class="conversation-item-header">
                            <span class="conversation-title">${escapeHtml(conversation.title)}</span>
                            <div class="conversation-actions">
                                <button class="conversation-favorite" 
                                        onclick="event.stopPropagation(); ConversationHistory.toggleFavorite('${conversation.id}')"
                                        title="${conversation.favorited ? 'Unfavorite' : 'Favorite'} conversation">
                                    ${conversation.favorited ? '★' : '☆'}
                                </button>
                                <button class="conversation-delete" 
                                        onclick="event.stopPropagation(); ConversationHistory.deleteConversation('${conversation.id}')"
                                        title="Delete conversation">
                                    ×
                                </button>
                            </div>
                        </div>
                        ${tagsHtml}
                        <div class="conversation-preview">${escapeHtml(preview)}</div>
                        <div class="conversation-meta">
                            <span class="message-count">💬 ${messageCount}</span>
                            <span class="conversation-time">${formatRelativeTime(conversation.updatedAt)}</span>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
        }

        listContainer.innerHTML = html;
    }

    /**
     * Group conversations by date (Today, Yesterday, This Week, etc.)
     */
    function groupConversationsByDate(conversations) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        const grouped = {
            'Today': [],
            'Yesterday': [],
            'This Week': [],
            'This Month': [],
            'Older': []
        };

        conversations.forEach(conv => {
            const date = new Date(conv.updatedAt);

            if (date >= today) {
                grouped['Today'].push(conv);
            } else if (date >= yesterday) {
                grouped['Yesterday'].push(conv);
            } else if (date >= weekAgo) {
                grouped['This Week'].push(conv);
            } else if (date >= monthAgo) {
                grouped['This Month'].push(conv);
            } else {
                grouped['Older'].push(conv);
            }
        });

        // Remove empty groups
        Object.keys(grouped).forEach(key => {
            if (grouped[key].length === 0) {
                delete grouped[key];
            }
        });

        return grouped;
    }

    /**
     * Format relative time (e.g., "2 hours ago")
     */
    function formatRelativeTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    /**
     * Escape HTML to prevent XSS
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Load a conversation
     */
    function loadConversation(conversationId) {
        console.log('📖 Loading conversation:', conversationId);

        const conversation = conversations.find(c => c.id === conversationId);
        if (!conversation) {
            console.error('Conversation not found:', conversationId);
            return;
        }

        // Update current conversation ID
        currentConversationId = conversationId;
        localStorage.setItem(CONFIG.currentConversationKey, conversationId);

        // Clear current messages
        const messagesContainer = document.getElementById('messages');
        if (!messagesContainer) return;

        messagesContainer.innerHTML = '';

        // Re-render messages
        conversation.messages.forEach(msg => {
            if (msg.role === 'user') {
                // Add user message
                const container = createMessageContainer('user', msg.content, new Date(msg.timestamp));
                messagesContainer.appendChild(container);
            } else {
                // Add AI message
                const container = createMessageContainer('ai', msg.content, new Date(msg.timestamp));
                messagesContainer.appendChild(container);
            }
        });

        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Update UI
        renderConversationList();

        // Close sidebar on mobile
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && window.innerWidth <= 768) {
            sidebar.classList.remove('open');
        }
        
        // Dispatch event for other modules to react
        window.dispatchEvent(new CustomEvent('zantara:conversationLoaded', {
            detail: { conversationId, messages: conversation.messages }
        }));
    }

    /**
     * Create message container (using same function from main script)
     */
    function createMessageContainer(type, content, timestamp) {
        const container = document.createElement('div');
        container.className = 'message-container';

        const user = ZANTARA_API.getUser();
        const userName = user ? user.name : 'User';

        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${type}-avatar`;

        if (type === 'ai') {
            avatar.innerHTML = '<img src="assets/logoscon.png" alt="Zantara">';
        } else {
            avatar.textContent = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;

        if (type === 'ai') {
            const label = document.createElement('div');
            label.className = 'ai-label';
            label.textContent = 'Zantara:';
            messageDiv.appendChild(label);

            const contentDiv = document.createElement('div');
            contentDiv.className = 'ai-content';
            contentDiv.innerHTML = content;
            messageDiv.appendChild(contentDiv);
        } else {
            messageDiv.textContent = content;
        }

        const timestampDiv = document.createElement('div');
        timestampDiv.className = 'message-timestamp';
        const hours = timestamp.getHours().toString().padStart(2, '0');
        const minutes = timestamp.getMinutes().toString().padStart(2, '0');
        timestampDiv.textContent = `${hours}:${minutes}`;

        container.appendChild(avatar);
        container.appendChild(messageDiv);
        container.appendChild(timestampDiv);

        return container;
    }

    /**
     * Delete a conversation
     */
    function deleteConversation(conversationId) {
        if (!confirm('Delete this conversation?')) {
            return;
        }

        console.log('🗑️ Deleting conversation:', conversationId);

        // Remove from array
        conversations = conversations.filter(c => c.id !== conversationId);

        // If deleting current conversation, create new one
        if (conversationId === currentConversationId) {
            createNewConversation();
        }

        // Save and re-render
        saveConversations();
        renderConversationList();
    }

    /**
     * Create new conversation
     */
    function createNewConversation() {
        console.log('✨ Creating new conversation');

        // Save current conversation if it has messages
        const current = conversations.find(c => c.id === currentConversationId);
        if (current && current.messages.length > 0) {
            saveConversations();
        }

        // Create new conversation ID
        currentConversationId = Date.now().toString();
        localStorage.setItem(CONFIG.currentConversationKey, currentConversationId);

        // Clear messages and show welcome
        const messagesContainer = document.getElementById('messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="welcome">
                    <h2 data-i18n="welcomeTitle">Welcome to Zantara</h2>
                    <p data-i18n="welcomeSubtitle">The Intelligent Soul of Bali Zero</p>
                    <div class="suggested-questions">
                        <div class="suggested-question" data-question-id="kitas" data-question="How can I get an E23 Freelance KITAS?">
                            <div class="suggested-question-title">📋 E23 Freelance KITAS</div>
                            <div class="suggested-question-subtitle">Documents, costs and timeline</div>
                        </div>
                        <div class="suggested-question" data-question-id="company" data-question="How much does it cost to open a PT company in Indonesia?">
                            <div class="suggested-question-title">🏢 PT Company Setup</div>
                            <div class="suggested-question-subtitle">Complete costs and requirements</div>
                        </div>
                        <div class="suggested-question" data-question-id="investor" data-question="What are the visa options for investors?">
                            <div class="suggested-question-title">💼 Investor Visas</div>
                            <div class="suggested-question-subtitle">E28A, E33A and comparison</div>
                        </div>
                    </div>
                </div>
            `;

            // Apply translations
            if (window.ZANTARA_I18N) {
                ZANTARA_I18N.applyTranslations();
            }

            // Re-attach suggested question listeners
            document.querySelectorAll('.suggested-question').forEach(q => {
                q.addEventListener('click', function() {
                    const question = this.dataset.question;
                    const input = document.getElementById('chatInput');
                    if (input) {
                        input.value = question;
                        // Trigger send if sendMessage is available
                        if (typeof sendMessage === 'function') {
                            sendMessage();
                        }
                    }
                });
            });
        }

        // Re-render list
        renderConversationList();
    }

    /**
     * Search conversations
     */
    function searchConversations(query) {
        renderConversationList(query);
    }

    /**
     * Filter conversations by favorite status
     */
    function filterFavorites() {
        const listContainer = document.getElementById('conversationList');
        if (!listContainer) return;

        const favoritedConversations = conversations.filter(c => c.favorited);
        
        if (favoritedConversations.length === 0) {
            listContainer.innerHTML = `
                <div class="conversation-empty">
                    <p>⭐ No favorited conversations</p>
                    <p class="empty-hint">Star conversations you want to save</p>
                </div>
            `;
            return;
        }

        // Group favorited conversations by date
        const grouped = groupConversationsByDate(favoritedConversations);

        // Render grouped conversations
        let html = '';

        for (const [group, convs] of Object.entries(grouped)) {
            html += `<div class="conversation-group">`;
            html += `<div class="conversation-group-title">${group}</div>`;

            convs.forEach(conversation => {
                const isActive = conversation.id === currentConversationId;
                const messageCount = conversation.messages.length;
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                const preview = lastMessage ? 
                    (lastMessage.content.substring(0, 60) + (lastMessage.content.length > 60 ? '...' : '')) : 
                    'No messages';

                html += `
                    <div class="conversation-item ${isActive ? 'active' : ''} ${conversation.favorited ? 'favorited' : ''}" 
                         data-conversation-id="${conversation.id}"
                         onclick="ConversationHistory.loadConversation('${conversation.id}')">
                        <div class="conversation-item-header">
                            <span class="conversation-title">${escapeHtml(conversation.title)}</span>
                            <div class="conversation-actions">
                                <button class="conversation-favorite" 
                                        onclick="event.stopPropagation(); ConversationHistory.toggleFavorite('${conversation.id}')"
                                        title="${conversation.favorited ? 'Unfavorite' : 'Favorite'} conversation">
                                    ${conversation.favorited ? '★' : '☆'}
                                </button>
                                <button class="conversation-delete" 
                                        onclick="event.stopPropagation(); ConversationHistory.deleteConversation('${conversation.id}')"
                                        title="Delete conversation">
                                    ×
                                </button>
                            </div>
                        </div>
                        <div class="conversation-preview">${escapeHtml(preview)}</div>
                        <div class="conversation-meta">
                            <span class="message-count">💬 ${messageCount}</span>
                            <span class="conversation-time">${formatRelativeTime(conversation.updatedAt)}</span>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
        }

        listContainer.innerHTML = html;
    }

    /**
     * Sort conversations by different criteria
     * @param {string} criteria - Sort criteria ('date', 'title', 'messages')
     * @param {boolean} ascending - Sort order
     */
    function sortConversations(criteria = 'date', ascending = false) {
        switch (criteria) {
            case 'title':
                conversations.sort((a, b) => {
                    const comparison = a.title.localeCompare(b.title);
                    return ascending ? comparison : -comparison;
                });
                break;
            case 'messages':
                conversations.sort((a, b) => {
                    const comparison = a.messages.length - b.messages.length;
                    return ascending ? comparison : -comparison;
                });
                break;
            case 'date':
            default:
                conversations.sort((a, b) => {
                    const dateA = new Date(a.updatedAt);
                    const dateB = new Date(b.updatedAt);
                    const comparison = dateA - dateB;
                    return ascending ? comparison : -comparison;
                });
                break;
        }
        renderConversationList();
    }

    /**
     * Start auto-save timer
     */
    function startAutoSave() {
        if (autoSaveTimer) {
            clearInterval(autoSaveTimer);
        }

        autoSaveTimer = setInterval(() => {
            saveConversations();
        }, CONFIG.autoSaveInterval);
    }

    /**
     * Clear all conversations
     */
    function clearAllConversations() {
        if (!confirm('Delete all conversation history? This cannot be undone.')) {
            return;
        }

        conversations = [];
        saveConversations();
        createNewConversation();
        
        console.log('🗑️ All conversations cleared');
    }

    /**
     * Get current conversation
     */
    function getCurrentConversation() {
        return conversations.find(c => c.id === currentConversationId);
    }

    /**
     * Get conversation statistics
     * @returns {Object} Statistics object
     */
    function getStatistics() {
        if (conversations.length === 0) {
            return {
                totalConversations: 0,
                totalMessages: 0,
                favoritedConversations: 0,
                averageMessagesPerConversation: 0,
                mostActiveConversation: null,
                oldestConversation: null,
                newestConversation: null
            };
        }

        const totalMessages = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
        const favoritedConversations = conversations.filter(conv => conv.favorited).length;
        
        const mostActiveConversation = [...conversations].sort((a, b) => 
            b.messages.length - a.messages.length)[0];
        
        const sortedByDate = [...conversations].sort((a, b) => 
            new Date(a.createdAt) - new Date(b.createdAt));
        
        return {
            totalConversations: conversations.length,
            totalMessages: totalMessages,
            favoritedConversations: favoritedConversations,
            averageMessagesPerConversation: Math.round(totalMessages / conversations.length * 100) / 100,
            mostActiveConversation: {
                id: mostActiveConversation.id,
                title: mostActiveConversation.title,
                messageCount: mostActiveConversation.messages.length
            },
            oldestConversation: {
                id: sortedByDate[0].id,
                title: sortedByDate[0].title,
                date: sortedByDate[0].createdAt
            },
            newestConversation: {
                id: sortedByDate[sortedByDate.length - 1].id,
                title: sortedByDate[sortedByDate.length - 1].title,
                date: sortedByDate[sortedByDate.length - 1].createdAt
            }
        };
    }

    /**
     * Display conversation statistics
     */
    function displayStatistics() {
        const stats = getStatistics();
        
        // Create statistics modal or display in console
        console.log('📊 Conversation Statistics:');
        console.log(`Total Conversations: ${stats.totalConversations}`);
        console.log(`Total Messages: ${stats.totalMessages}`);
        console.log(`Favorited Conversations: ${stats.favoritedConversations}`);
        console.log(`Average Messages per Conversation: ${stats.averageMessagesPerConversation}`);
        
        if (stats.mostActiveConversation) {
            console.log(`Most Active Conversation: ${stats.mostActiveConversation.title} (${stats.mostActiveConversation.messageCount} messages)`);
        }
        
        if (stats.oldestConversation) {
            console.log(`Oldest Conversation: ${stats.oldestConversation.title}`);
        }
        
        if (stats.newestConversation) {
            console.log(`Newest Conversation: ${stats.newestConversation.title}`);
        }
        
        // Dispatch event with statistics
        window.dispatchEvent(new CustomEvent('zantara:conversationStatistics', {
            detail: { statistics: stats }
        }));
        
        return stats;
    }

    /**
     * Export conversations as JSON
     */
    function exportConversations() {
        try {
            const data = JSON.stringify(conversations, null, 2);
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `zantara-conversations-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📦 Conversations exported');
        } catch (error) {
            console.error('Error exporting conversations:', error);
            alert('Failed to export conversations. Check console for details.');
        }
    }

    /**
     * Import conversations from JSON file
     */
    function importConversations() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const importedData = JSON.parse(event.target.result);
                    
                    // Validate imported data
                    if (!Array.isArray(importedData)) {
                        throw new Error('Invalid data format');
                    }
                    
                    // Confirm import
                    const confirmMsg = `Import ${importedData.length} conversations? This will replace your current history.`;
                    if (!confirm(confirmMsg)) {
                        return;
                    }
                    
                    // Merge or replace conversations
                    conversations = importedData;
                    saveConversations();
                    renderConversationList();
                    createNewConversation(); // Create a fresh conversation
                    
                    console.log(`📥 Imported ${importedData.length} conversations`);
                } catch (error) {
                    console.error('Error importing conversations:', error);
                    alert('Failed to import conversations. Check console for details.');
                }
            };
            
            reader.onerror = () => {
                console.error('Error reading file');
                alert('Failed to read file');
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }

    /**
     * Toggle favorite status of a conversation
     */
    function toggleFavorite(conversationId) {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
            conversation.favorited = !conversation.favorited;
            saveConversations();
            renderConversationList();
            
            // Dispatch event for other modules
            window.dispatchEvent(new CustomEvent('zantara:conversationFavorited', {
                detail: { conversationId, favorited: conversation.favorited }
            }));
        }
    }

    /**
     * Add a tag to a conversation
     * @param {string} conversationId - Conversation ID
     * @param {string} tag - Tag to add
     */
    function addTag(conversationId, tag) {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation && !conversation.tags.includes(tag)) {
            conversation.tags.push(tag);
            saveConversations();
            renderConversationList();
            
            // Dispatch event
            window.dispatchEvent(new CustomEvent('zantara:conversationTagged', {
                detail: { conversationId, tag, action: 'added' }
            }));
        }
    }

    /**
     * Remove a tag from a conversation
     * @param {string} conversationId - Conversation ID
     * @param {string} tag - Tag to remove
     */
    function removeTag(conversationId, tag) {
        const conversation = conversations.find(c => c.id === conversationId);
        if (conversation) {
            const index = conversation.tags.indexOf(tag);
            if (index > -1) {
                conversation.tags.splice(index, 1);
                saveConversations();
                renderConversationList();
                
                // Dispatch event
                window.dispatchEvent(new CustomEvent('zantara:conversationTagged', {
                    detail: { conversationId, tag, action: 'removed' }
                }));
            }
        }
    }

    /**
     * Filter conversations by tag
     * @param {string} tag - Tag to filter by
     */
    function filterByTag(tag) {
        const listContainer = document.getElementById('conversationList');
        if (!listContainer) return;

        const taggedConversations = conversations.filter(c => c.tags.includes(tag));
        
        if (taggedConversations.length === 0) {
            listContainer.innerHTML = `
                <div class="conversation-empty">
                    <p>🏷️ No conversations tagged with "${tag}"</p>
                    <p class="empty-hint">Tag conversations to organize them</p>
                </div>
            `;
            return;
        }

        // Group tagged conversations by date
        const grouped = groupConversationsByDate(taggedConversations);

        // Render grouped conversations
        let html = '';

        for (const [group, convs] of Object.entries(grouped)) {
            html += `<div class="conversation-group">`;
            html += `<div class="conversation-group-title">${group}</div>`;

            convs.forEach(conversation => {
                const isActive = conversation.id === currentConversationId;
                const messageCount = conversation.messages.length;
                const lastMessage = conversation.messages[conversation.messages.length - 1];
                const preview = lastMessage ? 
                    (lastMessage.content.substring(0, 60) + (lastMessage.content.length > 60 ? '...' : '')) : 
                    'No messages';

                // Create tags HTML
                let tagsHtml = '';
                if (conversation.tags.length > 0) {
                    tagsHtml = `<div class="conversation-tags">`;
                    conversation.tags.forEach(tag => {
                        tagsHtml += `<span class="conversation-tag">${escapeHtml(tag)}</span>`;
                    });
                    tagsHtml += `</div>`;
                }

                html += `
                    <div class="conversation-item ${isActive ? 'active' : ''} ${conversation.favorited ? 'favorited' : ''}" 
                         data-conversation-id="${conversation.id}"
                         onclick="ConversationHistory.loadConversation('${conversation.id}')">
                        <div class="conversation-item-header">
                            <span class="conversation-title">${escapeHtml(conversation.title)}</span>
                            <div class="conversation-actions">
                                <button class="conversation-favorite" 
                                        onclick="event.stopPropagation(); ConversationHistory.toggleFavorite('${conversation.id}')"
                                        title="${conversation.favorited ? 'Unfavorite' : 'Favorite'} conversation">
                                    ${conversation.favorited ? '★' : '☆'}
                                </button>
                                <button class="conversation-delete" 
                                        onclick="event.stopPropagation(); ConversationHistory.deleteConversation('${conversation.id}')"
                                        title="Delete conversation">
                                    ×
                                </button>
                            </div>
                        </div>
                        ${tagsHtml}
                        <div class="conversation-preview">${escapeHtml(preview)}</div>
                        <div class="conversation-meta">
                            <span class="message-count">💬 ${messageCount}</span>
                            <span class="conversation-time">${formatRelativeTime(conversation.updatedAt)}</span>
                        </div>
                    </div>
                `;
            });

            html += `</div>`;
        }

        listContainer.innerHTML = html;
    }

    /**
     * Get all unique tags
     * @returns {Array} Array of unique tags
     */
    function getAllTags() {
        const allTags = conversations.flatMap(conv => conv.tags);
        return [...new Set(allTags)];
    }

    // Public API
    return {
        init,
        loadConversation,
        deleteConversation,
        searchConversations,
        clearAllConversations,
        getCurrentConversation,
        exportConversations,
        importConversations,
        toggleFavorite,
        filterFavorites,
        sortConversations,
        getStatistics,
        displayStatistics,
        addTag,
        removeTag,
        filterByTag,
        getAllTags
    };
})();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ConversationHistory.init);
} else {
    ConversationHistory.init();
}

// Export for global access
window.ConversationHistory = ConversationHistory;

/**
 * Conversation History Management System
 * Enhancement #21 for NUZANTARA-RAILWAY
 * Implements features for managing, searching, and organizing conversation history
 */

class ConversationHistory {
  constructor() {
    this.history = [];
    this.starredConversations = new Set();
    this.tags = new Map(); // conversationId -> tags[]
    this.maxHistoryItems = 100;
  }

  /**
   * Load conversation history from localStorage
   */
  loadHistory() {
    try {
      const savedHistory = localStorage.getItem('zantara-conversation-history');
      const starredData = localStorage.getItem('zantara-starred-conversations');
      const tagsData = localStorage.getItem('zantara-conversation-tags');
      
      if (savedHistory) {
        this.history = JSON.parse(savedHistory);
      }
      
      if (starredData) {
        this.starredConversations = new Set(JSON.parse(starredData));
      }
      
      if (tagsData) {
        const tagsObj = JSON.parse(tagsData);
        // Convert plain object to Map
        this.tags = new Map(Object.entries(tagsObj).map(([k, v]) => [k, new Set(v)]));
      }
      
      console.log('[ConversationHistory] Loaded conversation history');
      return true;
    } catch (error) {
      console.error('[ConversationHistory] Error loading history:', error);
      return false;
    }
  }

  /**
   * Save conversation history to localStorage
   */
  saveHistory() {
    try {
      localStorage.setItem('zantara-conversation-history', JSON.stringify(this.history));
      localStorage.setItem('zantara-starred-conversations', JSON.stringify([...this.starredConversations]));
      
      // Convert Map to plain object for serialization
      const tagsObj = {};
      for (const [key, value] of this.tags) {
        tagsObj[key] = [...value];
      }
      localStorage.setItem('zantara-conversation-tags', JSON.stringify(tagsObj));
      
      return true;
    } catch (error) {
      console.error('[ConversationHistory] Error saving history:', error);
      return false;
    }
  }

  /**
   * Add a new conversation to history
   */
  addConversation(conversation) {
    // Generate ID if not provided
    if (!conversation.id) {
      conversation.id = this.generateId();
    }
    
    // Add timestamp if not provided
    if (!conversation.timestamp) {
      conversation.timestamp = new Date().toISOString();
    }
    
    // Add to beginning of history
    this.history.unshift(conversation);
    
    // Limit history size
    if (this.history.length > this.maxHistoryItems) {
      const removed = this.history.pop();
      // Clean up associated data
      this.starredConversations.delete(removed.id);
      this.tags.delete(removed.id);
    }
    
    // Save to localStorage
    this.saveHistory();
    
    console.log(`[ConversationHistory] Added conversation ${conversation.id}`);
    return conversation.id;
  }

  /**
   * Star/Unstar a conversation
   */
  toggleStar(conversationId) {
    if (this.starredConversations.has(conversationId)) {
      this.starredConversations.delete(conversationId);
      console.log(`[ConversationHistory] Unstarred conversation ${conversationId}`);
    } else {
      this.starredConversations.add(conversationId);
      console.log(`[ConversationHistory] Starred conversation ${conversationId}`);
    }
    
    this.saveHistory();
    return this.starredConversations.has(conversationId);
  }

  /**
   * Add tags to a conversation
   */
  addTags(conversationId, tags) {
    if (!this.tags.has(conversationId)) {
      this.tags.set(conversationId, new Set());
    }
    
    const conversationTags = this.tags.get(conversationId);
    tags.forEach(tag => conversationTags.add(tag));
    
    this.saveHistory();
    console.log(`[ConversationHistory] Added tags to conversation ${conversationId}:`, tags);
  }

  /**
   * Remove tags from a conversation
   */
  removeTags(conversationId, tags) {
    if (this.tags.has(conversationId)) {
      const conversationTags = this.tags.get(conversationId);
      tags.forEach(tag => conversationTags.delete(tag));
      
      // Clean up empty tag sets
      if (conversationTags.size === 0) {
        this.tags.delete(conversationId);
      }
      
      this.saveHistory();
      console.log(`[ConversationHistory] Removed tags from conversation ${conversationId}:`, tags);
    }
  }

  /**
   * Get tags for a conversation
   */
  getTags(conversationId) {
    if (this.tags.has(conversationId)) {
      return [...this.tags.get(conversationId)];
    }
    return [];
  }

  /**
   * Search conversations by keyword
   */
  searchConversations(keyword) {
    const lowerKeyword = keyword.toLowerCase();
    
    return this.history.filter(conversation => {
      // Search in title
      if (conversation.title && conversation.title.toLowerCase().includes(lowerKeyword)) {
        return true;
      }
      
      // Search in messages
      if (conversation.messages) {
        return conversation.messages.some(message => 
          message.content && message.content.toLowerCase().includes(lowerKeyword)
        );
      }
      
      return false;
    });
  }

  /**
   * Filter conversations by tags
   */
  filterByTags(tagList) {
    return this.history.filter(conversation => {
      const conversationTags = this.tags.get(conversation.id) || new Set();
      return tagList.some(tag => conversationTags.has(tag));
    });
  }

  /**
   * Get starred conversations
   */
  getStarredConversations() {
    return this.history.filter(conversation => 
      this.starredConversations.has(conversation.id)
    );
  }

  /**
   * Sort conversations by different criteria
   */
  sortConversations(criteria = 'timestamp') {
    const sorted = [...this.history];
    
    switch (criteria) {
      case 'timestamp':
        sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        break;
      case 'title':
        sorted.sort((a, b) => {
          const titleA = (a.title || '').toLowerCase();
          const titleB = (b.title || '').toLowerCase();
          return titleA.localeCompare(titleB);
        });
        break;
      case 'messageCount':
        sorted.sort((a, b) => (b.messages?.length || 0) - (a.messages?.length || 0));
        break;
      case 'starred':
        sorted.sort((a, b) => {
          const aStarred = this.starredConversations.has(a.id) ? 1 : 0;
          const bStarred = this.starredConversations.has(b.id) ? 1 : 0;
          return bStarred - aStarred;
        });
        break;
      default:
        // Default to timestamp sorting
        sorted.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
    
    return sorted;
  }

  /**
   * Delete a conversation
   */
  deleteConversation(conversationId) {
    const index = this.history.findIndex(conv => conv.id === conversationId);
    if (index !== -1) {
      this.history.splice(index, 1);
      this.starredConversations.delete(conversationId);
      this.tags.delete(conversationId);
      this.saveHistory();
      console.log(`[ConversationHistory] Deleted conversation ${conversationId}`);
      return true;
    }
    return false;
  }

  /**
   * Export conversations to JSON
   */
  exportConversations() {
    const exportData = {
      history: this.history,
      starred: [...this.starredConversations],
      tags: {}
    };
    
    // Convert Map to plain object
    for (const [key, value] of this.tags) {
      exportData.tags[key] = [...value];
    }
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import conversations from JSON
   */
  importConversations(jsonData) {
    try {
      const importData = JSON.parse(jsonData);
      
      if (importData.history) {
        this.history = importData.history;
      }
      
      if (importData.starred) {
        this.starredConversations = new Set(importData.starred);
      }
      
      if (importData.tags) {
        // Convert plain object to Map
        this.tags = new Map(Object.entries(importData.tags).map(([k, v]) => [k, new Set(v)]));
      }
      
      this.saveHistory();
      console.log('[ConversationHistory] Imported conversations');
      return true;
    } catch (error) {
      console.error('[ConversationHistory] Error importing conversations:', error);
      return false;
    }
  }

  /**
   * Generate unique ID for conversations
   */
  generateId() {
    return 'conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get conversation statistics
   */
  getStatistics() {
    return {
      totalConversations: this.history.length,
      starredConversations: this.starredConversations.size,
      taggedConversations: this.tags.size,
      totalMessages: this.history.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0)
    };
  }
}

// Initialize conversation history system
document.addEventListener('DOMContentLoaded', () => {
  window.ConversationHistory = new ConversationHistory();
  window.ConversationHistory.loadHistory();
  
  console.log('[ConversationHistory] System ready');
  
  // Mark enhancement as completed
  if (window.enhancementTracker) {
    window.enhancementTracker.markCompleted(21);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConversationHistory;
}
