import axios from "axios";
import type { Address, PublicClient, WalletClient } from "viem";
import { getAddress, getContract } from "viem";

import type { NetworkType } from "../../chain/index.js";
import { chains } from "../../chain/index.js";
import { MULTICALL_ADDRESS } from "../../constants/index.js";
import type { SupportedToken } from "../../sdk-gov-legacy/index.js";
import { toBigInt, TypedObjectUtils } from "../../utils/index.js";
import { GearboxBackendApi } from "../core/endpoint.js";
import type { PoolData_Legacy } from "../core/pool.js";
import type { TokenData } from "../tokens/tokenData.js";
import { iAirdropDistributorAbi, iFarmingPoolAbi } from "../types/index.js";
import { BigIntMath } from "../utils/math.js";
import type { ExtraRewardApy } from "./apy.js";
import type {
  MerkleXYZUserRewardsV4Response,
  MerkleXYZV4CampaignsResponse,
  MerkleXYZV4RewardCampaignResponse,
  MerklXYZV4RewardCampaign,
} from "./merklAPI.js";
import { MerkleXYZApi } from "./merklAPI.js";

export interface GearboxExtraMerkleLmReward {
  pool: Address;
  poolToken: Address;

  rewardTokenSymbol: string;
  rewardTokenDecimals: number;
  rewardToken: Address;
  amount: bigint;

  type: "extraMerkle";
}
export interface GearboxStakedV3LmReward {
  pool: Address;
  poolToken: Address;

  rewardTokenSymbol: string;
  rewardTokenDecimals: number;
  rewardToken: Address;
  amount: bigint;

  type: "stakedV3";
}
export interface GearboxMerkleV2LmReward {
  pool?: undefined;
  poolToken?: undefined;

  rewardTokenSymbol: string;
  rewardTokenDecimals: number;
  rewardToken: Address;
  amount: bigint;

  type: "merkleV2";
}

export type GearboxLmReward =
  | GearboxStakedV3LmReward
  | GearboxMerkleV2LmReward
  | GearboxExtraMerkleLmReward;

interface GetTotalClaimedProps {
  account: Address;
  provider: PublicClient;
  airdropDistributorAddress: Address;
}

interface GetAmountOnContractProps {
  account: Address;
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
      proof: Array<Address>;
    }
  >;
}

interface FarmInfoOutput {
  finished: number;
  duration: number;
  reward: bigint;
  balance: bigint;
}
export interface FarmInfo {
  pool: Address;
  finished: bigint;
  duration: bigint;
  reward: bigint;
  balance: bigint;
  symbol: SupportedToken;
}

type ReportHandler = (e: unknown, description?: string) => void;

export interface GetLmRewardsInfoProps {
  pools: Record<Address, PoolData_Legacy>;
  tokensList: Record<Address, TokenData>;
  provider: PublicClient;
}

export interface GetExtraRewardsProps {
  chainId: number;
  tokensList: Record<Address, TokenData>;
}

export interface GetLmRewardsProps {
  pools: Record<Address, PoolData_Legacy>;

  baseRewardPoolsInfo: Record<string, FarmInfo>;
  currentTokenData: Record<SupportedToken, Address>;
  tokensList: Record<Address, TokenData>;
  account: Address;
  provider: PublicClient;

  airdropDistributorAddress: Address | undefined;
  network: NetworkType;
  reportError?: ReportHandler;
}

export interface ClaimLmRewardsV2Props {
  signer: WalletClient;
  account: Address;
  provider: PublicClient;

  airdropDistributorAddress: Address | undefined;
  network: NetworkType;
}

export interface ClaimLmRewardsV3Props {
  reward: GearboxStakedV3LmReward;
  account: Address;
  signer: WalletClient;
}

const BROKEN_CAMPAIGNS: Record<string, boolean> = {
  "11136065905617273958": true,
};

