import type { LeverageOutOfRangeError } from "../../../model/index.js";
import { leverageOutOfRange } from "../../../model/index.js";

export interface LeverageArgs {
  /** Scaled by `LEVERAGE_DECIMALS` (`100n` = 1x), as the intent states it. */
  leverage: bigint;
  min: bigint;
}

/** Leverage below 1x is not a position, it is a withdrawal. */
export function checkLeverage(args: LeverageArgs): LeverageOutOfRangeError[] {
  return args.leverage < args.min
    ? [leverageOutOfRange({ requested: args.leverage, min: args.min })]
    : [];
}
