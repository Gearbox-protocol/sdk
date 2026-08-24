import type { Bps } from "../../../model/index.js";
import { PERCENTAGE_FACTOR } from "../../constants/math.js";
import { calcUtilization } from "../math.js";

/**
 * Interest rate model parameters, all in basis points except the flag.
 **/
export interface RateModelParams {
  /**
   * Utilization at the first kink.
   **/
  U1: Bps;
  /**
   * Utilization at the second kink.
   **/
  U2: Bps;
  /**
   * Rate at zero utilization.
   **/
  Rbase: Bps;
  /**
   * Rate added between zero utilization and {@link U1}.
   **/
  Rslope1: Bps;
  /**
   * Rate added between {@link U1} and {@link U2}.
   **/
  Rslope2: Bps;
  /**
   * Rate added between {@link U2} and full utilization.
   **/
  Rslope3: Bps;
  /**
   * Whether borrowing past {@link U2} is forbidden.
   **/
  isBorrowingMoreU2Forbidden: boolean;
}

const FULL = Number(PERCENTAGE_FACTOR);

/**
 * Base rate borrowers pay at a given utilization, in basis points, following
 * the linear interest rate model's three segments.
 *
 * The result excludes the per-credit-manager interest fee: the model belongs to
 * the pool, and every credit manager of a market can charge a different one.
 **/
export function borrowRateAtUtilization(
  utilization: Bps,
  params: RateModelParams,
): Bps {
  const { U1, U2, Rbase, Rslope1, Rslope2, Rslope3 } = params;
  const u = Math.min(Math.max(utilization, 0), FULL);

  if (u <= 0) {
    return Rbase;
  }
  if (u <= U1) {
    return Math.round(Rbase + (Rslope1 * u) / U1);
  }
  if (u <= U2) {
    return Math.round(
      Rbase + Rslope1 + (Rslope2 * (u - U1)) / Math.max(U2 - U1, 1),
    );
  }
  return Math.round(
    Rbase + Rslope1 + Rslope2 + (Rslope3 * (u - U2)) / Math.max(FULL - U2, 1),
  );
}

/**
 * Pool utilization after a change in available liquidity, in basis points.
 *
 * Borrowing takes liquidity out (`availableLiquidityChange < 0`, utilization
 * rises), repaying puts it back (`> 0`, utilization falls). Expected liquidity
 * is treated as unchanged, which is what a borrow does to it; a repayment
 * settles accrued interest the pool had already counted, so the same holds
 * there to within the fees.
 **/
export function utilizationAfterLiquidityChange(
  expectedLiquidity: bigint,
  availableLiquidity: bigint,
  availableLiquidityChange: bigint,
): Bps {
  const available = availableLiquidity + availableLiquidityChange;
  const borrowed = expectedLiquidity - available;
  return calcUtilization(borrowed, expectedLiquidity);
}

/**
 * Rate depositors earn at a given utilization, in basis points: the interest
 * borrowers pay, spread over the pool's whole liquidity.
 **/
export function supplyRateAtUtilization(
  utilization: Bps,
  params: RateModelParams,
): Bps {
  const u = Math.min(Math.max(utilization, 0), FULL);
  return Math.round((borrowRateAtUtilization(u, params) * u) / FULL);
}

/**
 * Utilizations the rate curve is sampled at: a fixed grid plus both kinks of
 * the model, so the borrow leg is exact and the supply leg — which is
 * quadratic between kinks — is smooth.
 **/
export function rateCurveUtilizations(params: RateModelParams): Bps[] {
  const step = FULL / 20;
  const grid = new Set<Bps>();
  for (let u = 0; u <= FULL; u += step) {
    grid.add(u);
  }
  grid.add(params.U1);
  grid.add(params.U2);
  return [...grid].filter(u => u >= 0 && u <= FULL).sort((a, b) => a - b);
}
