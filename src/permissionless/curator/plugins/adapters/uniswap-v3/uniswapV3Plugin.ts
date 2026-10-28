import type { Address } from "viem";
import type { UniswapV3AdapterContract } from "../../../../../onchain/index.js";
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
  UniswapV3PoolFee,
  UniswapV3PoolStatus,
} from "./setPoolBatchStatusActionData.js";
import {
  setPoolBatchStatusActionData,
  uniswapV3PoolsList,
} from "./setPoolBatchStatusActionData.js";

export type UniswapV3AdapterState = AdapterStateBase & {
  pools: UniswapV3PoolStatus[];
};

export interface UniswapV3AdapterDeployParams {
  type: "UNISWAP_V3_ROUTER";
  version: 310;
  target: Address;
}

export const uniswapV3Plugin = defineAdapterPlugin<
  UniswapV3AdapterDeployParams,
  UniswapV3AdapterState
>()({
  type: "UNISWAP_V3_ROUTER",
  name: "UniswapV3",
  description: "Adapter for Uniswap V3 and its forks",
  getDefaultParams: () => ({
    type: "UNISWAP_V3_ROUTER",
    version: 310,
    target: "0xE592427A0AEce92De3Edee1F18E0157C05861564",
  }),
  isEditable: false,
  allowGas: 2_050_000, // got 2,001,065
  stateSchema: adapterStateSchema<UniswapV3AdapterState>({
    pools: uniswapV3PoolsList,
  }),
  getDeployState: params => ({
    ...deployState("UNISWAP_V3_ROUTER", params),
    pools: [],
  }),
  getDeployParams: args => adapterDeployParams(args),
  getStateFromSDK: (adapter): UniswapV3AdapterState => ({
    ...sdkState("UNISWAP_V3_ROUTER", adapter),
    pools: (adapter as unknown as UniswapV3AdapterContract).supportedPools.map(
      pool => ({
        token0: pool.token0,
        token1: pool.token1,
        fee: pool.fee as UniswapV3PoolFee,
        allowed: true,
      }),
    ),
  }),
  deployParamsSchema:
    plainDeployParamsSchema<UniswapV3AdapterDeployParams>("UNISWAP_V3_ROUTER"),
  actions: { setPoolBatchStatus: setPoolBatchStatusActionData },
});
