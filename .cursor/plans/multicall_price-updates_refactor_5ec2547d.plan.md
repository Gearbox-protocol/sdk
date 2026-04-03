---
name: Multicall price-updates refactor
overview: Move prependPriceUpdates inside multicall, openCreditAccountTx, and closeCreditAccountTx. Delete multicallTx. Introduce MulticallOptions to control price feed behavior.
todos:
  - id: types
    content: Add MulticallOptions to types.ts, update ICreditAccountsService.multicall and botMulticall signatures
    status: in_progress
  - id: multicall
    content: "Rewrite multicall: merge multicallTx logic, add price-update gating from MulticallOptions, drop KYC factory logic, return CreditAccountOperationResult"
    status: pending
  - id: bot-multicall
    content: Update botMulticall to accept MulticallOptions
    status: pending
  - id: open-tx
    content: "Update openCreditAccountTx: move prependPriceUpdates inside, drop KYC factory logic, return CreditAccountOperationResult"
    status: pending
  - id: close-tx
    content: "Update closeCreditAccountTx: remove suite arg, accept RouterCASlice, move prependPriceUpdates inside (skip for close), drop KYC factory logic, return CreditAccountOperationResult"
    status: pending
  - id: delete-multicallTx
    content: Delete multicallTx method
    status: pending
  - id: simplify-abstract
    content: Simplify callers in AbstractCreditAccountsService (updateQuotas, addCollateral, changeDebt, executeSwap, startDelayedWithdrawal, claimDelayed, closeCreditAccount, openCA)
    status: pending
  - id: simplify-v310
    content: Simplify callers in CreditAccountsServiceV310 (setBot, withdrawCollateral, repayCreditAccount, claimFarmRewards)
    status: pending
  - id: docs
    content: Add typedoc-style comments to all affected methods
    status: pending
  - id: lint-check
    content: Run linter and fix any introduced errors
    status: pending
isProject: false
---

# Multicall Price-Updates Refactor

## Rationale

Almost every credit account operation follows the same pattern: call `prependPriceUpdates` to generate on-demand price feed updates, then call one of the internal tx-building wrappers (`multicallTx`, `openCreditAccountTx`, `closeCreditAccountTx`). This is repetitive and error-prone -- callers must remember to prepend prices and correctly pass `ignoreReservePrices`. A few operations intentionally skip price updates (account close, zero-debt claim), adding conditional logic at every call site.

This refactoring:
- Moves `prependPriceUpdates` inside the tx-building methods so callers never need to call it themselves
- Replaces the boolean `ignoreReservePrices` flag with a structured `MulticallOptions` type using `PriceFeedsForTokensOptions` (`{ main?: boolean, reserve?: boolean }`)
- Deletes the internal `multicallTx` wrapper and merges its logic into the public `multicall`
- Drops the KYC factory code path from the tx-building wrappers (no longer needed)
- Adds typedoc-style comments to all affected methods

## New type: `MulticallOptions`

In [src/sdk/accounts/types.ts](src/sdk/accounts/types.ts), add:

```typescript
import type { PriceFeedsForTokensOptions } from "../market/index.js";

export interface MulticallOptions {
  priceUpdates?: PriceFeedsForTokensOptions;
}
```

Default value of `priceUpdates` when omitted: `{ main: true, reserve: true }`.

Update `ICreditAccountsService.multicall` and `botMulticall` signatures to use `MulticallOptions` instead of `{ ignoreReservePrices?: boolean }`.

## Merge `multicallTx` into `multicall`

In [AbstractCreditAccountsService.ts](src/sdk/accounts/AbstractCreditAccountsService.ts):

**Change `multicall` return type** from `Promise<RawTx>` to `Promise<CreditAccountOperationResult>`, so callers get `{ tx, calls, creditFacade }` and no longer need to build this themselves.

**New `multicall` logic:**
1. Resolve `priceUpdates` from options (default `{ main: true, reserve: true }`)
2. If `main || reserve`: call `prependPriceUpdates` with `ignoreReservePrices: !reserve`
3. Otherwise: skip `prependPriceUpdates` (pass raw calls through)
4. Build tx via `suite.creditFacade.multicall(...)` directly (no KYC factory logic)
5. Return `{ tx, calls: finalCalls, creditFacade }`

**Delete `multicallTx`** (lines 1445-1462).

