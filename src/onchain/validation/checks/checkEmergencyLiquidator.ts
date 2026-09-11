import type { Address } from "viem";
import type { NotEmergencyLiquidatorError } from "../../../model/index.js";
import { notEmergencyLiquidator } from "../../../model/index.js";

export interface EmergencyLiquidatorArgs {
  paused: boolean;
  isEmergencyLiquidator: boolean;
  creditManager: Address;
  liquidator: Address;
}

/**
 * A paused market only accepts liquidations from its emergency liquidators.
 * An unpaused market does not consult the list.
 */
export function checkEmergencyLiquidator(
  args: EmergencyLiquidatorArgs,
): NotEmergencyLiquidatorError[] {
  return args.paused && !args.isEmergencyLiquidator
    ? [notEmergencyLiquidator(args.creditManager, args.liquidator)]
    : [];
}
