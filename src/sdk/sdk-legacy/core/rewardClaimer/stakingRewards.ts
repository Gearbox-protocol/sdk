import type { Abi, Address, PublicClient } from "viem";
import { encodeFunctionData } from "viem";

import { ADDRESS_0X0, MULTICALL_ADDRESS } from "../../../constants";
import type {
  StakingRewardsParams,
  SupportedContract,
  SupportedToken,
} from "../../../sdk-gov-legacy";
import {
  AdapterInterface,
  contractParams,
  contractsByAddress,
} from "../../../sdk-gov-legacy";
import type { PartialRecord } from "../../../utils";
import { TypedObjectUtils } from "../../../utils";
import type { TokenData } from "../../tokens/tokenData";
import { iBaseRewardPoolAbi, iStakingRewardsAdapterAbi } from "../../types";
import type { CreditAccountData_Legacy } from "../creditAccount";
import type { CreditManagerData_Legacy } from "../creditManager";
import type { AdapterWithType, Rewards } from ".";

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

export class StakingRewards {
  static async findRewards(
    ca: CreditAccountData_Legacy,
    provider: PublicClient,

    adapters: Array<AdapterWithType>,
    rewardTokens: Array<Address | undefined>,
    tokensList: Record<Address, TokenData>,
  ): Promise<Array<Rewards>> {
    const prepared = StakingRewards.prepareMultiCalls(
      ca.creditAccount,
      adapters,
      rewardTokens,
      tokensList,
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

  static getRewardTokenCalls(cm: CreditManagerData_Legacy) {
    const adapters = this.findAdapters(cm);

    const calls = adapters.reduce<CallsList>((acc, a) => {
      acc.push([
        {
          address: a.adapter,
          abi: iStakingRewardsAdapterAbi,
          functionName: "rewardsToken",
          args: [],
        },
      ]);

      return acc;
    }, []);

    return { calls, adapters };
  }

  private static findAdapters(cm: CreditManagerData_Legacy) {
    const contractsRecord = TypedObjectUtils.entries(contractParams).reduce<
      Record<SupportedContract, StakingRewardsParams>
    >(
      (acc, [token, params]) => {
        if (params.type === AdapterInterface.STAKING_REWARDS) {
          acc[token] = params;
        }
        return acc;
      },
      {} as Record<SupportedContract, StakingRewardsParams>,
    );

    return Object.entries(cm.adapters)
      .filter(
        ([contract]) =>
          !!contractsRecord[contractsByAddress[contract.toLowerCase()]],
      )
      .map(
        ([contract, adapter]): AdapterWithType => ({
          adapter: adapter.address,
          contractAddress: contract as Address,
          contract: contractsByAddress[contract.toLowerCase()],
        }),
      );
  }

  static prepareMultiCalls(
    creditAccount: Address,
    adapters: Array<AdapterWithType>,
    rewardTokens: Array<Address | undefined>,
    tokensList: Record<Address, TokenData>,
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
        const rewardToken = rewardTokens[i]?.toLowerCase() as Address;

        const currentCalls: CallsList[number] = [];
        const currentDistribution: DistributionList[number] = [];

        if (
          rewardToken &&
          rewardToken !== ADDRESS_0X0 &&
          tokensList[rewardToken]
        ) {
          // since we generate 1 call above
          currentCalls.push({
            address: a.contractAddress,
            abi: iBaseRewardPoolAbi,
            functionName: "earned",
            args: [creditAccount],
          });
          currentDistribution.push({
            protocol: currentContract.protocol,
            contract: a.contract,
            token: tokensList[rewardToken].symbol,

            contractAddress: a.contractAddress,
            adapter: a.adapter,
          });

          acc.calls.push(currentCalls);
          acc.distribution.push(currentDistribution);
        }

        return acc;
      },
      {
        distribution: [],
        calls: [],
      },
    );
    return res;
  }

  private static parseResults(
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

  private static getRewardObject(
    reward: bigint,
    distribution: RewardDistribution,
  ) {
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
