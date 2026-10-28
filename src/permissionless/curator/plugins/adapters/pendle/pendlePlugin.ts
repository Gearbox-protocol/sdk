import type { Address } from "viem";
import {
  type PendleRouterAdapterContract,
  PendleTokenType,
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
import type { PendlePairStatus } from "./setPairBatchStatusActionData.js";
import {
  pendlePairsList,
  setPairBatchStatusActionData,
} from "./setPairBatchStatusActionData.js";

export type PendleAdapterState = AdapterStateBase & {
  pairs: PendlePairStatus[];
};

export interface PendleAdapterDeployParams {
  type: "PENDLE_ROUTER";
  version: 310 | 311;
  target: Address;
}

export const pendlePlugin = defineAdapterPlugin<
  PendleAdapterDeployParams,
  PendleAdapterState
>()({
  type: "PENDLE_ROUTER",
  name: "Pendle",
  description: "Adapter for Pendle and its forks",
  getDefaultParams: () => ({
    type: "PENDLE_ROUTER",
    version: 311,
    target: "0x888888888889758F76e7103c6CbF23ABbF58F946",
  }),
  isEditable: false,
  allowGas: 2_750_000, // got 2,710,289
  stateSchema: adapterStateSchema<PendleAdapterState>({
    pairs: pendlePairsList,
  }),
  getDeployState: params => ({
    ...deployState("PENDLE_ROUTER", params),
    pairs: [],
  }),
  getDeployParams: args => adapterDeployParams(args),
  getStateFromSDK: (adapter): PendleAdapterState => ({
    ...sdkState("PENDLE_ROUTER", adapter),
    pairs: (adapter as unknown as PendleRouterAdapterContract).allowedPairs.map(
      pair => ({
        market: pair.market,
        inputToken: pair.inputToken,
        pendleToken: pair.pendleToken,
        // the SDK reports no token type for v310, which only trades PTs
        pendleTokenType: pair.pendleTokenType ?? PendleTokenType.PT,
        status: pair.status,
      }),
    ),
  }),
  deployParamsSchema: plainDeployParamsSchema<PendleAdapterDeployParams>(
    "PENDLE_ROUTER",
    [310, 311],
  ),
  actions: { setPairStatusBatch: setPairBatchStatusActionData },
});
