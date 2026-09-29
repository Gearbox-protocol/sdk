import type { Address } from "viem";
import { z } from "zod";
import { iCreditConfigureActionsAbi } from "../../../../abi/310/configure/iCreditConfigureActions.js";
import { createCallData } from "../../../index.js";
import {
  type AdapterDeployParams,
  adapterPlugins,
} from "../../plugins/adapters/logic.js";
import { adapterDeployParamsSchema } from "../../plugins/adapters/schemas.js";
import type { MarketState } from "../market-state/types.js";
import { addressSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";
import { updateCreditManagerState } from "./utils/credit-manager-state.js";

export interface AllowAdapterParams {
  creditManager: Address;
  adapter: AdapterDeployParams;
}

export type AllowAdapterAction = BaseMarketAction<
  "CREDIT::allowAdapter",
  AllowAdapterParams
>;

export const allowAdapterActionData: MarketActionData<AllowAdapterAction> = {
  type: "CREDIT::allowAdapter",
  description:
    "Allow an adapter to be used by the credit manager. Adapter allows Gearbox protocol to interact with particular protocol.",
  schema: z.object({
    creditManager: addressSchema,
    adapter: adapterDeployParamsSchema,
  }),
  stateTransition: (args: {
    state: MarketState;
    params: AllowAdapterParams;
  }): MarketState => {
    const { state, params } = args;

    const adapterState = adapterPlugins[params.adapter.type].getDeployState(
      params.adapter,
    );

    return updateCreditManagerState({
      state,
      creditManager: params.creditManager,
      update: cm => ({
        ...cm,
        adapters: {
          ...cm.adapters,
          [params.adapter.target.toLowerCase()]: adapterState,
        },
      }),
    });
  },
  replace: (a: AllowAdapterParams, b: AllowAdapterParams) => {
    return (
      a.creditManager.toLowerCase() === b.creditManager.toLowerCase() &&
      a.adapter.target.toLowerCase() === b.adapter.target.toLowerCase()
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
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const adapterDeployParams = adapterPlugins[
      params.adapter.type
    ].getDeployParams({
      creditManager: params.creditManager,
      params: params.adapter,
    });

    const tx = mc.configureCreditManager(
      params.creditManager,
      createCallData(iCreditConfigureActionsAbi, {
        functionName: "allowAdapter",
        args: [adapterDeployParams],
      }),
    );
    return { tx: { tx, action } };
  },
};
