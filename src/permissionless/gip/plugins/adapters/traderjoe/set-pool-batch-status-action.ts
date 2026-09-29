import type { Address } from "viem";
import { z } from "zod";
import {
  adapterActionAbi,
  TraderJoePoolVersion,
} from "../../../../../onchain/index.js";
import { createCallData } from "../../../../index.js";
import type {
  BaseMarketAction,
  MarketActionData,
} from "../../../core/actions/types.js";
import { addressSchema, numberSchema } from "../../../core/validation.js";
import type { AdapterActionContext } from "../actions.js";
import { updateAdapterState } from "../logic.js";
import type { TraderJoeAdapterState } from "./index.js";

export type TraderJoePoolStatus = {
  token0: Address;
  token1: Address;
  binStep: number;
  version: TraderJoePoolVersion;
  allowed: boolean;
};

export type SetPoolBatchStatusParams = AdapterActionContext & {
  pools: TraderJoePoolStatus[];
};

export type SetPoolBatchStatusAction = BaseMarketAction<
  "ADAPTER::TRADERJOE_ROUTER::setPoolStatusBatch",
  SetPoolBatchStatusParams
>;

export const setPoolBatchStatusActionData: MarketActionData<
  SetPoolBatchStatusAction,
  AdapterActionContext
> = {
  type: "ADAPTER::TRADERJOE_ROUTER::setPoolStatusBatch",
  name: "TraderJoe::setPoolStatusBatch",
  description: `Set pool batch status, which represents Trader Joe pool could be used for swaps for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
    version: z.literal(310),
    target: addressSchema,
    pools: z.array(
      z.object({
        token0: addressSchema,
        token1: addressSchema,
        binStep: numberSchema,
        version: z.nativeEnum(TraderJoePoolVersion),
        allowed: z.boolean(),
      }),
    ),
  }),
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: TraderJoeAdapterState) => ({
        ...adapter,
        pools: [
          ...adapter.pools,
          ...params.pools.map(p => ({
            token0: p.token0.toLowerCase() as Address,
            token1: p.token1.toLowerCase() as Address,
            binStep: p.binStep,
            version: p.version,
            allowed: p.allowed,
          })),
        ],
      }),
    });
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const calldata = createCallData(
      adapterActionAbi["TRADERJOE_ROUTER"]![action.params.version],
      {
        functionName: "setPoolStatusBatch",
        args: [
          params.pools.map(
            p =>
              [
                p.token0,
                p.token1,
                BigInt(p.binStep),
                p.version,
                p.allowed,
              ] as const,
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
