/**
 * Smart Notifications System
 * Enhancement #22 for NUZANTARA-RAILWAY
 * Implements an intelligent notification system that prioritizes and delivers relevant notifications
 */

class SmartNotifications {
  constructor() {
    this.notifications = [];
    this.notificationPreferences = {
      enabled: true,
      sound: true,
      desktop: true,
      priorityThreshold: 'medium' // low, medium, high, critical
    };
    this.maxNotifications = 50;
  }

  /**
   * Initialize the notifications system
   */
  initialize() {
    // Load preferences from localStorage
    this.loadPreferences();
    
    // Request notification permission if needed
    this.requestNotificationPermission();
    
    // Set up periodic cleanup
    setInterval(() => {
      this.cleanupOldNotifications();
    }, 300000); // Every 5 minutes
    
    console.log('[SmartNotifications] System initialized');
  }

  /**
   * Load notification preferences from localStorage
   */
  loadPreferences() {
    try {
      const savedPreferences = localStorage.getItem('zantara-notification-preferences');
      if (savedPreferences) {
        this.notificationPreferences = {
          ...this.notificationPreferences,
          ...JSON.parse(savedPreferences)
        };
      }
    } catch (error) {
      console.error('[SmartNotifications] Error loading preferences:', error);
    }
  }

  /**
   * Save notification preferences to localStorage
   */
  savePreferences() {
    try {
      localStorage.setItem('zantara-notification-preferences', 
        JSON.stringify(this.notificationPreferences));
    } catch (error) {
      console.error('[SmartNotifications] Error saving preferences:', error);
    }
  }

