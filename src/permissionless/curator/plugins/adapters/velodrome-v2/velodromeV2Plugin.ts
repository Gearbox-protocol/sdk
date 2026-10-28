import type { Address } from "viem";
import type { VelodromeV2RouterAdapterContract } from "../../../../../onchain/index.js";
import {
  adapterDeployParams,
  deployState,
  plainDeployParamsSchema,
  sdkState,
} from "../adapterPluginHelpers.js";
import { adapterStateSchema } from "../adapterStateSchema.js";
import type { AdapterStateBase } from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import type { VelodromeV2PairStatus } from "./setPoolBatchStatusActionData.js";
import {
  setPoolBatchStatusActionData,
  velodromeV2PairsList,
} from "./setPoolBatchStatusActionData.js";

export type VelodromeV2AdapterState = AdapterStateBase & {
  pairs: VelodromeV2PairStatus[];
};

export interface VelodromeV2AdapterDeployParams {
  type: "VELODROME_V2_ROUTER";
  version: 310;
  target: Address;
}

export const velodromeV2Plugin = defineAdapterPlugin<
  VelodromeV2AdapterDeployParams,
  VelodromeV2AdapterState
>()({
  type: "VELODROME_V2_ROUTER",
  name: "VelodromeV2",
  description: "Adapter for Velodrome V2 and its forks",
  getDefaultParams: () => ({
    type: "VELODROME_V2_ROUTER",
    version: 310,
    target: "0xa062aE8A9c5e11aaA026fc2670B0D65cCc8B2858",
  }),
  isEditable: false,
  allowGas: 2_000_000, // not measured
  stateSchema: adapterStateSchema<VelodromeV2AdapterState>({
    pairs: velodromeV2PairsList,
  }),
  getDeployState: params => ({
    ...deployState("VELODROME_V2_ROUTER", params),
    pairs: [],
  }),
  getDeployParams: args => adapterDeployParams(args),
  getStateFromSDK: (adapter): VelodromeV2AdapterState => ({
    ...sdkState("VELODROME_V2_ROUTER", adapter),
    pairs: (
      adapter as unknown as VelodromeV2RouterAdapterContract
    ).supportedPools.map(pool => ({
      token0: pool.token0,
      token1: pool.token1,
      factory: pool.factory,
      stable: pool.stable,
      allowed: true,
    })),
  }),
  deployParamsSchema: plainDeployParamsSchema<VelodromeV2AdapterDeployParams>(
    "VELODROME_V2_ROUTER",
  ),
  actions: { setPoolBatchStatus: setPoolBatchStatusActionData },
});
