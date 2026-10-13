import type { QuotaAboveMaxError, Token } from "../../../model/index.js";
import { quotaAboveMax } from "../../../model/index.js";
import { amountOf } from "../helpers/index.js";

export interface MaxQuotaArgs {
  token: Token;
  /** Both in the underlying. */
  requested: bigint;
  /** `MAX_QUOTA_MULTIPLIER × maxDebt`. */
  maxQuota: bigint;
  underlying: Token;
}

/** The facade's per-token quota ceiling. */
export function checkMaxQuota(args: MaxQuotaArgs): QuotaAboveMaxError[] {
  const { token, requested, maxQuota, underlying } = args;
  if (requested <= maxQuota) {
    return [];
  }
  return [
    quotaAboveMax({
      token,
      requested: amountOf(underlying, requested),
      maxQuota: amountOf(underlying, maxQuota),
    }),
  ];
}
