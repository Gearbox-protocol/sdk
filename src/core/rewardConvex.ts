import {
  AdapterInterface,
  AuraPoolParams,
  contractParams,
  contractsByAddress,
  contractsByNetwork,
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
import { Interface } from "ethers/lib/utils";

import { getCVXMintAmount } from "../apy";
import { AURA_BOOSTER_INTERFACE } from "../apy/auraAbi";
import { getAURAMintAmount } from "../apy/auraAPY";
import { IBaseRewardPool__factory, IConvexToken__factory } from "../types";
import { IBaseRewardPoolInterface } from "../types/IBaseRewardPool";
import { IConvexTokenInterface } from "../types/IConvexToken";
import { CreditAccountData } from "./creditAccount";
import { CreditManagerData } from "./creditManager";
import { AdapterWithType, Rewards } from "./rewardClaimer";

type DistributionList = Array<Array<RewardDistribution>>;
type CallsList = Array<
  Array<
    | MCall<IConvexTokenInterface>
    | MCall<IBaseRewardPoolInterface>
    | MCall<Interface>
  >
>;

export interface RewardDistribution {
  contract: Rewards["contract"];
  protocol: Rewards["protocol"];
  token: SupportedToken;

  adapter: string;
  contractAddress: string;
}

interface ParseProps {
  convexResponse: Array<BigNumber>;
  convexDistribution: DistributionList;
  convexTotalSupply: bigint;

  auraResponse: Array<BigNumber>;
  auraDistribution: DistributionList;
  auraTotalSupply: bigint;
}

// convex[totalSupply, ...tokens] aura[totalSupply, multiplier, ...tokens]
export class RewardConvex {
  static poolInterface = IBaseRewardPool__factory.createInterface();

  static async findRewards(
    ca: CreditAccountData,
    cm: CreditManagerData,
    network: NetworkType,
    provider: providers.Provider,
  ): Promise<Array<Rewards>> {
    const prepared = RewardConvex.prepareMultiCalls(ca.addr, cm, network);

    if (!prepared) return [];
    const { auraCalls, auraDistribution, convexCalls, convexDistribution } =
      prepared;

    const auraTotal = auraCalls.flat(1);
    const convexTotal = convexCalls.flat(1);

    const allCalls = [...auraTotal, ...convexTotal];
    if (allCalls.length === 0) return [];

    const response = await multicall<Array<BigNumber>>(allCalls, provider);

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
      auraTotalSupply: toBigInt(auraTotalSupply),

      convexDistribution,
      convexResponse,
      convexTotalSupply: toBigInt(convexTotalSupply),
    });

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
                  interface: AURA_BOOSTER_INTERFACE,
                  method: "getRewardMultipliers(address)",
                  params: [tokens[currentContract.stakedToken]],
                },
              ]
            : []),
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
              interface: IConvexToken__factory.createInterface(),
              method: "totalSupply()",
            },
          ],
        ],
        auraCalls: [
          [
            {
              address: tokens.AURA,
              interface: IConvexToken__factory.createInterface(),
              method: "totalSupply()",
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
    const callData =
      RewardConvex.poolInterface.encodeFunctionData("getReward()");

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
        toBigInt(baseRewardResp || 0n),
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

      const multiplier = toBigInt(mp);
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
        toBigInt(baseRewardResp || 0n),
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
    rewardsResp: Array<BigNumber>,

    totalSupply: bigint,
    callData: string,
    multiplier: bigint,
  ) {
    // create base
    const base: Rewards = {
      contract: baseDistribution.contract,
      totalSupply: totalSupply,
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
      const reward = toBigInt(rewardsResp[j] || 0n);

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
