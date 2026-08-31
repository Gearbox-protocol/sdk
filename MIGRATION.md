# SDK Migration Guide

Migration notes between consecutive versions of `@gearbox-protocol/sdk` that
introduce consumer-visible breaking changes. New sections are appended below
as future releases ship.

## v14.x → v14.10

> Despite being a minor bump, `v14.10.0` introduced consumer-visible breaking
> changes. A short-lived `v15.0.0-next.{1,2,3}` prerelease line carried the
> same changes but was never released as stable — `^14.10.0` is the supported
> upgrade target.

### Summary of changes

- **`sdk.accounts` and `sdk.pools` are now built for you.** `OnchainSDK` instantiates a `CreditAccountsServiceV310` and a `PoolService` in its constructor and exposes them as `sdk.accounts` (`ICreditAccountsService`) and `sdk.pools` (`IPoolsService`). You no longer create these services manually.
- **`createCreditAccountService` factory removed.** Use `sdk.accounts` directly.
- **`AbstractCreditAccountService` removed.** Its functionality was merged into `CreditAccountsServiceV310`.
- **`CreditAccountServiceV310` renamed to `CreditAccountsServiceV310`** (note the plural `Accounts`).

---

### Use `sdk.accounts` instead of `createCreditAccountService`

**Before:**

```typescript
import { createCreditAccountService } from "@gearbox-protocol/sdk";

const accounts = createCreditAccountService(sdk, 310);
const data = await accounts.getCreditAccountData(account);
```

**After:**

```typescript
const data = await sdk.accounts.getCreditAccountData(account);
```

### Use `sdk.pools` instead of `new PoolService(sdk)`

**Before:**

```typescript
import { PoolService } from "@gearbox-protocol/sdk";

const pools = new PoolService(sdk);
pools.getDepositTokensIn(pool);
```

**After:**

```typescript
sdk.pools.getDepositTokensIn(pool);
```

### Rename `CreditAccountServiceV310` → `CreditAccountsServiceV310`

```diff
- import { CreditAccountServiceV310 } from "@gearbox-protocol/sdk";
+ import { CreditAccountsServiceV310 } from "@gearbox-protocol/sdk";
```

### Automated migration

An agent skill ships with this repo at
[`skills/gearbox-sdk-v14.x-to-v14.10`](skills/gearbox-sdk-v14.x-to-v14.10/SKILL.md).

```bash
npx skills add Gearbox-protocol/sdk --skill gearbox-sdk-v14.x-to-v14.10
```

---

## v13 → v14

### Summary of changes

- **`OnchainSDK`** — renamed from `GearboxSDK`, single-chain entry point
- **Instantiation is now two steps**: `new OnchainSDK(network, clientOptions, options)` then `await sdk.attach()` or `sdk.hydrate(state)`
- **Network is explicit**: you pass a `NetworkType` string (e.g. `"Mainnet"`) to the constructor instead of relying on auto-detection
- **`blockNumber`, `addressProvider`, `marketConfigurators`** moved out of constructor options into `AttachOptions`
- **`reattach()` / `rehydrate()`** — dropped entirely (create a new instance instead)
- **hooks** dropped from OnchainSDK
- **`MultichainSDK`** — new class wrapping multiple `OnchainSDK` instances (one per chain)

---


### Imports

```diff
- import { GearboxSDK } from "@gearbox-protocol/sdk";
+ import { OnchainSDK } from "@gearbox-protocol/sdk";
```

### Creating and attaching the SDK

**Before:**

```typescript
const sdk = await GearboxSDK.attach({
  rpcURLs: [RPC_URL],
  timeout: 480_000,
  logger,
  blockNumber: 24736900,
  plugins: {
    bots: new BotsPlugin(),
  },
});
```

**After:**

```typescript
const sdk = new OnchainSDK(
  "Mainnet",                                    // explicit network
  { rpcURLs: [RPC_URL], timeout: 480_000 },     // client options
  {                                              // SDK options
    logger,
    plugins: {
      bots: new BotsPlugin(),
    },
  },
);
await sdk.attach({ blockNumber: 24736900 });    // attach options
```

Key differences:
- Network type (`"Mainnet"`, `"Arbitrum"`, etc.) is now a **required** constructor argument
- Client connection config and SDK options are separate arguments
- `blockNumber`, `addressProvider`, `marketConfigurators` move to `attach()`
- Constructor is sync; `attach()` is async

