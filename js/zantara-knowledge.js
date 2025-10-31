/**
 * ZANTARA Knowledge System Integration
 * 
 * Fetches and integrates comprehensive system knowledge for Zantara.
 * Provides complete project awareness and system status.
 */

class ZantaraKnowledge {
  constructor() {
    this.apiBase = 'https://nuzantara-backend.fly.dev';
    this.knowledge = null;
    this.systemPrompt = null;
    this.lastUpdated = null;
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get comprehensive system knowledge
   */
  async getKnowledge() {
    try {
      // Check cache first
      if (this.knowledge && this.lastUpdated && 
          (Date.now() - this.lastUpdated) < this.cacheTimeout) {
        console.log('[ZantaraKnowledge] Using cached knowledge');
        return this.knowledge;
      }

      console.log('[ZantaraKnowledge] Fetching fresh knowledge...');
      
      const response = await fetch(`${this.apiBase}/zantara/knowledge`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.ok && data.data) {
        this.knowledge = data.data;
        this.lastUpdated = Date.now();
        
        console.log('[ZantaraKnowledge] ✅ Knowledge updated');
        return this.knowledge;
      } else {
        throw new Error(data.error || 'Failed to fetch knowledge');
      }
      
    } catch (error) {
      console.error('[ZantaraKnowledge] ❌ Error:', error);
      
      // Return fallback knowledge
      return this.getFallbackKnowledge();
    }
  }

  /**
   * Get system prompt with knowledge injection
   */
  async getSystemPrompt() {
    try {
      console.log('[ZantaraKnowledge] Fetching system prompt...');
      
      const response = await fetch(`${this.apiBase}/zantara/system-prompt`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.ok && data.data) {
        this.systemPrompt = data.data.systemPrompt;
        console.log('[ZantaraKnowledge] ✅ System prompt updated');
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch system prompt');
      }
      
    } catch (error) {
      console.error('[ZantaraKnowledge] ❌ Error:', error);
      return this.getFallbackSystemPrompt();
    }
  }

  /**
   * Get system health status
   */
  async getSystemHealth() {
    try {
      console.log('[ZantaraKnowledge] Checking system health...');
      
      const response = await fetch(`${this.apiBase}/zantara/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.ok && data.data) {
        console.log('[ZantaraKnowledge] ✅ Health status retrieved');
        return data.data;
      } else {
        throw new Error(data.error || 'Failed to fetch health status');
      }
      
    } catch (error) {
      console.error('[ZantaraKnowledge] ❌ Error:', error);
      return { error: error.message };
    }
  }

  /**
   * Inject knowledge into chat context
   */
  async injectKnowledgeIntoChat() {
    try {
      const knowledge = await this.getKnowledge();
      const systemPrompt = await this.getSystemPrompt();
      
      // Store in global context for Zantara
      if (typeof window !== 'undefined') {
        window.ZANTARA_KNOWLEDGE = {
          knowledge,
          systemPrompt: systemPrompt.systemPrompt,
          health: await this.getSystemHealth(),
          lastUpdated: new Date().toISOString()
        };
        
        console.log('[ZantaraKnowledge] ✅ Knowledge injected into global context');
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('zantara-knowledge-loaded', {
          detail: { knowledge, systemPrompt }
        }));
      }
      
      return { knowledge, systemPrompt };
      
    } catch (error) {
      console.error('[ZantaraKnowledge] ❌ Injection error:', error);
      return null;
    }
  }

  /**
   * Get fallback knowledge when API is unavailable
   */
  getFallbackKnowledge() {
    return {
      project: {
        name: "NUZANTARA-RAILWAY",
        version: "5.2.0",
        architecture: "Microservices with Fly.io deployment"
      },
      backends: {
        rag: {
          url: "https://nuzantara-rag.fly.dev",
          type: "Python/FastAPI"
        },
        ts: {
          url: "https://nuzantara-backend.fly.dev",
          type: "TypeScript/Express"
        }
      },
      status: {
        phase1: { completed: true },
        phase2: { completed: true },
        phase3: { inProgress: true }
      }
    };
  }

  /**
   * Get fallback system prompt
   */
  getFallbackSystemPrompt() {
    return {
      systemPrompt: `# ZANTARA - NUZANTARA-RAILWAY System

You are ZANTARA, the intelligent AI assistant for the NUZANTARA-RAILWAY project.

## PROJECT OVERVIEW
- **Name**: NUZANTARA-RAILWAY
- **Version**: 5.2.0
- **Architecture**: Microservices with Fly.io deployment

## BACKEND SERVICES
- **RAG Backend**: Python/FastAPI for RAG queries and Bali Zero chat
- **TypeScript Backend**: Express for AI chat, team management, JWT auth

## CURRENT STATUS
- **Phase 1**: ✅ Completed - API unification, Enter key fix
- **Phase 2**: ✅ Completed - JWT authentication, intelligent routing
- **Phase 3**: 🔄 In Progress - Knowledge system implementation

You have knowledge of the system architecture and can help users with any aspect of the platform.`,
      knowledge: this.getFallbackKnowledge(),
      health: { error: "API unavailable" }
    };
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.knowledge = null;
    this.systemPrompt = null;
    this.lastUpdated = null;
    console.log('[ZantaraKnowledge] Cache cleared');
  }
}

// Create global instance
const zantaraKnowledge = new ZantaraKnowledge();

// Auto-inject knowledge on page load
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      zantaraKnowledge.injectKnowledgeIntoChat();
    });
  } else {
    zantaraKnowledge.injectKnowledgeIntoChat();
  }
}

// Export for global use
if (typeof window !== 'undefined') {
  window.ZantaraKnowledge = zantaraKnowledge;
}

export default zantaraKnowledge;
