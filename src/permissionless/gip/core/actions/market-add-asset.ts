import type { Address } from "viem";
import { z } from "zod";
import { rateKeeperPlugins } from "../../plugins/rate-keepers/logic.js";
import type { MarketAsset, MarketState } from "../market-state/types.js";
import { addressSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export interface AddAssetParams {
  token: Address;
  priceFeed: Address;
}

export type AddAssetAction = BaseMarketAction<
  "MARKET::addAsset",
  AddAssetParams
>;

export const addAssetActionData: MarketActionData<AddAssetAction> = {
  type: "MARKET::addAsset",
  description: `Add a new asset to the market. Further this asset could be used as collateral in credit managers.`,
  schema: z.object({
    token: addressSchema,
    priceFeed: addressSchema,
  }),
  stateTransition: (args: {
    state: MarketState;
    params: AddAssetParams;
  }): MarketState => {
    const { state, params } = args;

    const tokenAddress = params.token.toLowerCase() as Address;
    if (tokenAddress === state.underlyingAsset.toLowerCase()) {
      throw new Error("Cannot add underlying asset");
    }
    if (state.assets[tokenAddress]) {
      throw new Error("Asset already exists");
    }

    const newAsset: MarketAsset = {
      address: tokenAddress,
      mainPriceFeed: params.priceFeed.toLowerCase() as Address,
      reservePriceFeed: "0x0000000000000000000000000000000000000000" as Address,
      quotaLimit: 0,
      quotaIncreaseFee: 0,
    };

    let currentState = {
      ...state,
      assets: {
        ...state.assets,
        [tokenAddress]: newAsset,
      },
    };

    currentState = rateKeeperPlugins[state.rateKeeper.type].onNewAsset(
      currentState,
      tokenAddress,
    );

    return currentState;
  },
  getRawTx: async ({ ctx, state, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const tx = mc.addAsset(state.address, params);
    return { tx: { tx, action } };
  },
  replace: (a: AddAssetParams, b: AddAssetParams) => {
    return a.token.toLowerCase() === b.token.toLowerCase();
  },
};
