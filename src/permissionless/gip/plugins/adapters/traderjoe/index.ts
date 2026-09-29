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
  TraderJoePoolVersion,
  type TraderJoeRouterAdapterContract,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema, numberSchema } from "../../../core/validation.js";
import type { AdapterPlugin, BaseAdapterState } from "../logic.js";

import type {
  SetPoolBatchStatusAction,
  TraderJoePoolStatus,
} from "./set-pool-batch-status-action.js";

export type TraderJoeAdapterState = BaseAdapterState & {
  pools: TraderJoePoolStatus[];
};

export interface TraderJoeAdapterDeployParams {
  type: "TRADERJOE_ROUTER";
  version: 310;
  target: Address;
}

export const traderJoePlugin: AdapterPlugin = {
  name: "TraderJoe",
  description: "Adapter for TraderJoe Router",
  getDefaultParams: () => ({
    type: "TRADERJOE_ROUTER",
    version: 310,
    target: zeroAddress,
  }),
  isEditable: false,
  getDeployState: (params: TraderJoeAdapterDeployParams) => ({
    type: "TRADERJOE_ROUTER",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    pools: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: TraderJoeAdapterDeployParams;
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
  ): TraderJoeAdapterState => {
    const traderJoeAdapter =
      adapter as unknown as TraderJoeRouterAdapterContract;
    return {
      type: "TRADERJOE_ROUTER",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      pools: traderJoeAdapter.supportedPools.map(pool => ({
        token0: pool.token0,
        token1: pool.token1,
        binStep: pool.binStep,
        version: pool.poolVersion,
        allowed: true,
      })),
    };
  },
};

export type TraderJoeMarketActions = SetPoolBatchStatusAction;

export const traderJoeMarketActionsSchema = z.object({
  type: z.literal(
    "ADAPTER::TRADERTRADERJOE_ROUTERJOE_ROUTER::setPoolStatusBatch",
  ),
  creditManager: addressSchema,
  version: z.literal(310),
  target: addressSchema,
  params: z.array(
    z.object({
      token0: addressSchema,
      token1: addressSchema,
      binStep: numberSchema,
      version: z.nativeEnum(TraderJoePoolVersion),
      allowed: z.boolean(),
    }),
  ),
});
