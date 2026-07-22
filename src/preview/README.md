# Preview

Tools for **previewing a Gearbox operation before it is sent on-chain**: turn raw transaction calldata into an operation-specific, human-displayable preview, and check the conditions the sender must satisfy for it to succeed.

## Concepts

An **operation** is a transaction performed on behalf of a Gearbox protocol user:

- a **pool user** (liquidity provider) depositing into or redeeming from a pool, or
- a **credit account user** (borrower) opening or adjusting a credit account.

Given only `{ to, calldata, sender }`, this module answers two questions:

1. **What would this operation do?** (`previewOperation`)
2. **Can the sender execute it, and what must they fix first?** (`checkPrerequisites`)

All reads use the already-attached `OnchainSDK` (chain, RPC and block are baked in at attach time). The SDK must be created with the adapters plugin so that adapter contracts resolve during multicall classification.

## Public API

### `previewOperation`

[`previewOperation`](./preview/previewOperation.ts) is the async entry point. It decodes the raw calldata internally (see [`parse`](#internals)) and assembles an operation-specific preview:

- **Pool operations** (ERC4626 deposit/withdraw, direct or zapper-routed) produce a [`PoolOperationPreview`](./preview/types.ts): the tokens going in and out.
- **Credit account opening** (`OpenCreditAccount` and `RWAOpenCreditAccount`) produces an [`OpenCreditAccountPreview`](./preview/types.ts): collateral, debt, quotas, etc.
- **Credit account adjustment** (`multicall`/`botMulticall` on the facade/RWA factory) produces an [`AdjustCreditAccountPreview`](./preview/types.ts): collateral, debt, quota changes, etc.
- **Credit account closure/repayment** produces a [`CloseCreditAccountPreview`](./preview/types.ts) (collateral swapped into underlying, debt repaid, underlying withdrawn) or a [`RepayCreditAccountPreview`](./preview/types.ts) (debt covered from the wallet, collateral returned in-kind). The facade `closeCreditAccount` entry point closes the account permanently (`permanent: true`); a plain multicall that fully repays the debt returns `permanent: false`.
- **Any other operation** throws an [`UnsupportedOperationError`](./preview/errors.ts).

When the operation decodes but cannot be fully previewed, the preview is still returned with an [`error`](./preview/types.ts) field set. `error.code` is a numeric http-style code, see the `ERROR_*` constants in [types.ts](./preview/types.ts):

- **1xxx** — the transaction is malformed (broken `storeExpectedBalances`/`compareBalances` brackets, unexpected adapter calls, a `msg.value` that does not fit the declared WETH collateral) and would not execute correctly on-chain.
- **2xxx** — the transaction may be fine, but the SDK could not fully evaluate the preview (e.g. a token could not be priced by the oracle).

All fields are computed best-effort in either case: fields driven by explicit facade calls (collateral, debt, quotas) are exact, while fields derived from replayed balances (e.g. `assets`, `assetsChange`, `target` asset balance) or oracle prices (`collateralValue`, `totalValue`) may be unreliable. When both categories apply, the more severe 1xxx code is reported.

### `prerequisites`

The on-chain conditions the **sender can fix themselves** before retrying. The module is limited to **checking**: acting on an unsatisfied result (sending an approve transaction, signing messages, rebuilding calldata) is up to the consumer and out of the SDK's scope.

[`checkPrerequisites`](./prerequisites/checkPrerequisites.ts) takes the same raw-calldata input as `previewOperation`, derives the prerequisites (e.g. token allowances) and verifies them all.

Only **sender-actionable** conditions belong here (approve a token, top up a balance, register an RWA token, etc.). Non-actionable protocol/admin state (e.g. pool is paused) is not verified.

## Intended usage

```ts
import {
  previewOperation,
  checkPrerequisites,
} from "@gearbox-protocol/sdk/preview";

// 1. Preview the operation (pool operation or credit account opening).
const preview = await previewOperation({ sdk, to, calldata, sender });

// 2. When/if necessary, check sender-actionable prerequisites
//    (allowances, balances, RWA requirements). Takes the same input as
//    previewOperation.
const results = await checkPrerequisites({ sdk, to, calldata, sender });

// 3. For each unsatisfied result, the consumer inspects `kind` and `detail`
//    (e.g. `detail.missing` for rwaOpenRequirements) and resolves it outside
//    the SDK, then re-runs checkPrerequisites.
```
