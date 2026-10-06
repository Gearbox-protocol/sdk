import { describe, expect, it, vi } from "vitest";
import { unpriceableTokenError } from "../../../../model/index.js";
import { MAX_UINT256 } from "../../../constants/index.js";
import {
  type DebtLimits,
  debtForLeverage,
} from "../math.js";
import { strategyLimits } from "../strategyLimits.js";
import { ANY, CREDIT_MANAGER, UND } from "../testing/market.js";
import { buildOpenStrategySdk } from "./open-strategy.fixtures.js";

function collateralForDebtLimits(
  convert: (amount: bigint) => bigint | undefined,
  leverage: bigint,
  limits: DebtLimits,
  ratio = { numerator: 1n, denominator: 1n },
) {
  const sdk = buildOpenStrategySdk({
    extraPrices: { [ANY]: ratio.numerator, [UND]: ratio.denominator },
    extraDecimals: { [ANY]: 8 },
  });
  const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
  suite.creditFacade.minDebt = limits.minDebt;
  vi.spyOn(suite, "maxBorrowAmount").mockReturnValue({
    amount: suite.market.toUnderlyingAmount(limits.maxDebt),
    limit: "maxDebt",
  });
  vi.spyOn(suite.market.priceOracle, "safeConvert").mockImplementation(
    (_from, _to, amount) => {
      const value = convert(amount);
      return value === undefined
        ? { value: 0n, error: unpriceableTokenError(UND) }
        : { value };
    },
  );
  const bounds = strategyLimits({
    type: "OPEN",
    suite,
    collateral: [{ token: ANY, balance: 1n }],
    leverage,
    targetToken: UND,
    quotaReserve: undefined,
  })?.collateralLimits;
  return bounds ? { min: bounds.min.value, max: bounds.max.value } : undefined;
}

describe("strategyLimits — open", () => {
  it("inverts floor-rounded conversion and leverage with tight endpoints", () => {
    const convert = vi.fn((value: bigint) => (value * 17n) / 13n);
    const bounds = collateralForDebtLimits(
      convert,
      246n,
      {
        minDebt: 100n,
        maxDebt: 200n,
      },
      { numerator: 17n, denominator: 13n },
    );
    expect(bounds).toBeDefined();
    if (!bounds) throw new Error("expected bounds");
    expect(debtForLeverage(convert(bounds.min), 246n)).toBeGreaterThanOrEqual(
      100n,
    );
    expect(debtForLeverage(convert(bounds.min - 1n), 246n)).toBeLessThan(100n);
    expect(debtForLeverage(convert(bounds.max), 246n)).toBeLessThanOrEqual(
      200n,
    );
    expect(debtForLeverage(convert(bounds.max + 1n), 246n)).toBeGreaterThan(
      200n,
    );
    expect(convert.mock.calls.length).toBeLessThanOrEqual(1300);
  });

  it("clips at uint256 when the debt ceiling cannot be reached", () => {
    expect(
      collateralForDebtLimits(value => value, 130n, {
        minDebt: 100n,
        maxDebt: MAX_UINT256,
      }),
    ).toEqual({ min: 334n, max: MAX_UINT256 });
  });

  it("omits bounds when the minimum is outside the uint256 input domain", () => {
    expect(
      collateralForDebtLimits(
        value => value / 100n,
        130n,
        {
          minDebt: MAX_UINT256,
          maxDebt: MAX_UINT256,
        },
        { numerator: 1n, denominator: 100n },
      ),
    ).toBeUndefined();
  });

  it("omits bounds for degraded oracle conversions", () => {
    expect(
      collateralForDebtLimits(() => undefined, 130n, {
        minDebt: 100n,
        maxDebt: 200n,
      }),
    ).toBeUndefined();
  });

  it("does not allow zero debt even when the configured floor is zero", () => {
    expect(
      collateralForDebtLimits(value => value, 130n, {
        minDebt: 0n,
        maxDebt: 1n,
      }),
    ).toEqual({ min: 4n, max: 6n });
  });
});
