import type { Address } from "viem";
import {
  adapterDeployParams,
  plainAdapter,
  plainDeployParamsSchema,
} from "../adapterPluginHelpers.js";
import type { AdapterStateBase } from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import { updateSupportedPidsActionData } from "./updateSupportedPidsActionData.js";

export type ConvexV1BoosterAdapterState = AdapterStateBase;

export interface ConvexV1BoosterAdapterDeployParams {
  type: "CVX_V1_BOOSTER";
  version: 310;
  target: Address;
}

export const convexV1BoosterPlugin = defineAdapterPlugin<
  ConvexV1BoosterAdapterDeployParams,
  ConvexV1BoosterAdapterState
>()({
  type: "CVX_V1_BOOSTER",
  name: "ConvexV1 Booster",
  description: "Adapter for Convex V1 Booster",
  getDefaultParams: () => ({
    type: "CVX_V1_BOOSTER",
    version: 310,
    target: "0xF403C135812408BFbE8713b5A23a04b3D48AAE31",
  }),
  isEditable: false,
  allowGas: 1_500_000, // got 1,476,235
  ...plainAdapter("CVX_V1_BOOSTER"),
  getDeployParams: args => adapterDeployParams(args),
  deployParamsSchema:
    plainDeployParamsSchema<ConvexV1BoosterAdapterDeployParams>(
      "CVX_V1_BOOSTER",
    ),
  actions: { updateSupportedPids: updateSupportedPidsActionData },
});
