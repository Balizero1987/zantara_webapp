// ZANTARA Syncra-Inspired App (voice-first, streaming-aware)
class ZantaraApp {
  constructor() {
    this.isListening = false;
    this.currentView = 'welcome';
    this.messages = [];
    this.recognition = null;
    this.extraLoaded = 0; // for "Load earlier"
    this.init();
  }

  init() {
    setTimeout(() => {
      const splash = document.getElementById('splash-screen');
      if (splash) { splash.classList.add('hidden'); setTimeout(() => splash.remove(), 500); }
    }, 2000);

    this.initEventListeners();
    this.initVoiceRecognition();

    if (localStorage.getItem('zantara_user')) this.showChatInterface();

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

  startVoiceRecording() { const o = document.getElementById('voice-overlay'); if (o) o.style.display = 'flex'; if (this.recognition) { this.recognition.start(); this.isListening = true; const t = document.querySelector('.listening-text'); if (t) t.textContent = 'Listening...'; } }
  stopVoiceRecording() { const o = document.getElementById('voice-overlay'); if (o) o.style.display = 'none'; if (this.recognition && this.isListening) { this.recognition.stop(); this.isListening = false; } }

  processVoiceCommand(transcript) { this.stopVoiceRecording(); this.showChatInterface(); this.addMessage('user', transcript); this.processWithZantara(transcript); }

  handleQuickAction(action) {
    const map = { generate: 'Generate content for me', document: 'Create a new document', schedule: 'Schedule a meeting', note: 'Create a note' };
    this.showChatInterface();
    const command = map[action] || `Help me with ${action}`;
    this.addMessage('user', command);
    this.runQuickAction(action, command);
  }

  showChatInterface() { const w = document.getElementById('welcome-screen'); const c = document.getElementById('chat-interface'); if (w) w.style.display = 'none'; if (c) c.style.display = 'flex'; localStorage.setItem('zantara_user', 'true'); }

  sendMessage() { const input = document.getElementById('message-input'); const text = (input?.value || '').trim(); if (!text) return; this.addMessage('user', text); if (input) input.value = ''; this.processWithZantara(text); }

  addMessage(sender, text, opts = { html: false }) {
    const container = document.querySelector('.messages-container'); if (!container) return;
    const div = document.createElement('div'); div.className = `message ${sender}`;
    const content = opts.html ? String(text) : this.escape(text);
    if (sender === 'assistant') {
      div.innerHTML = `<div class="message-avatar"><img src="zantara_logo_transparent.png" alt="ZANTARA"></div><div class="message-bubble">${content}</div>`;
    } else {
      div.innerHTML = `<div class="message-bubble">${content}</div>`;
    }
    container.appendChild(div); container.scrollTop = container.scrollHeight;
    this.messages.push({ sender, text, timestamp: Date.now(), html: !!opts.html });
    this.applyVirtualizationTrim();
    return div;
  }

  showTypingIndicator() { const c = document.querySelector('.messages-container'); if (!c) return; const d = document.createElement('div'); d.className = 'message assistant typing-message'; d.innerHTML = `<div class="message-avatar"><img src="zantara_logo_transparent.png" alt="ZANTARA" class="thinking"></div><div class="message-bubble"><div class="typing-indicator"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div></div>`; c.appendChild(d); c.scrollTop = c.scrollHeight; }
  hideTypingIndicator() { document.querySelector('.typing-message')?.remove(); }

  async processWithZantara(text) {
    this.showTypingIndicator(); const api = window.ZANTARA_API;
    try {
      if (api?.call) {
        const res = await api.call('/call', { key: 'ai.chat', params: { prompt: text } }, true);
        const reply = this.extractReply(res); this.hideTypingIndicator(); this.renderAssistantReply(reply || 'OK.');
      } else {
        setTimeout(() => { this.hideTypingIndicator(); this.renderAssistantReply(`I understand you want to: "${text}". Let me help you with that.`); }, 1000);
      }
    } catch (e) { this.hideTypingIndicator(); this.renderAssistantReply(`There was a problem contacting ZANTARA. (${e.message})`); }
  }

  extractReply(res) { if (!res) return ''; if (typeof res === 'string') return res; return (res.reply || res.message || res.text || res?.data?.reply || res?.choices?.[0]?.message?.content || JSON.stringify(res)); }

  processToolCommand(text) {
    const card = `<div class="tool-card"><div class="tool-header"><img src="zantara_logo_transparent.png" class="lotus-mini" alt=""><span>Processing your request...</span></div><div class="tool-progress"><div class="tool-progress-bar" style="width: 0%"></div></div></div>`;
    this.addMessage('assistant', `I'm working on that for you. ${card}`, { html: true });
    setTimeout(() => { const bars = document.querySelectorAll('.tool-progress-bar'); const bar = bars[bars.length - 1]; if (bar) bar.style.width = '100%'; }, 100);
  }

  async runQuickAction(action, originalText) {
    const api = window.ZANTARA_API;
    const showCard = () => { const html = `<div class="tool-card"><div class="tool-header"><img src="zantara_logo_transparent.png" class="lotus-mini" alt=""><span>Processing your request...</span></div><div class="tool-progress"><div class="tool-progress-bar" style="width: 0%"></div></div></div>`; this.addMessage('assistant', html, { html: true }); const bars = document.querySelectorAll('.tool-progress-bar'); return bars[bars.length - 1] || null; };
    const bar = showCard(); const setBar = (p) => { if (bar) bar.style.width = `${p}%`; }; setBar(20);
    if (!api?.call) { setBar(100); this.addMessage('assistant', `No backend available. I’ll handle "${originalText}" for you.`); return; }
    const now = new Date(); const in1h = new Date(Date.now() + 3600e3); const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    const variantsByAction = {
      generate: [ { key: 'zantara.create.content', params: { topic: originalText || 'general', format: 'short' } }, { key: 'ai.chat', params: { prompt: `[Quick Action: Generate] ${originalText || 'Generate content for me.'}` } } ],
      document: [ { key: 'zantara.create.document', params: { title: `ZANTARA Doc - ${now.toISOString().slice(0, 10)}`, content: originalText || 'New document from quick action.' } }, { key: 'docs.create', params: { title: `ZANTARA Doc - ${now.toISOString().slice(0, 10)}`, body: { content: [ { paragraph: { elements: [ { textRun: { content: (originalText || 'New document') + '\n', textStyle: { bold: true } } } ] } } ] } } }, { key: 'ai.chat', params: { prompt: `[Quick Action: Document] ${originalText || 'Create a document.'}` } } ],
      schedule: [ { key: 'zantara.calendar.event', params: { summary: 'Quick Meeting', description: originalText || 'Scheduled via Quick Action', startTime: now.toISOString(), endTime: in1h.toISOString(), timeZone: tz } }, { key: 'calendar.create', params: { event: { summary: 'ZANTARA Quick Meeting', description: originalText || 'Created by ZANTARA', start: { dateTime: now.toISOString(), timeZone: tz }, end: { dateTime: in1h.toISOString(), timeZone: tz }, attendees: [] } } }, { key: 'ai.chat', params: { prompt: `[Quick Action: Schedule] ${originalText || 'Schedule a meeting.'}` } } ],
      note: [ { key: 'zantara.create.note', params: { content: originalText || 'Quick note', tags: ['quick-action'] } }, { key: 'ai.chat', params: { prompt: `[Quick Action: Note] ${originalText || 'Create a note.'}` } } ],
    };
    const variants = variantsByAction[action] || [ { key: 'ai.chat', params: { prompt: originalText || `Help me with ${action}` } } ];
    const call = async (key, params) => api.call('/call', { key, params }, true);
    let response = null; let usedKey = '';
    for (let i = 0; i < variants.length; i++) { const v = variants[i]; try { setBar(20 + Math.round(((i + 1) / variants.length) * 60)); const res = await call(v.key, v.params); if (res && (res.ok || res.status === 200 || res.result || res.reply || res.message)) { response = res; usedKey = v.key; break; } } catch (_) { continue; } }
    setBar(100); const reply = this.extractReply(response) || `Done via ${usedKey || 'fallback'}.`; this.renderAssistantReply(reply);
  }

  switchView(view) { console.log('Switching to view:', view); }
  escape(s) { return String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

  renderAssistantReply(text) {
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
      if (m.sender === 'assistant') div.innerHTML = `<div class="message-avatar"><img src="zantara_logo_transparent.png" alt="ZANTARA"></div><div class="message-bubble">${content}</div>`;
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

document.addEventListener('DOMContentLoaded', () => { window.zantaraApp = new ZantaraApp(); });

