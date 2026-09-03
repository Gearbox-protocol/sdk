import type { Address } from "viem";
import {
  type DelayedIntent,
  debtOutOfRange,
  insufficientBalance,
  leverageOutOfRange,
  noDelayedRoute,
  unsupportedCollateralToken,
} from "../../../model/index.js";
import { MAX_UINT256, PERCENTAGE_FACTOR } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { IntentPreviewError } from "../../validation/raise.js";
import { toToken, toTokenAmount } from "../../validation/token.js";
import type { ClaimableWithdrawal } from "../withdrawal-compressor/types.js";
import {
  assertDebtLimits,
  assertLeverageAtLeastOne,
  type DebtLimits,
  debtForLeverage,
  proportionalDebt,
} from "./math.js";
import type {
  AddCollateralIntent,
  AdjustLeverageIntent,
  DepositStrategyIntent,
  RepayStrategyIntent,
  WithdrawAssetIntent,
  WithdrawStrategyIntent,
} from "./types.js";
import { eq } from "./utils/common.js";

/**
 * Planning: an intent becomes a short list of {@link Step}s.
 *
 * Every intent is a walk along the same chain —
 *
 * ```
 * wallet ─add─▶ account ─convert(in→U)─▶ borrow | repay ─convert(U→out)─▶ ─withdraw─▶ wallet
 * ```
 *
 * — so a plan is just which slots are filled and by how much. Planners are
 * pure: they read an {@link AccountView} and return steps; nothing here touches
 * the router or the chain. Identity converts (`from === to`) are legitimate
 * plan entries — the realiser drops them after checking the balance — which is
 * what lets one planner cover every "S is / is not the underlying" shape.
 */

/** Amount of a step: fixed, or whatever the previous step produced. */
export type Amount = bigint | { raised: true; max?: bigint };

/** Whatever the previous convert produced. */
export const RAISED: Amount = { raised: true };

export type Step =
  | { kind: "add"; token: Address; amount: bigint; value: bigint | undefined }
  | { kind: "borrow"; amount: bigint }
  /**
   * Repays up to `amount`, never more than the underlying on the account minus
   * `keep` — a routing shortfall shows up as slightly less debt repaid.
   */
  | { kind: "repay"; amount: Amount; keep?: bigint }
  | { kind: "convert"; from: Address; to: Address; amount: Amount }
  | { kind: "withdraw"; token: Address; amount: Amount; to: Address }
  /**
   * Sells every balance the account holds into the underlying in one
   * many-to-one route. Only an exit asks for this: the whole position is
   * leaving, so the router is given all of it at once rather than one leg per
   * token, and there is nothing left to price a fixed input against.
   */
  | { kind: "closeAll" }
  /**
   * Redeems `amount` of `token` through its issuer instead of a DEX, keeping
   * `reserve` of it on the account. `record` is written into the request and
   * read back at claim time, which is what lets the tail be planned then.
   */
  | {
      kind: "request";
      token: Address;
      amount: bigint;
      reserve: bigint;
      record: DelayedIntent;
    }
  | { kind: "claim"; claimable: ClaimableWithdrawal }
  /**
   * Hands whatever is left on the account to `to`, each balance in the token it
   * stands in. Only an exit asks for this: the amounts are whatever the legs
   * before it happen to leave, which no planner can name in advance.
   */
  | { kind: "sweep"; to: Address }
  /**
   * Drops every quota the account holds, in the same transaction and before
   * whatever follows. Only a plan that leaves no debt behind asks for this:
   * quota fees accrue on the quota, not on the loan, so a quota outliving the
   * debt it backed would keep charging an account that owes nothing.
   */
  | { kind: "clearQuotas" };

/** What a planner is allowed to know about the account. */
export interface AccountView {
  underlying: Address;
  /** The attached SDK, for the guards that inline a token into a refusal. */
  sdk: OnchainSDK;
  /** Raw asset of an RWA market (e.g. USDC behind dcUSDC); undefined otherwise. */
  rwaAsset: Address | undefined;
  debt: bigint;
  /** TVL − debt, in underlying. */
  collateral: bigint;
  debtLimits: DebtLimits;
  balanceOf(token: Address): bigint;
  /** Oracle conversion; unpriceable tokens contribute 0n. */
  price(from: Address, to: Address, amount: bigint): bigint;
  /** Most valuable non-phantom balance, or undefined when there is none. */
  fattest(exclude?: Address[]): Address | undefined;
}

