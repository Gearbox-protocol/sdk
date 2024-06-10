import {
  CHAINS,
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
import { BytesLike, getAddress, Interface, Provider, Signer } from "ethers";

import {
  IAirdropDistributor,
  IAirdropDistributor__factory,
  IFarmingPool,
  IFarmingPool__factory,
} from "../types";
import { FarmAccounting } from "../types/IFarmingPool";
import { makeTransactionCall } from "../utils/calls";
import { toBN } from "../utils/formatter";
import { BigIntMath } from "../utils/math";
import { MULTICALL_EXTENDED_INTERFACE } from "./abi";
import {
  MerkleXYZApi,
  MerkleXYZRewardsCampaignsResponse,
  MerkleXYZUserRewards,
  MerkleXYZUserRewardsResponse,
} from "./merklAPI";

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
      proof: Array<BytesLike>;
    }
  >;
}

type FarmInfoOutput = ExcludeArrayProps<FarmAccounting.InfoStructOutput>;
export type FarmInfo = FarmInfoOutput & {
  symbol: SupportedToken;
};

type PoolsWithExtraRewardsList = Record<NetworkType, Array<SupportedToken>>;

const DEFAULT_POOLS_WITH_EXTRA_REWARDS: PoolsWithExtraRewardsList = {
  Mainnet: ["sdGHOV3", "sdcrvUSDV3"],
  Arbitrum: [],
  Optimism: [],
  Base: [],
};

export interface GetLmRewardsInfoProps {
  currentTokenData: Record<SupportedToken, string>;
  provider: Provider | Signer;

  multicallAddress: string;

  poolsWithExtraRewards?: PoolsWithExtraRewardsList;
  network: NetworkType;
}

export interface GetLmRewardsProps {
  baseRewardPoolsInfo: Record<string, FarmInfo>;
  currentTokenData: Record<SupportedToken, string>;
  account: string;
  provider: Provider | Signer;

  airdropDistributorAddress: string | undefined;
  network: NetworkType;
}

export interface ClaimLmRewardsV2Props {
  signer: Signer;
  account: string;
  provider: Provider;

  airdropDistributorAddress: string | undefined;
  network: NetworkType;
}

export interface ClaimLmRewardsV3Props {
  reward: GearboxStakedV3LmReward;
  signer: Signer;
}

