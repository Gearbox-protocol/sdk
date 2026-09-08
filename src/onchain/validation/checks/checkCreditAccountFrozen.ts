import type { Address } from "viem";
import type { CreditAccountFrozenError } from "../../../model/index.js";
import { creditAccountFrozen } from "../../../model/index.js";

export interface CreditAccountFrozenArgs {
  frozen: boolean;
  creditAccount: Address;
}

/** An RWA factory freeze stops the account's collateral from moving. */
export function checkCreditAccountFrozen(
  args: CreditAccountFrozenArgs,
): CreditAccountFrozenError[] {
  return args.frozen ? [creditAccountFrozen(args.creditAccount)] : [];
}
