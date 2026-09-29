import type { Address } from "viem";
import { z } from "zod";
import { iCreditConfigureActionsAbi } from "../../../../abi/310/configure/iCreditConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import { addressSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";
import { updateCreditManagerState } from "./utils/credit-manager-state.js";

export interface UnpauseCreditManagerParams {
  creditManager: Address;
}

export type UnpauseCreditManagerAction = BaseMarketAction<
  "CREDIT::unpause",
  UnpauseCreditManagerParams
>;

export const unpauseCreditManagerActionData: MarketActionData<UnpauseCreditManagerAction> =
  {
    type: "CREDIT::unpause",
    description: `Unpause a credit manager. The function is used to unpause a particular credit manager.`,
    schema: z.object({
      creditManager: addressSchema,
    }),
    stateTransition: (args: {
      state: MarketState;
      params: UnpauseCreditManagerParams;
    }): MarketState => {
      const { state, params } = args;

      return updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => ({
          ...cm,
          paused: false,
        }),
      });
    },

    getRawTx: async ({ ctx, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const tx = mc.configureCreditManager(
        params.creditManager,
        createCallData(iCreditConfigureActionsAbi, {
          functionName: "unpause",
          args: [],
        }),
      );
      return { tx: { tx, action } };
    },
    replace: (a: UnpauseCreditManagerParams, b: UnpauseCreditManagerParams) => {
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
