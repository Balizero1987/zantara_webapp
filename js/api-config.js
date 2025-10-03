// ZANTARA API Configuration
// This file manages API connections with CORS handling

const API_CONFIG = {
  // Mode: 'proxy' in production (recommended), 'direct' only for local/dev
  mode: 'proxy', // prod default: proxy-first (LIVE)
  // Proxy/BFF endpoints (server-side adds x-api-key, client sends x-user-id)
  proxy: {
    production: {
      // CORRECTED 2025-10-03 06:30: Using actual deployed Cloud Run URL
      base: (typeof window !== 'undefined' && (window.ZANTARA_PROXY_BASE || localStorage.getItem('zantara-proxy-base'))) || 'https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app',
      call: '/call',
      ai: '/ai.chat',
      aiStream: '/ai.chat.stream',
      pricingOfficial: '/pricing.official',
      priceLookup: '/price.lookup',
      health: '/health'
    }
  },
  // Direct endpoints (Cloud Run) — used only when explicitly forced in dev
  production: {
    base: 'https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app',
    call: '/call',
    health: '/health'
  },
  // Streaming configuration
  streaming: {
    path: '/chat' // NDJSON endpoint (proxied as /api/zantara/chat)
  },
  // Default headers (client)
  headers: { 'Content-Type': 'application/json' }
};

// Lightweight Telemetry
const ZTelemetry = (() => {
  // Dev mode detection for safe, non-intrusive console summaries
  let DEV_MODE = false;
  try {
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(location.search);
      DEV_MODE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || p.get('dev') === 'true');
    }
  } catch (_) {}
  const state = {
    total: 0,
    ok: 0,
    err: 0,
    calls: [], // last 200 calls
    perKey: new Map(), // key -> {count, ok, err, latencies: number[<=50], lastMs}
  };

  const clampArr = (arr, max) => { if (arr.length > max) arr.splice(0, arr.length - max); };

  const record = ({ key, endpoint, ok, ms, ts, error }) => {
    state.total += 1;
    if (ok) state.ok += 1; else state.err += 1;
    state.calls.push({ ts, key, endpoint, ok, ms, error: error ? String(error) : undefined });
    clampArr(state.calls, 200);

    const k = key || endpoint || 'unknown';
    if (!state.perKey.has(k)) state.perKey.set(k, { count: 0, ok: 0, err: 0, latencies: [], lastMs: 0 });
    const rec = state.perKey.get(k);
    rec.count += 1;
    rec.lastMs = ms;
    if (ok) rec.ok += 1; else rec.err += 1;
    rec.latencies.push(ms);
    clampArr(rec.latencies, 50);

    // Dev-only: concise rolling summary for quick triage (every 5 calls)
    try {
      if (DEV_MODE && state.total % 5 === 0) {
        const per = summary();
        const k = key || endpoint || 'unknown';
        const stats = per.perKey[k] || { count: 0, ok: 0, err: 0, avgMs: 0, p95Ms: 0, lastMs: ms };
        // Single-line snapshot to avoid noisy logs
        console.log(
          `[ZANTARA][Telemetry] calls=${per.totals.total} ok=${per.totals.ok} err=${per.totals.err} | ` +
          `key=${k} last=${stats.lastMs}ms avg=${stats.avgMs}ms p95=${stats.p95Ms}ms`
        );
      }
    } catch(_) {}
  };

  const percentile = (arr, p) => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a,b)=>a-b);
    const idx = Math.min(s.length - 1, Math.max(0, Math.floor((p/100)*s.length - 1)));
    return s[idx];
  };

  const avg = (arr) => arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : 0;

  const summary = () => {
    const perKey = {};
    for (const [k, v] of state.perKey.entries()) {
      perKey[k] = {
        count: v.count,
        ok: v.ok,
        err: v.err,
        lastMs: v.lastMs,
        avgMs: avg(v.latencies),
        p95Ms: percentile(v.latencies, 95)
      };
    }
    return {
      totals: { total: state.total, ok: state.ok, err: state.err },
      perKey
    };
  };

  const print = () => {
    const s = summary();
    console.log('[ZANTARA][Telemetry] totals:', s.totals);
    const top = Object.entries(s.perKey)
      .sort((a,b)=>b[1].count - a[1].count)
      .slice(0, 6)
      .map(([k,v])=>`${k}: c=${v.count} ok=${v.ok} err=${v.err} avg=${v.avgMs}ms p95=${v.p95Ms}ms last=${v.lastMs}ms`);
    if (top.length) console.log('[ZANTARA][Telemetry] top keys:', top.join(' | '));
    return s;
  };

  const reset = () => { state.total=state.ok=state.err=0; state.calls.length=0; state.perKey.clear(); };

  return { record, summary, print, reset };
})();

