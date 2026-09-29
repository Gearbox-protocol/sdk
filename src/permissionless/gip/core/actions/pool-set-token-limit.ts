import type { Address } from "viem";
import { z } from "zod";
import { iPoolConfigureActionsAbi } from "../../../../abi/310/configure/iPoolConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import { addressSchema, numberSchema } from "../validation.js";
import { convertTokenAmount } from "./context.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export interface SetTokenLimitContext {
  token: Address;
}
export interface SetTokenLimitParams extends SetTokenLimitContext {
  limit: number;
}

export type SetTokenLimitAction = BaseMarketAction<
  "POOL::setTokenLimit",
  SetTokenLimitParams
>;

export const setTokenLimitActionData: MarketActionData<
  SetTokenLimitAction,
  SetTokenLimitContext
> = {
  type: "POOL::setTokenLimit",
  description: `Set token limit.
The function is used to set max possible amount of a particular token that could be used as collateral across whole market.`,
  schema: z.object({
    token: addressSchema,
    limit: numberSchema,
  }),
  stateTransition: (args: {
    state: MarketState;
    params: SetTokenLimitParams;
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
          quotaLimit: params.limit,
        },
      },
    };
  },
  replace: (a: SetTokenLimitParams, b: SetTokenLimitParams) => {
    return a.token.toLowerCase() === b.token.toLowerCase();
  },

  getRawTx: async ({ ctx, state, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const limit = convertTokenAmount({
      tokens: ctx.tokens,
      token: state.underlyingAsset,
      amount: params.limit,
    });

    const tx = mc.configurePool(
      state.address,
      createCallData(iPoolConfigureActionsAbi, {
        functionName: "setTokenLimit",
        args: [params.token, limit],
      }),
    );

    return { tx: { tx, action } };
  },
};
