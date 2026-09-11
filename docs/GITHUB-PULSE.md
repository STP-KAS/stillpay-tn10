# GitHub pulse — 11 Sep 2026 (afternoon)

Checked with `gh api` against the repos stillpay actually depends on. Think big, stay dated.

## What moved

| Repo | Last push | Stillpay implication |
| --- | --- | --- |
| [parker2017code/kaspa-explained](https://github.com/parker2017code/kaspa-explained) | **8 Sep 18:57Z** `Withdraw V5 and V6 while preserving public covenants workshop` | V5/V6 are **unlisted** (`/covenants/v5`, `/v6` out of nav/search/sitemap). The 26-tx local V6 journey remains in docs. Hosted Cloudflare runtime is still a **separate gate**. Public town is the covenants workshop + 7 Sep 21-tx economy. Receipt wrap lab still documented. **Do not treat V6 as a live hosted product.** |
| [kaspanet/silverscript](https://github.com/kaspanet/silverscript) | **9 Sep** tag **v1.0.0** | Pin unchanged. No v1.0.1. |
| [kaspanet/rusty-kaspa](https://github.com/kaspanet/rusty-kaspa) | **8 Sep** | v2.0.1 still the Toccata maintenance line we pin. |
| [elldeeone/kaspa-x402](https://github.com/elldeeone/kaspa-x402) | `pushed_at` 10 Sep; **0 commits since 10 Aug** | Latest **release** still `v0.1.0-alpha.10`. TN10 only. No RC. Do not wait for this to journal a timeout. |
| [vsmirn0v/KaChat](https://github.com/vsmirn0v/KaChat) | **11 Sep 01:41Z** | Pocket is shipping: full-row tap, group drawers, chromatic **reward reduction** copy (not “halving”), discover-addresses crash fix, **Max spends at most 32 UTXOs** (KasSigner cap). Contacts cannot leak across accounts. **Pay prefix still `kchat:1:pay`.** No covenant signer. No `payunit`. |
| [kaspanet/kccs](https://github.com/kaspanet/kccs) | PRs | **#4 KCC-0402 still open** (updated 27 Aug). #23 p2pk-ecdsa updated 10 Sep — not stillpay. |
| [argent-lang/argent](https://github.com/argent-lang/argent) | **10 Sep** #60 merged | Silverscript v1.0.0 pin + leader/delegate invariants. **Not release-ready.** Not a stillpay compiler. |
| [NeaBouli/1kUSD](https://github.com/NeaBouli/1kUSD) | **1 Sep** | Still research. Do not race. |
| [Kali123411/k402](https://github.com/Kali123411/k402) | **19 Jul** | Stale vs elldeeone. Draft channel, not x402 v2. |
| [dilljens/DagLock](https://github.com/dilljens/DagLock) | **27 Aug** | No new mainnet evidence in this check. |
| [STP-KAS/stillpay-tn10](https://github.com/STP-KAS/stillpay-tn10) | this repo | ENGINE_SPEC. Empty artifacts. |
| [STP-KAS/stillpay-mainnet](https://github.com/STP-KAS/stillpay-mainnet) | sister | Shape only. Does not submit. |

## Think big (what this pulse actually changes)

KaChat is becoming a real **pocket** (32-input honesty, contacts isolation, no fake halving). Stillpay is still not in the thread. The missing object is not another GitHub. It is a **Testnet-10 timeout journal this series can cite**, then a KaChat signer for `KaChatPayTimeout` while pay memos stay `kchat:1:pay`.

32-input cap is good news: a timeout spend is one covenant in + sponsor. Dusty wallets are a postage problem (sponsor / grams), not a reason to print a dollar.

Do **not** wait on: x402 RC, Argent production, vProgs, 1kUSD, KCC-0402 merge, DagLock mainnet, Parker’s unlisted V6 host.

Do **not** mainnet stillpay until the TN10 journal exists and the `.sil` locks output value + sponsor.

Parker’s 6 Sep receipt txids remain dated evidence in *his* repo. This series still has none.
