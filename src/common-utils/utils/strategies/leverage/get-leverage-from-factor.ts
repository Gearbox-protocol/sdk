import { LEVERAGE_DECIMALS } from "../../../../sdk/index.js";

import type { LeverageFactor } from "./get-factor-from-leverage.js";

export function getLeverageFromFactor(factor: LeverageFactor): bigint {
  return factor + LEVERAGE_DECIMALS;
}
