import {
  type Abi,
  type Address,
  encodeAbiParameters,
  stringToHex,
  zeroAddress,
} from "viem";
import { z } from "zod";
import {
  type AbstractAdapterContract,
  adapterConstructorAbi,
  type MellowClaimerAdapterContract,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema } from "../../../core/validation.js";
import type { AdapterPlugin, BaseAdapterState } from "../logic.js";

import type {
  MellowMultiVaultStatus,
  SetMultiVaultStatusBatchAction,
} from "./set-multi-vault-status-batch-action.js";

export type MellowClaimerAdapterState = BaseAdapterState & {
  vaults: MellowMultiVaultStatus[];
};

export interface MellowClaimerAdapterDeployParams {
  type: "MELLOW_CLAIMER";
  version: 310;
  target: Address;
}

export const mellowClaimerAdapterPlugin: AdapterPlugin = {
  name: "Mellow Claimer",
  description: "Adapter for Mellow Claimer",
  getDefaultParams: () => ({
    type: "MELLOW_CLAIMER",
    version: 310,
    target: "0x25024a3017B8da7161d8c5DCcF768F8678fB5802",
    referral: zeroAddress,
  }),
  isEditable: false,
  getDeployState: (params: MellowClaimerAdapterDeployParams) => ({
    type: "MELLOW_CLAIMER",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    vaults: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: MellowClaimerAdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        [args.creditManager, args.params.target],
      ),
    };
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): MellowClaimerAdapterState => {
    const mellowClaimerAdapter =
      adapter as unknown as MellowClaimerAdapterContract;
    return {
      type: "MELLOW_CLAIMER",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      vaults: mellowClaimerAdapter.allowedMultiVaults.map(multiVault => ({
        multiVault,
        stakedToken: zeroAddress, // TODO: get staked token from mellow claimer contract
        allowed: true,
      })),
    };
  },
};

export type MellowClaimerMarketActions = SetMultiVaultStatusBatchAction;

export const mellowClaimerMarketActionsSchema = z.object({
  type: z.literal("ADAPTER::MELLOW_CLAIMER::setMultiVaultStatusBatch"),
  creditManager: addressSchema,
  version: z.literal(310),
  target: addressSchema,
  params: z.array(
    z.object({
      multiVault: addressSchema,
      stakedToken: addressSchema,
      status: z.boolean(),
    }),
  ),
});
