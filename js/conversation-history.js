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
 * 
 * @module ConversationHistory
 * @version 1.0.0
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

        console.log('✅ Conversation History ready');
    }

    /**
     * Load conversations from localStorage
     */
    function loadConversations() {
        try {
            const stored = localStorage.getItem(CONFIG.storageKey);
            if (stored) {
                conversations = JSON.parse(stored);
                console.log(`📋 Loaded ${conversations.length} conversations`);
            }
        } catch (error) {
            console.error('Error loading conversations:', error);
            conversations = [];
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
                updatedAt: new Date().toISOString()
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
     * Render conversation list in sidebar
     */
    function renderConversationList(filterText = '') {
        const listContainer = document.getElementById('conversationList');
        if (!listContainer) return;

        // Filter conversations
        let filtered = conversations;
        if (filterText) {
            const search = filterText.toLowerCase();
            filtered = conversations.filter(c => 
                c.title.toLowerCase().includes(search) ||
                c.messages.some(m => m.content.toLowerCase().includes(search))
            );
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

                html += `
                    <div class="conversation-item ${isActive ? 'active' : ''}" 
                         data-conversation-id="${conversation.id}"
                         onclick="ConversationHistory.loadConversation('${conversation.id}')">
                        <div class="conversation-item-header">
                            <span class="conversation-title">${escapeHtml(conversation.title)}</span>
                            <button class="conversation-delete" 
                                    onclick="event.stopPropagation(); ConversationHistory.deleteConversation('${conversation.id}')"
                                    title="Delete conversation">
                                ×
                            </button>
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
     * Export conversations as JSON
     */
    function exportConversations() {
        const data = JSON.stringify(conversations, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zantara-conversations-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('📦 Conversations exported');
    }

    // Public API
    return {
        init,
        loadConversation,
        deleteConversation,
        searchConversations,
        clearAllConversations,
        getCurrentConversation,
        exportConversations
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
