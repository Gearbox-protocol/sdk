import type { Address } from "viem";
import type { UniswapV2AdapterContract } from "../../../../../onchain/index.js";
import {
  adapterDeployParams,
  deployState,
  plainDeployParamsSchema,
  sdkState,
} from "../adapterPluginHelpers.js";
import { adapterStateSchema } from "../adapterStateSchema.js";
import type { AdapterStateBase } from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import type { UniswapV2PairStatus } from "./setPairBatchStatusActionData.js";
import {
  setPairBatchStatusActionData,
  uniswapV2PairsList,
} from "./setPairBatchStatusActionData.js";

export type UniswapV2AdapterState = AdapterStateBase & {
  pairs: UniswapV2PairStatus[];
};

export interface UniswapV2AdapterDeployParams {
  type: "UNISWAP_V2_ROUTER";
  version: 310;
  target: Address;
}

export const uniswapV2Plugin = defineAdapterPlugin<
  UniswapV2AdapterDeployParams,
  UniswapV2AdapterState
>()({
  type: "UNISWAP_V2_ROUTER",
  name: "UniswapV2",
  description: "Adapter for Uniswap V2 and its forks",
  getDefaultParams: () => ({
    type: "UNISWAP_V2_ROUTER",
    version: 310,
    target: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
  }),
  isEditable: false,
  allowGas: 1_550_000, // got 1,517,137
  stateSchema: adapterStateSchema<UniswapV2AdapterState>({
    pairs: uniswapV2PairsList,
  }),
  getDeployState: params => ({
    ...deployState("UNISWAP_V2_ROUTER", params),
    pairs: [],
  }),
  getDeployParams: args => adapterDeployParams(args),
  getStateFromSDK: (adapter): UniswapV2AdapterState => ({
    ...sdkState("UNISWAP_V2_ROUTER", adapter),
    pairs: (adapter as unknown as UniswapV2AdapterContract).supportedPairs.map(
      pair => ({
        token0: pair.token0,
        token1: pair.token1,
        allowed: true,
      }),
    ),
  }),
  deployParamsSchema:
    plainDeployParamsSchema<UniswapV2AdapterDeployParams>("UNISWAP_V2_ROUTER"),
  actions: { setPairBatchStatus: setPairBatchStatusActionData },
});
