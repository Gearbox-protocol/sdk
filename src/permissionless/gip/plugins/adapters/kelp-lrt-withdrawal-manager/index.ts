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
  type KelpLRTWithdrawalManagerAdapterContract,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import { addressSchema } from "../../../core/validation.js";
import { kelpLRTDepositPoolPlugin } from "../kelp-lrt-deposit-pool/index.js";
import type {
  AdapterPlugin,
  BaseAdapterState,
  ValidateAdapterParamsArgs,
} from "../logic.js";
import type {
  KelpLRTWithdrawalManagerTokenOutStatus,
  SetTokensOutStatusBatchAction,
} from "./set-tokens-out-status-batch-action.js";

export type KelpLRTWithdrawalManagerAdapterState = BaseAdapterState & {
  tokensOut: KelpLRTWithdrawalManagerTokenOutStatus[];
};

export interface KelpLRTWithdrawalManagerAdapterDeployParams {
  type: "KELP_WITHDRAWAL";
  version: 310;
  target: Address;
  referralId: string;
}

export const kelpLRTWithdrawalManagerPlugin: AdapterPlugin = {
  name: "Kelp LRT Withdrawal Manager",
  description: "Adapter for Kelp LRT Withdrawal Manager",
  getDefaultParams: () => ({
    type: "KELP_WITHDRAWAL",
    version: 310,
    target: zeroAddress,
    referralId: "",
  }),
  isEditable: true,
  getDeployState: (params: KelpLRTWithdrawalManagerAdapterDeployParams) => ({
    type: "KELP_WITHDRAWAL",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
    tokensOut: [],
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: KelpLRTWithdrawalManagerAdapterDeployParams;
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
    args: ValidateAdapterParamsArgs<KelpLRTWithdrawalManagerAdapterDeployParams>,
  ): Promise<false | string> => {
    // @note use same validation as for kelp deposit pool
    const validate = kelpLRTDepositPoolPlugin.validateParams;
    if (validate) {
      return await validate({
        ...args,
        params: {
          type: "KELP_WITHDRAWAL",
          version: 310,
          target: args.params.target,
          referralId: args.params.referralId,
        },
      });
    }
    return false;
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): KelpLRTWithdrawalManagerAdapterState => {
    const kelpAdapter =
      adapter as unknown as KelpLRTWithdrawalManagerAdapterContract;
    return {
      type: "KELP_WITHDRAWAL",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
      tokensOut: kelpAdapter.allowedTokensOut.map(
        ({ tokenOut, phantomToken }) => ({
          tokenOut,
          phantomToken,
          allowed: true,
        }),
      ),
    };
  },
};

export type KelpLRTWithdrawalManagerMarketActions =
  SetTokensOutStatusBatchAction;

export const KelpLRTWithdrawalManagerMarketActionsSchema = z.object({
  type: z.literal("ADAPTER::KELP_WITHDRAWAL::setTokensOutStatusBatch"),
  creditManager: addressSchema,
  version: z.literal(310),
  target: addressSchema,
  params: z.array(
    z.object({
      tokenOut: addressSchema,
      phantomToken: addressSchema,
      allowed: z.boolean(),
    }),
  ),
});
