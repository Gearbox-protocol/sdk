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
  lower,
  orderPair,
  pairKey,
} from "../adapterStateSchema.js";
import type { UniswapV4AdapterState } from "./uniswapV4Plugin.js";

export const uniswapV4PoolFeeValues = [
  1, 50, 80, 100, 500, 3_000, 10_000,
] as const;

export type UniswapV4PoolFee = number;

export type UniswapV4PoolKey = {
  token0: Address;
  token1: Address;
  fee: UniswapV4PoolFee;
  tickSpacing: number;
  hooks: Address;
};

export type UniswapV4PoolKeyStatus = {
  poolKey: UniswapV4PoolKey;
  allowed: boolean;
};

export type SetPoolKeyStatusBatchParams = AdapterActionContext & {
  poolKeys: UniswapV4PoolKeyStatus[];
};

export type SetPoolKeyStatusBatchAction = BaseMarketAction<
  "ADAPTER::UNISWAP_V4_GATEWAY::setPoolKeyStatusBatch",
  SetPoolKeyStatusBatchParams
>;

export const uniswapV4FeeSchema = z.number().int().positive();

/**
 * The adapter's `poolKeys` as its state schema lists them: the key identifies an
 * item in merges, state updates and diffs alike.
 **/
export const uniswapV4PoolKeysList = list<
  ItemOf<UniswapV4AdapterState, "poolKeys">
>(
  object({
    poolKey: identity(
      object(
        {
          token0: address,
          token1: address,
          fee: integer,
          tickSpacing: integer,
          hooks: address,
        },
        orderPair,
      ),
    ),
    allowed: boolean,
  }),
  ({ poolKey: key }) =>
    `${pairKey(key)}-${key.fee}-${key.tickSpacing}-${lower(key.hooks)}`,
  allowed,
);

export const setPoolKeyStatusBatchActionData: MarketScopedDefinition<SetPoolKeyStatusBatchAction> =
  defineMarketAction<SetPoolKeyStatusBatchAction>({
    type: "ADAPTER::UNISWAP_V4_GATEWAY::setPoolKeyStatusBatch",
    gas: () => 200_000, // not measured
    name: "UNISWAP_V4_GATEWAY::setPoolKeyStatusBatch",
    description: `Set pool key status batch, which represents Uniswap V4 pools could be used for swaps for credit accounts.`,
    schema: z.object({
      creditManager: creditManagerTargetSchema,
      version: z.literal(310),
      target: addressSchema,
      poolKeys: z.array(
        z.object({
          poolKey: z.object({
            token0: addressSchema,
            token1: addressSchema,
            fee: uniswapV4FeeSchema,
            tickSpacing: z.number(),
            hooks: addressSchema,
          }),
          allowed: z.boolean(),
        }),
      ),
    }),

    encode: ({ ctx, params }) =>
      configureAdapter(
        ctx,
        params,
        adapterActionAbi.UNISWAP_V4_GATEWAY![params.version],
        {
          functionName: "setPoolKeyStatusBatch",
          args: [
            params.poolKeys.map(
              ({ poolKey, allowed }) =>
                [
                  [
                    poolKey.token0,
                    poolKey.token1,
                    poolKey.fee,
                    poolKey.tickSpacing,
                    poolKey.hooks,
                  ],
                  allowed,
                ] as const,
            ),
          ],
        },
      ),
    ...adapterBatch<
      "poolKeys",
      SetPoolKeyStatusBatchAction["params"],
      UniswapV4AdapterState
    >({
      type: "UNISWAP_V4_GATEWAY",
      field: "poolKeys",
      list: uniswapV4PoolKeysList,
      toState: p => ({
        allowed: p.allowed,
        poolKey: {
          token0: lowerAddress(p.poolKey.token0),
          token1: lowerAddress(p.poolKey.token1),
          fee: p.poolKey.fee,
          tickSpacing: p.poolKey.tickSpacing,
          hooks: p.poolKey.hooks,
        },
      }),
    }),
  });
