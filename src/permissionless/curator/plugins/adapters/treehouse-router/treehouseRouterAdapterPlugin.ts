import { type Address, zeroAddress } from "viem";
import type { TreehouseRouterAdapterContract } from "../../../../../onchain/index.js";
import {
  adapterDeployParams,
  deployState,
  plainDeployParamsSchema,
  readAddress,
  resolveTargetTokens,
  sdkState,
} from "../adapterPluginHelpers.js";
import { adapterStateSchema } from "../adapterStateSchema.js";
import type { AdapterStateBase } from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import type { TreehouseRouterAssetStatus } from "./setAssetStatusBatchActionData.js";
import {
  setAssetStatusBatchActionData,
  treehouseRouterAllowedAssetsList,
} from "./setAssetStatusBatchActionData.js";

export type TreehouseRouterAdapterState = AdapterStateBase & {
  allowedAssets: TreehouseRouterAssetStatus[];
};

export interface TreehouseRouterAdapterDeployParams {
  type: "TREEHOUSE_ROUTER";
  version: 310;
  target: Address;
}

export const treehouseRouterAdapterPlugin = defineAdapterPlugin<
  TreehouseRouterAdapterDeployParams,
  TreehouseRouterAdapterState
>()({
  type: "TREEHOUSE_ROUTER",
  name: "Treehouse Router",
  description: "Adapter for Treehouse Router (deposits into tAsset)",
  getDefaultParams: () => ({
    type: "TREEHOUSE_ROUTER",
    version: 310,
    target: zeroAddress,
  }),
  isEditable: false,
  allowGas: 2_000_000, // not measured
  stateSchema: adapterStateSchema<TreehouseRouterAdapterState>({
    allowedAssets: treehouseRouterAllowedAssetsList,
  }),
  getDeployState: params => ({
    ...deployState("TREEHOUSE_ROUTER", params),
    allowedAssets: [],
  }),
  getDeployParams: args => adapterDeployParams(args),
  resolveValidation: args =>
    resolveTargetTokens(
      args,
      async () => [
        await readAddress(args.client, args.params.target, "TASSET"),
      ],
      "treehouse router",
    ),
  getStateFromSDK: (adapter): TreehouseRouterAdapterState => ({
    ...sdkState("TREEHOUSE_ROUTER", adapter),
    allowedAssets: (
      adapter as unknown as TreehouseRouterAdapterContract
    ).allowedAssets.map(asset => ({ asset, allowed: true })),
  }),
  deployParamsSchema:
    plainDeployParamsSchema<TreehouseRouterAdapterDeployParams>(
      "TREEHOUSE_ROUTER",
    ),
  actions: { setAssetStatusBatch: setAssetStatusBatchActionData },
});
