import type { MarketState } from "../../../state/market/types.js";
import { updateLossPolicyState } from "../updateLossPolicyState.js";
import type { AliasLossPolicyState } from "./aliasPlugin.js";

/** Replaces the alias loss policy of the market; throws for any other policy. **/
export function updateAliasLossPolicy(
  state: MarketState,
  update: (lossPolicy: AliasLossPolicyState) => AliasLossPolicyState,
): MarketState {
  if (!state.lossPolicy) {
    throw new Error("Loss policy not configured");
  }
  if (state.lossPolicy.type !== "ALIAS") {
    throw new Error("Invalid loss policy type");
  }

  return updateLossPolicyState({ state, update });
}
