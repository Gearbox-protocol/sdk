/**
 * State updates for loss policies. Kept apart from `lossPolicyPlugins.ts` so that the loss
 * policy plugins and their actions can import it without a circular dependency.
 **/
import type { MarketState } from "../../state/market/types.js";
import type { LossPolicyState } from "./lossPolicyPlugins.js";

/** Replaces the loss policy of the market. **/
export function updateLossPolicyState<T extends LossPolicyState>(args: {
  state: MarketState;
  update: (state: T) => T;
}): MarketState {
  const { state, update } = args;

  if (!state.lossPolicy) {
    throw new Error("Loss policy not configured");
  }

  return {
    ...state,
    lossPolicy: update(state.lossPolicy as T),
  };
}
