import type { Address } from "viem";
import { formatUnits, isAddress } from "viem";
import type { Token, TokenAmount } from "../model/index.js";
import { AddressMap, toBigInt } from "../onchain/index.js";
import type { MerklReward, RewardsSdk } from "./types.js";

/** A claimable amount of one token in one pool, before it is merged. */
export interface RewardPart {
  pool: Address;
  poolToken: Token;
  token: Token;
  value: bigint;
  /** USD price of one whole token, as the source sends it. */
  price: number | string | null | undefined;
}

/**
 * The pool a source names, and its share token. A v3.1 pool is its own
 * ERC-4626 share token, so its address is the only token a campaign can name;
 * the `AddressMap` owns the casing a source writes it in.
 */
export function resolvePool(sdk: RewardsSdk) {
  const pools = AddressMap.fromMappedArray(
    sdk.marketRegister.pools.map(({ pool }) => pool.address),
    address => address,
  );
  return (address: string | undefined) => {
    if (!address || !isAddress(address, { strict: false })) return undefined;
    const pool = pools.get(address);
    const poolToken = pool && sdk.tokensMeta.getToken(pool);
    return pool && poolToken ? { pool, poolToken } : undefined;
  };
}

/** Sources send amounts as free-form strings, which `toBigInt` throws on. */
export function parseAmount(value: string | undefined): bigint | undefined {
  if (value === undefined) return undefined;
  try {
    return toBigInt(value || 0);
  } catch {
    return undefined;
  }
}

/** What is left of `total` after `claimed`, when anything is. */
export function remaining(
  total: bigint | undefined,
  claimed: bigint | undefined,
): bigint | undefined {
  if (total === undefined || claimed === undefined) return undefined;
  return total > claimed ? total - claimed : undefined;
}

/**
 * An incentive token is rarely protocol collateral, so the registry usually
 * has no entry for it — and both sources always name it.
 */
export function toRewardToken(
  sdk: RewardsSdk,
  address: Address,
  named: { symbol: string; name?: string; decimals: number },
): Token {
  return (
    sdk.tokensMeta.getToken(address) ?? {
      chainId: sdk.chainId,
      address,
      symbol: named.symbol,
      name: named.name ?? named.symbol,
      decimals: named.decimals || 18,
    }
  );
}

/** A missing or unparsable price is `null`. */
function toPricedAmount(
  token: Token,
  value: bigint,
  price: RewardPart["price"],
): TokenAmount {
  const usd = Number(price ?? NaN);
  return {
    token,
    value,
    valueUsd: Number.isFinite(usd)
      ? Number(formatUnits(value, token.decimals)) * usd
      : null,
  };
}

/**
 * One reward per pool and incentive token, at the last part's price. Amounts
 * are summed raw and priced once at the end — pricing each part and adding the results would round
 * every one of them.
 */
export function mergeRewards(
  sdk: RewardsSdk,
  source: MerklReward["source"],
  parts: readonly RewardPart[],
): MerklReward[] {
  const merged = new Map<string, RewardPart>();
  for (const part of parts) {
    const key = `${part.pool}_${part.token.address}`;
    const seen = merged.get(key);
    merged.set(key, seen ? { ...part, value: seen.value + part.value } : part);
  }
  return [...merged.values()].map(
    ({ pool, poolToken, token, value, price }) => ({
      source,
      chainId: sdk.chainId,
      pool,
      poolToken,
      amount: toPricedAmount(token, value, price),
    }),
  );
}
