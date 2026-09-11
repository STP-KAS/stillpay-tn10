import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {ReceiptError} from '../src/receipt.mjs';
import {
  LOCK_TIME_THRESHOLD,
  claimTimeout,
  lockTimeout,
  reclaimTimeout,
  skimTimeout,
  timeoutDemo,
} from '../src/timeout.mjs';

const sender = 'aa'.repeat(32);
const recipient = 'bb'.repeat(32);
const fee = 263_800n;
const now = 1_800_000_000_000n;
const timeout = now + 3_600_000n;

const throws = (fn, code) => {
  assert.throws(fn, (err) => err instanceof ReceiptError && err.code === code);
};

describe('timeout lock', () => {
  it('rejects DAA-domain clocks', () => {
    throws(() => lockTimeout({sender, recipient, sompi: 1n, timeout: 1n, sponsorFee: fee, now: 1n}), 'BAD_TIME');
    assert.ok(LOCK_TIME_THRESHOLD === 500_000_000_000n);
  });

  it('rejects stale timeout and self-pay', () => {
    throws(() => lockTimeout({sender, recipient, sompi: 1n, timeout: now, sponsorFee: fee, now}), 'STALE');
    throws(() => lockTimeout({sender, recipient: sender, sompi: 1n, timeout, sponsorFee: fee, now}), 'SELF');
  });
});

describe('claim and reclaim', () => {
  it('lets recipient claim immediately and refuses early reclaim', () => {
    const lock = lockTimeout({sender, recipient, sompi: 20_000_000n, timeout, sponsorFee: fee, now});
    throws(() => reclaimTimeout(lock, {reclaimer: sender, now, sponsorFee: fee}), 'TOO_EARLY');
    throws(() => claimTimeout(lock, {claimer: sender, now, sponsorFee: fee}), 'WRONG_CLAIMER');
    const {lock: claimed, released} = claimTimeout(lock, {claimer: recipient, now, sponsorFee: fee});
    assert.equal(claimed.status, 'claimed');
    assert.equal(released, 20_000_000n);
    throws(() => claimTimeout(claimed, {claimer: recipient, now, sponsorFee: fee}), 'ALREADY_SETTLED');
  });

  it('lets sender reclaim at timeout, and recipient could still have claimed (race)', () => {
    const lock = lockTimeout({sender, recipient, sompi: 5n, timeout, sponsorFee: fee, now});
    throws(() => reclaimTimeout(lock, {reclaimer: recipient, now: timeout, sponsorFee: fee}), 'WRONG_RECLAIMER');
    const claimed = claimTimeout(lock, {claimer: recipient, now: timeout, sponsorFee: fee});
    const reclaimed = reclaimTimeout(lock, {reclaimer: sender, now: timeout, sponsorFee: fee});
    assert.equal(claimed.lock.status, 'claimed');
    assert.equal(reclaimed.lock.status, 'reclaimed');
    assert.equal(lock.status, 'locked');
  });

  it('refuses skim in JS only (the .sil does not)', () => {
    throws(() => skimTimeout(), 'SKIM');
  });
});

describe('timeout demo', () => {
  it('claim path and reclaim path both conserve principal', () => {
    const claimed = timeoutDemo({path: 'claim'});
    assert.equal(claimed.lock.status, 'claimed');
    assert.equal(claimed.tooEarly, 'TOO_EARLY');
    assert.equal(claimed.skim, 'SKIM');
    const reclaimed = timeoutDemo({path: 'reclaim'});
    assert.equal(reclaimed.lock.status, 'reclaimed');
    assert.equal(reclaimed.lock.sompi, claimed.lock.sompi);
  });
});