## Update `openCreditAccountTx`

Change signature -- no `RouterCASlice` needed (there is no existing account when opening). Move `prependPriceUpdates` inside:

```typescript
protected async openCreditAccountTx(
  suite: CreditSuite,
  to: Address,
  calls: MultiCall[],
  options?: { referralCode?: bigint; priceUpdates?: PriceFeedsForTokensOptions },
): Promise<CreditAccountOperationResult>
```

Internally calls `prependPriceUpdates(suite.creditManager.address, calls)` with no `ca` arg (same as current `openCA` behavior). Builds tx via `suite.creditFacade.openCreditAccount(...)` directly (no KYC factory logic). Returns `CreditAccountOperationResult`.

## Update `closeCreditAccountTx`

Remove `suite` from args -- it is redundant since `RouterCASlice` contains `creditManager` from which the suite can be looked up:

```typescript
protected async closeCreditAccountTx(
  ca: RouterCASlice,
  calls: MultiCall[],
  operation: CloseOptions,
): Promise<CreditAccountOperationResult>
```

Internally looks up suite via `this.sdk.marketRegister.findCreditManager(ca.creditManager)`.

Move `prependPriceUpdates` inside:
- `operation === "close"` -> skip price updates, call `suite.creditFacade.closeCreditAccount(...)`
- `operation === "zeroDebt"` -> prepend price updates, call `suite.creditFacade.multicall(...)`

No KYC factory logic. Returns `CreditAccountOperationResult`.

## Update `botMulticall`

Same changes as `multicall`: accept `MulticallOptions`, apply same price-update logic. No KYC factory logic. Return type stays `Promise<RawTx>` (it has no internal callers that need calls back, only the public API).

## Simplify callers in `AbstractCreditAccountsService.ts`

Each method that previously did `prependPriceUpdates` + `multicallTx` now just calls `this.multicall(...)`:

- **updateQuotas**: `this.multicall(ca, operationCalls)` (default options)
- **addCollateral**: `this.multicall(ca, operationCalls)`, then set `result.tx.value`
- **changeDebt**: `this.multicall(ca, operationCalls)`
- **executeSwap**: `this.multicall(ca, operationCalls)`
- **startDelayedWithdrawal**: `this.multicall(ca, operationCalls)`
- **claimDelayed**: `this.multicall(ca, operationCalls, { priceUpdates: zeroDebt ? { main: false, reserve: false } : undefined })`
- **closeCreditAccount**: `this.closeCreditAccountTx(ca, operationCalls, operation)` (no external prependPriceUpdates)
- **openCA**: reopen branch uses `this.multicall(...)`, new branch uses `this.openCreditAccountTx(...)`

**Note:** `fullyLiquidate` still calls `prependPriceUpdates` then `liquidateCreditAccount` directly. `prependPriceUpdates` remains as a protected method.

## Simplify callers in `CreditAccountsServiceV310.ts`

- **setBot**: when `type === "creditAccount"`, replace `prependPriceUpdates` + `multicallTx` with `this.multicall(targetContract, [addBotCall])`
- **withdrawCollateral**: replace `prependPriceUpdates` + `multicallTx` with `this.multicall(ca, operationCalls)`
- **repayCreditAccount**: remove conditional `prependPriceUpdates`, call `this.closeCreditAccountTx(ca, operationCalls, operation)` (price-update skip for `"close"` is now handled inside)
- **repayAndLiquidateCreditAccount**: keeps `prependPriceUpdates` + `liquidateCreditAccount` directly (unchanged)
- **claimFarmRewards**: replace `prependPriceUpdates` + `multicallTx` with `this.multicall(ca, operationCalls)`

## `ignoreReservePrices` mapping

Where old code passes `{ ignoreReservePrices: true }`, convert to `{ priceUpdates: { main: true, reserve: false } }`. This affects:
- `fullyLiquidate` (still calls `prependPriceUpdates` directly, so adapt the option translation there)
- `prependPriceUpdates` itself: derive `ignoreReservePrices` from `reserve === false`

## Documentation

Add typedoc-style (`/** ... **/`) comments to all affected methods:
- `multicall`, `botMulticall`, `openCreditAccountTx`, `closeCreditAccountTx`, `prependPriceUpdates`
- All simplified caller methods that had their logic changed
