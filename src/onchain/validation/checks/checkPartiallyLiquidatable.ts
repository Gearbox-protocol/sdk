import type { Address } from "viem";
import type { PartialLiquidationImpossibleError } from "../../../model/index.js";
import { partialLiquidationImpossible } from "../../../model/index.js";

export interface PartiallyLiquidatableArgs {
  /** `undefined` for full liquidations, which this check does not concern. */
  partiallyLiquidatable?: boolean;
  creditAccount: Address;
}

/**
 * A partial liquidation that cannot reach the target health factor without
 * leaving less than the minimum debt is refused.
 */
export function checkPartiallyLiquidatable(
  args: PartiallyLiquidatableArgs,
): PartialLiquidationImpossibleError[] {
  return args.partiallyLiquidatable === false
    ? [partialLiquidationImpossible(args.creditAccount)]
    : [];
}