// Function to make API calls with CORS handling
async function callZantaraAPI(endpoint, data, useProxy = true) {
  try {
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const forceDirect = (new URLSearchParams(location.search)).get('direct') === 'true';

    // Determine base URL: prefer proxy in production
    let base = '';
    let viaProxy = API_CONFIG.mode === 'proxy' && !forceDirect;
    if (viaProxy) {
      base = API_CONFIG.proxy.production.base;
      if (!base) {
        // Allow setting at runtime
        const overrideProxy = (typeof window !== 'undefined' && (window.ZANTARA_PROXY_BASE || localStorage.getItem('zantara-proxy-base')));
        if (overrideProxy) base = overrideProxy;
      }
      // If still no proxy base, fallback to direct only in dev
      if (!base) {
        viaProxy = false;
      }
    }

    let apiUrl = '';
    if (viaProxy) {
      apiUrl = base + endpoint;
    } else {
      // Direct mode: only allowed in dev or if explicitly forced (for testing)
      apiUrl = API_CONFIG.production.base + endpoint;
      if (isDevelopment) {
        apiUrl = 'http://localhost:3003' + endpoint;
        console.log('Using local proxy for development');
      }
    }

    const started = performance.now();
    // Build headers: never send x-api-key from client; always include x-user-id if available
    const userId = (typeof window !== 'undefined') ? (localStorage.getItem('zantara-user-email') || '') : '';
    const headers = {
      ...API_CONFIG.headers,
      ...(userId ? { 'x-user-id': userId } : {})
    };

    // Exponential backoff (429/5xx)
    const attempt = async (n) => {
      const resp = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
      });
      if (resp.status === 429 || resp.status >= 500) {
        if (n < 3) { await new Promise(r => setTimeout(r, Math.pow(2, n) * 500)); return attempt(n + 1); }
      }
      return resp;
    };

    const response = await attempt(0);

    const ms = Math.round(performance.now() - started);
    const key = (data && (data.key || data?.params?.key)) || endpoint;

    if (!response.ok) {
      let extra = '';
      try {
        const clone = response.clone();
        const data = await clone.json();
        if (data && data.error) extra = ` | ${data.error}`;
      } catch (_) {
        try { const t = await response.clone().text(); if (t) extra = ` | ${String(t).slice(0,200)}`; } catch(_) {}
      }
      ZTelemetry.record({ key, endpoint, ok: false, ms, ts: Date.now(), error: `HTTP ${response.status}${extra}` });
      throw new Error(`HTTP ${response.status}: ${response.statusText}${extra}`);
    }

    const json = await response.json();
    const ok = !!(json && (json.ok || json.status === 200 || json.reply || json.message || json.text));
    ZTelemetry.record({ key, endpoint, ok, ms, ts: Date.now() });
    return json;

  } catch (error) {
    try {
      const key = (data && (data.key || data?.params?.key)) || endpoint;
      const ms = typeof performance !== 'undefined' ? Math.round((performance.now && performance.now()) || 0) : 0;
      ZTelemetry.record({ key, endpoint, ok: false, ms, ts: Date.now(), error });
    } catch (_) {}
    console.error('API call failed:', error);

    throw error;
  }
}