// ---------------------------------------------------------------------------
// Intents
// ---------------------------------------------------------------------------

/** Intent 5: the token lands as is; debt is untouched. */
export function planAddCollateral(
  intent: Omit<AddCollateralIntent, "type">,
): Step[] {
  assertPositive(intent.amount, "addCollateral");
  return [add(intent.token, intent.amount, intent.value)];
}

/** Intent 4: one asset out at fixed debt. */
export function planWithdrawAsset(
  intent: Omit<WithdrawAssetIntent, "type">,
  view: AccountView,
): Step[] {
  assertPositive(intent.amount, "withdrawAsset");
  return payout(view, intent.token, intent.amount, intent.to);
}

/** Intent 6: collateral fixed, debt retargeted to `C0 · (L1 − 1)`. */
export function planAdjustLeverage(
  intent: Omit<AdjustLeverageIntent, "type">,
  view: AccountView,
): Step[] {
  const { U, delta } = leverageShape(intent, view);
  if (delta === 0n) {
    return [];
  }

  const T = intent.token ?? positionToken(view, "adjustLeverage");
  if (delta > 0n) {
    return [borrow(delta), convert(U, T, delta)];
  }

  // Idle underlying repays first; only the shortfall is raised from T.
  const shortfall = -delta - view.balanceOf(U);
  if (shortfall > 0n && eq(T, U)) {
    throw new IntentPreviewError(
      insufficientBalance({
        required: toTokenAmount(view.sdk, U, -delta),
        held: toTokenAmount(view.sdk, U, view.balanceOf(U)),
        holderKind: "creditAccount",
      }),
      `adjustLeverage: needs ${-delta} underlying, account holds ${view.balanceOf(U)}`,
    );
  }
  return [
    ...(shortfall > 0n ? [convert(T, U, view.price(U, T, shortfall))] : []),
    repay(-delta),
  ];
}

/** Intents 1.1 / 1.2: collateral grows by `a`, debt grows to match. */
export function planDeposit(
  intent: Omit<DepositStrategyIntent, "type">,
  view: AccountView,
): Step[] {
  assertPositive(intent.amount, "deposit");
  const U = view.underlying;

  if (
    !eq(intent.token, U) &&
    !(view.rwaAsset && eq(intent.token, view.rwaAsset))
  ) {
    throw new IntentPreviewError(
      unsupportedCollateralToken(toToken(view.sdk, intent.token)),
      `deposit: only ${U}${view.rwaAsset ? ` or ${view.rwaAsset}` : ""} can be deposited, got ${intent.token}`,
    );
  }

  const aU = view.price(intent.token, U, intent.amount);
  const debtDelta =
    intent.targetLeverage === undefined
      ? proportionalDebt(view, aU)
      : debtForLeverage(view.collateral + aU, intent.targetLeverage) -
        view.debt;
  if (debtDelta < 0n) {
    throw new IntentPreviewError(
      leverageOutOfRange(),
      `deposit: target leverage ${intent.targetLeverage} would require repaying debt`,
    );
  }
  assertDebtLimits(view.sdk, view.debt + debtDelta, view.debtLimits, U);

  const T = intent.positionToken ?? positionToken(view, "deposit");
  // The deposit is already the position token: convert only what is borrowed.
  const depositStays = eq(intent.token, T);

  return [
    add(intent.token, intent.amount, intent.value),
    ...(depositStays ? [] : [convert(intent.token, U, intent.amount)]),
    ...(debtDelta > 0n ? [borrow(debtDelta)] : []),
    convert(U, T, debtDelta + (depositStays ? 0n : aU)),
  ].filter(s => s.kind !== "convert" || s.amount !== 0n);
}

/**
 * Intent 3: funding comes in from the wallet and goes straight into the debt.
 * Collateral never moves, so the whole plan is the funding's way to `U`.
 *
 * Funding in `U` needs no way there: it lands and is repaid, which is the whole
 * plan. An RWA market also takes the raw asset behind its underlying, and that
 * one is wrapped on the way in.
 *
 * `MAX_UINT256` settles the loan: the wallet is asked for the debt as it stands
 * plus the headroom {@link SETTLE_MARGIN} allows for the interest of the blocks
 * still to come, since the facade is told to repay everything outstanding
 * rather than the amount quoted here.
 */
