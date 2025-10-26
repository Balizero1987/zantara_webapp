/**
 * Notifications Module - Enhancement 18
 * Browser notifications and sound alerts for AI responses
 * Features: Desktop notifications, sound alerts, permission management, DND mode
 */

(function() {
    'use strict';

    // Notification State
    const notificationSettings = {
        enabled: true,
        soundEnabled: true,
        desktopEnabled: true,
        dndMode: false, // Do Not Disturb
        dndStart: '22:00', // 10 PM
        dndEnd: '08:00', // 8 AM
        soundVolume: 0.5
    };

    // Sound URLs (can be replaced with custom sounds)
    const SOUNDS = {
        message: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSl+zPDTjTkJHGm98OScTgwPUKnn77RgGwU7k9n0yXYpBS59z/DajDsKI3HJ8OGdSwwPU6vo875gGgU/ldv0xXMmBSyBzvLbjTkJHmm98OWdSwsPUKvn77RgGwU7k9nzyXYpBS5+z/DVjDkJHmq98OWdSwwPU6vo775hGgU/ldv0xXMmBSyBzvLbjTkJHmq98OadSwsPU6vo775hGgU/ldvzxXMmBSyBzvLbjTkJH2q98Oadswsvn9XbxHQoBSx/z/LbjjkJH2u98OadSwwPU6vo775gGgVAldvzw3ImBSyBz/LajjkJH2y+8OWdSwwNUqvn77JgGgU/ldvyw3ImBSyBz/LajjkJH2y+8OWdSwwNU6vn77JgGgU/ldvyw3ImBSyCz/LajjkJIGy+8OWdSwwNU6vn77JgGgU/ldvyw3ImBSyCz/LajjkJIGy+8OSdSwwNU6vn77JgGgU/ldvyw3ImBSyCz/LajjkJIGy+8OSdSwwNU6vn77JgGgU/ldvyw3ImBSyCz/LajjkJIGy+8OSdSwwNU6vn77JgGgU/ldvyw3ImBSyCz/LajjkJIGy+8OSdSwwNU6vn77JgGgU/ldvyw3ImBSyCz/LajjkJIGy+8OSdSwwNU6vn77JgGgU/ldvyw3ImBSyCz/LajjkJIGy+8OSdSwwNU6vn77JgGgU/ldvyw3ImBSyCz/LajjkJIGy+8OSdSwwNU6vn77JgGgU/ldvyw3ImBSyCz/LajjkJIGy+8OSdSwwNU6vn77JgGgU=',
        success: 'data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQBAADAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA='
    };

    // Audio elements
    let audioElements = {};

    /**
     * Initialize Notifications system
     */
    function initialize() {
        console.log('[Notifications] Initializing...');
        
        // Load settings from storage
        loadSettings();
        
        // Request notification permission
        requestPermission();
        
        // Set up event listeners
        setupEventListeners();
        
        // Create settings panel
        createSettingsPanel();
        
        // Initialize audio
        initializeAudio();
        
        console.log('[Notifications] Initialized successfully');
    }

    /**
     * Load settings from localStorage
     */
    function loadSettings() {
        try {
            const saved = localStorage.getItem('zantara_notification_settings');
            if (saved) {
                Object.assign(notificationSettings, JSON.parse(saved));
                console.log('[Notifications] Loaded settings:', notificationSettings);
            }
        } catch (error) {
            console.error('[Notifications] Error loading settings:', error);
        }
    }

    /**
     * Save settings to localStorage
     */
    function saveSettings() {
        try {
            localStorage.setItem('zantara_notification_settings', JSON.stringify(notificationSettings));
        } catch (error) {
            console.error('[Notifications] Error saving settings:', error);
        }
    }

    /**
     * Request notification permission
     */
    function requestPermission() {
        if (!('Notification' in window)) {
            console.warn('[Notifications] Browser does not support notifications');
            notificationSettings.desktopEnabled = false;
            return;
        }
        
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('[Notifications] Permission:', permission);
                if (permission !== 'granted') {
                    notificationSettings.desktopEnabled = false;
                }
            });
        } else if (Notification.permission === 'denied') {
            console.warn('[Notifications] Permission denied');
            notificationSettings.desktopEnabled = false;
        }
    }

    /**
     * Set up event listeners
     */
    function setupEventListeners() {
        // Listen for new AI messages
        document.addEventListener('zantara:messageReceived', (event) => {
            const { role, content } = event.detail || {};
            
            // Only notify for AI messages
            if (role !== 'assistant') return;
            
            // Don't notify if page is visible
            if (!document.hidden && notificationSettings.desktopEnabled) return;
            
            // Check if in DND mode
            if (isDNDActive()) {
                console.log('[Notifications] DND mode active, skipping notification');
                return;
            }
            
            // Show notification
            showNotification('New message from Zantara AI', {
                body: truncateText(content, 100),
                icon: '/favicon.ico',
                tag: 'zantara-message'
            });
            
            // Play sound
            if (notificationSettings.soundEnabled) {
                playSound('message');
            }
        });
    }

    /**
     * Check if DND mode is active
     */
    function isDNDActive() {
        if (!notificationSettings.dndMode) return false;
        
        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const start = notificationSettings.dndStart;
        const end = notificationSettings.dndEnd;
        
        // Handle overnight DND (e.g., 22:00 - 08:00)
        if (start > end) {
            return currentTime >= start || currentTime < end;
        }
        
        // Handle same-day DND (e.g., 12:00 - 14:00)
        return currentTime >= start && currentTime < end;
    }

    /**
     * Show desktop notification
     */
    function showNotification(title, options = {}) {
        if (!notificationSettings.enabled || !notificationSettings.desktopEnabled) {
            return;
        }
        
        if (!('Notification' in window) || Notification.permission !== 'granted') {
            console.warn('[Notifications] Cannot show notification - permission not granted');
            return;
        }
        
        try {
            const notification = new Notification(title, {
                badge: '/favicon.ico',
                ...options
            });
            
            // Auto-close after 5 seconds
            setTimeout(() => notification.close(), 5000);
            
            // Handle click
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            
            console.log('[Notifications] Notification shown:', title);
        } catch (error) {
            console.error('[Notifications] Error showing notification:', error);
        }
    }

    /**
     * Initialize audio elements
     */
    function initializeAudio() {
        Object.keys(SOUNDS).forEach(key => {
            const audio = new Audio(SOUNDS[key]);
            audio.volume = notificationSettings.soundVolume;
            audioElements[key] = audio;
        });
    }

    /**
     * Play notification sound
     */
    function playSound(soundKey) {
        if (!notificationSettings.soundEnabled) return;
        
        const audio = audioElements[soundKey];
        if (audio) {
            audio.currentTime = 0;
            audio.volume = notificationSettings.soundVolume;
            audio.play().catch(error => {
                console.warn('[Notifications] Error playing sound:', error);
            });
        }
    }

    /**
     * Create settings panel
     */
    function createSettingsPanel() {
        const settingsHTML = `
            <div class="notification-settings" style="display:none;">
                <h3>Notification Settings</h3>
                <label>
                    <input type="checkbox" id="notificationEnabled" ${notificationSettings.enabled ? 'checked' : ''}>
                    Enable notifications
                </label>
                <label>
                    <input type="checkbox" id="notificationSound" ${notificationSettings.soundEnabled ? 'checked' : ''}>
                    Sound alerts
                </label>
                <label>
                    <input type="range" id="notificationVolume" min="0" max="1" step="0.1" value="${notificationSettings.soundVolume}">
                    Volume: <span id="volumeValue">${Math.round(notificationSettings.soundVolume * 100)}%</span>
                </label>
                <label>
                    <input type="checkbox" id="notificationDesktop" ${notificationSettings.desktopEnabled ? 'checked' : ''}>
                    Desktop notifications
                </label>
                <label>
                    <input type="checkbox" id="notificationDND" ${notificationSettings.dndMode ? 'checked' : ''}>
                    Do Not Disturb mode
                </label>
                <div id="dndSchedule" style="display:${notificationSettings.dndMode ? 'block' : 'none'};">
                    <label>
                        Start: <input type="time" id="dndStart" value="${notificationSettings.dndStart}">
                    </label>
                    <label>
                        End: <input type="time" id="dndEnd" value="${notificationSettings.dndEnd}">
                    </label>
                </div>
            </div>
        `;
        
        const settingsContainer = document.querySelector('.settings-container') || document.body;
        settingsContainer.insertAdjacentHTML('beforeend', settingsHTML);
        
        // Bind event listeners
        bindSettingsEvents();
    }

    /**
     * Bind settings event listeners
     */
    function bindSettingsEvents() {
        document.getElementById('notificationEnabled')?.addEventListener('change', (e) => {
            notificationSettings.enabled = e.target.checked;
            saveSettings();
        });
        
        document.getElementById('notificationSound')?.addEventListener('change', (e) => {
            notificationSettings.soundEnabled = e.target.checked;
            saveSettings();
            if (e.target.checked) playSound('message');
        });
        
        document.getElementById('notificationVolume')?.addEventListener('input', (e) => {
            notificationSettings.soundVolume = parseFloat(e.target.value);
            document.getElementById('volumeValue').textContent = Math.round(notificationSettings.soundVolume * 100) + '%';
            Object.values(audioElements).forEach(audio => audio.volume = notificationSettings.soundVolume);
            saveSettings();
        });
        
        document.getElementById('notificationDesktop')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                requestPermission();
            } else {
                notificationSettings.desktopEnabled = false;
                saveSettings();
            }
        });
        
        document.getElementById('notificationDND')?.addEventListener('change', (e) => {
            notificationSettings.dndMode = e.target.checked;
            document.getElementById('dndSchedule').style.display = e.target.checked ? 'block' : 'none';
            saveSettings();
        });
        
        document.getElementById('dndStart')?.addEventListener('change', (e) => {
            notificationSettings.dndStart = e.target.value;
            saveSettings();
        });
        
        document.getElementById('dndEnd')?.addEventListener('change', (e) => {
            notificationSettings.dndEnd = e.target.value;
            saveSettings();
        });
    }

    /**
     * Truncate text helper
     */
    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    /**
     * Public API
     */
    window.NotificationManager = {
        show: showNotification,
        playSound,
        updateSettings: (newSettings) => {
            Object.assign(notificationSettings, newSettings);
            saveSettings();
        },
        getSettings: () => ({ ...notificationSettings }),
        requestPermission
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();
