import type { Address } from "viem";
import { z } from "zod/v4";
import { adapterActionAbi } from "../../../../../onchain/index.js";
import type { BaseMarketAction } from "../../../actions/actionTypes.js";
import { creditManagerTargetSchema } from "../../../actions/creditManagerTargets.js";
import {
  defineMarketAction,
  type MarketScopedDefinition,
} from "../../../actions/defineMarketAction.js";
import { configureAdapter } from "../../../actions/utils/configureCalls.js";
import {
  address,
  boolean,
  identity,
  list,
  object,
} from "../../../state/diff/schemaNodes.js";
import { lowerAddress } from "../../../utils/addressUtils.js";
import { addressSchema } from "../../../validationSchemas.js";
import { adapterBatch } from "../adapterActionHelpers.js";
import type { AdapterActionContext } from "../adapterMarketActionsData.js";
import {
  allowed,
  type ItemOf,
  lower,
  orderPair,
  pairFields,
  pairKey,
} from "../adapterStateSchema.js";
import type { VelodromeV2AdapterState } from "./velodromeV2Plugin.js";

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

/**
 * The adapter's `pairs` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const velodromeV2PairsList = list<
  ItemOf<VelodromeV2AdapterState, "pairs">
>(
  object(
    {
      ...pairFields,
      factory: identity(address),
      stable: identity(boolean),
      allowed: boolean,
    },
    orderPair,
  ),
  pair => `${pairKey(pair)}-${lower(pair.factory)}-${pair.stable}`,
  allowed,
);

export const setPoolBatchStatusActionData: MarketScopedDefinition<SetPoolBatchStatusAction> =
  defineMarketAction<SetPoolBatchStatusAction>({
    type: "ADAPTER::VELODROME_V2_ROUTER::setPoolBatchStatus",
    gas: ({ params }) => 135_000 + params.pairs.length * 160_000, // not measured
    name: "VelodromeV2::setPoolBatchStatus",
    description: `Set pool batch status, which represents Velodrome V2 pairs could be used for swaps for credit accounts.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
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

    encode: ({ ctx, params }) =>
      configureAdapter(
        ctx,
        params,
        adapterActionAbi.VELODROME_V2_ROUTER![params.version],
        {
          functionName: "setPoolStatusBatch",
          args: [
            params.pairs.map(
              p =>
                [p.token0, p.token1, p.stable, p.factory, p.allowed] as const,
            ),
          ],
        },
      ),
    ...adapterBatch<
      "pairs",
      SetPoolBatchStatusAction["params"],
      VelodromeV2AdapterState
    >({
      type: "VELODROME_V2_ROUTER",
      field: "pairs",
      list: velodromeV2PairsList,
      toState: p => ({
        allowed: p.allowed,
        token0: lowerAddress(p.token0),
        token1: lowerAddress(p.token1),
        factory: lowerAddress(p.factory),
        stable: p.stable,
      }),
    }),
  });
