// ZANTARA API Configuration
// This file manages API connections with CORS handling

const API_CONFIG = {
  // Production ZANTARA endpoints
  production: {
    // Unified Cloud Run endpoint with CORS enabled
    base: 'https://zantara-v520-chatgpt-patch-himaadsxua-ew.a.run.app',
    call: '/call',
    health: '/health'
  },

  // No public CORS proxies needed (Cloud Run CORS enabled)

  // API Key (should be in environment variable in production)
  apiKey: 'zantara-internal-dev-key-2025',

  // Default headers
  headers: {
    'Content-Type': 'application/json'
  }
};

// Lightweight Telemetry
const ZTelemetry = (() => {
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
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isCustomDomain = window.location.hostname === 'zantara.balizero.com';
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    let apiUrl = API_CONFIG.production.base + endpoint;

    // For development, use local proxy
    if (isDevelopment) {
      apiUrl = 'http://localhost:3003' + endpoint;
      console.log('Using local proxy for development');
    }

    const started = performance.now();
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        ...API_CONFIG.headers,
        'x-api-key': API_CONFIG.apiKey,
        ...(typeof window !== 'undefined' && window.ZANTARA_SESSION_ID
          ? { 'x-session-id': window.ZANTARA_SESSION_ID }
          : {})
      },
      body: JSON.stringify(data)
    });

    const ms = Math.round(performance.now() - started);
    const key = (data && (data.key || data?.params?.key)) || endpoint;

    if (!response.ok) {
      ZTelemetry.record({ key, endpoint, ok: false, ms, ts: Date.now(), error: `HTTP ${response.status}` });
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
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

// Function to check API health
async function checkAPIHealth() {
  try {
    const isGitHubPages = window.location.hostname.includes('github.io');
    const isCustomDomain = window.location.hostname === 'zantara.balizero.com';
    let healthUrl = API_CONFIG.production.base + '/health';

    if (isGitHubPages || isCustomDomain) {
      // For health check, try direct first (no auth needed)
      const response = await fetch(healthUrl);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ ZANTARA API is healthy:', data);
        return true;
      }
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

  window.ZANTARA_API = {
    config: API_CONFIG,
    call: callZantaraAPI,
    checkHealth: checkAPIHealth,
    setBase: (base) => { if (typeof base === 'string' && base.startsWith('http')) API_CONFIG.production.base = base; }
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
    } else {
      console.log('🟡 ZANTARA API not reachable, some features may be limited');

      // Show a user-friendly message
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
        <a href="#" style="color: #fbbf24; text-decoration: underline; margin-left: 8px;"
           onclick="this.parentElement.remove(); return false;">Dismiss</a>
      `;
      document.body.appendChild(notification);

      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 10000);
    }
  });
});
