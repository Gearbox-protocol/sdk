import axios from "axios";
import type { Address, PublicClient, WalletClient } from "viem";
import { getAddress, getContract } from "viem";

import { iAirdropDistributorAbi } from "../../../abi/iAirdropDistributor.js";
import { iFarmingPoolAbi } from "../../../abi/iFarmingPool.js";
import type { NetworkType } from "../../chain/index.js";
import { chains } from "../../chain/index.js";
import { TypedObjectUtils, toBigInt } from "../../utils/index.js";
import { GearboxBackendApi } from "../core/endpoint.js";
import type { PoolData_Legacy } from "../core/pool.js";
import type { TokenData } from "../tokens/tokenData.js";
import { BigIntMath } from "../utils/math.js";
import type { MerkleXYZUserRewardsV4Response } from "./merklAPI.js";
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

type ReportHandler = (e: unknown, description?: string) => void;

export interface GetLmRewardsV2Props {
  account: Address;
  provider: PublicClient;
  gearTokenAddress: Address;
  airdropDistributorAddress: Address;
  network: NetworkType;

  reportError?: ReportHandler;
}

export interface GetLmRewardsV3Props {
  pools: Record<`0x${string}`, PoolData_Legacy>;
  tokensList: Record<Address, TokenData>;
  account: Address;
  provider: PublicClient;

  reportError?: ReportHandler;
}

export interface GetLmRewardsMerkleProps {
  pools: Record<Address, PoolData_Legacy>;
  account: Address;
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

export class GearboxRewardsApi {
  static async getLmRewardsV2({
    provider,
    account,
    gearTokenAddress,

    network,
    airdropDistributorAddress,
    reportError,
  }: GetLmRewardsV2Props) {
    if (!airdropDistributorAddress) return [];

    const [claimedRespUnsafe, merkleDataRespUnsafe] = await Promise.allSettled([
      GearboxRewardsApi.getClaimed({
        airdropDistributorAddress,
        provider,
        account,
      }),
      GearboxRewardsApi.getMerkle(
        provider,
        airdropDistributorAddress,
        network,
        account,
      ),
    ]);

    const claimedResp =
      GearboxRewardsApi.extractFulfilled(
        claimedRespUnsafe,
        reportError,
        "getLmRewardsV2",
      ) || 0n;

    const merkleDataResp = GearboxRewardsApi.extractFulfilled(
      merkleDataRespUnsafe,
      reportError,
      "getLmRewardsV2",
    );

    const amountOnContract = GearboxRewardsApi.getAmountOnContract({
      account,
      merkleData: merkleDataResp,
    });
    const diff = amountOnContract - claimedResp;
    const availableToClaimV2 = BigIntMath.max(0n, diff);

    const rewards: Array<GearboxLmReward> = [
      {
        amount: availableToClaimV2,
        type: "merkleV2",

        rewardToken: gearTokenAddress,
        rewardTokenDecimals: 18,
        rewardTokenSymbol: "GEAR",
      },
    ];

    return rewards;
  }

