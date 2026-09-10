import { getAddress, parseEther, parseUnits } from "viem";
import { describe, expect, it } from "vitest";
import { unpriceableTokenError } from "../../../model/index.js";
import { DUST_THRESHOLD, NATIVE_ADDRESS } from "../../constants/index.js";
import { MockTokens, TestPriceOracle } from "./TestPriceOracle.mock.js";

const { USDC, DAI, cbETH, WETH } = MockTokens;
const UNPRICEABLE = getAddress("0x1111111111111111111111111111111111111111");

const ONE_USDC = parseUnits("1", 6);

describe("PriceOracleBaseContract.convert", () => {
  it("throws when the instructed main feed is missing", () => {
    expect(() => new TestPriceOracle().convert(USDC, WETH, 100n)).toThrow(
      `no answer found for token ${USDC}`,
    );
  });

  it("throws when the instructed reserve feed is missing", () => {
    expect(() =>
      new TestPriceOracle({
        [USDC]: { price: 1 },
      }).convert(USDC, WETH, 100n, true),
    ).toThrow(`no answer found for token ${USDC}`);
  });

  it("throws from convertToUSD when the instructed feed is missing", () => {
    expect(() => new TestPriceOracle().convertToUSD(USDC, 100n)).toThrow(
      `no answer found for token ${USDC}`,
    );
  });

  it("converts token-to-token at main-feed prices and decimals", () => {
    const oracle = new TestPriceOracle({
      [USDC]: { price: 1 },
      [WETH]: { price: 2000 },
    });
    // 1 USDC at $1 into WETH at $2000 is 0.0005 WETH
    expect(oracle.convert(USDC, WETH, ONE_USDC)).toBe(parseEther("0.0005"));
  });
});

describe("PriceOracleBaseContract.safeConvert", () => {
  it("passes through when from equals to, even with no feeds", () => {
    expect(new TestPriceOracle().safeConvert(USDC, USDC, 100n)).toEqual({
      value: 100n,
    });
  });

  it("does not fall back when the main feed answers 0", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { price: 0, reservePrice: 3 },
        [WETH]: { price: 2000, reservePrice: 2000 },
      }).safeConvert(USDC, WETH, ONE_USDC),
    ).toEqual({ value: 0n });
  });

  it("uses the main feed when it answers", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { price: 2 },
        [WETH]: { price: 2000 },
      }).safeConvert(USDC, WETH, ONE_USDC),
    ).toEqual({ value: parseEther("0.001") });
  });

  it("falls back to the reserve feed when main throws", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { reservePrice: 2 },
        [WETH]: { reservePrice: 2000 },
      }).safeConvert(USDC, WETH, ONE_USDC),
    ).toEqual({ value: parseEther("0.001") });
  });

  it("returns 0n and UnpriceableTokenError when neither feed answers", () => {
    expect(new TestPriceOracle().safeConvert(UNPRICEABLE, WETH, 100n)).toEqual({
      value: 0n,
      error: unpriceableTokenError(UNPRICEABLE),
    });
  });
});

describe("PriceOracleBaseContract.safeConvertToUSD", () => {
  it("uses the main feed when it answers, even if reserve is cheaper", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { price: 2, reservePrice: 1 },
      }).safeConvertToUSD(USDC, ONE_USDC),
    ).toEqual({ value: 2n * 10n ** 8n });
  });

  it("does not fall back when the main feed answers 0", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { price: 0, reservePrice: 3 },
      }).safeConvertToUSD(USDC, ONE_USDC),
    ).toEqual({ value: 0n });
  });

  it("falls back to the reserve feed when main throws", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { reservePrice: 3 },
      }).safeConvertToUSD(USDC, ONE_USDC),
    ).toEqual({ value: 3n * 10n ** 8n });
  });

  it("returns 0n and UnpriceableTokenError when neither feed answers", () => {
    expect(new TestPriceOracle().safeConvertToUSD(UNPRICEABLE, 100n)).toEqual({
      value: 0n,
      error: unpriceableTokenError(UNPRICEABLE),
    });
  });
});

describe("PriceOracleBaseContract.safeConvertMinUSD", () => {
  it("takes the min when both feeds answer", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { price: 2, reservePrice: 1 },
      }).safeConvertMinUSD(USDC, ONE_USDC),
    ).toEqual({ value: 1n * 10n ** 8n });
  });

  it("returns 0n with no error when there is no reserve feed", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { price: 2 },
      }).safeConvertMinUSD(USDC, ONE_USDC),
    ).toEqual({ value: 0n });
  });

  it("returns 0n and UnpriceableTokenError when main is missing", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { reservePrice: 3 },
      }).safeConvertMinUSD(USDC, ONE_USDC),
    ).toEqual({
      value: 0n,
      error: unpriceableTokenError(USDC),
    });
  });

  it("returns 0n and UnpriceableTokenError when the reserve feed's answer failed", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { price: 2 },
      })
        .failReserveAnswer(USDC)
        .safeConvertMinUSD(USDC, ONE_USDC),
    ).toEqual({
      value: 0n,
      error: unpriceableTokenError(USDC),
    });
  });

  it("uses the main feed when both feeds answer the same", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { price: 2, reservePrice: 2 },
      }).safeConvertMinUSD(USDC, ONE_USDC),
    ).toEqual({ value: 2n * 10n ** 8n });
  });
});

