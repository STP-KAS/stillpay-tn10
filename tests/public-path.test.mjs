import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, it} from 'node:test';
import {resolvePublic} from '../server/public-path.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('public path allowlist', () => {
  it('serves the demo page and engines', () => {
    assert.ok(resolvePublic(root, '/'));
    assert.ok(resolvePublic(root, '/web/index.html'));
    assert.ok(resolvePublic(root, '/src/timeout.mjs'));
    assert.ok(resolvePublic(root, '/docs/PROTOCOL.md'));
    assert.ok(resolvePublic(root, '/artifacts/README.md'));
  });

  it('refuses git, keys, traversal, and server internals', () => {
    assert.equal(resolvePublic(root, '/.git/config'), null);
    assert.equal(resolvePublic(root, '/.LOCAL/keys.json'), null);
    assert.equal(resolvePublic(root, '/.local/sponsor.json'), null);
    assert.equal(resolvePublic(root, '/../../.ssh/id_rsa'), null);
    assert.equal(resolvePublic(root, '/..%5cpeglab-poc-evil%5csecret'), null);
    assert.equal(resolvePublic(root, '/server/serve.mjs'), null);
    assert.equal(resolvePublic(root, '/%2e%2e/.git/config'), null);
    assert.equal(resolvePublic(root, '/%'), null);
  });
});