// Function to check API health (tries proxy then backend)
async function checkAPIHealth() {
  try {
    const proxyBase = (API_CONFIG.proxy.production.base || (typeof window !== 'undefined' && (window.ZANTARA_PROXY_BASE || localStorage.getItem('zantara-proxy-base')))) || '';
    const directBase = API_CONFIG.production.base;

    if (proxyBase) {
      try {
        const r = await fetch(proxyBase + '/health', { method: 'GET' });
        if (r.ok) { try { console.log('✅ ZANTARA API (proxy) healthy:', await r.clone().json()); } catch(_){}; return true; }
      } catch (_) {}
    }
    if (directBase) {
      const r2 = await fetch(directBase + '/health', { method: 'GET' });
      if (r2.ok) { try { console.log('✅ ZANTARA API (backend) healthy:', await r2.clone().json()); } catch(_){}; return true; }
    }
    return false;
  } catch (error) {
    console.warn('❌ ZANTARA API health check failed:', error);
    return false;
  }
}

// Export for use in other scripts
if (typeof window !== 'undefined') {
  // Allow base override via global or localStorage for flexibility
  try {
    const overrideBase = window.ZANTARA_API_BASE || localStorage.getItem('zantara-api-base');
    if (overrideBase && typeof overrideBase === 'string') {
      API_CONFIG.production.base = overrideBase;
    }
  } catch (_) {}

  // Helper function to get streaming URL
  function getStreamingUrl() {
    const isProxy = API_CONFIG.mode === 'proxy';
    if (isProxy) {
      return `${API_CONFIG.proxy.production.base}${API_CONFIG.streaming.path}`; // /api/zantara/chat
    }
    return `${API_CONFIG.production.base}${API_CONFIG.streaming.path}`; // /api/chat
  }

  window.ZANTARA_API = {
    config: API_CONFIG,
    call: callZantaraAPI,
    checkHealth: checkAPIHealth,
    setBase: (base) => { if (typeof base === 'string' && base.startsWith('http')) API_CONFIG.production.base = base; },
    getStreamingUrl: getStreamingUrl
  };

  // Expose Telemetry API
  window.ZANTARA_TELEMETRY = {
    print: () => ZTelemetry.print(),
    getSummary: () => ZTelemetry.summary(),
    reset: () => ZTelemetry.reset()
  };

  // Periodic console heartbeat (dev-friendly)
  try {
    const isDev = window.location.hostname === 'localhost' || new URLSearchParams(location.search).get('dev') === 'true';
    if (isDev) setInterval(() => { ZTelemetry.print(); }, 30000);
  } catch (_) {}
}

// Auto-check health on load
document.addEventListener('DOMContentLoaded', () => {
  checkAPIHealth().then(healthy => {
    if (healthy) {
      console.log('🟢 ZANTARA API connection established');
      return;
    }
    console.log('🟡 ZANTARA API not reachable, some features may be limited');

    // Only show the Limited Mode banner in development (or with ?dev=true)
    try {
      const params = new URLSearchParams(location.search);
      const isDev = (location.hostname === 'localhost' || location.hostname === '127.0.0.1' || params.get('dev') === 'true');
      if (!isDev) return;
    } catch (_) {}

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(251, 191, 36, 0.1);
      border: 1px solid rgba(251, 191, 36, 0.3);
      color: #fbbf24;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      z-index: 9999;
      backdrop-filter: blur(10px);
    `;
    notification.innerHTML = `
      <strong>Limited Mode:</strong> Using demo data.
      <a href="#" style="color: #fbbf24; text-decoration: underline; margin-left: 8px;" onclick="this.parentElement.remove(); return false;">Dismiss</a>
    `;
    document.body.appendChild(notification);
    setTimeout(() => { if (notification.parentElement) notification.remove(); }, 10000);
  });
});
