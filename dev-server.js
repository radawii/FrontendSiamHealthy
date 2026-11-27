/**
 * Local development server for the Chiwitchiwa frontend.
 *
 * Serves this folder as static files AND proxies API paths to the NestJS
 * backend, so the browser sees one origin. That matters because every page
 * calls the API with `window.location.origin` — without the proxy, API calls
 * from http://<host>:8000 would hit the static server (404) or be blocked by
 * CORS. In production the same single-origin setup is handled by the reverse
 * proxy in front of the site.
 *
 * Usage (from the Frontend folder):
 *   node dev-server.js                 # http://localhost:8000
 *   PORT=8080 API_PORT=3000 node dev-server.js
 *
 * Open it from another device on the LAN with http://<this machine's IP>:8000
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 8000;
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = Number(process.env.API_PORT) || 3000;
const ROOT = __dirname;

// Path prefixes owned by the NestJS backend. Everything else is a static file.
const API_PREFIXES = [
  '/th/ingredients', '/en/ingredients', '/th/wellness', '/en/wellness', '/sitemap.xml',
  '/ingredients',
  '/wellness',
  '/products',
  '/api',
  '/auth',
  '/users',
  '/orders',
  '/order',
  '/payments',
  '/shipping',
  '/coupons',
  '/crm',
  '/notifications',
  '/stripe-webhook',
];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
};

function isApiPath(pathname) {
  return API_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + '/') || pathname.startsWith(prefix + '?'),
  );
}

function proxyToApi(req, res) {
  const proxyReq = http.request(
    {
      host: API_HOST,
      port: API_PORT,
      path: req.url,
      method: req.method,
      headers: { ...req.headers, host: `${API_HOST}:${API_PORT}` },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode || 502, proxyRes.headers);
      proxyRes.pipe(res);
    },
  );

  proxyReq.on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(
      JSON.stringify({
        error: 'ไม่สามารถเชื่อมต่อ backend ได้',
        detail: `${API_HOST}:${API_PORT} — ${err.message}`,
        hint: 'ตรวจว่า Backend รันอยู่ (npm run start:dev ในโฟลเดอร์ Backend)',
      }),
    );
  });

  req.pipe(proxyReq);
}

function serveStatic(req, res, pathname) {
  let relativePath = pathname;
  if (relativePath.endsWith('/')) relativePath += 'index.html';

  const resolved = path.resolve(ROOT, '.' + relativePath);

  // Never serve anything outside this folder.
  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep) || relativePath.split('/').some(part => part.startsWith('.'))) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden');
  }

  let filePath = resolved;
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<!doctype html><meta charset="utf-8"><h1>404</h1><p>ไม่พบหน้าเว็บ</p>');
  }

  res.writeHead(200, {
    'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-cache',
  });
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, `http://localhost:${PORT}`).pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('400 Bad Request');
  }

  if (isApiPath(pathname)) return proxyToApi(req, res);
  return serveStatic(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Frontend:  http://localhost:${PORT}`);
  console.log(`API proxy: ${API_HOST}:${API_PORT}`);
  console.log('หยุดเซิร์ฟเวอร์ด้วย Ctrl+C');
});
