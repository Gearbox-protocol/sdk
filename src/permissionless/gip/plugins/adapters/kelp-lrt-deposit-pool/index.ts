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
  type KelpLRTDepositPoolAdapterContract,
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
  KelpLRTDepositPoolAssetsStatus,
  SetAssetStatusBatchAction,
} from "./set-asset-status-batch-action.js";

export type KelpLRTDepositPoolAdapterState = BaseAdapterState & {
  allowedAssets: KelpLRTDepositPoolAssetsStatus[];
};

export interface KelpLRTDepositPoolAdapterDeployParams {
  type: "KELP_DEPOSIT_POOL";
  version: 310;
  target: Address;
  referralId: string;
}

export const kelpLRTDepositPoolPlugin: AdapterPlugin = {
  name: "Kelp LRT Deposit Pool",
  description: "Adapter for Kelp LRT Deposit Pool",
  getDefaultParams: () => ({
    type: "KELP_DEPOSIT_POOL",
    version: 310,
    target: zeroAddress,
    referralId: "",
  }),
  isEditable: true,
  getDeployState: (params: KelpLRTDepositPoolAdapterDeployParams) => ({
    type: "KELP_DEPOSIT_POOL",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    allowedAssets: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: KelpLRTDepositPoolAdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        [args.creditManager, args.params.target, args.params.referralId],
      ),
    };
  },
  validateParams: async (
    args: ValidateAdapterParamsArgs<KelpLRTDepositPoolAdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const { target } = params;

    if (!isAddress(target)) return "Invalid target address";

    try {
      const rsETH = await client.readContract({
        address: target,
        abi: [
          {
            inputs: [],
            name: "rsETH",
            outputs: [{ name: "", type: "address" }],
            stateMutability: "view",
            type: "function",
          },
        ],
        functionName: "rsETH",
      });

      return validateCollateralTokens({
        ...args,
        tokens: [rsETH],
      });
    } catch {
      return "Invalid target";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): KelpLRTDepositPoolAdapterState => {
    const kelpAdapter = adapter as unknown as KelpLRTDepositPoolAdapterContract;
    return {
      type: "KELP_DEPOSIT_POOL",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      allowedAssets: kelpAdapter.allowedAssets.map(asset => ({
        asset,
        allowed: true,
      })),
    };
  },
};

export type KelpLRTDepositPoolMarketActions = SetAssetStatusBatchAction;

export const KelpLRTDepositPoolMarketActionsSchema = z.object({
  type: z.literal("ADAPTER::KELP_DEPOSIT_POOL::setAssetStatusBatch"),
  creditManager: addressSchema,
  version: z.literal(310),
  target: addressSchema,
  params: z.array(
    z.object({
      asset: addressSchema,
      allowed: z.boolean(),
    }),
  ),
});
