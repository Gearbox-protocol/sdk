import type { QuotaUnchangedError, Token } from "../../../model/index.js";
import { quotaUnchanged } from "../../../model/index.js";
import { amountOf } from "../helpers/index.js";

export interface QuotaChangeArgs {
  token: Token;
  /** All three in the underlying. */
  current: bigint;
  requested: bigint;
  /** What would be sent, after rounding. */
  change: bigint;
  underlying: Token;
}

/** A quota update that rounds to nothing. */
export function checkQuotaChange(args: QuotaChangeArgs): QuotaUnchangedError[] {
  const { token, current, requested, change, underlying } = args;
  if (change !== 0n) {
    return [];
  }
  return [
    quotaUnchanged({
      token,
      current: amountOf(underlying, current),
      requested: amountOf(underlying, requested),
    }),
  ];
}
