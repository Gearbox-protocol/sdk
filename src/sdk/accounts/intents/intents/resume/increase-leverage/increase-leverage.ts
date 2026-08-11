import type { OnchainSDK } from "../../../../../index.js";
import {
  type AccountCalculatorOperation,
  buildClaimDelayedWithdrawalOperation,
  type ClaimDelayedOption,
} from "../../../operations/index.js";
import type { CreditAccountSlice } from "../../../types.js";

/**
 * Resume increase-leverage: claim only
 */
export function buildResumeIncreaseLeverageOperations(
  creditAccount: CreditAccountSlice,
  options: ClaimDelayedOption,
  sdk: OnchainSDK,
): Array<AccountCalculatorOperation> {
  const operations: Array<AccountCalculatorOperation> = [
    buildClaimDelayedWithdrawalOperation({ creditAccount, sdk }, options),
  ];

  return operations;
}
