import { type Address, zeroAddress } from "viem";
import { z } from "zod/v4";
import { addressSchema, uintSchema } from "../../../validationSchemas.js";
import {
  adapterDeployParams,
  getter,
  plainAdapter,
  readAddresses,
  resolveTargetTokens,
} from "../adapterPluginHelpers.js";
import type {
  AdapterStateBase,
  ResolveAdapterValidationArgs,
} from "../defineAdapterPlugin.js";
import { defineAdapterPlugin } from "../defineAdapterPlugin.js";

export type StakingRewardsAdapterState = AdapterStateBase;

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
  /** `uint16` referral code passed to the staking contract; 0 is none. **/
  referral: uintSchema(16),
});

export const stakingRewardsPlugin = defineAdapterPlugin<
  StakingRewardsAdapterDeployParams,
  StakingRewardsAdapterState
>()({
  type: "STAKING_REWARDS",
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
  allowGas: 990_000, // got 981,079
  ...plainAdapter("STAKING_REWARDS"),
  getDeployParams: (args: {
    creditManager: Address;
    params: StakingRewardsAdapterDeployParams;
  }) =>
    adapterDeployParams(
      args,
      args.params.version === 310
        ? [args.params.stakedToken]
        : [args.params.stakedToken, args.params.referral],
    ),
  resolveValidation: (
    args: ResolveAdapterValidationArgs<StakingRewardsAdapterDeployParams>,
  ) => {
    const { target } = args.params;
    return resolveTargetTokens(
      args,
      () =>
        readAddresses(args.client, [
          getter(target, "stakingToken"),
          getter(target, "rewardsToken"),
        ]),
      "staking rewards",
    );
  },
  deployParamsSchema: stakingRewardsDeployParamsSchema,
  actions: {},
});
