## `@gearbox-protocol/sdk/preview` is gone

| Was | Now |
|---|---|
| `checkOperation`, `checkSimulation` | `@gearbox-protocol/sdk/onchain` **or** `sdk.preview.checkOperation` / `checkSimulation` |
| `checkPrerequisites` | **removed** — folded into `checkOperation` |
| `PrerequisiteResult`, `BalanceResult` | **removed** — the same facts arrive as `insufficientBalance` / `insufficientAllowance` / `rwaOpenRequirementsNotMet` in the error array |

Call them through the preview namespace:

```ts
const errors = await sdk.preview.checkOperation(
  { chainId, preview, sender },
  { minHealthFactor, minSafeHealthFactor, currentHealthFactor },
);

const creditErrors = await sdk.preview.checkSimulation(
  { chainId, state },
  { minHealthFactor, minSafeHealthFactor, currentHealthFactor },
);
```

## What changed in the checks

A check returns **every** `Error[]` it found, not the first one. An empty array
means everything passed.

### `checkOperation` (credit manager)

**Async**, **`sender` is required**, there is no `balances`. Open/adjust get the
full set; repay gets market + funding; close gets market only. The wallet and
RWA half of the former `checkPrerequisites` is inside the same array — pick the
approve and sign steps out by `code`.

| Now (`code`) | Before | Notes |
|---|---|---|
| `creditManagerPaused` | `marketPaused` + `{ creditManager }` | No `"pool" in detail`. |
| `marketExpired` | `marketExpired` | |
| `debtOutOfRange` | `debtOutOfRange` | Open/adjust; gains `ceiling` — what the market will lend, and the limit capping it. |
| `insufficientPoolLiquidity` | `insufficientPoolLiquidity` | Open/adjust; fields renamed: `binding` → `limit`, `solutionAmount` → `maxBorrowAmount`. |
| `forbiddenToken` | `forbiddenToken` | Open/adjust. |
| `quotaCountExceeded` | `quotaCountExceeded` | Open/adjust. |
| `quotaLimitReached` | `quotaLimitReached` | Open/adjust. |
| `insufficientCollateral` | `insufficientCollateral` | Open/adjust. Field renamed: `required` → `healthFactorThreshold`. |
| `insufficientBalance` | `checkPrerequisites` `BalanceResult` (`kind: "balance"`); with `balances`, `insufficientSourceBalance` | Open/adjust/repay. Async. Adds `holderKind?: "wallet" \| "creditAccount"`. `required` / `held` are `TokenAmount`. |
| `insufficientAllowance` | `checkPrerequisites` `AllowanceResult` (`kind: "allowance"`) | Open/adjust/repay. Async. `required` / `allowed` are `TokenAmount` (the token rides on `required`). |
| `rwaOpenRequirementsNotMet` | `checkPrerequisites` `RWAOpenRequirementsResult` (`kind: "rwaOpenRequirements"`) | RWA open. Async. Sign/register by `code`. |
| `unexpectedFailure` | `PrerequisiteResult.error` (read/RPC) | Open/adjust/repay. Async. "Can't verify"; the same `code` prepare uses. |

### `checkOperation` (pool)

**Async**, **`sender` is required**, there is no `balances`.
Deposit/mint/withdraw/redeem.

| Now (`code`) | Before | Notes |
|---|---|---|
| `poolPaused` | `marketPaused` + `{ pool }` | |
| `poolSunset` | `poolSunset` | Deposit only. |
| `insufficientPoolLiquidity` | `insufficientPoolLiquidity` | `binding` → `limit`. |
| `insufficientBalance` | `checkPrerequisites` `BalanceResult` (`kind: "balance"`); with `balances`, `insufficientSourceBalance` | Async. `required` / `held` are `TokenAmount`. |
| `insufficientAllowance` | `checkPrerequisites` `AllowanceResult` (`kind: "allowance"`) | Async. `required` / `allowed` are `TokenAmount`. |
| `unexpectedFailure` | `PrerequisiteResult.error` (read/RPC) | Async. "Can't verify". |

### `checkSimulation` — credit only

