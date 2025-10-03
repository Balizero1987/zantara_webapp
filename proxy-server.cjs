const http = require('http');
const https = require('https');

const PORT = 3003;
// Use local ZANTARA if running, otherwise production
const USE_LOCAL = true; // Set to false for production API
const TARGET_API = USE_LOCAL
  ? 'http://localhost:8080'
  : 'https://zantara-v520-nuzantara-himaadsxua-ew.a.run.app';

const server = http.createServer((req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, x-session-id');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Proxy the request
    if (req.method === 'POST' && req.url === '/call') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': req.headers['x-api-key'] || 'deabf88e8aefda722fbdb8e899d1e1717c8faf66bf56fb82be495c2f3458d30c',
                    'x-session-id': req.headers['x-session-id'] || 'proxy-session'
                }
            };

            const protocol = TARGET_API.startsWith('https') ? https : http;
            const proxyReq = protocol.request(TARGET_API + '/call', options, (proxyRes) => {
                let responseBody = '';

                proxyRes.on('data', chunk => {
                    responseBody += chunk.toString();
                });

                proxyRes.on('end', () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(responseBody);
                });
            });

            proxyReq.on('error', (error) => {
                console.error('Proxy error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: error.message }));
            });

            proxyReq.write(body);
            proxyReq.end();
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

server.listen(PORT, () => {
    console.log(`CORS proxy server running on http://localhost:${PORT}`);
    console.log(`Proxying requests to ${TARGET_API}`);
});
