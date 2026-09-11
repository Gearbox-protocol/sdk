import type { Address } from "viem";
import type { OnchainSDK } from "../../index.js";
import { BigIntMath } from "../../utils/index.js";
import { MIN_HEALTH_FACTOR_FACADE } from "../../validation/index.js";
import { collateralMoney } from "./collateral-money.js";
import { maxProportionalWithdrawal } from "./math.js";
import type { CreditAccountSlice, WithdrawCeilings } from "./types.js";
import { eq } from "./utils/common.js";
import { accountView } from "./view.js";

export interface WithdrawLimitsProps {
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  /**
   * Token the withdrawal liquidates. Defaults to the account's largest
   * non-phantom balance, which is what the planner reaches for when the intent
   * names none.
   */
  sourceToken?: Address;
}

/**
 * Every limit a `WITHDRAW` answers to, in underlying units.
 *
 * The one place they are assembled, so the figure a form is offered and the
 * figure the collateral guard names when it turns a withdrawal down cannot
 * drift apart: `CreditAccountOperationsService` reports this, and the guard
 * quotes it back.
 *
 * @param props - Account slice, the SDK holding its market, and optionally the
 * collateral the withdrawal would be funded from
 * @returns The three limits, see {@link WithdrawCeilings}
 **/
export function withdrawLimits(props: WithdrawLimitsProps): WithdrawCeilings {
  const { creditAccount, sdk } = props;
  const view = accountView(creditAccount, sdk);
  const partial = maxProportionalWithdrawal(view, view.debtLimits);
  const safe = maxSafeWithdrawal({
    ...props,
    targetHF: BigInt(MIN_HEALTH_FACTOR_FACADE),
  });
  return {
    partial,
    safePartial: BigIntMath.min(partial, safe),
    // an account underwater owes more than it holds, and has nothing to hand
    // over on the way out
    exit: view.collateral > 0n ? view.collateral : 0n,
  };
}

export interface MaxSafeWithdrawalProps {
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  /**
   * Token the withdrawal liquidates. Defaults to the account's largest
   * non-phantom balance, which is what the planner reaches for when the intent
   * names none.
   */
  sourceToken?: Address;
  /**
   * Health factor the withdrawal has to leave behind, in basis points. The
   * facade's own threshold answers "would this land"; a form holding the
   * account to something stricter passes its own.
   */
  targetHF: bigint;
}

/**
 * Largest proportional withdrawal the safe-price collateral check still clears,
 * in underlying units.
 *
 * A withdrawal hands funds over, so the facade weighs the account it leaves
 * behind at safe prices rather than main ones — see {@link collateralMoney}.
 * That is a second limit on top of the facade's `debtLimits`, and the two are
 * independent: a caller wanting the amount a form may actually offer takes the
 * lesser of this and `maxProportionalWithdrawal`.
 *
 * The arithmetic is the check solved for the amount. Taking `W` out at fixed
 * leverage repays `dD = D·W/C`, so `W·TVL/C` of value is sold out of the source
 * token; each dollar of that sale costs the check the source's threshold times
 * its safe-to-main price ratio, while the repayment relieves `targetHF` per
 * dollar of debt. Both terms are linear in `W`, which is why one division
 * answers instead of a search — and why the answer is exact rather than a
 * bound, as long as the plan really does fund itself from `sourceToken`.
 *
 * Two consequences worth stating, because they surprise:
 *
 * - An account whose collateral is entirely a token the reserve feed marks
 *   down cannot withdraw at all once it is under the threshold. A proportional
 *   withdrawal scales collateral and debt together, so it leaves the safe-price
 *   factor exactly where it found it — no amount climbs back over.
 * - Leaving entirely is never refused for this reason: the exit settles the
 *   debt instead of shrinking it, and a check with no debt to divide by has
 *   nothing to refuse.
 *
 * @returns Amount in underlying units. The account's net value when safe prices
 * do not limit the withdrawal at all, so the caller's `min` is a no-op; `0n`
 * when the account already sits below `targetHF` at safe prices, and only the
 * exit is left
 **/
export function maxSafeWithdrawal(props: MaxSafeWithdrawalProps): bigint {
  const { creditAccount, sdk, targetHF } = props;

  const view = accountView(creditAccount, sdk);
  // An account underwater owes more than it holds; there is no amount to size
  // and nothing to hand over either way.
  if (view.collateral <= 0n) {
    return 0n;
  }
  // No loan, no collateral check: `debtLimits` is the only thing in the way.
  if (view.debt === 0n) {
    return view.collateral;
  }

  const money = collateralMoney(creditAccount, sdk);
  const source = props.sourceToken ?? view.fattest();
  const holding =
    source === undefined
      ? undefined
      : creditAccount.tokens.find(t => eq(t.token, source));
  if (!holding) {
    return view.collateral;
  }

  let total = 0n;
  for (const t of creditAccount.tokens) {
    if (money.counts(t)) {
      total += money.weigh(t);
    }
  }

  const debtUsd = money.mainUsd(money.underlying, view.debt);
  // The check divides by the debt: without a price for it there is no limit to
  // state, and inventing one either way would be a guess.
  if (debtUsd === undefined || debtUsd <= 0n) {
    return view.collateral;
  }

  const slack = total - debtUsd * targetHF;
  if (slack < 0n) {
    return 0n;
  }

  // What one dollar of the source's value is worth to the check, as a ratio
  // rather than a rate, so the division below stays exact. A quota-capped
  // holding gives up less than its threshold when it is sold, so this
  // over-states the cost and the answer errs low.
  const sourceMainUsd = money.mainUsd(holding.token, holding.balance);
  if (sourceMainUsd === undefined || sourceMainUsd <= 0n) {
    return view.collateral;
  }
  const sourceRate = money.lt(holding.token) * money.checkedUsd(holding);

  // The value the sale has to raise, per unit withdrawn, is `TVL/C` — so the
  // whole balance sheet enters here, not just the source.
  const tvlUsd = money.mainUsd(money.underlying, view.collateral + view.debt);
  if (tvlUsd === undefined) {
    return view.collateral;
  }

  // `drain` is the check tightening per unit withdrawn, carried multiplied by
  // `sourceMainUsd` so that the safe-to-main ratio never rounds on its own.
  const drain = sourceRate * tvlUsd - targetHF * debtUsd * sourceMainUsd;
  // Not a constraint at all: the repayment buys more room than the sale costs,
  // so a larger withdrawal is the safer one.
  if (drain <= 0n) {
    return view.collateral;
  }

  // Rounds down, so the answer clears the check rather than sitting a wei past
  // it.
  const limit = (view.collateral * slack * sourceMainUsd) / drain;
  return limit < view.collateral ? limit : view.collateral;
}
