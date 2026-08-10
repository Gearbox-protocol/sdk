import type { Bps, Leverage } from "../../model/index.js";
import { PERCENTAGE_FACTOR, PRICE_DECIMALS, RAY } from "../constants/math.js";

/**
 * Conversions between the units the protocol stores and the basis points the
 * read model exposes.
 *
 * These live here rather than inside the service so that the on-chain adapter,
 * the merger and any future consumer of the read model share one definition of
 * every derived value.
 **/

const FULL = Number(PERCENTAGE_FACTOR);

/**
 * Converts a ray-scaled rate (`10 ** 27` = 100%) to basis points, truncating
 * towards zero.
 *
 * @example
 * ```ts
 * rayToBps(50_000_000_000_000_000_000_000_000n) // 500, i.e. 5%
 * ```
 **/
export function rayToBps(ray: bigint): Bps {
  return Number((ray * PERCENTAGE_FACTOR) / RAY);
}

/**
 * Converts a USD value in the oracle's 8-decimal fixed point to a float.
 *
 * @example
 * ```ts
 * usdToNumber(150_050_000_000n) // 1500.5
 * ```
 **/
export function usdToNumber(usd: bigint): number {
  return Number(usd) / Number(PRICE_DECIMALS);
}

/**
 * Share of capital currently borrowed, in basis points. Returns `0` when there
 * is nothing to borrow from, and never exceeds 100%.
 *
 * @example
 * ```ts
 * utilizationBps(750n, 1000n) // 7500, i.e. 75%
 * ```
 **/
export function utilizationBps(borrowed: bigint, total: bigint): Bps {
  if (total <= 0n || borrowed <= 0n) {
    return 0;
  }
  const utilization = Number((borrowed * PERCENTAGE_FACTOR) / total);
  return Math.min(utilization, FULL);
}

/**
 * Annual cost of debt for a credit manager, in basis points: the pool's base
 * rate plus the protocol's cut of the accrued interest.
 *
 * @param baseInterestRate - Pool base rate in ray.
 * @param feeInterest - Credit manager interest fee in basis points.
 *
 * @example
 * ```ts
 * // 5% base rate, 50% interest fee
 * borrowApyBps(50_000_000_000_000_000_000_000_000n, 5000) // 750, i.e. 7.5%
 * ```
 **/
export function borrowApyBps(
  baseInterestRate: bigint,
  feeInterest: number,
): Bps {
  return rayToBps(
    (baseInterestRate * (PERCENTAGE_FACTOR + BigInt(feeInterest))) /
      PERCENTAGE_FACTOR,
  );
}

/**
 * Highest leverage a liquidation threshold allows: `1 / (1 - lt)`.
 *
 * A threshold of 100% or more would allow unbounded leverage; such tokens are
 * not strategies and are filtered out before this is called, so the guard here
 * only exists to keep the function total.
 *
 * @example
 * ```ts
 * maxLeverage(9000) // 10
 * maxLeverage(8000) // 5
 * ```
 **/
export function maxLeverage(liquidationThreshold: Bps): Leverage {
  const equity = FULL - liquidationThreshold;
  return equity > 0 ? FULL / equity : Number.POSITIVE_INFINITY;
}

/**
 * Annual quota cost scaled to the debt a maximally leveraged position carries,
 * in basis points. Every unit of own capital carries `maxLeverage - 1` units of
 * debt, and the quota is paid on the whole quoted position.
 *
 * @example
 * ```ts
 * // 2.5% quota rate at 5x leverage
 * additionalBorrowApyBps(250, 5) // 1000, i.e. 10%
 * ```
 **/
export function additionalBorrowApyBps(
  quotaRate: Bps,
  leverage: Leverage,
): Bps {
  if (!Number.isFinite(leverage)) {
    return 0;
  }
  return Math.round(quotaRate * Math.max(leverage - 1, 0));
}
