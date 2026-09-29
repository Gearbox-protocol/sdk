// Import all strategy files

import type { Address } from "viem";
import type { MarketActions } from "../../../core/actions/index.js";
import {
  createTokenInTokenOutToBundleMap,
  createTokenInToTokensOutMap,
  type StrategyModule,
} from "../utils.js";
import beefyAuraOsethWethStrategyUnderlyingWeth from "./beefy-aura-oseth-weth-strategy-underlying-weth.json" with {
  type: "json",
};
import beefyAuraOsethWethStrategyUnderlyingWsteth from "./beefy-aura-oseth-weth-strategy-underlying-wsteth.json" with {
  type: "json",
};
import beefyAuraRethWethStrategyUnderlyingWeth from "./beefy-aura-reth-weth-strategy-underlying-weth.json" with {
  type: "json",
};
import beefyAuraRethWethStrategyUnderlyingWsteth from "./beefy-aura-reth-weth-strategy-underlying-wsteth.json" with {
  type: "json",
};
import beefyConvexEthPlusEthStrategyUnderlyingWeth from "./beefy-convex-eth+eth-strategy-underlying-weth.json" with {
  type: "json",
};
import beefyConvexEthPlusEthStrategyUnderlyingWsteth from "./beefy-convex-eth+eth-strategy-underlying-wsteth.json" with {
  type: "json",
};
import beefyStakedaoWbtcCbbtcHemibtcUnderlyingWbtc from "./beefy-stakedao-wbtc-cbbtc-hemibtc-underlying-wbtc.json" with {
  type: "json",
};
import cbbtcStrategyUnderlyingUsdc from "./cbbtc-strategy-underlying-usdc.json" with {
  type: "json",
};
import convexPmusdStrategyUnderlyingUsdc from "./convex-pmusd-strategy-underlying-usdc.json" with {
  type: "json",
};
import convexSavusdStrategyUnderlyingUsdc from "./convex-savusd-strategy-underlying-usdc.json" with {
  type: "json",
};
import convexStakedRlusdUsdcStrategy from "./convex-staked-rlusd-usdc-strategy.json" with {
  type: "json",
};
import convexStakedScrvusdSusdeStrategy from "./convex-staked-scrvusd-susde-strategy.json" with {
  type: "json",
};
import csusdlStrategy from "./csusdl-strategy.json" with { type: "json" };
import ethPlusStrategy from "./eth+-strategy.json" with { type: "json" };
import ezethStrategy from "./ezeth-strategy.json" with { type: "json" };
import ezethStrategyUnderlyingUsdc from "./ezeth-strategy-underlying-usdc.json" with {
  type: "json",
};
import hgethStrategyUnderlyingWeth from "./hgeth-strategy-underlying-weth.json" with {
  type: "json",
};
import liusd1wStrategyUnderlyingUsdc from "./liusd-1w-strategy-underlying-usdc.json" with {
  type: "json",
};
import mfOneStrategyUnderlyingFrxusd from "./mf-one-strategy-underlying-frxusd.json" with {
  type: "json",
};
import osethStrategyUnderlyingWeth from "./oseth-strategy-underlying-weth.json" with {
  type: "json",
};
import osethStrategyUnderlyingWsteth from "./oseth-strategy-underlying-wsteth.json" with {
  type: "json",
};
import ptDeth29Jan2026StrategyUnderlyingWeth from "./pt-deth-29jan2026-strategy-underlying-weth.json" with {
  type: "json",
};
import ptDeth29Jan2026StrategyUnderlyingWsteth from "./pt-deth-29jan2026-strategy-underlying-wsteth.json" with {
  type: "json",
};
import ptSiusdStrategyUnderlyingUsdc from "./pt-siusd-strategy-underlying-usdc.json" with {
  type: "json",
};
import pzethStrategy from "./pzeth-strategy.json" with { type: "json" };
import re7lrtStrategy from "./re7lrt-strategy.json" with { type: "json" };
import rethStrategyUnderlyingWeth from "./reth-strategy-underlying-weth.json" with {
  type: "json",
};
import rethStrategyUnderlyingWsteth from "./reth-strategy-underlying-wsteth.json" with {
  type: "json",
};
import rsethStrategy from "./rseth-strategy.json" with { type: "json" };
import rsethStrategyUnderlyingUsdc from "./rseth-strategy-underlying-usdc.json" with {
  type: "json",
};
import rsethStrategyUnderlyingWeth from "./rseth-strategy-underlying-weth.json" with {
  type: "json",
};
import rstethStrategy from "./rsteth-strategy.json" with { type: "json" };
import rstethStrategyUnderlyingWsteth from "./rsteth-strategy-underlying-wsteth.json" with {
  type: "json",
};
import stethStrategy from "./steth-strategy.json" with { type: "json" };
import susdeStrategy from "./susde-strategy.json" with { type: "json" };
import susdsStrategyUnderlyingUsdc from "./susds-strategy-underlying-usdc.json" with {
  type: "json",
};
import syrupusdcStrategyUnderlyingUsdc from "./syrupusdc-strategy-underlying-usdc.json" with {
  type: "json",
};
import tethStrategy from "./teth-strategy.json" with { type: "json" };
import usdeStrategy from "./usde-strategy.json" with { type: "json" };
import wbtcStrategyUnderlyingUsdc from "./wbtc-strategy-underlying-usdc.json" with {
  type: "json",
};
import weethStrategyUnderlyingUsdc from "./weeth-strategy-underlying-usdc.json" with {
  type: "json",
};
import wethStrategy from "./weth-strategy.json" with { type: "json" };
import wethStrategyUnderlyingWsteth from "./weth-strategy-underlying-wsteth.json" with {
  type: "json",
};
import wstethStrategy from "./wsteth-strategy.json" with { type: "json" };