export function planRepay(
  intent: Omit<RepayStrategyIntent, "type">,
  view: AccountView,
): Step[] {
  assertPositive(intent.amount, "repay");
  const U = view.underlying;
  const fundsInU = eq(intent.token, U);

  if (!fundsInU && !(view.rwaAsset && eq(intent.token, view.rwaAsset))) {
    throw new IntentPreviewError(
      unsupportedCollateralToken(toToken(view.sdk, intent.token)),
      `repay: only ${U}${view.rwaAsset ? ` or ${view.rwaAsset}` : ""} can be repaid with, got ${intent.token}`,
    );
  }
  if (view.debt <= 0n) {
    throw new IntentPreviewError(
      // Zero debt against debtLimits whose floor is above it: the reading a caller
      // needs is that there is no loan here, not that one is mis-sized.
      debtOutOfRange({
        requested: toTokenAmount(view.sdk, U, view.debt),
        minDebt: toTokenAmount(view.sdk, U, view.debtLimits.minDebt),
        maxDebt: toTokenAmount(view.sdk, U, view.debtLimits.maxDebt),
      }),
      "repay: the account owes nothing",
    );
  }

  const funding = everything(intent.amount)
    ? view.price(U, intent.token, withMargin(view.debt))
    : intent.amount;

  // Whatever exceeds the debt is not a repayment — it stays on the account as
  // collateral. That is what lets a caller send the debt plus a buffer and
  // still settle it in full when interest has accrued in the meantime.
  const repaid = min(view.price(intent.token, U, funding), view.debt);
  assertDebtLimits(
    view.sdk,
    view.debt - repaid,
    view.debtLimits,
    view.underlying,
  );

  return [
    add(intent.token, funding, intent.value),
    ...(fundsInU ? [] : [convert(intent.token, U, funding)]),
    // The facade refuses to bring a loan to zero while its quotas are alive
    // (`DebtToZeroWithActiveQuotasException`), so a settlement drops them.
    ...(repaid === view.debt ? [clearQuotas()] : []),
    repay(repaid),
  ];
}

/**
 * Intent 2.1: `W` of value leaves, debt shrinks by `D0 · W / C0` so leverage
 * holds. Both are funded by the source `S`.
 */
export function planWithdraw(
  intent: Omit<WithdrawStrategyIntent, "type">,
  view: AccountView,
): Step[] {
  const { U, T, S, WU, dD, all } = withdrawShape(intent, view);

  // Asking for the whole net value is an exit, not a withdrawal at fixed
  // leverage: there is no leverage left to hold. The position is sold whole in
  // one many-to-one route, the loan is settled out of the proceeds, and what is
  // left goes to the wallet — which is also the order the facade needs, since
  // the debt has to be gone before the collateral can be.
  if (all) {
    return [
      clearQuotas(),
      { kind: "closeAll" },
      ...(view.debt > 0n ? [repay(view.debt)] : []),
      { kind: "sweep", to: intent.to },
    ];
  }

  // Payout in the underlying: both flows land in U, so one leg raises W + dD and
  // the repayment takes what is left after the payout is set aside.
  if (eq(T, U)) {
    return [
      convert(S, U, view.price(U, S, WU + dD)),
      repay(dD, intent.amount),
      ...payout(view, U, intent.amount, intent.to),
    ];
  }

  return [
    convert(S, U, view.price(U, S, dD)),
    repay(dD),
    convert(S, T, view.price(U, S, WU)),
    ...payout(view, T, RAISED, intent.to),
  ];
}

// ---------------------------------------------------------------------------
// Leading halves — the same intents when the source only redeems through its
// issuer, so nothing can be settled in the same transaction
// ---------------------------------------------------------------------------

/**
 * Intent 2.1 against a source that cannot be sold on a DEX.
 *
 * Some collateral only converts through its issuer — a Securitize dsToken, a
 * Mellow share — which answers a redemption request now and pays out days
 * later. The trade is unchanged; what changes is that the proceeds do not exist
 * yet, so this half only requests the redemption:
 *
 * ```
 * request(S, W + dD) → [days] → claim → convert → repay → withdraw
 * ```
 *
 * The tail is planned at claim time by {@link planFinishWithdraw}, from the
 * intent this request records — only then is the claimed amount, and the token
 * it arrived in, known. An exit records {@link planFinishCloseAccount}'s intent
 * instead, and rebuilds itself from the account rather than from the request.
 */
