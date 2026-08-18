import type { Address } from "viem";
import type { Leverage } from "../../../model/index.js";
import type {
  Asset,
  MultiCall,
  OnchainSDK,
  RouterCASlice,
} from "../../index.js";
import type {
  ClaimableWithdrawal,
  DelayedIntent,
} from "../withdrawal-compressor/types.js";
import type { AccountCalculatorOperation } from "./operations.js";

/**
 * Minimal credit-account data an intent is previewed against:
 * account address, CM lookup, underlying for conversion, debt, token balances
 * and initial quotas.
 */
export type CreditAccountSlice = Omit<RouterCASlice, "debt"> & {
  /** either base debt or debt plus interest and fees */
  accountDebt: bigint;
};

/** Projected account metrics once the operations execute. */
export interface OperationState {
  /** Account TVL after operation */
  totalValue: bigint;
  /** Account debt after operation */
  accountDebt: bigint;
  /**
   * Leverage after operation in the read model's convention — `debt / equity`,
   * as `Position.leverage` reports it — not the calculator's `TVL / collateral`.
   */
  leverage: Leverage;
  /** Account assets after operation */
  assets: Asset[];
  /** Account quotas after operation */
  quotas: Record<Address, Asset>;
}

/**
 * Why a preview could not be produced.
 *
 * Every member is thrown by the engine as an {@link IntentPreviewError}, with
 * the exception of `unsupportedTokenPair` and `noRecordedIntent`, which the
 * simulate namespace reports for a request it can refuse before planning: a
 * route the market does not offer, a claim naming no operation.
 */
export type PreviewErrorReason =
  | "debtOutOfRange"
  | "leverageOutOfRange"
  | "insufficientSourceBalance"
  /** Input token is not accepted by the flow (e.g. deposit of a non-underlying). */
  | "unsupportedCollateralToken"
  /** No pool route between the requested pair, or several and none was picked. */
  | "unsupportedTokenPair"
  /**
   * The intent cannot settle with a delay: the source has no redemption config,
   * the chain has no compressor, or the payout is one the tail cannot serve.
   */
  | "noDelayedRoute"
  /** Several redemption venues for the source, and nothing says which. */
  | "multipleDelayedWithdrawals"
  /** A redemption of the same asset is already in flight. */
  | "withdrawalInProgress"
  /**
   * The claim names no operation to resume: requested without an intent, read
   * through a compressor too old to report one, or a full close, which the
   * engine no longer previews.
   */
  | "noRecordedIntent";

/**
 * What a preview yields: the operation chain, the state it projects, and the
 * calldata that realises it — or the reason the request is not viable.
 */
export type IntentPreviewResult =
  | {
      ok: true;
      operations: AccountCalculatorOperation[];
      preview: OperationState;
      calls: MultiCall[];
    }
  | { ok: false; reason: PreviewErrorReason };

/** What the request recorded, and when the tail can be run. */
export interface DelayedStart {
  /**
   * The intent written into the request, and decoded back from the claimable
   * withdrawal at claim time. Feed it to
   * `CreditAccountOperationsService.finishIntent`.
   */
  record: DelayedIntent;
  /** Unix seconds after which the delayed outputs can be claimed. */
  claimableAt: bigint;
  /**
   * `instant` when the venue served the whole request on the spot, so no claim
   * will ever arrive to carry the tail. The intent is then left half-done —
   * nothing repaid, nothing paid out — and the caller wants `startIntent`
   * instead, which settles all of it in one transaction.
   */
  settlement: "instant" | "delayed";
}

/**
 * What the leading half of a delayed intent yields: the request transaction,
 * plus what it recorded for the tail.
 */
export type DelayedStartResult =
  | {
      ok: true;
      operations: AccountCalculatorOperation[];
      preview: OperationState;
      calls: MultiCall[];
      delayed: DelayedStart;
    }
  | { ok: false; reason: PreviewErrorReason };

/**
 * The intents the engine previews.
 *
 * Naming avoids the `withdrawCollateral` collision that exists elsewhere in the
 * repo. Mapping to the public simulate API:
 *
 * | Intent type        | Public name                | Debt    |
 * | ------------------ | -------------------------- | ------- |
 * | `ADD_COLLATERAL`   | `simulate.addCollateral`    | fixed   |
 * | `WITHDRAW_ASSET`   | `simulate.withdrawCollateral` | fixed |
 * | `ADJUST_LEVERAGE`  | `simulate.adjustLeverage`   | changes |
 * | `DEPOSIT`          | `simulate.depositStrategy`  | grows   |
 * | `WITHDRAW`         | `simulate.withdrawStrategy` | shrinks |
 */

/** Shared inputs for every start intent. */
export type StartIntentProps = {
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  /**
   * Extra quota headroom in PERCENTAGE_FORMAT, to survive price drift between
   * preview and execution.
   */
  quotaReserve: number | undefined;
  /** Router slippage in PERCENTAGE_FORMAT (100% = 10_000). */
  slippage: number | undefined;
};

/**
 * Intent 5 — put the position token straight onto the account.
 *
 * Only the position token is accepted (e.g. ACRED): there is no swap and no
 * RWA wrap leg, so whatever is sent lands as-is. Debt is untouched, therefore
 * leverage drops and the health factor improves.
 */
export interface AddCollateralIntent {
  type: "ADD_COLLATERAL";
  /** Position token to deposit. */
  token: Address;
  amount: bigint;
  /**
   * Native value to attach when the deposited token is the market's wrapped
   * native token and the caller is paying in the native coin.
   */
  value?: bigint;
}

