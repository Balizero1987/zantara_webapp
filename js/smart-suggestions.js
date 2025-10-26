/**
 * SMART SUGGESTIONS MODULE
 * Generates contextual follow-up questions after AI responses
 *
 * Features:
 * - Topic detection (business, immigration, tax, casual, technical)
 * - Multi-language support (EN, IT, ID)
 * - Beautiful pill UI design
 * - Click to send suggestion
 *
 * Usage:
 * const suggestions = SmartSuggestions.generate(userQuery, aiResponse);
 * SmartSuggestions.display(suggestions, messageElement);
 */

const SmartSuggestions = {
  /**
   * Topic-based follow-up questions database
   */
  followups: {
    business: {
      en: [
        "What are the costs involved?",
        "How long does the process take?",
        "What documents do I need?",
        "Are there any requirements I should know about?",
        "Can you help me with the application?",
        "What are the next steps?"
      ],
      it: [
        "Quali sono i costi?",
        "Quanto tempo richiede il processo?",
        "Quali documenti servono?",
        "Ci sono requisiti da conoscere?",
        "Puoi aiutarmi con la procedura?",
        "Quali sono i prossimi passi?"
      ],
      id: [
        "Berapa biayanya?",
        "Berapa lama prosesnya?",
        "Dokumen apa yang diperlukan?",
        "Apa saja syaratnya?",
        "Bisa bantu proses aplikasinya?",
        "Apa langkah selanjutnya?"
      ]
    },
    immigration: {
      en: [
        "What visa types are available?",
        "How do I extend my visa?",
        "What are the requirements for KITAS?",
        "Can you help me with the application process?",
        "What documents do I need for visa application?",
        "How long does visa processing take?"
      ],
      it: [
        "Quali tipi di visto sono disponibili?",
        "Come posso estendere il mio visto?",
        "Quali sono i requisiti per il KITAS?",
        "Puoi aiutarmi con la procedura?",
        "Quali documenti servono per il visto?",
        "Quanto tempo richiede l'elaborazione?"
      ],
      id: [
        "Jenis visa apa yang tersedia?",
        "Bagaimana cara memperpanjang visa?",
        "Apa syarat untuk KITAS?",
        "Bisakah bantu proses aplikasi?",
        "Dokumen apa yang diperlukan untuk visa?",
        "Berapa lama proses visa?"
      ]
    },
    tax: {
      en: [
        "What tax rates apply to my business?",
        "How do I register for tax in Indonesia?",
        "Are there any tax incentives?",
        "When are tax filing deadlines?",
        "What tax deductions are available?",
        "How do I calculate my tax liability?"
      ],
      it: [
        "Quali aliquote fiscali si applicano?",
        "Come mi registro per le tasse in Indonesia?",
        "Ci sono incentivi fiscali?",
        "Quando scadono le tasse?",
        "Quali detrazioni fiscali sono disponibili?",
        "Come calcolo l'imposta dovuta?"
      ],
      id: [
        "Berapa tarif pajak untuk bisnis saya?",
        "Bagaimana cara daftar pajak di Indonesia?",
        "Ada insentif pajak?",
        "Kapan batas waktu lapor pajak?",
        "Apa saja potongan pajak yang tersedia?",
        "Bagaimana cara hitung kewajiban pajak?"
      ]
    },
    casual: {
      en: [
        "Tell me more about this",
        "Can you explain further?",
        "What else should I know?",
        "Any recommendations?",
        "How does this work in practice?",
        "What are the alternatives?"
      ],
      it: [
        "Dimmi di più",
        "Puoi spiegare meglio?",
        "Cos'altro dovrei sapere?",
        "Qualche raccomandazione?",
        "Come funziona in pratica?",
        "Quali sono le alternative?"
      ],
      id: [
        "Ceritakan lebih lanjut",
        "Bisa jelaskan lebih detail?",
        "Apa lagi yang perlu saya tahu?",
        "Ada rekomendasi?",
        "Bagaimana cara kerjanya?",
        "Apa alternatifnya?"
      ]
    },
    technical: {
      en: [
        "Can you show me a code example?",
        "What are the best practices?",
        "How do I debug this?",
        "Are there any alternatives?",
        "What tools should I use?",
        "How do I optimize performance?"
      ],
      it: [
        "Puoi mostrarmi un esempio di codice?",
        "Quali sono le best practice?",
        "Come faccio il debug?",
        "Ci sono alternative?",
        "Quali strumenti dovrei usare?",
        "Come ottimizzo le prestazioni?"
      ],
      id: [
        "Bisa tunjukkan contoh kode?",
        "Apa best practice-nya?",
        "Bagaimana cara debug?",
        "Ada alternatif lain?",
        "Tool apa yang harus digunakan?",
        "Bagaimana cara optimasi performa?"
      ]
    }
  },

  /**
   * Detect topic from user query
   */
  detectTopic(query) {
    const q = query.toLowerCase();

    // Immigration keywords
    if (/visa|kitas|immigration|permit|imigrasi|visto/.test(q)) {
      return 'immigration';
    }

    // Tax keywords
    if (/tax|pajak|tassa|fiscal|npwp|pph/.test(q)) {
      return 'tax';
    }

    // Technical keywords
    if (/code|programming|api|develop|software|bug|error|function/.test(q)) {
      return 'technical';
    }

    // Casual keywords
    if (/hello|hi|ciao|halo|how are|come stai|apa kabar|thanks|grazie/.test(q)) {
      return 'casual';
    }

    // Default: business
    return 'business';
  },

  /**
   * Detect language from user query
   */
  detectLanguage(query) {
    const q = query.toLowerCase();

    // Italian detection
    if (/ciao|come stai|grazie|prego|buongiorno|per favore|cosa|dove/.test(q)) {
      return 'it';
    }

    // Indonesian detection
    if (/halo|apa kabar|terima kasih|selamat|aku|saya|mau|bisa/.test(q)) {
      return 'id';
    }

    // Default: English
    return 'en';
  },

  /**
   * Generate follow-up suggestions
   */
  generate(userQuery, aiResponse) {
    const topic = this.detectTopic(userQuery);
    const language = this.detectLanguage(userQuery);

    console.log(`[SmartSuggestions] Topic: ${topic}, Language: ${language}`);

    // Get suggestions for topic and language
    const topicSuggestions = this.followups[topic] || this.followups.business;
    const languageSuggestions = topicSuggestions[language] || topicSuggestions.en;

    // Pick 3 random suggestions
    const shuffled = languageSuggestions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    console.log(`[SmartSuggestions] Generated ${selected.length} suggestions:`, selected);

    return selected;
  },

  /**
   * Display suggestions in the UI
   * Appends suggestion pills to the given container element
   */
  display(suggestions, containerElement, onClickCallback) {
    // Remove any existing suggestions first
    const existingSuggestions = containerElement.querySelector('.smart-suggestions');
    if (existingSuggestions) {
      existingSuggestions.remove();
    }

    // Create suggestions container
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'smart-suggestions';
    suggestionsDiv.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    `;

    // Create suggestion pills
    suggestions.forEach((suggestion, index) => {
      const pill = document.createElement('button');
      pill.className = 'suggestion-pill';
      pill.textContent = suggestion;
      pill.style.cssText = `
        background: rgba(107, 70, 193, 0.15);
        border: 1px solid rgba(107, 70, 193, 0.3);
        border-radius: 16px;
        padding: 8px 14px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.9);
        cursor: pointer;
        transition: all 0.2s;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 280px;
      `;

      // Hover effects
      pill.addEventListener('mouseenter', () => {
        pill.style.background = 'rgba(107, 70, 193, 0.25)';
        pill.style.borderColor = 'rgba(107, 70, 193, 0.5)';
        pill.style.transform = 'translateY(-2px)';
      });

      pill.addEventListener('mouseleave', () => {
        pill.style.background = 'rgba(107, 70, 193, 0.15)';
        pill.style.borderColor = 'rgba(107, 70, 193, 0.3)';
        pill.style.transform = 'translateY(0)';
      });

      // Click handler
      pill.addEventListener('click', () => {
        console.log(`[SmartSuggestions] Clicked: "${suggestion}"`);
        if (onClickCallback) {
          onClickCallback(suggestion);
        }
      });

      suggestionsDiv.appendChild(pill);
    });

    // Append to container
    containerElement.appendChild(suggestionsDiv);

    console.log(`[SmartSuggestions] Displayed ${suggestions.length} pills`);
  },

  /**
   * Remove suggestions from a container
   */
  remove(containerElement) {
    const suggestions = containerElement.querySelector('.smart-suggestions');
    if (suggestions) {
      suggestions.remove();
      console.log('[SmartSuggestions] Removed suggestions');
    }
  }
};

// Export for global use
if (typeof window !== 'undefined') {
  window.SmartSuggestions = SmartSuggestions;
  console.log('[SmartSuggestions] Module loaded successfully');
}
