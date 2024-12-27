import type { Abi, Address, PublicClient } from "viem";
import { encodeFunctionData } from "viem";

import type { NetworkType } from "../../../chain";
import { MULTICALL_ADDRESS } from "../../../constants";
import type {
  AuraPoolParams,
  ContractParams,
  ConvexPoolParams,
  SupportedContract,
  SupportedToken,
} from "../../../sdk-gov-legacy";
import {
  AdapterInterface,
  contractParams,
  contractsByAddress,
  contractsByNetwork,
  Protocols,
  tokenDataByNetwork,
} from "../../../sdk-gov-legacy";
import type { PartialRecord } from "../../../utils";
import { TypedObjectUtils } from "../../../utils";
import { iBaseRewardPoolAbi, iConvexTokenAbi } from "../../types";
import type { CreditAccountData_Legacy } from "../creditAccount";
import type { CreditManagerData_Legacy } from "../creditManager";
import type { AdapterWithType, Rewards } from ".";
import { getAURAMintAmount } from "./aura";
import { AURA_BOOSTER_ABI } from "./auraAbi";
import { getCVXMintAmount } from "./convex";

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

interface ParseProps {
  convexResponse: Array<bigint>;
  convexDistribution: DistributionList;
  convexTotalSupply: bigint;

  auraResponse: Array<bigint>;
  auraDistribution: DistributionList;
  auraTotalSupply: bigint;
}

// convex[totalSupply, ...tokens] aura[totalSupply, multiplier, ...tokens]
export class RewardConvex {
  static async findRewards(
    ca: CreditAccountData_Legacy,
    cm: CreditManagerData_Legacy,
    network: NetworkType,
    provider: PublicClient,
  ): Promise<Array<Rewards>> {
    const prepared = RewardConvex.prepareMultiCalls(
      ca.creditAccount,
      cm,
      network,
    );

    if (!prepared) return [];
    const { auraCalls, auraDistribution, convexCalls, convexDistribution } =
      prepared;

    const auraTotal = auraCalls.flat(1);
    const convexTotal = convexCalls.flat(1);

    const allCalls = [...auraTotal, ...convexTotal];
    if (allCalls.length === 0) return [];

    const response = (await provider.multicall({
      allowFailure: false,
      multicallAddress: MULTICALL_ADDRESS,
      contracts: allCalls,
    })) as Array<bigint>;

    const auraEnd = auraTotal.length;
    const [auraTotalSupply, ...auraResponse] = response.slice(0, auraEnd);

    const convexEnd = auraEnd + convexTotal.length;
    const [convexTotalSupply, ...convexResponse] = response.slice(
      auraEnd,
      convexEnd,
    );

    const results = RewardConvex.parseResults({
      auraDistribution,
      auraResponse,
      auraTotalSupply: auraTotalSupply,

      convexDistribution,
      convexResponse,
      convexTotalSupply: convexTotalSupply,
    });

    return results;
  }

