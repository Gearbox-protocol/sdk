import type { Address } from "viem";
import {
  BalancerV3PoolStatus,
  type BalancerV3RouterAdapterContract,
} from "../../../../../onchain/index.js";
import {
  adapterDeployParams,
  deployState,
  plainDeployParamsSchema,
  sdkState,
} from "../adapterPluginHelpers.js";
import { adapterStateSchema } from "../adapterStateSchema.js";
import type { AdapterStateBase } from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import type {
  BalancerV3PoolStatus310,
  BalancerV3PoolStatus311,
} from "./setPoolBatchStatusActionData.js";
import {
  balancerV3PoolsList,
  setPoolBatchStatusActionData,
} from "./setPoolBatchStatusActionData.js";

export type BalancerV3AdapterState = AdapterStateBase & {
  pools: BalancerV3PoolStatus310[] | BalancerV3PoolStatus311[];
};

export interface BalancerV3AdapterDeployParams {
  type: "BALANCER_V3_ROUTER";
  version: 310 | 311;
  target: Address;
}

/**
 * Pools of a deployed adapter. v310 only knows allowed pools (a boolean), later
 * versions carry a status.
 **/
function poolsFromSDK(
  adapter: BalancerV3RouterAdapterContract,
): BalancerV3AdapterState["pools"] {
  if (adapter.version === 310) {
    return adapter.allowedPools.map(({ pool }) => ({
      pool,
      status: true as boolean,
    }));
  }
  return adapter.allowedPools.map(({ pool, status }) => ({
    pool,
    status: status ?? BalancerV3PoolStatus.ALLOWED,
  }));
}

export const balancerV3Plugin = defineAdapterPlugin<
  BalancerV3AdapterDeployParams,
  BalancerV3AdapterState
>()({
  type: "BALANCER_V3_ROUTER",
  name: "BalancerV3",
  description: "Adapter for Balancer V3 and its forks",
  getDefaultParams: () => ({
    type: "BALANCER_V3_ROUTER",
    version: 311,
    target: "0x21F55223de449224e8BdF4f59452E072BDF7af57",
  }),
  isEditable: false,
  allowGas: 1_350_000, // got 1,317,074
  stateSchema: adapterStateSchema<BalancerV3AdapterState>({
    pools: balancerV3PoolsList,
  }),
  getDeployState: params => ({
    ...deployState("BALANCER_V3_ROUTER", params),
    pools: [],
  }),
  getDeployParams: args => adapterDeployParams(args),
  getStateFromSDK: (adapter): BalancerV3AdapterState => ({
    ...sdkState("BALANCER_V3_ROUTER", adapter),
    pools: poolsFromSDK(adapter as unknown as BalancerV3RouterAdapterContract),
  }),
  deployParamsSchema: plainDeployParamsSchema<BalancerV3AdapterDeployParams>(
    "BALANCER_V3_ROUTER",
    [310, 311],
  ),
  actions: { setPoolStatusBatch: setPoolBatchStatusActionData },
});
