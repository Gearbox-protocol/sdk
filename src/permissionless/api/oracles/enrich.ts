import { type Address, formatUnits } from "viem";
import type {
  PermissionlessAssetQuota,
  PermissionlessIndexedAssetSummary,
  PermissionlessQuotaTotals,
  PriceFeedPrice,
} from "./types.js";

/**
 * What the oracles namespace works out for itself once the backend has
 * answered.
 *
 * All of it used to be the backend's, and all of it needs the chain: a quota
 * is denominated in its market's own underlying and a market cap is a supply
 * times a price, so none of these can be indexed — they can only be read at
 * the block the reader is on. Keeping them here means one description of each
 * rule rather than one per service that wants it, and a backend that holds no
 * viem client at all.
 **/

/** Identifies a feed across chains, since an address alone does not. */
export function feedKey(chainId: number, address: Address): string {
  return `${chainId}:${address.toLowerCase()}`;
}

/** Prices looked up the way {@link totalQuotas} and the caps need them. */
export function pricesByFeed(
  prices: PriceFeedPrice[],
): Map<string, bigint | null> {
  return new Map(
    prices.map(({ chainId, address, price }) => [
      feedKey(chainId, address),
      price,
    ]),
  );
}

/**
 * The asset's quota across its markets, totalled in USD.
 *
 * Each market's figures are converted at the price that market's own oracle
 * holds for its underlying, which is the same number that market's accounting
 * uses.
 *
 * Limits count only the markets still running, because a shut down market's
 * limit is not borrowable; what is already quoted counts everywhere, because
 * debt outstanding is exposure either way. A market whose underlying could not
 * be priced is skipped, which makes both figures floors, and `null` is nothing
 * to total rather than a zero.
 *
 * @param priceOf - The price each underlying feed reports, in the 8 decimals
 * every Gearbox feed uses.
 */
export function totalQuotas(
  quotas: PermissionlessAssetQuota[],
  priceOf: (feed: Address) => bigint | null | undefined,
): PermissionlessQuotaTotals {
  let limit = 0;
  let used = 0;
  let anyLimit = false;
  let anyUsed = false;

  for (const quota of quotas) {
    const raw =
      quota.underlyingPriceFeed === null
        ? null
        : priceOf(quota.underlyingPriceFeed);
    if (raw === null || raw === undefined) {
      continue;
    }
    const price = Number(formatUnits(raw, 8));

    if (quota.quotaUsed !== null) {
      used += quota.quotaUsed * price;
      anyUsed = true;
    }
    if (quota.quotaLimit !== null && !quota.isShutdown) {
      limit += quota.quotaLimit * price;
      anyLimit = true;
    }
  }

  return {
    quotaLimitUsd: anyLimit ? limit : null,
    quotaUsedUsd: anyUsed ? used : null,
  };
}

/**
 * What one feed values one asset's supply at: `price × totalSupply`.
 *
 * Multiplied as integers and formatted once, rather than through two floats:
 * an 8-decimal price times an 18-decimal supply loses its small end to a JS
 * number long before it loses the large one, and the figure is a total rather
 * than an estimate.
 *
 * `null` if either side could not be read — an asset nobody could price is
 * not an asset worth nothing.
 */
export function toCap(
  price: bigint | null | undefined,
  totalSupply: bigint | null | undefined,
  decimals: number,
): string | null {
  if (
    price === null ||
    price === undefined ||
    totalSupply === null ||
    totalSupply === undefined
  ) {
    return null;
  }
  return formatUnits(price * totalSupply, 8 + decimals);
}

/** Larger first, with `null` after every figure including a real zero. */
function descending(a: number | null, b: number | null): number {
  return (b ?? -1) - (a ?? -1);
}

/**
 * Assets ordered the way a reader scans them: what the protocol is built on
 * first, then what is actually borrowed against it, then what it is merely
 * allowed to be borrowed against.
 *
 * Applied here and not by the backend because the two middle terms are the
 * converted quotas, which only exist once the chain has been read. The
 * backend orders by the first term and the tie-breakers, so a caller reading
 * the route directly still gets a stable order; this refines it.
 */
export function byCentrality<
  T extends PermissionlessIndexedAssetSummary & PermissionlessQuotaTotals,
>(a: T, b: T): number {
  return (
    b.underlyingMarketCount - a.underlyingMarketCount ||
    descending(a.quotaUsedUsd, b.quotaUsedUsd) ||
    descending(a.quotaLimitUsd, b.quotaLimitUsd) ||
    a.symbol.localeCompare(b.symbol) ||
    a.address.localeCompare(b.address) ||
    a.chainId - b.chainId
  );
}
