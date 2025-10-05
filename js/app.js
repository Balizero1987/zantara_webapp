// ZANTARA Syncra-Inspired App (voice-first, streaming-aware)
import DOMPurify from 'dompurify';

class ZantaraApp {
  constructor() {
    this.isListening = false;
    this.currentView = 'welcome';
    this.messages = [];
    this.recognition = null;
    this.extraLoaded = 0; // for "Load earlier" control
    this.useStreaming = false; // Will be true when backend supports it
    this.streamingClient = null;
    this.streamingUI = null;
    this.langChips = {
      it: [ ['📋','Preventivo'], ["📞","Chiama 15'"], ['📄','Documenti'], ['▶️','Avvia Pratica'], ['💬','WhatsApp'], ['✉️','Email'] ],
      en: [ ['📋','Quote'], ["📞","Call 15'"], ['📄','Documents'], ['▶️','Start Process'], ['💬','WhatsApp'], ['✉️','Email'] ],
      id: [ ['📋','Penawaran'], ["📞","Telpon 15'"], ['📄','Dokumen'], ['▶️','Mulai Proses'], ['💬','WhatsApp'], ['✉️','Email'] ],
      uk: [ ['📋','Кошторис'], ["📞","Дзвінок 15'"], ['📄','Документи'], ['▶️','Почати процес'], ['💬','WhatsApp'], ['✉️','Email'] ]
    };
    this.initStreaming();
    this.init();
  }

  // Initialize streaming components
  initStreaming() {
    // Check if streaming modules are available (prefer CLIENT namespace)
    const client = window.ZANTARA_STREAMING_CLIENT || window.ZANTARA_STREAMING;
    const ui = window.ZANTARA_STREAMING_UI;

    if (client && ui) {
      this.streamingClient = client;
      this.streamingUI = ui;
      this.streamingUI.init();
      this.setupStreamingListeners();

      // STREAMING NOW DEFAULT ON - LIVE IN PRODUCTION!
      this.useStreaming = true;

      console.log('[ZantaraApp] Streaming initialized, enabled:', this.useStreaming);
    } else {
      console.log('[ZantaraApp] Streaming modules not available');
    }
  }

  // Setup streaming event listeners
  setupStreamingListeners() {
    if (!this.streamingClient) return;

    // Handle streaming start
    this.streamingClient.on('start', (data) => {
      console.log('[Streaming] Started', data);
      this.hideTypingIndicator();
    });

    // Handle delta chunks
    this.streamingClient.on('delta', (data) => {
      const container = document.querySelector('.messages-container');
      if (!container) return;

      let messageEl = container.querySelector('[data-streaming="true"] .message-content');
      if (!messageEl) {
        // Create new streaming message
        const messageDiv = this.streamingUI.createStreamingMessage('assistant');
        const avatarHtml = '<div class="message-avatar"><img src="zantara_logo_transparent.png" alt="ZANTARA"></div>';
        messageDiv.innerHTML = DOMPurify.sanitize(avatarHtml + messageDiv.innerHTML);
        container.appendChild(messageDiv);
        messageEl = messageDiv.querySelector('.message-content');
        container.scrollTop = container.scrollHeight;
      }

      this.streamingUI.appendDelta(data.content, messageEl);
      container.scrollTop = container.scrollHeight;
    });

    // Handle tool start (browsing)
    this.streamingClient.on('tool-start', (data) => {
      console.log('[Streaming] Tool started:', data.name, data.args);
      if (data.name === 'web_search') {
        this.streamingUI.showBrowsingPill(true);
        const query = data.args?.query || '';
        this.streamingUI.showToolStatus(`Searching: ${query}`);
      }
    });

    // Handle tool results (citations)
    this.streamingClient.on('tool-result', (data) => {
      console.log('[Streaming] Tool result:', data.name, data.data);
      if (data.name === 'web_search' && data.data) {
        const container = document.querySelector('.messages-container');
        const messageEl = container?.querySelector('[data-streaming="true"]');
        if (messageEl) {
          this.streamingUI.renderCitations(data.data, messageEl);
        }
      }
    });

    // Handle final message
    this.streamingClient.on('final', (data) => {
      const container = document.querySelector('.messages-container');
      const messageEl = container?.querySelector('[data-streaming="true"] .message-content');
      if (messageEl && data.content) {
        this.streamingUI.setFinalContent(data.content, messageEl);
      }
    });

    // Handle completion
    this.streamingClient.on('done', () => {
      console.log('[Streaming] Completed');
      this.streamingUI.showBrowsingPill(false);

      // Mark message as complete
      const container = document.querySelector('.messages-container');
      const messageEl = container?.querySelector('[data-streaming="true"]');
      if (messageEl) {
        messageEl.removeAttribute('data-streaming');
      }
    });

    // Handle errors
    this.streamingClient.on('error', (data) => {
      console.error('[Streaming] Error:', data.error);
      this.hideTypingIndicator();
      this.streamingUI.showBrowsingPill(false);
      this.addMessage('assistant', `Error: ${data.error}`);
    });
  }

