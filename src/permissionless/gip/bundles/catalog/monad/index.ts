import type { Address } from "viem";
import type { MarketActions } from "../../../core/actions/index.js";
import {
  createTokenInTokenOutToBundleMap,
  createTokenInToTokensOutMap,
  type StrategyModule,
} from "../utils.js";
import balancerV3NeverlandUsdcAusdUsdt0Strategy from "./balancer-v3-neverland-usdc-ausd-usdt0.json" with {
  type: "json",
};
import curveAzndAusdStrategy from "./curve-aznd-ausd-strategy.json" with {
  type: "json",
};
import curveUsdcAusdUsdt0Strategy from "./curve-usdc-ausd-usdt0-strategy.json" with {
  type: "json",
};
import mEdgeStrategy from "./medge-strategy.json" with { type: "json" };
import sausdStrategy from "./sausd-strategy.json" with { type: "json" };
import wbtcStrategy from "./wbtc-strategy-(new).json" with { type: "json" };
// Import all strategy files
import wethStrategy from "./weth-strategy-(new).json" with { type: "json" };
import wmonStrategy from "./wmon-strategy.json" with { type: "json" };

// Array of all strategy modules
const strategyModules: StrategyModule[] = [
  wethStrategy,
  wbtcStrategy,
  wmonStrategy,
  curveUsdcAusdUsdt0Strategy,
  sausdStrategy,
  mEdgeStrategy,
  curveAzndAusdStrategy,
  balancerV3NeverlandUsdcAusdUsdt0Strategy,
];

export const tokenInToTokensOut: Record<Address, Address[]> =
  createTokenInToTokensOutMap(strategyModules);

export const tokenInTokenOutToBundle: Map<
  string,
  [string, MarketActions[], number]
> = createTokenInTokenOutToBundleMap(strategyModules);
