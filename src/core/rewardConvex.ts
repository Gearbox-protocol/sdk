import {
  AdapterInterface,
  AuraPoolParams,
  contractParams,
  contractsByAddress,
  ConvexPoolParams,
  MCall,
  multicall,
  NetworkType,
  PartialRecord,
  Protocols,
  SupportedContract,
  SupportedToken,
  toBigInt,
  tokenDataByNetwork,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import { BigNumber, providers } from "ethers";

import { getCVXMintAmount } from "../apy";
import { getAURAMintAmount } from "../apy/auraAPY";
import { IBaseRewardPool__factory, IConvexToken__factory } from "../types";
import { IBaseRewardPoolInterface } from "../types/IBaseRewardPool";
import { IConvexTokenInterface } from "../types/IConvexToken";
import { CreditAccountData } from "./creditAccount";
import { CreditManagerData } from "./creditManager";
import { AdapterWithType, Rewards } from "./rewardClaimer";

type DistributionList = Array<Array<RewardDistribution>>;
type CallsList = Array<
  Array<MCall<IConvexTokenInterface> | MCall<IBaseRewardPoolInterface>>
>;

export interface RewardDistribution {
  contract: Rewards["contract"];
  protocol: Rewards["protocol"];
  token: SupportedToken;

  adapter: string;
  contractAddress: string;
}

export class RewardConvex {
  static poolInterface = IBaseRewardPool__factory.createInterface();

  static async findRewards(
    ca: CreditAccountData,
    cm: CreditManagerData,
    network: NetworkType,
    provider: providers.Provider,
  ): Promise<Array<Rewards>> {
    if (network !== "Mainnet") return [];

    const { calls, distribution } = RewardConvex.prepareMultiCalls(
      ca.addr,
      cm,
      network,
    );

    const response = await multicall<Array<BigNumber>>(calls.flat(1), provider);

    const results = RewardConvex.parseResults(response, distribution);

    return results;
  }

  static findAdapters(cm: CreditManagerData) {
    const convexPools = TypedObjectUtils.fromEntries(
      TypedObjectUtils.entries(contractParams).filter(
        ([, params]) =>
          params.type === AdapterInterface.CONVEX_V1_BASE_REWARD_POOL,
      ),
    );

    return Object.entries(cm.adapters)
      .filter(
        ([contract]) =>
          !!convexPools[contractsByAddress[contract.toLowerCase()]],
      )
      .map(
        ([contract, adapter]): AdapterWithType => ({
          adapter,
          contractAddress: contract,
          contract: contractsByAddress[contract.toLowerCase()],
        }),
      );
  }

  static prepareMultiCalls(
    creditAccount: string,
    cm: CreditManagerData,
    network: NetworkType,
  ) {
    const tokens = tokenDataByNetwork[network];
    const adapters = this.findAdapters(cm);

    const { distribution, calls } = adapters.reduce<{
      distribution: DistributionList;
      calls: CallsList;
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
          currentContract.protocol === Protocols.Convex
            ? {
                address: tokens.CVX,
                interface: IConvexToken__factory.createInterface(),
                method: "totalSupply()",
              }
            : {
                address: tokens.AURA,
                interface: IConvexToken__factory.createInterface(),
                method: "totalSupply()",
              },
        ];
        const currentDistribution: DistributionList[number] = [];

        currentCalls.push({
          address: a.contractAddress,
          interface: RewardConvex.poolInterface,
          method: "earned(address)",
          params: [creditAccount],
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
            interface: RewardConvex.poolInterface,
            method: "earned(address)",
            params: [creditAccount],
          });

          currentDistribution.push({
            protocol: currentContract.protocol,
            contract: a.contract,
            token: extra.rewardToken,

            contractAddress: a.contractAddress,
            adapter: a.adapter,
          });
        });

        acc.calls.push(currentCalls);
        acc.distribution.push(currentDistribution);
        return acc;
      },
      { distribution: [], calls: [] },
    );

    return {
      calls,
      distribution,
    };
  }

  static parseResults(
    response: Array<BigNumber>,
    distribution: DistributionList,
  ): Array<Rewards> {
    const callData =
      RewardConvex.poolInterface.encodeFunctionData("getReward()");

    const rewardsRecord: PartialRecord<SupportedContract, Rewards> = {};

    let start = 0;
    distribution.forEach(dList => {
      // totalSupply + rewards[]
      const end = start + dList.length + 1;
      const [ts, ...rewards] = response.slice(start, end);
      start = end;

      const totalSupply = toBigInt(ts);

      if (rewards.length !== dList.length) {
        throw new Error(
          `Rewards response length mismatch: expected: ${dList.length}, got: ${rewards.length}`,
        );
      }

      dList.forEach((d, j) => {
        const { contract, adapter, token, protocol } = d;
        const reward = rewards[j];

        if (!reward.isZero()) {
          const prevRewards = rewardsRecord[contract]?.rewards;
          const prevTokenReward = prevRewards?.[token] || 0n;

          rewardsRecord[contract] = {
            totalSupply,
            protocol,
            contract,
            rewards: {
              ...(prevRewards || {}),
              [token]: prevTokenReward + BigInt(reward.toString()),
            },
            calls: [
              {
                target: adapter,
                callData,
              },
            ],
          };
        }
      });
    });

    const result = Object.values(rewardsRecord).map(r => {
      const baseRewardToken = this.getBaseRewardToken(r.protocol);
      const boostedRewardToken = this.getBBoostedRewardToken(r.protocol);
      if (!boostedRewardToken || !baseRewardToken) {
        throw new Error(`Unknown rewards protocol: ${r.protocol}`);
      }

      const prevBaseRewardValue = r.rewards[baseRewardToken] || 0n;
      const prevBoostedRewardValue = r.rewards[boostedRewardToken] || 0n;

      const mintedReward =
        r.protocol === Protocols.Aura
          ? getAURAMintAmount(prevBaseRewardValue, r.totalSupply)
          : getCVXMintAmount(prevBaseRewardValue, r.totalSupply);

      return {
        ...r,
        rewards: {
          ...r.rewards,
          [boostedRewardToken]: prevBoostedRewardValue + mintedReward,
        },
      };
    });

    return result;
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
