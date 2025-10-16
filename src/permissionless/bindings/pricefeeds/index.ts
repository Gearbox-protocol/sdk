import type { PriceFeedSetupParams } from "../../core";
import { balancerStablePriceFeed } from "./balancer-stable";
import { balancerWeightedPriceFeed } from "./balancer-weighted";
import { boundedPriceFeed } from "./bounded";
import { compositePriceFeed } from "./composite";
import { constantPriceFeed } from "./constant";
import { curveCryptoPriceFeed } from "./curve-crypto";
import { curveStablePriceFeed } from "./curve-stable";
import { curveTwapPriceFeed } from "./curve-twap";
import { curveUsdPriceFeed } from "./curve-usd";
import { erc4626PriceFeed } from "./erc4626";
import { externalPriceFeed } from "./external";
import { kodiakPriceFeed } from "./kodiak";
import { mellowLrtPriceFeed } from "./mellow-lrt";
import { pendlePtTwapPriceFeed } from "./pendle-pt-twap";
import { pythPriceFeed } from "./pyth";
import { redstonePriceFeed } from "./redstone";
import { wstethPriceFeed } from "./wsteth";

export const priceFeedSetupParams: PriceFeedSetupParams[] = [
  externalPriceFeed,
  compositePriceFeed,
  boundedPriceFeed,
  constantPriceFeed,
  redstonePriceFeed,
  pythPriceFeed,
  erc4626PriceFeed,
  curveCryptoPriceFeed,
  curveStablePriceFeed,
  curveUsdPriceFeed,
  curveTwapPriceFeed,
  mellowLrtPriceFeed,
  pendlePtTwapPriceFeed,
  kodiakPriceFeed,
  balancerStablePriceFeed,
  balancerWeightedPriceFeed,
  wstethPriceFeed,
];
