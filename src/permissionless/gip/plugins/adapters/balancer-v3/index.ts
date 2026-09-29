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
  BalancerV3PoolStatus,
  type BalancerV3RouterAdapterContract,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema, literalsSchema } from "../../../core/validation.js";
import type { AdapterPlugin, BaseAdapterState } from "../logic.js";

import type {
  BalancerV3PoolStatus310,
  BalancerV3PoolStatus311,
  SetPoolBatchStatusAction,
} from "./set-pool-batch-status-action.js";

export type BalancerV3AdapterState = BaseAdapterState & {
  pools: BalancerV3PoolStatus310[] | BalancerV3PoolStatus311[];
};

export interface BalancerV3AdapterDeployParams {
  type: "BALANCER_V3_ROUTER";
  version: 310 | 311;
  target: Address;
}

export const balancerV3Plugin: AdapterPlugin = {
  name: "BalancerV3",
  description: "Adapter for Balancer V3 and its forks",
  getDefaultParams: () => ({
    type: "BALANCER_V3_ROUTER",
    version: 311,
    target: "0x21F55223de449224e8BdF4f59452E072BDF7af57" as Address,
  }),
  isEditable: false,
  getDeployState: (params: BalancerV3AdapterDeployParams) => ({
    type: "BALANCER_V3_ROUTER",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    pools: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: BalancerV3AdapterDeployParams;
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
  ): BalancerV3AdapterState => {
    const balancerAdapter =
      adapter as unknown as BalancerV3RouterAdapterContract;
    return {
      type: "BALANCER_V3_ROUTER",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      pools:
        adapter.version === 310
          ? (
              balancerAdapter.allowedPools as (Address | { pool: Address })[]
            ).map(p => ({
              pool: typeof p === "string" ? p : p.pool,
              status: true as boolean,
            }))
          : balancerAdapter.allowedPools.map(p =>
              typeof p === "object"
                ? {
                    pool: p.pool,
                    status: p.status ?? BalancerV3PoolStatus.ALLOWED,
                  }
                : {
                    pool: p as Address,
                    status: BalancerV3PoolStatus.ALLOWED,
                  },
            ),
    };
  },
};

export type BalancerV3MarketActions = SetPoolBatchStatusAction;

export const balancerV3MarketActionsSchema = z.object({
  type: z.literal("ADAPTER::BALANCER_V3_ROUTER::setPoolStatusBatch"),
  creditManager: addressSchema,
  version: literalsSchema(310, 311),
  target: addressSchema,
  params: z.union([
    z.array(
      z.object({
        pool: addressSchema,
        status: z.boolean(),
      }),
    ),
    z.array(
      z.object({
        pool: addressSchema,
        status: z.nativeEnum(BalancerV3PoolStatus),
      }),
    ),
  ]),
});
