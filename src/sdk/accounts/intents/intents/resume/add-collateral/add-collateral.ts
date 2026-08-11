import type { OnchainSDK } from "../../../../../index.js";
import {
  type AccountCalculatorOperation,
  buildClaimDelayedWithdrawalOperation,
  type ClaimDelayedOption,
} from "../../../operations/index.js";
import type { CreditAccountSlice } from "../../../types.js";

/**
 * Resume add-collateral: claim only
 */
export function buildResumeAddCollateralOperations(
  creditAccount: CreditAccountSlice,
  options: ClaimDelayedOption,
  sdk: OnchainSDK,
): Array<AccountCalculatorOperation> {
  const operations: Array<AccountCalculatorOperation> = [
    buildClaimDelayedWithdrawalOperation(creditAccount, options, sdk),
  ];

  return operations;
}
