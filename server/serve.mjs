import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {resolvePublic} from './public-path.mjs';
import {NETWORK, PORT, PROJECT} from '../src/domain.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || PORT);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
};

const server = http.createServer((req, res) => {
  const method = req.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405);
    res.end('method not allowed');
    return;
  }
  let url;
  try {
    url = new URL(req.url || '/', `http://127.0.0.1:${port}`);
  } catch {
    res.writeHead(400);
    res.end('bad url');
    return;
  }
  const file = resolvePublic(root, url.pathname);
  if (!file) {
    res.writeHead(403);
    res.end('forbidden');
    return;
  }
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404);
      res.end(method === 'HEAD' ? undefined : 'not found');
      return;
    }
    const type = types[path.extname(file)] || 'application/octet-stream';
    res.writeHead(200, {'content-type': type, 'content-length': buf.length});
    res.end(method === 'HEAD' ? undefined : buf);
  });
});

server.listen(port, '127.0.0.1', () => {
  console.log(`${PROJECT} ${NETWORK}  http://127.0.0.1:${port}/`);
  console.log('NOT USD. ENGINE_SPEC. Bind 127.0.0.1 only.');
});
