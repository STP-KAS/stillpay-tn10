// ENGINE_SPEC of KaChatPayTimeout / TransferWithTimeout (silverc tutorial).
// Recipient claims now (and still after timeout). Sender reclaims only after tx.time.
// After timeout both paths are live until one spend. Not a dollar. Not tPEG.
// SCRIPT_ENFORCED only when a Testnet-10 node accepts the tx.

import {LOCK_TIME_THRESHOLD, MAX_FEE, MAX_SOMPI, NETWORK, UNIT_NAME, ReceiptError} from './domain.mjs';

export {LOCK_TIME_THRESHOLD};
export const TIMEOUT_FAMILY = 'KaChatPayTimeout';

const hex32 = (value, label) => {
  if (typeof value !== 'string' || !/^[0-9a-f]{64}$/i.test(value)) {
    throw new ReceiptError('BAD_HEX', `Expected 32-byte hex for ${label}.`);
  }
  return value.toLowerCase();
};

const sompi = (value, label = 'amount') => {
  const n = typeof value === 'bigint' ? value : BigInt(value);
  if (n < 1n || n > MAX_SOMPI) throw new ReceiptError('RANGE', `${label} out of range.`);
  return n;
};

const feeOf = (value) => {
  const n = typeof value === 'bigint' ? value : BigInt(value);
  if (n < 1n || n > MAX_FEE) throw new ReceiptError('RANGE', 'sponsorFee out of range.');
  return n;
};

const timeMs = (value) => {
  const n = typeof value === 'bigint' ? value : BigInt(value);
  if (n < LOCK_TIME_THRESHOLD) {
    throw new ReceiptError('BAD_TIME', `tx.time must be >= LOCK_TIME_THRESHOLD (${LOCK_TIME_THRESHOLD}). Use Unix milliseconds, not DAA.`);
  }
  return n;
};

export function inspectLock(lock) {
  return {
    network: NETWORK,
    family: TIMEOUT_FAMILY,
    status: lock.status,
    sender: lock.sender,
    recipient: lock.recipient,
    sompi: lock.sompi,
    timeout: lock.timeout,
    sponsorFeesPaid: lock.sponsorFeesPaid,
    warning: `TIMEOUT ESCROW ON ${NETWORK}. CLAIM NOW OR RECLAIM AFTER tx.time. NOT USD. Unit is ${UNIT_NAME}.`,
  };
}

export function lockTimeout({sender, recipient, sompi: amount, timeout, sponsorFee, now}) {
  const src = hex32(sender, 'sender');
  const dst = hex32(recipient, 'recipient');
  if (src === dst) throw new ReceiptError('SELF', 'Sender and recipient must differ.');
  const qty = sompi(amount);
  const until = timeMs(timeout);
  const fee = feeOf(sponsorFee);
  const clock = timeMs(now);
  if (until <= clock) throw new ReceiptError('STALE', 'Timeout must be in the future.');
  return {
    status: 'locked',
    sender: src,
    recipient: dst,
    sompi: qty,
    timeout: until,
    sponsorFeesPaid: fee,
  };
}

export function claimTimeout(lock, {claimer, now, sponsorFee}) {
  if (lock.status !== 'locked') throw new ReceiptError('ALREADY_SETTLED', 'Lock already claimed or reclaimed.');
  const who = hex32(claimer, 'claimer');
  if (who !== lock.recipient) throw new ReceiptError('WRONG_CLAIMER', 'Only the recipient can claim.');
  timeMs(now); // domain check only; recipient has no time gate
  const fee = feeOf(sponsorFee);
  return {
    lock: {
      ...lock,
      status: 'claimed',
      sponsorFeesPaid: lock.sponsorFeesPaid + fee,
    },
    releasedTo: lock.recipient,
    released: lock.sompi,
    fee,
  };
}

export function reclaimTimeout(lock, {reclaimer, now, sponsorFee}) {
  if (lock.status !== 'locked') throw new ReceiptError('ALREADY_SETTLED', 'Lock already claimed or reclaimed.');
  const who = hex32(reclaimer, 'reclaimer');
  if (who !== lock.sender) throw new ReceiptError('WRONG_RECLAIMER', 'Only the sender can reclaim.');
  const clock = timeMs(now);
  if (clock < lock.timeout) throw new ReceiptError('TOO_EARLY', 'Sender cannot reclaim before timeout.');
  const fee = feeOf(sponsorFee);
  return {
    lock: {
      ...lock,
      status: 'reclaimed',
      sponsorFeesPaid: lock.sponsorFeesPaid + fee,
    },
    releasedTo: lock.sender,
    released: lock.sompi,
    fee,
  };
}

export function skimTimeout() {
  throw new ReceiptError('SKIM', 'Fees come from a sponsor input. Principal cannot pay mass.');
}

export function timeoutDemo({path = 'claim'} = {}) {
  const sender = 'aa'.repeat(32);
  const recipient = 'bb'.repeat(32);
  const fee = 263_800n;
  const now = 1_800_000_000_000n; // 2027-ish ms, above threshold
  const timeout = now + 48n * 60n * 60n * 1000n;
  const steps = [];
  let lock = lockTimeout({sender, recipient, sompi: 20_000_000n, timeout, sponsorFee: fee, now});
  steps.push({title: `Lock 0.2 ${UNIT_NAME}, 48h`, status: lock.status, lesson: 'Recipient may claim immediately. Sender waits.'});
  let tooEarly = 'not tried';
  try {
    reclaimTimeout(lock, {reclaimer: sender, now, sponsorFee: fee});
  } catch (err) {
    tooEarly = err.code;
  }
  steps.push({title: 'Reclaim before timeout', code: tooEarly, lesson: 'TOO_EARLY. Same as TransferWithTimeout timeout() entry.'});
  if (path === 'reclaim') {
    const done = reclaimTimeout(lock, {reclaimer: sender, now: timeout, sponsorFee: fee});
    lock = done.lock;
    steps.push({title: 'Reclaim at timeout', status: lock.status, released: done.released, lesson: 'Ghosted. Sender gets sompi back. Sponsor paid the fee.'});
  } else {
    const done = claimTimeout(lock, {claimer: recipient, now, sponsorFee: fee});
    lock = done.lock;
    steps.push({title: 'Recipient claims now', status: lock.status, released: done.released, lesson: 'No time gate on claim. Principal conserved. Not USD.'});
  }
  let skim = 'not tried';
  try {
    skimTimeout();
  } catch (err) {
    skim = err.code;
  }
  return {lock, steps, tooEarly, skim, inspect: inspectLock(lock)};
}
