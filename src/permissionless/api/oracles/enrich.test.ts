import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { byCentrality, toCap, totalQuotas } from "./enrich.js";
import type {
  PermissionlessAssetQuota,
  PermissionlessAssetSummary,
} from "./types.js";

const USDC_FEED = "0x0000000000000000000000000000000000000001" as Address;
const WETH_FEED = "0x0000000000000000000000000000000000000002" as Address;

/** $1.00 and $2500.00, in the 8 decimals every Gearbox feed reports. */
const ONE_USD = 100_000_000n;
const ETH_USD = 250_000_000_000n;

const prices: Record<Address, bigint | null> = {
  [USDC_FEED]: ONE_USD,
  [WETH_FEED]: ETH_USD,
};
const priceOf = (feed: Address) => prices[feed];

function quota(
  overrides: Partial<PermissionlessAssetQuota> = {},
): PermissionlessAssetQuota {
  return {
    quotaLimit: 1_000,
    quotaUsed: 400,
    isShutdown: false,
    underlyingPriceFeed: USDC_FEED,
    ...overrides,
  };
}

describe("totalQuotas", () => {
  it("prices each market in its own underlying before adding them", () => {
    // The same figure in two markets is not the same exposure: one of them is
    // denominated in dollars and the other in ether.
    const totals = totalQuotas(
      [quota(), quota({ underlyingPriceFeed: WETH_FEED })],
      priceOf,
    );

    expect(totals).toEqual({
      quotaLimitUsd: 1_000 + 1_000 * 2_500,
      quotaUsedUsd: 400 + 400 * 2_500,
    });
  });

  it("leaves a shut down market's limit out but keeps what it owes", () => {
    const totals = totalQuotas([quota({ isShutdown: true })], priceOf);

    expect(totals).toEqual({ quotaLimitUsd: null, quotaUsedUsd: 400 });
  });

  it("tells nothing to total from a total of zero", () => {
    // The asset is in no market at all, which is not the same answer as every
    // market having committed nothing to it.
    expect(totalQuotas([], priceOf)).toEqual({
      quotaLimitUsd: null,
      quotaUsedUsd: null,
    });
    expect(
      totalQuotas([quota({ quotaLimit: 0, quotaUsed: 0 })], priceOf),
    ).toEqual({ quotaLimitUsd: 0, quotaUsedUsd: 0 });
  });

  it("skips a market nothing could price, leaving the rest a floor", () => {
    const unpriced = "0x00000000000000000000000000000000000000ff" as Address;

    const totals = totalQuotas(
      [
        quota(),
        quota({ underlyingPriceFeed: unpriced }),
        quota({ underlyingPriceFeed: null }),
      ],
      priceOf,
    );

    expect(totals).toEqual({ quotaLimitUsd: 1_000, quotaUsedUsd: 400 });
  });

  it("does not read a market the quota keeper holds no limit for as zero", () => {
    const totals = totalQuotas([quota({ quotaLimit: null })], priceOf);

    expect(totals).toEqual({ quotaLimitUsd: null, quotaUsedUsd: 400 });
  });
});

describe("toCap", () => {
  it("multiplies the price by the supply in the asset's own decimals", () => {
    expect(toCap(ETH_USD, 10n ** 18n, 18)).toBe("2500");
    expect(toCap(ONE_USD, 1_000_000n, 6)).toBe("1");
  });

  it("keeps the small end of a figure no double would hold", () => {
    // 8 decimals of price against 18 of supply is 26 digits before the total
    // is even large; a float would have rounded the tail off by here.
    expect(toCap(1n, 1n, 18)).toBe("0.00000000000000000000000001");
  });

  it("reports a side it could not read as unpriced, not as worthless", () => {
    expect(toCap(null, 10n ** 18n, 18)).toBe(null);
    expect(toCap(ETH_USD, null, 18)).toBe(null);
    expect(toCap(undefined, undefined, 18)).toBe(null);
  });

  it("answers zero for an asset nobody holds", () => {
    expect(toCap(ETH_USD, 0n, 18)).toBe("0");
  });
});

describe("byCentrality", () => {
  function asset(
    overrides: Partial<PermissionlessAssetSummary> = {},
  ): PermissionlessAssetSummary {
    return {
      chainId: 1,
      address: USDC_FEED,
      symbol: "WETH",
      underlyingMarketCount: 0,
      marketQuotas: [],
      quotaLimitUsd: null,
      quotaUsedUsd: null,
      assetType: null,
      isRwa: false,
      ...overrides,
    };
  }

  const order = (assets: PermissionlessAssetSummary[]) =>
    [...assets].sort(byCentrality).map(it => it.symbol);

  it("puts what the protocol is built on ahead of what is borrowed", () => {
    expect(
      order([
        asset({ symbol: "borrowed", quotaUsedUsd: 1_000_000 }),
        asset({ symbol: "underlying", underlyingMarketCount: 1 }),
      ]),
    ).toEqual(["underlying", "borrowed"]);
  });

  it("puts what is actually borrowed ahead of what is merely allowed", () => {
    expect(
      order([
        asset({ symbol: "allowed", quotaLimitUsd: 10_000_000 }),
        asset({ symbol: "borrowed", quotaUsedUsd: 1 }),
      ]),
    ).toEqual(["borrowed", "allowed"]);
  });

  it("puts an unpriced asset behind one priced at zero", () => {
    expect(
      order([
        asset({ symbol: "unpriced" }),
        asset({ symbol: "zero", quotaLimitUsd: 0 }),
      ]),
    ).toEqual(["zero", "unpriced"]);
  });

  it("orders two otherwise equal assets the same way every time", () => {
    // A list that reshuffles under a refetch moves the row out from under
    // whoever was about to click it, so the ties are broken all the way down.
    const rows = [
      asset({ symbol: "B", chainId: 2 }),
      asset({ symbol: "A", chainId: 42 }),
      asset({ symbol: "A", chainId: 1 }),
    ];

    expect([...rows].sort(byCentrality)).toEqual(
      [...rows].reverse().sort(byCentrality),
    );
    expect(order(rows)).toEqual(["A", "A", "B"]);
  });
});
