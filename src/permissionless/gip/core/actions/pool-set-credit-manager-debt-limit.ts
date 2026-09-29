import type { Address } from "viem";
import { z } from "zod";
import { iPoolConfigureActionsAbi } from "../../../../abi/310/configure/iPoolConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import { addressSchema, numberSchema } from "../validation.js";
import { convertTokenAmount } from "./context.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";

export interface SetCreditManagerDebtLimitParams {
  creditManager: Address;
  limit: number;
}

export type SetCreditManagerDebtLimitAction = BaseMarketAction<
  "POOL::setCreditManagerDebtLimit",
  SetCreditManagerDebtLimitParams
>;

export const setCreditManagerDebtLimitActionData: MarketActionData<SetCreditManagerDebtLimitAction> =
  {
    type: "POOL::setCreditManagerDebtLimit",
    description: `Set debt limit for a credit manager. The function is used to set max possible debt for a particular credit manager.`,
    schema: z.object({
      creditManager: addressSchema,
      limit: numberSchema,
    }),
    stateTransition: (args: {
      state: MarketState;
      params: SetCreditManagerDebtLimitParams;
    }): MarketState => {
      const { state, params } = args;
      const cmAddress = params.creditManager.toLowerCase() as Address;

      if (state.creditManagers[cmAddress] === undefined) {
        throw new Error("Credit manager does not exist");
      }

      return {
        ...state,
        creditManagerDebtLimit: {
          ...state.creditManagerDebtLimit,
          [cmAddress]: params.limit,
        },
      };
    },
    replace: (
      a: SetCreditManagerDebtLimitParams,
      b: SetCreditManagerDebtLimitParams,
    ) => {
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
    getRawTx: async ({ ctx, state, action }) => {
      const mc = ctx.marketConfigurator;
      const { params } = action;
      const tx = mc.configurePool(
        state.address,
        createCallData(iPoolConfigureActionsAbi, {
          functionName: "setCreditManagerDebtLimit",
          args: [
            params.creditManager,
            convertTokenAmount({
              tokens: ctx.tokens,
              token: state.underlyingAsset,
              amount: params.limit,
            }),
          ],
        }),
      );
      return { tx: { tx, action } };
    },
  };
