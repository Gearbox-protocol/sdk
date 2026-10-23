import { type Address, zeroAddress } from "viem";
import type { UniswapV4AdapterContract } from "../../../../../onchain/index.js";
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
  UniswapV4PoolFee,
  UniswapV4PoolKeyStatus,
} from "./setPoolKeyStatusBatchActionData.js";
import {
  setPoolKeyStatusBatchActionData,
  uniswapV4PoolKeysList,
} from "./setPoolKeyStatusBatchActionData.js";

export type UniswapV4AdapterState = AdapterStateBase & {
  poolKeys: UniswapV4PoolKeyStatus[];
};

export interface UniswapV4AdapterDeployParams {
  type: "UNISWAP_V4_GATEWAY";
  version: 310;
  target: Address;
}

export const uniswapV4Plugin = defineAdapterPlugin<
  UniswapV4AdapterDeployParams,
  UniswapV4AdapterState
>()({
  type: "UNISWAP_V4_GATEWAY",
  name: "UniswapV4",
  description: "Adapter for Uniswap V4 and its forks",
  getDefaultParams: () => ({
    type: "UNISWAP_V4_GATEWAY",
    version: 310,
    target: zeroAddress,
  }),
  isEditable: false,
  allowGas: 2_000_000, // not measured
  stateSchema: adapterStateSchema<UniswapV4AdapterState>({
    poolKeys: uniswapV4PoolKeysList,
  }),
  getDeployState: (params: UniswapV4AdapterDeployParams) => ({
    ...deployState("UNISWAP_V4_GATEWAY", params),
    poolKeys: [],
  }),
  getDeployParams: args => adapterDeployParams(args),
  getStateFromSDK: (adapter): UniswapV4AdapterState => ({
    ...sdkState("UNISWAP_V4_GATEWAY", adapter),
    poolKeys: (
      adapter as unknown as UniswapV4AdapterContract
    ).supportedPoolKeys.map(pool => ({
      poolKey: {
        token0: pool.token0,
        token1: pool.token1,
        fee: pool.fee as UniswapV4PoolFee,
        tickSpacing: pool.tickSpacing,
        hooks: pool.hooks,
      },
      allowed: true,
    })),
  }),
  deployParamsSchema:
    plainDeployParamsSchema<UniswapV4AdapterDeployParams>("UNISWAP_V4_GATEWAY"),
  actions: { setPoolKeyStatusBatch: setPoolKeyStatusBatchActionData },
});
