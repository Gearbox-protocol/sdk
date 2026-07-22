import type { Address } from "viem";
import { isAddressEqual } from "viem";

import { MAX_UINT256 } from "../../sdk/index.js";
import type { InnerOperation } from "../parse/index.js";

/**
 * Detects whether a credit-facade multicall fully closes or repays the
 * account.
 *
 * Note that closing/repaying an account whose debt is already zero emits no
 * `decreaseDebt` call at all and is not detected (previews as an adjustment).
 */
export function isCloseOrRepay(multicall: InnerOperation[]): boolean {
  const repaysFullDebt = multicall.some(
    op =>
      op.operation === "DecreaseBorrowedAmount" && op.amount === MAX_UINT256,
  );
  // Guards against "repay entire debt but keep positions" adjustments
  const withdrawsEverything = multicall.some(
    op => op.operation === "WithdrawCollateral" && op.amount === MAX_UINT256,
  );
  return repaysFullDebt && withdrawsEverything;
}

/**
 * Distinguishes a closure from a repayment by how collateral leaves the
 * account:
 * - close swaps all assets into an exit token and withdraws only exit
 *   tokens: the underlying or, on RWA markets, the unwrapped RWA underlying
 *   (the ERC4626 vault asset)
 * - repay returns collateral in-kind: it adds collateral from the wallet to
 *   cover the debt and/or withdraws non-exit tokens.
 */
export function classifyCloseOrRepay(
  multicall: InnerOperation[],
  exitTokens: Address[],
): "close" | "repay" {
  for (const op of multicall) {
    if (op.operation === "AddCollateral") {
      return "repay";
    }
    if (
      op.operation === "WithdrawCollateral" &&
      !exitTokens.some(token => isAddressEqual(op.token, token))
    ) {
      return "repay";
    }
  }
  return "close";
}
