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
| `validateOpenAccount` (`loading`) | — dropped: a caller's own state, not a verdict | — |
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
- **Previews report `safeHealthFactor`** beside `healthFactor`; a simulation reports it too (`OperationState.safeHealthFactor`), but only where the walk had reason to compute it — an operation that hands funds over.
- **`checkSimulation`** applies a caller's stricter bars to a simulation the engine already accepted, and `checkOperation`/`checkCollateralised` take `currentHealthFactor`/`improvesFrom`, so an operation that raises the factor is not refused from under the bar.

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
`@gearbox-protocol/sdk/model`). `OperationState`, `OpenCreditAccountPreview` and
`AdjustCreditAccountPreview` all extend it, so a caller that renders one renders
all three, and a name drifting apart on one side is now a compile error.

**Renamed fields**

| Type | Was | Now |
| --- | --- | --- |
| `OperationState` | `accountDebt` | `totalDebt` |
| `CreditAccountSlice` | `accountDebt` | `totalDebt` |
| `OpenStrategyPreview` | `debt` | `totalDebt` |
| `OpenStrategyPreview` | `collateral` | `netValue` |
| `OpenCreditAccountPreview` | `debt` | `totalDebt` |
| `OpenCreditAccountPreview` | `collateralValue` | `netValue` |
| `OpenCreditAccountPreview` | `collateral` | `collateralAdded` |
| `OpenCreditAccountPreview` | `target` | `targetCollateral` |
| `AdjustCreditAccountPreview` | `debt` | `totalDebt` |
| `AdjustCreditAccountPreview` | `debtChange` | `totalDebtChange` |

`OpenCreditAccountPreview.debt` also read the debt *principal* where every
metric beside it read the total. The two are equal at opening, so the value is
unchanged; only the field's meaning is now what its name says.

`RepayCreditAccountPreview.debtRepaid` keeps its name: it is
`−totalDebtChange`, and a repayment screen reads it with the sign it has.

**Retyped fields**

| Type | Field | Was | Now |
| --- | --- | --- | --- |
| `AccountProjection` (both sides) | `totalValue`, `totalDebt` | `bigint` | `TokenAmount` |
| `OpenCreditAccountPreview` | `netValue` | `bigint` | `TokenAmount` |
| `AdjustCreditAccountPreview` | `totalDebtChange` | `bigint` | `TokenAmount` |
| `RepayCreditAccountPreview` | `debtRepaid` | `bigint` | `TokenAmount` |
| `OpenStrategyPreview` | `totalDebt`, `netValue`, `totalValue` | `bigint` | `TokenAmount` |
| `OperationState` | `quotas` | `Record<Address, Asset>` | `TokenAmount[]` |
| `PoolSimulation` | `tokenIn`, `tokenOut` | `Asset` | `TokenAmount` |
| `PoolSimulation` | `availableLiquidity` | `bigint` | `Amount` |
| `Open`/`AdjustCreditAccountPreview` | `safeHealthFactor` | `Bps` | `Bps \| undefined` |

The underlying-denominated scalars are now priced, so a caller no longer
converts them itself: `preview.totalDebt.valueUsd` is filled in where the oracle
can price the market underlying. A caller that wants the raw figure reads
`.value`.

`OperationState.quotas` becomes a list in the shape the previews already used —
`token` names the collateral, `value` is the quota bought for it, denominated in
the market's underlying (the same convention as `PositionCollateral.quota`).
A token the account leaves unquoted is absent, as before.

`safeHealthFactor` is optional on the previews because it is optional on
`OperationState`, where the engine reports it only for an operation that hands
funds over. `previewOperation` still fills it in every time.

**New fields**

`OpenStrategyPreview` gains `leverage` (the read model's plain multiplier, not
the `LEVERAGE_DECIMALS`-scaled figure the request asks for) and
`safeHealthFactor`, so it carries the same metrics as every other credit
surface.

```diff
- const debt = preview.debt;
- const equity = preview.totalValue - preview.debt;
+ const debt = preview.totalDebt.value;
+ const equity = preview.totalValue.value - preview.totalDebt.value;
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


### The projection names its own market

`AccountProjection` gained three fields, so every producer of one — the two
credit previews, `OperationState` and `OpenStrategyPreview` — now carries them:

| Field | Type | Was |
| --- | --- | --- |
| `creditManager` | `Address` | on the previews only; a simulation made the caller carry it |
| `name` | `string` | on the previews only |
| `netValue` | `TokenAmount` | on `OpenCreditAccountPreview` and `OpenStrategyPreview` only; elsewhere the caller subtracted |

`netValue` is `totalValue − totalDebt`, the position's own funds. The read model
leaves a strategy caller to do that subtraction; a projection reports it, so an
"own funds" row reads the same wherever it appears rather than being derived on
some screens and read on others.

**`checkSimulation` lost its `creditManager` input.** It takes the market off
the state now, which is what makes it the same call shape as `checkOperation`:

```diff
- checkSimulation({ sdk, state, creditManager }, { minHealthFactor })
+ checkSimulation({ sdk, state }, { minHealthFactor })
```

Nothing else changed for a caller that only reads a projection: these are added
fields. Code that *builds* one — a test fixture, a stub — has to fill them.
