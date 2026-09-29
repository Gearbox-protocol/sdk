import type { Address } from "viem";
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
import type { CamelotV3AdapterState } from "./index.js";

export type CamelotV3PairStatus = {
  token0: Address;
  token1: Address;
  allowed: boolean;
};

export type SetPoolBatchStatusParams = AdapterActionContext & {
  pairs: CamelotV3PairStatus[];
};

export type SetPoolBatchStatusAction = BaseMarketAction<
  "ADAPTER::CAMELOT_V3_ROUTER::setPoolStatusBatch",
  SetPoolBatchStatusParams
>;

export const setPoolBatchStatusActionData: MarketActionData<
  SetPoolBatchStatusAction,
  AdapterActionContext
> = {
  type: "ADAPTER::CAMELOT_V3_ROUTER::setPoolStatusBatch",
  name: "CAMELOT_V3_ROUTER::setPoolStatusBatch",
  description: `Set pool batch status, which represents Camelot V3 pairs could be used for swaps for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
    target: addressSchema,
    version: z.literal(310),
    pairs: z.array(
      z.object({
        token0: addressSchema,
        token1: addressSchema,
        allowed: z.boolean(),
      }),
    ),
  }),
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: CamelotV3AdapterState) => ({
        ...adapter,
        pairs: [
          ...adapter.pairs,
          ...params.pairs.map(p => ({
            allowed: p.allowed,
            token0: p.token0.toLowerCase() as Address,
            token1: p.token1.toLowerCase() as Address,
          })),
        ],
      }),
    });
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const calldata = createCallData(
      adapterActionAbi["CAMELOT_V3_ROUTER"]![action.params.version],
      {
        functionName: "setPoolStatusBatch",
        args: [params.pairs.map(p => [p.token0, p.token1, p.allowed] as const)],
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
  replace: (a: SetPoolBatchStatusParams, b: SetPoolBatchStatusParams) => {
    // Two setPairBatchStatus actions for the same target and creditManager replace each other
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
