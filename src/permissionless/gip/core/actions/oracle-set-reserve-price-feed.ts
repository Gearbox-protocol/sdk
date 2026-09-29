import type { Address } from "viem";
import { z } from "zod";
import { iPriceOracleConfigureActionsAbi } from "../../../../abi/310/configure/iPriceOracleConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import { addressSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export interface SetReservePriceFeedParams {
  token: Address;
  priceFeed: Address;
}

export type SetReservePriceFeedAction = BaseMarketAction<
  "ORACLE::setReservePriceFeed",
  SetReservePriceFeedParams
>;

export const setReservePriceFeedActionData: MarketActionData<SetReservePriceFeedAction> =
  {
    type: "ORACLE::setReservePriceFeed",
    description: `Set reserve price feed for a token. Reserve price feed is used to calculate price of a token during total
collateral computation. The final price for such computation is a minimum between main price feed and reserve price feed.`,
    schema: z.object({
      token: addressSchema,
      priceFeed: addressSchema,
    }),
    stateTransition: (args: {
      state: MarketState;
      params: SetReservePriceFeedParams;
    }): MarketState => {
      const { state, params } = args;
      const tokenAddress = params.token.toLowerCase() as Address;

      if (!state.assets[tokenAddress]) {
        throw new Error("Asset does not exist");
      }

      return {
        ...state,
        assets: {
          ...state.assets,
          [tokenAddress]: {
            ...state.assets[tokenAddress],
            reservePriceFeed: params.priceFeed.toLowerCase() as Address,
          },
        },
      };
    },
    replace: (a: SetReservePriceFeedParams, b: SetReservePriceFeedParams) => {
      return a.token.toLowerCase() === b.token.toLowerCase();
    },

    getRawTx: async ({ ctx, state, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const tx = mc.configurePriceOracle(
        state.address,
        createCallData(iPriceOracleConfigureActionsAbi, {
          functionName: "setReservePriceFeed",
          args: [params.token, params.priceFeed],
        }),
      );
      return { tx: { tx, action } };
    },
  };
