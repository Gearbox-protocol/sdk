import { LEVERAGE_DECIMALS } from "../../../../onchain/index.js";

import type { LeverageFactor } from "./get-factor-from-leverage.js";

export function getLeverageFromFactor(factor: LeverageFactor): bigint {
  return factor + LEVERAGE_DECIMALS;
}
