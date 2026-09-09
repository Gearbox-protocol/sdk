import type { DebtOutOfRangeError, Token } from "../../../model/index.js";
import { debtOutOfRange } from "../../../model/index.js";
import { amountOf } from "../helpers/index.js";

export interface DebtLimitsArgs {
  debt: bigint;
  minDebt: bigint;
  maxDebt: bigint;
  underlying: Token;
  /**
   * Whether ending with no loan at all is acceptable. The one place the two
   * callers genuinely disagree: an account being adjusted may end owing
   * nothing, while one being opened may not — so the exemption is stated
   * rather than assumed.
   */
  allowZero: boolean;
}

/** A debt the facade would revert on. */
export function checkDebtLimits(args: DebtLimitsArgs): DebtOutOfRangeError[] {
  const { debt, minDebt, maxDebt, underlying, allowZero } = args;
  const outOfRange =
    debt > maxDebt || (debt < minDebt && !(allowZero && debt === 0n));
  if (!outOfRange) {
    return [];
  }
  return [
    debtOutOfRange({
      requested: amountOf(underlying, debt),
      minDebt: amountOf(underlying, minDebt),
      maxDebt: amountOf(underlying, maxDebt),
    }),
  ];
}
