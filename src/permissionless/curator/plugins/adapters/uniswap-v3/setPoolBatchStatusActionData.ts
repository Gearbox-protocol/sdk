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
  boolean,
  identity,
  integer,
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
  orderPair,
  pairFields,
  pairKey,
} from "../adapterStateSchema.js";
import type { UniswapV3AdapterState } from "./uniswapV3Plugin.js";

export const uniswapV3PoolFeeValues = [
  100, 500, 3_000, 10_000, 1, 5, 50, 200, 2000,
] as const;

export type UniswapV3PoolFee = (typeof uniswapV3PoolFeeValues)[number];

export type UniswapV3PoolStatus = {
  token0: Address;
  token1: Address;
  fee: UniswapV3PoolFee;
  allowed: boolean;
};

export type SetPoolBatchStatusParams = AdapterActionContext & {
  pools: UniswapV3PoolStatus[];
};

export type SetPoolBatchStatusAction = BaseMarketAction<
  "ADAPTER::UNISWAP_V3_ROUTER::setPoolBatchStatus",
  SetPoolBatchStatusParams
>;

export const uniswapV3FeeSchema = z.union([
  ...(uniswapV3PoolFeeValues.map(value => z.literal(value)) as [
    z.ZodLiteral<UniswapV3PoolFee>,
    z.ZodLiteral<UniswapV3PoolFee>,
    ...z.ZodLiteral<UniswapV3PoolFee>[],
  ]),
]);

/**
 * The adapter's `pools` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const uniswapV3PoolsList = list<ItemOf<UniswapV3AdapterState, "pools">>(
  object(
    { ...pairFields, fee: identity(integer), allowed: boolean },
    orderPair,
  ),
  pool => `${pairKey(pool)}-${pool.fee}`,
  allowed,
);

export const setPoolBatchStatusActionData: MarketScopedDefinition<SetPoolBatchStatusAction> =
  defineMarketAction<SetPoolBatchStatusAction>({
    type: "ADAPTER::UNISWAP_V3_ROUTER::setPoolBatchStatus",
    gas: ({ params }) => 135_000 + params.pools.length * 65_000, // got 190,529
    name: "UniswapV3::setPoolBatchStatus",
    description: `Set pool batch status, which represents Uniswap V3 pools could be used for swaps for credit accounts.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      version: z.literal(310),
      target: addressSchema,
      pools: z.array(
        z.object({
          token0: addressSchema,
          token1: addressSchema,
          fee: uniswapV3FeeSchema,
          allowed: z.boolean(),
        }),
      ),
    }),

    encode: ({ ctx, params }) =>
      configureAdapter(
        ctx,
        params,
        adapterActionAbi.UNISWAP_V3_ROUTER![params.version],
        {
          functionName: "setPoolStatusBatch",
          args: [
            params.pools.map(
              p => [p.token0, p.token1, p.fee, p.allowed] as const,
            ),
          ],
        },
      ),
    ...adapterBatch<
      "pools",
      SetPoolBatchStatusAction["params"],
      UniswapV3AdapterState
    >({
      type: "UNISWAP_V3_ROUTER",
      field: "pools",
      list: uniswapV3PoolsList,
      toState: p => ({
        allowed: p.allowed,
        token0: lowerAddress(p.token0),
        token1: lowerAddress(p.token1),
        fee: p.fee,
      }),
    }),
  });
