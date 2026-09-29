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
import type { UniswapV3AdapterState } from "./index.js";

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

export const setPoolBatchStatusActionData: MarketActionData<
  SetPoolBatchStatusAction,
  AdapterActionContext
> = {
  type: "ADAPTER::UNISWAP_V3_ROUTER::setPoolBatchStatus",
  name: "UniswapV3::setPoolBatchStatus",
  description: `Set pool batch status, which represents Uniswap V3 pools could be used for swaps for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
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
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: UniswapV3AdapterState) => ({
        ...adapter,
        pools: [
          ...adapter.pools,
          ...params.pools.map(p => ({
            allowed: p.allowed,
            token0: p.token0.toLowerCase() as Address,
            token1: p.token1.toLowerCase() as Address,
            fee: p.fee,
          })),
        ],
      }),
    });
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const calldata = createCallData(
      adapterActionAbi["UNISWAP_V3_ROUTER"]![action.params.version],
      {
        functionName: "setPoolStatusBatch",
        args: [
          params.pools.map(
            p => [p.token0, p.token1, p.fee, p.allowed] as const,
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