// Array of all strategy modules
const strategyModules: StrategyModule[] = [
  convexStakedScrvusdSusdeStrategy,
  convexStakedRlusdUsdcStrategy,
  csusdlStrategy,
  ethPlusStrategy,
  ezethStrategy,
  pzethStrategy,
  re7lrtStrategy,
  rsethStrategy,
  rstethStrategy,
  stethStrategy,
  susdeStrategy,
  tethStrategy,
  usdeStrategy,
  wethStrategy,
  wstethStrategy,
  rstethStrategyUnderlyingWsteth,
  cbbtcStrategyUnderlyingUsdc,
  ezethStrategyUnderlyingUsdc,
  rsethStrategyUnderlyingUsdc,
  susdsStrategyUnderlyingUsdc,
  syrupusdcStrategyUnderlyingUsdc,
  wbtcStrategyUnderlyingUsdc,
  weethStrategyUnderlyingUsdc,
  hgethStrategyUnderlyingWeth,
  ptDeth29Jan2026StrategyUnderlyingWsteth,
  ptDeth29Jan2026StrategyUnderlyingWeth,
  wethStrategyUnderlyingWsteth,
  beefyConvexEthPlusEthStrategyUnderlyingWeth,
  beefyConvexEthPlusEthStrategyUnderlyingWsteth,
  beefyAuraRethWethStrategyUnderlyingWsteth,
  beefyAuraRethWethStrategyUnderlyingWeth,
  beefyAuraOsethWethStrategyUnderlyingWsteth,
  beefyAuraOsethWethStrategyUnderlyingWeth,
  osethStrategyUnderlyingWsteth,
  osethStrategyUnderlyingWeth,
  rethStrategyUnderlyingWsteth,
  rethStrategyUnderlyingWeth,
  convexSavusdStrategyUnderlyingUsdc,
  convexPmusdStrategyUnderlyingUsdc,
  rsethStrategyUnderlyingWeth,
  liusd1wStrategyUnderlyingUsdc,
  ptSiusdStrategyUnderlyingUsdc,
  beefyStakedaoWbtcCbbtcHemibtcUnderlyingWbtc,
  mfOneStrategyUnderlyingFrxusd,
];

// Automatically create mainnetBundles using the name field from each JSON
// export const mainnetBundles: Record<string, MarketActions[]> =
//   strategyModules.reduce((bundles, strategy) => {
//     bundles[strategy.name] = strategy.actions as MarketActions[];
//     return bundles;
//   }, {} as Record<string, MarketActions[]>);

export const tokenInToTokensOut: Record<Address, Address[]> =
  createTokenInToTokensOutMap(strategyModules);

export const tokenInTokenOutToBundle: Map<
  string,
  [string, MarketActions[], number]
> = createTokenInTokenOutToBundleMap(strategyModules);
