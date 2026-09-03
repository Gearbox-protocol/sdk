import type { Address } from "viem";
import type {
  AccountProjection,
  DelayedIntent,
  SDKError,
  TokenAmount,
} from "../../../model/index.js";
import type { MultiCall, OnchainSDK, RouterCASlice } from "../../index.js";
import type { IntentValidationError } from "../../validation/raise.js";
import type { ClaimableWithdrawal } from "../withdrawal-compressor/types.js";
import type { AccountCalculatorOperation } from "./operations.js";

/**
 * Minimal credit-account data an intent is previewed against:
 * account address, CM lookup, underlying for conversion, debt, token balances
 * and initial quotas.
 */
export type CreditAccountSlice = Omit<RouterCASlice, "debt"> & {
  /** either base debt or debt plus interest and fees */
  totalDebt: bigint;
};

/**
 * Price impact against three bases: the routed output, net value, total value.
 *
 * In `PERCENTAGE_FACTOR_1KK` (1_000_000 = 100%), negative for a loss — the
 * legacy 1e6 scale, not the `Bps` the rest of this module speaks.
 */
export interface PathLossRate {
  pathPriceImpact: bigint;
  netValuePriceImpact: bigint;
  totalValuePriceImpact: bigint;
}

/**
 * The two prices only a planned walk can quote, carried by every simulation
 * result beside its projection.
 *
 * A calldata preview is asked for neither: it reads a transaction that already
 * names its amounts, and it reports what that transaction does rather than what
 * the market charges while a form is open.
 */
export interface SimulationPrices {
  /**
   * What the routed legs lost to market depth. `undefined` where nothing was
   * routed or nothing could be measured — never a manufactured zero.
   */
  priceImpact: PathLossRate | undefined;
  /**
   * What the position's collateral costs in the market underlying right now, in
   * the oracle's 8-decimal fixed point — the same scale and the same pair as
   * {@link AccountMetrics.liquidationPrice}, so a screen showing both reads
   * them as one pair.
   *
   * `null` where there is no pair to quote: an account holding zero or several
   * non-underlying assets, or one whose collateral the oracle cannot price.
   */
  currentPrice: bigint | null;
}

/**
 * What the operations leave the account at, in the shared
 * {@link AccountProjection} vocabulary, plus the prices only a routed walk can
 * report.
 */
export interface OperationState extends AccountProjection, SimulationPrices {}

/**
 * What planning an intent yields: the operation chain, the state it projects,
 * and the calldata that realises it — or the error that stopped the plan.
 */
export type IntentPreviewResult =
  | {
      ok: true;
      operations: AccountCalculatorOperation[];
      state: OperationState;
      calls: MultiCall[];
    }
  | SDKError<IntentValidationError>;

/**
 * What a claim did not bring, when the venue served part of a matured
 * withdrawal and left the rest of it queued.
 *
 * Every issuer the engine was written for answers a redemption whole: one
 * request, one claim, one tail. A legacy Mellow multivault does not — it pays
 * out whatever its subvaults hold liquid and queues the remainder, so the claim
 * burns the phantom it names and mints a fresh one for what is still maturing.
 * The tail then serves the share that arrived, and this says what is left to
 * serve later.
 */
export interface ClaimRemainder {
  /**
   * The withdrawal position the claim left on the account: the phantom token
   * standing for the part that has not matured.
   */
  inFlight: TokenAmount;
  /**
   * The intent to finish with once it does — this one minus what the tail
   * beside it already served, so finalising twice pays the wallet and the loan
   * once between them.
   */
  intent: ResumableIntent;
}

/**
 * What finishing a delayed intent yields: {@link IntentPreviewResult}, plus
 * whether the claim it was built on settled the withdrawal whole.
 */
export type FinishIntentResult =
  | (Extract<IntentPreviewResult, { ok: true }> & {
      /**
       * `undefined` when the claim brought everything the request queued,
       * which is every venue but a legacy Mellow one, see
       * {@link ClaimRemainder}.
       */
      remainder: ClaimRemainder | undefined;
    })
  | SDKError<IntentValidationError>;

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
   * nothing repaid, nothing withdrawn — and the caller wants `startIntent`
   * instead, which settles all of it in one transaction.
   */
  settlement: "instant" | "delayed";
  /**
   * What the claim is expected to credit the account with once the redemption
   * matures: the token the redemption settles in and the amount the request queued.
   * `undefined` when the request settled on the spot and nothing is coming.
   *
   * An estimate, not a quote — the issuer prices the redemption when it settles,
   * and the state the intent is previewed against was read now.
   */
  claim: { token: Address; amount: bigint } | undefined;
  /**
   * The account as the request transaction alone leaves it: the source spent,
   * the phantom of the in-flight redemption in its place, the debt untouched.
   *
   * This is the state the facade judges when the transaction lands, so it is
   * the one the engine's guards are applied to — while the `state` beside it
   * is where the intent ends up, tail included, which is what a caller asking
   * "what does this do to my position" means.
   */
  afterRequest: OperationState;
}

