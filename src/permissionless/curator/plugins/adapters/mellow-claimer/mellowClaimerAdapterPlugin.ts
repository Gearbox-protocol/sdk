import { type Address, zeroAddress } from "viem";
import type { MellowClaimerAdapterContract } from "../../../../../onchain/index.js";
import {
  adapterDeployParams,
  deployState,
  plainDeployParamsSchema,
  sdkState,
} from "../adapterPluginHelpers.js";
import { adapterStateSchema } from "../adapterStateSchema.js";
import type { AdapterStateBase } from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";
import type { MellowMultiVaultStatus } from "./setMultiVaultStatusBatchActionData.js";
import {
  mellowClaimerVaultsList,
  setMultiVaultStatusBatchActionData,
} from "./setMultiVaultStatusBatchActionData.js";

export type MellowClaimerAdapterState = AdapterStateBase & {
  vaults: MellowMultiVaultStatus[];
};

export interface MellowClaimerAdapterDeployParams {
  type: "MELLOW_CLAIMER";
  version: 310;
  target: Address;
}

export const mellowClaimerAdapterPlugin = defineAdapterPlugin<
  MellowClaimerAdapterDeployParams,
  MellowClaimerAdapterState
>()({
  type: "MELLOW_CLAIMER",
  name: "Mellow Claimer",
  description: "Adapter for Mellow Claimer",
  getDefaultParams: () => ({
    type: "MELLOW_CLAIMER",
    version: 310,
    target: "0x25024a3017B8da7161d8c5DCcF768F8678fB5802",
  }),
  isEditable: false,
  allowGas: 2_000_000, // not measured
  stateSchema: adapterStateSchema<MellowClaimerAdapterState>({
    vaults: mellowClaimerVaultsList,
  }),
  getDeployState: params => ({
    ...deployState("MELLOW_CLAIMER", params),
    vaults: [],
  }),
  getDeployParams: args => adapterDeployParams(args),
  getStateFromSDK: (adapter): MellowClaimerAdapterState => ({
    ...sdkState("MELLOW_CLAIMER", adapter),
    vaults: (
      adapter as unknown as MellowClaimerAdapterContract
    ).allowedMultiVaults.map(multiVault => ({
      multiVault,
      stakedToken: zeroAddress, // TODO: get staked token from mellow claimer contract
      allowed: true,
    })),
  }),
  deployParamsSchema:
    plainDeployParamsSchema<MellowClaimerAdapterDeployParams>("MELLOW_CLAIMER"),
  actions: { setMultiVaultStatusBatch: setMultiVaultStatusBatchActionData },
});
