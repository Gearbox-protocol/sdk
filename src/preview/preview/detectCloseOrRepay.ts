import type { Address } from "viem";
import { isAddressEqual } from "viem";

import { MAX_UINT256 } from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";

/**
 * Detects whether a credit-facade multicall fully closes or repays the
 * account: any multicall that calls `decreaseDebt(MAX_UINT256)`.
 *
 * Note that closing/repaying an account whose debt is already zero emits no
 * `decreaseDebt` call at all and is not detected (previews as an adjustment).
 */
export function isCloseOrRepay(multicall: InnerOperation[]): boolean {
  return multicall.some(
    op =>
      op.operation === "DecreaseBorrowedAmount" && op.amount === MAX_UINT256,
  );
}

/**
 * Distinguishes a closure from a repayment by how collateral leaves the
 * account:
 * - close swaps all assets into the market underlying and withdraws only
 *   that token or, on RWA markets, its unwrapped version.
 *   Requires at least one `withdrawCollateral(MAX)` for one of those tokens.
 * - repay returns collateral in-kind: it adds collateral from the wallet to
 *   cover the debt, withdraws tokens other than the market underlying (or
 *   its unwrapped RWA asset), and/or leaves collateral on the account with
 *   no withdrawals at all.
 */
export function classifyCloseOrRepay(
  multicall: InnerOperation[],
  exitTokens: Address[],
): "close" | "repay" {
  let hasExitWithdrawal = false;

  for (const op of multicall) {
    if (op.operation === "AddCollateral") {
      return "repay";
    }
    if (op.operation === "WithdrawCollateral") {
      const isExit = exitTokens.some(token => isAddressEqual(op.token, token));
      if (!isExit) {
        return "repay";
      }
      if (op.amount === MAX_UINT256) {
        hasExitWithdrawal = true;
      }
    }
  }

  return hasExitWithdrawal ? "close" : "repay";
}
