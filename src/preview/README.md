# Preview

Tools for **previewing a Gearbox operation before it is sent on-chain**: turn raw transaction calldata into an operation-specific, human-displayable preview.

## Concepts

An **operation** is a transaction performed on behalf of a Gearbox protocol user:

- a **pool user** (liquidity provider) depositing into or redeeming from a pool, or
- a **credit account user** (borrower) opening or adjusting a credit account.

Given only `{ to, calldata, sender }`, this module answers **what would this operation do?** (`previewOperation`).

All reads use the already-attached `OnchainSDK` (chain, RPC and block are baked in at attach time). The SDK must be created with the adapters plugin so that adapter contracts resolve during multicall classification.

## Public API

### `previewOperation`

[`previewOperation`](./preview/previewOperation.ts) is the async entry point. It decodes the raw calldata internally (see [`parse`](#internals)) and assembles an operation-specific preview:

- **Pool operations** (ERC4626 deposit/withdraw, direct or zapper-routed) produce a [`PoolPositionOperationPreview`](../model/previews.ts): the tokens going in and out, plus `holder` (whose share balance `netValue` describes) and, when routed, `zapper` (the call target the wallet approves).
- **Credit account opening** (`OpenCreditAccount` and `RWAOpenCreditAccount`) produces a [`OpenStrategyPositionPreview`](../model/previews.ts): `collateralAdded`, `estNetValue`, `totalDebt`, `quotas`, etc. An RWA-factory opening is a [`OpenRWAStrategyPositionPreview`](../model/previews.ts) and carries `rwaArgs` (the registration args decoded from calldata); a facade opening is a [`OpenNonRWAStrategyPositionPreview`](../model/previews.ts).
- **Credit account adjustment** (`multicall`/`botMulticall` on the facade/RWA factory) produces a [`AdjustStrategyPositionPreview`](../model/previews.ts): `collateralAdded`, `totalDebtChange`, `quotasChange`, etc.
- **Credit account closure/repayment** produces a [`ExitStrategyPositionPreview`](../model/previews.ts) (collateral swapped into underlying, debt repaid, underlying withdrawn) or a [`RepayStrategyPositionPreview`](../model/previews.ts) (debt covered from the wallet, collateral returned in-kind). The facade `closeCreditAccount` entry point closes the account permanently (`permanent: true`); a plain multicall that fully repays the debt returns `permanent: false`.
- **Any other operation** throws an [`UnsupportedOperationError`](./preview/errors.ts).

Each result is named after the `prepare` flow it is the far side of — the same operation, read off calldata instead of planned into it. Every credit preview that describes an account afterwards (`OpenStrategyPositionPreview`, `AdjustStrategyPositionPreview`, `ExitStrategyPositionPreview`, `RepayStrategyPositionPreview`) carries a projection from the same builder the intents engine reports its own projections from (`sdk.positions.projection`). So the balances, the value, the health factors, the borrow rate, the time to liquidation, the liquidation price and the leverage are one implementation rather than two, and [`previewMatchesPrepare.test.ts`](./preview/previewMatchesPrepare.test.ts) runs a request through both halves to hold them to each other. An exit or a settling repayment still names what the wallet receives (`receivedAmount`) or what the wallet moved (`debtRepaid`, `collateralAdded`); the projection beside those is the emptied or leftover after-state — zero debt, dropped quotas, and the zero-debt sentinels when nothing remains. What a preview never carries is `prepare`'s `SimulationPrices` (`priceImpact` and `currentPrice`): a transaction's own words say what it does, not what a route cost or what the collateral trades at while a form is open.

The projection here is an [`EstimatedProjection`](../model/previews.ts) rather than an `AccountProjection`, and the difference is what the module can see. A routed swap is quoted twice — the amount the pathfinder expects to return, and the floor it guarantees after slippage — and calldata carries only the floor. So everything a route decides is a worst case and is named for it: `estTotalValue`, `estNetValue`, `estAssets`, `estHealthFactor`, `estSafeHealthFactor`, `estBorrowRate`, `estTimeToLiquidation`, `estLiquidationPrice`, `estLeverage`. `prepare` reports the expected branch under the plain names; prefixing here is what stops a screen from showing one as the other. `totalDebt` and `quotas` are the calls' own words, identical on either branch, so they keep their names — as do the market's own (`creditManager`, `name`, `underlyingToken`, `curator`, `liquidationDiscount`, the [`CreditOperationMarket`](../model/previews.ts) every result carries, projection or not) and the deltas, which `prepare` does not report at all. The borrow rate is prefixed for a subtler reason: its `base` and `totalOnDebt` are branch-independent, but `total` and the per-quota rates are normalized against `totalValue`, so on the floor the same cost is quoted against a smaller position and reads higher.

When the operation decodes but cannot be fully previewed, the preview is still returned with a [`warning`](../model/previews.ts) field set. `warning` is an [`OperationPreviewError`](../model/previews.ts) — a union of `IGearboxError` interfaces discriminated by `code`:

- **Malformed** (`malformedBracket`, `adapterCallOutsideBracket`, `nonAdapterCallInBracket`, `unpreviewableAdapterCall`, `unsupportedOutOfBracketCall`, `invalidTransactionValue`) — the transaction would not execute correctly on-chain (broken `storeExpectedBalances`/`compareBalances` brackets, unexpected adapter calls, a `msg.value` that does not fit the declared WETH collateral).
- **`unpriceableToken`** — the transaction may be fine, but the SDK could not fully evaluate the preview because the oracle could not price a token.

All fields are computed best-effort in either case: fields driven by explicit facade calls (`collateralAdded`, `totalDebt`, `quotas`) are exact, while fields derived from replayed balances (e.g. `estAssets`, `assetsChange`, `targetCollateral` balance) or oracle prices (`estNetValue`, `estTotalValue`) may be unreliable. When both categories apply, the malformed warning is reported (it takes precedence).

## Intended usage

```ts
import { previewOperation } from "@gearbox-protocol/sdk/preview";

const preview = await previewOperation({ sdk, to, calldata, sender });
```
