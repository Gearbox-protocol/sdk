import type { Address } from "viem";
import type { CreditManagerPausedError } from "../../../model/index.js";
import { creditManagerPaused } from "../../../model/index.js";

export interface CreditManagerPausedArgs {
  isPaused: boolean;
  creditManager: Address;
}

/** The credit manager takes no multicall while it is paused. */
export function checkCreditManagerPaused(
  args: CreditManagerPausedArgs,
): CreditManagerPausedError[] {
  return args.isPaused ? [creditManagerPaused(args.creditManager)] : [];
}
