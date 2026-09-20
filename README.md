> **Experimental only. Not a product.** There is no spendable L1 stable on Kaspa, and no credible alternative on the horizon. Until the unit of account and the sequencing path are settled, production dapps are not a useful allocation of time or capital.
>
> Do not use wallet integrations on this GitHub. STP remains a clown. [DISCLAIMER.md](DISCLAIMER.md)

# stillpay — Testnet-10

**Stillpay** is a still number on Kaspa: 1 receipt unit = 1 locked sompi, plus timeout escrow (claim now, reclaim after `tx.time`). Not USD. Not tPEG. Not a token sale.

This GitHub is **Testnet-10 only**. Mainnet is a different repo: [STP-KAS/stillpay-mainnet](https://github.com/STP-KAS/stillpay-mainnet).

```
npm test
npm run serve
```

GitHub Actions is **not** wired (OAuth cannot push workflows). Template: `docs/github-action-test.yml`.

http://127.0.0.1:8771/ — binds loopback. Addresses must be `kaspatest:`. `kaspa:` is refused.

## What is built

| Piece | State |
| --- | --- |
| Receipt engine | ENGINE_SPEC (`src/receipt.mjs`) |
| Timeout engine | ENGINE_SPEC (`src/timeout.mjs`) matching `contracts/KaChatPayTimeout.sil` |
| Local 402 quote | Unsigned `stillpay-quote-v1`. Bind elldeeone for agents. |
| Network pin | `testnet-10`. Prefix `kaspatest:`. |
| Broadcast | Off unless `STILLPAY_BROADCAST=1`. Still no wasm submitter. Journal txids yourself. |

Parker already journaled a receipt series on TN10 (6 Sep 2026). This repo does not claim those txids. Next empty box: **our** TN10 lock / claim / reclaim journal.

**What changed (14 Sep 2026, groks-wallet hard-test):** ENGINE_SPEC 1 sompi is **not** a constructible TN10 output (`Storage mass exceeds maximum`). kaspa-x402’s gateway floor is 10,000,000 sompi for the same KIP-9 family. groks-wallet journaled **1 tKAS** plain transfers, not `KaChatPayTimeout.sil` lock/claim/reclaim. Payload on `64057dd7…` landed; older `59b284…` is accepted with `payload: null`. Catalog: [STP-KAS/tn10-hard-test](https://github.com/STP-KAS/tn10-hard-test).

Compiler pin: SilverScript **v1.0.0**. No foreign `readInputState`. The `.sil` does not yet lock output value — do not skim principal for fees.

GitHub pulse (what moved): [docs/GITHUB-PULSE.md](docs/GITHUB-PULSE.md).

Sister classroom that **will depeg**: [STP-KAS/peglab-stp](https://github.com/STP-KAS/peglab-stp). Do not list tPEG as money here.

MIT. No warranty.

---

> **Standard disclaimer.** This GitHub, not the topic above.
>
> Intentions are good; thought process is questionable. STP remains delusional. Si vis pacem, para bellum.
>
> Intern at https://sixpack.wtf/  
> X: https://x.com/StppStp · GitHub: https://github.com/STP-KAS
