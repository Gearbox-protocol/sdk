// Import all strategy files

import type { Address } from "viem";
import type { MarketActions } from "../../../core/actions/index.js";
import {
  createTokenInTokenOutToBundleMap,
  createTokenInToTokensOutMap,
  type StrategyModule,
} from "../utils.js";
import curveSusdeUsdt0StrategyUnderlyingUsdt0 from "./curve-susde-usdt0-strategy-underlying-usdt0.json" with {
  type: "json",
};
import curveUsdeUsdt0StrategyUnderlyingUsdt0 from "./curve-usde-usdt0-strategy-underlying-usdt0.json" with {
  type: "json",
};
import lpSyrupusdt29jan2026UnderlyingUsdt0 from "./lp-syrupusdt-29jan2026-underlying-usdt0.json" with {
  type: "json",
};
import ptSusdai19mar2026UnderlyingUsdt0 from "./pt-susdai-19mar2026-underlying-usdt0.json" with {
  type: "json",
};
import ptSusde15jan2026UnderlyingUsdt0 from "./pt-susde-15jan2026-underlying-usdt0.json" with {
  type: "json",
};
import ptSyrupusdt29jan2026UnderlyingUsdt0 from "./pt-syrupusdt-29jan2026-underlying-usdt0.json" with {
  type: "json",
};
import ptUsdai19mar2026UnderlyingUsdt0 from "./pt-usdai-19mar2026-underlying-usdt0.json" with {
  type: "json",
};
import ptUsde15jan2026UnderlyingUsdt0 from "./pt-usde-15jan2026-new-underlying-usdt0.json" with {
  type: "json",
};
// import mhyperStrategyUnderlyingUsdt0 from "./mhyper-strategy-underlying-usdt0.json" with { type: "json" };
import savusdStrategyUnderlyingUsdt0 from "./savusd-strategy-underlying-usdt0.json" with {
  type: "json",
};
import susdaiStrategyUnderlyingUsdt0 from "./susdai-strategy-underlying-usdt0.json" with {
  type: "json",
};
import susdeStrategyUnderlyingUsdt0 from "./susde-strategy-underlying-usdt0.json" with {
  type: "json",
};
import syrupusdtStrategyUnderlyingUsdt0 from "./syrupusdt-strategy-underlying-usdt0.json" with {
  type: "json",
};
import syzusdStrategyUnderlyingUsdt0 from "./syzusd-strategy-underlying-usdt0.json" with {
  type: "json",
};
import xusdStrategyUnderlyingUsdt0 from "./xusd-strategy-underlying-usdt0.json" with {
  type: "json",
};

// Array of all strategy modules
const strategyModules: StrategyModule[] = [
  curveSusdeUsdt0StrategyUnderlyingUsdt0,
  curveUsdeUsdt0StrategyUnderlyingUsdt0,
  ptSusdai19mar2026UnderlyingUsdt0,
  ptSusde15jan2026UnderlyingUsdt0,
  ptSyrupusdt29jan2026UnderlyingUsdt0,
  ptUsdai19mar2026UnderlyingUsdt0,
  ptUsde15jan2026UnderlyingUsdt0,
  susdaiStrategyUnderlyingUsdt0,
  susdeStrategyUnderlyingUsdt0,
  syrupusdtStrategyUnderlyingUsdt0,
  xusdStrategyUnderlyingUsdt0,
  savusdStrategyUnderlyingUsdt0,
  syzusdStrategyUnderlyingUsdt0,
  lpSyrupusdt29jan2026UnderlyingUsdt0,
];

export const tokenInToTokensOut: Record<Address, Address[]> =
  createTokenInToTokensOutMap(strategyModules);

export const tokenInTokenOutToBundle: Map<
  string,
  [string, MarketActions[], number]
> = createTokenInTokenOutToBundleMap(strategyModules);
