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
 * // ray: 5% (0.05 × 10²⁷)
 * rayToBps(50_000_000_000_000_000_000_000_000n) // 500 bps = 5%
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
 * // usd: $1500.50 in 8-decimal fixed point
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
 * // borrowed: 750, total: 1000
 * calcUtilization(750n, 1000n) // 750 / 1000 = 7500 bps = 75%
 * ```
 **/
export function calcUtilization(borrowed: bigint, total: bigint): Bps {
  if (total <= 0n || borrowed <= 0n) {
    return 0;
  }
  const utilization = Number((borrowed * PERCENTAGE_FACTOR) / total);
  return Math.min(utilization, FULL);
}

/**
 * Annual cost of debt for a credit manager, in basis points:
 * `baseInterestRate × (1 + feeInterest)` — the pool's base rate plus the
 * protocol's cut of the accrued interest.
 *
 * @param baseInterestRate - Pool base rate in ray.
 * @param feeInterest - Credit manager interest fee in basis points.
 *
 * @example
 * ```ts
 * // baseInterestRate: 5% in ray, feeInterest: 5000 bps = 50%
 * calcBorrowApy(50_000_000_000_000_000_000_000_000n, 5000) // 5% × 1.5 = 750 bps = 7.5%
 * ```
 **/
export function calcBorrowApy(
  baseInterestRate: bigint,
  feeInterest: number,
): Bps {
  return rayToBps(
    (baseInterestRate * (PERCENTAGE_FACTOR + BigInt(feeInterest))) /
      PERCENTAGE_FACTOR,
  );
}

/**
 * 5% safety margin subtracted from 100% in {@link calcMaxLeverage}, so a
 * maxed position opens with HF slightly above 1.
 **/
export const MAX_LEVERAGE_BUFFER_BPS = 500;

/**
 * Highest total-value leverage a liquidation threshold allows:
 * `(100% − buffer) / (100% − liquidationThreshold)`. At HF = 1, debt is
 * `liquidationThreshold × totalValue`, leaving `1 − liquidationThreshold` of
 * equity per unit of exposure; the {@link MAX_LEVERAGE_BUFFER_BPS} buffer
 * keeps the maxed position slightly away from that boundary.
 *
 * @example
 * ```ts
 * // liquidationThreshold: 9000 bps = 90%
 * calcMaxLeverage(9000) // (1 − 0.05) / (1 − 0.9) = 9.5x total exposure
 * ```
 **/
export function calcMaxLeverage(liquidationThreshold: Bps): Leverage {
  if (liquidationThreshold >= FULL) {
    return 0;
  }
  const leverage =
    (FULL - MAX_LEVERAGE_BUFFER_BPS) / (FULL - liquidationThreshold);
  return Math.max(leverage, 1);
}

/**
 * Converts a credit account's health factor from the 18-decimal fixed point the
 * contracts store to basis points.
 *
 * Accounts with no debt store `MAX_UINT256` on-chain; for those this
 * returns `0`.
 *
 * @example
 * ```ts
 * // healthFactor: 1.25 in 18-decimal fixed point
 * healthFactorBps(1_250_000_000_000_000_000n) // 12500 bps = 1.25
 * ```
 **/
export function healthFactorBps(healthFactor: bigint): Bps {
  if (healthFactor === MAX_UINT256) {
    return 0;
  }
  return Number((healthFactor * PERCENTAGE_FACTOR) / WAD);
}

/**
 * Total-value leverage of an open position:
 * `totalValue / (totalValue − totalDebt)`. `1` when unleveraged, `0` when
 * underwater.
 *
 * @param totalValue - Total value of the position.
 * @param totalDebt - Debt principal plus accrued interest and fees, same token.
 *
 * @example
 * ```ts
 * // totalValue: 100k, totalDebt: 80k → equity: 100k − 80k = 20k
 * calcPositionLeverage(100_000n, 80_000n) // 100k / 20k = 5x
 * ```
 **/
export function calcPositionLeverage(
  totalValue: bigint,
  totalDebt: bigint,
): Leverage {
  const equity = totalValue - totalDebt;
  if (totalValue <= 0n || equity <= 0n) {
    return 0;
  }
  if (totalDebt <= 0n) {
    return 1;
  }
  return Number(totalValue) / Number(equity);
}

/**
 * Annual quota cost on equity, in basis points:
 * `quotaRate × (1 + feeInterest) × leverage`. Quota accrues on the whole
 * quoted position, and the DAO takes `feeInterest` of it as with base interest.
 *
 * @example
 * ```ts
 * // quotaRate: 200 bps = 2%, feeInterest: 2500 bps = 25%, leverage: 9.5x
 * calcAdditionalBorrowApy(200, 2500, 9.5) // 2% × 1.25 × 9.5 = 2375 bps = 23.75%
 * ```
 **/
export function calcAdditionalBorrowApy(
  quotaRate: Bps,
  feeInterest: Bps,
  leverage: Leverage,
): Bps {
  if (!Number.isFinite(leverage) || leverage <= 0) {
    return 0;
  }
  return Math.round(quotaRate * (1 + feeInterest / FULL) * leverage);
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
