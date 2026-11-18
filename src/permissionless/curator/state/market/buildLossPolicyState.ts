import type { Address } from "viem";
import type { MarketSuite } from "../../../../onchain/index.js";
import { AliasLossPolicyV310Contract } from "../../../../onchain/market/loss-policy/AliasLossPolicyV310Contract.js";
import { LOSS_POLICY_MIDAS_ALIASED } from "../../../../onchain/market/loss-policy/constants.js";
import type { AccessMode } from "../../../bindings/types.js";
import type { AliasedLossPolicyState } from "../../plugins/loss-policies/alias/aliasedLossPolicyPlugin.js";
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

/** An aliased policy: `MIDAS_ALIAS` when deployed as the Midas variant. **/
function aliasLossPolicyState(
  policy: AliasLossPolicyV310Contract,
): AliasedLossPolicyState {
  const aliases: Record<Address, Address> = {};
  policy.tokens.forEach((token, index) => {
    aliases[lowerAddress(token)] = policy.priceFeedParams[index].priceFeed;
  });
  return {
    aliases,
    type:
      policy.contractType === LOSS_POLICY_MIDAS_ALIASED
        ? "MIDAS_ALIAS"
        : "ALIAS",
    mode: policy.accessMode as AccessMode,
    enabled: policy.checksEnabled,
  };
}
