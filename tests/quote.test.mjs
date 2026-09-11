import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {ReceiptError} from '../src/receipt.mjs';
import {CAIP2, NETWORK} from '../src/domain.mjs';
import {acceptPayment, makeQuote, paymentRequired, toX402PaymentRequired, QUOTE_SCHEME} from '../src/quote.mjs';

const sender = 'aa'.repeat(32);
const recipient = 'bb'.repeat(32);
const now = 1_800_000_000_000n;
const timeout = now + 48n * 3600n * 1000n;
const nonce = 'cc'.repeat(32);

describe('quote and 402', () => {
  it('builds a 402 challenge that is not x402 v2', () => {
    const quote = makeQuote({sender, recipient, sompi: 20_000_000n, timeout, now, nonce, postage: 'sponsor', asset: 'kas-native'});
    const body = paymentRequired(quote);
    assert.equal(body.status, 402);
    assert.equal(body.payment.scheme, QUOTE_SCHEME);
    assert.equal(body.payment.amount, '20000000');
    assert.match(body.x402.note, /elldeeone\/kaspa-x402/);
    assert.equal(body.x402.later.scheme, 'exact');
    const mapped = toX402PaymentRequired(quote);
    assert.equal(mapped.doNotSend, true);
    assert.equal(mapped.draftMapper, true);
    assert.equal(mapped.wouldMapTo.accepts[0].network, CAIP2);
    assert.equal(quote.network, NETWORK);
    assert.equal(body.payment.quote.signed, false);
    quote.signed = true;
    assert.equal(body.payment.quote.signed, false);
  });

  it('refuses tPEG/USD, mixed buttons, and facilitator-shaped proofs', () => {
    assert.throws(
      () => makeQuote({sender, recipient, sompi: 1n, timeout, now, nonce, asset: 'usd'}),
      (err) => err instanceof ReceiptError && err.code === 'ASSET',
    );
    assert.throws(
      () => makeQuote({sender, recipient, sompi: 1n, timeout, now, nonce, postage: 'grams', asset: 'kas-receipt', series: 'dd'.repeat(32)}),
      (err) => err instanceof ReceiptError && err.code === 'MIXED_BUTTONS',
    );
    const quote = makeQuote({sender, recipient, sompi: 1n, timeout, now, nonce});
    assert.throws(
      () => acceptPayment(quote, {txid: 'not-a-txid', now}),
      (err) => err instanceof ReceiptError && err.code === 'BAD_TXID',
    );
    const ok = acceptPayment(quote, {txid: 'ee'.repeat(32), now});
    assert.equal(ok.ok, true);
    assert.equal(ok.engineSpec, true);
    assert.equal(ok.signed, false);
    assert.match(ok.label, /not an accepted txid/i);
    throwsQuote(() => makeQuote({sender, recipient: sender, sompi: 1n, timeout, now, nonce}), 'SELF');
  });
});

const throwsQuote = (fn, code) => {
  assert.throws(fn, (err) => err instanceof ReceiptError && err.code === code);
};
