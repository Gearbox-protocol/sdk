import { type Address, zeroAddress } from "viem";
import { z } from "zod/v4";
import type { MellowWrapperAdapterContract } from "../../../../../onchain/index.js";
import { addressSchema } from "../../../validationSchemas.js";
import {
  adapterDeployParams,
  deployState,
  readAddress,
  resolveTargetTokens,
  sdkState,
} from "../adapterPluginHelpers.js";
import { adapterStateSchema } from "../adapterStateSchema.js";
import type {
  AdapterStateBase,
  ResolveAdapterValidationArgs,
} from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import type { MellowVaultStatus } from "./setVaultStatusBatchActionData.js";
import {
  mellowWrapperVaultsList,
  setVaultStatusBatchActionData,
} from "./setVaultStatusBatchActionData.js";

export type MellowWrapperAdapterState = AdapterStateBase & {
  vaults: MellowVaultStatus[];
};

export interface MellowWrapperAdapterDeployParams {
  type: "MELLOW_WRAPPER";
  version: 310;
  target: Address;
  referral: Address;
}

export const mellowWrapperDeployParamsSchema = z.object({
  type: z.literal("MELLOW_WRAPPER"),
  version: z.literal(310),
  target: addressSchema,
  referral: addressSchema,
});

export const mellowWrapperAdapterPlugin = defineAdapterPlugin<
  MellowWrapperAdapterDeployParams,
  MellowWrapperAdapterState
>()({
  type: "MELLOW_WRAPPER",
  name: "Mellow Wrapper",
  description: "Adapter for Mellow Wrapper",
  getDefaultParams: () => ({
    type: "MELLOW_WRAPPER",
    version: 310,
    target: "0xfd4a4922d1afe70000ce0ec6806454e78256504e",
    referral: zeroAddress,
  }),
  isEditable: true,
  allowGas: 2_000_000, // not measured
  stateSchema: adapterStateSchema<MellowWrapperAdapterState>({
    vaults: mellowWrapperVaultsList,
  }),
  getDeployState: (params: MellowWrapperAdapterDeployParams) => ({
    ...deployState("MELLOW_WRAPPER", params),
    vaults: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: MellowWrapperAdapterDeployParams;
  }) => adapterDeployParams(args, [args.params.referral]),
  resolveValidation: (
    args: ResolveAdapterValidationArgs<MellowWrapperAdapterDeployParams>,
  ) =>
    resolveTargetTokens(
      args,
      async () => [await readAddress(args.client, args.params.target, "WETH")],
      "mellow wrapper",
    ),
  getStateFromSDK: (adapter): MellowWrapperAdapterState => ({
    ...sdkState("MELLOW_WRAPPER", adapter),
    vaults: (
      adapter as unknown as MellowWrapperAdapterContract
    ).allowedVaults.map(vault => ({ vault, allowed: true })),
  }),
  deployParamsSchema: mellowWrapperDeployParamsSchema,
  actions: { setVaultStatusBatch: setVaultStatusBatchActionData },
});
