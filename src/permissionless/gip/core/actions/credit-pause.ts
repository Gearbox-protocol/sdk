import type { Address } from "viem";
import { z } from "zod";
import { iCreditConfigureActionsAbi } from "../../../../abi/310/configure/iCreditConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import { addressSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";
import { updateCreditManagerState } from "./utils/credit-manager-state.js";

export interface PauseCreditManagerParams {
  creditManager: Address;
}

export type PauseCreditManagerAction = BaseMarketAction<
  "CREDIT::pause",
  PauseCreditManagerParams
>;

export const pauseCreditManagerActionData: MarketActionData<PauseCreditManagerAction> =
  {
    type: "CREDIT::pause",
    description:
      "Pause a credit manager. It gets a credit manager address as parameter.",
    schema: z.object({
      creditManager: addressSchema,
    }),
    stateTransition: (args: {
      state: MarketState;
      params: PauseCreditManagerParams;
    }): MarketState => {
      const { state, params } = args;

      return updateCreditManagerState({
        state,
        creditManager: params.creditManager,
        update: cm => ({
          ...cm,
          paused: true,
        }),
      });
    },
    getRawTx: async ({ ctx, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const tx = mc.configureCreditManager(
        params.creditManager,
        createCallData(iCreditConfigureActionsAbi, {
          functionName: "pause",
          args: [],
        }),
      );
      return { tx: { tx, action } };
    },
    replace: (a: PauseCreditManagerParams, b: PauseCreditManagerParams) => {
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