export function planWithdrawDelayed(
  intent: Omit<WithdrawStrategyIntent, "type">,
  view: AccountView,
): Step[] {
  const { U, T, S, WU, dD, all } = withdrawShape(intent, view);

  // An exit names no payout, so the request has none to record: it redeems the
  // whole source and writes down only where the leftovers go. The tail derives
  // the exit from the account as it stands when the claim lands, which is the
  // only honest reading of "sell all of it" days in advance — the debt will
  // have grown by then, and the balances are whatever the claim brought.
  if (all) {
    const held = view.balanceOf(S);
    if (held <= 0n) {
      throw new IntentPreviewError(
        insufficientBalance(),
        `withdraw: account holds no ${S} to redeem`,
      );
    }
    return [
      {
        kind: "request",
        token: S,
        amount: held,
        reserve: 0n,
        record: { type: "CLOSE_ACCOUNT", to: intent.to },
      },
    ];
  }

  // The tail pays out in the underlying, or in the RWA asset it unwraps to;
  // anything else it cannot serve, so there is no point starting.
  if (!eq(T, U) && !(view.rwaAsset && eq(T, view.rwaAsset))) {
    throw new IntentPreviewError(
      noDelayedRoute(toToken(view.sdk, T)),
      `withdraw: a delayed route cannot pay out in ${T}`,
    );
  }

  // A payout in the source token never leaves the account, so only the debt has
  // to be raised — but the payout has to survive the request.
  const payoutIsSource = eq(T, S);
  return [
    {
      kind: "request",
      token: S,
      amount: view.price(U, S, payoutIsSource ? dD : WU + dD),
      reserve: payoutIsSource ? intent.amount : 0n,
      record: {
        type: "WITHDRAW_COLLATERAL",
        to: intent.to,
        withdrawToken: T,
        withdrawAmount: intent.amount,
        sourceToken: S,
        debtRepaid: dD,
      },
    },
  ];
}

/**
 * Intent 6.2 against a position token that only redeems through its issuer.
 *
 * Only deleveraging can be delayed: raising leverage borrows and buys, both of
 * which settle at once. The request covers whatever idle underlying does not
 * already, and the tail repays from the claim.
 */
export function planAdjustLeverageDelayed(
  intent: Omit<AdjustLeverageIntent, "type">,
  view: AccountView,
): Step[] {
  const { U, delta } = leverageShape(intent, view);
  if (delta >= 0n) {
    throw new IntentPreviewError(
      noDelayedRoute(),
      "adjustLeverage: only deleveraging can settle with a delay",
    );
  }

  const shortfall = -delta - view.balanceOf(U);
  if (shortfall <= 0n) {
    throw new IntentPreviewError(
      noDelayedRoute(),
      "adjustLeverage: idle underlying covers the repayment, nothing to redeem",
    );
  }

  const T = intent.token ?? positionToken(view, "adjustLeverage");
  return [
    {
      kind: "request",
      token: T,
      amount: view.price(U, T, shortfall),
      reserve: 0n,
      record: { type: "DECREASE_LEVERAGE" },
    },
  ];
}

// ---------------------------------------------------------------------------
// Tails — the claim first, then what the intent still owes
// ---------------------------------------------------------------------------

/** Everything claimed goes into the debt. */
export function planFinishDecreaseLeverage(
  claimable: ClaimableWithdrawal,
  claimed: { token: Address; amount: bigint },
  view: AccountView,
): Step[] {
  return [
    claim(claimable),
    convert(claimed.token, view.underlying, claimed.amount),
    repay(RAISED),
  ];
}

/**
 * The claim is split between the promised payout `W` and the debt the leading
 * half deferred: the payout is served first, the debt gets what is left, so a
 * routing shortfall shows as leverage a touch above target rather than as a
 * payout the wallet was promised and did not get.
 */