  static findAdapters(cm: CreditManagerData_Legacy) {
    const convexPools = TypedObjectUtils.entries(contractParams).reduce<
      Record<SupportedContract, ContractParams>
    >(
      (acc, [token, params]) => {
        if (params.type === AdapterInterface.CONVEX_V1_BASE_REWARD_POOL) {
          acc[token] = params;
        }
        return acc;
      },
      {} as Record<SupportedContract, ContractParams>,
    );

    return Object.entries(cm.adapters)
      .filter(
        ([contract]) =>
          !!convexPools[contractsByAddress[contract.toLowerCase()]],
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
    cm: CreditManagerData_Legacy,
    network: NetworkType,
  ) {
    const tokens = tokenDataByNetwork[network];
    const contracts = contractsByNetwork[network];

    const adapters = this.findAdapters(cm);

    if (adapters.length === 0) {
      return undefined;
    }

    const res = adapters.reduce<{
      convexDistribution: DistributionList;
      auraDistribution: DistributionList;

      convexCalls: CallsList;
      auraCalls: CallsList;
    }>(
      (acc, a) => {
        const currentContract = contractParams[a.contract] as
          | ConvexPoolParams
          | AuraPoolParams;

        const baseRewardToken = this.getBaseRewardToken(
          currentContract.protocol,
        );

        if (!baseRewardToken) {
          throw new Error(
            `Unknown rewards protocol: ${currentContract.protocol}`,
          );
        }

        const currentCalls: CallsList[number] = [
          ...(currentContract.protocol === Protocols.Aura
            ? [
                {
                  address: contracts.AURA_BOOSTER,
                  abi: AURA_BOOSTER_ABI,
                  functionName: "getRewardMultipliers",
                  args: [tokens[currentContract.stakedToken]],
                },
              ]
            : []),
        ];
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
          token: baseRewardToken,

          contractAddress: a.contractAddress,
          adapter: a.adapter,
        });

        currentContract.extraRewards.forEach(extra => {
          currentCalls.push({
            address: extra.poolAddress[network],
            abi: iBaseRewardPoolAbi,
            functionName: "earned",
            args: [creditAccount],
          });

          currentDistribution.push({
            protocol: currentContract.protocol,
            contract: a.contract,
            token: extra.rewardToken,

            contractAddress: a.contractAddress,
            adapter: a.adapter,
          });
        });

        if (currentContract.protocol === Protocols.Aura) {
          acc.auraCalls.push(currentCalls);
          acc.auraDistribution.push(currentDistribution);
        } else if (currentContract.protocol === Protocols.Convex) {
          acc.convexCalls.push(currentCalls);
          acc.convexDistribution.push(currentDistribution);
        }

        return acc;
      },
      {
        convexDistribution: [],
        auraDistribution: [],
        convexCalls: [
          [
            {
              address: tokens.CVX,
              abi: iConvexTokenAbi,
              functionName: "totalSupply",
              args: [],
            },
          ],
        ],
        auraCalls: [
          [
            {
              address: tokens.AURA,
              abi: iConvexTokenAbi,
              functionName: "totalSupply",
              args: [],
            },
          ],
        ],
      },
    );
    return res;
  }

  static parseResults({
    convexDistribution,
    convexResponse,
    convexTotalSupply,

    auraDistribution,
    auraResponse,
    auraTotalSupply,
  }: ParseProps): Array<Rewards> {
    const callData = encodeFunctionData({
      abi: iBaseRewardPoolAbi,
      functionName: "getReward",
      args: [],
    });

    const rewardsRecord: PartialRecord<SupportedContract, Rewards> = {};

    let start = 0;
    convexDistribution.forEach(list => {
      // rewards[]
      const end = start + list.length;
      const [baseRewardResp, ...rewardsResp] = convexResponse.slice(start, end);
      start = end;

      const [baseDistribution, ...extraDistribution] = list;

      const boostedRewardToken = this.getBBoostedRewardToken(
        baseDistribution.protocol,
      );

      if (
        rewardsResp.length !== extraDistribution.length ||
        baseRewardResp === undefined
      ) {
        throw new Error(
          `Rewards response length mismatch: expected: ${extraDistribution.length}, got: ${rewardsResp.length}`,
        );
      }
      if (!boostedRewardToken) {
        throw new Error(
          `Unknown rewards protocol: ${baseDistribution.protocol}`,
        );
      }

      // create base
      const rewardObject = this.getRewardObject(
        baseRewardResp || 0n,
        baseDistribution,
        boostedRewardToken,

        extraDistribution,
        rewardsResp,

        convexTotalSupply,
        callData,
        0n,
      );

      if (rewardObject) rewardsRecord[baseDistribution.contract] = rewardObject;
    });

    start = 0;
    auraDistribution.forEach(list => {
      // multiplier + rewards[]
      const end = start + list.length + 1;
      const [mp, baseRewardResp, ...rewardsResp] = auraResponse.slice(
        start,
        end,
      );
      start = end;

      const multiplier = mp;
      const [baseDistribution, ...extraDistribution] = list;

      const boostedRewardToken = this.getBBoostedRewardToken(
        baseDistribution.protocol,
      );

      if (
        rewardsResp.length !== extraDistribution.length ||
        mp === undefined ||
        baseRewardResp === undefined
      ) {
        throw new Error(
          `Rewards response length mismatch: expected: ${extraDistribution.length}, got: ${rewardsResp.length}`,
        );
      }
      if (!boostedRewardToken) {
        throw new Error(
          `Unknown rewards protocol: ${baseDistribution.protocol}`,
        );
      }

      // create base
      const rewardObject = this.getRewardObject(
        baseRewardResp || 0n,
        baseDistribution,
        boostedRewardToken,

        extraDistribution,
        rewardsResp,

        auraTotalSupply,
        callData,
        multiplier,
      );

      if (rewardObject) rewardsRecord[baseDistribution.contract] = rewardObject;
    });

    const result = Object.values(rewardsRecord);

    return result;
  }

  static getRewardObject(
    baseReward: bigint,
    baseDistribution: RewardDistribution,
    boostedRewardToken: SupportedToken,

    extraDistribution: Array<RewardDistribution>,
    rewardsResp: Array<bigint>,

    totalSupply: bigint,
    callData: Address,
    multiplier: bigint,
  ) {
    // create base
    const base: Rewards = {
      contract: baseDistribution.contract,
      protocol: baseDistribution.protocol,
      rewards: {
        [baseDistribution.token]: baseReward,
      },
      calls: [
        {
          target: baseDistribution.adapter,
          callData,
        },
      ],
    };

    // add boosted
    const boostedReward =
      baseDistribution.protocol === Protocols.Aura
        ? getAURAMintAmount(baseReward, totalSupply, multiplier)
        : getCVXMintAmount(baseReward, totalSupply);
    base.rewards = {
      ...base.rewards,
      [boostedRewardToken]: boostedReward,
    };

    // extra
    extraDistribution.forEach((distribution, j) => {
      const token = distribution.token;
      const prevReward = base.rewards[token] || 0n;
      const reward = rewardsResp[j] || 0n;

      base.rewards = {
        ...base.rewards,
        [token]: prevReward + reward,
      };
    });

    if (Object.values(base.rewards).some(r => r > 0)) {
      return base;
    }
    return undefined;
  }

  static getBaseRewardToken(protocol: Protocols): SupportedToken | undefined {
    return protocol === Protocols.Aura
      ? "BAL"
      : protocol === Protocols.Convex
        ? "CRV"
        : undefined;
  }
  static getBBoostedRewardToken(
    protocol: Protocols,
  ): SupportedToken | undefined {
    return protocol === Protocols.Aura
      ? "AURA"
      : protocol === Protocols.Convex
        ? "CVX"
        : undefined;
  }
}
