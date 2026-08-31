import type { Address } from "viem";
import { getAddress } from "viem";
import { describe, expect, it } from "vitest";
import { DUST_THRESHOLD } from "../constants/index.js";
import { MarketSuite } from "./MarketSuite.js";

const WETH = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const CBETH = getAddress("0xBe9895146f7AF43049ca1c1AE358B0541Ea49704");
const UNPRICEABLE = getAddress("0x1111111111111111111111111111111111111111");

/**
 * Rates into WETH. `null` is an unpriceable token, matching
 * `priceOracle.safeConvert`.
 */
const RATES: Partial<Record<Address, bigint>> = {
  [WETH]: 1n,
  [USDC]: 1n,
  [CBETH]: 2n,
};

function market(): MarketSuite {
  const m = {
    underlying: WETH,
    priceOracle: {
      safeConvert: (from: Address, _to: Address, amount: bigint) => {
        const rate = RATES[getAddress(from)];
        return rate === undefined ? null : amount * rate;
      },
    },
  };
  return Object.assign(m, {
    valueInUnderlying: MarketSuite.prototype.valueInUnderlying,
  }) as unknown as MarketSuite;
}

describe("MarketSuite.valueInUnderlying", () => {
  it("sums priceable tokens in the market underlying", () => {
    expect(
      market().valueInUnderlying([
        { token: USDC, balance: 100n },
        { token: CBETH, balance: 50n },
      ]),
    ).toEqual({ value: 200n });
  });

  it("skips dust at the default threshold", () => {
    expect(
      market().valueInUnderlying([
        { token: USDC, balance: DUST_THRESHOLD },
        { token: CBETH, balance: DUST_THRESHOLD + 1n },
      ]),
    ).toEqual({ value: (DUST_THRESHOLD + 1n) * 2n });
  });

  it("includes small balances when minBalance is 0", () => {
    expect(
      market().valueInUnderlying([{ token: USDC, balance: 1n }], 0n),
    ).toEqual({ value: 1n });
  });

  it("records the first unpriceable token and still sums the rest", () => {
    expect(
      market().valueInUnderlying([
        { token: USDC, balance: 100n },
        { token: UNPRICEABLE, balance: 50n },
        { token: CBETH, balance: 50n },
      ]),
    ).toEqual({ value: 200n, unpriceable: UNPRICEABLE });
  });
});
