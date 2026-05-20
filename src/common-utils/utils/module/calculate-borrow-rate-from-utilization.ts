import { PERCENTAGE_FACTOR } from "@gearbox-protocol/sdk";
import type { LinearModel } from "./types.js";

export function calculateBorrowRateFromUtilization(
  util: bigint,
  model: LinearModel,
  extraPrecision = 1n,
) {
  const {
    U_1: U_1_r,
    U_2: U_2_r,
    R_base: R_base_r,
    R_slope1: R_slope1_r,
    R_slope2: R_slope2_r,
    R_slope3: R_slope3_r,
  } = model;

  const U_1 = U_1_r * extraPrecision;
  const U_2 = U_2_r * extraPrecision;
  const R_base = R_base_r * extraPrecision;
  const R_slope1 = R_slope1_r * extraPrecision;
  const R_slope2 = R_slope2_r * extraPrecision;
  const R_slope3 = R_slope3_r * extraPrecision;

  const ONE = PERCENTAGE_FACTOR * extraPrecision;

  // if (expectedLiquidity <= availableLiquidity) {
  //   return R_base_RAY; // U:[LIM-3]
  // }
  if (util === 0n) {
    return R_base;
  }

  // If U <= U_1:
  //                                    U
  // borrowRate = R_base + R_slope1 * -----
  //                                   U_1
  // return R_base_RAY + ((R_slope1_RAY * U_WAD) / U_1_WAD); // U:[LIM-3]
  if (util <= U_1) {
    if (U_1 === 0n) return R_base;
    const rate = R_base + (R_slope1 * util) / U_1;

    return rate;
  }

  // If U > U_1 & U <= U_2:
  //                                               U  - U_1
  // borrowRate = R_base + R_slope1 + R_slope2 * -----------
  //                                              U_2 - U_1
  // return R_base_RAY + R_slope1_RAY + (R_slope2_RAY * (U_WAD - U_1_WAD)) / (U_2_WAD - U_1_WAD); // U:[LIM-3]
  if (util > U_1 && util <= U_2) {
    const rate = R_base + R_slope1 + (R_slope2 * (util - U_1)) / (U_2 - U_1);

    return rate;
  }

  // If U > U_2:
  //                                                         U - U_2
  // borrowRate = R_base + R_slope1 + R_slope2 + R_slope3 * ----------
  //                                                         1 - U_2
  // return R_base_RAY + R_slope1_RAY + R_slope2_RAY + R_slope3_RAY * (U_WAD - U_2_WAD) / (WAD - U_2_WAD); // U:[LIM-3]
  const rate =
    R_base + R_slope1 + R_slope2 + (R_slope3 * (util - U_2)) / (ONE - U_2);

  return rate;
}
