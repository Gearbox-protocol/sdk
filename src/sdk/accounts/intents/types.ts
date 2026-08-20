import type { Address } from "viem";
import type {
  Bps,
  BorrowRateBreakdown,
  Leverage,
} from "../../../model/index.js";
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
  /**
   * Health factor in basis points: below `10000` the account is liquidatable.
   *
   * @example `12500` for a health factor of 1.25
   **/
  healthFactor: Bps;
  /**
   * Net rate the whole position earns, collateral yield minus borrow cost.
   **/
  overallApy: Bps;
  /**
   * Cost of the debt, broken down by source.
   **/
  borrowRate: BorrowRateBreakdown;
  /**
   * Estimated milliseconds until the health factor decays to `10000` under
   * the current borrow rate, or `null` when the debt carries no rate (or the
   * account is already liquidatable).
   **/
  timeToLiquidation: bigint | null;
  /**
   * Price of the single non-underlying collateral at which the account
   * becomes liquidatable, in the oracle's 8-decimal fixed point, or `null`
   * when the account holds zero or several non-underlying assets.
   **/
  liquidationPrice: bigint | null;
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
 * prepare namespace reports for a request it can refuse before planning: a
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
  | "noRecordedIntent"
  /** The facade or the pool behind it is paused: nothing can be done at all. */
  | "marketPaused"
  /** The facade is past its expiration date and takes no more multicalls. */
  | "marketExpired"
  /**
   * The pool cannot lend what the plan draws right now — its free liquidity,
   * the manager's debt limit or the per-block cap stands in the way.
   */
  | "insufficientPoolLiquidity"
  /** The market takes no more quota for a token the plan wants to hold. */
  | "quotaLimitReached"
  /** The plan would increase the balance of a token the market forbids. */
  | "forbiddenToken"
  /**
   * The account would end the transaction owing more than its collateral is
   * worth under liquidation thresholds, which the facade refuses to allow.
   */
  | "insufficientCollateral";

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
   * withdrawal at claim time. `prepare.finalize` picks it up from there, and
   * `CreditAccountOperationsService.finishIntent` is what it feeds.
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

/** An intent previewed through the router: one transaction, settled now. */
export type InstantRoute = Extract<IntentPreviewResult, { ok: true }>;

/** An intent previewed as a redemption: the request now, the tail later. */
export type DelayedRoute = Extract<DelayedStartResult, { ok: true }>;

/**
 * Why a route is missing from an {@link IntentRoutesResult}.
 *
 * A reason is the engine's refusal — `noDelayedRoute` for a source with no
 * redemption venue or for a leverage move that settles at once,
 * `insufficientSourceBalance` for a payout the account cannot fund. `undefined`
 * next to a missing route means the route could not be quoted at all: the
 * pathfinder found no way out of the source, or the read behind it failed.
 */
export interface RouteRefusals {
  instant: PreviewErrorReason | undefined;
  delayed: PreviewErrorReason | undefined;
}

/**
 * Both ways one intent can be served, previewed side by side: traded through
 * the router, which settles in a single transaction, or redeemed through the
 * source's issuer, which answers now and pays out days later.
 *
 * Which of them an account can take depends on the intent and the token it
 * sells, so both are quoted and a route it cannot take comes back `undefined`
 * with its refusal in `refused`. Only when neither answers is the request itself
 * unviable, and then `reason` is the instant route's refusal — the route every
 * account is expected to have — falling back to the delayed one's.
 */
export type IntentRoutesResult =
  | {
      ok: true;
      instant: InstantRoute | undefined;
      delayed: DelayedRoute | undefined;
      refused: RouteRefusals;
    }
  | {
      ok: false;
      reason: PreviewErrorReason;
      refused: RouteRefusals;
    };

/**
 * The intents the engine previews.
 *
 * Naming avoids the `withdrawCollateral` collision that exists elsewhere in the
 * repo. Mapping to the public prepare API:
 *
 * | Intent type        | Public name                  | Debt    |
 * | ------------------ | ---------------------------- | ------- |
 * | `ADD_COLLATERAL`   | `prepare.addCollateral`      | fixed   |
 * | `WITHDRAW_ASSET`   | `prepare.withdrawCollateral` | fixed   |
 * | `ADJUST_LEVERAGE`  | `prepare.adjustLeverage`     | changes |
 * | `DEPOSIT`          | `prepare.depositStrategy`    | grows   |
 * | `WITHDRAW`         | `prepare.withdrawStrategy`   | shrinks |
 * | `REPAY`            | `prepare.repayStrategy`      | shrinks |
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
 * Intent 3 — repay debt with funds from the wallet.
 *
 * The mirror of {@link DepositStrategyIntent}: money arrives from outside and
 * nothing on the account is sold, so collateral value stands still while debt
 * shrinks. Net value grows by what was repaid, leverage falls, and the health
 * factor improves — this is the flow that rescues an account, and the only one
 * that lowers debt without touching the position.
 *
 * The market underlying is what a loan is denominated in, so sending it needs
 * no conversion: it lands and is repaid. Two more forms are accepted, as for a
 * deposit: a wrapped-native market also takes the native coin (pass the wrapped
 * token plus `value`), and an RWA market takes the unwrapped asset behind its
 * underlying, which this flow wraps for you.
 */
export interface RepayStrategyIntent {
  type: "REPAY";
  /** Funding token: the market underlying, or `rwa.asset` on an RWA market. */
  token: Address;
  /**
   * Amount of `token` taken from the wallet. More than the outstanding debt is
   * allowed — the debt is settled in full and the excess stays on the account
   * as collateral — which is what lets a caller cover the interest that accrues
   * between this preview and the transaction.
   *
   * `MAX_UINT256` asks for exactly that settlement without naming a figure: the
   * wallet is charged the debt plus a small margin for the interest still to
   * come, the facade is told to repay everything outstanding, and the quotas go
   * with the loan.
   */
  amount: bigint;
  /** Native value to attach when paying with the native coin. */
  value?: bigint;
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
 * Asking for the whole net value is the exit instead — there is no leverage
 * left to hold — and the shape changes with it: the quotas are dropped, the
 * position is sold whole in one many-to-one route, the loan is settled in full
 * and every remaining balance goes to the wallet. The account survives it,
 * empty and owing nothing.
 *
 * @see WithdrawAssetIntent for moving a single asset out at fixed debt, and
 * AdjustLeverageIntent for changing leverage without withdrawing.
 */
export interface WithdrawStrategyIntent {
  type: "WITHDRAW";
  /**
   * Amount the wallet receives, denominated in `tokenOut`. At or above the
   * account's net value this is an exit, which pays out the underlying the
   * position was sold into rather than in `tokenOut`.
   *
   * `MAX_UINT256` is that exit stated outright, and the amount a "close
   * position" form sends: no net value has to be read to name it, and no
   * rounding can turn it back into a withdrawal that leaves dust behind.
   */
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
   * non-phantom balance on the account, and is ignored by an exit — that sells
   * every balance there is.
   */
  sourceToken?: Address;
}

export type StartIntent =
  | AddCollateralIntent
  | WithdrawAssetIntent
  | AdjustLeverageIntent
  | DepositStrategyIntent
  | RepayStrategyIntent
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
