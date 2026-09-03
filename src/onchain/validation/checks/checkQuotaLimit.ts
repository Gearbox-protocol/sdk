import type { QuotaLimitReachedError, Token } from "../../../model/index.js";
import { quotaLimitReached } from "../../../model/index.js";
import { amountOf } from "../helpers/index.js";

export interface QuotaLimitArgs {
  token: Token;
  /**
   * Absent for a token the market opened no quota for at all — nothing is
   * weighed against a limit, the token simply counts as no collateral.
   */
  requested: bigint | undefined;
  available: bigint;
  underlying: Token;
}

/** The room the keeper still has for a token's quota, in the underlying. */
export function checkQuotaLimit(
  args: QuotaLimitArgs,
): QuotaLimitReachedError[] {
  const { token, requested, available, underlying } = args;
  if (requested !== undefined && requested <= available) {
    return [];
  }
  return [
    quotaLimitReached({
      token,
      requested:
        requested === undefined ? undefined : amountOf(underlying, requested),
      available: amountOf(underlying, available),
    }),
  ];
}
