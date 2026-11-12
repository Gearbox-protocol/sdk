import type { Address } from "viem";
import type { MarketAsset, MarketState } from "../../state/market/types.js";
import { lowerAddress } from "../../utils/addressUtils.js";

/** Replaces one quoted asset of the market; throws when it was never added. **/
export function updateMarketAsset(args: {
  state: MarketState;
  token: Address;
  update: (asset: MarketAsset) => MarketAsset;
}): MarketState {
  const { state, update } = args;
  const tokenAddress = lowerAddress(args.token);
  const asset = state.assets[tokenAddress];

  if (!asset) {
    throw new Error("Asset does not exist");
  }

  return {
    ...state,
    assets: {
      ...state.assets,
      [tokenAddress]: update(asset),
    },
  };
}
