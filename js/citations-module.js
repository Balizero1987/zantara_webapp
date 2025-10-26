/**
 * Citations Module - TIER 2 Feature
 * Displays document sources and citations from RAG backend
 * Integrates with Bali Zero responses
 */

window.Citations = (function() {
  'use strict';

  /**
   * Render citations below AI response
   * @param {Array} citations - Array of citation objects from RAG
   * @param {HTMLElement} container - Container to append citations to
   * @param {Object} options - Display options
   */
  function render(citations, container, options = {}) {
    if (!citations || citations.length === 0) {
      console.log('[Citations] No citations to render');
      return;
    }

    const maxCitations = options.maxCitations || 3;
    const showSimilarity = options.showSimilarity !== false;
    const showTier = options.showTier !== false;

    // Create citations container
    const citationsDiv = document.createElement('div');
    citationsDiv.className = 'ai-citations';
    citationsDiv.setAttribute('data-citations-count', citations.length);

    // Header
    const header = document.createElement('div');
    header.className = 'ai-citations-header';
    header.innerHTML = '📚 Fonti utilizzate';
    citationsDiv.appendChild(header);

    // Render citations (max 3)
    citations.slice(0, maxCitations).forEach((citation, idx) => {
      const citationEl = document.createElement('div');
      citationEl.className = 'citation';
      citationEl.setAttribute('data-citation-index', idx);

      // Source name
      const sourceEl = document.createElement('div');
      sourceEl.className = 'citation-source';
      sourceEl.textContent = citation.source || citation.metadata?.source || `Source ${idx + 1}`;
      citationEl.appendChild(sourceEl);

      // Tier badge (T1/T2/T3)
      if (showTier && citation.tier) {
        const tierEl = document.createElement('div');
        tierEl.className = 'citation-tier';
        tierEl.textContent = citation.tier;
        tierEl.title = getTierDescription(citation.tier);
        citationEl.appendChild(tierEl);
      }

      // Similarity score
      if (showSimilarity && citation.similarity) {
        const simEl = document.createElement('div');
        simEl.className = 'citation-similarity';
        const percentage = Math.round(citation.similarity * 100);
        simEl.textContent = `${percentage}%`;
        simEl.title = 'Relevance score';
        citationEl.appendChild(simEl);
      }

      // Optional: URL link
      if (citation.url && citation.metadata?.url) {
        const linkEl = document.createElement('a');
        linkEl.href = citation.url || citation.metadata.url;
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';
        linkEl.innerHTML = '🔗';
        linkEl.style.marginLeft = '8px';
        linkEl.title = 'View source';
        citationEl.appendChild(linkEl);
      }

      citationsDiv.appendChild(citationEl);
    });

    // Append to container
    container.appendChild(citationsDiv);

    console.log(`✅ [Citations] Rendered ${Math.min(citations.length, maxCitations)} citations`);
    
    return citationsDiv;
  }

  /**
   * Get human-readable description of tier
   */
  function getTierDescription(tier) {
    const descriptions = {
      'T1': 'Official government sources',
      'T2': 'Accredited legal analysis',
      'T3': 'Community & forum insights'
    };
    return descriptions[tier] || tier;
  }

  /**
   * Extract citations from RAG response
   */
  function extract(response) {
    if (!response) return [];
    
    // Handle different response formats
    if (response.sources) {
      return response.sources;
    }
    
    if (response.citations) {
      return response.citations;
    }

    return [];
  }

  /**
   * Format citation as text (for export/sharing)
   */
  function formatAsText(citations) {
    if (!citations || citations.length === 0) {
      return '';
    }

    const lines = ['Sources:'];
    citations.forEach((cite, idx) => {
      const source = cite.source || cite.metadata?.source || `Source ${idx + 1}`;
      const tier = cite.tier ? ` [${cite.tier}]` : '';
      lines.push(`  ${idx + 1}. ${source}${tier}`);
    });

    return lines.join('\n');
  }

  /**
   * Verify citations exist in response
   */
  function hasCitations(response) {
    if (!response) return false;
    return (response.sources && response.sources.length > 0) ||
           (response.citations && response.citations.length > 0);
  }

  /**
   * Public API
   */
  return {
    render,
    extract,
    formatAsText,
    hasCitations,
    getTierDescription
  };

})();

console.log('✅ Citations module loaded');
