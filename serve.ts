// serve.ts: a small static server for app/ so Lowtide can be opened locally (node serve.ts, then http://localhost:8080).
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = resolve(fileURLToPath(new URL('./app', import.meta.url)));
const flag = process.argv.indexOf('--port');
const port = flag > -1 ? Number(process.argv[flag + 1]) : 8080;
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
};

function fileFor(urlPath: string): string | null {
  const clean = normalize(decodeURIComponent(urlPath.split('?')[0])).replace(/^([/\\])+/, '');
  const full = resolve(join(appDir, clean || 'index.html'));
  if (full !== appDir && !full.startsWith(appDir + sep)) return null;
  try { return statSync(full).isDirectory() ? join(full, 'index.html') : full; } catch { return null; }
}

createServer((req, res) => {
  const file = fileFor(req.url ?? '/');
  if (!file) { res.writeHead(404).end('not found'); return; }
  res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' });
  createReadStream(file).on('error', () => res.end()).pipe(res);
}).listen(port, () => console.log(`Lowtide on http://localhost:${port}`));
