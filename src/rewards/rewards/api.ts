import type { Address, PublicClient, WalletClient } from "viem";
import { getAddress, getContract } from "viem";
import { iFarmingPoolAbi } from "../../abi/iFarmingPool.js";
import { BigIntMath } from "../../common-utils/index.js";
import { chains, type NetworkType, toBigInt } from "../../sdk/index.js";
import type { PoolData, TokenData } from "./common.js";
import {
  MerkleXYZApi,
  type MerkleXYZUserRewardsV4Response,
} from "./merkl-api.js";

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

export type GearboxLmReward =
  | GearboxStakedV3LmReward
  | GearboxExtraMerkleLmReward;

interface FarmInfoOutput {
  finished: number;
  duration: number;
  reward: bigint;
  balance: bigint;
}

type ReportHandler = (e: unknown, description?: string) => void;

export interface GetLmRewardsV3Props {
  pools: Record<`0x${string}`, PoolData>;
  tokensList: Record<Address, TokenData>;
  account: Address;
  provider: PublicClient;

  reportError?: ReportHandler;
}

export interface GetLmRewardsMerkleProps {
  pools: Record<Address, PoolData>;
  account: Address;
  network: NetworkType;
  reportError?: ReportHandler;
}

export interface ClaimLmRewardsV3Props {
  reward: GearboxStakedV3LmReward;
  account: Address;
  signer: WalletClient;
}

export class GearboxRewardsApi {
  private constructor() {}

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
    const stakedDieselTokens = Object.keys(poolByStakedDiesel) as Address[];

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
      MerkleXYZApi.fetchWithFallback<MerkleXYZUserRewardsV4Response>(
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
