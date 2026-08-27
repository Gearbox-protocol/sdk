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

Only **sender-actionable** conditions belong here (approve a token, top up a balance, register an RWA token, etc.). Non-actionable protocol/admin state (e.g. pool is paused) is not verified — that is [`checkOperation`](#checkoperation)'s job.

### `checkOperation`

Whether the operation may be signed at all: the protocol state that refuses it outright rather than something the sender can fix. A paused market, a debt outside the facade's band, a quota with no room left, an account that would end under water.

[`checkOperation`](./validate/checkOperation.ts) takes a preview rather than calldata — it needs the numbers, not the transaction — and is **synchronous**: the market is already attached, so no chain reads are involved. It reports the most fundamental issue it found, or `null`, in the same `reason` + `detail` shape the intents engine refuses a simulation with (`PreviewIssue`; a simulation's `PreviewRefusal` is that plus `ok: false`), so one error model covers both.

What it reports: `marketPaused`, `marketExpired`, `debtOutOfRange`, `forbiddenToken`, `quotaLimitReached`, `insufficientCollateral`, `poolSunset`, `insufficientSourceBalance` and `malformedTransaction`. It does not weigh borrow ceilings or leverage — those belong to building an operation, not to judging one that is already built.

`checkSimulation` is its sibling for the other direction: the engine holds an account to the facade's `1.0` because its guards answer "would this revert", so a caller wanting a stricter bar applies it over the numbers the engine already reported. It runs both health-factor bars and the quota count — the three things the engine does not weigh — plus the market's own state and the debt band, so a change in the engine cannot pass silently. The forbidden-token, quota-limit and funding checks are deliberately absent: each needs the *delta* an operation applies, and `OperationState` reports only the state after it.

Its options are `minHealthFactor`, `minSafeHealthFactor`, `currentHealthFactor` and `balances` (an `AddressMap`, given which the wallet's side is checked offline). The bars are options because there is no single right one: the facade enforces `1.0`, a form is wiser to ask for more, and whether to weigh the safe-price health factor at all is the caller's decision. An omitted bar switches its check off. `currentHealthFactor` is the escape hatch that keeps a rescue possible: an operation that raises the factor passes even from under the bar, because the top-ups that save a position are exactly the ones a flat bar refuses.

A 1xxx preview error is reported as `malformedTransaction` and nothing else is: the remaining checks read fields it just declared guesswork. A 2xxx error is not reported at all — the transaction is fine and only the evaluation was incomplete.

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
