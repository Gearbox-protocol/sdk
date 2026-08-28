# Open a new strategy

`prepare.openNewStrategy` → `openStrategyIntent` → `previewOpenStrategy`
([`open-strategy.ts`](../../src/onchain/accounts/intents/open-strategy.ts)).

The one flow with no account to plan against: there is nothing on chain until
the transaction lands, so it emits no steps and no operation chain. The output
is the set of numbers `sdk.accounts.openCA` needs, plus the router path.

## Shape

```text
margin = Σ price(collateralᵢ → U)          own funds, in underlying
D      = margin · (L − 1) / LEVERAGE_DECIMALS
TVL    = margin + D
route  : {collateral…, D of U} ─ minus leftovers ─▶ target token
```

Both branches of the route are reported, which no other flow does: the
pathfinder returns expected and floor balances from one call, and `openCA` wants
`averageQuota` and `minQuota` to bracket the quota it buys.

## Graph

```mermaid
flowchart TD
  in["openNewStrategy: collateral[], targetToken, leverage L,<br/>slippage, quotaReserve, leftoverBalances"]
  lev{"L >= 1x?"}
  op{"facade / pool operable?"}
  m["margin = Σ price(collateralᵢ → U)"]
  mz{"margin > 0?"}
  d["D = margin · (L − 1)"]
  band{"D == 0 or minDebt <= D <= maxDebt?"}
  bor{"pool can lend D?"}
  route["router findOpenStrategyPath<br/>inputs: collateral + D of U<br/>minus leftoverBalances → targetToken"]
  q["quotas for both branches:<br/>quota = balanceᵤ · LT · (1 + reserve)"]
  grow{"every bought token quotable and not forbidden?"}
  head{"market quota headroom >= averageQuota?"}
  hf{"HF(averageAssets, averageQuota, D) >= 1.0?"}
  out["preview: creditManager, name, totalDebt, netValue,<br/>totalValue, leverage, priceImpact,<br/>averageAssets / minAssets,<br/>averageQuota / minQuota, calls"]

  in --> lev
  lev -->|"no"| e1["leverageOutOfRange"]
  lev --> op
  op -->|"no"| e2["marketPaused / marketExpired"]
  op --> m --> mz
  mz -->|"no"| e3["insufficientSourceBalance"]
  mz --> d --> band
  band -->|"no"| e4["debtOutOfRange"]
  band --> bor
  bor -->|"no"| e5["insufficientPoolLiquidity"]
  bor --> route --> q --> grow
  grow -->|"no"| e6["forbiddenToken / quotaLimitReached"]
  grow --> head
  head -->|"no"| e7["quotaLimitReached"]
  head --> hf
  hf -->|"no"| e8["insufficientCollateral"]
  hf --> out
```

## Cases

```mermaid
flowchart LR
  subgraph a["L = 1x, one collateral token"]
    a1["D = 0"] --> a2["route: collateral → target"] --> a3["openCA: debt 0, quota from target value"]
  end
  subgraph b["L > 1x, one collateral token"]
    b1["D = margin · (L − 1)"] --> b2["route: collateral + D of U → target"] --> b3["openCA: debt D"]
  end
  subgraph c["several collateral tokens"]
    c1["margin sums them at oracle prices"] --> c2["one many-to-one route, merged per token"] --> c3["openCA"]
  end
  subgraph d["leftoverBalances given"]
    d1["those balances stay unswapped"] --> d2["route spends the rest"] --> d3["they show up in averageAssets"]
  end
```

## Notes

- The transaction is `openCreditAccount`, not a multicall assembled here, so
  there are no `AccountCalculatorOperation`s and no quota "update" — a fresh
  account starts at zero quota, so the increase **is** the level to buy.
- Growth, headroom and the collateral check are all judged on the **expected**
  branch; the floor branch only feeds `minQuota`. The collateral check differs
  from the one every other flow makes, which weighs the floor — `openCA` hands
  the facade both branches, so the floor is not the whole of what the transaction
  promises. See [Two amounts per routed leg](./README.md#two-amounts-per-routed-leg).
- The requested `leverage` is total leverage (`300n` = 3x), not the debt
  multiple. The `leverage` the preview answers with is the read model's plain
  multiplier (`3`), as `StrategyPosition.leverage` reports it.
