import { type Address, zeroAddress } from "viem";
import type { TraderJoeRouterAdapterContract } from "../../../../../onchain/index.js";
import {
  adapterDeployParams,
  deployState,
  plainDeployParamsSchema,
  sdkState,
} from "../adapterPluginHelpers.js";
import { adapterStateSchema } from "../adapterStateSchema.js";
import type { AdapterStateBase } from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import type { TraderJoePoolStatus } from "./setPoolBatchStatusActionData.js";
import {
  setPoolBatchStatusActionData,
  traderjoePoolsList,
} from "./setPoolBatchStatusActionData.js";

export type TraderJoeAdapterState = AdapterStateBase & {
  pools: TraderJoePoolStatus[];
};

export interface TraderJoeAdapterDeployParams {
  type: "TRADERJOE_ROUTER";
  version: 310;
  target: Address;
}

export const traderJoePlugin = defineAdapterPlugin<
  TraderJoeAdapterDeployParams,
  TraderJoeAdapterState
>()({
  type: "TRADERJOE_ROUTER",
  name: "TraderJoe",
  description: "Adapter for TraderJoe Router",
  getDefaultParams: () => ({
    type: "TRADERJOE_ROUTER",
    version: 310,
    target: zeroAddress,
  }),
  isEditable: false,
  allowGas: 2_000_000, // not measured
  stateSchema: adapterStateSchema<TraderJoeAdapterState>({
    pools: traderjoePoolsList,
  }),
  getDeployState: params => ({
    ...deployState("TRADERJOE_ROUTER", params),
    pools: [],
  }),
  getDeployParams: args => adapterDeployParams(args),
  getStateFromSDK: (adapter): TraderJoeAdapterState => ({
    ...sdkState("TRADERJOE_ROUTER", adapter),
    pools: (
      adapter as unknown as TraderJoeRouterAdapterContract
    ).supportedPools.map(pool => ({
      token0: pool.token0,
      token1: pool.token1,
      binStep: pool.binStep,
      version: pool.poolVersion,
      allowed: true,
    })),
  }),
  deployParamsSchema:
    plainDeployParamsSchema<TraderJoeAdapterDeployParams>("TRADERJOE_ROUTER"),
  actions: { setPoolStatusBatch: setPoolBatchStatusActionData },
});