const EXTRA_LM_MINING: PartialRecord<string, (timestamp: number) => FarmInfo> =
  {
    [tokenDataByNetwork.Mainnet.sdGHOV3.toLowerCase()]: (
      _: number,
    ): FarmInfo => {
      const REWARD_PERIOD = 14 * 24 * 60 * 60;
      // const REWARDS_1_END = 1712844000;
      // const REWARDS_2_END = 1714150800;
      // const REWARDS_3_END = 1715374800;
      // const REWARDS_4_END = 1716793200;
      const REWARDS_5_END = 1718024669;

      // const REWARD_1_PART = toBN("15000", decimals.GHO);
      // const REWARD_2_PART = toBN("15000", decimals.GHO);
      // const REWARD_3_PART = toBN("15000", decimals.GHO);
      // const REWARD_4_PART = toBN("7500", decimals.GHO);
      const REWARD_5_PART = toBN("3750", decimals.GHO);

      const reward = REWARD_5_PART;
      const finished = REWARDS_5_END;

      return {
        balance: 0n,
        duration: BigInt(REWARD_PERIOD),
        finished: BigInt(finished),
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

    poolsWithExtraRewards = DEFAULT_POOLS_WITH_EXTRA_REWARDS,
    network,
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

    const tokenWithExtraRewards = poolsWithExtraRewards[network] || [];
    const chainId = CHAINS[network];

    const [[blockTimestamp, ...mcResponse], ...extraRewardsResponses] =
      await Promise.all([
        multicall(
          [
            blockTimestampCall,
            ...farmInfoCalls,
            ...farmSupplyCalls,
            ...rewardTokenCalls,
          ],
          provider,
        ),

        ...tokenWithExtraRewards.map(symbol =>
          axios.get<MerkleXYZRewardsCampaignsResponse>(
            MerkleXYZApi.getRewardsCampaignsUrl({
              params: {
                chainId,
                mainParameter: getAddress(currentTokenData[symbol]),
              },
            }),
          ),
        ),
      ]);

    const farmInfoCallsEnd = farmInfoCalls.length;
    const farmInfo: Array<FarmInfoOutput> = mcResponse.slice(
      0,
      farmInfoCallsEnd,
    );

    const farmSupplyCallsEnd = farmInfoCallsEnd + farmSupplyCalls.length;
    const farmSupply: Array<bigint> = mcResponse.slice(
      farmInfoCallsEnd,
      farmSupplyCallsEnd,
    );

    const rewardTokenCallsEnd = farmSupplyCallsEnd + rewardTokenCalls.length;
    const rewardTokens: Array<string> = mcResponse.slice(
      farmSupplyCallsEnd,
      rewardTokenCallsEnd,
    );

    const extraRewards = extraRewardsResponses.reduce<
      Record<string, Array<FarmInfo>>
    >((acc, r, index) => {
      const stakedSymbol = tokenWithExtraRewards[index];

      const l = r.data.reduce<Array<FarmInfo>>((infos, d) => {
        const finished = toBigInt(d.endTimestamp || 0);

        if (finished - blockTimestamp > 0) {
          const rewardTokenLc = (d.rewardToken || "").toLowerCase();
          const [rewardSymbol, decimals = 18] = extractTokenData(rewardTokenLc);

          if (rewardSymbol) {
            const reward = toBN(d.amountDecimal, decimals);

            infos.push({
              duration: toBigInt(d.endTimestamp - d.startTimestamp),
              finished,
              reward,
              balance: 0n,
              symbol: rewardSymbol,
            });
          }
        }

        return infos;
      }, []);

      acc[currentTokenData[stakedSymbol]] = l;

      return acc;
    }, {});

    const rewardPoolsInfo = poolTokens.reduce<{
      base: Record<string, FarmInfo>;
      extra: Record<string, Array<FarmInfo>>;
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

        const baseReward: FarmInfo = {
          duration: currentInfo.duration,
          finished: currentInfo.finished,
          reward: currentInfo.reward,
          balance: currentInfo.balance,
          symbol: symbol,
        };

        const extra = extraRewards[address] || [];

        acc.base[address] = baseReward;
        acc.extra[address] = extra;
        acc.all[address] = [baseReward, ...extra];
        return acc;
      },
      { base: {}, extra: {}, all: {} },
    );

    const rewardPoolsSupply = poolTokens.reduce<Record<string, bigint>>(
      (acc, [, address], i) => {
        acc[address] = farmSupply[i] || 0n;

        return acc;
      },
      {},
    );

    return {
      rewardPoolsInfo: rewardPoolsInfo.all,
      baseRewardPoolsInfo: rewardPoolsInfo.base,
      extraRewardPoolsInfo: rewardPoolsInfo.extra,
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
      multicall<Array<bigint>>(farmedCalls, provider),

      hasGHOReward
        ? axios.get<MerkleXYZUserRewardsResponse>(
            MerkleXYZApi.getUserRewardsUrl({
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

    const merkleXYZLMLc = Object.entries(merkleXYZLM || {}).reduce<
      Record<string, MerkleXYZUserRewards>
    >((acc, [k, v]) => {
      acc[k.toLowerCase()] = v;

      return acc;
    }, {});

    const ghoLM = merkleXYZLMLc[currentTokenData.GHO];

    const gearboxLmRewards = poolTokens.map((address, i): GearboxLmReward => {
      return {
        poolToken: address,
        rewardToken: currentTokenData[baseRewardPoolsInfo[address].symbol],
        amount: gearboxLm[i] || 0n,
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

    return makeTransactionCall(
      distributor.claim,
      [
        rewardFromMerkle.index,
        account,
        rewardFromMerkle.amount,
        rewardFromMerkle.proof,
      ],
      signer,
    );
  }

  static async claimLmRewardsV3({ reward, signer }: ClaimLmRewardsV3Props) {
    const pool = IFarmingPool__factory.connect(reward.poolToken, signer);

    return makeTransactionCall(pool.claim, [], signer);
  }

  private static async getMerkle(
    provider: Provider | Signer,
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
      (acc, r) => acc + r.args.amount,
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
