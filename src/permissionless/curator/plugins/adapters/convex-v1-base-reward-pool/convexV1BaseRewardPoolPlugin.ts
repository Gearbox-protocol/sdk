import { type Address, zeroAddress } from "viem";
import {
  adapterDeployParams,
  getter,
  plainAdapter,
  readAddresses,
  resolveTargetTokens,
  stakedTokenDeployParamsSchema,
} from "../adapterPluginHelpers.js";
import type {
  AdapterStateBase,
  ResolveAdapterValidationArgs,
} from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";

export type ConvexV1BaseRewardPoolAdapterState = AdapterStateBase;

export interface ConvexV1BaseRewardPoolAdapterDeployParams {
  type: "CVX_V1_BASE_REWARD_POOL";
  version: 310 | 311;
  target: Address;
  stakedToken: Address;
}

export const convexV1BaseRewardPoolPlugin = defineAdapterPlugin<
  ConvexV1BaseRewardPoolAdapterDeployParams,
  ConvexV1BaseRewardPoolAdapterState
>()({
  type: "CVX_V1_BASE_REWARD_POOL",
  name: "ConvexV1 Base Reward Pool",
  description: "Adapter for Convex V1 Base Reward Pool",
  getDefaultParams: () => ({
    type: "CVX_V1_BASE_REWARD_POOL",
    version: 311,
    target: "0x689440f2Ff927E1f24c72F1087E1FAF471eCe1c8" as Address,
    stakedToken: zeroAddress,
  }),
  isEditable: true,
  allowGas: 1_280_000, // got 1,250,044
  ...plainAdapter("CVX_V1_BASE_REWARD_POOL"),
  getDeployParams: (args: {
    creditManager: Address;
    params: ConvexV1BaseRewardPoolAdapterDeployParams;
  }) => adapterDeployParams(args, [args.params.stakedToken]),
  resolveValidation: (
    args: ResolveAdapterValidationArgs<ConvexV1BaseRewardPoolAdapterDeployParams>,
  ) => {
    const { target } = args.params;
    return resolveTargetTokens(
      args,
      async () => {
        const [stakingToken, rewardToken] = await readAddresses(args.client, [
          getter(target, "stakingToken"),
          getter(target, "rewardToken"),
          // @dev not a token: read only to prove the target is a reward pool
          getter(target, "extraRewardsLength", "uint256"),
        ]);
        // TODO: check extra and secondary rewards masks
        return [stakingToken, rewardToken];
      },
      "base reward pool",
    );
  },
  deployParamsSchema:
    stakedTokenDeployParamsSchema<ConvexV1BaseRewardPoolAdapterDeployParams>(
      "CVX_V1_BASE_REWARD_POOL",
      [310, 311],
    ),
  actions: {},
});