  // Check if streaming should be used
  shouldUseStreaming(text) {
    // Check if streaming is available and enabled
    if (!this.streamingClient || !this.useStreaming) return false;

    // For now, use streaming when enabled
    return true;
  }

  // Process message with streaming
  async processWithStreaming(text) {
    try {
      // Build messages array
      const messages = [
        { role: 'user', content: text }
      ];

      // Get session ID
      const sessionId = localStorage.getItem('zantara-session-id') || `sess_${Date.now()}`;
      localStorage.setItem('zantara-session-id', sessionId);

      // Start streaming
      await this.streamingClient.streamChat(messages, sessionId);

    } catch (err) {
      console.error('[Streaming] Failed:', err);
      this.hideTypingIndicator();
      // Fallback to regular processing
      return this.processWithZantaraRegular(text);
    }
  }

  // --- Persona & System Prompt helpers ---
  detectLanguage(text) {
    try {
      const t = String(text || '').toLowerCase();
      // very light heuristics
      if (/(\bciao\b|come\b|sono\b|grazie|perch[eé]|oggi|domani)/.test(t)) return 'it';
      if (/(\bhalo\b|apa\b|yang\b|bisa\b|terima kasih|kenapa|hari ini)/.test(t)) return 'id';
      if (/(\bпривіт\b|будь ласка|дякую|як|що|сьогодні|завтра|хто\b|я\s+є)/.test(t)) return 'uk';
      if (/(\bhello\b|hey\b|how\b|thanks|why|today|tomorrow|who am i)/.test(t)) return 'en';
      // codes like C1/C2/D12 etc. are neutral; default to Indonesian policy
      return 'id';
    } catch (_) { return 'id'; }
  }

  resolveMessageLanguage(text, profile) {
    try {
      const forced = localStorage.getItem('zantara-forced-lang');
      if (forced) return forced;
      const detected = this.detectLanguage(text);
      const base = (profile && profile.lang) ? profile.lang : 'id';
      // Prefer explicit detection from the current message; fallback to profile
      return detected || base;
    } catch (_) { return (profile && profile.lang) ? profile.lang : 'id'; }
  }

  getUserEmail() {
    try { return localStorage.getItem('zantara-user-email') || ''; } catch(_) { return ''; }
  }

  getCounterpartProfile() {
    const email = (this.getUserEmail() || '').toLowerCase();
    const local = email.endsWith('@balizero.com');
    const name = email ? (email.split('@')[0] || '').replace(/\W+/g,' ').trim() : '';
    // Language routing per counterpart
    // Rule: default is Indonesian; Zero=IT; Ruslana/Marta/Olena=UK; externals=EN; if unknown counterpart → Indonesian
    let lang = 'id';
    if (email) {
      if (local) {
        lang = 'id';
        if (/^zero\b/.test(name)) lang = 'it';
        if (/^(ruslana|marta|olena)\b/.test(name)) lang = 'uk';
      } else {
        lang = 'en';
      }
    } else {
      // unknown counterpart → Indonesian
      lang = 'id';
    }
    return { email, name: name || '', isLocal: local, isExternal: !local, isUnknown: !email, lang };
  }

  buildSystemPrompt(profile) {
    const who = profile && profile.name ? profile.name : 'colleague';
    const langHint = profile && profile.lang ? profile.lang : 'auto';
    // Core instructions compressed for transport
    const core = [
      'You are ZANTARA, strategic brain of Bali Zero. Interact as a peer (not subordinate).',
      'Never reveal logs or Boss Zero\'s private conversations. Never mention memory systems.',
      'Address the counterpart appropriately. Do not ask for identity in chat (already handled by login).',
      'Never introduce yourself (e.g., “I am ZANTARA” or “I am an AI assistant”). Start with the answer.',
      'Language: strictly use Target-Language for all output.',
      'Tone: calm, sharp, dry; business-driven; dry humor only if it builds trust. Avoid fillers.',
      'Anti-hallucination: never invent legal/numeric data. If not from official sources, output NOT AVAILABLE.',
      'Client-facing: clear text, short (2–5 sentences) + CTA. No JSON. No system chatter.',
      'Compliance: follow OSS RBA, BKPM, DJP, Immigration for Indonesia-related outputs.'
    ].join(' ');
    return `${core}\nCounterpart: ${who}\nTarget-Language: ${langHint}`;
  }

