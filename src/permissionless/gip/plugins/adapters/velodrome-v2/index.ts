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
  type VelodromeV2RouterAdapterContract,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema } from "../../../core/validation.js";
import type { AdapterPlugin, BaseAdapterState } from "../logic.js";

import type {
  SetPoolBatchStatusAction,
  VelodromeV2PairStatus,
} from "./set-pool-batch-status-action.js";

export type VelodromeV2AdapterState = BaseAdapterState & {
  pairs: VelodromeV2PairStatus[];
};

export interface VelodromeV2AdapterDeployParams {
  type: "VELODROME_V2_ROUTER";
  version: 310;
  target: Address;
}

export const velodromeV2Plugin: AdapterPlugin = {
  name: "VelodromeV2",
  description: "Adapter for Velodrome V2 and its forks",
  getDefaultParams: () => ({
    type: "VELODROME_V2_ROUTER",
    version: 310,
    target: "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858" as Address,
  }),
  isEditable: false,
  getDeployState: (params: VelodromeV2AdapterDeployParams) => ({
    type: "VELODROME_V2_ROUTER",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    pairs: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: VelodromeV2AdapterDeployParams;
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
  ): VelodromeV2AdapterState => {
    const velodromeAdapter =
      adapter as unknown as VelodromeV2RouterAdapterContract;
    return {
      type: "VELODROME_V2_ROUTER",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      pairs: velodromeAdapter.supportedPools.map(pool => ({
        token0: pool.token0,
        token1: pool.token1,
        factory: pool.factory,
        stable: pool.stable,
        allowed: true,
      })),
    };
  },
};

export type VelodromeV2MarketActions = SetPoolBatchStatusAction;

export const velodromeV2MarketActionsSchema = z.object({
  type: z.literal("ADAPTER::VELODROME_V2_ROUTER::setPoolBatchStatus"),
  creditManager: addressSchema,
  version: z.literal(310),
  target: addressSchema,
  params: z.array(
    z.object({
      token0: addressSchema,
      token1: addressSchema,
      factory: addressSchema,
      stable: z.boolean(),
      allowed: z.boolean(),
    }),
  ),
});