/**
 * What the leading half of a delayed intent yields: the request transaction,
 * plus what it recorded for the tail.
 *
 * `operations` and `calls` are the request and nothing else — that is the only
 * transaction there is to send now. `state`, though, is where the intent
 * ends: the state the account reaches once the redemption matures, is claimed
 * and the tail runs, since that is what the caller asked for when they asked
 * to withdraw. The half-way state the request itself lands in is
 * {@link DelayedStart.afterRequest}, and both are validated before either is
 * reported.
 *
 * The tail is projected from oracle prices rather than from a route — the funds
 * it trades do not exist yet — so its half of the numbers is an estimate. What
 * the transaction on offer does is not.
 */
export type DelayedStartResult =
  | {
      ok: true;
      operations: AccountCalculatorOperation[];
      state: OperationState;
      calls: MultiCall[];
      delayed: DelayedStart;
    }
  | SDKError<IntentValidationError>;

/** An intent previewed through the router: one transaction, settled now. */
export type InstantRoute = Extract<IntentPreviewResult, { ok: true }>;

/** An intent previewed as a redemption: the request now, the tail later. */
export type DelayedRoute = Extract<DelayedStartResult, { ok: true }>;

/**
 * Why a route is missing from an {@link IntentRoutesResult}.
 *
 * An error is the engine's verdict — `noDelayedRoute` for a source with no
 * redemption venue or for a leverage move that settles at once,
 * `insufficientBalance` for a withdrawal the account cannot fund. A missing key
 * next to a missing route means the route could not be quoted at all: the
 * pathfinder found no way out of the source, or the read behind it failed.
 */
export interface RouteErrors {
  instant?: IntentValidationError;
  delayed?: IntentValidationError;
}

/**
 * Both ways one intent can be served, previewed side by side: traded through
 * the router, which settles in a single transaction, or redeemed through the
 * source's issuer, which answers now and settles days later.
 *
 * Which of them an account can take depends on the intent and the token it
 * sells, so both are quoted and a route it cannot take comes back `undefined`
 * with its error in `errors`. Only when neither answers is the request itself
 * unviable, and then `error` is the instant route's — the route every account
 * is expected to have — falling back to the delayed one's.
 */
export type IntentRoutesResult =
  | {
      ok: true;
      instant: InstantRoute | undefined;
      delayed: DelayedRoute | undefined;
      errors: RouteErrors;
    }
  | (SDKError<IntentValidationError> & {
      /** {@inheritDoc IntentRoutesResult.errors} */
      errors: RouteErrors;
    });

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
 * proportion so leverage is unchanged: `dD = D0 * W / C0`. Both the withdrawal
 * and the repayment are funded by liquidating the source token, which means the
 * account must give up `W + dD` of value in total.
 *
 * The withdrawal leg and the repayment leg are quoted separately and do not
 * share a pool, so a bad quote on the withdrawal leg does not eat into the
 * repayment.
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
   * account's net value this is an exit, which hands over the underlying the
   * position was sold into rather than in `tokenOut`.
   *
   * `MAX_UINT256` is that exit stated outright, and the amount a "close
   * position" form sends: no net value has to be read to name it, and no
   * rounding can turn it back into a withdrawal that leaves dust behind.
   */
  amount: bigint;
  /** Token recipient. */
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

/**
 * Where a withdraw form's scale ends, in underlying units — and it ends twice.
 *
 * A withdrawal is not one continuous range. Holding leverage flat costs a
 * proportional repayment, and the loan left behind has to clear the facade's
 * `minDebt`, so the partial flow stops at {@link partial}. Leaving entirely
 * settles the loan instead of shrinking it, so the floor does not apply and
 * the whole net value can go. Between the two the flow refuses with
 * `debtOutOfRange` rather than quietly rounding the request to one end.
 *
 * An account borrowing at the floor therefore reports a `partial` of almost
 * nothing — only the interest accrued above `minDebt` can be repaid — beside
 * an `exit` of its entire net value. That gap is the market's rule showing
 * through, not a miscount: such a position frees real money only by leaving.
 */
export interface WithdrawCeilings {
  /**
   * Largest partial withdrawal {@link WithdrawStrategyIntent} accepts: the one
   * whose proportional repayment leaves the debt at `minDebt`. `0n` when the
   * debt already sits below the floor, and always at least one unit under
   * `exit` — the last unit closes the account rather than shrinking it.
   */
  partial: bigint;
  /**
   * What leaving hands over: the account's net value, which is also the amount
   * at which a withdrawal turns into an exit. `0n` on an account whose debt
   * has caught up with its collateral.
   *
   * A Max button is better served by sending `MAX_UINT256` than this figure —
   * the exit is then named outright, and no rounding in the withdrawal token's
   * price can drop the request back into the refused gap.
   */
  exit: bigint;
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
 * A delayed intent this engine knows how to finish — every one of them.
 *
 * `CLOSE_ACCOUNT` included: an exit is a plain multicall like any other
 * operation here (sell everything, settle the loan, hand the rest over), not
 * the facade's own close entry point, so the engine can build its tail too.
 */
export type ResumableIntent = DelayedIntent;

/** Shared inputs plus the matured withdrawal the tail is built around. */
export type FinishIntentProps = StartIntentProps & {
  intent: ResumableIntent;
  /**
   * The matured withdrawal, as reported by
   * `sdk.accounts.getPendingWithdrawals`.
   */
  claimable: ClaimableWithdrawal;
};
