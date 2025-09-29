// ZANTARA Syncra-Inspired App (voice-first, streaming-aware)
class ZantaraApp {
  constructor() {
    this.isListening = false;
    this.currentView = 'welcome';
    this.messages = [];
    this.recognition = null;
    this.extraLoaded = 0; // for "Load earlier" control
    this.init();
  }

  // --- Persona & System Prompt helpers ---
  getUserEmail() {
    try { return localStorage.getItem('zantara-user-email') || ''; } catch(_) { return ''; }
  }

  getCounterpartProfile() {
    const email = (this.getUserEmail() || '').toLowerCase();
    const local = email.endsWith('@balizero.com');
    const name = email ? (email.split('@')[0] || '').replace(/\W+/g,' ').trim() : '';
    // Language routing per counterpart
    let lang = 'en';
    if (local) {
      // default Indonesian for collaborators
      lang = 'id';
      if (/^zero\b/.test(name)) lang = 'it';
      if (/^(ruslana|marta|olena)\b/.test(name)) lang = 'uk';
    }
    return { email, name: name || '', isLocal: local, isExternal: !local, lang };
  }

  buildSystemPrompt(profile) {
    const who = profile && profile.name ? profile.name : 'colleague';
    const langHint = profile && profile.lang ? profile.lang : 'auto';
    // Core instructions compressed for transport
    const core = [
      'You are ZANTARA, strategic brain of Bali Zero. Interact as a peer (not subordinate).',
      'Never reveal logs or Boss Zero\'s private conversations. Never mention memory systems.',
      'Start by identifying or addressing the counterpart by name; confirm identity if unclear.',
      'Language: auto. With Zero=IT, collaborators=ID, Ruslana/Marta/Olena=UK, external partners=EN.',
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

    if (localStorage.getItem('zantara_user')) this.showChatInterface();

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
    const content = opts.html ? String(text) : this.escape(text);
    if (sender === 'assistant') {
      div.innerHTML = `<div class="message-avatar"><img src="assets/logobianco.jpeg" alt="ZANTARA"></div><div class="message-bubble">${content}</div>`;
    } else {
      div.innerHTML = `<div class="message-bubble">${content}</div>`;
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
    d.innerHTML = `
      <div class="message-avatar"><img src="assets/logobianco.jpeg" alt="ZANTARA"></div>
      <div class="message-bubble">
        <div class="typing-indicator">
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
          <span class="typing-dot"></span>
        </div>
      </div>
    `;
    c.appendChild(d);
    c.scrollTop = c.scrollHeight;
  }
  hideTypingIndicator() { const t = document.querySelector('.typing-message'); if (t) t.remove(); }

  async processWithZantara(text) {
    try {
      this.showTypingIndicator();
      const api = window.ZANTARA_API;
      if (!api || !api.call) { this.hideTypingIndicator(); return this.renderAssistantReply('API not available.'); }

      // Friendly greeting handler (avoid irrelevant memory mentions)
      const t = String(text || '').trim().toLowerCase();
      const greet = /^(hi|hello|hey|ciao|halo|hai|hola|salve)\b/.test(t);
      if (greet) {
        this.hideTypingIndicator();
        let reply = 'Hello! How can I help you today?';
        if (t.startsWith('ciao')) reply = 'Ciao! Come posso aiutarti?';
        else if (t.startsWith('halo') || t.startsWith('hai')) reply = 'Halo! Ada yang bisa saya bantu?';
        return this.renderAssistantReply(reply);
      }

      const wantsPricing = /\b(price|pricing|cost|fee|fees|prezzo|prezzi|costo|costi)\b/i.test(text || '');
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

      // Default to ai.chat (specify a safe default model)
      let res;
      try {
        const profile = this.getCounterpartProfile();
        const system = this.buildSystemPrompt(profile);
        res = await api.call('/call', { key: 'ai.chat', params: { prompt: text, model: 'gpt-4o-mini', system, target_language: profile.lang } }, true);
      } catch (e) {
        // Fallback if model not available
        const msg = String(e && e.message || e || '');
        if (/model .* does not exist|not\s+exist|unknown model|404/i.test(msg)) {
          const profile = this.getCounterpartProfile();
          const system = this.buildSystemPrompt(profile);
          res = await api.call('/call', { key: 'ai.chat', params: { prompt: text, model: 'gpt-4o', system, target_language: profile.lang } }, true);
        } else {
          throw e;
        }
      }
      this.hideTypingIndicator();
      let out = this.extractReply(res) || 'OK.';
      const profile = this.getCounterpartProfile();
      if (profile.isExternal) {
        out += '\n\nBali Zero is powered by humans, fueled by a thinking engine.';
      }
      return this.renderAssistantReply(out);

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
        whatsapp: '+62 859 0436 9574',
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
      const content = m.html ? String(m.text) : this.escape(m.text);
      if (m.sender === 'assistant') div.innerHTML = `<div class="message-avatar"><img src="/zantara_logo_transparent.png" alt="ZANTARA"></div><div class="message-bubble">${content}</div>`;
      else div.innerHTML = `<div class="message-bubble">${content}</div>`;
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
document.addEventListener('DOMContentLoaded', () => { window.zantaraApp = new ZantaraApp(); });