export class GearboxRewardsApi {
  static async getExtraRewards({ chainId, tokensList }: GetExtraRewardsProps) {
    const res = await axios.get<MerkleXYZV4CampaignsResponse>(
      MerkleXYZApi.getGearboxCampaignsUrl(),
    );
    const currentActiveCampaigns = res.data.filter(
      c =>
        c.status === "LIVE" && c.chainId === chainId && !BROKEN_CAMPAIGNS[c.id],
    );

    const aprIdsList = currentActiveCampaigns
      .map(c =>
        // apr token for campaigns with a single reward is obvious
        c.aprRecord.breakdowns.length > 1
          ? c.aprRecord.breakdowns.map(b => {
              return {
                campaignId: c.id,
                aprId: b.identifier,
              };
            })
          : [],
      )
      .flat(1);

    const aprIdsResponse = await Promise.allSettled(
      aprIdsList.map(id =>
        axios.get<MerkleXYZV4RewardCampaignResponse>(
          MerkleXYZApi.getGearboxRewardCampaignUrl(id.aprId),
        ),
      ),
    );

    const aprCampaignByAPRId = aprIdsResponse.reduce<
      Record<Address, Array<MerklXYZV4RewardCampaign> | undefined>
    >((acc, r, i) => {
      const id = aprIdsList[i].aprId;
      acc[id] = r.status === "fulfilled" ? r.value.data : undefined;

      return acc;
    }, {});

    const r = currentActiveCampaigns.reduce<
      Record<Address, Array<ExtraRewardApy>>
    >((acc, campaign) => {
      const rewardSource = (
        campaign.tokens[0]?.address || campaign.identifier
      ).toLowerCase() as Address;

      const allRewards = campaign.aprRecord.breakdowns
        .map((r, i) => {
          const apy = r.value;

          const { rewardToken } = aprCampaignByAPRId[r.identifier]?.[0] || {};
          const tokenRewardsRecord =
            campaign.rewardsRecord.breakdowns[i]?.token;

          const { address = tokenRewardsRecord?.address || "" } =
            rewardToken || {};

          const tokenLc = address.toLowerCase() as Address;
          const {
            symbol = rewardToken?.symbol || tokenRewardsRecord?.symbol || "",
          } = tokensList[tokenLc] || {};

          const apyObject: ExtraRewardApy = {
            token: rewardSource,
            balance: null,

            apy: apy,
            rewardToken: tokenLc,
            rewardTokenSymbol: symbol,
          };

          return apyObject;
        })
        .filter(r => r.apy > 0);

      acc[rewardSource] = [...(acc[rewardSource] || []), ...allRewards];

      return acc;
    }, {});

    return r;
  }

