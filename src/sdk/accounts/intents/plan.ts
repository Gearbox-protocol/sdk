import type { Address } from "viem";
import {
  assertDebtInBand,
  assertLeverageAtLeastOne,
  type DebtBand,
  debtForLeverage,
  proportionalDebt,
} from "./math.js";
import type {
  AddCollateralIntent,
  AdjustLeverageIntent,
  DepositStrategyIntent,
  WithdrawAssetIntent,
  WithdrawStrategyIntent,
} from "./types.js";
import { IntentPreviewError } from "./types.js";
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
  | { kind: "withdraw"; token: Address; amount: Amount; to: Address };

/** What a planner is allowed to know about the account. */
export interface AccountView {
  underlying: Address;
  /** Raw asset of an RWA market (e.g. USDC behind dcUSDC); undefined otherwise. */
  rwaAsset: Address | undefined;
  debt: bigint;
  /** TVL − debt, in underlying. */
  collateral: bigint;
  band: DebtBand;
  balanceOf(token: Address): bigint;
  /** Oracle conversion, RWA-aware. */
  price(from: Address, to: Address, amount: bigint): bigint;
  /** Most valuable non-phantom balance, or undefined when there is none. */
  fattest(exclude?: Address[]): Address | undefined;
}

// ---------------------------------------------------------------------------
// Start intents
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
  assertLeverageAtLeastOne(intent.targetLeverage);
  if (view.collateral <= 0n) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      "adjustLeverage: account has no collateral to lever",
    );
  }

  const target = debtForLeverage(view.collateral, intent.targetLeverage);
  assertDebtInBand(target, view.band);

  const delta = target - view.debt;
  if (delta === 0n) {
    return [];
  }

  const U = view.underlying;
  const T = intent.token ?? positionToken(view, "adjustLeverage");

  if (delta > 0n) {
    return [borrow(delta), convert(U, T, delta)];
  }

  // Idle underlying repays first; only the shortfall is raised from T.
  const shortfall = -delta - view.balanceOf(U);
  if (shortfall > 0n && eq(T, U)) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
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
      "unsupportedCollateralToken",
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
      "leverageOutOfRange",
      `deposit: target leverage ${intent.targetLeverage} would require repaying debt`,
    );
  }
  assertDebtInBand(view.debt + debtDelta, view.band);

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
 * Intent 2.1: `W` of value leaves, debt shrinks by `D0 · W / C0` so leverage
 * holds. Both are funded by the source `S`.
 */
export function planWithdraw(
  intent: Omit<WithdrawStrategyIntent, "type">,
  view: AccountView,
): Step[] {
  assertPositive(intent.amount, "withdraw");
  const U = view.underlying;
  const T = intent.tokenOut ?? U;
  const S = intent.sourceToken ?? sourceToken(view);

  const WU = view.price(T, U, intent.amount);
  if (WU <= 0n) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      `withdraw: cannot price ${intent.amount} of ${T}`,
    );
  }
  if (WU >= view.collateral) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      `withdraw: ${WU} exceeds withdrawable collateral ${view.collateral}`,
    );
  }

  const dD = proportionalDebt(view, WU);
  assertDebtInBand(view.debt - dD, view.band);

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
// Helpers
// ---------------------------------------------------------------------------

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
      "insufficientSourceBalance",
      `${flow}: no position token on the account`,
    );
  }
  return pick;
}

function sourceToken(view: AccountView): Address {
  const pick = view.fattest();
  if (!pick) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      "withdraw: account has no spendable balance",
    );
  }
  return pick;
}

function assertPositive(amount: bigint, flow: string): void {
  if (amount <= 0n) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      `${flow}: amount must be positive`,
    );
  }
}
