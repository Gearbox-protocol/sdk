import { z } from "zod";
import { adapterActionAbi } from "../../../../../onchain/index.js";
import { createCallData } from "../../../../index.js";
import type {
  BaseMarketAction,
  MarketActionData,
} from "../../../core/actions/types.js";
import { addressSchema } from "../../../core/validation.js";
import type { AdapterActionContext } from "../actions.js";
import { updateAdapterState } from "../logic.js";
import type { ConvexV1BoosterAdapterState } from "./index.js";

export type UpdateSupportedPidAction = BaseMarketAction<
  "ADAPTER::CVX_V1_BOOSTER::updateSupportedPids",
  AdapterActionContext
>;

export const updateSupportedPidsActionData: MarketActionData<
  UpdateSupportedPidAction,
  AdapterActionContext
> = {
  type: "ADAPTER::CVX_V1_BOOSTER::updateSupportedPids",
  name: "ConvexBooster::updateSupportedPids",
  description: `Update supported pids and related token mappings, which represents Convex reward pools could be used for swaps for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
    version: z.literal(310),
    target: addressSchema,
  }),
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: ConvexV1BoosterAdapterState) => adapter,
    });
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const calldata = createCallData(
      adapterActionAbi["CVX_V1_BOOSTER"]![action.params.version],
      {
        functionName: "updateSupportedPids",
      },
    );
    const tx = mc.configureAdapterFor(
      params.creditManager,
      params.target,
      calldata,
    );
    return { tx: { tx, action } };
  },
  replaceKeep: "last",
  replace: (a: AdapterActionContext, b: AdapterActionContext) => {
    // Two updateSupportedPids actions for the same target and creditManager replace each other
    return (
      a.creditManager.toLowerCase() === b.creditManager.toLowerCase() &&
      a.target.toLowerCase() === b.target.toLowerCase()
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
