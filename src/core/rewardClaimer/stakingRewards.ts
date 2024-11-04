import {
  AdapterInterface,
  contractParams,
  contractsByAddress,
  MULTICALL_ADDRESS,
  PartialRecord,
  StakingRewardsParams,
  SupportedContract,
  SupportedToken,
  tokenSymbolByAddress,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import { Abi, Address, encodeFunctionData, PublicClient } from "viem";

import { iBaseRewardPoolAbi, iStakingRewardsAdapterAbi } from "../../types";
import { CreditAccountData } from "../creditAccount";
import { CreditManagerData } from "../creditManager";
import { AdapterWithType, Rewards } from "../rewardClaimer";

type DistributionList = Array<Array<RewardDistribution>>;
type CallsList = Array<
  Array<{
    address: Address;
    abi: Abi;
    functionName: string;
    args: unknown[];
  }>
>;

export interface RewardDistribution {
  contract: Rewards["contract"];
  protocol: Rewards["protocol"];
  token: SupportedToken;

  adapter: Address;
  contractAddress: Address;
}

// convex[totalSupply, ...tokens] aura[totalSupply, multiplier, ...tokens]
export class StakingRewards {
  static async findRewards(
    ca: CreditAccountData,
    provider: PublicClient,

    adapters: Array<AdapterWithType>,
    rewardTokens: Array<Address>,
  ): Promise<Array<Rewards>> {
    const prepared = StakingRewards.prepareMultiCalls(
      ca.addr,
      adapters,
      rewardTokens,
    );

    if (!prepared) return [];
    const { calls, distribution } = prepared;

    const callsTotal = calls.flat(1);

    const allCalls = [...callsTotal];
    if (allCalls.length === 0) return [];

    const response = (await provider.multicall({
      allowFailure: false,
      multicallAddress: MULTICALL_ADDRESS,
      contracts: allCalls,
    })) as Array<bigint>;

    const callsEnd = callsTotal.length;
    const callsResponse = response.slice(0, callsEnd);

    const results = StakingRewards.parseResults(callsResponse, distribution);

    return results;
  }

  static getRewardTokenCalls(cm: CreditManagerData) {
    const adapters = this.findAdapters(cm);

    const calls = adapters.reduce<CallsList>((acc, a) => {
      acc.push([
        {
          address: a.contractAddress,
          abi: iStakingRewardsAdapterAbi,
          functionName: "rewardsToken",
          args: [],
        },
      ]);

      return acc;
    }, []);

    return { calls, adapters };
  }

  private static findAdapters(cm: CreditManagerData) {
    const contractsRecord = TypedObjectUtils.entries(contractParams).reduce<
      Record<SupportedContract, StakingRewardsParams>
    >((acc, [token, params]) => {
      if (params.type === AdapterInterface.STAKING_REWARDS) {
        acc[token] = params;
      }
      return acc;
    }, {} as Record<SupportedContract, StakingRewardsParams>);

    return Object.entries(cm.adapters)
      .filter(
        ([contract]) =>
          !!contractsRecord[contractsByAddress[contract.toLowerCase()]],
      )
      .map(
        ([contract, adapter]): AdapterWithType => ({
          adapter,
          contractAddress: contract as Address,
          contract: contractsByAddress[contract.toLowerCase()],
        }),
      );
  }

  static prepareMultiCalls(
    creditAccount: Address,
    adapters: Array<AdapterWithType>,
    rewardTokens: Array<Address>,
  ) {
    if (adapters.length === 0) return undefined;

    const res = adapters.reduce<{
      distribution: DistributionList;
      calls: CallsList;
    }>(
      (acc, a, i) => {
        const currentContract = contractParams[
          a.contract
        ] as StakingRewardsParams;
        const rewardToken = rewardTokens[i];

        const currentCalls: CallsList[number] = [];
        const currentDistribution: DistributionList[number] = [];

        currentCalls.push({
          address: a.contractAddress,
          abi: iBaseRewardPoolAbi,
          functionName: "earned",
          args: [creditAccount],
        });
        currentDistribution.push({
          protocol: currentContract.protocol,
          contract: a.contract,
          token: tokenSymbolByAddress[rewardToken.toLowerCase()],

          contractAddress: a.contractAddress,
          adapter: a.adapter,
        });

        acc.calls.push(currentCalls);
        acc.distribution.push(currentDistribution);

        return acc;
      },
      {
        distribution: [],
        calls: [],
      },
    );
    return res;
  }

  static parseResults(
    response: Array<bigint>,
    distribution: DistributionList,
  ): Array<Rewards> {
    const rewardsRecord: PartialRecord<SupportedContract, Rewards> = {};

    let start = 0;
    distribution.forEach(list => {
      // rewards[]
      const end = start + list.length;
      const rewardsResp = response.slice(start, end);
      start = end;

      if (rewardsResp.length !== list.length) {
        throw new Error(
          `Rewards response length mismatch: expected: ${list.length}, got: ${rewardsResp.length}`,
        );
      }

      const rewardObject = this.getRewardObject(rewardsResp[0] || 0n, list[0]);

      if (rewardObject) rewardsRecord[list[0].contract] = rewardObject;
    });

    const result = Object.values(rewardsRecord);

    return result;
  }

  static getRewardObject(reward: bigint, distribution: RewardDistribution) {
    const callData = encodeFunctionData({
      abi: iBaseRewardPoolAbi,
      functionName: "getReward",
      args: [],
    });

    const base: Rewards = {
      contract: distribution.contract,
      protocol: distribution.protocol,
      rewards: {
        [distribution.token]: reward,
      },
      calls: [
        {
          target: distribution.adapter,
          callData,
        },
      ],
    };

    if (Object.values(base.rewards).some(r => r > 0)) {
      return base;
    }
    return undefined;
  }
}
