import {
  decimals,
  ExcludeArrayProps,
  extractTokenData,
  isDieselStakedToken,
  MCall,
  multicall,
  NetworkType,
  PartialRecord,
  SupportedToken,
  toBigInt,
  tokenDataByNetwork,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import axios from "axios";
import { BigNumber, BigNumberish, ethers, providers, Signer } from "ethers";
import { getAddress, Interface } from "ethers/lib/utils";

import { ChartsApi } from "../core/endpoint";
import {
  IAirdropDistributor,
  IAirdropDistributor__factory,
  IFarmingPool,
  IFarmingPool__factory,
} from "../types";
import { FarmAccounting } from "../types/IFarmingPool";
import { toBN } from "../utils/formatter";
import { BigIntMath } from "../utils/math";
import { BigintifyProps } from "../utils/types";
import { MULTICALL_EXTENDED_INTERFACE } from "./abi";

export interface GearboxExtraMerkleLmReward {
  poolToken: string;
  rewardToken: string;
  amount: bigint;
  type: "extraMerkle";
}
export interface GearboxStakedV3LmReward {
  poolToken: string;
  rewardToken: string;
  amount: bigint;
  type: "stakedV3";
}
export interface GearboxMerkleV2LmReward {
  poolToken?: string;
  rewardToken: string;
  amount: bigint;
  type: "merkleV2";
}

export type GearboxLmReward =
  | GearboxStakedV3LmReward
  | GearboxMerkleV2LmReward
  | GearboxExtraMerkleLmReward;

interface GetTotalClaimedProps {
  account: string;
  distributor: IAirdropDistributor;
}

interface GetAmountOnContractProps {
  account: string;
  merkleData: MerkleDistributorInfo | undefined;
}

export interface MerkleDistributorInfo {
  merkleRoot: string;
  tokenTotal: string;
  claims: Record<
    string,
    {
      index: number;
      amount: string;
      proof: Array<ethers.utils.BytesLike>;
    }
  >;
}

type FarmInfoOutput = ExcludeArrayProps<FarmAccounting.InfoStructOutput>;
export type FarmInfo = BigintifyProps<FarmInfoOutput> & {
  symbol: SupportedToken;
};

export interface GetLmRewardsInfoProps {
  currentTokenData: Record<SupportedToken, string>;
  provider: providers.Provider | Signer;

  multicallAddress: string;
}

export interface GetLmRewardsProps {
  baseRewardPoolsInfo: Record<string, FarmInfo>;
  currentTokenData: Record<SupportedToken, string>;
  account: string;
  provider: providers.Provider | Signer;

  airdropDistributorAddress: string | undefined;
  network: NetworkType;
}

export interface ClaimLmRewardsV2Props {
  signer: Signer;
  account: string;
  provider: providers.Provider;

  airdropDistributorAddress: string | undefined;
  network: NetworkType;
}

export interface ClaimLmRewardsV3Props {
  reward: GearboxStakedV3LmReward;
  signer: Signer;
}

const EXTRA_LM_MINING: PartialRecord<string, (timestamp: number) => FarmInfo> =
  {
    [tokenDataByNetwork.Mainnet.sdGHOV3.toLowerCase()]: (timestamp: number) => {
      const REWARD_PERIOD = 14 * 24 * 60 * 60;
      // const REWARDS_FIRST_START = 1711641600;
      // const REWARDS_FIRST_END = 1712844000;
      const REWARDS_SECOND_END = 1714150800;
      const REWARDS_THIRD_END = REWARDS_SECOND_END + REWARD_PERIOD;

      // const REWARD_FIRST_PART = toBN("15000", decimals.GHO);
      const REWARD_SECOND_PART = toBN("15000", decimals.GHO);
      const REWARD_THIRD_PART = toBN("15000", decimals.GHO);

      const reward =
        timestamp >= REWARDS_SECOND_END
          ? REWARD_THIRD_PART
          : REWARD_SECOND_PART;
      const finished =
        timestamp >= REWARDS_SECOND_END
          ? REWARDS_THIRD_END
          : REWARDS_SECOND_END;

      return {
        balance: 0n,
        duration: REWARD_PERIOD,
        finished,
        reward: reward,
        symbol: "GHO",
      };
    },
  };

export class GearboxRewardsApi {
  static async getLmRewardsInfo({
    currentTokenData,
    provider,
    multicallAddress,
  }: GetLmRewardsInfoProps) {
    const poolTokens = TypedObjectUtils.entries(currentTokenData).filter(
      ([symbol]) => isDieselStakedToken(symbol),
    );

    const farmInfoCalls: Array<MCall<IFarmingPool["interface"]>> =
      poolTokens.map(([, address]) => ({
        address: address,
        interface: IFarmingPool__factory.createInterface(),
        method: "farmInfo()",
      }));

    const rewardTokenCalls: Array<MCall<Interface>> = poolTokens.map(
      ([, address]) => ({
        address: address,
        interface: POOL_REWARD_INTERFACE,
        method: "rewardsToken()",
      }),
    );

    const farmSupplyCalls: Array<MCall<IFarmingPool["interface"]>> =
      poolTokens.map(([, address]) => ({
        address: address,
        interface: IFarmingPool__factory.createInterface(),
        method: "totalSupply()",
        params: [],
      }));

    const blockTimestampCall: MCall<Interface> = {
      address: multicallAddress,
      interface: MULTICALL_EXTENDED_INTERFACE,
      method: "getCurrentBlockTimestamp()",
    };

    const [blockTimestamp, ...mcResponse] = await multicall(
      [
        blockTimestampCall,
        ...farmInfoCalls,
        ...farmSupplyCalls,
        ...rewardTokenCalls,
      ],
      provider,
    );

    const farmInfoCallsEnd = farmInfoCalls.length;
    const farmInfo: Array<FarmInfoOutput> = mcResponse.slice(
      0,
      farmInfoCallsEnd,
    );

    const farmSupplyCallsEnd = farmInfoCallsEnd + farmSupplyCalls.length;
    const farmSupply: Array<BigNumber> = mcResponse.slice(
      farmInfoCallsEnd,
      farmSupplyCallsEnd,
    );

    const rewardTokenCallsEnd = farmSupplyCallsEnd + rewardTokenCalls.length;
    const rewardTokens: Array<string> = mcResponse.slice(
      farmSupplyCallsEnd,
      rewardTokenCallsEnd,
    );

    const rewardPoolsInfo = poolTokens.reduce<{
      base: Record<string, FarmInfo>;
      all: Record<string, Array<FarmInfo>>;
    }>(
      (acc, [, address], i) => {
        const currentInfo = farmInfo[i];
        const [symbol] = extractTokenData(rewardTokens[i] || "");
        if (!symbol)
          throw new Error(
            `Can't get reward token for: ${
              extractTokenData(address)[0]
            } [${address}]`,
          );

        const otherRewards = EXTRA_LM_MINING[address];

        const baseReward: FarmInfo = {
          duration: currentInfo.duration,
          finished: currentInfo.finished,
          reward: toBigInt(currentInfo.reward),
          balance: toBigInt(currentInfo.balance),
          symbol: symbol,
        };
        const extraReward = otherRewards
          ? [otherRewards(Number(blockTimestamp))]
          : [];

        acc.base[address] = baseReward;
        acc.all[address] = [baseReward, ...extraReward];

        return acc;
      },
      { base: {}, all: {} },
    );

    const rewardPoolsSupply = Object.fromEntries(
      poolTokens.map(([, address], i): [string, bigint] => [
        address,
        toBigInt(farmSupply[i] || 0),
      ]),
    );

    return {
      rewardPoolsInfo: rewardPoolsInfo.all,
      baseRewardPoolsInfo: rewardPoolsInfo.base,
      rewardPoolsSupply,
    };
  }

  static async getLmRewardsV2({
    provider,
    account,
    currentTokenData,

    network,
    airdropDistributorAddress,
  }: GetLmRewardsProps) {
    if (!airdropDistributorAddress) return { rewards: [], totalAvailable: 0n };

    const distributor = IAirdropDistributor__factory.connect(
      airdropDistributorAddress,
      provider,
    );

    const [claimedResp, merkleDataResp] = await Promise.all([
      this.getClaimed({ distributor, account }),
      this.getMerkle(provider, airdropDistributorAddress, network, account),
    ]);

    const amountOnContract = this.getAmountOnContract({
      account,
      merkleData: merkleDataResp,
    });
    const diff = amountOnContract - claimedResp;
    const availableToClaimV2 = BigIntMath.max(0n, diff);

    const rewards: Array<GearboxLmReward> = [
      {
        amount: availableToClaimV2,
        type: "merkleV2",
        rewardToken: currentTokenData.GEAR,
      },
    ];

    const totalAvailable = rewards.reduce(
      (sum, r) => sum + (r.amount || 0n),
      0n,
    );

    return { rewards: [rewards], totalAvailable };
  }

  static async getLmRewardsV3({
    baseRewardPoolsInfo,
    currentTokenData,
    provider,
    account,

    network,
  }: GetLmRewardsProps) {
    const poolTokens = Object.keys(baseRewardPoolsInfo);

    const farmedCalls: Array<MCall<IFarmingPool["interface"]>> = poolTokens.map(
      address => ({
        address: address,
        interface: IFarmingPool__factory.createInterface(),
        method: "farmed(address)",
        params: [account],
      }),
    );

    const hasGHOReward =
      network === "Mainnet" && EXTRA_LM_MINING[currentTokenData.sdGHOV3];

    const [gearboxLmResponse, merkleXYZLMResponse] = await Promise.allSettled([
      multicall<Array<BigNumber>>(farmedCalls, provider),

      hasGHOReward
        ? axios.get<MerkleXYZUserRewardsResponse>(
            MerkleXYZApi.getRewardsUrl({
              params: {
                chainId: 1,
                user: getAddress(account),
                mainParameter: getAddress(currentTokenData.sdGHOV3),
                rewardToken: getAddress(currentTokenData.GHO),
              },
            }),
          )
        : undefined,
    ]);
    const gearboxLm =
      gearboxLmResponse.status === "fulfilled" ? gearboxLmResponse.value : [];
    const merkleXYZLM =
      merkleXYZLMResponse.status === "fulfilled"
        ? merkleXYZLMResponse.value?.data
        : undefined;

    const merkleXYZLMLc = Object.fromEntries(
      Object.entries(merkleXYZLM || {}).map(([k, v]) => [k.toLowerCase(), v]),
    );

    const ghoLM = merkleXYZLMLc[currentTokenData.GHO];

    const gearboxLmRewards = poolTokens.map((address, i): GearboxLmReward => {
      return {
        poolToken: address,
        rewardToken: currentTokenData[baseRewardPoolsInfo[address].symbol],
        amount: toBigInt(gearboxLm[i] || 0n),
        type: "stakedV3",
      };
    });

    const { zero, nonZero, total } = gearboxLmRewards.reduce<{
      total: bigint;
      nonZero: Array<Array<GearboxLmReward>>;
      zero: Array<GearboxLmReward>;
    }>(
      (acc, r) => {
        const amount = r.amount || 0n;
        if (amount > 0n) {
          acc.nonZero.push([r]);
        } else {
          acc.zero.push(r);
        }
        acc.total = acc.total + amount;

        return acc;
      },
      { total: 0n, nonZero: [], zero: [] },
    );

    const extraRewards: Array<Array<GearboxLmReward>> = ghoLM
      ? [
          [
            {
              poolToken: currentTokenData.sdGHOV3,
              rewardToken: currentTokenData.GHO,
              amount: toBigInt(ghoLM.unclaimed),
              type: "extraMerkle",
            },
          ],
        ]
      : [];
    const extraTotal = extraRewards.reduce((sum, group) => {
      const groupTotal = group.reduce((groupSum, reward) => {
        return groupSum + (reward.amount || 0n);
      }, 0n);
      return sum + groupTotal;
    }, 0n);

    return {
      rewards: [...nonZero, ...extraRewards, zero],
      totalAvailable: total + extraTotal,
    };
  }

  static async claimLmRewardsV2({
    signer,
    account,
    provider,

    network,
    airdropDistributorAddress,
  }: ClaimLmRewardsV2Props) {
    if (!airdropDistributorAddress)
      throw new Error(`V2 rewards are not supported on chain: ${network}`);

    const distributor = IAirdropDistributor__factory.connect(
      airdropDistributorAddress,
      signer,
    );
    const merkleData = await this.getMerkle(
      provider,
      airdropDistributorAddress,
      network,
      account,
    );

    const rewardFromMerkle = merkleData?.claims[account];
    if (!rewardFromMerkle) throw new Error("No rewards found");

    return distributor.claim(
      rewardFromMerkle.index,
      account,
      toBigInt(rewardFromMerkle.amount),
      rewardFromMerkle.proof,
    );
  }

  static async claimLmRewardsV3({ reward, signer }: ClaimLmRewardsV3Props) {
    const pool = IFarmingPool__factory.connect(reward.poolToken, signer);

    return pool.claim();
  }

  private static async getMerkle(
    provider: providers.Provider | Signer,
    distributorAddress: string,
    network: NetworkType,
    account: string,
  ): Promise<MerkleDistributorInfo> {
    const distributor = IAirdropDistributor__factory.connect(
      distributorAddress,
      provider,
    );
    const root = await distributor.merkleRoot();

    const path = `${network}_${root.slice(2)}/${account.slice(2, 4)}`;
    const url = `https://am.gearbox.finance/${path.toLowerCase()}.json`;

    const result = await axios.get<MerkleDistributorInfo>(url);
    return result.data;
  }

  private static async getClaimed({
    distributor,
    account,
  }: GetTotalClaimedProps) {
    const claimedRewardsResponse = await distributor.queryFilter(
      distributor.filters.Claimed(account, undefined, false),
    );

    const claimedRewards = (claimedRewardsResponse || []).reduce(
      (acc, r) => acc + toBigInt(r.args.amount),
      0n,
    );
    return claimedRewards;
  }

  private static getAmountOnContract({
    account,
    merkleData,
  }: GetAmountOnContractProps) {
    const { claims = {} } = merkleData || {};
    const { amount } = claims[account] || {};

    return BigInt(amount || 0);
  }
}

interface Options {
  params: {
    user: string;
    chainId: number;

    mainParameter?: string;
    rewardToken?: string;
  };
}

interface MerkleXYZUserRewards {
  accumulated: BigNumberish;
  decimals: number;
  reasons: Record<
    string,
    {
      accumulated: BigNumberish;
      unclaimed: BigNumberish;
    }
  >;
  symbol: string;
  unclaimed: BigNumberish;
}

type MerkleXYZUserRewardsResponse = Record<string, MerkleXYZUserRewards>;

class MerkleXYZApi {
  static domain = "https://api.merkl.xyz/v3";

  static getRewardsUrl = (options: Options) =>
    ChartsApi.getRelativeUrl([this.domain, "userRewards"].join("/"), options);
}

const POOL_REWARDS_ABI = [
  {
    inputs: [],
    name: "rewardsToken",
    outputs: [
      {
        internalType: "contract IERC20",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const POOL_REWARD_INTERFACE = new Interface(POOL_REWARDS_ABI);
