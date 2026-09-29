import type { Address } from "viem";
import { z } from "zod";
import { iCreditConfigureActionsAbi } from "../../../../abi/310/configure/iCreditConfigureActions.js";
import { convertPercent, createCallData } from "../../../index.js";
import type { CollateralToken, MarketState } from "../market-state/types.js";
import { addressSchema, percentageSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";
import { updateCreditManagerState } from "./utils/credit-manager-state.js";

export type AddCollateralTokenContext = {
  creditManager: Address;
  token: Address;
};

export interface AddCollateralTokenParams extends AddCollateralTokenContext {
  liquidationThreshold: number;
}

export type AddCollateralTokenAction = BaseMarketAction<
  "CREDIT::addCollateralToken",
  AddCollateralTokenParams
>;

export const addCollateralTokenActionData: MarketActionData<
  AddCollateralTokenAction,
  AddCollateralTokenContext
> = {
  type: "CREDIT::addCollateralToken",
  description:
    "Add a collateral token to the credit manager. It gets a liquidation threshold as parameter.",
  schema: z.object({
    creditManager: addressSchema,
    token: addressSchema,
    liquidationThreshold: percentageSchema,
  }),
  stateTransition: (args: {
    state: MarketState;
    params: AddCollateralTokenParams;
  }): MarketState => {
    const { state, params } = args;
    const tokenAddress = params.token.toLowerCase() as Address;

    if (!state.assets[tokenAddress]) {
      throw new Error(`Asset ${tokenAddress} does not exist`);
    }

    return updateCreditManagerState({
      state,
      creditManager: params.creditManager,
      update: cm => {
        const collateralToken = cm.collateralTokens[tokenAddress];
        if (collateralToken) {
          throw new Error("Token already added as collateral");
        }

        const updatedCollateralToken: CollateralToken = {
          liquidationThresholdFinal: params.liquidationThreshold,
          rampStart: 0,
          rampDuration: 0,
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
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const tx = mc.configureCreditManager(
      params.creditManager,
      createCallData(iCreditConfigureActionsAbi, {
        functionName: "addCollateralToken",
        args: [params.token, convertPercent(params.liquidationThreshold)],
      }),
    );
    return { tx: { tx, action } };
  },
  replace: (a: AddCollateralTokenParams, b: AddCollateralTokenParams) => {
    return (
      a.creditManager.toLowerCase() === b.creditManager.toLowerCase() &&
      a.token.toLowerCase() === b.token.toLowerCase()
    );
  },
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
};
