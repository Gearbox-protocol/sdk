import type { Address } from "viem";
import type { MarketState } from "../../../state/market/types.js";
import { lowerAddress } from "../../../utils/addressUtils.js";
import { updateRateKeeperState } from "../updateRateKeeperState.js";
import type { GaugeRateKeeperState } from "./gaugePlugin.js";

/** Changes one bound of a token's quota rate range and keeps the other. **/
export function updateQuotaRate(
  state: MarketState,
  token: Address,
  bound: { minRate: number } | { maxRate: number },
): MarketState {
  const tokenAddress = lowerAddress(token);
  return updateRateKeeperState({
    state,
    update: (rateKeeper: GaugeRateKeeperState) => ({
      ...rateKeeper,
      rates: {
        ...rateKeeper.rates,
        [tokenAddress]: { ...rateKeeper.rates[tokenAddress], ...bound },
      },
    }),
  });
}
