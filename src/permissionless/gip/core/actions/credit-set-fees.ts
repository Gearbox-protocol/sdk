import type { Address } from "viem";
import { z } from "zod";
import { iCreditConfigureActionsAbi } from "../../../../abi/310/configure/iCreditConfigureActions.js";
import { convertPercent, createCallData } from "../../../index.js";
import type { CreditManagerFees, MarketState } from "../market-state/types.js";
import { addressSchema, percentageSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";
import { updateCreditManagerState } from "./utils/credit-manager-state.js";

export interface SetFeesParams {
  creditManager: Address;
  params: CreditManagerFees;
}

export type SetFeesAction = BaseMarketAction<"CREDIT::setFees", SetFeesParams>;

export const setFeesActionData: MarketActionData<SetFeesAction> = {
  type: "CREDIT::setFees",
  description: `Set fees for a credit manager. The function set liquidation fees (paid for LPs) and liquidation premium (paid for liquidators).`,
  schema: z.object({
    creditManager: addressSchema,
    params: z.object({
      feeLiquidation: percentageSchema,
      feeLiquidationExpired: percentageSchema,
      feeLiquidationPremium: percentageSchema,
      feeLiquidationPremiumExpired: percentageSchema,
    }),
  }),
  stateTransition: (args: {
    state: MarketState;
    params: SetFeesParams;
  }): MarketState => {
    const { state, params } = args;
    return updateCreditManagerState({
      state,
      creditManager: params.creditManager,
      update: cm => ({
        ...cm,
        ...params.params,
      }),
    });
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const tx = mc.configureCreditManager(
      params.creditManager,
      createCallData(iCreditConfigureActionsAbi, {
        functionName: "setFees",
        args: [
          convertPercent(params.params.feeLiquidation),
          convertPercent(params.params.feeLiquidationPremium),
          convertPercent(params.params.feeLiquidationExpired),
          convertPercent(params.params.feeLiquidationPremiumExpired),
        ],
      }),
    );
    return { tx: { tx, action } };
  },
  replace: (a: SetFeesParams, b: SetFeesParams) => {
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
