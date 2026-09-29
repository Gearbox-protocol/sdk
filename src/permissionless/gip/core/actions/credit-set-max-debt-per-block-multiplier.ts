import type { Address } from "viem";
import { z } from "zod";
import { iCreditConfigureActionsAbi } from "../../../../abi/310/configure/iCreditConfigureActions.js";
import { createCallData } from "../../../index.js";
import { CollateralToken, type MarketState } from "../market-state/types.js";
import { addressSchema, numberSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";
import { updateCreditManagerState } from "./utils/credit-manager-state.js";

export interface SetMaxDebtPerBlockMultiplierParams {
  creditManager: Address;
  maxDebtPerBlockMultiplier: number;
}

export type SetMaxDebtPerBlockMultiplierAction = BaseMarketAction<
  "CREDIT::setMaxDebtPerBlockMultiplier",
  SetMaxDebtPerBlockMultiplierParams
>;

export const setMaxDebtPerBlockMultiplierActionData: MarketActionData<SetMaxDebtPerBlockMultiplierAction> =
  {
    type: "CREDIT::setMaxDebtPerBlockMultiplier",
    description: `Set max debt per block multiplier for a credit manager. The function is used to set max debt per block multiplier for a particular credit manager.`,
    schema: z.object({
      creditManager: addressSchema,
      maxDebtPerBlockMultiplier: numberSchema,
    }),
    stateTransition: (args: {
      state: MarketState;
      params: SetMaxDebtPerBlockMultiplierParams;
    }): MarketState => {
      const { state, params } = args;

      return updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => {
          return {
            ...cm,
            maxDebtPerBlockMultiplier: params.maxDebtPerBlockMultiplier,
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
          functionName: "setMaxDebtPerBlockMultiplier",
          args: [params.maxDebtPerBlockMultiplier],
        }),
      );
      return { tx: { tx, action } };
    },
    replaceKeep: "last",
    replace: (a, b) =>
      a.creditManager.toLowerCase() === b.creditManager.toLowerCase(),
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
