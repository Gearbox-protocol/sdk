import type { Address } from "viem";
import { getAddress, isAddressEqual } from "viem";
import { describe, expect, it } from "vitest";
import { DUST_THRESHOLD } from "../../constants/index.js";
import { usdToNumber } from "../math.js";
import { unpriceableTokenError } from "./errors.js";
import { PriceOracleBaseContract } from "./PriceOracleBaseContract.js";

const WETH = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");
const USDC = getAddress("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48");
const CBETH = getAddress("0xBe9895146f7AF43049ca1c1AE358B0541Ea49704");
const UNPRICEABLE = getAddress("0x1111111111111111111111111111111111111111");

interface HarnessFeeds {
  main?: Partial<Record<Address, bigint>>;
  reserve?: Partial<Record<Address, bigint>>;
  /**
   * Tokens that have a reserve feed configured. Defaults to the keys of
   * `reserve`. Pass a list (even with no price) to model a feed whose
   * answer failed.
   **/
  reserveFeeds?: Address[];
}

interface OracleHarness {
  convert: (
    from: Address,
    to: Address,
    amount: bigint,
    reserve?: boolean,
  ) => bigint;
  convertToUSD: (token: Address, amount: bigint, reserve?: boolean) => bigint;
  convertFromUSD: (token: Address, amount: bigint, reserve?: boolean) => bigint;
  reservePriceFeeds: { has: (token: Address) => boolean };
  safeConvert: (typeof PriceOracleBaseContract.prototype)["safeConvert"];
  safeConvertToUSD: (typeof PriceOracleBaseContract.prototype)["safeConvertToUSD"];
  safeConvertFromUSD: (typeof PriceOracleBaseContract.prototype)["safeConvertFromUSD"];
  safeConvertMinUSD: (typeof PriceOracleBaseContract.prototype)["safeConvertMinUSD"];
  safeConvertAssets: (typeof PriceOracleBaseContract.prototype)["safeConvertAssets"];
  toAmount: (typeof PriceOracleBaseContract.prototype)["toAmount"];
}

/**
 * Thin harness: public convert methods read from feed maps, and the real
 * safe* implementations run via the prototype so `#priceableToken` is not
 * involved.
 */
function oracle(feeds: HarnessFeeds): OracleHarness {
  const lookup = (
    map: Partial<Record<Address, bigint>> | undefined,
    token: Address,
  ): bigint => {
    const price = map?.[getAddress(token)];
    if (price === undefined) {
      throw new Error(`no answer for ${token}`);
    }
    return price;
  };
  const proto = PriceOracleBaseContract.prototype;
  const reserveFeedSet = new Set(
    (feeds.reserveFeeds ?? Object.keys(feeds.reserve ?? {})).map(t =>
      getAddress(t),
    ),
  );
  return {
    convert: (
      from: Address,
      to: Address,
      amount: bigint,
      reserve = false,
    ): bigint => {
      if (isAddressEqual(from, to)) {
        return amount;
      }
      return (
        (amount * lookup(reserve ? feeds.reserve : feeds.main, from)) /
        10n ** 8n
      );
    },
    convertToUSD: (token: Address, amount: bigint, reserve = false): bigint =>
      (amount * lookup(reserve ? feeds.reserve : feeds.main, token)) /
      10n ** 8n,
    convertFromUSD: (token: Address, amount: bigint, reserve = false): bigint =>
      (amount * 10n ** 8n) /
      lookup(reserve ? feeds.reserve : feeds.main, token),
    reservePriceFeeds: {
      has: (token: Address) => reserveFeedSet.has(getAddress(token)),
    },
    safeConvert: proto.safeConvert,
    safeConvertToUSD: proto.safeConvertToUSD,
    safeConvertFromUSD: proto.safeConvertFromUSD,
    safeConvertMinUSD: proto.safeConvertMinUSD,
    safeConvertAssets: proto.safeConvertAssets,
    toAmount(token: Address, value: bigint) {
      const priced = proto.safeConvertToUSD.call(this, token, value);
      return {
        value,
        valueUsd: priced.error ? null : usdToNumber(priced.value),
      };
    },
  };
}

describe("PriceOracleBaseContract.convert", () => {
  it("throws when the instructed main feed is missing", () => {
    expect(() => oracle({}).convert(USDC, WETH, 100n)).toThrow(
      `no answer for ${USDC}`,
    );
  });

  it("throws when the instructed reserve feed is missing", () => {
    expect(() =>
      oracle({ main: { [USDC]: 2n * 10n ** 8n } }).convert(
        USDC,
        WETH,
        100n,
        true,
      ),
    ).toThrow(`no answer for ${USDC}`);
  });

  it("throws from convertToUSD when the instructed feed is missing", () => {
    expect(() => oracle({}).convertToUSD(USDC, 100n)).toThrow(
      `no answer for ${USDC}`,
    );
  });
});

describe("PriceOracleBaseContract.safeConvert", () => {
  it("passes through when from equals to, even with no feeds", () => {
    expect(oracle({}).safeConvert(USDC, USDC, 100n)).toEqual({ value: 100n });
  });

  it("does not fall back when the main feed answers 0", () => {
    expect(
      oracle({
        main: { [USDC]: 0n },
        reserve: { [USDC]: 3n * 10n ** 8n },
      }).safeConvert(USDC, WETH, 100n),
    ).toEqual({ value: 0n });
  });

  it("uses the main feed when it answers", () => {
    expect(
      oracle({ main: { [USDC]: 2n * 10n ** 8n } }).safeConvert(
        USDC,
        WETH,
        100n,
      ),
    ).toEqual({ value: 200n });
  });

  it("falls back to the reserve feed when main throws", () => {
    expect(
      oracle({
        reserve: { [USDC]: 3n * 10n ** 8n },
      }).safeConvert(USDC, WETH, 100n),
    ).toEqual({ value: 300n });
  });

  it("returns 0n and UnpriceableTokenError when neither feed answers", () => {
    expect(oracle({}).safeConvert(UNPRICEABLE, WETH, 100n)).toEqual({
      value: 0n,
      error: unpriceableTokenError(UNPRICEABLE),
    });
  });
});

