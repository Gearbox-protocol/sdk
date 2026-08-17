import type { Address } from "viem";
import type {
  Asset,
  DelayedIntent,
  MultiCall,
  OnchainSDK,
  RequestableWithdrawal,
  RouterCASlice,
} from "../../index.js";
import type { AccountCalculatorOperation } from "./operations.js";

/**
 * Minimal credit-account data needed by resume previews:
 * account address, CM lookup, underlying for conversion, debt, token balances
 * and initial quotas.
 */
export type CreditAccountSlice = Omit<RouterCASlice, "debt"> & {
  /** either base debt or debt plus interest and fees */
  accountDebt: bigint;
};

/** Post-adjust CA metrics. */
export type AdjustState = {
  kind: "adjust";
  /** Account TVL after operation */
  totalValue: bigint;
  /** Account debt after operation */
  accountDebt: bigint;
  /** Account assets after operation */
  assets: Asset[];
  /** Account quotas after operation */
  quotas: Record<Address, Asset>;
};

/** Close state result. */
export type CloseState = {
  kind: "close";
  /** Received amount */
  amount: bigint;
  /** Conservative receive (min branch / pathfinder floor). */
  minAmount: bigint;
  /** Pathfinder underlying on CA after close path; 0n when unknown (instant). */
  underlyingBalance: bigint;
};

export type OperationState = AdjustState | CloseState;

// Delayed types

type DelayedBranchKind = "instantSettle" | "partialSettle" | "delayedSettle";

type DelayedBranchResult = {
  kind: DelayedBranchKind;
  operations: AccountCalculatorOperation[];
  preview: { min: OperationState };
  calls: MultiCall[];
  intent: DelayedIntent;
  request?: RequestableWithdrawal;
};

type DelayedErrorReason = "multipleDelayedWithdrawals" | "withdrawalInProgress";

// Instant types

type InstantBranchResult = {
  operations: AccountCalculatorOperation[];
  preview: { min: OperationState };
  calls: MultiCall[];
};

type InstantErrorReason = "pathNotFound";

// General return types

/** Why a preview could not be produced at all (no branch is viable). */
export type PreviewErrorReason =
  | "unsupportedFieldPair"
  | "debtOutOfRange"
  | "leverageOutOfRange"
  | "multipleDelayedWithdrawals"
  | "unsupportedMixedDelayedWithdrawal"
  | "unsupportedCloseClaimOutput"
  | "insufficientSourceBalance"
  /** Input token is not accepted by the flow (e.g. deposit of a non-underlying). */
  | "unsupportedCollateralToken";

type PreviewErrorResult = {
  ok: false;
  reason: PreviewErrorReason;
};

interface IntentPreviewSuccessResult {
  ok: true;

  instant: InstantBranchResult | undefined;
  instantError: InstantErrorReason | undefined;

  delayedBranch: DelayedBranchResult | undefined;
  delayedError: DelayedErrorReason | undefined;
}

export type IntentPreviewResult =
  | IntentPreviewSuccessResult
  | PreviewErrorResult;

/**
 * Start ("full") intents: the leading half of an operation, as opposed to the
 * `resume` tails that continue a matured delayed withdrawal.
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
