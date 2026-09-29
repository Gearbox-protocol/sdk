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
import type { VelodromeV2AdapterState } from "./index.js";

export type VelodromeV2PairStatus = {
  token0: Address;
  token1: Address;
  factory: Address;
  stable: boolean;
  allowed: boolean;
};

export type SetPoolBatchStatusParams = AdapterActionContext & {
  pairs: VelodromeV2PairStatus[];
};

export type SetPoolBatchStatusAction = BaseMarketAction<
  "ADAPTER::VELODROME_V2_ROUTER::setPoolBatchStatus",
  SetPoolBatchStatusParams
>;

export const setPoolBatchStatusActionData: MarketActionData<
  SetPoolBatchStatusAction,
  AdapterActionContext
> = {
  type: "ADAPTER::VELODROME_V2_ROUTER::setPoolBatchStatus",
  name: "VelodromeV2::setPoolBatchStatus",
  description: `Set pool batch status, which represents Velodrome V2 pairs could be used for swaps for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
    version: z.literal(310),
    target: addressSchema,
    pairs: z.array(
      z.object({
        token0: addressSchema,
        token1: addressSchema,
        factory: addressSchema,
        stable: z.boolean(),
        allowed: z.boolean(),
      }),
    ),
  }),
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: VelodromeV2AdapterState) => ({
        ...adapter,
        pairs: [
          ...adapter.pairs,
          ...params.pairs.map(p => ({
            allowed: p.allowed,
            token0: p.token0.toLowerCase() as Address,
            token1: p.token1.toLowerCase() as Address,
            factory: p.factory.toLowerCase() as Address,
            stable: p.stable,
          })),
        ],
      }),
    });
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const calldata = createCallData(
      adapterActionAbi["VELODROME_V2_ROUTER"]![action.params.version],
      {
        functionName: "setPoolStatusBatch",
        args: [
          params.pairs.map(
            p => [p.token0, p.token1, p.stable, p.factory, p.allowed] as const,
          ),
        ],
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
    // Two setPoolStatusBatch actions for the same target and creditManager replace each other
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
