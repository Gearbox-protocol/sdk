import type { Address } from "viem";
import { formatUnits, getAddress, isAddress } from "viem";
import type { ChainId, Token, TokenAmount } from "../../model/index.js";
import { AddressMap, type OnchainSDK, toBigInt } from "../../onchain/index.js";
import { BigIntMath } from "../../onchain/utils/bigint-math.js";
import {
  MerkleXYZApi,
  type MerkleXYZUserRewardsV4Response,
} from "./merkl-api.js";

/**
 * One claimable Merkl liquidity-mining reward, denominated and priced.
 *
 * Both tokens arrive resolved, so a consumer neither looks one up nor
 * reassembles one out of the loose fields Merkl sends.
 */
export interface MerklReward {
  readonly chainId: ChainId;
  /** Market pool whose depositors the campaign rewards. */
  readonly pool: Address;
  /** That pool's share token — what the campaign is keyed on. */
  readonly poolToken: Token;
  /**
   * The incentive token being handed out, how much of it is claimable
   * (distributed minus already claimed, always > 0) and what that is worth.
   *
   * Priced by Merkl, not by the market oracles: a campaign's incentive token
   * is rarely collateral in the pool it incentivises, so the oracles usually
   * do not know it — GEAR, which most Gearbox campaigns pay in, among them.
   * `valueUsd` is `null` for a token Merkl does not price either.
   */
  readonly amount: TokenAmount;
}

type ReportHandler = (e: unknown, description?: string) => void;

/**
 * What this read needs off a chain's SDK: which chain to ask Merkl about, the
 * pools a campaign can be keyed on, and the registry that names their tokens.
 *
 * Sliced rather than taking the whole {@link OnchainSDK} so a caller can hand
 * over a narrowed object — a test fixture included — without casting.
 */
export type MerklRewardsSdk = Pick<
  OnchainSDK,
  "chainId" | "marketRegister" | "tokensMeta"
>;

export interface GetMerklRewardsProps {
  /**
   * The chain's SDK, attached. Reading `marketRegister` before attach throws,
   * which the slice above cannot express.
   */
  sdk: MerklRewardsSdk;
  account: Address;
  reportError?: ReportHandler;
  /** Raises Merkl's rate limit; the keyless path answers too. */
  apiKey?: string;
}

/**
 * The wallet's claimable Merkl rewards on one chain.
 *
 * Never rejects on a transport failure: the fetch is settled rather than
 * awaited, and a failure goes to `reportError` and yields an empty list. A
 * caller that must tell "this chain is down" from "this chain has no rewards"
 * has to watch that callback.
 */
export async function getMerklRewards({
  sdk,
  account,
  reportError,
  apiKey,
}: GetMerklRewardsProps): Promise<MerklReward[]> {
  const [merkleXYZLMResponse] = await Promise.allSettled([
    MerkleXYZApi.fetchWithFallback<MerkleXYZUserRewardsV4Response>(
      MerkleXYZApi.getUserRewardsUrl({
        params: {
          chainId: sdk.chainId,
          user: getAddress(account),
        },
      }),
      apiKey,
    ),
  ]);

  const merkleXYZLm = extractFulfilled(
    merkleXYZLMResponse,
    reportError,
    "merkleXYZLm",
  )?.data;

  // A v3.1 pool is its own ERC-4626 share token, so its address is the only
  // token a campaign can name. An `AddressMap` owns the casing: a campaign
  // names the pool in whatever case it was registered with, and lookups here
  // checksum both sides.
  const poolByItsToken = AddressMap.fromMappedArray(
    sdk.marketRegister.pools.map(({ pool }) => pool.address),
    address => address,
  );

  // Keyed by pool and incentive token: one campaign can pay the same token
  // through several breakdowns, and those are one row to a reader. Amounts are
  // summed raw and priced once at the end — pricing each breakdown and adding
  // the results would round every one of them.
  const claimable = new Map<string, Claimable>();

  for (const chainRewards of merkleXYZLm || []) {
    for (const reward of chainRewards.rewards) {
      // Guarding is what makes the maps safe to use: they checksum a key
      // before looking it up, and `getAddress("")` throws rather than missing.
      if (!isAddress(reward.token.address, { strict: false })) continue;
      const rewardTokenAddress = getAddress(reward.token.address);

      for (const reason of reward.breakdowns) {
        // Left in whatever case the campaign wrote it: the map checksums.
        const poolTokenAddress =
          (reason.reason || "")
            .split("_")
            .find(part => part.startsWith("0x")) ?? "";
        if (!isAddress(poolTokenAddress, { strict: false })) continue;

        const pool = poolByItsToken.get(poolTokenAddress);
        if (!pool) continue;

        const total = toBigInt(reason.amount || 0);
        const claimed = toBigInt(reason.claimed || 0);
        const amount = BigIntMath.max(total - claimed, 0n);
        if (amount === 0n) continue;

        const key = `${pool}_${rewardTokenAddress}`;
        const seen = claimable.get(key);
        if (seen) {
          seen.value += amount;
          continue;
        }

        const poolToken = sdk.tokensMeta.getToken(pool);
        // A pool the registry cannot name is a reward we cannot denominate.
        if (!poolToken) continue;

        claimable.set(key, {
          chainId: sdk.chainId,
          pool,
          poolToken,
          token: toRewardToken(sdk, rewardTokenAddress, reward.token),
          value: amount,
          price: reward.token.price,
        });
      }
    }
  }

  return [...claimable.values()].map(toReward);
}

/** One row while its breakdowns are still being summed. */
interface Claimable {
  chainId: ChainId;
  pool: Address;
  poolToken: Token;
  token: Token;
  value: bigint;
  price: number | undefined;
}

function toReward({ price, token, value, ...rest }: Claimable): MerklReward {
  return {
    ...rest,
    amount: {
      token,
      value,
      valueUsd:
        price === undefined
          ? null
          : Number(formatUnits(value, token.decimals)) * price,
    },
  };
}

/**
 * A campaign's incentive token is not protocol collateral, so the registry
 * usually has no entry for it — and Merkl always names it. The one place the
 * two sources are reconciled.
 */
function toRewardToken(
  sdk: MerklRewardsSdk,
  address: Address,
  merkl: { symbol: string; decimals: number },
): Token {
  return (
    sdk.tokensMeta.getToken(address) ?? {
      chainId: sdk.chainId,
      address,
      symbol: merkl.symbol,
      name: merkl.symbol,
      decimals: merkl.decimals || 18,
    }
  );
}

function extractFulfilled<T>(
  r: PromiseSettledResult<T>,
  reportError?: ReportHandler,
  description?: string,
): T | undefined {
  if (r.status === "fulfilled") {
    return r.value;
  }
  if (reportError) {
    reportError(r.reason, description);
  } else {
    console.error(r.reason);
  }
  return undefined;
}
