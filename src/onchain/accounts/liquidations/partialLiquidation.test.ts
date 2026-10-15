import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { CreditAccountData } from "../../base/index.js";
import { WAD } from "../../constants/index.js";
import type { CreditSuite } from "../../market/index.js";
import { optimalPartialLiquidationAmounts } from "../../market/math.js";
import { AddressMap } from "../../utils/index.js";
import { partialLiquidationParams } from "./partialLiquidation.js";

const UNDERLYING = "0x0000000000000000000000000000000000000001" as Address;
const TOKEN_OUT = "0x0000000000000000000000000000000000000002" as Address;

const LIQUIDATION_DISCOUNT = 9600;
const FEE_LIQUIDATION = 150;
const LT_TOKEN_OUT = 8000;
const OPTIMAL_HF = 10_100n;
const TOTAL_DEBT = 100_000n;
const TWV = 95_000n;

// the oracle converts 1:1, so the twv in USD is the twv in underlying
function suite(minDebt: bigint, isExpired = false): CreditSuite {
  return {
    market: {
      underlying: UNDERLYING,
      priceOracle: {
        convertFromUSD: (_token: Address, value: bigint) => value,
        convert: (_from: Address, _to: Address, amount: bigint) => amount,
      },
    },
    creditManager: {
      address: "0x00000000000000000000000000000000000000cd",
      liquidationThresholds: new AddressMap([[TOKEN_OUT, LT_TOKEN_OUT]]),
    },
    creditFacade: { minDebt },
    isExpired,
    liquidationFees: () => ({
      feeLiquidation: FEE_LIQUIDATION,
      liquidationDiscount: LIQUIDATION_DISCOUNT,
    }),
    optimalHFForPartialLiquidation: () => OPTIMAL_HF,
  } as unknown as CreditSuite;
}

function account(healthFactor = WAD - 1n): CreditAccountData {
  return {
    debt: TOTAL_DEBT,
    accruedInterest: 0n,
    accruedFees: 0n,
    twvUSD: TWV,
    healthFactor,
  } as unknown as CreditAccountData;
}

function expected(minDebt: bigint) {
  return optimalPartialLiquidationAmounts({
    totalDebt: TOTAL_DEBT,
    twvUnderlying: TWV,
    minDebt,
    optimalHF: OPTIMAL_HF,
    liquidationDiscount: BigInt(LIQUIDATION_DISCOUNT),
    discount: BigInt(LIQUIDATION_DISCOUNT - FEE_LIQUIDATION),
    ltTokenOut: BigInt(LT_TOKEN_OUT),
  });
}

describe("partialLiquidationParams", () => {
  it("defaults repaidAmount to what the liquidator pays, fee included", () => {
    const { optimalAmount, repaidAmount: netRepaid } = expected(10_000n);
    const params = partialLiquidationParams({
      suite: suite(10_000n),
      account: account(),
      overrides: { tokenOut: TOKEN_OUT },
    });

    expect(params.repaidAmount).toBe(optimalAmount);
    expect(params.repaidAmount).toBeGreaterThan(netRepaid);
    expect(params.isPartiallyLiquidatable).toBe(true);
  });

  it("refuses a capped liquidation whether or not repaidAmount is overridden", () => {
    // leaves 20_000 above the minimum debt, less than the optimal repayment
    const capped = expected(80_000n);
    expect(capped.isOptimalRepayable).toBe(false);

    for (const repaidAmount of [undefined, 1_000n]) {
      const params = partialLiquidationParams({
        suite: suite(80_000n),
        account: account(),
        overrides: { tokenOut: TOKEN_OUT, repaidAmount },
      });
      expect(params.isPartiallyLiquidatable).toBe(false);
      expect(params.repaidAmount).toBe(repaidAmount ?? capped.optimalAmount);
    }
  });

  it("refuses an account whose debt is already below the minimum", () => {
    const params = partialLiquidationParams({
      suite: suite(TOTAL_DEBT + 1n),
      account: account(),
      overrides: { tokenOut: TOKEN_OUT, repaidAmount: 1_000n },
    });
    expect(params.isPartiallyLiquidatable).toBe(false);
  });

  it("refuses a healthy account unless its credit manager has expired", () => {
    for (const isExpired of [false, true]) {
      const params = partialLiquidationParams({
        suite: suite(10_000n, isExpired),
        account: account(WAD),
        overrides: { tokenOut: TOKEN_OUT },
      });
      expect(params.isPartiallyLiquidatable).toBe(isExpired);
    }
  });
});
