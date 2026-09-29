import {
  type Abi,
  type Address,
  encodeAbiParameters,
  isAddress,
  stringToHex,
  zeroAddress,
} from "viem";
import {
  type AbstractAdapterContract,
  adapterConstructorAbi,
} from "../../../../../onchain/index.js";
import type { DeployParams } from "../../../core/market-tx.js";
import type {
  AdapterPlugin,
  BaseAdapterState,
  ValidateAdapterParamsArgs,
} from "../logic.js";
import { validateCollateralTokens } from "../utils.js";

export type ConvexV1BaseRewardPoolAdapterState = BaseAdapterState;

export interface ConvexV1BaseRewardPoolAdapterDeployParams {
  type: "CVX_V1_BASE_REWARD_POOL";
  version: 310 | 311;
  target: Address;
  stakedToken: Address;
}

export const convexV1BaseRewardPoolPlugin: AdapterPlugin = {
  name: "ConvexV1 Base Reward Pool",
  description: "Adapter for Convex V1 Base Reward Pool",
  getDefaultParams: () => ({
    type: "CVX_V1_BASE_REWARD_POOL",
    version: 311,
    target: "0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8" as Address,
    stakedToken: zeroAddress,
  }),
  isEditable: true,
  getDeployState: (params: ConvexV1BaseRewardPoolAdapterDeployParams) => ({
    type: "CVX_V1_BASE_REWARD_POOL",
    version: params.version,
    target: params.target,
    adapter: zeroAddress,
    isForbidden: false,
  }),
  getDeployParams: (args: {
    creditManager: Address;
    params: ConvexV1BaseRewardPoolAdapterDeployParams;
  }): DeployParams => {
    return {
      postfix: stringToHex(args.params.type, { size: 32 }),
      salt: stringToHex("", { size: 32 }),
      constructorParams: encodeAbiParameters(
        adapterConstructorAbi[args.params.type][args.params.version],
        [args.creditManager, args.params.target, args.params.stakedToken],
      ),
    };
  },

  validateParams: async (
    args: ValidateAdapterParamsArgs<ConvexV1BaseRewardPoolAdapterDeployParams>,
  ): Promise<false | string> => {
    const { client, params } = args;
    const { target } = params;

    if (!isAddress(target)) return "Invalid base reward pool address";
    try {
      const [stakingToken, rewardToken] = await client.multicall({
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
                name: "rewardToken",
                outputs: [{ name: "", type: "address" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "rewardToken",
            args: [],
          },
          {
            address: target,
            abi: [
              {
                inputs: [],
                name: "extraRewardsLength",
                outputs: [{ name: "", type: "uint256" }],
                stateMutability: "view",
                type: "function",
              },
            ],
            functionName: "extraRewardsLength",
            args: [],
          },
        ],
      });

      return validateCollateralTokens({
        ...args,
        tokens: [stakingToken, rewardToken],
      });

      // TODO: check extra and secondary rewards masks
    } catch {
      return "Invalid base reward pool";
    }
  },
  getStateFromSDK: (
    adapter: AbstractAdapterContract<Abi, Abi>,
  ): ConvexV1BaseRewardPoolAdapterState => {
    return {
      type: "CVX_V1_BASE_REWARD_POOL",
      version: adapter.version,
      target: adapter.targetContract,
      adapter: adapter.address,
      isForbidden: false,
    };
  },
};
