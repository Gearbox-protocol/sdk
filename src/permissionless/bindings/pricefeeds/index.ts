import type { PriceFeedSetupParams } from "../../core/index.js";
import { balancerStablePriceFeed } from "./balancer-stable.js";
import { balancerWeightedPriceFeed } from "./balancer-weighted.js";
import { boundedPriceFeed } from "./bounded.js";
import { compositePriceFeed } from "./composite.js";
import { constantPriceFeed } from "./constant.js";
import { curveCryptoPriceFeed } from "./curve-crypto.js";
import { curveStablePriceFeed } from "./curve-stable.js";
import { curveTwapPriceFeed } from "./curve-twap.js";
import { curveUsdPriceFeed } from "./curve-usd.js";
import { erc4626PriceFeed } from "./erc4626.js";
import { externalPriceFeed } from "./external.js";
import { kodiakPriceFeed } from "./kodiak.js";
import { mellowLrtPriceFeed } from "./mellow-lrt.js";
import { pendlePtTwapPriceFeed } from "./pendle-pt-twap.js";
import { pythPriceFeed } from "./pyth.js";
import { redstonePriceFeed } from "./redstone.js";
import { wstethPriceFeed } from "./wsteth.js";

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
