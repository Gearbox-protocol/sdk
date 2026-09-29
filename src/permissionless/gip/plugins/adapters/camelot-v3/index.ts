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
  type CamelotV3AdapterContract,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema } from "../../../core/validation.js";
import type { AdapterPlugin, BaseAdapterState } from "../logic.js";

import type {
  CamelotV3PairStatus,
  SetPoolBatchStatusAction,
} from "./set-pool-batch-status-action.js";

export type CamelotV3AdapterState = BaseAdapterState & {
  pairs: CamelotV3PairStatus[];
};

export interface CamelotV3AdapterDeployParams {
  type: "CAMELOT_V3_ROUTER";
  version: 310;
  target: Address;
}

export const camelotV3Plugin: AdapterPlugin = {
  name: "CamelotV3",
  description: "Adapter for Camelot V3 and its forks",
  getDefaultParams: () => ({
    type: "CAMELOT_V3_ROUTER",
    version: 310,
    target: "0x1F721E2E82F6676FCE4eA07A5958cF098D339e18" as Address,
  }),
  isEditable: false,
  getDeployState: (params: CamelotV3AdapterDeployParams) => ({
    type: "CAMELOT_V3_ROUTER",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    pairs: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: CamelotV3AdapterDeployParams;
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
  ): CamelotV3AdapterState => {
    const camelotAdapter = adapter as unknown as CamelotV3AdapterContract;
    return {
      type: "CAMELOT_V3_ROUTER",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      pairs: camelotAdapter.supportedPools.map(pool => ({
        token0: pool.token0,
        token1: pool.token1,
        allowed: true,
      })),
    };
  },
};

export type CamelotV3MarketActions = SetPoolBatchStatusAction;

export const camelotV3MarketActionsSchema = z.object({
  type: z.literal("ADAPTER::CAMELOT_V3_ROUTER::setPoolStatusBatch"),
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
