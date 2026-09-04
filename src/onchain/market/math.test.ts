import { describe, expect, it } from "vitest";
import type { PoolOpportunity } from "../../model/index.js";
import type { OptimalRepaidAmountProps } from "./math.js";
import {
  bpsToRay,
  calcBorrowApy,
  calcEffectiveBorrowApy,
  calcMaxLeverage,
  calcNetStrategyApy,
  calcPositionLeverage,
  calcQuotaRate,
  calcUtilization,
  calcUtilizationRaw,
  minSeizedAmount,
  optimalHFForPartialLiquidation,
  optimalRepaidAmount,
  rayToBps,
  usdToNumber,
} from "./math.js";

const RAY_5_PERCENT = 50_000_000_000_000_000_000_000_000n;

describe("unit conversions", () => {
  it("converts ray rates to basis points", () => {
    expect(rayToBps(RAY_5_PERCENT)).toBe(500);
    expect(rayToBps(0n)).toBe(0);
  });

  it("converts basis points back to ray, exactly", () => {
    expect(bpsToRay(500)).toBe(RAY_5_PERCENT);
    expect(bpsToRay(0)).toBe(0n);
    // a projected rate is quoted in bps and spent as ray, so the round trip
    // has to be lossless at every step of the curve
    for (const bps of [1, 137, 2_500, 10_000, 45_000]) {
      expect(rayToBps(bpsToRay(bps))).toBe(bps);
    }
  });

  it("converts oracle USD to a float", () => {
    expect(usdToNumber(150_050_000_000n)).toBe(1500.5);
  });

  it("clamps compressor leftover dust to zero", () => {
    expect(usdToNumber(99n)).toBe(0);
    expect(usdToNumber(999n)).toBe(0);
    expect(usdToNumber(1_000n)).toBe(0.00001);
  });

  // the model's deltas are negative — a debt repaid, a balance sold — and a
  // threshold weighed on the signed value would report every one of them as $0
  it("prices a negative value rather than clamping it", () => {
    expect(usdToNumber(-150_050_000_000n)).toBe(-1500.5);
    expect(usdToNumber(-1_000n)).toBe(-0.00001);
    expect(usdToNumber(-999n)).toBe(0);
  });
});

describe("calcUtilizationRaw", () => {
  it("is the borrowed share of the total", () => {
    expect(calcUtilizationRaw(750n, 1000n)).toBe(7500);
  });

  it("is zero when there is nothing to borrow from", () => {
    expect(calcUtilizationRaw(750n, 0n)).toBe(0);
    expect(calcUtilizationRaw(0n, 1000n)).toBe(0);
  });

  it("never exceeds 100%, which accrued interest alone could push it past", () => {
    expect(calcUtilizationRaw(1100n, 1000n)).toBe(10_000);
  });
});

function poolOpportunity(borrowed: bigint, supply: bigint): PoolOpportunity {
  return {
    totalBorrowedWithInterest: { value: borrowed, valueUsd: null },
    totalSupply: { value: supply, valueUsd: null },
  } as PoolOpportunity;
}

describe("calcUtilization", () => {
  it("is the borrowed-with-interest share of total supply", () => {
    expect(calcUtilization(poolOpportunity(750n, 1000n))).toBe(7500);
  });

  it("is zero when there is nothing to borrow from", () => {
    expect(calcUtilization(poolOpportunity(750n, 0n))).toBe(0);
    expect(calcUtilization(poolOpportunity(0n, 1000n))).toBe(0);
  });

  it("never exceeds 100%, which accrued interest alone could push it past", () => {
    expect(calcUtilization(poolOpportunity(1100n, 1000n))).toBe(10_000);
  });
});

describe("calcBorrowApy", () => {
  it("adds the credit manager's cut to the pool's base rate", () => {
    expect(calcBorrowApy(RAY_5_PERCENT, 5000)).toBe(750);
  });

  it("is the bare base rate when the manager takes no fee", () => {
    expect(calcBorrowApy(RAY_5_PERCENT, 0)).toBe(500);
  });
});

describe("calcMaxLeverage", () => {
  it("is 95% over the equity share the threshold leaves", () => {
    expect(calcMaxLeverage(9000)).toBe(9);
    expect(calcMaxLeverage(8000)).toBe(4);
    expect(calcMaxLeverage(9500)).toBe(19);
  });

  it("solves the named health factor instead of the flat buffer", () => {
    // the flat buffer and a 1.01 target agree up to 92%, and part company
    // above it, where the buffer stops being worth 1%
    expect(calcMaxLeverage(9000, 10_100)).toBe(9);
    expect(calcMaxLeverage(9200, 10_100)).toBe(11);
    expect(calcMaxLeverage(9500, 10_100)).toBe(16);
  });

  it("reads a higher target as a tighter ceiling", () => {
    expect(calcMaxLeverage(9000, 11_000)).toBeLessThan(
      calcMaxLeverage(9000, 10_100),
    );
  });

  it("throws when the threshold reaches the target", () => {
    expect(() => calcMaxLeverage(10_100, 10_100)).toThrow(
      "cannot compute max leverage: liquidation threshold is 100% or more",
    );
    expect(() => calcMaxLeverage(9500, 9500)).toThrow(
      "cannot compute max leverage: liquidation threshold reaches the target health factor",
    );
  });

  it("is unleveraged when the collateral counts for nothing", () => {
    expect(calcMaxLeverage(0)).toBe(1);
  });

  it("throws when the threshold would allow unbounded leverage", () => {
    expect(() => calcMaxLeverage(10_000)).toThrow(
      "cannot compute max leverage: liquidation threshold is 100% or more",
    );
  });
});