  static async getLmRewardsV3({
    pools,
    tokensList,
    provider,
    account,
    reportError,
  }: GetLmRewardsV3Props) {
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
    const stakedDieselTokens = TypedObjectUtils.keys(poolByStakedDiesel);

    // for each staked diesel get farmInfo
    const farmInfoCalls = stakedDieselTokens.map(address => ({
      address,
      abi: iFarmingPoolAbi,
      functionName: "farmInfo",
      args: [],
    }));

    // for each staked diesel get reward token
    const rewardTokenCalls = stakedDieselTokens.map(address => ({
      address,
      abi: POOL_REWARDS_ABI,
      functionName: "rewardsToken",
      args: [],
    }));

    // for each staked diesel get farmed amount
    const farmedCalls = stakedDieselTokens.map(address => ({
      address: address,
      abi: iFarmingPoolAbi,
      functionName: "farmed",
      args: [account],
    }));

    const [response] = await Promise.allSettled([
      provider.multicall({
        allowFailure: false,
        contracts: [...farmInfoCalls, ...rewardTokenCalls, ...farmedCalls],
        batchSize: 0,
      }),
    ]);

    const safeResponse =
      GearboxRewardsApi.extractFulfilled(response, reportError, "v3Rewards") ||
      [];

    const farmInfoCallsEnd = farmInfoCalls.length;
    const farmInfo = safeResponse.slice(
      0,
      farmInfoCallsEnd,
    ) as Array<FarmInfoOutput>;

    const rewardTokenCallsEnd = farmInfoCallsEnd + rewardTokenCalls.length;
    const rewardTokens = safeResponse.slice(
      farmInfoCallsEnd,
      rewardTokenCallsEnd,
    ) as Array<Address>;

    const farmedCallsEnd = rewardTokenCallsEnd + farmedCalls.length;
    const farmedList = safeResponse.slice(
      rewardTokenCallsEnd,
      farmedCallsEnd,
    ) as Array<bigint>;

    const gearboxLmRewards = stakedDieselTokens.map(
      (address, i): GearboxLmReward | undefined => {
        const pool = poolByStakedDiesel[address];
        const info = farmInfo[i];
        const rewardToken = rewardTokens[i]?.toLowerCase() as Address;
        const farmed = farmedList[i];

        if (!pool || !info || !rewardToken) return undefined;

        return {
          pool: pool,
          poolToken: address,

          rewardToken,
          rewardTokenDecimals: tokensList[rewardToken]?.decimals || 18,
          rewardTokenSymbol: tokensList[rewardToken]?.symbol || "unknown",

          amount: farmed ?? 0n,
          type: "stakedV3",
        };
      },
    );

    const { zero, nonZero } = gearboxLmRewards.reduce<{
      nonZero: Array<GearboxLmReward>;
      zero: Array<GearboxLmReward>;
    }>(
      (acc, r) => {
        if (r && r.amount > 0n) {
          acc.nonZero.push(r);
        } else if (r) {
          acc.zero.push(r);
        }

        return acc;
      },
      { nonZero: [], zero: [] },
    );

    return [...nonZero, zero];
  }

  static async getLmRewardsMerkle({
    pools,
    account,
    network,
    reportError,
  }: GetLmRewardsMerkleProps) {
    const [merkleXYZLMResponse] = await Promise.allSettled([
      axios.get<MerkleXYZUserRewardsV4Response>(
        MerkleXYZApi.getUserRewardsUrl({
          params: {
            chainId: chains[network].id,
            user: getAddress(account),
          },
        }),
      ),
    ]);

    const merkleXYZLm = GearboxRewardsApi.extractFulfilled(
      merkleXYZLMResponse,
      reportError,
      "merkleXYZLm",
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

    const extraRewards = (merkleXYZLm || []).reduce<
      Record<string, GearboxLmReward>
    >((acc, chainRewards) => {
      chainRewards.rewards.forEach(reward => {
        const rewardToken = reward.token.address.toLowerCase() as Address;

        reward.breakdowns.forEach(reason => {
          const poolToken = (
            (reason.reason || "")
              .split("_")
              .find(part => part.startsWith("0x")) || ""
          ).toLowerCase() as Address;

          const pool = poolByItsToken[poolToken];

          const total = toBigInt(reason.amount || 0);
          const claimed = toBigInt(reason.claimed || 0);
          const claimable = BigIntMath.max(total - claimed, 0n);

          const key = [pool, poolToken, rewardToken].join("_");

          if (pool && claimable > 0n) {
            const prevAmount = acc[key]?.amount || 0n;

            acc[key] = {
              pool,
              poolToken,
              rewardToken,
              rewardTokenSymbol: reward.token.symbol,
              rewardTokenDecimals: reward.token.decimals || 18,
              amount: prevAmount + claimable,
              type: "extraMerkle",
            };
          }
        });
      });

      return acc;
    }, {});

    return Object.values(extraRewards);
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

    const merkleData = await GearboxRewardsApi.getMerkle(
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
    const { amount } = merkleData?.claims?.[getAddress(account)] || {};

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
