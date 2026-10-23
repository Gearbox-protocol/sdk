import type { Address } from "viem";
import type { CamelotV3AdapterContract } from "../../../../../onchain/index.js";
import {
  adapterDeployParams,
  deployState,
  plainDeployParamsSchema,
  sdkState,
} from "../adapterPluginHelpers.js";
import { adapterStateSchema } from "../adapterStateSchema.js";
import type { AdapterStateBase } from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import type { CamelotV3PairStatus } from "./setPoolBatchStatusActionData.js";
import {
  camelotV3PairsList,
  setPoolBatchStatusActionData,
} from "./setPoolBatchStatusActionData.js";

export type CamelotV3AdapterState = AdapterStateBase & {
  pairs: CamelotV3PairStatus[];
};

export interface CamelotV3AdapterDeployParams {
  type: "CAMELOT_V3_ROUTER";
  version: 310;
  target: Address;
}

export const camelotV3Plugin = defineAdapterPlugin<
  CamelotV3AdapterDeployParams,
  CamelotV3AdapterState
>()({
  type: "CAMELOT_V3_ROUTER",
  name: "CamelotV3",
  description: "Adapter for Camelot V3 and its forks",
  getDefaultParams: () => ({
    type: "CAMELOT_V3_ROUTER",
    version: 310,
    target: "0x1F721E2E82F6676FCE4eA07A5958cF098D339e18" as Address,
  }),
  isEditable: false,
  allowGas: 2_100_000, // got 2,006,114 & 2,023,210
  stateSchema: adapterStateSchema<CamelotV3AdapterState>({
    pairs: camelotV3PairsList,
  }),
  getDeployState: (params: CamelotV3AdapterDeployParams) => ({
    ...deployState("CAMELOT_V3_ROUTER", params),
    pairs: [],
  }),
  getDeployParams: args => adapterDeployParams(args),
  getStateFromSDK: (adapter): CamelotV3AdapterState => ({
    ...sdkState("CAMELOT_V3_ROUTER", adapter),
    pairs: (adapter as unknown as CamelotV3AdapterContract).supportedPools.map(
      pool => ({
        token0: pool.token0,
        token1: pool.token1,
        allowed: true,
      }),
    ),
  }),
  deployParamsSchema:
    plainDeployParamsSchema<CamelotV3AdapterDeployParams>("CAMELOT_V3_ROUTER"),
  actions: { setPoolStatusBatch: setPoolBatchStatusActionData },
});
