/**
 * Export/Import Functionality System
 * Enhancement #24 for NUZANTARA-RAILWAY
 * Implements comprehensive export and import capabilities for conversations, settings, and data
 */

class ExportImport {
  constructor() {
    this.exportableComponents = new Map();
    this.importValidators = new Map();
  }

  /**
   * Initialize the export/import system
   */
  initialize() {
    // Register default exportable components
    this.registerDefaultComponents();
    
    console.log('[ExportImport] System initialized');
  }

  /**
   * Register default components that can be exported/imported
   */
  registerDefaultComponents() {
    // Register conversation history
    this.registerExportableComponent('conversations', {
      name: 'Conversation History',
      description: 'Chat conversations and message history',
      exporter: this.exportConversations.bind(this),
      importer: this.importConversations.bind(this),
      validator: this.validateConversationsImport.bind(this)
    });

    // Register user preferences
    this.registerExportableComponent('preferences', {
      name: 'User Preferences',
      description: 'Dashboard layout, notification settings, and UI preferences',
      exporter: this.exportPreferences.bind(this),
      importer: this.importPreferences.bind(this),
      validator: this.validatePreferencesImport.bind(this)
    });

    // Register handler data
    this.registerExportableComponent('handlers', {
      name: 'Handler Data',
      description: 'Custom handler configurations and settings',
      exporter: this.exportHandlers.bind(this),
      importer: this.importHandlers.bind(this),
      validator: this.validateHandlersImport.bind(this)
    });

    // Register tags and categories
    this.registerExportableComponent('tags', {
      name: 'Tags and Categories',
      description: 'Custom tags, categories, and labeling systems',
      exporter: this.exportTags.bind(this),
      importer: this.importTags.bind(this),
      validator: this.validateTagsImport.bind(this)
    });
  }

  /**
   * Register a component that can be exported/imported
   */
  registerExportableComponent(componentId, componentDefinition) {
    this.exportableComponents.set(componentId, componentDefinition);
    console.log(`[ExportImport] Registered exportable component: ${componentId}`);
  }

  /**
   * Register an import validator
   */
  registerImportValidator(componentId, validatorFunction) {
    this.importValidators.set(componentId, validatorFunction);
    console.log(`[ExportImport] Registered import validator: ${componentId}`);
  }

