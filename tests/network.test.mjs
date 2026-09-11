import assert from 'node:assert/strict';
import {describe, it} from 'node:test';
import {ADDRESS_PREFIX, FORBIDDEN_PREFIX, NETWORK, ReceiptError} from '../src/domain.mjs';
import {assertAddress, canBroadcast} from '../src/network.mjs';
import {planBroadcast} from '../src/broadcast.mjs';

describe('stillpay tn10 network pin', () => {
  it('is testnet-10 and refuses mainnet prefixes', () => {
    assert.equal(NETWORK, 'testnet-10');
    assert.equal(ADDRESS_PREFIX, 'kaspatest:');
    assert.equal(FORBIDDEN_PREFIX, 'kaspa:');
    assert.equal(assertAddress('kaspatest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'), 'kaspatest:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
    assert.throws(
      () => assertAddress('kaspa:qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq'),
      (err) => err instanceof ReceiptError && err.code === 'WRONG_NETWORK',
    );
    assert.equal(canBroadcast(), false);
    assert.equal(planBroadcast('timeout-lock', {sompi: '1'}).network, 'testnet-10');
    assert.equal(planBroadcast('timeout-lock', {sompi: '1'}).submitted, false);
  });
});