  init() {
    // Hide splash after a short delay
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) { splash.classList.add('hidden'); setTimeout(() => splash.remove(), 500); }
    }, 1200);

    this.initEventListeners();
    this.initVoiceRecognition();

    // Show chat interface only if logged in (checked in DOMContentLoaded)
    // this.showChatInterface() is called after login check passes

    // Non-blocking identity check
    try {
      const api = window.ZANTARA_API;
      const email = localStorage.getItem('zantara-user-email') || '';
      if (api?.call && email) api.call('/call', { key: 'identity.resolve', params: { email } }, true).catch(() => {});
    } catch (_) {}

    window.addEventListener('zantaraVirtualizationChanged', () => { this.extraLoaded = 0; this.renderFromState(); });
  }

  initEventListeners() {
    document.getElementById('voice-button')?.addEventListener('click', () => this.startVoiceRecording());
    document.querySelectorAll('.action-card').forEach(card => card.addEventListener('click', (e) => this.handleQuickAction(e.currentTarget.dataset.action)));
    document.getElementById('send-button')?.addEventListener('click', () => this.sendMessage());
    const input = document.getElementById('message-input');
    input?.addEventListener('keypress', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); this.sendMessage(); } });
    document.getElementById('voice-input')?.addEventListener('click', () => this.startVoiceRecording());
    document.querySelector('.stop-recording')?.addEventListener('click', () => this.stopVoiceRecording());
    document.querySelectorAll('.nav-item').forEach(item => item.addEventListener('click', (e) => { document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active')); e.currentTarget.classList.add('active'); this.switchView(e.currentTarget.dataset.view); }));
  }

  initVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'en-US';
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.onresult = (event) => { const res = event.results[event.results.length - 1]; if (res?.isFinal) this.processVoiceCommand(res[0].transcript); };
      this.recognition.onerror = () => { this.stopVoiceRecording(); };
    }
  }

  startVoiceRecording() {
    const o = document.getElementById('voice-overlay'); if (o) o.style.display = 'flex';
    if (this.recognition) { this.recognition.start(); this.isListening = true; const t = document.querySelector('.listening-text'); if (t) t.textContent = 'Listening...'; }
  }
  stopVoiceRecording() {
    const o = document.getElementById('voice-overlay'); if (o) o.style.display = 'none';
    if (this.recognition && this.isListening) { this.recognition.stop(); this.isListening = false; }
  }

  processVoiceCommand(transcript) { this.stopVoiceRecording(); this.showChatInterface(); this.addMessage('user', transcript); this.processWithZantara(transcript); }

  handleQuickAction(action) {
    const map = { generate: 'Generate content for me', document: 'Create a new document', schedule: 'Schedule a meeting', note: 'Create a note' };
    this.showChatInterface();
    const command = map[action] || `Help me with ${action}`;
    this.addMessage('user', command);
    this.runQuickAction(action, command);
  }

  async runQuickAction(action, command) {
    // For now we reuse the main processor; pricing policies are handled there
    return this.processWithZantara(command);
  }

  showChatInterface() { const w = document.getElementById('welcome-screen'); const c = document.getElementById('chat-interface'); if (w) w.style.display = 'none'; if (c) c.style.display = 'flex'; localStorage.setItem('zantara_user', 'true'); }

  sendMessage() { const input = document.getElementById('message-input'); const text = (input?.value || '').trim(); if (!text) return; this.addMessage('user', text); if (input) input.value = ''; this.processWithZantara(text); }

  addMessage(sender, text, opts = { html: false }) {
    const container = document.querySelector('.messages-container'); if (!container) return;
    const div = document.createElement('div'); div.className = `message ${sender}`;
    const content = opts.html ? DOMPurify.sanitize(String(text)) : this.escape(text);
    if (sender === 'assistant') {
      div.innerHTML = DOMPurify.sanitize(`<div class="message-avatar"><img src="zantara_logo_transparent.png" alt="ZANTARA"></div><div class="message-bubble">${content}</div>`);
    } else {
      div.innerHTML = DOMPurify.sanitize(`<div class="message-bubble">${content}</div>`);
    }

    // Add click handler to copy message text
    const bubble = div.querySelector('.message-bubble');
    if (bubble) {
      bubble.style.cursor = 'pointer';
      bubble.addEventListener('click', () => {
        const textToCopy = text; // Use original text, not HTML
        navigator.clipboard.writeText(textToCopy).then(() => {
          // Show feedback
          const originalBg = bubble.style.background;
          bubble.style.background = 'rgba(139, 92, 246, 0.2)';
          setTimeout(() => { bubble.style.background = originalBg; }, 200);
        }).catch(err => console.error('Failed to copy:', err));
      });
    }

    container.appendChild(div); container.scrollTop = container.scrollHeight;
    this.messages.push({ sender, text, timestamp: Date.now(), html: !!opts.html });
    this.applyVirtualizationTrim();
    return div;
  }

  // Typing indicator bubble for assistant
  showTypingIndicator() {
    const c = document.querySelector('.messages-container'); if (!c) return;
    this.hideTypingIndicator();
    const d = document.createElement('div');
    d.className = 'message assistant typing-message';
    d.innerHTML = DOMPurify.sanitize(`
      <div class="message-avatar"><img src="zantara_logo_transparent.png" alt="ZANTARA"></div>
      <div class="message-bubble">
        <div class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `);
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
  }
  hideTypingIndicator() { const t = document.querySelector('.typing-message'); if (t) t.remove(); }

  async processWithZantara(text) {
    // Check if we should use streaming
    if (this.shouldUseStreaming(text)) {
      return this.processWithStreaming(text);
    }

    // Original processing logic
    return this.processWithZantaraRegular(text);
  }

  async processWithZantaraRegular(text) {
    try {
      this.showTypingIndicator();
      const api = window.ZANTARA_API;
      if (!api || !api.call) { this.hideTypingIndicator(); return this.renderAssistantReply('API not available.'); }

      // Optional: if a user types an email in a message, store it silently (no chat interruption)
      try {
        const emailMatch = String(text || '').match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
        if (emailMatch && emailMatch[0]) {
          localStorage.setItem('zantara-user-email', emailMatch[0]);
        }
      } catch (_) {}

      // Compute language for this message (message-driven)
      const profile = this.getCounterpartProfile();
      let msgLang = this.resolveMessageLanguage(text, profile);

      // Language switch intents (persist until changed)
      const intent = String(text || '').toLowerCase();
      const wantId = /(bahasa indonesia|pakai bahasa indonesia|bicara bahasa indonesia)/.test(intent);
      const wantIt = /(in italiano|parla italiano|italiano per favore|italian please)/.test(intent);
      const wantEn = /(in english|speak english|english please)/.test(intent);
      const wantUk = /(українськ|по-українськ|ukrainian)/.test(intent);
      if (wantId || wantIt || wantEn || wantUk) {
        const chosen = wantId ? 'id' : wantIt ? 'it' : wantEn ? 'en' : 'uk';
        try { localStorage.setItem('zantara-forced-lang', chosen); } catch(_) {}
        msgLang = chosen;
        this.hideTypingIndicator();
        const ack = (
          chosen === 'it' ? 'Ok, da ora rispondo in italiano.' :
          chosen === 'uk' ? 'Гаразд, відтепер відповідаю українською.' :
          chosen === 'en' ? 'Okay, I will reply in English from now on.' :
                            'Baik, mulai sekarang saya akan membalas dalam Bahasa Indonesia.'
        );
        return this.renderAssistantReply(ack);
      }

      // Friendly greeting handler (avoid irrelevant memory mentions)
      const t = String(text || '').trim().toLowerCase();
      const greet = /^(hi|hello|hey|ciao|halo|hallo|hai|hola|salve)\b/.test(t);
      if (greet) {
        this.hideTypingIndicator();
        // Minimal, business-first greeting with CTA in the chosen language
        const byLang = {
          it: 'Benvenuto. Scegli un’area: Visa • Company • Tax • Real Estate. Oppure scrivi la richiesta in una frase.',
          uk: 'Вітаю. Оберіть напрям: Віза • Компанія • Податки • Нерухомість. Або напишіть запит одним реченням.',
          id: 'Selamat datang. Pilih area: Visa • Company • Pajak • Properti. Atau tulis perintah singkat.',
          en: 'Welcome. Choose an area: Visa • Company • Tax • Real Estate. Or type your request in one sentence.'
        };
        const title = (
          msgLang === 'it' ? 'Benvenuto — Scegli un’area' :
          msgLang === 'uk' ? 'Вітаю — Оберіть напрям' :
          msgLang === 'en' ? 'Welcome — Choose An Area' :
                             'Selamat Datang — Pilih Area'
        );
        return this.renderStructured('landing', title, byLang[msgLang] || byLang.en, msgLang);
      }

      // "Who am I?" intent
      const whoAmI = /(chi sono|io chi sono|siapa aku|aku siapa|who am i\??)/i.test(String(text || ''));
      if (whoAmI) {
        this.hideTypingIndicator();
        const email = (localStorage.getItem('zantara-user-email') || '').trim();
        const name = email ? (email.split('@')[0] || '').replace(/\W+/g, ' ').trim() : '';
        let reply;
        if (email) {
          reply = (
            msgLang === 'it' ? `Sei ${name} (${email}).` :
            msgLang === 'uk' ? `Ви ${name} (${email}).` :
            msgLang === 'en' ? `You are ${name} (${email}).` :
                                `Kamu ${name} (${email}).`
          );
        } else {
          reply = (
            msgLang === 'it' ? 'Non ho i tuoi dati in questa sessione.' :
            msgLang === 'uk' ? 'У мене немає ваших даних у цій сесії.' :
            msgLang === 'en' ? 'I do not have your details in this session.' :
                                'Saya tidak memiliki datamu di sesi ini.'
          );
        }
        return this.renderAssistantReply(reply);
      }

      // "Who are you?" intent → succinct role (no self-intro as chatbot)
      const whoAreYou = /(chi sei\??|siapa kamu\??|kamu siapa\??|who are you\??|хто ти\??)/i.test(String(text || ''));
      if (whoAreYou) {
        this.hideTypingIndicator();
        const reply = (
          msgLang === 'it' ? 'Partner operativo di Bali Zero: cervello strategico, memoria e orchestrazione. Dimmi cosa vuoi fare.' :
          msgLang === 'uk' ? 'Операційний партнер Bali Zero: стратегічний мозок, пам’ять і оркестрація. Скажіть, що потрібно зробити.' :
          msgLang === 'en' ? 'Operational partner of Bali Zero: strategic brain, memory and orchestration. Tell me what you want to get done.' :
                              'Mitra operasional Bali Zero: otak strategis, memori, dan orkestrasi. Jelaskan yang ingin Anda capai.'
        );
        return this.renderAssistantReply(reply);
      }

      const wantsPricing = /\b(price|pricing|cost|fee|fees|prezzo|prezzi|costo|costi|harga|biaya)\b/i.test(text || '');
      const codeMatch = /\b(?:[CDE]\d{1,2}[A-Z]?)\b/i.exec(text || '');

      if (wantsPricing || codeMatch) {
        // Official pricing only (policy)
        const key = codeMatch ? 'price.lookup' : 'pricing.official';
        const params = codeMatch ? { service: codeMatch[0].toUpperCase() } : { service_type: 'all', include_details: true };
        const res = await api.call('/call', { key, params }, true);
        this.hideTypingIndicator();
        const blob = JSON.stringify(res || {});
        if (/PREZZI UFFICIALI 2025/i.test(blob)) {
          this.addMessage('assistant', 'Redirecting to official prices…');
          const retry = await api.call('/call', { key: 'pricing.official', params: { service_type: 'all', include_details: true } }, true);
          return this.renderAssistantReply(this.formatPricing(retry));
        }
        return this.renderAssistantReply(this.formatPricing(res));
      }

      // Default to webapp.chat (public endpoint, no API key required)
      let res;
      try {
        res = await api.call('/call', { key: 'webapp.chat', params: { message: text } }, true);
      } catch (e) {
        // Fallback error handling
        const msg = String(e && e.message || e || '');
        console.error('webapp.chat error:', msg);
        throw e;
      }
      this.hideTypingIndicator();
      let out = this.extractReply(res) || 'OK.';
      const profile = this.getCounterpartProfile();
      if (profile.isExternal) {
        out += '\n\nBali Zero is powered by humans, fueled by a thinking engine.';
      }
      const cat = this.detectCategory(text);
      const title = this.defaultTitle(cat, msgLang);
      return this.renderStructured(cat, title, out, msgLang);

    } catch (err) {
      this.hideTypingIndicator();
      console.error(err);
      const msg = String(err && err.message || err || '');
      if (/OpenAI failed/i.test(msg)) {
        return this.addMessage('assistant', 'AI chat is temporarily unavailable (backend config). Pricing and tools are available. Try asking for prices (e.g., "Price for D12").');
      }
      return this.addMessage('assistant', 'Request failed. Please try again.');
    }
  }

  detectCategory(text='') {
    const t = String(text).toLowerCase();
    if (/(\b[cd]\d{1,2}[a-z]?\b|visa|kitas|kitap|imigrasi|immigration)/i.test(t)) return 'visa';
    if (/(pt\s*pma|company|perseroan|izin usaha|license|oss\s*rba)/i.test(t)) return 'company';
    if (/(npwp|spt|pajak|tax|accounting|bpjs)/i.test(t)) return 'tax';
    if (/(pbg|slf|notaris|freehold|leasehold|due diligence|properti|property|real\s*estate)/i.test(t)) return 'property';
    return 'general';
  }

  defaultTitle(cat, lang='id') {
    const map = {
      visa: { id:'Visa — Langkah Berikutnya', it:'Visti — Prossimi Passi', en:'Visa — Next Steps', uk:'Віза — Наступні кроки' },
      company: { id:'Company — Set Up', it:'Company — Set Up', en:'Company — Set Up', uk:'Компанія — Запуск' },
      tax: { id:'Tax — Kepatuhan & Jadwal', it:'Tax — Compliance & Cadence', en:'Tax — Compliance & Cadence', uk:'Податки — Комплаєнс і графік' },
      property: { id:'Property — Due Diligence', it:'Property — Due Diligence', en:'Property — Due Diligence', uk:'Нерухомість — Due Diligence' },
      landing: { id:'Selamat Datang — Pilih Area', it:'Benvenuto — Scegli un’area', en:'Welcome — Choose An Area', uk:'Вітаю — Оберіть напрям' },
      general: { id:'ZANTARA — Rangkuman', it:'ZANTARA — Sintesi', en:'ZANTARA — Summary', uk:'ZANTARA — Підсумок' }
    };
    return (map[cat] && (map[cat][lang] || map[cat].en)) || 'ZANTARA';
  }

  renderStructured(category, title, body, lang='id') {
    // Build a structured card + chips and append as assistant message (HTML mode)
    const chips = this.langChips[lang] || this.langChips.en;
    const chipsHtml = chips.map(([icon,label]) => `<button class="action-chip" data-label="${this.escape(label)}">${this.escape(icon)} ${this.escape(label)}</button>`).join('');
    const html = DOMPurify.sanitize(`
      <div class="zantara-response">
        <h3 class="response-title">${this.escape(title)}</h3>
        <p class="response-body">${this.escape(body)}</p>
        <div class="action-chips" data-lang="${this.escape(lang)}" data-cat="${this.escape(category)}">${chipsHtml}</div>
      </div>
    `);
    const node = this.addMessage('assistant', html, { html: true });
    this.bindChips(node);
    return node;
  }

  bindChips(node) {
    try {
      const wrap = node.querySelector('.action-chips'); if (!wrap) return;
      const lang = wrap.getAttribute('data-lang') || 'id';
      const cat = wrap.getAttribute('data-cat') || 'general';
      wrap.querySelectorAll('.action-chip').forEach(btn => {
        btn.addEventListener('click', () => this.handleChipClick(btn.getAttribute('data-label') || '', lang, cat));
      });
    } catch (_) {}
  }

  handleChipClick(label, lang, cat) {
    const lower = (label || '').toLowerCase();
    if (/preventivo|quote|penawaran|кошторис/.test(lower)) return this.actionQuote(cat, lang);
    if (/chiama|call|telpon|дзвінок/.test(lower)) return this.actionCall15(lang);
    if (/documenti|documents|dokumen|документи/.test(lower)) return this.actionDocuments(cat, lang);
    if (/avvia|start|mulai|почати/.test(lower)) return this.actionStartProcess(cat, lang);
    if (/whatsapp/.test(lower)) return this.actionWhatsApp();
    if (/email/.test(lower)) return this.actionEmail();
  }

  actionWhatsApp() { window.open('https://wa.me/6285954241699','_blank','noopener'); }
  actionEmail() { location.href = 'mailto:info@balizero.com?subject=ZANTARA%20Web%20App'; }
  actionCall15(lang='id') { window.open('https://calendly.com/balizero/consultation','_blank','noopener'); this.addMessage('assistant', (lang==='it'?"Ti ho aperto il link per prenotare 15'":"I opened the link for a 15' consult."), { html:false }); }

  async actionQuote(cat, lang='id') {
    try {
      const api = window.ZANTARA_API; if (!api) return;
      const user = localStorage.getItem('zantara-user-email') || '';
      await api.call('/call', { key:'lead.save', params:{ channel:'webapp', category:cat, email:user, note:'Quote requested from structured chips' } }, true);
      this.addMessage('assistant', (lang==='it'?'Ok, preparo un preventivo e ti contatto via email.':'Baik, saya siapkan penawaran dan menghubungi via email.' ));
    } catch (_) { this.addMessage('assistant', (lang==='it'?'Errore temporaneo, riprova.':'Gangguan sementara, coba lagi.')); }
  }

  async actionDocuments(cat, lang='id') {
    // Stub: in assenza di endpoint requirements.*, rispondi con breve checklist generica
    const generic = (
      lang==='it' ? 'Documenti tipici: passaporto/ID, dati contatto, info servizio. Se vuoi, ti mando la checklist dettagliata via email.' :
      lang==='en' ? 'Typical docs: passport/ID, contact details, service info. I can send a detailed checklist by email.' :
      lang==='uk' ? 'Типові документи: паспорт/ID, контакти, інформація про послугу. Можу надіслати детальний список на email.' :
                    'Dokumen umum: paspor/ID, kontak, info layanan. Saya bisa kirim checklist rinci via email.'
    );
    this.addMessage('assistant', generic);
  }

  async actionStartProcess(cat, lang='id') {
    try {
      const api = window.ZANTARA_API; if (!api) return;
      const user = localStorage.getItem('zantara-user-email') || '';
      await api.call('/call', { key:'lead.save', params:{ channel:'webapp', category:cat, email:user, intent:'start' } }, true);
      this.addMessage('assistant', (lang==='it'?'Avvio registrato. Ti accompagno passo passo.':'Proses dimulai. Saya pandu langkah demi langkah.'));
    } catch (_) { this.addMessage('assistant', (lang==='it'?'Errore temporaneo, riprova.':'Gangguan sementara, coba lagi.')); }
  }

  extractReply(res) {
    if (!res) return '';
    // If backend returned a JSON string, parse it
    if (typeof res === 'string') {
      try { const p = JSON.parse(res); return this.extractReply(p); } catch(_) {}
    }
    if (typeof res.reply === 'string') return res.reply;
    if (typeof res.message === 'string') return res.message;
    if (typeof res.text === 'string') return res.text;
    try { if (Array.isArray(res.choices) && res.choices[0]?.message?.content) return res.choices[0].message.content; } catch(_){}
    try {
      if (res.data) {
        if (typeof res.data.response === 'string') return res.data.response; // openai.chat / ai.chat (wrapped)
        if (typeof res.data.reply === 'string') return res.data.reply;
        if (typeof res.data.text === 'string') return res.data.text;
      }
    } catch(_){}
    // Fallback: attempt to find a string under common keys deep inside the object
    try {
      const stack = [res];
      const keys = new Set(['response','reply','text','content']);
      while (stack.length) {
        const cur = stack.pop();
        if (!cur || typeof cur !== 'object') continue;
        for (const k of Object.keys(cur)) {
          const v = cur[k];
          if (typeof v === 'string' && keys.has(k)) return v;
          if (v && typeof v === 'object') stack.push(v);
        }
      }
    } catch(_) {}
    return JSON.stringify(res, null, 2);
  }

  formatPricing(res) {
    if (!res) return 'No pricing data available.';
    try {
      const data = res.data || res;
      const s = data.service || data.pricing || {};
      const name = s.name || s.title || 'Official pricing';
      const p1 = s.price_1y || s.price1 || s.one_year || '';
      const p2 = s.price_2y || s.price2 || s.two_years || '';
      const ext = s.extension || s.extend || '';
      const notes = s.notes ? `\nNote: ${s.notes}` : '';
      // Company canonical contacts
      const CONTACT = {
        email: 'info@balizero.com',
        whatsapp: '+62 859 5424 1699',
        website: 'https://balizero.com',
        app: 'https://zantara.balizero.com',
        landing: 'https://welcome.balizero.com'
      };
      const contact = data.contact || {};
      const email = contact.email || CONTACT.email;
      const wa = contact.whatsapp || CONTACT.whatsapp;
      const sites = `${CONTACT.website} | ${CONTACT.app} | ${CONTACT.landing}`;
      const contactLine = `\nContact: ${[email, wa].filter(Boolean).join(' | ')}\nSites: ${sites}`;
      const lines = [
        `Official pricing – ${name}`,
        [p1 && `• 1 Year: ${p1}`, p2 && `• 2 Years: ${p2}`, ext && `• Extension: ${ext}`].filter(Boolean).join('\n')
      ].filter(Boolean).join('\n');
      return (lines + notes + contactLine).trim();
    } catch(_) {
      return 'Official pricing available.';
    }
  }

  switchView(view) { console.log('Switching to view:', view); }
  escape(s) { return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

  renderAssistantReply(text) {
    // Clean generic self-intros or assistant boilerplate
    text = this.sanitizeReply(text);
    // Coerce JSON-looking strings into human text
    if (typeof text === 'string' && text.trim().startsWith('{') && text.trim().endsWith('}')) {
      try { const obj = JSON.parse(text); text = this.extractReply(obj) || text; } catch(_) {}
    }
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const streamingEnabled = !!(window.ZANTARA_STREAMING && window.ZANTARA_STREAMING.isEnabled && window.ZANTARA_STREAMING.isEnabled());
    if (!streamingEnabled || prefersReduced) { this.addMessage('assistant', text); return; }
    this.streamText(text);
  }

  streamText(text) {
    const node = this.addMessage('assistant', ''); const bubble = node?.querySelector('.message-bubble'); if (!bubble) return;
    const words = String(text).split(/(\s+)/); let i = 0;
    const step = () => { if (i >= words.length) { this.applyVirtualizationTrim(); return; } bubble.textContent += words[i++]; const delay = Math.min(80, 10 + Math.floor(text.length / 100)); setTimeout(step, delay); };
    step();
  }

  sanitizeReply(text) {
    try {
      let t = String(text || '');
      // Remove common self-intros in multiple languages at the start of the message
      t = t.replace(/^\s*(ciao!?\s*)?sono\s+zantara[,\.!]?\s*/i, '');
      t = t.replace(/^\s*(halo|hallo)!?\s*saya\s+zantara[,\.!]?\s*/i, '');
      t = t.replace(/^\s*i\s*am\s*zantara[,\.!]?\s*/i, '');
      t = t.replace(/^\s*я\s*зантара[,\.!]?\s*/i, '');
      // Remove “I can help you with …” boilerplate openers
      t = t.replace(/^\s*(posso\s+aiutarti|saya\s+bisa\s+membantu|i\s+can\s+help|я\s+можу\s+допомогти)[^\n]*\n?/i, '');
      return t.trim();
    } catch(_) { return text; }
  }

  applyVirtualizationTrim() {
    const base = (window.ZANTARA_VIRTUALIZATION && window.ZANTARA_VIRTUALIZATION.getMaxMessages) ? window.ZANTARA_VIRTUALIZATION.getMaxMessages() : 50;
    const max = base + (this.extraLoaded || 0);
    const container = document.querySelector('.messages-container'); if (!container) return;
    const nodes = container.querySelectorAll('.message'); const extra = nodes.length - max;
    for (let i = 0; i < extra; i++) container.removeChild(nodes[i]);
    const hiddenCount = Math.max(0, this.messages.length - (base + (this.extraLoaded || 0))); this.updateLoadEarlierChip(hiddenCount);
  }

  renderFromState() {
    const container = document.querySelector('.messages-container'); if (!container) return;
    const base = (window.ZANTARA_VIRTUALIZATION && window.ZANTARA_VIRTUALIZATION.getMaxMessages) ? window.ZANTARA_VIRTUALIZATION.getMaxMessages() : 50;
    const visibleCount = Math.min(this.messages.length, base + (this.extraLoaded || 0));
    const hiddenCount = Math.max(0, this.messages.length - visibleCount);
    container.innerHTML = '';
    if (hiddenCount > 0) container.appendChild(this.createLoadEarlierChip(hiddenCount));
    const visible = this.messages.slice(-visibleCount);
    for (const m of visible) {
      const div = document.createElement('div'); div.className = `message ${m.sender}`;
      const content = m.html ? DOMPurify.sanitize(String(m.text)) : this.escape(m.text);
      if (m.sender === 'assistant') div.innerHTML = DOMPurify.sanitize(`<div class="message-avatar"><img src="zantara_logo_transparent.png" alt="ZANTARA"></div><div class="message-bubble">${content}</div>`);
      else div.innerHTML = DOMPurify.sanitize(`<div class="message-bubble">${content}</div>`);

      // Add click handler to copy message text
      const bubble = div.querySelector('.message-bubble');
      if (bubble) {
        bubble.style.cursor = 'pointer';
        bubble.addEventListener('click', () => {
          const textToCopy = m.text; // Use original text
          navigator.clipboard.writeText(textToCopy).then(() => {
            // Show feedback
            const originalBg = bubble.style.background;
            bubble.style.background = 'rgba(139, 92, 246, 0.2)';
            setTimeout(() => { bubble.style.background = originalBg; }, 200);
          }).catch(err => console.error('Failed to copy:', err));
        });
      }

      container.appendChild(div);
    }
    container.scrollTop = container.scrollHeight;
  }

  createLoadEarlierChip(count) {
    const btn = document.createElement('button'); btn.id = 'load-earlier-chip'; btn.className = 'load-earlier-chip glass-card'; btn.type = 'button'; btn.setAttribute('aria-label', `Load earlier messages (${count})`); btn.textContent = `Load earlier (${count})`;
    btn.addEventListener('click', () => { const step = 20; const base = (window.ZANTARA_VIRTUALIZATION && window.ZANTARA_VIRTUALIZATION.getMaxMessages) ? window.ZANTARA_VIRTUALIZATION.getMaxMessages() : 50; const hidden = Math.max(0, this.messages.length - (base + (this.extraLoaded || 0))); const inc = Math.min(step, hidden); this.extraLoaded = (this.extraLoaded || 0) + inc; this.renderFromState(); });
    return btn;
  }

  updateLoadEarlierChip(count) { const container = document.querySelector('.messages-container'); if (!container) return; let chip = document.getElementById('load-earlier-chip'); if (count > 0) { if (!chip) { chip = this.createLoadEarlierChip(count); container.insertBefore(chip, container.firstChild); } else { chip.textContent = `Load earlier (${count})`; chip.setAttribute('aria-label', `Load earlier messages (${count})`); } } else if (chip) { chip.remove(); } }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const userEmail = localStorage.getItem('zantara-user-email');

  // Check if we're in a "safe build" mode (chat forced visible)
  const chatInterface = document.getElementById('chat-interface');
  const isSafeBuild = chatInterface && chatInterface.style.display === 'flex';

  if (!userEmail && !isSafeBuild) {
    // Not logged in and not in safe mode, redirect to login
    window.location.href = '/portal.html';
    return;
  }

  // If safe build mode, set a default email
  if (isSafeBuild && !userEmail) {
    localStorage.setItem('zantara-user-email', 'guest@zantara.app');
    localStorage.setItem('zantara-session-id', `sess_${Date.now()}`);
  }

  // Initialize app and show chat
  window.zantaraApp = new ZantaraApp();
  window.zantaraApp.showChatInterface();
});
    // Default language: Indonesian unless user explicitly changes it
    try { if (!localStorage.getItem('zantara-forced-lang')) localStorage.setItem('zantara-forced-lang', 'id'); } catch(_) {}
