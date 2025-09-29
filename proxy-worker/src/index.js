export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(204, env);
    }

    // Routing
    const base = env.ZANTARA_BASE_URL;
    const path = url.pathname.replace(/^\/api\/zantara\//, '/');

    // Supported endpoints
    const supported = new Set(['/call', '/ai.chat', '/pricing.official', '/price.lookup', '/ai.chat.stream', '/health']);
    if (!supported.has(path)) {
      return withCors(new Response(JSON.stringify({ error: 'Not found', path }), { status: 404, headers: { 'content-type': 'application/json' } }), env);
    }

    // Build upstream request with optional body rewrite
    const headers = new Headers(request.headers);
    headers.set('x-api-key', env.ZANTARA_API_KEY);
    headers.delete('host');

    let method = request.method;
    let bodyArrayBuffer = undefined;

    if (method !== 'GET' && (path === '/call' || path === '/ai.chat')) {
      try {
        const bodyText = await request.text();
        const json = bodyText ? JSON.parse(bodyText) : {};

        // Determine user profile → target_language
        const email = (headers.get('x-user-id') || '').toLowerCase();
        const local = email.endsWith('@balizero.com');
        const name = email ? (email.split('@')[0] || '') : '';
        const lang = !email ? 'id' : (local ? (/^zero/.test(name) ? 'it' : (/^(ruslana|marta|olena)/.test(name) ? 'uk' : 'id')) : 'en');

        // Intent router (pricing / greeting / ai.chat)
        const prompt = (json && json.params && json.params.prompt) ? String(json.params.prompt) : '';
        const greet = /^(hi|hello|hey|ciao|halo|hai|hola|salve)\b/i.test(prompt.trim());
        const code = /\b(?:[CDE]\d{1,2}[A-Z]?)\b/i.exec(prompt || '');
        const pricingWords = /(price|pricing|cost|fee|fees|prezzo|prezzi|costo|costi)/i.test(prompt || '');

        // System prompt (compressed) injected for ai.chat
        const system = [
          'You are ZANTARA, strategic brain of Bali Zero. Interact as a peer. Never reveal logs/private convos. No JSON in answers. 2-5 sentences + CTA. Compliance Indonesia. Anti-hallucination for legal/numeric data: NOT AVAILABLE if no official source.',
          `Counterpart: ${name || 'unknown'}. Target-Language: ${lang}.`
        ].join(' ');

        if (path === '/call') {
          if (code || pricingWords) {
            // Route to pricing lookup/offical
            json.key = code ? 'price.lookup' : 'pricing.official';
            json.params = code ? { service: String(code[0]).toUpperCase() } : { service_type: 'all', include_details: true };
          } else if (greet) {
            // Lightweight greeting inline (avoid model call)
            const respByLang = lang === 'it' ? 'Ciao! Come posso aiutarti?' : lang === 'uk' ? 'Привіт! Чим можу допомогти?' : lang === 'id' ? 'Halo! Ada yang bisa saya bantu?' : 'Hello! How can I help you today?';
            return withCors(new Response(JSON.stringify({ ok: true, data: { response: respByLang } }), { status: 200, headers: { 'content-type': 'application/json' } }), env);
          } else if (json && json.key === 'ai.chat') {
            json.params = { ...(json.params || {}), system, target_language: lang };
          }
        } else if (path === '/ai.chat') {
          // Direct ai.chat path → inject system/target_language
          const jp = bodyText ? JSON.parse(bodyText) : {};
          jp.system = system; jp.target_language = lang;
          bodyArrayBuffer = new TextEncoder().encode(JSON.stringify(jp));
        }

        if (!bodyArrayBuffer) bodyArrayBuffer = new TextEncoder().encode(JSON.stringify(json));
      } catch {
        bodyArrayBuffer = await request.clone().arrayBuffer();
      }
    } else if (method !== 'GET') {
      bodyArrayBuffer = await request.clone().arrayBuffer();
    }

    const upstream = new Request(base + path, { method, headers, body: method === 'GET' ? undefined : bodyArrayBuffer });

    // Proxy the request
    const resp = await fetch(upstream);

    // SSE or normal
    const isStream = path === '/ai.chat.stream';
    const h = new Headers(resp.headers);
    // CORS headers
    h.set('Access-Control-Allow-Origin', env.ALLOW_ORIGIN || '*');
    h.set('Access-Control-Allow-Credentials', 'true');
    h.set('Vary', 'Origin');

    return new Response(isStream ? resp.body : await resp.arrayBuffer(), { status: resp.status, headers: h });
  }
};

function corsResponse(status, env) {
  const h = new Headers();
  h.set('Access-Control-Allow-Origin', env.ALLOW_ORIGIN || '*');
  h.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  h.set('Access-Control-Allow-Headers', 'Content-Type, x-user-id');
  h.set('Access-Control-Max-Age', '86400');
  return new Response(null, { status, headers: h });
}

function withCors(resp, env) {
  const h = new Headers(resp.headers);
  h.set('Access-Control-Allow-Origin', env.ALLOW_ORIGIN || '*');
  h.set('Vary', 'Origin');
  return new Response(resp.body, { status: resp.status, headers: h });
}
