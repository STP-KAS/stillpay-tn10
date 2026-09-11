import {NETWORK, NODE_HINT, PROJECT} from './domain.mjs';
import {broadcastGate} from './network.mjs';

export function planBroadcast(kind, payload) {
  return {
    project: PROJECT,
    network: NETWORK,
    node: NODE_HINT,
    kind,
    payload,
    submitted: false,
    note: 'No kaspa wasm submitter in this repo. Dry-run is the product until a signed tx is journaled.',
  };
}

export function submit(kind, payload) {
  broadcastGate();
  const plan = planBroadcast(kind, payload);
  plan.submitted = false;
  plan.note =
    'Gate open, but this process still does not sign or broadcast. Build the tx with a wallet / rusty-kaspa, then journal the txid in artifacts/.';
  return plan;
}
