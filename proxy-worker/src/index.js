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

    // Build upstream request
    const headers = new Headers(request.headers);
    headers.set('x-api-key', env.ZANTARA_API_KEY); // inject server-side secret
    // Allow x-user-id to pass through for user context
    // Remove problematic headers for Cloud Run if any
    headers.delete('host');

    const upstream = new Request(base + path, {
      method: request.method,
      headers,
      body: request.method === 'GET' ? undefined : await request.clone().arrayBuffer(),
    });

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
