import type { PartialLiquidationOperation } from "../parse/index.js";
import { allowanceAndBalance } from "./helpers.js";
import type { AnyPrerequisite } from "./Prerequisite.js";
import type { PrerequisiteContext } from "./types.js";

/**
 * Partial liquidation pulls the repaid underlying from the liquidator: they
 * must have approved it to the credit manager and hold enough of it.
 */
export function buildPartialLiquidationPrerequisites(
  tx: PartialLiquidationOperation,
  ctx: PrerequisiteContext,
): AnyPrerequisite[] {
  if (tx.repaidAmount === 0n) {
    return [];
  }
  const suite = ctx.sdk.marketRegister.findByCreditManager(tx.creditManager);
  return allowanceAndBalance({
    token: suite.underlying,
    owner: ctx.wallet,
    spender: tx.creditManager,
    required: tx.repaidAmount,
    allowanceTitle: "Underlying approved to credit manager",
    balanceTitle: "Sufficient underlying balance",
  });
}
