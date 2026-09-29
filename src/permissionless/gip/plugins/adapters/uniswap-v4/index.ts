import {
  type Abi,
  type Address,
  encodeAbiParameters,
  stringToHex,
  zeroAddress,
} from "viem";
import { z } from "zod";
import {
  type AbstractAdapterContract,
  adapterConstructorAbi,
  type UniswapV4AdapterContract,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema } from "../../../core/validation.js";
import type { AdapterPlugin, BaseAdapterState } from "../logic.js";

import {
  type SetPoolKeyStatusBatchAction,
  type UniswapV4PoolFee,
  type UniswapV4PoolKeyStatus,
  uniswapV4FeeSchema,
} from "./set-pool-key-status-batch-action.js";

export type UniswapV4AdapterState = BaseAdapterState & {
  poolKeys: UniswapV4PoolKeyStatus[];
};

export interface UniswapV4AdapterDeployParams {
  type: "UNISWAP_V4_GATEWAY";
  version: 310;
  target: Address;
}

export const uniswapV4Plugin: AdapterPlugin = {
  name: "UniswapV4",
  description: "Adapter for Uniswap V4 and its forks",
  getDefaultParams: () => ({
    type: "UNISWAP_V4_GATEWAY",
    version: 310,
    target: zeroAddress,
  }),
  isEditable: false,
  getDeployState: (params: UniswapV4AdapterDeployParams) => ({
    type: "UNISWAP_V4_GATEWAY",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    poolKeys: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: UniswapV4AdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        [args.creditManager, args.params.target],
      ),
    };
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): UniswapV4AdapterState => {
    const uniswapAdapter = adapter as unknown as UniswapV4AdapterContract;
    return {
      type: "UNISWAP_V4_GATEWAY",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      poolKeys: uniswapAdapter.supportedPoolKeys.map(pool => ({
        poolKey: {
          token0: pool.token0,
          token1: pool.token1,
          fee: pool.fee as UniswapV4PoolFee,
          tickSpacing: pool.tickSpacing,
          hooks: pool.hooks,
        },
        allowed: true,
      })),
    };
  },
};

export type UniswapV4MarketActions = SetPoolKeyStatusBatchAction;

export const uniswapV4MarketActionsSchema = z.object({
  type: z.literal("ADAPTER::UNISWAP_V4_GATEWAY::setPoolKeyStatusBatch"),
  creditManager: addressSchema,
  version: z.literal(310),
  target: addressSchema,
  params: z.array(
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
});
