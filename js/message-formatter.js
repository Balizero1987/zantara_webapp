/**
 * ZANTARA Message Formatter
 * Formats AI responses with structured sections and CTA
 * Created: 2025-10-14
 */

class MessageFormatter {
  /**
   * Formats a message with structured sections
   * @param {string} text - The raw message text
   * @param {object} options - Formatting options
   * @returns {string} HTML formatted message
   */
  static formatStructuredMessage(text, options = {}) {
    if (!text) return '';
    
    const {
      showCTA = true,
      phoneNumber = '+62 859 0436 9574',
      email = 'info@balizero.com',
      language = 'id'
    } = options;

    // Try to detect if message already has structure
    const hasStructure = this.detectStructure(text);
    
    let formattedHtml = '';
    
    if (hasStructure) {
      // Parse and format existing structure
      formattedHtml = this.parseStructuredText(text);
    } else {
      // Format as regular message with auto-paragraphs
      formattedHtml = this.formatRegularMessage(text);
    }
    
    // Add CTA if enabled
    if (showCTA) {
      formattedHtml += this.createCTA(phoneNumber, email, language);
    }
    
    return formattedHtml;
  }

  /**
   * Detects if text has structured format markers
   */
  static detectStructure(text) {
    const patterns = [
      /\(Paragraph \d+[^)]*\)/i,
      /\(Part \d+[^)]*\)/i,
      /\(Section \d+[^)]*\)/i,
      /#{1,3}\s+\d+\./,  // Markdown headers with numbers
      /^\d+\.\s+\*\*[^*]+\*\*/m  // Numbered bold sections
    ];
    
    return patterns.some(pattern => pattern.test(text));
  }

  /**
   * Parse structured text with numbered paragraphs
   */
  static parseStructuredText(text) {
    let html = '<div class="structured-response">';
    
    // Split by paragraph markers
    const paragraphs = text.split(/(\((?:Paragraph|Part|Section)\s+\d+[^)]*\))/gi);
    
    for (let i = 0; i < paragraphs.length; i++) {
      const part = paragraphs[i].trim();
      if (!part) continue;
      
      // Check if it's a section header
      const headerMatch = part.match(/\((?:Paragraph|Part|Section)\s+\d+\s*-\s*([^)]+)\)/i);
      if (headerMatch) {
        html += `<div class="section-header">${headerMatch[1]}</div>`;
      } else {
        // Regular content
        const formatted = this.formatParagraph(part);
        if (formatted) {
          html += `<div class="section-content">${formatted}</div>`;
        }
      }
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Format regular message with paragraphs
   */
  static formatRegularMessage(text) {
    const paragraphs = text.split(/\n\n+/);
    let html = '<div class="regular-response">';
    
    paragraphs.forEach(para => {
      const formatted = this.formatParagraph(para.trim());
      if (formatted) {
        html += `<p class="response-paragraph">${formatted}</p>`;
      }
    });
    
    html += '</div>';
    return html;
  }

  /**
   * Format a single paragraph with inline formatting
   */
  static formatParagraph(text) {
    if (!text) return '';
    
    let formatted = text;
    
    // Convert markdown-style formatting
    // Bold: **text** or __text__
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Lists: detect bullet points or numbered lists
    if (formatted.includes('\n•') || formatted.includes('\n-') || formatted.includes('\n*')) {
      const lines = formatted.split('\n');
      let inList = false;
      let listHtml = '';
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          if (!inList) {
            listHtml += '<ul>';
            inList = true;
          }
          listHtml += `<li>${trimmed.substring(1).trim()}</li>`;
        } else if (inList && trimmed) {
          listHtml += '</ul>' + trimmed;
          inList = false;
        } else if (trimmed) {
          listHtml += (inList ? '' : '<br>') + trimmed;
        }
      });
      
      if (inList) listHtml += '</ul>';
      return listHtml;
    }
    
    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
  }

  /**
   * Create WhatsApp/Email CTA component
   */
  static createCTA(phoneNumber, email, language = 'id') {
    const texts = {
      id: {
        prefix: 'Untuk bantuan langsung, hubungi kami:',
        whatsapp: 'WhatsApp',
        email: 'Email'
      },
      it: {
        prefix: 'Per assistenza diretta contattaci su:',
        whatsapp: 'WhatsApp',
        email: 'Email'
      },
      en: {
        prefix: 'For direct assistance, contact us:',
        whatsapp: 'WhatsApp',
        email: 'Email'
      }
    };
    
    const text = texts[language] || texts.id;
    
    // Clean phone number for WhatsApp URL
    const cleanPhone = phoneNumber.replace(/[^\d]/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone}`;
    
    return `
      <div class="message-cta">
        <div class="cta-divider"></div>
        <div class="cta-text">${text.prefix}</div>
        <div class="cta-buttons">
          <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="cta-button cta-whatsapp">
            <svg class="cta-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span>${text.whatsapp}</span>
            <span class="cta-phone">${phoneNumber}</span>
          </a>
          <a href="mailto:${email}" class="cta-button cta-email">
            <svg class="cta-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>${text.email}</span>
          </a>
        </div>
      </div>
    `;
  }

  /**
   * Extract language from message or user profile
   */
  static detectLanguage(text, defaultLang = 'id') {
    const patterns = {
      it: /\b(per|che|quando|come|dove|sono|questo|quello|grazie)\b/i,
      en: /\b(the|is|are|was|were|this|that|thank|please)\b/i,
      id: /\b(yang|untuk|adalah|dengan|dari|ke|di|pada|terima|kasih)\b/i
    };
    
    for (const [lang, pattern] of Object.entries(patterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }
    
    return defaultLang;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessageFormatter;
}