describe("PriceOracleBaseContract.toAmount", () => {
  it("prices at the main feed", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { price: 2 },
      }).toAmount(USDC, ONE_USDC),
    ).toEqual({ value: ONE_USDC, valueUsd: 2 });
  });

  it("falls back to the reserve feed when main throws", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { reservePrice: 3 },
      }).toAmount(USDC, ONE_USDC),
    ).toEqual({ value: ONE_USDC, valueUsd: 3 });
  });

  it("reports null when neither feed answers", () => {
    expect(new TestPriceOracle().toAmount(UNPRICEABLE, ONE_USDC)).toEqual({
      value: ONE_USDC,
      valueUsd: null,
    });
  });
});

describe("PriceOracleBaseContract.safeConvertFromUSD", () => {
  it("falls back to reserve when main throws", () => {
    expect(
      new TestPriceOracle({
        [USDC]: { reservePrice: 2 },
      }).safeConvertFromUSD(USDC, 2n * 10n ** 8n),
    ).toEqual({ value: ONE_USDC });
  });
});

describe("PriceOracleBaseContract.safeConvertAssets", () => {
  const oracle = new TestPriceOracle({
    [DAI]: { price: 1 },
    [USDC]: { price: 1 },
    [cbETH]: { price: 2 },
  });

  it("sums priceable tokens", () => {
    expect(
      oracle.safeConvertAssets(
        [
          { token: USDC, balance: parseUnits("100", 6) },
          { token: cbETH, balance: parseEther("50") },
        ],
        DAI,
      ),
    ).toEqual({ value: parseEther("200") });
  });

  it("skips balances at or below DUST_THRESHOLD", () => {
    expect(
      oracle.safeConvertAssets(
        [
          { token: USDC, balance: DUST_THRESHOLD },
          { token: cbETH, balance: DUST_THRESHOLD + 1n },
        ],
        DAI,
      ),
    ).toEqual({ value: (DUST_THRESHOLD + 1n) * 2n });
  });

  it("records the first unpriceable token and still sums the rest", () => {
    expect(
      oracle.safeConvertAssets(
        [
          { token: USDC, balance: parseUnits("100", 6) },
          { token: UNPRICEABLE, balance: 50n },
          { token: cbETH, balance: parseEther("50") },
        ],
        DAI,
      ),
    ).toEqual({
      value: parseEther("200"),
      error: unpriceableTokenError(UNPRICEABLE),
    });
  });
});

describe("PriceOracleBaseContract native through WETH", () => {
  it("prices NATIVE_ADDRESS through the WETH feed", () => {
    const oracle = new TestPriceOracle({
      [WETH]: { price: 2000, reservePrice: 1995 },
    });
    expect(oracle.convertToUSD(NATIVE_ADDRESS, parseEther("1"))).toBe(
      2000n * 10n ** 8n,
    );
    expect(oracle.safeConvertMinUSD(NATIVE_ADDRESS, parseEther("1"))).toEqual({
      value: 1995n * 10n ** 8n,
    });
  });

  it("is unpriceable when WETH is not registered", () => {
    expect(
      new TestPriceOracle().safeConvertToUSD(NATIVE_ADDRESS, parseEther("1")),
    ).toEqual({
      value: 0n,
      error: unpriceableTokenError(NATIVE_ADDRESS),
    });
  });

  it("values native at 0 when WETH has a main feed but no reserve", () => {
    expect(
      new TestPriceOracle({
        [WETH]: { price: 2000 },
      }).safeConvertMinUSD(NATIVE_ADDRESS, parseEther("1")),
    ).toEqual({ value: 0n });
  });

  it("synthesizes toTokenAmount from the chain native currency", () => {
    expect(
      new TestPriceOracle({
        [WETH]: { price: 2000 },
      }).toTokenAmount(NATIVE_ADDRESS, parseEther("1")),
    ).toEqual({
      token: {
        chainId: 1,
        address: NATIVE_ADDRESS,
        symbol: "ETH",
        name: "Ether",
        decimals: 18,
      },
      value: parseEther("1"),
      valueUsd: 2000,
    });
  });
});
