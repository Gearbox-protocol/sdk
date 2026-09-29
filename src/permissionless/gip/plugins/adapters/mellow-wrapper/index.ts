import {
  type Abi,
  type Address,
  encodeAbiParameters,
  isAddress,
  stringToHex,
  zeroAddress,
} from "viem";
import { z } from "zod";
import {
  type AbstractAdapterContract,
  adapterConstructorAbi,
  type MellowWrapperAdapterContract,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema } from "../../../core/validation.js";
import type {
  AdapterPlugin,
  BaseAdapterState,
  ValidateAdapterParamsArgs,
} from "../logic.js";
import { validateCollateralTokens } from "../utils.js";

import type {
  MellowVaultStatus,
  SetVaultStatusBatchAction,
} from "./set-vault-status-batch-action.js";

export type MellowWrapperAdapterState = BaseAdapterState & {
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

export const mellowWrapperAdapterPlugin: AdapterPlugin = {
  name: "Mellow Wrapper",
  description: "Adapter for Mellow Wrapper",
  getDefaultParams: () => ({
    type: "MELLOW_WRAPPER",
    version: 310,
    target: "0xfd4a4922d1afe70000ce0ec6806454e78256504e",
    referral: zeroAddress,
  }),
  isEditable: true,
  getDeployState: (params: MellowWrapperAdapterDeployParams) => ({
    type: "MELLOW_WRAPPER",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    vaults: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: MellowWrapperAdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        [args.creditManager, args.params.target, args.params.referral],
      ),
    };
  },
  validateParams: async (
    args: ValidateAdapterParamsArgs<MellowWrapperAdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const { target } = params;

    if (!isAddress(target)) return "Invalid mellow wrapper address";
    try {
      const weth = await client.readContract({
        address: target,
        abi: [
          {
            inputs: [],
            name: "WETH",
            outputs: [{ name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "WETH",
      });

      return validateCollateralTokens({
        ...args,
        tokens: [weth],
      });
    } catch {
      return "Invalid mellow wrapper";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): MellowWrapperAdapterState => {
    const mellowWrapperAdapter =
      adapter as unknown as MellowWrapperAdapterContract;
    return {
      type: "MELLOW_WRAPPER",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      vaults: mellowWrapperAdapter.allowedVaults.map(vault => ({
        vault: vault,
        allowed: true,
      })),
    };
  },
};

export type MellowWrapperMarketActions = SetVaultStatusBatchAction;

export const mellowWrapperMarketActionsSchema = z.object({
  type: z.literal("ADAPTER::MELLOW_WRAPPER::setVaultStatusBatch"),
  creditManager: addressSchema,
  version: z.literal(310),
  target: addressSchema,
  params: z.array(
    z.object({
      vault: addressSchema,
      status: z.boolean(),
    }),
  ),
});