export function planFinishWithdraw(
  intent: {
    withdrawToken: Address;
    withdrawAmount: bigint;
    debtRepaid: bigint;
    sourceToken: Address;
    to: Address;
  },
  claimable: ClaimableWithdrawal,
  claimed: { token: Address; amount: bigint },
  view: AccountView,
): Step[] {
  const U = view.underlying;
  const T = intent.withdrawToken;
  const W = intent.withdrawAmount;

  if (!eq(T, U) && !(view.rwaAsset && eq(T, view.rwaAsset))) {
    throw new IntentPreviewError(
      noDelayedRoute(toToken(view.sdk, T)),
      `finishWithdraw: cannot pay out in ${T}`,
    );
  }

  // Nothing owed to the debt: the whole claim is payout.
  if (intent.debtRepaid === 0n) {
    return [
      claim(claimable),
      convert(claimed.token, T, claimed.amount),
      ...payout(view, T, { raised: true, max: W }, intent.to),
    ];
  }

  // The source itself was the delayed asset: the payout is already on the
  // account, the claim exists purely to repay.
  if (eq(intent.sourceToken, T)) {
    return [
      claim(claimable),
      convert(claimed.token, U, claimed.amount),
      repay({ raised: true, max: intent.debtRepaid }),
      ...payout(view, T, W, intent.to),
    ];
  }

  // Payout token and debt both want the underlying: convert everything, hold W
  // back, repay from the remainder.
  if (eq(T, U)) {
    return [
      claim(claimable),
      convert(claimed.token, U, claimed.amount),
      repay(intent.debtRepaid, W),
      ...payout(view, U, { raised: true, max: W }, intent.to),
    ];
  }

  // Payout is the RWA asset while the debt wants the underlying: reserve the
  // payout's worth of the claim, repay from the rest, then convert the reserve.
  const reserved = min(view.price(T, claimed.token, W), claimed.amount);
  return [
    claim(claimable),
    convert(claimed.token, U, claimed.amount - reserved),
    repay({ raised: true, max: intent.debtRepaid }),
    convert(claimed.token, T, reserved),
    ...payout(view, T, { raised: true, max: W }, intent.to),
  ];
}

/**
 * The tail of an exit: the claim lands, everything the account holds is sold
 * into the underlying, the loan is settled out of the proceeds and the rest
 * goes to the wallet. The account survives it, empty and owing nothing.
 *
 * Nothing is quoted from the request — the same shape {@link planWithdraw}
 * builds for an instant exit is rebuilt here against the account as it stands
 * now, which is the only state that can name these amounts.
 */
export function planFinishCloseAccount(
  intent: { to: Address },
  claimable: ClaimableWithdrawal,
  claimed: { token: Address; amount: bigint },
  view: AccountView,
): Step[] {
  // The claim of an RWA redemption pays out the market's raw asset, which the
  // loan is not denominated in — so that one leg is named, and everything else
  // is left to the single route `closeAll` builds.
  const wrap =
    view.rwaAsset && eq(claimed.token, view.rwaAsset)
      ? [
          convert(
            claimed.token,
            view.underlying,
            view.balanceOf(claimed.token) + claimed.amount,
          ),
        ]
      : [];

  return [
    claim(claimable),
    ...wrap,
    clearQuotas(),
    { kind: "closeAll" },
    ...(view.debt > 0n ? [repay(view.debt)] : []),
    { kind: "sweep", to: intent.to },
  ];
}

