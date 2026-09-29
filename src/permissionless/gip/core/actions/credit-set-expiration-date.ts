import type { Address } from "viem";
import { z } from "zod";
import { iCreditConfigureActionsAbi } from "../../../../abi/310/configure/iCreditConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import { addressSchema, numberSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";
import { updateCreditManagerState } from "./utils/credit-manager-state.js";

export interface SetExpirationDateParams {
  creditManager: Address;
  expirationDate: number;
}

export type SetExpirationDateAction = BaseMarketAction<
  "CREDIT::setExpirationDate",
  SetExpirationDateParams
>;

export const setExpirationDateActionData: MarketActionData<SetExpirationDateAction> =
  {
    type: "CREDIT::setExpirationDate",
    description: `Set expiration date for a credit manager. The function is used to set expiration date
for a particular credit manager. After expiration date is reached, all related credit accounts could be liquidated with
paying feeLiquidationExpired and feeLiquidationPremiumExpired.`,
    schema: z.object({
      creditManager: addressSchema,
      expirationDate: numberSchema,
    }),
    stateTransition: (args: {
      state: MarketState;
      params: SetExpirationDateParams;
    }): MarketState => {
      const { state, params } = args;

      return updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => ({
          ...cm,
          expirationDate: params.expirationDate,
        }),
      });
    },
    getRawTx: async ({ ctx, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const tx = mc.configureCreditManager(
        params.creditManager,
        createCallData(iCreditConfigureActionsAbi, {
          functionName: "setExpirationDate",
          args: [params.expirationDate],
        }),
      );
      return { tx: { tx, action } };
    },
    replace: (a: SetExpirationDateParams, b: SetExpirationDateParams) => {
      return a.creditManager.toLowerCase() === b.creditManager.toLowerCase();
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