describe("calcPositionLeverage", () => {
  it("is total value over remaining equity", () => {
    expect(calcPositionLeverage(1000n, 800n)).toBe(5);
  });

  it("is 1x when the position carries no debt", () => {
    expect(calcPositionLeverage(1000n, 0n)).toBe(1);
  });

  it("is zero when the position is underwater", () => {
    expect(calcPositionLeverage(800n, 1000n)).toBe(0);
  });
});

describe("calcQuotaRate", () => {
  it("adds the credit manager's cut to the quoted rate", () => {
    expect(calcQuotaRate(200, 2500)).toBe(250);
  });

  it("is the bare quoted rate when the manager takes no fee", () => {
    expect(calcQuotaRate(200, 0)).toBe(200);
  });
});

describe("calcEffectiveBorrowApy", () => {
  const opportunity = {
    borrowApy: 520,
    quotaRate: 90,
    liquidationThreshold: 9000,
  };

  it("charges base interest on the debt and quota on the LT-weighted position in safe mode", () => {
    // 5.2% × 8.5 + 0.9% × (9.5 × 0.9) = 4420 + 769.5 → 5190 bps
    expect(calcEffectiveBorrowApy(opportunity, 9.5)).toBe(5190);
  });

  it("quotes quota equal to the debt in min mode", () => {
    // 5.2% × 8.5 + 0.9% × 8.5 = 4420 + 765 = 5185 bps
    expect(calcEffectiveBorrowApy(opportunity, 9.5, "min")).toBe(5185);
  });

  it("quotes a 5% buffer over the debt in aggressive mode", () => {
    // 5.2% × 8.5 + 0.9% × (1.05 × 8.5) = 4420 + 803.25 → 5223 bps
    expect(calcEffectiveBorrowApy(opportunity, 9.5, "aggressive")).toBe(5223);
  });
});

describe("calcNetStrategyApy", () => {
  const opportunity = {
    borrowApy: 520,
    quotaRate: 90,
    liquidationThreshold: 9000,
  };

  it("is collateral yield on the whole position minus the effective borrow cost", () => {
    // 9.5 × 8% − 51.90% = 2410 bps
    expect(calcNetStrategyApy(opportunity, 800, 9.5)).toBe(2410);
  });

  it("uses the same quota mode as the borrow cost", () => {
    // 9.5 × 8% − 51.85% = 2415 bps
    expect(calcNetStrategyApy(opportunity, 800, 9.5, "min")).toBe(2415);
  });
});

describe("minSeizedAmount", () => {
  it("undoes the liquidation discount and keeps the safety buffer", () => {
    expect(minSeizedAmount(1_000_000n, 10_000)).toBe(999_000n);
    expect(minSeizedAmount(1_000_000n, 9700)).toBe(1_029_896n);
  });

  it("is the plain repaid amount when the discount is the buffer itself", () => {
    expect(minSeizedAmount(1_000_000n, 9990)).toBe(1_000_000n);
  });
});

describe("optimalRepaidAmount", () => {
  // Underwater account: 1e6 of debt against 990k of threshold-weighted value.
  const props: OptimalRepaidAmountProps = {
    totalDebt: 1_000_000n,
    twvUnderlying: 990_000n,
    minDebt: 100_000n,
    optimalHF: 10_100n,
    discount: 9500n,
    ltTokenOut: 8000n,
  };

  it("repays enough to lift the account to the target health factor", () => {
    expect(optimalRepaidAmount(props)).toBe(119_121n);
  });

  it("throws when seizing the token cannot improve the account", () => {
    expect(() =>
      optimalRepaidAmount({ ...props, discount: 9000n, ltTokenOut: 9500n }),
    ).toThrow("cannot compute optimal repaid amount");
  });

  it("repays nothing when the account is already healthy enough", () => {
    expect(optimalRepaidAmount({ ...props, twvUnderlying: 2_000_000n })).toBe(
      0n,
    );
  });

  it("repays nothing when the account carries less than the minimum debt", () => {
    expect(optimalRepaidAmount({ ...props, minDebt: 2_000_000n })).toBe(0n);
  });

  it("leaves the minimum debt in place, since repaying past it would revert", () => {
    // surplus over minDebt is 1000, well under the 119_121 the target asks for
    expect(optimalRepaidAmount({ ...props, minDebt: 999_000n })).toBe(999n);
  });
});

describe("optimalHFForPartialLiquidation", () => {
  it("targets just above 1, by the account's borrow cost", () => {
    expect(optimalHFForPartialLiquidation(0n)).toBe(10_000n);
    expect(optimalHFForPartialLiquidation(50n)).toBe(10_050n);
  });

  it("caps the premium at 1%, so expensive debt does not overshoot", () => {
    expect(optimalHFForPartialLiquidation(100n)).toBe(10_100n);
    expect(optimalHFForPartialLiquidation(5000n)).toBe(10_100n);
  });
});
