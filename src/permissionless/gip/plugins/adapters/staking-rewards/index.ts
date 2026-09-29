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
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import {
  addressSchema,
  positiveNumberSchema,
} from "../../../core/validation.js";
import type {
  AdapterPlugin,
  BaseAdapterState,
  ValidateAdapterParamsArgs,
} from "../logic.js";
import { validateCollateralTokens } from "../utils.js";

export type StakingRewardsAdapterState = BaseAdapterState;

export type StakingRewardsAdapter311DeployParams = {
  type: "STAKING_REWARDS";
  version: 311 | 312;
  target: Address;
  stakedToken: Address;
  referral: number;
};

export type StakingRewardsAdapterDeployParams =
  | {
      type: "STAKING_REWARDS";
      version: 310;
      target: Address;
      stakedToken: Address;
    }
  | StakingRewardsAdapter311DeployParams;

export const stakingRewardsDeployParamsSchema = z.object({
  type: z.literal("STAKING_REWARDS"),
  version: z.literal(312),
  target: addressSchema,
  stakedToken: addressSchema,
  referral: positiveNumberSchema,
});

export const stakingRewardsPlugin: AdapterPlugin = {
  name: "Sky Staking Rewards",
  description: "Adapter for Sky Staking Rewards",
  getDefaultParams: () => ({
    type: "STAKING_REWARDS",
    version: 312,
    target: "0x0650CAF159C5A49f711e8169D4336ECB9b950275",
    stakedToken: zeroAddress,
    referral: 0,
  }),
  isEditable: true,
  getDeployState: (params: StakingRewardsAdapterDeployParams) => ({
    type: "STAKING_REWARDS",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: StakingRewardsAdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        args.params.version === 310
          ? [args.creditManager, args.params.target, args.params.stakedToken]
          : [
              args.creditManager,
              args.params.target,
              args.params.stakedToken,
              args.params.referral,
            ],
      ),
    };
  },
  validateParams: async (
    args: ValidateAdapterParamsArgs<StakingRewardsAdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const { target } = params;

    if (!isAddress(target)) return "Invalid staking rewards address";

    try {
      const tokens = await client.multicall({
        allowFailure: false,
        contracts: [
          {
            address: target,
            abi: [
              {
                inputs: [],
                name: "stakingToken",
                outputs: [{ name: "", type: "address" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "stakingToken",
            args: [],
          },
          {
            address: target,
            abi: [
              {
                inputs: [],
                name: "rewardsToken",
                outputs: [{ name: "", type: "address" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "rewardsToken",
            args: [],
          },
        ],
      });

      return validateCollateralTokens({ ...args, tokens });
    } catch {
      return "Invalid staking rewards";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): StakingRewardsAdapterState => {
    return {
      type: "STAKING_REWARDS",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
};
