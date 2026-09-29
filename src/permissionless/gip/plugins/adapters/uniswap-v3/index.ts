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
  type UniswapV3AdapterContract,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema } from "../../../core/validation.js";
import type { AdapterPlugin, BaseAdapterState } from "../logic.js";

import type {
  SetPoolBatchStatusAction,
  UniswapV3PoolFee,
  UniswapV3PoolStatus,
} from "./set-pool-batch-status-action.js";

export type UniswapV3AdapterState = BaseAdapterState & {
  pools: UniswapV3PoolStatus[];
};

export interface UniswapV3AdapterDeployParams {
  type: "UNISWAP_V3_ROUTER";
  version: 310;
  target: Address;
}

export const uniswapV3Plugin: AdapterPlugin = {
  name: "UniswapV3",
  description: "Adapter for Uniswap V3 and its forks",
  getDefaultParams: () => ({
    type: "UNISWAP_V3_ROUTER",
    version: 310,
    target: "0xE592427A0AEce92De3Edee1F18E0157C05861564" as Address,
  }),
  isEditable: false,
  getDeployState: (params: UniswapV3AdapterDeployParams) => ({
    type: "UNISWAP_V3_ROUTER",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    pools: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: UniswapV3AdapterDeployParams;
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
  ): UniswapV3AdapterState => {
    const uniswapAdapter = adapter as unknown as UniswapV3AdapterContract;
    return {
      type: "UNISWAP_V3_ROUTER",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      pools: uniswapAdapter.supportedPools.map(pool => ({
        token0: pool.token0,
        token1: pool.token1,
        fee: pool.fee as UniswapV3PoolFee,
        allowed: true,
      })),
    };
  },
};

export type UniswapV3MarketActions = SetPoolBatchStatusAction;

export const uniswapV3MarketActionsSchema = z.object({
  type: z.literal("ADAPTER::UNISWAP_V3_ROUTER::setPoolBatchStatus"),
  creditManager: addressSchema,
  version: z.literal(310),
  target: addressSchema,
  params: z.array(
    z.object({
      token0: addressSchema,
      token1: addressSchema,
      allowed: z.boolean(),
    }),
  ),
});
