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
import type { UniswapV4AdapterState } from "./index.js";

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

export const setPoolKeyStatusBatchActionData: MarketActionData<
  SetPoolKeyStatusBatchAction,
  AdapterActionContext
> = {
  type: "ADAPTER::UNISWAP_V4_GATEWAY::setPoolKeyStatusBatch",
  name: "UNISWAP_V4_GATEWAY::setPoolKeyStatusBatch",
  description: `Set pool key status batch, which represents Uniswap V4 pools could be used for swaps for credit accounts.`,
  schema: z.object({
    creditManager: addressSchema,
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
  stateTransition: ({ state, params }) => {
    return updateAdapterState({
      state,
      creditManager: params.creditManager,
      target: params.target,
      update: (adapter: UniswapV4AdapterState) => ({
        ...adapter,
        poolKeys: [
          ...adapter.poolKeys,
          ...params.poolKeys.map(p => ({
            allowed: p.allowed,
            poolKey: {
              token0: p.poolKey.token0.toLowerCase() as Address,
              token1: p.poolKey.token1.toLowerCase() as Address,
              fee: p.poolKey.fee,
              tickSpacing: p.poolKey.tickSpacing,
              hooks: p.poolKey.hooks,
            },
          })),
        ],
      }),
    });
  },
  getRawTx: async ({ ctx, action }) => {
    const mc = ctx.marketConfigurator;
    const { params } = action;
    const calldata = createCallData(
      adapterActionAbi["UNISWAP_V4_GATEWAY"]![action.params.version],
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
    );
    const tx = mc.configureAdapterFor(
      params.creditManager,
      params.target,
      calldata,
    );
    return { tx: { tx, action } };
  },
  replaceKeep: "last",
  replace: (a: SetPoolKeyStatusBatchParams, b: SetPoolKeyStatusBatchParams) => {
    // Two setPoolKeyStatusBatch actions for the same target and creditManager replace each other
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
