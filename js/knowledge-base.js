/**
 * Knowledge Base Integration
 * Enhancement #27 for NUZANTARA-RAILWAY
 * Implements comprehensive knowledge base integration and management
 */

class KnowledgeBase {
  constructor() {
    this.articles = new Map();
    this.categories = new Map();
    this.searchIndex = [];
    this.favorites = new Set();
    this.recentlyViewed = [];
    this.maxRecentlyViewed = 20;
  }

  /**
   * Initialize the knowledge base system
   */
  async initialize() {
    // Load knowledge base data
    this.loadKnowledgeBase();
    
    // Build search index
    this.buildSearchIndex();
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('[KnowledgeBase] System initialized');
  }

  /**
   * Load knowledge base from localStorage or API
   */
  loadKnowledgeBase() {
    try {
      // Load articles
      const savedArticles = localStorage.getItem('zantara-kb-articles');
      if (savedArticles) {
        const articles = JSON.parse(savedArticles);
        articles.forEach(article => {
          this.articles.set(article.id, article);
        });
      } else {
        // Add default articles if none exist
        this.addDefaultArticles();
      }
      
      // Load categories
      const savedCategories = localStorage.getItem('zantara-kb-categories');
      if (savedCategories) {
        const categories = JSON.parse(savedCategories);
        categories.forEach(category => {
          this.categories.set(category.id, category);
        });
      } else {
        // Add default categories if none exist
        this.addDefaultCategories();
      }
      
      // Load favorites
      const savedFavorites = localStorage.getItem('zantara-kb-favorites');
      if (savedFavorites) {
        this.favorites = new Set(JSON.parse(savedFavorites));
      }
      
      // Load recently viewed
      const savedRecentlyViewed = localStorage.getItem('zantara-kb-recently-viewed');
      if (savedRecentlyViewed) {
        this.recentlyViewed = JSON.parse(savedRecentlyViewed);
      }
      
      console.log('[KnowledgeBase] Knowledge base loaded');
    } catch (error) {
      console.error('[KnowledgeBase] Error loading knowledge base:', error);
    }
  }

  /**
   * Save knowledge base to localStorage
   */
  saveKnowledgeBase() {
    try {
      // Save articles
      const articlesArray = Array.from(this.articles.values());
      localStorage.setItem('zantara-kb-articles', JSON.stringify(articlesArray));
      
      // Save categories
      const categoriesArray = Array.from(this.categories.values());
      localStorage.setItem('zantara-kb-categories', JSON.stringify(categoriesArray));
      
      // Save favorites
      localStorage.setItem('zantara-kb-favorites', JSON.stringify([...this.favorites]));
      
      // Save recently viewed
      localStorage.setItem('zantara-kb-recently-viewed', JSON.stringify(this.recentlyViewed));
      
    } catch (error) {
      console.error('[KnowledgeBase] Error saving knowledge base:', error);
    }
  }