  /**
   * Export data to JSON format
   */
  async exportData(componentIds = [], options = {}) {
    try {
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        components: {}
      };

      // Determine which components to export
      const componentsToExport = componentIds.length > 0 
        ? componentIds 
        : [...this.exportableComponents.keys()];

      // Export each component
      for (const componentId of componentsToExport) {
        const component = this.exportableComponents.get(componentId);
        if (component) {
          console.log(`[ExportImport] Exporting ${componentId}...`);
          exportData.components[componentId] = await component.exporter(options);
        }
      }

      // Create export object
      const exportObject = {
        metadata: {
          version: exportData.version,
          timestamp: exportData.timestamp,
          componentCount: Object.keys(exportData.components).length,
          components: componentsToExport
        },
        data: exportData.components
      };

      console.log('[ExportImport] Data export completed');
      return exportObject;
    } catch (error) {
      console.error('[ExportImport] Error during export:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Import data from JSON format
   */
  async importData(importData, options = {}) {
    try {
      // Validate import data structure
      if (!this.validateImportStructure(importData)) {
        throw new Error('Invalid import data structure');
      }

      const results = {
        success: [],
        errors: []
      };

      // Import each component
      for (const [componentId, componentData] of Object.entries(importData.data)) {
        const component = this.exportableComponents.get(componentId);
        if (component) {
          try {
            console.log(`[ExportImport] Importing ${componentId}...`);
            
            // Validate component data
            if (component.validator && !component.validator(componentData)) {
              throw new Error(`Validation failed for ${componentId}`);
            }

            // Import component data
            await component.importer(componentData, options);
            results.success.push(componentId);
          } catch (error) {
            console.error(`[ExportImport] Error importing ${componentId}:`, error);
            results.errors.push({
              component: componentId,
              error: error.message
            });
          }
        }
      }

      console.log('[ExportImport] Data import completed');
      return results;
    } catch (error) {
      console.error('[ExportImport] Error during import:', error);
      throw new Error(`Import failed: ${error.message}`);
    }
  }

  /**
   * Validate import data structure
   */
  validateImportStructure(importData) {
    return importData && 
           importData.metadata && 
           importData.data && 
           typeof importData.metadata === 'object' && 
           typeof importData.data === 'object';
  }

  /**
   * Export conversations
   */
  async exportConversations(options) {
    // Use conversation history system if available
    if (window.ConversationHistory) {
      return {
        history: window.ConversationHistory.history,
        starred: [...window.ConversationHistory.starredConversations],
        tags: Object.fromEntries(window.ConversationHistory.tags)
      };
    }
    
    // Fallback to localStorage
    return {
      history: JSON.parse(localStorage.getItem('zantara-conversation-history') || '[]'),
      starred: JSON.parse(localStorage.getItem('zantara-starred-conversations') || '[]'),
      tags: JSON.parse(localStorage.getItem('zantara-conversation-tags') || '{}')
    };
  }

  /**
   * Import conversations
   */
  async importConversations(conversationData, options) {
    // Use conversation history system if available
    if (window.ConversationHistory) {
      // Clear existing data if requested
      if (options.clearExisting) {
        window.ConversationHistory.history = [];
        window.ConversationHistory.starredConversations = new Set();
        window.ConversationHistory.tags = new Map();
      }

      // Import data
      if (conversationData.history) {
        window.ConversationHistory.history = conversationData.history;
      }
      
      if (conversationData.starred) {
        window.ConversationHistory.starredConversations = new Set(conversationData.starred);
      }
      
      if (conversationData.tags) {
        window.ConversationHistory.tags = new Map(Object.entries(conversationData.tags));
      }
      
      // Save to localStorage
      window.ConversationHistory.saveHistory();
      return true;
    }
    
    // Fallback to localStorage
    if (conversationData.history) {
      localStorage.setItem('zantara-conversation-history', JSON.stringify(conversationData.history));
    }
    
    if (conversationData.starred) {
      localStorage.setItem('zantara-starred-conversations', JSON.stringify(conversationData.starred));
    }
    
    if (conversationData.tags) {
      localStorage.setItem('zantara-conversation-tags', JSON.stringify(conversationData.tags));
    }
    
    return true;
  }

  /**
   * Validate conversations import data
   */
  validateConversationsImport(conversationData) {
    return conversationData && 
           typeof conversationData === 'object' &&
           (conversationData.history === undefined || Array.isArray(conversationData.history)) &&
           (conversationData.starred === undefined || Array.isArray(conversationData.starred));
  }

  /**
   * Export user preferences
   */
  async exportPreferences(options) {
    return {
      dashboard: JSON.parse(localStorage.getItem('zantara-dashboard-preferences') || '{}'),
      notifications: JSON.parse(localStorage.getItem('zantara-notification-preferences') || '{}'),
      dashboardLayout: JSON.parse(localStorage.getItem('zantara-dashboard-layout') || '[]'),
      theme: localStorage.getItem('zantara-theme') || 'light'
    };
  }

  /**
   * Import user preferences
   */
  async importPreferences(preferenceData, options) {
    // Clear existing data if requested
    if (options.clearExisting) {
      localStorage.removeItem('zantara-dashboard-preferences');
      localStorage.removeItem('zantara-notification-preferences');
      localStorage.removeItem('zantara-dashboard-layout');
      localStorage.removeItem('zantara-theme');
    }

    // Import data
    if (preferenceData.dashboard) {
      localStorage.setItem('zantara-dashboard-preferences', JSON.stringify(preferenceData.dashboard));
    }
    
    if (preferenceData.notifications) {
      localStorage.setItem('zantara-notification-preferences', JSON.stringify(preferenceData.notifications));
    }
    
    if (preferenceData.dashboardLayout) {
      localStorage.setItem('zantara-dashboard-layout', JSON.stringify(preferenceData.dashboardLayout));
    }
    
    if (preferenceData.theme) {
      localStorage.setItem('zantara-theme', preferenceData.theme);
    }
    
    // Notify system of preference changes
    window.dispatchEvent(new CustomEvent('preferences-imported', {
      detail: preferenceData
    }));
    
    return true;
  }

  /**
   * Validate preferences import data
   */
  validatePreferencesImport(preferenceData) {
    return preferenceData && typeof preferenceData === 'object';
  }

  /**
   * Export handler data
   */
  async exportHandlers(options) {
    // If HandlerDiscovery is available, export handler configurations
    if (window.HandlerDiscovery) {
      return {
        handlers: window.HandlerDiscovery.handlers,
        categories: window.HandlerDiscovery.categories
      };
    }
    
    // Return empty data if no handlers system available
    return {
      handlers: [],
      categories: []
    };
  }

  /**
   * Import handler data
   */
  async importHandlers(handlerData, options) {
    // Handler data is typically read-only, so we just notify about the import
    window.dispatchEvent(new CustomEvent('handlers-imported', {
      detail: handlerData
    }));
    
    return true;
  }

  /**
   * Validate handlers import data
   */
  validateHandlersImport(handlerData) {
    return handlerData && 
           typeof handlerData === 'object' &&
           Array.isArray(handlerData.handlers !== undefined ? handlerData.handlers : []) &&
           Array.isArray(handlerData.categories !== undefined ? handlerData.categories : []);
  }

  /**
   * Export tags and categories
   */
  async exportTags(options) {
    // Export tags from conversation history system
    if (window.ConversationHistory) {
      const tagsData = {};
      for (const [conversationId, tags] of window.ConversationHistory.tags) {
        tagsData[conversationId] = [...tags];
      }
      return {
        tags: tagsData
      };
    }
    
    // Fallback to localStorage
    return {
      tags: JSON.parse(localStorage.getItem('zantara-conversation-tags') || '{}')
    };
  }

  /**
   * Import tags and categories
   */
  async importTags(tagsData, options) {
    // Import tags to conversation history system
    if (window.ConversationHistory) {
      if (options.clearExisting) {
        window.ConversationHistory.tags = new Map();
      }
      
      if (tagsData.tags) {
        for (const [conversationId, tags] of Object.entries(tagsData.tags)) {
          window.ConversationHistory.tags.set(conversationId, new Set(tags));
        }
      }
      
      window.ConversationHistory.saveHistory();
      return true;
    }
    
    // Fallback to localStorage
    if (tagsData.tags) {
      localStorage.setItem('zantara-conversation-tags', JSON.stringify(tagsData.tags));
    }
    
    return true;
  }

  /**
   * Validate tags import data
   */
  validateTagsImport(tagsData) {
    return tagsData && 
           typeof tagsData === 'object' &&
           tagsData.tags !== undefined;
  }

  /**
   * Create a downloadable JSON file
   */
  createDownloadFile(data, filename = 'zantara-export.json') {
    try {
      const jsonData = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log(`[ExportImport] File downloaded: ${filename}`);
      return true;
    } catch (error) {
      console.error('[ExportImport] Error creating download file:', error);
      return false;
    }
  }

  /**
   * Read uploaded JSON file
   */
  readUploadFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid JSON file'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      reader.readAsText(file);
    });
  }

  /**
   * Get exportable components list
   */
  getExportableComponents() {
    const components = [];
    for (const [id, definition] of this.exportableComponents) {
      components.push({
        id,
        name: definition.name,
        description: definition.description
      });
    }
    return components;
  }

  /**
   * Get export statistics
   */
  getStatistics() {
    return {
      exportableComponents: this.exportableComponents.size,
      registeredValidators: this.importValidators.size
    };
  }
}

// Initialize export/import system
document.addEventListener('DOMContentLoaded', () => {
  window.ExportImport = new ExportImport();
  window.ExportImport.initialize();
  
  console.log('[ExportImport] System ready');
  
  // Mark enhancement as completed
  if (window.enhancementTracker) {
    window.enhancementTracker.markCompleted(24);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ExportImport;
}