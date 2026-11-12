import { gami10ClaimFees } from "./gips/gami10ClaimFees.js";
import { kpk20LossPolicyAliases } from "./gips/kpk20LossPolicyAliases.js";
import { kpk57SwapBalancerAdapters } from "./gips/kpk57SwapBalancerAdapters.js";
import { kpk96WethIrm } from "./gips/kpk96WethIrm.js";
import { kpk101RethOracleSwap } from "./gips/kpk101RethOracleSwap.js";
import { kpk107RemoveEmergencyLiquidator } from "./gips/kpk107RemoveEmergencyLiquidator.js";
import { kpk116FrxusdMarket } from "./gips/kpk116FrxusdMarket.js";
import { kpk117FrxusdMfOneAssets } from "./gips/kpk117FrxusdMfOneAssets.js";
import { kpk127MglobalStrategy } from "./gips/kpk127MglobalStrategy.js";
import type { GipReproduction } from "./types.js";

/**
 * GIPs executed on mainnet, written against the curator API: interest rate
 * models and price feeds, loss policy aliases across two markets, adapter
 * swaps, a new market with its credit suite, a whitelisted strategy with 35
 * calls, a treasury distribution and a configurator GIP. In execution order.
 **/
export const executedGips: readonly GipReproduction[] = [
  kpk20LossPolicyAliases,
  kpk57SwapBalancerAdapters,
  kpk96WethIrm,
  kpk101RethOracleSwap,
  kpk107RemoveEmergencyLiquidator,
  kpk116FrxusdMarket,
  kpk117FrxusdMfOneAssets,
  kpk127MglobalStrategy,
  gami10ClaimFees,
];
