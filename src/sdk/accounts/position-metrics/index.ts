import type { PositionMetrics } from "../../../model/index.js";
import type { OnchainSDK } from "../../index.js";
import { borrowRate } from "./borrow-rate.js";
import { healthFactor } from "./health-factor.js";
import { liquidationPrice } from "./liquidation-price.js";
import { timeToLiquidation } from "./time-to-liquidation.js";
import type { AccountSnapshot } from "./types.js";

export { borrowRate } from "./borrow-rate.js";
export { healthFactor } from "./health-factor.js";
export { liquidationPrice } from "./liquidation-price.js";
export { timeToLiquidation } from "./time-to-liquidation.js";
export {
  type AccountSnapshot,
  accountSnapshotFromCreditAccountData,
} from "./types.js";

/**
 * All position metrics of an account state at once: health factor, borrow
 * rate breakdown, time to liquidation and liquidation price, each computed
 * from the same snapshot by its own function.
 *
 * @param sdk - Market data source.
 * @param snapshot - Account state to evaluate.
 **/
export function positionMetrics(
  sdk: OnchainSDK,
  snapshot: AccountSnapshot,
): PositionMetrics {
  return {
    healthFactor: healthFactor(sdk, snapshot),
    // TODO: overall APY needs the collateral yield (lpAPY), which market
    // state alone does not carry — wire it up together with the ApyPlugin
    overallApy: 0,
    borrowRate: borrowRate(sdk, snapshot),
    timeToLiquidation: timeToLiquidation(sdk, snapshot),
    liquidationPrice: liquidationPrice(sdk, snapshot),
  };
}
