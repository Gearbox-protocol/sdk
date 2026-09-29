import type { Address } from "viem";
import { z } from "zod";
import { iPoolConfigureActionsAbi } from "../../../../abi/310/configure/iPoolConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import { addressSchema, percentageSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export interface SetTokenQuotaIncreaseFeeParams {
  token: Address;
  fee: number; // This is a percentage
}

export type SetTokenQuotaIncreaseFeeAction = BaseMarketAction<
  "POOL::setTokenQuotaIncreaseFee",
  SetTokenQuotaIncreaseFeeParams
>;

export const setTokenQuotaIncreaseFeeAction: MarketActionData<SetTokenQuotaIncreaseFeeAction> =
  {
    type: "POOL::setTokenQuotaIncreaseFee",
    description: `Set quota increase fee for a token. The function is used to set fee for a particular token that is paid when
    user increases quota of a credit manager.`,
    schema: z.object({
      token: addressSchema,
      fee: percentageSchema,
    }),
    stateTransition: (args: {
      state: MarketState;
      params: SetTokenQuotaIncreaseFeeParams;
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
            quotaIncreaseFee: params.fee,
          },
        },
      };
    },
    replace: (
      a: SetTokenQuotaIncreaseFeeParams,
      b: SetTokenQuotaIncreaseFeeParams,
    ) => {
      return a.token.toLowerCase() === b.token.toLowerCase();
    },

    getRawTx: async ({ ctx, state, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const tx = mc.configurePool(
        state.address,
        createCallData(iPoolConfigureActionsAbi, {
          functionName: "setTokenQuotaIncreaseFee",
          args: [params.token, Math.floor(params.fee * 100)], // Convert to basis points
        }),
      );

      return { tx: { tx, action } };
    },
  };
