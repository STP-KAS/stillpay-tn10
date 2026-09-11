# Grok heavy review — stillpay-tn10 (11 Sep 2026)

Sister: [stillpay-mainnet](https://github.com/STP-KAS/stillpay-mainnet).

## Verdict

Network pin is real: `kaspa:` throws `WRONG_NETWORK`. Engines are ENGINE_SPEC. This repo does not submit Testnet-10 txs. Preview allowlist is in place.

## Issues

### Closed here
- Timeout comment no longer claims SCRIPT_ENFORCED is TN10-node-only in a copy-paste sense; it follows `NETWORK`.
- x402 note no longer reads as “bind elldeeone and you are live.”

### Open
| Severity | Issue |
| --- | --- |
| bug (on-chain) | `.sil` does not lock output value / sponsor. JS skim is a stub. |
| suggestion | `assertAddress` is not used by receipt/timeout (those take hex keys). Prefix tests do not protect a future submitter unless wired. |
| suggestion | `NODE_HINT` muon-10 URL is Parker’s lab node, not a stillpay SLA. |
| suggestion | No GitHub Action (OAuth cannot push `.github/workflows`). Recipe in `docs/github-action-test.yml`. |
| nit | Tests still mention `peglab-poc-evil` as a sibling-prefix probe. |
