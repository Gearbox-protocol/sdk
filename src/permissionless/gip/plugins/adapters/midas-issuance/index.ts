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
  type MidasIssuanceVaultAdapterContract,
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
  MidasIssuanceTokenStatus,
  SetTokenAllowedStatusBatchAction,
} from "./set-token-allowed-status-batch-action.js";

export type MidasIssuanceAdapterState = BaseAdapterState & {
  allowedTokens: MidasIssuanceTokenStatus[];
};

export interface MidasIssuanceAdapterDeployParams {
  type: "MIDAS_ISSUANCE_VAULT";
  version: 310 | 311;
  target: Address;
  reffererId: string;
}

export const midasIssuanceDeployParamsSchema = z.object({
  type: z.literal("MIDAS_ISSUANCE_VAULT"),
  version: z.literal(311),
  target: addressSchema,
  reffererId: z.string(),
});

export const midasIssuanceAdapterPlugin: AdapterPlugin = {
  name: "Midas Issuance",
  description: "Adapter for Midas Issuance",
  getDefaultParams: () => ({
    type: "MIDAS_ISSUANCE_VAULT",
    version: 311,
    target: zeroAddress,
    reffererId: "",
  }),
  isEditable: true,
  getDeployState: (params: MidasIssuanceAdapterDeployParams) => ({
    type: "MIDAS_ISSUANCE_VAULT",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    allowedTokens: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: MidasIssuanceAdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        [
          args.creditManager,
          args.params.target,
          stringToHex(args.params.reffererId, { size: 32 }),
        ],
      ),
    };
  },
  validateParams: async (
    args: ValidateAdapterParamsArgs<MidasIssuanceAdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const { target } = params;

    if (!isAddress(target)) return "Invalid midas issuance vault address";
    try {
      const mToken = await client.readContract({
        address: target,
        abi: [
          {
            inputs: [],
            name: "mToken",
            outputs: [{ name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "mToken",
      });

      return validateCollateralTokens({
        ...args,
        tokens: [mToken],
      });
    } catch {
      return "Invalid midas issuance vault";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): MidasIssuanceAdapterState => {
    const midasIssuanceAdapter =
      adapter as unknown as MidasIssuanceVaultAdapterContract;
    return {
      type: "MIDAS_ISSUANCE_VAULT",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      allowedTokens: midasIssuanceAdapter.allowedTokens.map(token => ({
        token: token,
        allowed: true,
      })),
    };
  },
};

export type MidasIssuanceMarketActions = SetTokenAllowedStatusBatchAction;

export const midasIssuanceMarketActionsSchema = z.object({
  type: z.literal("ADAPTER::MIDAS_ISSUANCE_VAULT::setTokenAllowedStatusBatch"),
  creditManager: addressSchema,
  version: z.literal(310 | 311),
  target: addressSchema,
  allowedTokens: z.array(
    z.object({
      token: addressSchema,
      allowed: z.boolean(),
    }),
  ),
});