  /**
   * Request notification permission from user
   */
  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('[SmartNotifications] This browser does not support desktop notification');
      return;
    }
    
    if (Notification.permission === 'granted') {
      console.log('[SmartNotifications] Notification permission already granted');
      return;
    }
    
    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        console.log(`[SmartNotifications] Notification permission ${permission}`);
      } catch (error) {
        console.error('[SmartNotifications] Error requesting notification permission:', error);
      }
    }
  }

  /**
   * Show a notification
   */
  showNotification(title, options = {}) {
    // Check if notifications are enabled
    if (!this.notificationPreferences.enabled) {
      console.log('[SmartNotifications] Notifications are disabled');
      return;
    }
    
    // Check priority threshold
    const priority = options.priority || 'medium';
    if (!this.meetsPriorityThreshold(priority)) {
      console.log(`[SmartNotifications] Notification below priority threshold: ${priority}`);
      return;
    }
    
    // Create notification object
    const notification = {
      id: this.generateId(),
      title,
      ...options,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Add to notifications list
    this.notifications.unshift(notification);
    
    // Limit notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications.pop();
    }
    
    // Show desktop notification if enabled
    if (this.notificationPreferences.desktop && Notification.permission === 'granted') {
      this.showDesktopNotification(notification);
    }
    
    // Play sound if enabled
    if (this.notificationPreferences.sound) {
      this.playNotificationSound(priority);
    }
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('notification-received', {
      detail: notification
    }));
    
    console.log(`[SmartNotifications] Notification shown: ${title}`);
    return notification.id;
  }

  /**
   * Show desktop notification
   */
  showDesktopNotification(notification) {
    try {
      const desktopNotification = new Notification(notification.title, {
        body: notification.body || '',
        icon: notification.icon || '/public/images/zantara-logo.jpeg',
        timestamp: new Date(notification.timestamp).getTime()
      });
      
      // Handle click event
      desktopNotification.onclick = () => {
        window.focus();
        this.markAsRead(notification.id);
        
        // Dispatch event for application-specific handling
        window.dispatchEvent(new CustomEvent('notification-clicked', {
          detail: notification
        }));
      };
      
      // Auto-close after 10 seconds
      setTimeout(() => {
        desktopNotification.close();
      }, 10000);
      
    } catch (error) {
      console.error('[SmartNotifications] Error showing desktop notification:', error);
    }
  }

  /**
   * Play notification sound based on priority
   */
  playNotificationSound(priority) {
    try {
      // In a real implementation, you would play different sounds based on priority
      // For now, we'll just log the action
      console.log(`[SmartNotifications] Playing ${priority} priority sound`);
    } catch (error) {
      console.error('[SmartNotifications] Error playing notification sound:', error);
    }
  }

  /**
   * Check if notification meets priority threshold
   */
  meetsPriorityThreshold(priority) {
    const priorityLevels = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };
    
    const threshold = priorityLevels[this.notificationPreferences.priorityThreshold] || 2;
    const notificationLevel = priorityLevels[priority] || 2;
    
    return notificationLevel >= threshold;
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      console.log(`[SmartNotifications] Marked notification ${notificationId} as read`);
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('notification-read', {
        detail: notification
      }));
    }
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    
    console.log('[SmartNotifications] Marked all notifications as read');
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('all-notifications-read'));
  }

  /**
   * Remove notification
   */
  removeNotification(notificationId) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      console.log(`[SmartNotifications] Removed notification ${notificationId}`);
      return true;
    }
    return false;
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * Get notifications by priority
   */
  getNotificationsByPriority(priority) {
    return this.notifications.filter(n => n.priority === priority);
  }

  /**
   * Get recent notifications
   */
  getRecentNotifications(limit = 10) {
    return this.notifications.slice(0, limit);
  }

  /**
   * Get unread notifications
   */
  getUnreadNotifications() {
    return this.notifications.filter(n => !n.read);
  }

  /**
   * Cleanup old notifications (older than 7 days)
   */
  cleanupOldNotifications() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const initialLength = this.notifications.length;
    
    this.notifications = this.notifications.filter(notification => {
      const notificationDate = new Date(notification.timestamp);
      return notificationDate > weekAgo;
    });
    
    const removedCount = initialLength - this.notifications.length;
    if (removedCount > 0) {
      console.log(`[SmartNotifications] Cleaned up ${removedCount} old notifications`);
    }
  }

  /**
   * Update notification preferences
   */
  updatePreferences(newPreferences) {
    this.notificationPreferences = {
      ...this.notificationPreferences,
      ...newPreferences
    };
    
    this.savePreferences();
    console.log('[SmartNotifications] Updated preferences:', this.notificationPreferences);
  }

  /**
   * Generate unique ID for notifications
   */
  generateId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Create system notification for handler execution
   */
  createHandlerNotification(handlerName, status, details = {}) {
    const titles = {
      success: `✅ Handler Executed: ${handlerName}`,
      error: `❌ Handler Failed: ${handlerName}`,
      warning: `⚠️ Handler Warning: ${handlerName}`,
      info: `ℹ️ Handler Update: ${handlerName}`
    };
    
    const priorities = {
      success: 'medium',
      error: 'high',
      warning: 'medium',
      info: 'low'
    };
    
    const notificationOptions = {
      body: details.message || `Handler ${handlerName} completed with status: ${status}`,
      priority: priorities[status] || 'medium',
      category: 'handler',
      handler: handlerName,
      status: status,
      ...details
    };
    
    return this.showNotification(titles[status], notificationOptions);
  }

  /**
   * Create system notification for system events
   */
  createSystemNotification(eventType, message, priority = 'medium') {
    const titles = {
      startup: '🚀 System Started',
      shutdown: '🌙 System Shutting Down',
      error: '❌ System Error',
      warning: '⚠️ System Warning',
      update: '⬆️ System Update',
      maintenance: '🛠️ Maintenance Mode'
    };
    
    const notificationOptions = {
      body: message,
      priority: priority,
      category: 'system',
      eventType: eventType
    };
    
    return this.showNotification(titles[eventType] || eventType, notificationOptions);
  }

  /**
   * Get notification statistics
   */
  getStatistics() {
    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    this.notifications.forEach(notification => {
      priorityCounts[notification.priority] = (priorityCounts[notification.priority] || 0) + 1;
    });
    
    return {
      total: this.notifications.length,
      unread: this.getUnreadCount(),
      priorities: priorityCounts,
      preferences: this.notificationPreferences
    };
  }
}

// Initialize smart notifications system
document.addEventListener('DOMContentLoaded', () => {
  window.SmartNotifications = new SmartNotifications();
  window.SmartNotifications.initialize();
  
  console.log('[SmartNotifications] System ready');
  
  // Mark enhancement as completed
  if (window.enhancementTracker) {
    window.enhancementTracker.markCompleted(22);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SmartNotifications;
}