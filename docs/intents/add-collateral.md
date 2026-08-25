# Add collateral

`prepare.addCollateral` → `startIntent({ type: "ADD_COLLATERAL" })` →
`planAddCollateral` ([`plan.ts`](../../src/onchain/accounts/intents/plan.ts)).

The simplest intent there is: the token lands on the account as it comes and the
debt is untouched. Nothing is routed, nothing is borrowed, so leverage falls —
the same position now stands on more of its own funds.

Use it to top a position up in the token it already holds, or to walk an account
back from a health factor it should not have. For collateral that has to be
levered on the way in, see [deposit](./deposit.md).

## Math

```text
require amount > 0
C1 = C0 + price(token → U, amount)
D1 = D0                              untouched
L1 = TVL1 / C1                       falls, because C grows and D does not
```

## Graph

```mermaid
flowchart TD
  in["addCollateral: token, amount, value?"]
  pos{"amount > 0?"}
  op{"facade / pool operable?"}
  s["steps: add(token, amount, value)"]
  c1["addCollateral(token, amount)<br/>addCollateralWithPermit when a permit is given"]
  grow{"token quotable and not forbidden?"}
  q["updateQuota(token, +) sized to the new balance<br/>quota = balanceᵤ · LT · (1 + reserve)"]
  head{"market quota headroom?"}
  hf{"HF >= 1.0? — main prices, nothing leaves"}
  out["preview: TVL up, debt flat, leverage down"]

  in --> pos
  pos -->|"no"| e1["insufficientSourceBalance"]
  pos --> op
  op -->|"no"| e2["marketPaused / marketExpired"]
  op --> s --> c1 --> grow
  grow -->|"no"| e3["forbiddenToken<br/>quotaLimitReached — the token counts as no collateral"]
  grow --> q --> head
  head -->|"no"| e4["quotaLimitReached"]
  head --> hf
  hf -->|"no"| e5["insufficientCollateral"]
  hf --> out
```

## Cases

```mermaid
flowchart LR
  subgraph a["the position token, or any quoted collateral"]
    a1["addCollateral(token, amount)"] --> a2["updateQuota(token, +)"]
  end
  subgraph b["the market underlying"]
    b1["addCollateral(U, amount)"] --> b2["no quota: the underlying takes none"]
  end
  subgraph c["a token the market takes no quota for"]
    c1["refused: quotaLimitReached"]
  end
  subgraph d["a forbidden token"]
    d1["refused: forbiddenToken"]
  end
```

## Notes

- The intent itself accepts any token; what narrows it is the growth guard, which
  refuses a balance the market forbids or cannot count as collateral.
- On an RWA market the raw asset is **not** wrapped here — that is the deposit
  flow. Adding the raw asset leaves it sitting as its own balance.
- `value` rides along for a wrapped-native market paid in the coin.
- Tests: [`add-collateral.onchain.test.ts`](../../src/onchain/accounts/intents/tests/add-collateral.onchain.test.ts).
