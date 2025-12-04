import { iStakingRewardsAdapterAbi } from "@gearbox-protocol/integrations-v3";
import { type Address, decodeAbiParameters } from "viem";
import type { ConstructOptions } from "../../../sdk/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iStakingRewardsAdapterAbi;
type abi = typeof abi;

export class StakingRewardsAdapterContract extends AbstractAdapterContract<
  typeof abi
> {
  public readonly stakingToken: Address;
  public readonly rewardsToken: Address;
  public readonly stakedPhantomToken: Address;
  public readonly referral: number;

  constructor(
    options: ConstructOptions,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(options, { ...args, abi });

    const version = Number(args.baseParams.version);
    if (version === 310) {
      // Decode parameters directly using ABI decoding
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "stakingToken" },
          { type: "address", name: "rewardsToken" },
          { type: "address", name: "stakedPhantomToken" },
        ],
        args.baseParams.serializedParams,
      );

      this.stakingToken = decoded[2];
      this.rewardsToken = decoded[3];
      this.stakedPhantomToken = decoded[4];
      this.referral = 0;
    } else {
      // Decode parameters directly using ABI decoding
      const decoded = decodeAbiParameters(
        [
          { type: "address", name: "creditManager" },
          { type: "address", name: "targetContract" },
          { type: "address", name: "stakingToken" },
          { type: "address", name: "rewardsToken" },
          { type: "address", name: "stakedPhantomToken" },
          { type: "uint16", name: "referral" },
        ],
        args.baseParams.serializedParams,
      );

      this.stakingToken = decoded[2];
      this.rewardsToken = decoded[3];
      this.stakedPhantomToken = decoded[4];
      this.referral = decoded[5];
    }
  }
}
