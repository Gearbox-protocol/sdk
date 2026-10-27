import type { Address } from "viem";
import {
  adapterDeployParams,
  getter,
  plainAdapter,
  plainDeployParamsSchema,
  readAddresses,
  resolveTargetTokens,
} from "../adapterPluginHelpers.js";
import type {
  AdapterStateBase,
  ResolveAdapterValidationArgs,
} from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";

export type DaiUsdsAdapterState = AdapterStateBase;

export interface DaiUsdsAdapterDeployParams {
  type: "DAI_USDS_EXCHANGE";
  version: 310;
  target: Address;
}

export const daiUsdsAdapterPlugin = defineAdapterPlugin<
  DaiUsdsAdapterDeployParams,
  DaiUsdsAdapterState
>()({
  type: "DAI_USDS_EXCHANGE",
  name: "DAI USDS Exchange",
  description: "Adapter for SKY Dai/USDS Exchange",
  getDefaultParams: () => ({
    type: "DAI_USDS_EXCHANGE",
    version: 310,
    target: "0x3225737a9Bbb6473CB4a45b7244ACa2BeFdB276A" as Address,
  }),
  isEditable: false,
  allowGas: 950_000, // got 915,913
  ...plainAdapter("DAI_USDS_EXCHANGE"),
  getDeployParams: args => adapterDeployParams(args),
  resolveValidation: (
    args: ResolveAdapterValidationArgs<DaiUsdsAdapterDeployParams>,
  ) => {
    const { target } = args.params;
    return resolveTargetTokens(args, () =>
      readAddresses(args.client, [
        getter(target, "dai"),
        getter(target, "usds"),
      ]),
    );
  },
  deployParamsSchema:
    plainDeployParamsSchema<DaiUsdsAdapterDeployParams>("DAI_USDS_EXCHANGE"),
  actions: {},
});
