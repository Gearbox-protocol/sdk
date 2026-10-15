import type { QuotaInactiveError, Token } from "../../../model/index.js";
import { quotaInactive } from "../../../model/index.js";

export interface QuotaActiveArgs {
  token: Token;
  /** Whether the quota keeper charges a nonzero rate for the token. */
  isActive: boolean;
}

/** A token whose quota the keeper does not manage at all. */
export function checkQuotaActive(args: QuotaActiveArgs): QuotaInactiveError[] {
  return args.isActive ? [] : [quotaInactive(args.token)];
}