  /**
   * Add default categories
   */
  addDefaultCategories() {
    const defaultCategories = [
      {
        id: 'cat_1',
        name: 'Getting Started',
        description: 'Basic guides and tutorials',
        icon: '🚀',
        color: '#667eea'
      },
      {
        id: 'cat_2',
        name: 'Handlers',
        description: 'Information about system handlers',
        icon: '⚙️',
        color: '#764ba2'
      },
      {
        id: 'cat_3',
        name: 'AI Features',
        description: 'AI capabilities and usage',
        icon: '🤖',
        color: '#f093fb'
      },
      {
        id: 'cat_4',
        name: 'Troubleshooting',
        description: 'Common issues and solutions',
        icon: '🔧',
        color: '#f6d365'
      },
      {
        id: 'cat_5',
        name: 'Best Practices',
        description: 'Recommended approaches and patterns',
        icon: '⭐',
        color: '#a8edea'
      }
    ];
    
    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });
    
    this.saveKnowledgeBase();
  }

  /**
   * Add default articles
   */
  addDefaultArticles() {
    const defaultArticles = [
      {
        id: 'art_1',
        title: 'Introduction to NUZANTARA-RAILWAY',
        content: 'NUZANTARA-RAILWAY is a production-ready AI platform for Indonesian business services...',
        summary: 'Overview of the NUZANTARA-RAILWAY platform',
        categoryId: 'cat_1',
        tags: ['introduction', 'overview', 'platform'],
        author: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        helpful: 0,
        notHelpful: 0
      },
      {
        id: 'art_2',
        title: 'Getting Started with Handlers',
        content: 'Handlers are the core components of the NUZANTARA system that execute specific functions...',
        summary: 'Guide to understanding and using handlers',
        categoryId: 'cat_1',
        tags: ['handlers', 'getting-started', 'functions'],
        author: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        helpful: 0,
        notHelpful: 0
      },
      {
        id: 'art_3',
        title: 'Using AI Features',
        content: 'The NUZANTARA platform includes several AI models including Claude Haiku, ZANTARA Llama, and DevAI Qwen...',
        summary: 'How to leverage AI capabilities in NUZANTARA',
        categoryId: 'cat_3',
        tags: ['ai', 'claude', 'llama', 'models'],
        author: 'System',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        helpful: 0,
        notHelpful: 0
      }
    ];
    
    defaultArticles.forEach(article => {
      this.articles.set(article.id, article);
    });
    
    this.saveKnowledgeBase();
  }

  /**
   * Build search index for fast searching
   */
  buildSearchIndex() {
    this.searchIndex = [];
    
    for (const [articleId, article] of this.articles) {
      // Add article to search index
      this.searchIndex.push({
        id: articleId,
        title: article.title.toLowerCase(),
        content: article.content.toLowerCase(),
        summary: article.summary.toLowerCase(),
        tags: article.tags.join(' ').toLowerCase(),
        categoryId: article.categoryId
      });
    }
    
    console.log(`[KnowledgeBase] Search index built with ${this.searchIndex.length} articles`);
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Listen for article views
    window.addEventListener('kb-article-viewed', (event) => {
      this.recordArticleView(event.detail.articleId);
    });
    
    // Listen for article feedback
    window.addEventListener('kb-article-feedback', (event) => {
      this.recordArticleFeedback(event.detail.articleId, event.detail.helpful);
    });
    
    // Listen for search queries
    window.addEventListener('kb-search', (event) => {
      this.recordSearchQuery(event.detail.query);
    });
  }

  /**
   * Get all articles
   */
  getArticles() {
    return Array.from(this.articles.values());
  }

  /**
   * Get article by ID
   */
  getArticle(articleId) {
    return this.articles.get(articleId);
  }

  /**
   * Get articles by category
   */
  getArticlesByCategory(categoryId) {
    return Array.from(this.articles.values()).filter(article => article.categoryId === categoryId);
  }

  /**
   * Get all categories
   */
  getCategories() {
    return Array.from(this.categories.values());
  }

  /**
   * Get category by ID
   */
  getCategory(categoryId) {
    return this.categories.get(categoryId);
  }

  /**
   * Search articles
   */
  searchArticles(query, options = {}) {
    const lowerQuery = query.toLowerCase();
    const limit = options.limit || 20;
    const categoryId = options.categoryId;
    
    // Filter articles based on search query
    let results = this.searchIndex.filter(item => {
      // Check if we're filtering by category
      if (categoryId && item.categoryId !== categoryId) {
        return false;
      }
      
      // Check if query matches title, content, summary, or tags
      return (
        item.title.includes(lowerQuery) ||
        item.content.includes(lowerQuery) ||
        item.summary.includes(lowerQuery) ||
        item.tags.includes(lowerQuery)
      );
    });
    
    // Sort by relevance (simplified - in a real implementation, you'd use a more sophisticated algorithm)
    results.sort((a, b) => {
      // Articles with query in title should rank higher
      const aTitleMatch = a.title.includes(lowerQuery) ? 1 : 0;
      const bTitleMatch = b.title.includes(lowerQuery) ? 1 : 0;
      
      if (aTitleMatch !== bTitleMatch) {
        return bTitleMatch - aTitleMatch;
      }
      
      // Articles with more tag matches should rank higher
      const aTagMatches = (a.tags.match(new RegExp(lowerQuery, 'g')) || []).length;
      const bTagMatches = (b.tags.match(new RegExp(lowerQuery, 'g')) || []).length;
      
      return bTagMatches - aTagMatches;
    });
    
    // Limit results
    results = results.slice(0, limit);
    
    // Convert back to full article objects
    return results.map(item => this.articles.get(item.id));
  }

  /**
   * Add a new article
   */
  addArticle(articleData) {
    const articleId = articleData.id || `art_${Date.now()}`;
    const article = {
      id: articleId,
      title: articleData.title,
      content: articleData.content,
      summary: articleData.summary || '',
      categoryId: articleData.categoryId,
      tags: articleData.tags || [],
      author: articleData.author || 'Anonymous',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 0,
      helpful: 0,
      notHelpful: 0,
      ...articleData
    };
    
    this.articles.set(articleId, article);
    
    // Update search index
    this.buildSearchIndex();
    
    // Save knowledge base
    this.saveKnowledgeBase();
    
    // Notify about new article
    window.dispatchEvent(new CustomEvent('kb-article-added', {
      detail: article
    }));
    
    console.log(`[KnowledgeBase] Article added: ${article.title}`);
    return articleId;
  }

  /**
   * Update an existing article
   */
  updateArticle(articleId, articleData) {
    const article = this.articles.get(articleId);
    if (article) {
      // Update article fields
      Object.assign(article, articleData, {
        updatedAt: new Date().toISOString()
      });
      
      this.articles.set(articleId, article);
      
      // Update search index
      this.buildSearchIndex();
      
      // Save knowledge base
      this.saveKnowledgeBase();
      
      // Notify about updated article
      window.dispatchEvent(new CustomEvent('kb-article-updated', {
        detail: { id: articleId, article }
      }));
      
      console.log(`[KnowledgeBase] Article updated: ${article.title}`);
      return true;
    }
    return false;
  }

  /**
   * Delete an article
   */
  deleteArticle(articleId) {
    const article = this.articles.get(articleId);
    if (article) {
      this.articles.delete(articleId);
      
      // Remove from favorites
      this.favorites.delete(articleId);
      
      // Remove from recently viewed
      this.recentlyViewed = this.recentlyViewed.filter(id => id !== articleId);
      
      // Update search index
      this.buildSearchIndex();
      
      // Save knowledge base
      this.saveKnowledgeBase();
      
      // Notify about deleted article
      window.dispatchEvent(new CustomEvent('kb-article-deleted', {
        detail: { id: articleId, title: article.title }
      }));
      
      console.log(`[KnowledgeBase] Article deleted: ${article.title}`);
      return true;
    }
    return false;
  }

  /**
   * Record article view
   */
  recordArticleView(articleId) {
    const article = this.articles.get(articleId);
    if (article) {
      // Increment view count
      article.views++;
      this.articles.set(articleId, article);
      
      // Add to recently viewed (avoid duplicates)
      this.recentlyViewed = this.recentlyViewed.filter(id => id !== articleId);
      this.recentlyViewed.unshift(articleId);
      
      // Limit recently viewed list
      if (this.recentlyViewed.length > this.maxRecentlyViewed) {
        this.recentlyViewed.pop();
      }
      
      // Save knowledge base
      this.saveKnowledgeBase();
      
      console.log(`[KnowledgeBase] Article viewed: ${article.title}`);
    }
  }

  /**
   * Get recently viewed articles
   */
  getRecentlyViewed() {
    return this.recentlyViewed
      .map(id => this.articles.get(id))
      .filter(article => article !== undefined);
  }

  /**
   * Record article feedback
   */
  recordArticleFeedback(articleId, helpful) {
    const article = this.articles.get(articleId);
    if (article) {
      if (helpful) {
        article.helpful++;
      } else {
        article.notHelpful++;
      }
      
      this.articles.set(articleId, article);
      
      // Save knowledge base
      this.saveKnowledgeBase();
      
      // Notify about feedback
      window.dispatchEvent(new CustomEvent('kb-article-feedback-recorded', {
        detail: { id: articleId, helpful, article }
      }));
      
      console.log(`[KnowledgeBase] Feedback recorded for: ${article.title}`);
    }
  }

  /**
   * Get article feedback statistics
   */
  getArticleFeedback(articleId) {
    const article = this.articles.get(articleId);
    if (article) {
      const total = article.helpful + article.notHelpful;
      const helpfulPercentage = total > 0 ? Math.round((article.helpful / total) * 100) : 0;
      
      return {
        helpful: article.helpful,
        notHelpful: article.notHelpful,
        total,
        helpfulPercentage
      };
    }
    return null;
  }

  /**
   * Add article to favorites
   */
  addToFavorites(articleId) {
    if (this.articles.has(articleId)) {
      this.favorites.add(articleId);
      this.saveKnowledgeBase();
      
      // Notify about favorite added
      window.dispatchEvent(new CustomEvent('kb-favorite-added', {
        detail: { id: articleId }
      }));
      
      console.log(`[KnowledgeBase] Article added to favorites`);
      return true;
    }
    return false;
  }

  /**
   * Remove article from favorites
   */
  removeFromFavorites(articleId) {
    if (this.favorites.has(articleId)) {
      this.favorites.delete(articleId);
      this.saveKnowledgeBase();
      
      // Notify about favorite removed
      window.dispatchEvent(new CustomEvent('kb-favorite-removed', {
        detail: { id: articleId }
      }));
      
      console.log(`[KnowledgeBase] Article removed from favorites`);
      return true;
    }
    return false;
  }

  /**
   * Get favorite articles
   */
  getFavorites() {
    return Array.from(this.favorites)
      .map(id => this.articles.get(id))
      .filter(article => article !== undefined);
  }

  /**
   * Check if article is favorited
   */
  isFavorited(articleId) {
    return this.favorites.has(articleId);
  }

  /**
   * Record search query for analytics
   */
  recordSearchQuery(query) {
    // In a real implementation, you would store search queries for analytics
    console.log(`[KnowledgeBase] Search query recorded: ${query}`);
  }

  /**
   * Get popular articles (by views)
   */
  getPopularArticles(limit = 10) {
    return Array.from(this.articles.values())
      .sort((a, b) => b.views - a.views)
      .slice(0, limit);
  }

  /**
   * Get knowledge base statistics
   */
  getStatistics() {
    const articles = Array.from(this.articles.values());
    
    return {
      totalArticles: this.articles.size,
      totalCategories: this.categories.size,
      totalViews: articles.reduce((sum, article) => sum + article.views, 0),
      totalFavorites: this.favorites.size,
      recentlyViewed: this.recentlyViewed.length,
      popularArticles: this.getPopularArticles(5).map(article => ({
        id: article.id,
        title: article.title,
        views: article.views
      }))
    };
  }

  /**
   * Render knowledge base interface
   */
  renderKnowledgeBase(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create knowledge base HTML
    container.innerHTML = `
      <div class="knowledge-base">
        <header>
          <h2>📚 Knowledge Base</h2>
          <p>Find answers and learn about NUZANTARA-RAILWAY</p>
        </header>
        
        <div class="kb-search-bar">
          <input type="text" id="kb-search-input" placeholder="Search knowledge base...">
          <button id="kb-search-button">Search</button>
        </div>
        
        <div class="kb-grid">
          <div class="kb-section">
            <h3>Categories</h3>
            <div id="kb-categories" class="categories-container">
              <!-- Categories will be rendered here -->
            </div>
          </div>
          
          <div class="kb-section">
            <h3>Popular Articles</h3>
            <div id="kb-popular-articles" class="articles-container">
              <!-- Popular articles will be rendered here -->
            </div>
          </div>
          
          <div class="kb-section">
            <h3>Recently Viewed</h3>
            <div id="kb-recently-viewed" class="articles-container">
              <!-- Recently viewed articles will be rendered here -->
            </div>
          </div>
          
          <div class="kb-section">
            <h3>Favorites</h3>
            <div id="kb-favorites" class="articles-container">
              <!-- Favorite articles will be rendered here -->
            </div>
          </div>
        </div>
        
        <div class="kb-actions">
          <button id="kb-add-article" class="action-button">Add Article</button>
          <button id="kb-view-all" class="action-button">View All Articles</button>
        </div>
      </div>
    `;
    
    // Render components
    this.renderCategories('kb-categories');
    this.renderPopularArticles('kb-popular-articles');
    this.renderRecentlyViewed('kb-recently-viewed');
    this.renderFavorites('kb-favorites');
    
    // Set up search
    const searchInput = document.getElementById('kb-search-input');
    const searchButton = document.getElementById('kb-search-button');
    
    searchButton.addEventListener('click', () => {
      const query = searchInput.value.trim();
      if (query) {
        this.performSearch(query);
      }
    });
    
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          this.performSearch(query);
        }
      }
    });
    
    // Set up action buttons
    document.getElementById('kb-add-article').addEventListener('click', () => {
      this.showAddArticleDialog();
    });
    
    document.getElementById('kb-view-all').addEventListener('click', () => {
      this.showAllArticles();
    });
  }

  /**
   * Render categories
   */
  renderCategories(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const categories = this.getCategories();
    
    if (categories.length === 0) {
      container.innerHTML = '<p class="no-data">No categories</p>';
      return;
    }
    
    container.innerHTML = categories.map(category => `
      <div class="category-card" data-category-id="${category.id}">
        <div class="category-icon">${category.icon}</div>
        <div class="category-info">
          <h4>${category.name}</h4>
          <p class="category-description">${category.description}</p>
          <p class="category-stats">
            ${this.getArticlesByCategory(category.id).length} articles
          </p>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render popular articles
   */
  renderPopularArticles(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const popularArticles = this.getPopularArticles(5);
    
    if (popularArticles.length === 0) {
      container.innerHTML = '<p class="no-data">No popular articles</p>';
      return;
    }
    
    container.innerHTML = popularArticles.map(article => `
      <div class="article-card" data-article-id="${article.id}">
        <h4>${article.title}</h4>
        <p class="article-summary">${article.summary || 'No summary available'}</p>
        <div class="article-meta">
          <span class="article-views">👁️ ${article.views} views</span>
          <span class="article-feedback">
            👍 ${article.helpful} | 👎 ${article.notHelpful}
          </span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render recently viewed articles
   */
  renderRecentlyViewed(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const recentlyViewed = this.getRecentlyViewed();
    
    if (recentlyViewed.length === 0) {
      container.innerHTML = '<p class="no-data">No recently viewed articles</p>';
      return;
    }
    
    container.innerHTML = recentlyViewed.map(article => `
      <div class="article-card" data-article-id="${article.id}">
        <h4>${article.title}</h4>
        <p class="article-summary">${article.summary || 'No summary available'}</p>
        <div class="article-meta">
          <span class="article-category">
            ${this.getCategory(article.categoryId)?.name || 'Uncategorized'}
          </span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Render favorite articles
   */
  renderFavorites(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const favorites = this.getFavorites();
    
    if (favorites.length === 0) {
      container.innerHTML = '<p class="no-data">No favorite articles</p>';
      return;
    }
    
    container.innerHTML = favorites.map(article => `
      <div class="article-card favorited" data-article-id="${article.id}">
        <h4>${article.title}</h4>
        <p class="article-summary">${article.summary || 'No summary available'}</p>
        <div class="article-meta">
          <span class="article-category">
            ${this.getCategory(article.categoryId)?.name || 'Uncategorized'}
          </span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Perform search
   */
  performSearch(query) {
    // Notify about search
    window.dispatchEvent(new CustomEvent('kb-search', {
      detail: { query }
    }));
    
    // In a real implementation, you would show search results
    console.log(`[KnowledgeBase] Performing search: ${query}`);
    alert(`Search results for "${query}" would be displayed here`);
  }

  /**
   * Show add article dialog
   */
  showAddArticleDialog() {
    // In a real implementation, this would show a modal dialog
    console.log('[KnowledgeBase] Show add article dialog');
    alert('Add article dialog would appear here');
  }

  /**
   * Show all articles
   */
  showAllArticles() {
    // In a real implementation, this would show all articles
    console.log('[KnowledgeBase] Show all articles');
    alert('All articles would be displayed here');
  }
}

// Initialize knowledge base system
document.addEventListener('DOMContentLoaded', () => {
  window.KnowledgeBase = new KnowledgeBase();
  window.KnowledgeBase.initialize();
  
  console.log('[KnowledgeBase] System ready');
  
  // Mark enhancement as completed
  if (window.enhancementTracker) {
    window.enhancementTracker.markCompleted(27);
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = KnowledgeBase;
}