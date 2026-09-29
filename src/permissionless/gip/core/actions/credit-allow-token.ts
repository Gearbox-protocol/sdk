import type { Address } from "viem";
import { z } from "zod";
import { iCreditConfigureActionsAbi } from "../../../../abi/310/configure/iCreditConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { CollateralToken, MarketState } from "../market-state/types.js";
import { addressSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";
import { updateCreditManagerState } from "./utils/credit-manager-state.js";

export interface AllowTokenParams {
  creditManager: Address;
  token: Address;
}

export type AllowTokenAction = BaseMarketAction<
  "CREDIT::allowToken",
  AllowTokenParams
>;

export const allowTokenActionData: MarketActionData<AllowTokenAction> = {
  type: "CREDIT::allowToken",
  description: "Allow a token to be used as collateral, if it was forbidden.",
  schema: z.object({
    creditManager: addressSchema,
    token: addressSchema,
  }),
  stateTransition: (args: {
    state: MarketState;
    params: AllowTokenParams;
  }): MarketState => {
    const { state, params } = args;

    const tokenAddress = params.token.toLowerCase() as Address;
    if (!state.assets[tokenAddress]) {
      throw new Error("Asset does not exist");
    }

    return updateCreditManagerState({
      state,
      creditManager: params.creditManager,
      update: cm => {
        const collateralToken = cm.collateralTokens[tokenAddress];
        if (!collateralToken) {
          throw new Error("Token is not a collateral token");
        }

        const updatedCollateralToken: CollateralToken = {
          ...collateralToken,
          isForbidden: false,
        };

        return {
          ...cm,
          collateralTokens: {
            ...cm.collateralTokens,
            [tokenAddress]: updatedCollateralToken,
          },
        };
      },
    });
  },
  replaceKeep: "last",
  replace: (a, b) =>
    a.creditManager.toLowerCase() === b.creditManager.toLowerCase() &&
    a.token.toLowerCase() === b.token.toLowerCase(),
  replaceCmAddress: ({ action, oldCm, newCm }) => {
    if (action.params.creditManager.toLowerCase() === oldCm.toLowerCase()) {
      return {
        ...action,
        params: {
          ...action.params,
          creditManager: newCm,
        },
      };
    }
    return action;
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const tx = mc.configureCreditManager(
      params.creditManager,
      createCallData(iCreditConfigureActionsAbi, {
        functionName: "allowToken",
        args: [params.token],
      }),
    );
    return { tx: { tx, action } };
  },
};
