import type { Address } from "viem";
import type { MarketSuite } from "../../../../onchain/index.js";
import { AliasLossPolicyV310Contract } from "../../../../onchain/market/loss-policy/AliasLossPolicyV310Contract.js";
import type { AccessMode } from "../../../bindings/types.js";
import type { AliasLossPolicyState } from "../../plugins/loss-policies/alias/aliasPlugin.js";
import type { LossPolicyState } from "../../plugins/loss-policies/lossPolicyPlugins.js";
import { lowerAddress } from "../../utils/addressUtils.js";

/**
 * Builds loss policy state. A policy type the SDK does not decode yields an
 * empty state.
 **/
export function buildLossPolicyState(
  marketSuite: MarketSuite,
): LossPolicyState {
  const policy = marketSuite.lossPolicy;
  if (!(policy instanceof AliasLossPolicyV310Contract)) {
    return {} as LossPolicyState;
  }
  return aliasLossPolicyState(policy);
}

function aliasLossPolicyState(
  policy: AliasLossPolicyV310Contract,
): AliasLossPolicyState {
  const aliases: Record<Address, Address> = {};
  policy.tokens.forEach((token, index) => {
    aliases[lowerAddress(token)] = policy.priceFeedParams[index].priceFeed;
  });
  return {
    aliases,
    type: "ALIAS",
    mode: policy.accessMode as AccessMode,
    enabled: policy.checksEnabled,
  };
}
