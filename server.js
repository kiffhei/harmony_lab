/**
 * server.js — Harmony Lab Pro
 * Node.js HTTP puro, sin Express.
 * Sirve el dist de Vite con soporte para SPA (fallback a index.html).
 * Rutas: /?v=desktop | /?v=tablet | /?v=mobile
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(__dirname, 'dist');
const PORT = parseInt(process.env.PORT ?? '4000', 10);

/** Map de extensiones a MIME types */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.mjs':  'application/javascript',
  '.css':  'text/css',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.json': 'application/json',
  '.woff':  'font/woff',
  '.woff2': 'font/woff2',
  '.ttf':   'font/ttf',
  '.map':   'application/json',
};

/**
 * Sirve un archivo estático.
 * @param {http.ServerResponse} res
 * @param {string} filePath
 */
function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME[ext] ?? 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Fallback SPA — cualquier 404 devuelve index.html
      const indexPath = path.join(DIST, 'index.html');
      fs.readFile(indexPath, (err2, html) => {
        if (err2) {
          res.writeHead(500);
          res.end('Internal Server Error');
          return;
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      });
      return;
    }

    // Cache: assets con hash → 1 año; resto → no-cache
    const isHashed = /\.[a-f0-9]{8,}\.(js|css)$/.test(filePath);
    const cacheControl = isHashed
      ? 'public, max-age=31536000, immutable'
      : 'no-cache, no-store, must-revalidate';

    res.writeHead(200, {
      'Content-Type': mime,
      'Cache-Control': cacheControl,
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Health check para Docker
  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', ts: Date.now() }));
    return;
  }

  // Resolver ruta del archivo
  let filePath = path.join(DIST, pathname === '/' ? 'index.html' : pathname);

  // Seguridad: evitar path traversal
  if (!filePath.startsWith(DIST)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  serveFile(res, filePath);
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Harmony Lab Pro corriendo en puerto ${PORT}`);
  console.log(`  Desktop : http://localhost:${PORT}/?v=desktop`);
  console.log(`  Tablet  : http://localhost:${PORT}/?v=tablet`);
  console.log(`  Mobile  : http://localhost:${PORT}/?v=mobile`);
});

server.on('error', (err) => {
  console.error('Server error:', err);
  process.exit(1);
});
