import type { Address } from "viem";
import { z } from "zod";
import {
  adapterActionAbi,
  BalancerV3PoolStatus,
} from "../../../../../onchain/index.js";
import { createCallData } from "../../../../index.js";
import type {
  BaseMarketAction,
  MarketActionData,
} from "../../../core/actions/types.js";
import { addressSchema, literalsSchema } from "../../../core/validation.js";
import type { AdapterActionContext } from "../actions.js";
import { updateAdapterState } from "../logic.js";
import type { BalancerV3AdapterState } from "./index.js";

export type BalancerV3PoolStatus310 = {
  pool: Address;
  status: boolean;
};

export type BalancerV3PoolStatus311 = {
  pool: Address;
  status: BalancerV3PoolStatus;
};

export type SetPoolBatchStatusParams = AdapterActionContext & {
  pools: BalancerV3PoolStatus310[] | BalancerV3PoolStatus311[];
};

export type SetPoolBatchStatusAction = BaseMarketAction<
  "ADAPTER::BALANCER_V3_ROUTER::setPoolStatusBatch",
  SetPoolBatchStatusParams
>;

export const setPoolBatchStatusActionData: MarketActionData<
  SetPoolBatchStatusAction,
  AdapterActionContext
> = {
  type: "ADAPTER::BALANCER_V3_ROUTER::setPoolStatusBatch",
  name: "BalancerV3::setPoolStatusBatch",
  description: `Set pool batch status, which represents Balancer V3 pool could be used for swaps for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
    version: literalsSchema(310, 311),
    target: addressSchema,
    pools: z.union([
      z.array(
        z.object({
          pool: addressSchema,
          status: z.boolean(),
        }),
      ),
      z.array(
        z.object({
          pool: addressSchema,
          status: z.nativeEnum(BalancerV3PoolStatus),
        }),
      ),
    ]),
  }),
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: BalancerV3AdapterState) => ({
        ...adapter,
        pools: [
          ...adapter.pools,
          ...params.pools.map(p => ({
            pool: p.pool.toLowerCase() as Address,
            status: p.status,
          })),
        ] as BalancerV3PoolStatus310[] | BalancerV3PoolStatus311[],
      }),
    });
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const calldata = createCallData(
      adapterActionAbi["BALANCER_V3_ROUTER"]![action.params.version],
      {
        functionName: "setPoolStatusBatch",
        args:
          action.params.version === 310
            ? [
                params.pools.map(({ pool }) => pool),
                params.pools.map(({ status }) => status as boolean),
              ]
            : [
                (params.pools as BalancerV3PoolStatus311[]).map(
                  ({ pool, status }) => [pool, status],
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