/**
 * Intent 4 — move one asset that already sits on the account to the wallet.
 *
 * Atomic: no swaps, no debt change, so leverage rises. The only special case is
 * withdrawing the wrapped underlying of an RWA market, which is force-unwrapped
 * to `rwa.asset` first because the wrapper itself cannot leave the account.
 *
 * @see AdjustLeverageIntent and the `WITHDRAW` intent for the deleveraging
 * withdrawals, which do change debt.
 */
export interface WithdrawAssetIntent {
  type: "WITHDRAW_ASSET";
  /** Token to withdraw; must already be on the account. */
  token: Address;
  amount: bigint;
  /** Wallet receiving the tokens. */
  to: Address;
}

/**
 * Intent 6 — retarget leverage while collateral (own funds) stays fixed.
 *
 * Because collateral is the invariant, the target leverage pins the new debt:
 * raising it borrows more and buys the position token, lowering it sells the
 * position token and repays. TVL moves with the debt; net value does not.
 */
export interface AdjustLeverageIntent {
  type: "ADJUST_LEVERAGE";
  /**
   * Target total leverage scaled by `LEVERAGE_DECIMALS` (300n = 3x). 100n (1x)
   * means "no debt".
   */
  targetLeverage: bigint;
  /**
   * Position token to buy into or sell out of. Defaults to the most valuable
   * non-phantom, non-underlying balance on the account.
   */
  token?: Address;
}

/**
 * Intents 1.1 / 1.2 — deposit into a strategy, growing the position.
 *
 * Fresh collateral arrives, debt is drawn on top of it, and the combined
 * underlying is converted into the position token. The two spec variants differ
 * only in how much debt is drawn:
 *
 * - 1.1, `targetLeverage` omitted: debt grows in proportion, leverage unchanged
 * - 1.2, `targetLeverage` set: debt grows to hit the new, higher leverage
 *
 * Only the market underlying may be deposited. Two exceptions: a wrapped-native
 * market also accepts the native coin (pass the wrapped token plus `value`), and
 * an RWA market takes the unwrapped asset (USDC rather than dcUSDC), which this
 * flow wraps for you.
 */
export interface DepositStrategyIntent {
  type: "DEPOSIT";
  /** Collateral token: the market underlying, or `rwa.asset` on an RWA market. */
  token: Address;
  amount: bigint;
  /** Native value to attach when paying with the native coin. */
  value?: bigint;
  /**
   * Token the position ends up in. Defaults to the most valuable non-phantom,
   * non-underlying balance already on the account.
   */
  positionToken?: Address;
  /**
   * Target total leverage scaled by `LEVERAGE_DECIMALS`. Omit to preserve the
   * account's current leverage.
   */
  targetLeverage?: bigint;
}

/**
 * Intent 2.1 — withdraw part of the position's net value at fixed leverage.
 *
 * The requested amount leaves the account, and debt is repaid in the same
 * proportion so leverage is unchanged: `dD = D0 * W / C0`. Both the payout and
 * the repayment are funded by liquidating the source token, which means the
 * account must give up `W + dD` of value in total.
 *
 * The payout leg and the repayment leg are quoted separately and do not share a
 * pool, so a shortfall on the payout leg does not eat into the repayment.
 *
 * @see WithdrawAssetIntent for moving a single asset out at fixed debt, and
 * AdjustLeverageIntent for changing leverage without withdrawing.
 */
export interface WithdrawStrategyIntent {
  type: "WITHDRAW";
  /** Amount the wallet receives, denominated in `tokenOut`. */
  amount: bigint;
  /** Wallet receiving the payout. */
  to: Address;
  /**
   * Token the wallet receives. Defaults to the market underlying — which, on an
   * RWA market, is force-unwrapped to `rwa.asset` on the way out.
   */
  tokenOut?: Address;
  /**
   * Token liquidated to fund the withdrawal. Defaults to the most valuable
   * non-phantom balance on the account.
   */
  sourceToken?: Address;
}

export type StartIntent =
  | AddCollateralIntent
  | WithdrawAssetIntent
  | AdjustLeverageIntent
  | DepositStrategyIntent
  | WithdrawStrategyIntent;

/**
 * The intents that can be started as a redemption rather than a swap: the two
 * that sell a position asset. The others buy one, and buying settles at once.
 */
export type DelayableIntent = AdjustLeverageIntent | WithdrawStrategyIntent;

/**
 * A delayed intent this engine knows how to finish.
 *
 * `CLOSE_ACCOUNT` is absent on purpose: closing goes through the facade's own
 * entry point, which this engine no longer builds.
 */
export type ResumableIntent = Exclude<DelayedIntent, { type: "CLOSE_ACCOUNT" }>;

/** Shared inputs plus the matured withdrawal the tail is built around. */
export type FinishIntentProps = StartIntentProps & {
  intent: ResumableIntent;
  /**
   * The matured withdrawal, as reported by
   * `sdk.accounts.getPendingWithdrawals`.
   */
  claimable: ClaimableWithdrawal;
};

/**
 * Validation failure that maps onto {@link PreviewErrorReason} rather than
 * crashing the caller: thrown by builders, converted to `{ ok: false }` by
 * `CreditAccountOperationsService.startIntent`.
 */
export class IntentPreviewError extends Error {
  readonly reason: PreviewErrorReason;

  constructor(reason: PreviewErrorReason, message?: string) {
    super(message ?? reason);
    this.name = "IntentPreviewError";
    this.reason = reason;
  }
}
