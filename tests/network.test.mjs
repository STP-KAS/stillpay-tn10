import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {ADDRESS_PREFIX, CAIP2, FORBIDDEN_PREFIX, NETWORK, NODE_HINT, PORT, SERIES_NAME, UNIT_NAME, ReceiptError} from '../src/domain.mjs';
import {assertAddress, canBroadcast, broadcastGate} from '../src/network.mjs';
import {planBroadcast, submit} from '../src/broadcast.mjs';

describe('stillpay tn10 network pin', () => {
  it('is testnet-10 and refuses mainnet prefixes', () => {
    assert.equal(NETWORK, 'testnet-10');
    assert.equal(ADDRESS_PREFIX, 'kaspatest:');
    assert.equal(FORBIDDEN_PREFIX, 'kaspa:');
    assert.equal(PORT, 8771);
    assert.equal(UNIT_NAME, 'tKAS');
    assert.equal(SERIES_NAME, 'stillpay-tn10-receipt-v1');
    assert.equal(CAIP2, 'kaspa:testnet-10');
    assert.match(NODE_HINT, /testnet-10/);
    assert.equal(assertAddress('kaspatest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'), 'kaspatest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
    assert.throws(
      () => assertAddress('kaspa:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'),
      (err) => err instanceof ReceiptError && err.code === 'WRONG_NETWORK',
    );
    assert.equal(canBroadcast(), false);
    assert.throws(() => broadcastGate(), (err) => err instanceof ReceiptError && err.code === 'DRY_RUN');
    assert.equal(planBroadcast('timeout-lock', {sompi: '1'}).submitted, false);
  });

  it('submit with broadcast env still does not send', () => {
    const prev = process.env.STILLPAY_BROADCAST;
    process.env.STILLPAY_BROADCAST = '1';
    try {
      const out = submit('timeout-lock', {sompi: '1'});
      assert.equal(out.submitted, false);
      assert.match(out.note, /does not sign or broadcast/i);
    } finally {
      if (prev === undefined) delete process.env.STILLPAY_BROADCAST;
      else process.env.STILLPAY_BROADCAST = prev;
    }
  });
});
