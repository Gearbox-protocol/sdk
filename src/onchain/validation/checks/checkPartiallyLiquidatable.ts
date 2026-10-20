import type { Address } from "viem";
import type { PartialLiquidationImpossibleError } from "../../../model/index.js";
import { partialLiquidationImpossible } from "../../../model/index.js";

export interface PartiallyLiquidatableArgs {
  /** `false` for full liquidations, which this check does not concern. */
  isPartial: boolean;
  partiallyLiquidatable: boolean;
  creditAccount: Address;
}

/**
 * A partial liquidation that cannot reach the target health factor without
 * leaving less than the minimum debt is refused.
 */
export function checkPartiallyLiquidatable(
  args: PartiallyLiquidatableArgs,
): PartialLiquidationImpossibleError[] {
  return args.isPartial && !args.partiallyLiquidatable
    ? [partialLiquidationImpossible(args.creditAccount)]
    : [];
}
