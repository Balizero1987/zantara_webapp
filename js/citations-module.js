/**
 * Citations Module - TIER 2 Feature
 * Displays document sources and citations from RAG backend
 * Integrates with Bali Zero responses
 */

window.Citations = (function() {
  'use strict';

  /**
   * Render citations below AI response (DISCRETE VERSION)
   * @param {Array} citations - Array of citation objects from RAG
   * @param {HTMLElement} container - Container to append citations to
   * @param {Object} options - Display options
   */
  function render(citations, container, options = {}) {
    console.log('[Citations] render() called with:', {citations, citationsLength: citations?.length, container: container?.className, options});

    if (!citations || citations.length === 0) {
      console.log('[Citations] No citations to render');
      return;
    }

    const showSimilarity = options.showSimilarity !== false;
    const showTier = options.showTier !== false;

    // Create discrete citations container (collapsed by default)
    const citationsDiv = document.createElement('div');
    citationsDiv.className = 'ai-citations collapsed';
    citationsDiv.setAttribute('data-citations-count', citations.length);

    // Discrete badge/button to toggle
    const toggleBadge = document.createElement('button');
    toggleBadge.className = 'citations-badge';
    toggleBadge.innerHTML = `📚 ${citations.length} ${citations.length === 1 ? 'fonte' : 'fonti'}`;
    toggleBadge.onclick = () => toggleCitations(citationsDiv, toggleBadge);
    
    citationsDiv.appendChild(toggleBadge);

    // Citations list container
    const citationsList = document.createElement('div');
    citationsList.className = 'citations-list';
    
    // Render citations
    citations.forEach((citation, idx) => {
      const citationEl = document.createElement('div');
      citationEl.className = 'citation';
      if (idx >= maxCitations) {
        citationEl.classList.add('citation-hidden');
      }
      citationEl.setAttribute('data-citation-index', idx);

    // Citations list container (hidden by default)
    const citationsList = document.createElement('div');
    citationsList.className = 'citations-list';
    
    // Render all citations
    citations.forEach((citation, idx) => {
      const citationEl = document.createElement('div');
      citationEl.className = 'citation';
      citationEl.setAttribute('data-citation-index', idx);
      // Badges container
      const badgesDiv = document.createElement('div');
      badgesDiv.className = 'citation-badges';

      // Tier badge (T1/T2/T3)
      if (showTier && citation.tier) {
        const tierEl = document.createElement('span');
        tierEl.className = `citation-tier tier-${citation.tier.toLowerCase()}`;
        tierEl.textContent = citation.tier;
        tierEl.title = getTierDescription(citation.tier);
        badgesDiv.appendChild(tierEl);
      }

      // Similarity score
      if (showSimilarity && citation.similarity) {
        const simEl = document.createElement('span');
        simEl.className = 'citation-similarity';
        const percentage = Math.round(citation.similarity * 100);
        simEl.textContent = `${percentage}%`;
        simEl.title = 'Relevance score';
        simEl.style.background = getSimilarityColor(citation.similarity);
        badgesDiv.appendChild(simEl);
      }

      citationHeader.appendChild(badgesDiv);
      citationEl.appendChild(citationHeader);

      // Snippet preview (if available)
      if (citation.snippet || citation.text) {
        const snippetEl = document.createElement('div');
        snippetEl.className = 'citation-snippet';
        const snippetText = citation.snippet || citation.text || '';
        snippetEl.textContent = snippetText.substring(0, 150) + (snippetText.length > 150 ? '...' : '');
        citationEl.appendChild(snippetEl);
      }

      // Actions (URL link, date)
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'citation-actions';

      // URL link
      if (citation.url || citation.metadata?.url) {
        const linkEl = document.createElement('a');
        linkEl.href = citation.url || citation.metadata.url;
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';
        linkEl.className = 'citation-link';
        linkEl.innerHTML = '🔗 View source';
        linkEl.title = 'Open source document';
        actionsDiv.appendChild(linkEl);
      }

      // Last crawled date
      if (citation.dateLastCrawled || citation.metadata?.dateLastCrawled) {
        const dateEl = document.createElement('span');
        dateEl.className = 'citation-date';
        const date = new Date(citation.dateLastCrawled || citation.metadata.dateLastCrawled);
        dateEl.textContent = `📅 ${formatDate(date)}`;
        dateEl.title = 'Last updated';
        actionsDiv.appendChild(dateEl);
      }

      if (actionsDiv.children.length > 0) {
        citationEl.appendChild(actionsDiv);
      }

      citationsList.appendChild(citationEl);
    });

    citationsDiv.appendChild(citationsList);

    // Append to container
    container.appendChild(citationsDiv);

    console.log(`✅ [Citations] Rendered ${citations.length} citations (${maxCitations} visible)`);
    
    return citationsDiv;
  }

  /**
   * Toggle citations visibility
   */
  function toggleCitations(container, button) {
    const isExpanded = button.getAttribute('data-expanded') === 'true';
    const hiddenCitations = container.querySelectorAll('.citation-hidden');
    citationsList.appendChild(citationEl);
    });

    citationsDiv.appendChild(citationsList);

    // Append to container
    container.appendChild(citationsDiv);

    console.log(`✅ [Citations] Rendered ${citations.length} citations (collapsed by default)`);
    
    return citationsDiv;
  }

  /**
   * Toggle citations visibility (expand/collapse)
   */
  function toggleCitations(container, badge) {
    const isExpanded = container.classList.contains('expanded');

    if (isExpanded) {
      // Collapse
      container.classList.remove('expanded');
      container.classList.add('collapsed');
      badge.innerHTML = `📚 ${container.getAttribute('data-citations-count')} fonti`;
    } else {
      // Expand
      container.classList.remove('collapsed');
      container.classList.add('expanded');
      badge.innerHTML = `✖️ Nascondi fonti`;
    }
  }*/
  function getSimilarityColor(similarity) {
    if (similarity >= 0.9) return 'linear-gradient(135deg, #10b981, #059669)';
    if (similarity >= 0.8) return 'linear-gradient(135deg, #3b82f6, #2563eb)';
    if (similarity >= 0.7) return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    return 'linear-gradient(135deg, #6b7280, #4b5563)';
  }

  /**
   * Format date
   */
  function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return date.toLocaleDateString();
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
