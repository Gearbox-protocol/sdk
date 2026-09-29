import type { Address } from "viem";
import { z } from "zod";
import { iCreditConfigureActionsAbi } from "../../../../abi/310/configure/iCreditConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { CollateralToken, MarketState } from "../market-state/types.js";
import {
  addressSchema,
  numberSchema,
  percentageSchema,
} from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";
import { updateCreditManagerState } from "./utils/credit-manager-state.js";

export type RampLiquidationThresholdContext = {
  creditManager: Address;
  token: Address;
};

export interface RampLiquidationThresholdParams
  extends RampLiquidationThresholdContext {
  liquidationThresholdFinal: number;
  rampStart: number;
  rampDuration: number;
}

export type RampLiquidationThresholdAction = BaseMarketAction<
  "CREDIT::rampLiquidationThreshold",
  RampLiquidationThresholdParams
>;

export const rampLiquidationThresholdActionData: MarketActionData<
  RampLiquidationThresholdAction,
  RampLiquidationThresholdContext
> = {
  type: "CREDIT::rampLiquidationThreshold",
  description: `Ramp liquidation threshold for a collateral token. The function is used to change liquidation threshold f
or a particular collateral token during the time.`,
  schema: z.object({
    creditManager: addressSchema,
    token: addressSchema,
    liquidationThresholdFinal: percentageSchema,
    rampStart: numberSchema,
    rampDuration: numberSchema,
  }),
  stateTransition: (args: {
    state: MarketState;
    params: RampLiquidationThresholdParams;
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
          liquidationThresholdFinal: params.liquidationThresholdFinal,
          rampStart: params.rampStart,
          rampDuration: params.rampDuration,
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
        functionName: "rampLiquidationThreshold",
        args: [
          params.token,
          Math.floor(params.liquidationThresholdFinal * 100),
          params.rampStart,
          params.rampDuration,
        ],
      }),
    );
    return { tx: { tx, action } };
  },
  replace: (
    a: RampLiquidationThresholdParams,
    b: RampLiquidationThresholdParams,
  ) => {
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
