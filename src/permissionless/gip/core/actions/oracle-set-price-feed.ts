import type { Address } from "viem";
import { z } from "zod";
import { iPriceOracleConfigureActionsAbi } from "../../../../abi/310/configure/iPriceOracleConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import { addressSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export interface SetPriceFeedParams {
  token: Address;
  priceFeed: Address;
}

export type SetPriceFeedAction = BaseMarketAction<
  "ORACLE::setPriceFeed",
  SetPriceFeedParams
>;

export const setPriceFeedActionData: MarketActionData<SetPriceFeedAction> = {
  type: "ORACLE::setPriceFeed",
  description: `Set price feed for a token. Price feed is used to calculate price of a token during total collateral computation.
It's also used to calculate price of a token during liquidation.`,
  schema: z.object({
    token: addressSchema,
    priceFeed: addressSchema,
  }),
  stateTransition: (args: {
    state: MarketState;
    params: SetPriceFeedParams;
  }): MarketState => {
    const { state, params } = args;
    const tokenAddress = params.token.toLowerCase() as Address;

    if (tokenAddress === state.underlyingAsset.toLowerCase())
      return {
        ...state,
        underlyingPriceFeed: params.priceFeed.toLowerCase() as Address,
      };

    if (!state.assets[tokenAddress]) {
      throw new Error("Asset does not exist");
    }

    return {
      ...state,
      assets: {
        ...state.assets,
        [tokenAddress]: {
          ...state.assets[tokenAddress],
          mainPriceFeed: params.priceFeed.toLowerCase() as Address,
        },
      },
    };
  },
  getRawTx: async ({ ctx, state, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const tx = mc.configurePriceOracle(
      state.address,
      createCallData(iPriceOracleConfigureActionsAbi, {
        functionName: "setPriceFeed",
        args: [params.token, params.priceFeed],
      }),
    );
    return { tx: { tx, action } };
  },
  replace: (a: SetPriceFeedParams, b: SetPriceFeedParams) => {
    return a.token.toLowerCase() === b.token.toLowerCase();
  },
};
