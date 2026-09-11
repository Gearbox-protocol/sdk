import type { QuotaCountExceededError } from "../../../model/index.js";
import { quotaCountExceeded } from "../../../model/index.js";

export interface QuotaCountArgs {
  count: number;
  max: number;
}

/** How many quoted tokens the facade enables at once. */
export function checkQuotaCount(
  args: QuotaCountArgs,
): QuotaCountExceededError[] {
  return args.count > args.max
    ? [quotaCountExceeded(args.count, args.max)]
    : [];
}
