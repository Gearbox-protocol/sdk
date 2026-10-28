import type { Address } from "viem";
import { z } from "zod/v4";
import { BalancerV3PoolStatus } from "../../../../../onchain/index.js";
import type { BaseMarketAction } from "../../../actions/actionTypes.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "../../../actions/defineMarketAction.js";
import { configureAdapter } from "../../../actions/utils/configureCalls.js";
import {
  address,
  identity,
  list,
  object,
  status,
} from "../../../state/diff/schemaNodes.js";
import { addressSchema } from "../../../validationSchemas.js";
import {
  adapterAbi,
  adapterActionSchema,
  adapterBatch,
  lowerAddresses,
} from "../adapterActionHelpers.js";
import type { AdapterActionContext } from "../adapterMarketActionsData.js";
import { enabled, type ItemOf, lower } from "../adapterStateSchema.js";
import type { BalancerV3AdapterState } from "./balancerV3Plugin.js";

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

/**
 * The adapter's `pools` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const balancerV3PoolsList = list<
  ItemOf<BalancerV3AdapterState, "pools">
>(
  object({ pool: identity(address), status }),
  pool => lower(pool.pool),
  enabled,
);

export const setPoolBatchStatusActionData: MarketScopedDefinition<SetPoolBatchStatusAction> =
  defineMarketAction<SetPoolBatchStatusAction>({
    type: "ADAPTER::BALANCER_V3_ROUTER::setPoolStatusBatch",
    gas: ({ params }) => 135_000 + params.pools.length * 50_000, // got 167,969
    name: "BalancerV3::setPoolStatusBatch",
    description: `Set pool batch status, which represents Balancer V3 pool could be used for swaps for credit accounts.`,
    schema: adapterActionSchema([310, 311], {
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

    encode: ({ ctx, params }) => {
      const { pools, version } = params;
      return configureAdapter(
        ctx,
        params,
        adapterAbi("BALANCER_V3_ROUTER", version),
        {
          functionName: "setPoolStatusBatch",
          // v310 takes parallel arrays, later versions a list of pairs
          args:
            version === 310
              ? [
                  pools.map(({ pool }) => pool),
                  pools.map(({ status }) => status as boolean),
                ]
              : [
                  (pools as BalancerV3PoolStatus311[]).map(
                    ({ pool, status }) => [pool, status],
                  ),
                ],
        },
      );
    },
    ...adapterBatch({
      type: "BALANCER_V3_ROUTER",
      field: "pools",
      list: balancerV3PoolsList,
      toState: p => lowerAddresses(p, ["pool"]),
    }),
  });
