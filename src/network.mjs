import {ADDRESS_PREFIX, FORBIDDEN_PREFIX, NETWORK, ReceiptError} from './domain.mjs';

export function assertAddress(address, label = 'address') {
  if (typeof address !== 'string' || address.length < 12) {
    throw new ReceiptError('BAD_ADDRESS', `Expected a ${NETWORK} address for ${label}.`);
  }
  if (address.startsWith(FORBIDDEN_PREFIX)) {
    throw new ReceiptError('WRONG_NETWORK', `${label} is ${FORBIDDEN_PREFIX} — this repo is ${NETWORK} only.`);
  }
  if (!address.startsWith(ADDRESS_PREFIX)) {
    throw new ReceiptError('WRONG_NETWORK', `${label} must start with ${ADDRESS_PREFIX}`);
  }
  return address;
}

export function canBroadcast() {
  return process.env.STILLPAY_BROADCAST === '1';
}

export function broadcastGate() {
  if (!canBroadcast()) {
    throw new ReceiptError(
      'DRY_RUN',
      'Broadcast is off. Set STILLPAY_BROADCAST=1 after you have a signed Testnet-10 tx. This repo never talks to mainnet.',
    );
  }
}