describe("PriceOracleBaseContract.safeConvertToUSD", () => {
  it("uses the main feed when it answers, even if reserve is cheaper", () => {
    expect(
      oracle({
        main: { [USDC]: 2n * 10n ** 8n },
        reserve: { [USDC]: 1n * 10n ** 8n },
      }).safeConvertToUSD(USDC, 100n),
    ).toEqual({ value: 200n });
  });

  it("does not fall back when the main feed answers 0", () => {
    expect(
      oracle({
        main: { [USDC]: 0n },
        reserve: { [USDC]: 3n * 10n ** 8n },
      }).safeConvertToUSD(USDC, 100n),
    ).toEqual({ value: 0n });
  });

  it("falls back to the reserve feed when main throws", () => {
    expect(
      oracle({
        reserve: { [USDC]: 3n * 10n ** 8n },
      }).safeConvertToUSD(USDC, 100n),
    ).toEqual({ value: 300n });
  });

  it("returns 0n and UnpriceableTokenError when neither feed answers", () => {
    expect(oracle({}).safeConvertToUSD(UNPRICEABLE, 100n)).toEqual({
      value: 0n,
      error: unpriceableTokenError(UNPRICEABLE),
    });
  });
});

describe("PriceOracleBaseContract.safeConvertMinUSD", () => {
  it("takes the min when both feeds answer", () => {
    expect(
      oracle({
        main: { [USDC]: 2n * 10n ** 8n },
        reserve: { [USDC]: 1n * 10n ** 8n },
      }).safeConvertMinUSD(USDC, 100n),
    ).toEqual({ value: 100n });
  });

  it("returns 0n with no error when there is no reserve feed", () => {
    expect(
      oracle({ main: { [USDC]: 2n * 10n ** 8n } }).safeConvertMinUSD(
        USDC,
        100n,
      ),
    ).toEqual({ value: 0n });
  });

  it("returns 0n and UnpriceableTokenError when main is missing", () => {
    expect(
      oracle({
        reserve: { [USDC]: 3n * 10n ** 8n },
      }).safeConvertMinUSD(USDC, 100n),
    ).toEqual({
      value: 0n,
      error: unpriceableTokenError(USDC),
    });
  });

  it("returns 0n and UnpriceableTokenError when the reserve feed's answer failed", () => {
    expect(
      oracle({
        main: { [USDC]: 2n * 10n ** 8n },
        reserveFeeds: [USDC],
      }).safeConvertMinUSD(USDC, 100n),
    ).toEqual({
      value: 0n,
      error: unpriceableTokenError(USDC),
    });
  });

  it("uses the main feed when both feeds answer the same", () => {
    expect(
      oracle({
        main: { [USDC]: 2n * 10n ** 8n },
        reserve: { [USDC]: 2n * 10n ** 8n },
      }).safeConvertMinUSD(USDC, 100n),
    ).toEqual({ value: 200n });
  });
});

describe("PriceOracleBaseContract.toAmount", () => {
  const unit = 10n ** 8n;

  it("prices at the main feed", () => {
    expect(
      oracle({ main: { [USDC]: 2n * 10n ** 8n } }).toAmount(USDC, unit),
    ).toEqual({ value: unit, valueUsd: 2 });
  });

  it("falls back to the reserve feed when main throws", () => {
    expect(
      oracle({
        reserve: { [USDC]: 3n * 10n ** 8n },
      }).toAmount(USDC, unit),
    ).toEqual({ value: unit, valueUsd: 3 });
  });

  it("reports null when neither feed answers", () => {
    expect(oracle({}).toAmount(UNPRICEABLE, unit)).toEqual({
      value: unit,
      valueUsd: null,
    });
  });
});

describe("PriceOracleBaseContract.safeConvertFromUSD", () => {
  it("falls back to reserve when main throws", () => {
    expect(
      oracle({
        reserve: { [USDC]: 2n * 10n ** 8n },
      }).safeConvertFromUSD(USDC, 200n),
    ).toEqual({ value: 100n });
  });
});

describe("PriceOracleBaseContract.safeConvertAssets", () => {
  const o = oracle({
    main: {
      [USDC]: 1n * 10n ** 8n,
      [CBETH]: 2n * 10n ** 8n,
    },
  });

  it("sums priceable tokens", () => {
    expect(
      o.safeConvertAssets(
        [
          { token: USDC, balance: 100n },
          { token: CBETH, balance: 50n },
        ],
        WETH,
      ),
    ).toEqual({ value: 200n });
  });

  it("skips balances at or below DUST_THRESHOLD", () => {
    expect(
      o.safeConvertAssets(
        [
          { token: USDC, balance: DUST_THRESHOLD },
          { token: CBETH, balance: DUST_THRESHOLD + 1n },
        ],
        WETH,
      ),
    ).toEqual({ value: (DUST_THRESHOLD + 1n) * 2n });
  });

  it("records the first unpriceable token and still sums the rest", () => {
    expect(
      o.safeConvertAssets(
        [
          { token: USDC, balance: 100n },
          { token: UNPRICEABLE, balance: 50n },
          { token: CBETH, balance: 50n },
        ],
        WETH,
      ),
    ).toEqual({
      value: 200n,
      error: unpriceableTokenError(UNPRICEABLE),
    });
  });
});
