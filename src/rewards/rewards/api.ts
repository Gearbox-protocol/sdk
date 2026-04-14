import type { Address } from "viem";
import { getAddress } from "viem";
import { BigIntMath } from "../../common-utils/index.js";
import { chains, type NetworkType, toBigInt } from "../../sdk/index.js";
import {
  MerkleXYZApi,
  type MerkleXYZUserRewardsV4Response,
} from "./merkl-api.js";

export interface PoolData {
  address: Address;
  version: number;
  underlyingToken: Address;
  dieselRateRay: bigint;
  dieselToken: Address;
  stakedDieselToken: Address[];
  stakedDieselToken_old: Address[];
  expectedLiquidity: bigint;
}

export interface GearboxExtraMerkleLmReward {
  pool: Address;
  poolToken: Address;

  rewardTokenSymbol: string;
  rewardTokenDecimals: number;
  rewardToken: Address;
  amount: bigint;

  type: "extraMerkle";
}

export type GearboxLmReward = GearboxExtraMerkleLmReward;

type ReportHandler = (e: unknown, description?: string) => void;

export interface GetLmRewardsMerkleProps {
  pools: Record<Address, PoolData>;
  account: Address;
  network: NetworkType;
  reportError?: ReportHandler;
}

export class RewardAmountAPI {
  private constructor() {}

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

    const merkleXYZLm = RewardAmountAPI.extractFulfilled(
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
}
