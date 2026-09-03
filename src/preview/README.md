# Preview

Tools for **previewing a Gearbox operation before it is sent on-chain**: turn raw transaction calldata into an operation-specific, human-displayable preview, and check the conditions the sender must satisfy for it to succeed.

## Concepts

An **operation** is a transaction performed on behalf of a Gearbox protocol user:

- a **pool user** (liquidity provider) depositing into or redeeming from a pool, or
- a **credit account user** (borrower) opening or adjusting a credit account.

Given only `{ to, calldata, sender }`, this module answers three questions:

1. **What would this operation do?** (`previewOperation`)
2. **Can the sender execute it, and what must they fix first?** (`checkPrerequisites`)
3. **May it be signed at all?** (`checkOperation`)

All reads use the already-attached `OnchainSDK` (chain, RPC and block are baked in at attach time). The SDK must be created with the adapters plugin so that adapter contracts resolve during multicall classification.

## Public API

### `previewOperation`

[`previewOperation`](./preview/previewOperation.ts) is the async entry point. It decodes the raw calldata internally (see [`parse`](#internals)) and assembles an operation-specific preview:

- **Pool operations** (ERC4626 deposit/withdraw, direct or zapper-routed) produce a [`PoolPositionOperationPreview`](../model/previews.ts): the tokens going in and out.
- **Credit account opening** (`OpenCreditAccount` and `RWAOpenCreditAccount`) produces a [`OpenStrategyPositionPreview`](../model/previews.ts): `collateralAdded`, `estNetValue`, `totalDebt`, `quotas`, etc.
- **Credit account adjustment** (`multicall`/`botMulticall` on the facade/RWA factory) produces a [`AdjustStrategyPositionPreview`](../model/previews.ts): `collateralAdded`, `totalDebtChange`, `quotasChange`, etc.
- **Credit account closure/repayment** produces a [`ExitStrategyPositionPreview`](../model/previews.ts) (collateral swapped into underlying, debt repaid, underlying withdrawn) or a [`RepayStrategyPositionPreview`](../model/previews.ts) (debt covered from the wallet, collateral returned in-kind). The facade `closeCreditAccount` entry point closes the account permanently (`permanent: true`); a plain multicall that fully repays the debt returns `permanent: false`.
- **Any other operation** throws an [`UnsupportedOperationError`](./preview/errors.ts).

Each result is named after the `prepare` flow it is the far side of — the same operation, read off calldata instead of planned into it. Every credit preview that describes an account afterwards (`OpenStrategyPositionPreview`, `AdjustStrategyPositionPreview`, `ExitStrategyPositionPreview`, `RepayStrategyPositionPreview`) carries a projection from the same builder the intents engine reports its own projections from (`sdk.positions.projection`). So the balances, the value, the health factors, the borrow rate, the time to liquidation, the liquidation price and the leverage are one implementation rather than two, and [`previewMatchesPrepare.test.ts`](./preview/previewMatchesPrepare.test.ts) runs a request through both halves to hold them to each other. An exit or a settling repayment still names the payout (`receivedAmount`) or what the wallet moved (`debtRepaid`, `collateralAdded`); the projection beside those is the emptied or leftover after-state — zero debt, dropped quotas, and the zero-debt sentinels when nothing remains. What a preview never carries is `prepare`'s `SimulationPrices` (`priceImpact` and `currentPrice`): a transaction's own words say what it does, not what a route cost or what the collateral trades at while a form is open.

The projection here is an [`EstimatedProjection`](../model/previews.ts) rather than an `AccountProjection`, and the difference is what the module can see. A routed swap is quoted twice — the amount the pathfinder expects to return, and the floor it guarantees after slippage — and calldata carries only the floor. So everything a route decides is a worst case and is named for it: `estTotalValue`, `estNetValue`, `estAssets`, `estHealthFactor`, `estSafeHealthFactor`, `estBorrowRate`, `estTimeToLiquidation`, `estLiquidationPrice`, `estLeverage`. `prepare` reports the expected branch under the plain names; prefixing here is what stops a screen from showing one as the other. `totalDebt` and `quotas` are the calls' own words, identical on either branch, so they keep their names — as do the market's own (`creditManager`, `name`, `underlyingToken`, `curator`, `liquidationDiscount`, the [`CreditOperationMarket`](../model/previews.ts) every result carries, projection or not) and the deltas, which `prepare` does not report at all. The borrow rate is prefixed for a subtler reason: its `base` and `totalOnDebt` are branch-independent, but `total` and the per-quota rates are normalized against `totalValue`, so on the floor the same cost is quoted against a smaller position and reads higher.

When the operation decodes but cannot be fully previewed, the preview is still returned with a [`warning`](../model/previews.ts) field set. `warning` is an [`OperationPreviewError`](../model/previews.ts) — a union of `IGearboxError` interfaces discriminated by `code`:

- **Malformed** (`malformedBracket`, `adapterCallOutsideBracket`, `nonAdapterCallInBracket`, `unpreviewableAdapterCall`, `unsupportedOutOfBracketCall`, `invalidTransactionValue`) — the transaction would not execute correctly on-chain (broken `storeExpectedBalances`/`compareBalances` brackets, unexpected adapter calls, a `msg.value` that does not fit the declared WETH collateral).
- **`unpriceableToken`** — the transaction may be fine, but the SDK could not fully evaluate the preview because the oracle could not price a token.

All fields are computed best-effort in either case: fields driven by explicit facade calls (`collateralAdded`, `totalDebt`, `quotas`) are exact, while fields derived from replayed balances (e.g. `estAssets`, `assetsChange`, `targetCollateral` balance) or oracle prices (`estNetValue`, `estTotalValue`) may be unreliable. When both categories apply, the malformed warning is reported (it takes precedence).

### `prerequisites`

The on-chain conditions the **sender can fix themselves** before retrying. The module is limited to **checking**: acting on an unsatisfied result (sending an approve transaction, signing messages, rebuilding calldata) is up to the consumer and out of the SDK's scope.

[`checkPrerequisites`](./prerequisites/checkPrerequisites.ts) takes the same raw-calldata input as `previewOperation`, derives the prerequisites (e.g. token allowances) and verifies them all.

Only **sender-actionable** conditions belong here (approve a token, top up a balance, register an RWA token, etc.). Non-actionable protocol/admin state (e.g. pool is paused) is not verified — that is [`checkOperation`](#checkoperation)'s job.

### `checkOperation`

Whether the operation may be signed at all: the protocol state that refuses it outright rather than something the sender can fix. A paused market, a debt outside the facade's `debtLimits`, a quota with no room left, an account that would end under water.

[`checkOperation`](./validate/checkOperation.ts) takes a preview rather than calldata — it needs the numbers, not the transaction — and is **synchronous**: the market is already attached, so no chain reads are involved. It reports the most fundamental issue it found, or `null`, in the same `reason` + `detail` shape the intents engine refuses a `prepare` call with (`PreviewIssue`; a refused preparation's `PreviewRefusal` is that plus `ok: false`), so one error model covers both.

What it reports: `marketPaused`, `marketExpired`, `debtOutOfRange`, `forbiddenToken`, `quotaLimitReached`, `insufficientCollateral`, `poolSunset`, `insufficientSourceBalance` and `malformedTransaction`. It does not weigh borrow ceilings or leverage — those belong to building an operation, not to judging one that is already built.

`checkSimulation` is its sibling for the other direction: the engine holds an account to the facade's `1.0` because its guards answer "would this revert", so a caller wanting a stricter bar applies it over the numbers the engine already reported. It runs both health-factor bars and the quota count — the three things the engine does not weigh — plus the market's own state and the facade's `debtLimits`, so a change in the engine cannot pass silently. The forbidden-token, quota-limit and funding checks are deliberately absent: each needs the *delta* an operation applies, and `OperationState` reports only the state after it.

Its options are `minHealthFactor`, `minSafeHealthFactor`, `currentHealthFactor` and `balances` (an `AddressMap`, given which the wallet's side is checked offline). The bars are options because there is no single right one: the facade enforces `1.0`, a form is wiser to ask for more, and whether to weigh the safe-price health factor at all is the caller's decision. An omitted bar switches its check off. `currentHealthFactor` is the escape hatch that keeps a rescue possible: an operation that raises the factor passes even from under the bar, because the top-ups that save a position are exactly the ones a flat bar refuses.

A malformed preview warning is reported as `malformedTransaction` and nothing else is: the remaining checks read fields it just declared guesswork. An `unpriceableToken` warning is not reported at all — the transaction is fine and only the evaluation was incomplete.

## Intended usage

```ts
import {
  checkOperation,
  checkPrerequisites,
  previewOperation,
} from "@gearbox-protocol/sdk/preview";

// 1. Preview the operation (pool operation or credit account opening).
const preview = await previewOperation({ sdk, to, calldata, sender });

// 2. When/if necessary, check sender-actionable prerequisites
//    (allowances, balances, RWA requirements). Takes the same input as
//    previewOperation.
const results = await checkPrerequisites({ sdk, to, calldata, sender });

// 3. Check whether the protocol refuses the operation outright.
const issues = checkOperation({ sdk, preview }, { minHealthFactor: 10_101 });

// 4. For each unsatisfied result, the consumer inspects `kind` and `detail`
//    (e.g. `detail.missing` for rwaOpenRequirements) and resolves it outside
//    the SDK, then re-runs checkPrerequisites.
```
