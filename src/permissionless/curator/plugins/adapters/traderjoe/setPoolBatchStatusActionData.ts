import type { Address } from "viem";
import { z } from "zod/v4";
import {
  adapterActionAbi,
  TraderJoePoolVersion,
} from "../../../../../onchain/index.js";
import type { BaseMarketAction } from "../../../actions/actionTypes.js";
import { creditManagerTargetSchema } from "../../../actions/creditManagerTargets.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "../../../actions/defineMarketAction.js";
import { configureAdapter } from "../../../actions/utils/configureCalls.js";
import {
  boolean,
  identity,
  integer,
  list,
  object,
  scalar,
} from "../../../state/diff/schemaNodes.js";
import { lowerAddress } from "../../../utils/addressUtils.js";
import { addressSchema } from "../../../validationSchemas.js";
import { adapterBatch } from "../adapterActionHelpers.js";
import type { AdapterActionContext } from "../adapterMarketActionsData.js";
import {
  allowed,
  type ItemOf,
  orderPair,
  pairFields,
  pairKey,
} from "../adapterStateSchema.js";
import type { TraderJoeAdapterState } from "./traderJoePlugin.js";

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

/**
 * The adapter's `pools` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const traderjoePoolsList = list<ItemOf<TraderJoeAdapterState, "pools">>(
  object(
    {
      ...pairFields,
      binStep: identity(integer),
      version: identity(scalar),
      allowed: boolean,
    },
    orderPair,
  ),
  pool => `${pairKey(pool)}-${pool.binStep}-${pool.version}`,
  allowed,
);

export const setPoolBatchStatusActionData: MarketScopedDefinition<SetPoolBatchStatusAction> =
  defineMarketAction<SetPoolBatchStatusAction>({
    type: "ADAPTER::TRADERJOE_ROUTER::setPoolStatusBatch",
    gas: ({ params }) => 135_000 + params.pools.length * 160_000, // not measured
    name: "TraderJoe::setPoolStatusBatch",
    description: `Set pool batch status, which represents Trader Joe pool could be used for swaps for credit accounts.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      version: z.literal(310),
      target: addressSchema,
      pools: z.array(
        z.object({
          token0: addressSchema,
          token1: addressSchema,
          binStep: z.number().int().min(0),
          version: z.nativeEnum(TraderJoePoolVersion),
          allowed: z.boolean(),
        }),
      ),
    }),

    encode: ({ ctx, params }) =>
      configureAdapter(
        ctx,
        params,
        adapterActionAbi.TRADERJOE_ROUTER![params.version],
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
      ),
    ...adapterBatch<
      "pools",
      SetPoolBatchStatusAction["params"],
      TraderJoeAdapterState
    >({
      type: "TRADERJOE_ROUTER",
      field: "pools",
      list: traderjoePoolsList,
      toState: p => ({
        token0: lowerAddress(p.token0),
        token1: lowerAddress(p.token1),
        binStep: p.binStep,
        version: p.version,
        allowed: p.allowed,
      }),
    }),
  });
