import type { Address } from "viem";
import type { MarketExpiredError } from "../../../model/index.js";
import { marketExpired } from "../../../model/index.js";

export interface MarketExpiredArgs {
  isExpired: boolean;
  creditManager: Address;
  /** Unix seconds, as the facade reports it. */
  expirationDate: number;
}

/** Past its expiration date the facade takes no more multicalls. */
export function checkMarketExpired(
  args: MarketExpiredArgs,
): MarketExpiredError[] {
  return args.isExpired
    ? [marketExpired(args.creditManager, args.expirationDate)]
    : [];
}
