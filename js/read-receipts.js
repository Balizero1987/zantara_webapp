/**
 * Read Receipts Module - Enhancement 16
 * Tracks message read status and displays read indicators
 * Features: Read tracking, visual indicators, timestamps, privacy settings
 */

(function() {
    'use strict';

    // Read Receipts State
    const readReceipts = new Map(); // messageId -> { read: boolean, readAt: timestamp, userId: string }
    const userSettings = {
        enabled: true, // User can disable sending read receipts
        showReadStatus: true, // Show when others read your messages
        showTimestamps: true // Show exact read time
    };

    // Storage keys
    const STORAGE_KEY_RECEIPTS = 'zantara_read_receipts';
    const STORAGE_KEY_SETTINGS = 'zantara_read_receipt_settings';

    /**
     * Initialize Read Receipts system
     */
    function initialize() {
        console.log('[ReadReceipts] Initializing...');
        
        // Load saved receipts and settings
        loadFromStorage();
        
        // Set up event listeners
        setupEventListeners();
        
        // Create settings panel
        createSettingsPanel();
        
        // Mark visible messages as read
        observeVisibleMessages();
        
        console.log('[ReadReceipts] Initialized successfully');
    }

    /**
     * Load receipts and settings from localStorage
     */
    function loadFromStorage() {
        try {
            // Load read receipts
            const savedReceipts = localStorage.getItem(STORAGE_KEY_RECEIPTS);
            if (savedReceipts) {
                const receiptsData = JSON.parse(savedReceipts);
                receiptsData.forEach(([messageId, receipt]) => {
                    readReceipts.set(messageId, receipt);
                });
                console.log(`[ReadReceipts] Loaded ${readReceipts.size} receipts from storage`);
            }

            // Load user settings
            const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
            if (savedSettings) {
                Object.assign(userSettings, JSON.parse(savedSettings));
                console.log('[ReadReceipts] Loaded user settings:', userSettings);
            }
        } catch (error) {
            console.error('[ReadReceipts] Error loading from storage:', error);
        }
    }

    /**
     * Save receipts to localStorage
     */
    function saveToStorage() {
        try {
            // Save read receipts (limit to last 500 for performance)
            const receiptsArray = Array.from(readReceipts.entries()).slice(-500);
            localStorage.setItem(STORAGE_KEY_RECEIPTS, JSON.stringify(receiptsArray));
            
            // Save settings
            localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(userSettings));
        } catch (error) {
            console.error('[ReadReceipts] Error saving to storage:', error);
        }
    }

    /**
     * Set up event listeners for messages
     */
    function setupEventListeners() {
        // Listen for new messages
        document.addEventListener('zantara:messageReceived', (event) => {
            const { messageId, role } = event.detail || {};
            
            // Don't track user's own messages
            if (role === 'user') return;
            
            // Mark as unread initially
            markAsUnread(messageId);
        });

        // Listen for scroll events to track visible messages
        const chatContainer = document.getElementById('chatMessages');
        if (chatContainer) {
            chatContainer.addEventListener('scroll', debounce(() => {
                checkVisibleMessages();
            }, 300));
        }

        // Listen for tab visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                checkVisibleMessages();
            }
        });
    }

    /**
     * Mark message as unread
     */
    function markAsUnread(messageId) {
        if (!messageId) return;
        
        readReceipts.set(messageId, {
            read: false,
            readAt: null,
            userId: getCurrentUserId()
        });
        
        updateReadIndicator(messageId);
    }

    /**
     * Mark message as read
     */
    function markAsRead(messageId) {
        if (!messageId || !userSettings.enabled) return;
        
        const receipt = readReceipts.get(messageId) || {};
        
        // Already marked as read
        if (receipt.read) return;
        
        // Update receipt
        readReceipts.set(messageId, {
            read: true,
            readAt: Date.now(),
            userId: getCurrentUserId()
        });
        
        // Update UI
        updateReadIndicator(messageId);
        
        // Save to storage
        saveToStorage();
        
        console.log(`[ReadReceipts] Marked message ${messageId} as read`);
    }

    /**
     * Update read indicator in UI
     */
    function updateReadIndicator(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (!messageElement) return;
        
        const receipt = readReceipts.get(messageId);
        if (!receipt) return;
        
        // Remove existing indicator
        const existingIndicator = messageElement.querySelector('.read-receipt-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        // Don't show indicators if user disabled it
        if (!userSettings.showReadStatus) return;
        
        // Create new indicator
        const indicator = document.createElement('div');
        indicator.className = `read-receipt-indicator ${receipt.read ? 'read' : 'unread'}`;
        
        if (receipt.read) {
            indicator.innerHTML = `
                <svg viewBox="0 0 16 16" width="14" height="14">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                    <path d="M6.5 10.293L13.146 3.646a.5.5 0 0 1 .708.708l-7 7a.5.5 0 0 1-.708 0l-.354-.354z" opacity="0.5"/>
                </svg>
            `;
            
            if (userSettings.showTimestamps && receipt.readAt) {
                const readTime = formatReadTime(receipt.readAt);
                indicator.title = `Read ${readTime}`;
            }
        } else {
            indicator.innerHTML = `
                <svg viewBox="0 0 16 16" width="14" height="14">
                    <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                </svg>
            `;
            indicator.title = 'Sent';
        }
        
        // Append to message
        const messageContent = messageElement.querySelector('.message-content') || messageElement;
        messageContent.appendChild(indicator);
    }

    /**
     * Format read time
     */
    function formatReadTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    }

    /**
     * Get current user ID (mock for demo)
     */
    function getCurrentUserId() {
        // In production, get from auth system
        return 'demo-user-' + (localStorage.getItem('zantara_user_id') || 'default');
    }

    /**
     * Observe visible messages using Intersection Observer
     */
    function observeVisibleMessages() {
        const observerOptions = {
            root: document.getElementById('chatMessages'),
            threshold: 0.5 // 50% visible
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const messageId = entry.target.dataset.messageId;
                    if (messageId) {
                        // Mark as read after 1 second of visibility
                        setTimeout(() => {
                            if (entry.target.getBoundingClientRect().top < window.innerHeight) {
                                markAsRead(messageId);
                            }
                        }, 1000);
                    }
                }
            });
        }, observerOptions);
        
        // Observe all AI messages
        const messages = document.querySelectorAll('[data-message-id]');
        messages.forEach(msg => observer.observe(msg));
        
        // Store observer for new messages
        window.readReceiptsObserver = observer;
    }

    /**
     * Check visible messages manually
     */
    function checkVisibleMessages() {
        const chatContainer = document.getElementById('chatMessages');
        if (!chatContainer) return;
        
        const messages = chatContainer.querySelectorAll('[data-message-id]');
        const containerRect = chatContainer.getBoundingClientRect();
        
        messages.forEach(msg => {
            const messageRect = msg.getBoundingClientRect();
            
            // Check if message is in viewport
            const isVisible = (
                messageRect.top >= containerRect.top &&
                messageRect.bottom <= containerRect.bottom
            ) || (
                messageRect.top < containerRect.top &&
                messageRect.bottom > containerRect.top
            ) || (
                messageRect.top < containerRect.bottom &&
                messageRect.bottom > containerRect.bottom
            );
            
            if (isVisible) {
                const messageId = msg.dataset.messageId;
                if (messageId) {
                    markAsRead(messageId);
                }
            }
        });
    }

    /**
     * Create settings panel for read receipts
     */
    function createSettingsPanel() {
        // Add settings to sidebar or create floating panel
        const settingsHTML = `
            <div class="read-receipt-settings" style="display:none;">
                <h3>Read Receipt Settings</h3>
                <label>
                    <input type="checkbox" id="readReceiptEnabled" ${userSettings.enabled ? 'checked' : ''}>
                    Send read receipts
                </label>
                <label>
                    <input type="checkbox" id="readReceiptShowStatus" ${userSettings.showReadStatus ? 'checked' : ''}>
                    Show read status on my messages
                </label>
                <label>
                    <input type="checkbox" id="readReceiptShowTimestamps" ${userSettings.showTimestamps ? 'checked' : ''}>
                    Show read timestamps
                </label>
            </div>
        `;
        
        // Inject into page (find appropriate container)
        const settingsContainer = document.querySelector('.settings-container') || document.body;
        settingsContainer.insertAdjacentHTML('beforeend', settingsHTML);
        
        // Bind event listeners
        document.getElementById('readReceiptEnabled')?.addEventListener('change', (e) => {
            userSettings.enabled = e.target.checked;
            saveToStorage();
        });
        
        document.getElementById('readReceiptShowStatus')?.addEventListener('change', (e) => {
            userSettings.showReadStatus = e.target.checked;
            saveToStorage();
            // Refresh all indicators
            readReceipts.forEach((_, messageId) => updateReadIndicator(messageId));
        });
        
        document.getElementById('readReceiptShowTimestamps')?.addEventListener('change', (e) => {
            userSettings.showTimestamps = e.target.checked;
            saveToStorage();
            // Refresh all indicators
            readReceipts.forEach((_, messageId) => updateReadIndicator(messageId));
        });
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
    window.ReadReceipts = {
        markAsRead,
        markAsUnread,
        getReceipt: (messageId) => readReceipts.get(messageId),
        getAllReceipts: () => Array.from(readReceipts.entries()),
        updateSettings: (newSettings) => {
            Object.assign(userSettings, newSettings);
            saveToStorage();
        },
        getSettings: () => ({ ...userSettings })
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