### Hydrating from saved state

**Before:**

```typescript
const sdk = await GearboxSDK.hydrate(savedState, {
  rpcURLs: [RPC_URL],
  logger,
});
```

**After:**

```typescript
const sdk = new OnchainSDK(
  "Mainnet",
  { rpcURLs: [RPC_URL] },
  { logger },
);
sdk.hydrate(savedState, { redstone, pyth }); // synchronous
```

### Removed methods

| Old | Replacement |
|---|---|
| `sdk.reattach(...)`  | Create a new `OnchainSDK` instance |
| `sdk.rehydrate(...)` | Create a new `OnchainSDK` instance |

### Removed hooks

Instead of `sdk.addHook('syncState', handler)` await sync and run your code:

```
const success = await sdk.syncState()
if (success) {
  await myFn(sdk.currentBlock);
}
```

If you need to subscribe to block changes there's now new async helper that acts as mutex for onBlock callback
```
const unwatch = watchBlocksAsync(client, {
  onBlock: async (block, prevBlock) => {
    console.log("new block", block.number);
  },
  onDrop: (block) => {
    console.log("dropped block", block.number);
  },
  onError: (err) => {
    console.error(err);
  },
});
```


### Automated migration

An agent skill ships with this repo at
[`skills/gearbox-sdk-v13-to-v14`](skills/gearbox-sdk-v13-to-v14/SKILL.md). 

```bash
npx skills add Gearbox-protocol/sdk --skill gearbox-sdk-v13-to-v14
```

---

## v16.0.0-next.x → next

### Summary of changes

- **One validation parc.** The flat validators under `@gearbox-protocol/sdk/common-utils` are **removed**. Their checks now live in `@gearbox-protocol/sdk/onchain` as `check*` functions returning the same `reason` + `detail` shape the intents engine already refuses with, so a caller reads one error model instead of two.

| Removed from `/common-utils` | Replacement | Where |
| --- | --- | --- |
| `validateHF` | `checkCollateralised` | `/onchain` |
| `validateCreditManager` | `checkCreditManagerPaused` | `/onchain` |
| `validateTokenToObtain` (address form) | `checkForbiddenToken` | `/onchain` |
| `validateTokenToObtain` (`Asset[]` form) | — dropped, no caller | — |
| `validateBalance` / `validateBalances` | `checkFunding` | `/onchain` |
| `validateQuota` (`insufficientQuota`) | `checkQuotaLimit` | `/onchain` |
| `validateQuota` (`maxQuotasLengthReached`) | `checkQuotaCount` | `/onchain` |
| `validateQuota` (`quotaShouldBeUpdated`) | — dropped, no caller | — |
| `validateOpenAccount` (debt band) | `checkDebtInBand` | `/onchain` |
| `validateOpenAccount` (`loading`) | — dropped: a caller's own state, not a refusal | — |
| `validateOpenAccountPoolStatus` | `checkOpenAccountCeilings` | `/common-utils` (`strategies`) |
| `validateOpenAccountPoolQuotaStatus` | folded into `checkOpenAccountCeilings` | `/common-utils` |
| the six-validator chain in `getCMYouCanEarn` | `checkCreditManagerUsable` | `/common-utils` |
| `isZeroBalance` | **moved**, unchanged | `/onchain`, beside `DUST_THRESHOLD` |
| `MIN_HF_LIMITED` | **moved**, unchanged | `/onchain` |
| `FlattenUnion` | — dropped with the flat results it flattened | — |

`validateBalance`'s `zeroBalance` / `enterAmount` / `unknownToken` have no successor reason: they describe a form's own state rather than something the protocol refuses. The one caller that relied on the dust floor (`getCMYouCanEarn`) keeps it as its own filter.