Standalone it is sync; on `sdk.preview` it is async. `CheckSimulationInput` is
`{ chainId, state }` and nothing else; `state` is an adjusted account's
`OperationState` or an opening's `OpenStrategyState`, whose quotas are counted
from `averageQuota`.

No funding and no RWA, and no `forbiddenToken` / `quotaLimitReached`:
`OperationState` is the snapshot *after* the operation, without what the
operation itself added, and the engine has already weighed those.

There is no pool branch. `prepare.deposit` / `withdraw` / `redeem` read the
pool's own state themselves and refuse in their own envelope. The credit branch
earns its keep by holding an account to **the caller's own thresholds**, which
the engine never applies — it enforces the facade's `1.0`. The pool checks have
no such threshold: all three are absolutes over loaded market state, so they
belong where the transaction is assembled.

| Now (`code`) | Before | Notes |
|---|---|---|
| `creditManagerPaused` | `marketPaused` + `{ creditManager }` | No `"pool" in detail`. |
| `marketExpired` | `marketExpired` | |
| `debtOutOfRange` | `debtOutOfRange` | |
| `quotaCountExceeded` | `quotaCountExceeded` | The engine does not weigh this one. |
| `insufficientCollateral` | `insufficientCollateral` | Thresholds (`minHealthFactor`, `minSafeHealthFactor`, `currentHealthFactor`) are passed in `checkSimulation`'s options. Renamed: `required` → `healthFactorThreshold`. |

### The pool's own state is a `prepare` refusal now

A client's own `pool.paused` / `pool.sunset && op === "pool-deposit"` /
`tokenOut > sim.availableLiquidity` can go — all three arrive as `ok: false`
from `prepare`.

| `code` | When | Notes |
|---|---|---|
| `poolPaused` | deposit, withdraw, redeem | Was: the client's `pool.paused`. |
| `poolSunset` | deposit only | Was: the client's `pool.sunset && op === "pool-deposit"`. |
| `insufficientPoolLiquidity` | withdraw / redeem only | Weighed against `pool.availableLiquidity`, not the trimmed `PoolSimulation.availableLiquidity`. Equality is already an error. |

The three methods widen their error unions with these codes.

## `previewOperation`

A malformed transaction is no longer a `warning` field — it is an outright
error.

Six codes (`malformedBracket`, `adapterCallOutsideBracket`, …) collapse into one
`malformedTransaction`, with all the detail in `message` (a front end has no
need to tell them apart).

The remaining `error.code`s:

| Now | Before |
|---|---|
| `unsupportedTarget` | same |
| `unsupportedPoolFunction` | same |
| `unsupportedZapperFunction` | same |
| `unsupportedOperation` | same |
| `invalidDelayedIntent` | same |
| `poolOperationPreviewError` | `previewSimulationFailed` |
| `malformedTransaction` | six malformed codes, on `warning` |
| `creditAccountNotFound` | thrown, not in the union |

On success, in the data shape:

- `warning` can now only be an unpriceable token.
- `PoolPositionOperationPreview` gains `zapper?` and `holder`, so calldata is
  not parsed twice.
- `OpenStrategyPositionPreview`: `RWAOpenCreditAccount` gains `rwaArgs`.

## New: `sdk.liquidations.checkLiquidation`

```ts
await sdk.liquidations.checkLiquidation({ details, liquidator });
```

`details` comes from `getLiquidationDetails` called with the **same**
`liquidator`.

## `openNewStrategy`: the type says an empty opening takes nothing

`OpenStrategyParams` is a union — `{ empty: true }`, or the shape it always had
with collateral and leverage. `emptyOpenTakesNothing` is gone with the runtime
guard: collateral, `creditAccount` and `leverage` can no longer be named beside
the flag, so there is nothing left to refuse.

The empty branch names them as `never` rather than leaving them out. Excess
property checking is a freshness rule — it fires on an object literal and on
nothing else — so a bare `{ empty: true }` would still let params built up in a
variable carry all three straight through and have them dropped in silence.

```ts
// before
await sdk.opportunities.prepare.openNewStrategy(strategy, {
  empty: true,
  collateral: [],
  leverage: 0n,
});

// now
await sdk.opportunities.prepare.openNewStrategy(strategy, { empty: true });
```
