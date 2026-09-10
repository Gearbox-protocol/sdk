import type { Address } from "viem";
import { DUST_THRESHOLD } from "../../constants/math.js";
import type { OnchainSDK } from "../../index.js";
import { BigIntMath } from "../../utils/index.js";
import { collateralMoney } from "./collateral-money.js";
import type { CreditAccountSlice } from "./types.js";
import { eq } from "./utils/common.js";

export interface MaxWithdrawCollateralProps {
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  /** Collateral to withdraw. */
  token: Address;
  /** Health factor the withdrawal has to leave behind, in basis points. */
  targetHF: bigint;
}

/**
 * Largest amount of one collateral the account can withdraw while its health
 * factor stays at or above `targetHF`.
 *
 * This is the collateral check solved for one balance, and it counts what that
 * check counts — see {@link collateralMoney} for the valuation, safe prices
 * included. The debt is valued at the main feed, as the check does. Zero debt
 * frees the whole balance.
 *
 * Rounding always favours the account, so the answer clears the check rather
 * than landing a wei short of it.
 *
 * @returns Amount in the token's units; `0n` when nothing can leave —
 * including when the account is already below `targetHF`, or the target or the
 * underlying has no price
 **/
export function maxWithdrawCollateral(
  props: MaxWithdrawCollateralProps,
): bigint {
  const { creditAccount, sdk, token, targetHF } = props;

  const target = creditAccount.tokens.find(t => eq(t.token, token));
  if (!target || target.balance <= DUST_THRESHOLD) {
    return 0n;
  }
  if (creditAccount.totalDebt === 0n) {
    return target.balance;
  }

  const money = collateralMoney(creditAccount, sdk);

  let otherMoney = 0n;
  for (const t of creditAccount.tokens) {
    if (eq(t.token, token) || !money.counts(t)) {
      continue;
    }
    otherMoney += money.weigh(t);
  }

  // The debt is what the check divides by: without a price for it there is no
  // ceiling to offer, rather than an unbounded one.
  const borrowed = money.mainUsd(money.underlying, creditAccount.totalDebt);
  if (borrowed === undefined || borrowed <= 0n) {
    return 0n;
  }

  const required = borrowed * targetHF;
  if (required <= otherMoney) {
    return target.balance;
  }
  const shortfall = required - otherMoney;

  // A quoted holding backs at most its quota, so a quota short of the
  // shortfall cannot be helped by keeping more of the token.
  if (target.quota > 0n && money.quotaMoney(target) < shortfall) {
    return 0n;
  }

  const targetLt = money.lt(target.token);
  const targetUsd = money.checkedUsd(target);
  if (targetLt === 0n || targetUsd === 0n) {
    return 0n;
  }

  // USD is linear in the balance, so what has to stay is the same share of the
  // balance as it is of its value. Both steps round up: a wei too many stays
  // behind rather than being offered.
  const keptUsd = BigIntMath.ceilDiv(shortfall, targetLt);
  const kept = BigIntMath.ceilDiv(target.balance * keptUsd, targetUsd);

  return kept >= target.balance ? 0n : target.balance - kept;
}