`getCMYouCanEarn`'s error string changed with them: it renders `error.reason` where it rendered `error.message`, and the three debt-limit messages collapsed into one `insufficientPoolLiquidity` reason discriminated by `detail.binding`.
- **`checkOperation`** joins `previewOperation` and `checkPrerequisites` in `@gearbox-protocol/sdk/preview`: it validates a parsed operation synchronously and reports the most fundamental issue it finds, or `null`.
- **Refusal details inline their tokens.** `PreviewErrorDetails` now carries `Token` and `TokenAmount` where it carried `Address` and `Asset`, so a row is renderable without a token dictionary.
- **`marketPaused` covers pools**, `insufficientPoolLiquidity` names which ceiling bound, and three reasons are new: `poolSunset`, `quotaCountExceeded`, `malformedTransaction`.
- **`checkOperation` weighs a pool payout** against the liquidity the pool holds, refusing at equality as the legacy withdrawal validator did. It does **not** check whether a deposit has a route — that belongs to the simulator, which refuses such a deposit before there is calldata to preview.
- **Previews report the safe factor** beside the main one (`estSafeHealthFactor` beside `estHealthFactor`), and so does a simulation (`OperationState.safeHealthFactor`); both are always filled in, whether or not the operation hands funds over. On the `est` prefix, see [Two amounts per swap](#two-amounts-per-swap-est-on-what-only-the-floor-is-known-for).
- **`checkSimulation`** applies a caller's stricter bars to a simulation the engine already accepted, and `checkOperation`/`checkCollateralised` take `currentHealthFactor`/`improvesFrom`, so an operation that raises the factor is not refused from under the bar.
- **`prepare.finalize` reports a claim that settled only part of a withdrawal**, which a legacy Mellow multivault answers with: it serves that share and returns the rest as `remainder`, see [A claim can settle only part of a delayed withdrawal](#a-claim-can-settle-only-part-of-a-delayed-withdrawal).

### Replace the flat validators with the checks

The checks take the numbers they compare rather than an aggregate, and the bar
is a parameter — there is no single right health-factor limit, so the caller
states the one it holds the account to.

**Before:**

```typescript
import { validateHF, MIN_HF_LIMITED } from "@gearbox-protocol/sdk/common-utils";

const error = validateHF({ hf }); // { message: "hfTooLow" } | null
```

**After:**

```typescript
import {
  checkCollateralised,
  MIN_HEALTH_FACTOR_FORM,
} from "@gearbox-protocol/sdk/onchain";

// `required` is the lowest acceptable factor: a factor equal to it passes,
// which is why the form's bar is a step above `MIN_HF_LIMITED`.
const issue = checkCollateralised({
  healthFactor: hf,
  required: MIN_HEALTH_FACTOR_FORM,
  safePrices: false,
});
// { reason: "insufficientCollateral", detail: { healthFactor, required, safePrices } } | null
```

`isZeroBalance` and `MIN_HF_LIMITED` moved rather than changed — the same
values, imported from `@gearbox-protocol/sdk/onchain`.

### Read details through the token, not the address

**Before:**

```typescript
if (refusal.reason === "forbiddenToken") {
  const symbol = sdk.tokensMeta.getToken(refusal.detail.token)?.symbol;
}
if (refusal.reason === "debtOutOfRange") {
  format(refusal.detail.maxDebt.balance);
}
```

**After:**

```typescript
if (refusal.reason === "forbiddenToken") {
  const { symbol } = refusal.detail.token;
}
if (refusal.reason === "debtOutOfRange") {
  format(refusal.detail.maxDebt.value, refusal.detail.maxDebt.token.decimals);
}
```

`marketPaused` now narrows: `"pool" in detail` tells an LP refusal from a credit
one.

### Validate a parsed transaction

```typescript
import { AddressMap, MIN_HEALTH_FACTOR_FORM } from "@gearbox-protocol/sdk/onchain";
import { checkOperation, previewOperation } from "@gearbox-protocol/sdk/preview";

const preview = await previewOperation({ sdk, to, calldata, sender });

// Every bar is optional; omitting one switches its check off.
const issues = checkOperation(
  { sdk, preview },
  {
    minHealthFactor: MIN_HEALTH_FACTOR_FORM,
    balances: new AddressMap<bigint>([[usdc, 1_000_000n]]),
  },
);
```

The most fundamental issue is reported and the rest are not weighed; `null`
means nothing refuses the transaction. A 2xxx preview error is not an issue — the transaction
is fine and only the SDK's evaluation was incomplete, so it stays on
`preview.error` for the caller to surface as a caveat.

### One vocabulary for `prepare` and `preview`

The two halves of the account story — `prepare`, which walks a request forward
into calls, and `preview`, which decodes calls and replays them back — answered
the same questions in different words. They now answer in the read model's:
`totalDebt`, `totalValue`, `netValue` and `leverage` mean on a projection what
they mean on a `StrategyPosition`.

The shared shape is **`AccountProjection`** (exported from
`@gearbox-protocol/sdk/model`). `OperationState` extends it, and the previews
extend the floor-branch variant of it described below, so a caller that renders
one renders them all and a name drifting apart on one side is now a compile
error.

It is assembled from two halves, both exported beside it: **`AccountHoldings`**
(what the account is worth and what it is made of) and **`AccountMetrics`** (what
follows from that — the health factors, the borrow rate, the time to liquidation,
the liquidation price and the leverage). A component that renders risk numbers
and nothing else takes an `AccountMetrics`. The deltas only `preview` reports are
**`AccountStateChange`** (`totalDebtChange`, `quotasChange`, `assetsChange`).

Both sides fill a projection from one builder, `sdk.positions.projection`
(metrics alone: `sdk.positions.metrics`), so the numbers cannot drift; the
cross-check that holds them to each other is
`src/preview/preview/previewMatchesPrepare.test.ts`.

**A `prepare` result carries a `state`, not a `preview`.** The field was named
after the module it is *not*: `preview` is what reads calldata back, while a
`prepare` result is a plan and what it reports is the state that plan reaches.
So every result of the module — `LpPrepare`, `StrategyPrepare`,
`DelayedStrategyPrepare`, `OpenStrategyPrepare`, and the engine's
`IntentPreviewResult` and `DelayedStartResult` behind them — renames it:

```diff
- const { preview, calls } = plan;
+ const { state, calls } = plan;
```

Opening follows the same word: `OpenStrategyPreview` is now **`OpenStrategyState`**
and the function producing it, `previewOpenStrategy`, is **`buildOpenStrategyState`**.

### `prepare` answers in the SDK's error envelope

A refusal is an answer, not an exception — that has not changed. The envelope
did: every refusable method returns an **`SDKReturn<T, E>`** (from
`@gearbox-protocol/sdk/model`), discriminated on `ok` — deliberately the
discriminant consumers already narrow on:

```ts
interface SDKResult<T> { ok: true; data: T }
interface SDKError<E extends IGearboxError = IGearboxError> { ok: false; error: E }
type SDKReturn<T, E extends IGearboxError> = SDKResult<T> | SDKError<E>;
// plus sdkOk / sdkErr / isSDKError helpers
```

```diff
  const result = await sdk.prepare.depositStrategy(position, params);
- if (!result.ok) {
-   return showRefusal(result.reason, result.detail.maxDebt);
- }
+ if (isSDKError(result)) {
+   return showRefusal(result.error.code, result.error.maxDebt);
+ }
  const tx = await sdk.execute.buildTx({ kind: "account", sim: result, ... });
```

There is **no `DataResponse` on prepare any more**: a prepared operation names
one chain and one source, so the multichain envelope carried nothing. Its one
useful field moved onto the results — every `*Result` carries `blockNumber`
and `timestamp`, the block its numbers reflect. Result payloads are
**`LpResult`**, **`StrategyResult`**, **`OpenStrategyResult`**,
**`DelayedStrategyResult`** and **`StrategyRoutesResult`**.

The blanket `PrepareError` union is gone. Every method's signature names its
own exact error union inline, over two documented bases (`AccountFlowError`
for operations on an existing account, `OpenFlowError` for the account-less
open) — the union in the signature IS the list a caller has to handle,
checked by the compiler.

## Per-method error unions

| method | error union |
| --- | --- |
| `deposit` / `withdraw` / `redeem` | `UnsupportedTokenPairError` (sync — bugs still throw) |
| `openNewStrategy` | `OpenFlowError` + debtOutOfRange, leverageOutOfRange, unsupportedTokenPair, insufficientPoolLiquidity, noStrategyTargetCollateral |
| `depositStrategy` | `AccountFlowError` + debtOutOfRange, leverageOutOfRange, unsupportedCollateralToken, unsupportedTokenPair, insufficientPoolLiquidity |
| `repayStrategy` | `AccountFlowError` + debtOutOfRange, unsupportedCollateralToken |
| `addCollateral` | `AccountFlowError` alone |
| `withdrawCollateral` | `AccountFlowError` alone |
| `withdrawStrategy` | `AccountFlowError` + debtOutOfRange, unsupportedTokenPair, noDelayedRoute, multipleDelayedWithdrawals, withdrawalInProgress — `& WithRouteRefusals` |
| `adjustLeverage` | `withdrawStrategy`'s + insufficientPoolLiquidity, leverageOutOfRange — the widest |
| `finalize` | `AccountFlowError` + noRecordedIntent, noDelayedRoute, withdrawalInProgress, unsupportedTokenPair |

`poolSunset`, `quotaCountExceeded` and `malformedTransaction` are preview-only
and appear in no prepare union — the exactness type tests refuse them.
`maxWithdraw`, `maxRepay` and `maxWithdrawCollateral` return bare
`Promise<bigint>` and throw on a missing account; `leverageBand` and
`withdrawableCollaterals` stay as they were.

`preview` speaks the same envelope: `previewOperation` returns
`SDKReturn<OperationPreview, PreviewOperationError>` where the union is the
six declassed refusal errors (unsupported target / pool function / operation
/ zapper
function, invalid delayed intent, failed simulation) — plain objects now, not
thrown Error classes, and RETURNED end to end: `parseOperationCalldata`,
`checkPrerequisites`, `ZapperContract.parseOperation`,
`RedemptionLogger.getDelayedIntent`, `detectDelayedOperation` and the
simulate helpers all answer `SDKReturn`; nothing throws a refusal and
nothing catches one. `IntentPreviewError` left the public barrels; it is the
engine's internal transport only.

## Throw dispositions

Every audited bare `throw` on a public operation path is classified; the
list-driven `throwSweep.test.ts` fails on an unlisted site:

| site | disposition |
| --- | --- |
| `intents/index.ts` — exhaustive-switch default ("not implemented") | kept: unreachable invariant behind the typed intent union |
| `intents/index.ts` — "plan started no withdrawal" | kept: engine self-contradiction, a bug not a refusal |
| `intents/index.ts` — "no request among the operations" | kept: engine self-contradiction |
| `intents/index.ts` — "neither answered nor refused" | kept: allSettled invariant |
| `tail.ts` — exhaustive-switch default | kept: decodeDelayedIntent refuses unknown types first |
| `tail.ts` — "queued nothing to claim" | **converted** → `noRecordedIntent` (a foreign or malformed claim is caller input) |

Boundary codes (`noStrategyTargetCollateral`, `creditAccountNotFound`,
`unexpectedFailure`) stand as introduced above; `unexpectedFailure` is the one
non-refusal — the SDK could not find out — and carries the original `cause`.

## Consumer impact

Measured with the built dist linked over each consumer (full report with the
raw tsc output: `docs/plans/precise-error-unions.impact.md`):
**gearbox-backend — zero new errors** (it does not consume the facade);
**client-v3 — 34 errors in 7 files**, led by `useSimulate.ts` (14) and
`useClaimDelayedWithdrawal.ts` (7) — the seed of its own migration plan.

### A claim can settle only part of a delayed withdrawal

`prepare.finalize` used to assume what every redemption venue but one does: a
request queues an amount, one claim brings all of it, one tail finishes the
operation. A legacy Mellow multivault pays out what its subvaults hold liquid
and re-queues the rest, so its claim credits an instant output **and** a delayed
one — and accounts holding those phantoms are still around.

The tail now serves the share that arrived and says what is left, so the result
is a **`FinalizeResult`**: a `StrategyResult` with one field more.

```diff
  const tail = await sdk.opportunities.prepare.finalize(position, {
    claimable,
+   // a Mellow request cannot carry an intent, so it is passed in — as is the
+   // one a previous partial claim left behind
+   intent,
  });
  if (isSDKError(tail)) return showRefusal(tail.error.code, tail.error);
  await send(tail.data.calls);
+ if (tail.data.remainder) {
+   // not over: come back with the next claim and the intent this one did not
+   // serve, in tail.data.remainder.intent
+   showStillInFlight(tail.data.remainder.inFlight);
+ }
```

`remainder` is `undefined` for every venue that answers whole, which is the
normal case and the only one that existed before. When it is set, a withdrawal
splits its payout and its deferred repayment in the proportion that arrived — so
the two claims together pay the wallet once and the loan once — a deleveraging
puts what came into the debt as it always did, and an exit repays instead of
selling, because the account cannot be emptied while a phantom sits on it. A
claim that credited nothing at all is now planned as a claim alone rather than
refused with `insufficientSourceBalance`: sending it is what moves the queue.

The engine's `finishIntent` mirrors this: it returns `FinishIntentResult`, which
is its old `ok` union plus `remainder: ClaimRemainder | undefined`.

For any of it to be visible, the read model had to stop flattening what the
compressor reports: the outputs of a withdrawal are **`WithdrawalOutputAmount`**
now, a `TokenAmount` with the `isDelayed` the compressor puts on it. It is on
`PositionClaimableWithdrawal.outputs` and `PositionPendingWithdrawal.expectedOutputs`,
both read through `sdk.positions.getCurrentWithdrawals()`, and it is what tells
an output that lands from one that is another phantom. Code that only reads
`token` and `value` off them needs no change; code that builds one — a fixture,
a mock — has a field to fill in.

### Two amounts per swap: `est` on what only the floor is known for

A routed leg is quoted twice — the amount the pathfinder expects to return, and
the floor it guarantees once slippage is allowed for — and the two halves of the
SDK do not have the same access to them:

- **`prepare` reports the expected branch.** The calls it builds still use the
  floor, because that is all a transaction can promise the facade, and so do its
  guards: a plan whose floor lands the account under water is refused even where
  the expected branch would clear. But `OperationState` now describes where the
  position is expected to land, which for a routed flow is a slippage-worth
  higher than what it used to report. `openNewStrategy` already worked this way;
  every other flow now agrees with it.
- **`preview` can only report the floor**, since calldata carries nothing else.

Naming both `healthFactor` would invite a screen to show one as the other, so
every projection field a route decides is prefixed `est` on the preview side:

| On a projection (`prepare`) | On a preview |
| --- | --- |
| `totalValue`, `netValue`, `assets` | `estTotalValue`, `estNetValue`, `estAssets` |
| `healthFactor`, `safeHealthFactor` | `estHealthFactor`, `estSafeHealthFactor` |
| `borrowRate` | `estBorrowRate` |
| `timeToLiquidation`, `liquidationPrice`, `leverage` | `estTimeToLiquidation`, `estLiquidationPrice`, `estLeverage` |

`totalDebt` and `quotas` are unprefixed on both sides: the calls name them
outright, so there is one answer regardless of how the swap lands. So is the
market half — `creditManager`, `name`, `curator`, `liquidationDiscount` — which
no swap can move. `assetsChange`, `quotasChange` and `totalDebtChange` keep their
names too — `prepare` reports no deltas, so there is nothing to confuse them
with.

The borrow rate is prefixed even though the debt and the quotas are all it is
made of, because half of the breakdown is normalized against them and half
against the position's value: `base` and `totalOnDebt` are the same on either
branch, while `total` and the per-token `quotas[].rate` divide by `totalValue`
and so come out higher on the floor. A field cannot be half prefixed, and the
half that moves is the half a screen shows.

The exact field list lives in one place, `RoutedField` in
`@gearbox-protocol/sdk/model`, with `EstimatedProjection` derived from it and
`asEstimated` converting between the two; a field added to one is a compile error
until it is added to the others. Where nothing routes the two branches coincide
exactly, which is what lets the cross-check test hold `estHealthFactor` equal to
`healthFactor` for the flows that only move collateral and debt.

**Renamed types**

`preview`'s results are named after the `prepare` flow they are the far side of,
so the two halves of one operation are found under one name:

| Was | Now | `prepare` counterpart |
| --- | --- | --- |
| `OpenCreditAccountPreview` | `OpenStrategyPositionPreview` | `prepare.openNewStrategy` |
| `AdjustCreditAccountPreview` | `AdjustStrategyPositionPreview` | `prepare.depositStrategy`, `withdrawStrategy`, `addCollateral`, `withdrawCollateral`, `adjustLeverage` |
| `RepayCreditAccountPreview` | `RepayStrategyPositionPreview` | `prepare.repayStrategy` (whole debt) |
| `CloseCreditAccountPreview` | `ExitStrategyPositionPreview` | `prepare.withdrawStrategy` (everything) |
| `DelayedCreditAccountOperationPreview` | `DelayedStrategyPositionOperationPreview` | the delayed route of either |
| `InstantOperationPreview` | `InstantStrategyPositionOperationPreview` | — (union of the three above) |
| `PoolOperationPreview` | `PoolPositionOperationPreview` | `prepare.deposit`, `withdraw`, `redeem` |

`OperationPreview`, the union `previewOperation` returns, keeps its name. The
builders behind it are renamed to match their results
(`previewAdjustCreditAccount` → `previewAdjustStrategyPosition`,
`previewCloseOrRepayCreditAccount` → `previewExitOrRepayStrategyPosition`,
`buildDelayedPreview` → `buildDelayedStrategyPositionOperationPreview`, and so
on); the `Position` in the middle is there because `prepare` already owns the
plain names.

**Renamed fields**

| Type | Was | Now |
| --- | --- | --- |
| `OperationState` | `accountDebt` | `totalDebt` |
| `CreditAccountSlice` | `accountDebt` | `totalDebt` |
| `OpenStrategyState` | `debt` | `totalDebt` |
| `OpenStrategyState` | `collateral` | `netValue` |
| `OpenStrategyPositionPreview` | `debt` | `totalDebt` |
| `OpenStrategyPositionPreview` | `collateralValue` | `estNetValue` |
| `OpenStrategyPositionPreview` | `collateral` | `collateralAdded` |
| `OpenStrategyPositionPreview` | `target` | `targetCollateral` |
| `AdjustStrategyPositionPreview` | `debt` | `totalDebt` |
| `AdjustStrategyPositionPreview` | `debtChange` | `totalDebtChange` |

The `est` prefix on the rest of both previews' projection fields is covered
above.

`OpenStrategyPositionPreview.debt` also read the debt *principal* where every
metric beside it read the total. The two are equal at opening, so the value is
unchanged; only the field's meaning is now what its name says.

`RepayStrategyPositionPreview.debtRepaid` keeps its name: it is
`−totalDebtChange`, and a repayment screen reads it with the sign it has.

**Retyped fields**

| Type | Field | Was | Now |
| --- | --- | --- | --- |
| `AccountProjection` (both sides) | `totalValue`, `totalDebt` | `bigint` | `TokenAmount` |
| `OpenStrategyPositionPreview` | `estNetValue` | `bigint` | `TokenAmount` |
| `AdjustStrategyPositionPreview` | `totalDebtChange` | `bigint` | `TokenAmount` |
| `RepayStrategyPositionPreview` | `debtRepaid` | `bigint` | `TokenAmount` |
| `OpenStrategyState` | `totalDebt`, `netValue`, `totalValue` | `bigint` | `TokenAmount` |
| `OperationState` | `quotas` | `Record<Address, Asset>` | `TokenAmount[]` |
| `PoolSimulation` | `tokenIn`, `tokenOut` | `Asset` | `TokenAmount` |
| `PoolSimulation` | `availableLiquidity` | `bigint` | `Amount` |

The underlying-denominated scalars are now priced, so a caller no longer
converts them itself: `preview.totalDebt.valueUsd` is filled in where the oracle
can price the market underlying. A caller that wants the raw figure reads
`.value`.

`OperationState.quotas` becomes a list in the shape the previews already used —
`token` names the collateral, `value` is the quota bought for it, denominated in
the market's underlying (the same convention as `PositionCollateral.quota`).
A token the account leaves unquoted is absent, as before.

`safeHealthFactor` is reported everywhere a projection is, `OperationState`
included: which of the two factors decides a transaction is a property of the
call that ends up being sent, and a screen showing the account is entitled to
both. The engine still judges an operation that hands funds over by the safe
factor and everything else by the main one.

**New fields**

`OpenStrategyState` gains `leverage` (the read model's plain multiplier, not
the `LEVERAGE_DECIMALS`-scaled figure the request asks for) and
`safeHealthFactor`, so it carries the same metrics as every other credit
surface.

```diff
- const debt = preview.debt;
- const equity = preview.totalValue - preview.debt;
+ const debt = preview.totalDebt.value;
+ const equity = preview.estTotalValue.value - preview.totalDebt.value;
+ const debtUsd = preview.totalDebt.valueUsd;
```

`PoolSimulation` moved the same way, and its result is fed straight back into
`sdk.pools`, which still takes bare `Asset` pairs — so a caller passing one on
names the two fields the call wants:

```diff
  const sim = sdk.pools.simulateDeposit({ pool, amount, tokenIn, tokenOut });
- const meta = sdk.pools.getDepositMetadata(pool, sim.tokenIn.token, sim.tokenOut.token);
- sdk.pools.addLiquidity({ pool, wallet, collateral: sim.tokenIn, meta });
+ const meta = sdk.pools.getDepositMetadata(
+   pool,
+   sim.tokenIn.token.address,
+   sim.tokenOut.token.address,
+ );
+ sdk.pools.addLiquidity({
+   pool,
+   wallet,
+   collateral: { token: sim.tokenIn.token.address, balance: sim.tokenIn.value },
+   meta,
+ });
```

`availableLiquidity` is an `Amount` for the same reason `PoolOpportunity`'s is,
so the payout check reads `sim.tokenOut.value > sim.availableLiquidity.value`.

**One quantity was also being reported wrong.** `usdToNumber` weighed its dust
threshold on the signed value, so every negative amount priced as `$0`. That was
invisible while the negative fields (`assetsChange`, `quotasChange`) were the
only ones carrying it; `totalDebtChange` and `debtRepaid` would have joined them.
The threshold now weighs the magnitude, so a repayment reports a negative
`valueUsd` rather than zero.


### Every credit result names its own market

`AccountProjection` gained four fields, so every producer of one — the two
credit previews, `OperationState` and `OpenStrategyState` — now carries them:

| Field | Type | Was |
| --- | --- | --- |
| `creditManager` | `Address` | on the previews only; a simulation made the caller carry it |
| `name` | `string` | on the previews only |
| `curator` | `Curator` | read off the market configurator by the caller |
| `liquidationDiscount` | `Bps` | read off the credit manager's fees by the caller |
| `netValue` | `TokenAmount` | on `OpenStrategyPositionPreview` and `OpenStrategyState` only; elsewhere the caller subtracted |

The four market fields are **`CreditOperationMarket`**, exported beside
`AccountProjection` and filled from one place (`creditOperationMarket(suite)`),
so they cannot drift between the halves. The results that carry no projection
carry it too — `ExitStrategyPositionPreview`, `RepayStrategyPositionPreview` and
`DelayedStrategyPositionOperationPreview` — because the market an operation happened in is
worth naming even where the position it left behind is empty.

**`LiquidatableAccount` carries it as well**, so a liquidation row and a
`prepare` result name a market in one vocabulary. It keeps `creditManager` and
gains `name`, `curator` and `liquidationDiscount`; `LiquidationDetails`, which
extends it, gains them with it. Its own two figures are unchanged and still
weigh the premium alone: `repaymentAmount` is `totalValue` less the premium the
liquidator keeps, and `estimatedProfit` is that premium — the protocol's
liquidation fee comes out of what the repayment covers, so neither is
`totalValue × liquidationDiscount`.

`curator` is the model's `Curator` — the market configurator's address plus the
display name and page a screen labels it with — the same shape and the same
getter `StrategyOpportunity.curator` reports, rather than a bare address a
caller would have to resolve. `liquidationDiscount` is
`liquidationPremium + feeLiquidation` with the suite's expiration resolved, the
figure a position screen labels "Liquidation Discount", *not* the credit
manager's `liquidationDiscount` (which is `100% − liquidationPremium`).

`netValue` is `totalValue − totalDebt`, the position's own funds. The read model
leaves a strategy caller to do that subtraction; a projection reports it, so an
"own funds" row reads the same wherever it appears rather than being derived on
some screens and read on others.

Beyond the projection, `OperationState` and `OpenStrategyState` carry the two
prices only a planned walk can quote, as one interface — **`SimulationPrices`**:
`priceImpact`, what the routed legs lost to market depth, and **`currentPrice`**,
what the position's collateral costs in the underlying right now. The latter is
in the same 8-decimal fixed point and about the same pair as `liquidationPrice`,
so a screen reads the two as one pair (`null` unless the account holds exactly
one non-underlying asset the oracle can price). A preview is asked for neither —
it reports what a transaction does, not what the market costs while a form is
open — so these are what the cross-check between the halves has nothing to
compare.

**`checkSimulation` lost its `creditManager` input.** It takes the market off
the state now, which is what makes it the same call shape as `checkOperation`:

```diff
- checkSimulation({ sdk, state, creditManager }, { minHealthFactor })
+ checkSimulation({ sdk, state }, { minHealthFactor })
```

Nothing else changed for a caller that only reads a projection: these are added
fields. Code that *builds* one — a test fixture, a stub — has to fill them.
