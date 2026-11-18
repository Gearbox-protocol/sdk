import type { MarketState } from "../../../state/market/types.js";
import { updateLossPolicyState } from "../updateLossPolicyState.js";
import {
  type AliasedLossPolicyState,
  isAliasedLossPolicy,
} from "./aliasedLossPolicyPlugin.js";

/**
 * Replaces the aliased loss policy of the market (`ALIAS` or `MIDAS_ALIAS`);
 * throws for any other policy.
 **/
export function updateAliasLossPolicy(
  state: MarketState,
  update: (lossPolicy: AliasedLossPolicyState) => AliasedLossPolicyState,
): MarketState {
  if (!isAliasedLossPolicy(state.lossPolicy)) {
    throw new Error("Invalid loss policy type");
  }

  return updateLossPolicyState({ state, update });
}
