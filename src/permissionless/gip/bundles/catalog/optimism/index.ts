import type { Address } from "viem";
import type { MarketActions } from "../../../core/actions/index.js";
import {
  createTokenInTokenOutToBundleMap,
  createTokenInToTokensOutMap,
  type StrategyModule,
} from "../utils.js";
import opStrategy from "./op-strategy-(new).json" with { type: "json" };
// Import all strategy files
import rethStrategy from "./reth-strategy.json" with { type: "json" };
import wbtcStrategy from "./wbtc-strategy.json" with { type: "json" };
import wethStrategy from "./weth-strategy.json" with { type: "json" };
import wstethStrategy from "./wsteth-strategy.json" with { type: "json" };

// Array of all strategy modules
const strategyModules: StrategyModule[] = [
  rethStrategy,
  wbtcStrategy,
  wethStrategy,
  wstethStrategy,
  opStrategy,
];

export const tokenInToTokensOut: Record<Address, Address[]> =
  createTokenInToTokensOutMap(strategyModules);

export const tokenInTokenOutToBundle: Map<
  string,
  [string, MarketActions[], number]
> = createTokenInTokenOutToBundleMap(strategyModules);