/** Nothing is owed beyond the claim: the tokens land and quotas catch up. */
export function planFinishClaimOnly(claimable: ClaimableWithdrawal): Step[] {
  return [claim(claimable)];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * What a withdrawal comes down to: the payout `W` of `T` priced in the
 * underlying, the debt `dD` that keeps leverage flat, and the source `S` both
 * are funded from. Shared so that the instant and the delayed leading half
 * cannot disagree on the amounts.
 */
function withdrawShape(
  intent: Omit<WithdrawStrategyIntent, "type">,
  view: AccountView,
): {
  U: Address;
  T: Address;
  S: Address;
  WU: bigint;
  dD: bigint;
  /** The request takes the whole net value, so the account ends up empty. */
  all: boolean;
} {
  assertPositive(intent.amount, "withdraw");
  const U = view.underlying;
  const T = intent.tokenOut ?? U;
  const S = intent.sourceToken ?? sourceToken(view);

  // `MAX_UINT256` is the request every "take all of it" form sends, and it is
  // what the facade itself takes to mean the whole balance. Nothing about it
  // needs pricing: it is the exit by name.
  if (everything(intent.amount)) {
    assertHasValue(view);
    return { U, T, S, WU: view.collateral, dD: view.debt, all: true };
  }

  const WU = view.price(T, U, intent.amount);
  if (WU <= 0n) {
    throw new IntentPreviewError(
      insufficientBalance(),
      `withdraw: cannot price ${intent.amount} of ${T}`,
    );
  }
  // Net value is all the account can hand over, so asking for more is asking
  // for all of it rather than a request it cannot serve.
  if (WU >= view.collateral) {
    assertHasValue(view);
    return { U, T, S, WU, dD: view.debt, all: true };
  }

  const dD = proportionalDebt(view, WU);
  assertDebtLimits(view.sdk, view.debt - dD, view.debtLimits, view.underlying);

  return { U, T, S, WU, dD, all: false };
}

/**
 * The debt move a leverage target implies. Shared by the instant and the
 * delayed leading half; the token that funds it is resolved by the caller,
 * once it knows the move needs one at all.
 */
function leverageShape(
  intent: Omit<AdjustLeverageIntent, "type">,
  view: AccountView,
): { U: Address; delta: bigint } {
  assertLeverageAtLeastOne(intent.targetLeverage);
  if (view.collateral <= 0n) {
    throw new IntentPreviewError(
      insufficientBalance(),
      "adjustLeverage: account has no collateral to lever",
    );
  }

  const target = debtForLeverage(view.collateral, intent.targetLeverage);
  assertDebtLimits(view.sdk, target, view.debtLimits, view.underlying);

  return { U: view.underlying, delta: target - view.debt };
}

const add = (
  token: Address,
  amount: bigint,
  value: bigint | undefined,
): Step => ({
  kind: "add",
  token,
  amount,
  value,
});
const borrow = (amount: bigint): Step => ({ kind: "borrow", amount });
const repay = (amount: Amount, keep?: bigint): Step =>
  keep === undefined
    ? { kind: "repay", amount }
    : { kind: "repay", amount, keep };
const convert = (from: Address, to: Address, amount: Amount): Step => ({
  kind: "convert",
  from,
  to,
  amount,
});
const claim = (claimable: ClaimableWithdrawal): Step => ({
  kind: "claim",
  claimable,
});
const clearQuotas = (): Step => ({ kind: "clearQuotas" });
/**
 * Headroom a settlement raises on top of the debt it read, in
 * `PERCENTAGE_FACTOR`: enough interest for the transaction to sit in the
 * mempool for hours at any sane borrow rate, small enough not to matter to the
 * wallet that fronts it.
 */
const SETTLE_MARGIN = 10n;
const withMargin = (debt: bigint): bigint =>
  debt + (debt * SETTLE_MARGIN) / PERCENTAGE_FACTOR;
/** The amount that asks for all of it, whatever "all" turns out to be. */
const everything = (amount: bigint): boolean => amount >= MAX_UINT256;
const min = (a: bigint, b: bigint): bigint => (a < b ? a : b);

/**
 * Hands `amount` of `token` to `to`. The wrapped underlying of an RWA market
 * cannot leave the account, so it is unwrapped into the raw asset on the way.
 */
function payout(
  view: AccountView,
  token: Address,
  amount: Amount,
  to: Address,
): Step[] {
  if (view.rwaAsset && eq(token, view.underlying)) {
    return [
      convert(view.underlying, view.rwaAsset, amount),
      { kind: "withdraw", token: view.rwaAsset, amount: RAISED, to },
    ];
  }
  return [{ kind: "withdraw", token, amount, to }];
}

function positionToken(view: AccountView, flow: string): Address {
  const pick = view.fattest([view.underlying]);
  if (!pick) {
    throw new IntentPreviewError(
      insufficientBalance(),
      `${flow}: no position token on the account`,
    );
  }
  return pick;
}

function sourceToken(view: AccountView): Address {
  const pick = view.fattest();
  if (!pick) {
    throw new IntentPreviewError(
      insufficientBalance(),
      "withdraw: account has no spendable balance",
    );
  }
  return pick;
}

/** An account whose debt has eaten its collateral has nothing to hand over. */
function assertHasValue(view: AccountView): void {
  if (view.collateral <= 0n) {
    throw new IntentPreviewError(
      insufficientBalance(),
      `withdraw: nothing to withdraw, net value is ${view.collateral}`,
    );
  }
}

function assertPositive(amount: bigint, flow: string): void {
  if (amount <= 0n) {
    throw new IntentPreviewError(
      insufficientBalance(),
      `${flow}: amount must be positive`,
    );
  }
}
