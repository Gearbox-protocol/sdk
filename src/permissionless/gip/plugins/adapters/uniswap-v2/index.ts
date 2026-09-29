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
  type UniswapV2AdapterContract,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema } from "../../../core/validation.js";
import type { AdapterPlugin, BaseAdapterState } from "../logic.js";

import type {
  SetPairBatchStatusAction,
  UniswapV2PairStatus,
} from "./set-pair-batch-status-action.js";

export type UniswapV2AdapterState = BaseAdapterState & {
  pairs: UniswapV2PairStatus[];
};

export interface UniswapV2AdapterDeployParams {
  type: "UNISWAP_V2_ROUTER";
  version: 310;
  target: Address;
}

export const uniswapV2Plugin: AdapterPlugin = {
  name: "UniswapV2",
  description: "Adapter for Uniswap V2 and its forks",
  getDefaultParams: () => ({
    type: "UNISWAP_V2_ROUTER",
    version: 310,
    target: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D" as Address,
  }),
  isEditable: false,
  getDeployState: (params: UniswapV2AdapterDeployParams) => ({
    type: "UNISWAP_V2_ROUTER",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    pairs: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: UniswapV2AdapterDeployParams;
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
  ): UniswapV2AdapterState => {
    const uniswapAdapter = adapter as unknown as UniswapV2AdapterContract;
    return {
      type: "UNISWAP_V2_ROUTER",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      pairs: uniswapAdapter.supportedPairs.map(pair => ({
        token0: pair.token0,
        token1: pair.token1,
        allowed: true,
      })),
    };
  },
};

export type UniswapV2MarketActions = SetPairBatchStatusAction;

export const uniswapV2MarketActionsSchema = z.object({
  type: z.literal("ADAPTER::UNISWAP_V2_ROUTER::setPairBatchStatus"),
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
