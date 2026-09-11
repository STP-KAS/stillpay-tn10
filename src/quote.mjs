// Local quote + HTTP 402 challenge. ENGINE_SPEC. Not x402 v2.
// Production agents should bind elldeeone/kaspa-x402 exact/standard-native.
// This object is what a KaChat quote and a 402 body share.

import {LOCK_TIME_THRESHOLD, MAX_SOMPI, NETWORK, PROJECT, ReceiptError} from './domain.mjs';

export const QUOTE_SCHEME = `${PROJECT}-quote-v1`;
export const CAIP2 = NETWORK === 'mainnet' ? 'kaspa:mainnet' : 'kaspa:testnet-10';
export const X402_NOTE =
  'Local ENGINE_SPEC only. Do not treat this as x402 v2. Bind https://github.com/elldeeone/kaspa-x402 for agents. TN10 alpha; mainnet blocked there.';

const hex32 = (value, label) => {
  if (typeof value !== 'string' || !/^[0-9a-f]{64}$/i.test(value)) {
    throw new ReceiptError('BAD_HEX', `Expected 32-byte hex for ${label}.`);
  }
  return value.toLowerCase();
};

export function makeQuote({
  sender,
  recipient,
  sompi,
  timeout,
  now,
  postage = 'sponsor',
  asset = 'kas-native',
  series = null,
  nonce,
}) {
  const amount = typeof sompi === 'bigint' ? sompi : BigInt(sompi);
  if (amount < 1n || amount > MAX_SOMPI) throw new ReceiptError('RANGE', 'quote amount out of range.');
  if (postage !== 'sponsor' && postage !== 'grams') {
    throw new ReceiptError('POSTAGE', 'Postage is sponsor (pay) or grams (stamp). Not a dollar.');
  }
  if (asset !== 'kas-native' && asset !== 'kas-receipt') {
    throw new ReceiptError('ASSET', 'Asset is kas-native or kas-receipt. Not tPEG. Not USD.');
  }
  if (asset === 'kas-receipt' && (!series || !/^[0-9a-f]{64}$/i.test(series))) {
    throw new ReceiptError('SERIES', 'Receipt quotes need a 32-byte series id. Name is not authenticity.');
  }
  const clock = typeof now === 'bigint' ? now : BigInt(now);
  const until = typeof timeout === 'bigint' ? timeout : BigInt(timeout);
  if (clock < LOCK_TIME_THRESHOLD || until < LOCK_TIME_THRESHOLD) {
    throw new ReceiptError('BAD_TIME', 'Use Unix milliseconds >= LOCK_TIME_THRESHOLD.');
  }
  if (until <= clock) throw new ReceiptError('STALE', 'Quote timeout is not in the future.');
  const src = hex32(sender, 'sender');
  const dst = hex32(recipient, 'recipient');
  if (src === dst) throw new ReceiptError('SELF', 'Sender and recipient must differ.');
  if (postage === 'grams' && asset !== 'kas-native') {
    throw new ReceiptError('MIXED_BUTTONS', 'Grams stamp work. Receipts pay. Do not mix the buttons.');
  }
  return {
    scheme: QUOTE_SCHEME,
    network: NETWORK,
    asset,
    series: series ? series.toLowerCase() : null,
    sender: src,
    recipient: dst,
    signed: false,
    sompi: amount.toString(),
    timeout: until.toString(),
    postage,
    nonce: hex32(nonce, 'nonce'),
    warning: 'NOT USD. NOT tPEG. STAMP vs PAY.',
  };
}

export function paymentRequired(quote) {
  return {
    status: 402,
    'WWW-Authenticate': `${QUOTE_SCHEME} quote`,
    payment: {
      scheme: QUOTE_SCHEME,
      network: quote.network,
      amount: quote.sompi,
      asset: quote.asset,
      payto: quote.recipient,
      exp: quote.timeout,
      nonce: quote.nonce,
      postage: quote.postage,
      quote,
    },
    x402: {
      binding: 'none-yet',
      note: X402_NOTE,
      later: {
        headers: ['PAYMENT-REQUIRED', 'PAYMENT-SIGNATURE', 'PAYMENT-RESPONSE'],
        scheme: 'exact',
        profile: 'standard-native',
        caip2: CAIP2,
      },
    },
  };
}

export function toX402PaymentRequired(quote) {
  return {
    doNotSend: true,
    draftMapper: true,
    note: 'Not an x402 v2 message. Do not PUT this on the wire. Bind elldeeone/kaspa-x402.',
    wouldMapTo: {
      x402Version: 2,
      resource: {url: '/work'},
      accepts: [
        {
          scheme: 'exact',
          network: CAIP2,
          asset: 'KAS',
          amount: quote.sompi,
          extra: {
            binding: 'kaspa-exact-v2',
            profile: 'standard-native',
            pocQuoteId: quote.nonce,
            receiverPublicKey: quote.recipient,
          },
        },
      ],
    },
  };
}

export function acceptPayment(quote, {txid, now}) {
  if (typeof txid !== 'string' || !/^[0-9a-f]{64}$/i.test(txid)) {
    throw new ReceiptError('BAD_TXID', 'Proof is an accepted 32-byte txid, not a facilitator attestation.');
  }
  const clock = typeof now === 'bigint' ? now : BigInt(now);
  if (clock > BigInt(quote.timeout)) throw new ReceiptError('STALE', 'Quote expired.');
  return {
    ok: true,
    engineSpec: true,
    signed: false,
    scheme: QUOTE_SCHEME,
    txid: txid.toLowerCase(),
    label: 'ENGINE_SPEC shape-check only. A 64-hex string is not an accepted txid.',
  };
}
