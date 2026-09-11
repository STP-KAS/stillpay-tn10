export const PROJECT = 'stillpay';
export const NETWORK = 'testnet-10';
export const ADDRESS_PREFIX = 'kaspatest:';
export const FORBIDDEN_PREFIX = 'kaspa:';
export const UNIT_NAME = 'tKAS';
export const PORT = 8771;
export const MAX_SOMPI = 1_000_000_000n; // 10 tKAS teaching cap
export const MAX_FEE = 3_000_000n;
export const LOCK_TIME_THRESHOLD = 500_000_000_000n;
export const SERIES_NAME = 'stillpay-tn10-receipt-v1';
export const NODE_HINT = 'wss://muon-10.kaspa.blue/kaspa/testnet-10/wrpc/borsh';

export class ReceiptError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ReceiptError';
    this.code = code;
  }
}
