/**
 * State updates for rate keepers. Kept apart from `rateKeeperPlugins.ts` so that the rate
 * keeper plugins and their actions can import it without a circular dependency.
 **/
import type { MarketState } from "../../state/market/types.js";
import type { RateKeeperState } from "./rateKeeperPlugins.js";

/** Replaces the rate keeper of the market. **/
export function updateRateKeeperState<T extends RateKeeperState>(args: {
  state: MarketState;
  update: (state: T) => T;
}): MarketState {
  const { state, update } = args;

  if (!state.rateKeeper) {
    throw new Error("Rate keeper not found");
  }

  return {
    ...state,
    rateKeeper: update(state.rateKeeper as T),
  };
}
