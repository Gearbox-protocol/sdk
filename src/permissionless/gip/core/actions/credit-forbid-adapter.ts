import type { Address } from "viem";
import { z } from "zod";
import { iCreditConfigureActionsAbi } from "../../../../abi/310/configure/iCreditConfigureActions.js";
import { createCallData } from "../../../index.js";
import type { MarketState } from "../market-state/types.js";
import { addressSchema } from "../validation.js";
import type { BaseMarketAction, MarketActionData } from "./types.js";
import { updateCreditManagerState } from "./utils/credit-manager-state.js";

export interface ForbidAdapterParams {
  creditManager: Address;
  adapter: Address;
}

export type ForbidAdapterAction = BaseMarketAction<
  "CREDIT::forbidAdapter",
  ForbidAdapterParams
>;

export const forbidAdapterActionData: MarketActionData<ForbidAdapterAction> = {
  type: "CREDIT::forbidAdapter",
  description: `Forbid an adapter to be used by the credit manager. The reason to use the function is to prevent Gearbox protocol from interacting
with a particular protocol, if protocol is got hacked or has other risk issues.`,
  schema: z.object({
    creditManager: addressSchema,
    adapter: addressSchema,
  }),
  stateTransition: (args: {
    state: MarketState;
    params: ForbidAdapterParams;
  }): MarketState => {
    const { state, params } = args;

    const adapterAddress = params.adapter.toLowerCase() as Address;

    return updateCreditManagerState({
      state,
      creditManager: params.creditManager,
      update: cm => {
        const adapter = Object.values(cm.adapters).find(
          adapterState => adapterState.adapter.toLowerCase() === adapterAddress,
        );

        if (!adapter) {
          throw new Error("Adapter is not allowed");
        }

        const newAdapters = { ...cm.adapters };
        delete newAdapters[adapter.target.toLowerCase() as Address];

        return {
          ...cm,
          adapters: newAdapters,
        };
      },
    });
  },
  replace: (a: ForbidAdapterParams, b: ForbidAdapterParams) => {
    return (
      a.creditManager.toLowerCase() === b.creditManager.toLowerCase() &&
      a.adapter.toLowerCase() === b.adapter.toLowerCase()
    );
  },
  replaceCmAddress: ({ action, oldCm }) => {
    // @dev forbid adapter action can't appear in same gip with cm creation
    if (action.params.creditManager.toLowerCase() === oldCm.toLowerCase()) {
      throw new Error("Unable to forbid adapter");
    }
    return action;
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const tx = mc.configureCreditManager(
      params.creditManager,
      createCallData(iCreditConfigureActionsAbi, {
        functionName: "forbidAdapter",
        args: [params.adapter],
      }),
    );
    return { tx: { tx, action } };
  },
};
