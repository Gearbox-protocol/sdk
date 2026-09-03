import type { Address } from "viem";
import { formatUnits, getAddress, isAddress } from "viem";
import type { ChainId, Token, TokenAmount } from "../../model/index.js";
import type { OnchainSDK } from "../../onchain/index.js";
import { AddressMap, toBigInt } from "../../onchain/index.js";
import { BigIntMath } from "../../onchain/utils/bigint-math.js";
import type { MerkleXYZUserRewardsV4Response } from "./merkl-api.js";

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

/**
 * What the mapping needs off a chain's SDK: which chain the rows belong to,
 * the pools a campaign can be keyed on, and the registry that names their
 * tokens. Nothing else, and nothing asynchronous.
 */
export type MerklRewardsSdk = Pick<
  OnchainSDK,
  "chainId" | "marketRegister" | "tokensMeta"
>;

/**
 * Merkl's answer for one chain, turned into rows of the read model.
 */
export function toMerklRewards(
  sdk: MerklRewardsSdk,
  response: MerkleXYZUserRewardsV4Response,
): MerklReward[] {
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

  for (const chainRewards of response) {
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

        // Skipped like any other unusable row rather than thrown on: a single
        // malformed breakdown must not sink the chain, which the caller would
        // then be told is unreachable.
        const amounts = toAmounts(reason);
        if (!amounts) continue;
        const amount = BigIntMath.max(amounts.total - amounts.claimed, 0n);
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

/**
 * `toBigInt` throws on anything `BigInt()` cannot parse, and Merkl's amounts
 * are free-form strings.
 */
function toAmounts(reason: {
  amount: string;
  claimed: string;
}): { total: bigint; claimed: bigint } | undefined {
  try {
    return {
      total: toBigInt(reason.amount || 0),
      claimed: toBigInt(reason.claimed || 0),
    };
  } catch {
    return undefined;
  }
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
