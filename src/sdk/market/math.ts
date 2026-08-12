import type { Bps, Leverage } from "../../model/index.js";
import {
  MAX_UINT256,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  RAY,
  WAD,
} from "../constants/math.js";

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
 * Converts a credit account's health factor from the 18-decimal fixed point the
 * contracts store to basis points.
 *
 * An account with no debt return MAX_UINT256 from contract, here we return 0
 *
 * @example
 * ```ts
 * healthFactorBps(1_250_000_000_000_000_000n) // 12500, i.e. 1.25
 * ```
 **/
export function healthFactorBps(healthFactor: bigint): Bps {
  if (healthFactor === MAX_UINT256) {
    return 0;
  }
  return Number((healthFactor * PERCENTAGE_FACTOR) / WAD);
}

/**
 * Leverage of an open position: `totalDebt / equity`, where equity is what is
 * left of the position's value once its debt is repaid.
 *
 * Returns `0` for a position that carries no debt and for one that is
 * underwater, where there is no equity to lever.
 *
 * @param totalDebt - Debt principal plus accrued interest and fees.
 * @param totalValue - Total value of the position, in the same token.
 *
 * @example
 * ```ts
 * positionLeverage(800n, 1000n) // 4, i.e. 4x debt per unit of equity
 * ```
 **/
export function positionLeverage(
  totalDebt: bigint,
  totalValue: bigint,
): Leverage {
  const equity = totalValue - totalDebt;
  if (equity <= 0n || totalDebt <= 0n) {
    return 0;
  }
  return Number(totalDebt) / Number(equity);
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

/**
 * {@link PERCENTAGE_FACTOR} less a 0.1% safety buffer.
 *
 * Partial liquidation amounts are computed off prices that can drift between
 * quoting and execution, so both the seized and the repaid amount are pulled
 * this far away from the boundary the contracts would revert on.
 **/
export const PARTIAL_LIQUIDATION_BUFFER_BPS = 9990n;

/**
 * Minimum collateral a partial liquidation must seize for a given repayment,
 * derived from the liquidation discount and buffered by
 * {@link PARTIAL_LIQUIDATION_BUFFER_BPS}.
 *
 * @param tokenAmount - Repaid amount converted from underlying into the seized
 * token by the oracle.
 * @param liquidationDiscount - Discount in effect for this account, in basis
 * points (the expired variant once the credit manager has expired).
 **/
export function minSeizedAmount(
  tokenAmount: bigint,
  liquidationDiscount: Bps,
): bigint {
  return (
    (tokenAmount * PARTIAL_LIQUIDATION_BUFFER_BPS) / BigInt(liquidationDiscount)
  );
}

/**
 * Inputs of {@link optimalRepaidAmount}, all resolved against the account's
 * market and credit manager by the caller.
 **/
export interface OptimalRepaidAmountProps {
  /** Debt principal plus accrued interest and fees, in underlying. */
  totalDebt: bigint;
  /** Threshold-weighted value of the account, converted to underlying. */
  twvUnderlying: bigint;
  /** Credit facade's minimum debt, in underlying. */
  minDebt: bigint;
  /** Health factor to aim for, in basis points. */
  optimalHF: bigint;
  /** `liquidationDiscount - feeLiquidation`, in basis points. */
  discount: bigint;
  /** Liquidation threshold of the seized token, in basis points. */
  ltTokenOut: bigint;
}

/**
 * Amount of underlying whose repayment brings the account's health factor close
 * to `optimalHF`, capped so the account keeps at least `minDebt` of debt.
 *
 * Ported from solidity:
 * https://github.com/Gearbox-protocol/router-v3/blob/56e2d515ec6d9bb1e324e71c3708e59710779b24/contracts/liquidation/AbstractLiquidator.sol#L292
 *
 * @returns The repaid amount, or `0n` when the account is already healthy
 * enough or carries less than the minimum debt.
 * @throws If the discounted target health factor does not exceed the seized
 * token's liquidation threshold, in which case no repayment improves the
 * account.
 **/
export function optimalRepaidAmount({
  totalDebt,
  twvUnderlying,
  minDebt,
  optimalHF,
  discount,
  ltTokenOut,
}: OptimalRepaidAmountProps): bigint {
  const denominator = (discount * optimalHF) / PERCENTAGE_FACTOR - ltTokenOut;
  if (denominator <= 0n) {
    throw new Error(
      "cannot compute optimal repaid amount: invalid liquidation parameters (discount * hfOptimal <= ltTokenOut)",
    );
  }
  const numerator = totalDebt * optimalHF - twvUnderlying * PERCENTAGE_FACTOR;
  if (numerator <= 0n) {
    // Account is already healthy enough; nothing to repay.
    return 0n;
  }
  const optimalValueSeized = numerator / denominator;

  const repaidAmount = (optimalValueSeized * discount) / PERCENTAGE_FACTOR;

  if (totalDebt < minDebt) {
    return 0n;
  }
  const surplusDebt = totalDebt - minDebt;
  if (repaidAmount > surplusDebt) {
    return (surplusDebt * PARTIAL_LIQUIDATION_BUFFER_BPS) / PERCENTAGE_FACTOR;
  }
  return repaidAmount;
}

/**
 * Health factor a partial liquidation should target, in basis points: just
 * above 1, by enough to cover up to 1% of borrow cost so the account does not
 * fall back under water immediately.
 *
 * @param borrowRate - Blended borrow rate of the account, in basis points.
 **/
export function optimalHFForPartialLiquidation(borrowRate: bigint): bigint {
  return PERCENTAGE_FACTOR + (borrowRate < 100n ? borrowRate : 100n);
}
