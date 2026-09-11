import path from 'node:path';

const ALLOWED_TOP = new Set(['web', 'src', 'docs', 'artifacts', 'contracts']);
const ALLOWED_ROOT = new Set([
  'README.md',
  'LICENSE',
  'SECURITY.md',
  'AGENTS.md',
  'package.json',
]);

export function resolvePublic(root, pathname) {
  let decoded = String(pathname || '/').replace(/\\/g, '/');
  if (decoded.includes('%')) {
    try {
      decoded = decodeURIComponent(decoded).replace(/\\/g, '/');
    } catch {
      return null;
    }
  }
  if (decoded.includes('\0')) return null;
  if (decoded === '/') decoded = '/web/index.html';
  const parts = decoded.split('/').filter((p) => p && p !== '.');
  if (parts.some((p) => p === '..')) return null;
  const file = path.resolve(root, ...parts);
  const rel = path.relative(root, file);
  if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) return null;
  const segs = rel.split(path.sep);
  const lower = segs.map((s) => s.toLowerCase());
  if (lower.includes('.git') || lower.includes('.local') || lower.includes('.env')) return null;
  if (ALLOWED_TOP.has(lower[0])) return file;
  if (segs.length === 1 && ALLOWED_ROOT.has(segs[0])) return file;
  return null;
}