  static async getLmRewardsInfo({
    pools,
    provider,
    tokensList,
  }: GetLmRewardsInfoProps) {
    const poolByStakedDiesel = Object.values(pools).reduce<
      Record<Address, Address>
    >((acc, p) => {
      p.stakedDieselToken.forEach(t => {
        if (t) acc[t] = p.address;
      });
      p.stakedDieselToken_old.forEach(t => {
        if (t) acc[t] = p.address;
      });

      return acc;
    }, {});

    const poolByDiesel = Object.values(pools).reduce<Record<Address, Address>>(
      (acc, p) => {
        acc[p.dieselToken] = p.address;

        return acc;
      },
      {},
    );

    const poolByItsToken = { ...poolByStakedDiesel, ...poolByDiesel };

    const poolStakedTokens = TypedObjectUtils.keys(poolByStakedDiesel);
    const allPoolTokens = TypedObjectUtils.keys(poolByItsToken);

    const farmInfoCalls = poolStakedTokens.map(address => ({
      address,
      abi: iFarmingPoolAbi,
      functionName: "farmInfo",
      args: [],
    }));

    const farmSupplyCalls = allPoolTokens.map(address => ({
      address,
      abi: iFarmingPoolAbi,
      functionName: "totalSupply",
      args: [],
    }));

    const rewardTokenCalls = poolStakedTokens.map(address => ({
      address,
      abi: POOL_REWARDS_ABI,
      functionName: "rewardsToken",
      args: [],
    }));

    const mc = await provider.multicall({
      allowFailure: false,
      multicallAddress: MULTICALL_ADDRESS,
      contracts: [...farmInfoCalls, ...farmSupplyCalls, ...rewardTokenCalls],
    });

    const mcResponse = mc;
    const [...restMCResponse] = mcResponse;

    const farmInfoCallsEnd = farmInfoCalls.length;
    const farmInfo = restMCResponse.slice(
      0,
      farmInfoCallsEnd,
    ) as Array<FarmInfoOutput>;

    const farmSupplyCallsEnd = farmInfoCallsEnd + farmSupplyCalls.length;
    const farmSupply = restMCResponse.slice(
      farmInfoCallsEnd,
      farmSupplyCallsEnd,
    ) as Array<bigint>;

    const rewardTokenCallsEnd = farmSupplyCallsEnd + rewardTokenCalls.length;
    const rewardTokens = restMCResponse.slice(
      farmSupplyCallsEnd,
      rewardTokenCallsEnd,
    ) as Array<Address>;

    const infoByPool = poolStakedTokens.reduce<Record<Address, FarmInfoOutput>>(
      (acc, p, index) => {
        const info = farmInfo[index];

        if (info) acc[p] = info;

        return acc;
      },
      {},
    );

    const rewardTokenPool = poolStakedTokens.reduce<Record<Address, Address>>(
      (acc, p, index) => {
        const token = rewardTokens[index];

        if (token) {
          acc[p] = token.toLowerCase() as Address;
        }

        return acc;
      },
      {},
    );

    const stakedTokenRewards = allPoolTokens.reduce<{
      base: Record<string, FarmInfo>;
      all: Record<string, Array<FarmInfo>>;
    }>(
      (acc, pool) => {
        const info = infoByPool[pool];
        const token = rewardTokenPool[pool];
        const tokenData = tokensList[token];

        const baseReward: FarmInfo | undefined =
          info && tokenData
            ? {
                pool: poolByItsToken[pool],
                duration: BigInt(info.duration),
                finished: BigInt(info.finished),
                reward: info.reward,
                balance: info.balance,
                symbol: tokenData.symbol,
              }
            : undefined;

        if (baseReward) acc.base[pool] = baseReward;
        acc.all[pool] = [...(baseReward ? [baseReward] : [])];

        return acc;
      },
      { base: {}, all: {} },
    );

    const rewardPoolsSupply = allPoolTokens.reduce<Record<string, bigint>>(
      (acc, address, i) => {
        acc[address] = farmSupply[i] || 0n;

        return acc;
      },
      {},
    );

    return {
      rewardPoolsInfo: stakedTokenRewards.all,
      baseRewardPoolsInfo: stakedTokenRewards.base,
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
    if (!airdropDistributorAddress) return { rewards: [] };

    const [claimedResp, merkleDataResp] = await Promise.all([
      this.getClaimed({ airdropDistributorAddress, provider, account }),
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
        rewardTokenDecimals: 18,
        rewardTokenSymbol: "GEAR",
      },
    ];

    return { rewards: rewards };
  }

  static async getLmRewardsV3({
    pools,

    baseRewardPoolsInfo,
    currentTokenData,
    tokensList,
    provider,
    account,

    network,
    reportError,
  }: GetLmRewardsProps) {
    const poolTokens = Object.keys(baseRewardPoolsInfo) as Array<Address>;

    const [gearboxLmResponse, merkleXYZLMResponse] = await Promise.allSettled([
      provider.multicall({
        allowFailure: false,
        multicallAddress: MULTICALL_ADDRESS,
        contracts: poolTokens.map(address => ({
          address: address,
          abi: iFarmingPoolAbi,
          functionName: "farmed",
          args: [account],
        })),
      }),
      axios.get<MerkleXYZUserRewardsV4Response>(
        MerkleXYZApi.getUserRewardsUrl({
          params: {
            chainId: chains[network].id,
            user: getAddress(account),
          },
        }),
      ),
    ]);

    const gearboxLm = (this.extractFulfilled(
      gearboxLmResponse,
      reportError,
      "v3Rewards",
    ) || []) as Array<bigint>;
    const merkleXYZLm = this.extractFulfilled(
      merkleXYZLMResponse,
      reportError,
      "merkleRewards",
    )?.data;

    const poolByItsToken = Object.values(pools).reduce<
      Record<Address, Address>
    >((acc, p) => {
      p.stakedDieselToken.forEach(t => {
        if (t) acc[t] = p.address;
      });
      p.stakedDieselToken_old.forEach(t => {
        if (t) acc[t] = p.address;
      });

      acc[p.dieselToken] = p.address;

      return acc;
    }, {});

    const extraRewards = (merkleXYZLm || []).reduce<Array<GearboxLmReward>>(
      (acc, chainRewards) => {
        chainRewards.rewards.forEach(reward => {
          const rewardToken = reward.token.address.toLowerCase() as Address;

          reward.breakdowns.forEach(reason => {
            const poolToken = (
              (reason.reason || "").split("_")[1] || ""
            ).toLowerCase() as Address;

            const pool = (
              baseRewardPoolsInfo[poolToken]?.pool ||
              poolToken ||
              ""
            ).toLowerCase() as Address;

            if (poolByItsToken[poolToken] && poolByItsToken[pool]) {
              const total = toBigInt(reason.amount || 0);
              const claimed = toBigInt(reason.claimed || 0);

              acc.push({
                pool,
                poolToken,
                rewardToken,
                rewardTokenSymbol: reward.token.symbol,
                rewardTokenDecimals: reward.token.decimals || 18,
                amount: BigIntMath.max(total - claimed, 0n),
                type: "extraMerkle",
              });
            }
          });
        });

        return acc;
      },
      [],
    );

    const gearboxLmRewards = poolTokens.map((address, i): GearboxLmReward => {
      const info = baseRewardPoolsInfo[address];
      const rewardToken = currentTokenData[info.symbol];

      return {
        pool: info.pool,
        poolToken: address,

        rewardToken,
        rewardTokenDecimals: tokensList[rewardToken]?.decimals || 18,
        rewardTokenSymbol: info.symbol,

        amount: gearboxLm[i] || 0n,
        type: "stakedV3",
      };
    });

    const { zero, nonZero } = gearboxLmRewards.reduce<{
      nonZero: Array<GearboxLmReward>;
      zero: Array<GearboxLmReward>;
    }>(
      (acc, r) => {
        const amount = r.amount || 0n;
        if (amount > 0n) {
          acc.nonZero.push(r);
        } else {
          acc.zero.push(r);
        }

        return acc;
      },
      { nonZero: [], zero: [] },
    );

    return {
      rewards: [...nonZero, ...extraRewards, zero],
    };
  }

  private static extractFulfilled<T>(
    r: PromiseSettledResult<T>,
    reportError?: ReportHandler,
    description?: string,
  ) {
    if (r.status === "fulfilled") {
      return r.value;
    } else {
      if (reportError) {
        reportError(r.reason, description);
      } else {
        console.error(r.reason);
      }
      return undefined;
    }
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

    const merkleData = await this.getMerkle(
      provider,
      airdropDistributorAddress,
      network,
      account,
    );

    const rewardFromMerkle = merkleData?.claims[getAddress(account)];
    if (!rewardFromMerkle) throw new Error("No rewards found");

    const distributor = getContract({
      address: airdropDistributorAddress,
      abi: iAirdropDistributorAbi,
      client: signer,
    });

    return distributor.write.claim(
      [
        BigInt(rewardFromMerkle.index),
        account,
        toBigInt(rewardFromMerkle.amount),
        rewardFromMerkle.proof,
      ],
      {
        account: account,
        chain: signer.chain,
      },
    );
  }

  static async claimLmRewardsV3({
    reward,
    signer,
    account,
  }: ClaimLmRewardsV3Props) {
    const pool = getContract({
      address: reward.poolToken,
      abi: iFarmingPoolAbi,
      client: signer,
    });

    return pool.write.claim({
      account: account,
      chain: signer.chain,
    });
  }

  private static async getMerkle(
    provider: PublicClient,
    distributorAddress: Address,
    network: NetworkType,
    account: Address,
  ): Promise<MerkleDistributorInfo> {
    const distributor = getContract({
      address: distributorAddress,
      abi: iAirdropDistributorAbi,
      client: provider,
    });

    const root = await distributor.read.merkleRoot();

    const result = await axios.get<MerkleDistributorInfo>(
      GearboxBackendApi.getRewardsMerkleUrl(network, root, account),
    );
    return result.data;
  }

  private static async getClaimed({
    provider,
    airdropDistributorAddress,
    account,
  }: GetTotalClaimedProps) {
    const distributor = getContract({
      address: airdropDistributorAddress,
      abi: iAirdropDistributorAbi,
      client: provider,
    });

    const claimedRewardsResponse = await distributor.getEvents.Claimed(
      {
        account,
        historic: false,
      },
      {
        fromBlock: 0n,
      },
    );

    const claimedRewards = (claimedRewardsResponse || []).reduce(
      (acc, r) => acc + (r.args.amount || 0n),
      0n,
    );
    return claimedRewards;
  }

  private static getAmountOnContract({
    account,
    merkleData,
  }: GetAmountOnContractProps) {
    const { claims = {} } = merkleData || {};
    const { amount } = claims[getAddress(account)] || {};

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
] as const;
