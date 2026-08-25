import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type {
  Amount,
  ChainId,
  DataResponse,
  Opportunity,
  PoolOpportunity,
  QuotaAsset,
  StrategyOpportunity,
  Timestamp,
  Token,
} from "../../model/index.js";
import type { FieldDiff } from "./compareOpportunities.js";
import { compareOpportunities } from "./compareOpportunities.js";

const MAINNET: ChainId = 1;
const POOL = "0xda00000000000000000000000000000000000001" as Address;
const CREDIT_MANAGER = "0x3eb90000000000000000000000000000000000a1" as Address;
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" as Address;
const WSTETH = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0" as Address;
const TBTC = "0x18084fbA666a33d37592fA2633fD49a74DD93a88" as Address;
const NOW = 1_700_000_000 as Timestamp;

function token(address: Address, symbol: string): Token {
  return {
    chainId: MAINNET,
    address,
    symbol,
    name: symbol,
    decimals: 18,
  };
}

function amount(value: bigint, valueUsd: number | null): Amount {
  return { value, valueUsd };
}

function quotaAsset(
  address: Address,
  symbol: string,
  overrides: Partial<QuotaAsset> = {},
): QuotaAsset {
  return {
    token: token(address, symbol),
    quotaRate: 90,
    limit: amount(10_000n, 10_000),
    used: amount(1_000_000n, 1_000),
    ...overrides,
  };
}

function pool(overrides: Partial<PoolOpportunity> = {}): PoolOpportunity {
  return {
    kind: "pool",
    chainId: MAINNET,
    pool: POOL,
    name: "USDC Pool",
    curator: { address: POOL, name: "Re7", url: null },
    underlyingToken: { ...token(USDC, "USDC"), wrappedAddress: null },
    totalSupply: amount(1_000n, 1_000),
    availableLiquidity: amount(400n, 400),
    totalBorrowedWithInterest: amount(600n, 600),
    supplyApy: { organicApy: 610 },
    allowedDepositTokens: [token(WSTETH, "wstETH"), token(TBTC, "tBTC")],
    paused: false,
    rwa: false,
    sunset: false,
    quotaAssets: [],
    ...overrides,
  };
}

function strategy(
  overrides: Partial<StrategyOpportunity> = {},
): StrategyOpportunity {
  return {
    kind: "strategy",
    chainId: MAINNET,
    creditManager: CREDIT_MANAGER,
    targetCollateral: token(WSTETH, "wstETH"),
    name: "wstETH / USDC",
    curator: { address: POOL, name: "Re7", url: null },
    underlyingToken: { ...token(USDC, "USDC"), wrappedAddress: null },
    totalBorrowed: amount(600n, 600),
    allowedDepositTokens: [token(WSTETH, "wstETH")],
    paused: false,
    rwa: false,
    sunset: false,
    liquidationThreshold: 9_000,
    liquidationPremium: 400,
    liquidationFee: 150,
    expirationDate: null,
    borrowApy: 520,
    quotaRate: 90,
    availableLiquidity: amount(400n, 400),
    minDebt: amount(1_000n, 1_000),
    totalDebtLimit: amount(50_000n, 50_000),
    maxBorrowAmount: amount(10_000n, 10_000),
    maxLeverage: 10,
    ...overrides,
  };
}

function response(rows: Opportunity[]): DataResponse<Opportunity[]> {
  return {
    data: rows,
    meta: {
      chains: [
        {
          chainId: MAINNET,
          status: "success",
          source: "onchain",
          blockNumber: 100,
          timestamp: NOW,
        },
      ],
    },
  };
}

function compare(
  onchain: Opportunity[],
  offchain: Opportunity[],
): ReturnType<typeof compareOpportunities> {
  return compareOpportunities({
    onchain: response(onchain),
    offchain: response(offchain),
    backendUrl: "https://api.gear-dev.dev",
    networks: ["Mainnet"],
    generatedAt: "2026-01-01T00:00:00.000Z",
  });
}

function diffAt(diffs: FieldDiff[], path: string): FieldDiff | undefined {
  return diffs.find(diff => diff.path === path);
}

describe("membership", () => {
  it("reports a row only one source lists, identified by what it is", () => {
    const report = compare([pool(), strategy()], [pool()]);

    expect(report.summary.onlyOnchain).toBe(1);
    expect(report.summary.matched).toBe(1);
    expect(report.onlyOnchain).toEqual([
      {
        id: `1:${CREDIT_MANAGER.toLowerCase()}`,
        kind: "strategy",
        chainId: MAINNET,
        name: "wstETH / USDC",
        creditManager: CREDIT_MANAGER,
        targetCollateral: WSTETH,
      },
    ]);
    expect(report.onlyOffchain).toEqual([]);
  });

  it("reports a row only the backend lists", () => {
    const report = compare([pool()], [pool(), strategy()]);

    expect(report.summary.onlyOffchain).toBe(1);
    expect(report.onlyOffchain[0]?.kind).toBe("strategy");
  });

  it("counts each chain on its own", () => {
    const plasma = pool({ chainId: 9745, pool: POOL });
    const report = compare([pool(), plasma], [pool()]);

    expect(report.summary.byChain).toEqual([
      expect.objectContaining({ chainId: 1, matched: 1, onlyOnchain: 0 }),
      expect.objectContaining({ chainId: 9745, matched: 0, onlyOnchain: 1 }),
    ]);
  });
});

describe("matched rows", () => {
  it("reports nothing when the two sources agree", () => {
    const report = compare([pool()], [pool()]);

    expect(report.matched).toEqual([
      expect.objectContaining({ identical: true, clean: true, diffs: [] }),
    ]);
    expect(report.summary.differing).toBe(0);
    expect(report.summary.clean).toBe(1);
  });

  it("matches a row whose addresses differ only in case", () => {
    const report = compare(
      [pool()],
      [pool({ pool: POOL.toUpperCase() as Address })],
    );

    expect(report.summary.matched).toBe(1);
    expect(report.matched[0]?.diffs).toEqual([]);
  });

  it("reports a name the two sources spell differently", () => {
    const report = compare([pool()], [pool({ name: "USDC pool" })]);

    const diff = diffAt(report.matched[0]?.diffs ?? [], "name");
    expect(diff).toEqual({
      path: "name",
      onchain: "USDC Pool",
      offchain: "USDC pool",
      kind: "other",
    });
    expect(report.matched[0]?.offchainName).toBe("USDC pool");
  });

  it("separates an exact amount from the USD value derived from it", () => {
    const report = compare(
      [pool()],
      [pool({ totalBorrowedWithInterest: amount(600n, 601.42) })],
    );
    const diffs = report.matched[0]?.diffs ?? [];

    expect(diffAt(diffs, "totalBorrowedWithInterest.value")).toBeUndefined();
    expect(diffAt(diffs, "totalBorrowedWithInterest.valueUsd")).toEqual({
      path: "totalBorrowedWithInterest.valueUsd",
      onchain: 600,
      offchain: 601.42,
      kind: "usd",
    });
  });

  it("tags a differing figure as numeric", () => {
    const report = compare([strategy()], [strategy({ maxLeverage: 17.9 })]);

    expect(diffAt(report.matched[0]?.diffs ?? [], "maxLeverage")).toEqual({
      path: "maxLeverage",
      onchain: 10,
      offchain: 17.9,
      kind: "numeric",
    });
  });

  it("reports a field only the backend fills as a presence diff", () => {
    const report = compare(
      [strategy()],
      [strategy({ totalValue: amount(50_000n, 50_000) })],
    );

    expect(diffAt(report.matched[0]?.diffs ?? [], "totalValue")).toEqual({
      path: "totalValue",
      onchain: undefined,
      offchain: { value: 50_000n, valueUsd: 50_000 },
      kind: "presence",
      expected: true,
      reason: "mode-scoped",
    });
  });

  it("reports a null the other source filled as a presence diff", () => {
    const report = compare([strategy({ expirationDate: NOW })], [strategy()]);

    expect(diffAt(report.matched[0]?.diffs ?? [], "expirationDate")).toEqual({
      path: "expirationDate",
      onchain: NOW,
      offchain: null,
      kind: "presence",
    });
  });
});

describe("allowed deposit token lists", () => {
  it("ignores the order the tokens came in", () => {
    const report = compare(
      [pool()],
      [
        pool({
          allowedDepositTokens: [token(TBTC, "tBTC"), token(WSTETH, "wstETH")],
        }),
      ],
    );

    expect(report.matched[0]?.diffs).toEqual([]);
  });

  it("names the token one source is missing rather than shifting the list", () => {
    const report = compare(
      [pool()],
      [pool({ allowedDepositTokens: [token(WSTETH, "wstETH")] })],
    );

    expect(report.matched[0]?.diffs).toEqual([
      {
        path: `allowedDepositTokens[${TBTC.toLowerCase()}]`,
        onchain: token(TBTC, "tBTC"),
        offchain: undefined,
        kind: "presence",
      },
    ]);
  });

  it("reports a field of one token without repeating the others", () => {
    const report = compare(
      [pool()],
      [
        pool({
          allowedDepositTokens: [
            { ...token(WSTETH, "wstETH"), symbol: "WSTETH" },
            token(TBTC, "tBTC"),
          ],
        }),
      ],
    );

    expect(report.matched[0]?.diffs).toEqual([
      {
        path: `allowedDepositTokens[${WSTETH.toLowerCase()}].symbol`,
        onchain: "wstETH",
        offchain: "WSTETH",
        kind: "other",
      },
    ]);
  });
});

describe("quota assets", () => {
  it("ignores the order the quotas came in", () => {
    const report = compare(
      [
        pool({
          quotaAssets: [quotaAsset(WSTETH, "wstETH"), quotaAsset(TBTC, "tBTC")],
        }),
      ],
      [
        pool({
          quotaAssets: [quotaAsset(TBTC, "tBTC"), quotaAsset(WSTETH, "wstETH")],
        }),
      ],
    );

    expect(report.matched[0]?.diffs).toEqual([]);
  });

  it("names the quota one source is missing rather than shifting the list", () => {
    const report = compare(
      [
        pool({
          quotaAssets: [quotaAsset(WSTETH, "wstETH"), quotaAsset(TBTC, "tBTC")],
        }),
      ],
      [pool({ quotaAssets: [quotaAsset(WSTETH, "wstETH")] })],
    );

    expect(report.matched[0]?.diffs).toEqual([
      {
        path: `quotaAssets[${TBTC.toLowerCase()}]`,
        onchain: quotaAsset(TBTC, "tBTC"),
        offchain: undefined,
        kind: "presence",
      },
    ]);
  });

  it("tolerates lag on used.value and flags a larger gap", () => {
    const inside = compare(
      [pool({ quotaAssets: [quotaAsset(WSTETH, "wstETH")] })],
      [
        pool({
          quotaAssets: [
            quotaAsset(WSTETH, "wstETH", { used: amount(1_000_400n, 1_000) }),
          ],
        }),
      ],
    );
    const outside = compare(
      [pool({ quotaAssets: [quotaAsset(WSTETH, "wstETH")] })],
      [
        pool({
          quotaAssets: [
            quotaAsset(WSTETH, "wstETH", { used: amount(1_010_000n, 1_000) }),
          ],
        }),
      ],
    );

    expect(
      diffAt(
        inside.matched[0]?.diffs ?? [],
        `quotaAssets[${WSTETH.toLowerCase()}].used.value`,
      ),
    ).toEqual({
      path: `quotaAssets[${WSTETH.toLowerCase()}].used.value`,
      onchain: 1_000_000n,
      offchain: 1_000_400n,
      kind: "numeric",
      expected: true,
      reason: "tolerance",
    });
    expect(inside.matched[0]?.clean).toBe(true);
    expect(
      diffAt(
        outside.matched[0]?.diffs ?? [],
        `quotaAssets[${WSTETH.toLowerCase()}].used.value`,
      ),
    ).toEqual({
      path: `quotaAssets[${WSTETH.toLowerCase()}].used.value`,
      onchain: 1_000_000n,
      offchain: 1_010_000n,
      kind: "numeric",
    });
    expect(outside.matched[0]?.clean).toBe(false);
  });

  it("marks quota allocation fields as mode-scoped", () => {
    const report = compare(
      [pool({ quotaAssets: [quotaAsset(WSTETH, "wstETH")] })],
      [
        pool({
          quotaAssets: [
            quotaAsset(WSTETH, "wstETH", {
              allocationShare: 5_000,
              allocatedDebt: amount(300n, 300),
            }),
          ],
        }),
      ],
    );
    const match = report.matched[0];

    expect(
      diffAt(
        match?.diffs ?? [],
        `quotaAssets[${WSTETH.toLowerCase()}].allocationShare`,
      ),
    ).toEqual({
      path: `quotaAssets[${WSTETH.toLowerCase()}].allocationShare`,
      onchain: undefined,
      offchain: 5_000,
      kind: "presence",
      expected: true,
      reason: "mode-scoped",
    });
    expect(
      diffAt(
        match?.diffs ?? [],
        `quotaAssets[${WSTETH.toLowerCase()}].allocatedDebt`,
      ),
    ).toEqual({
      path: `quotaAssets[${WSTETH.toLowerCase()}].allocatedDebt`,
      onchain: undefined,
      offchain: amount(300n, 300),
      kind: "presence",
      expected: true,
      reason: "mode-scoped",
    });
    expect(match?.clean).toBe(true);
  });

  it("treats a limit.value disagreement as unexpected", () => {
    const report = compare(
      [pool({ quotaAssets: [quotaAsset(WSTETH, "wstETH")] })],
      [
        pool({
          quotaAssets: [
            quotaAsset(WSTETH, "wstETH", { limit: amount(10_001n, 10_000) }),
          ],
        }),
      ],
    );

    expect(
      diffAt(
        report.matched[0]?.diffs ?? [],
        `quotaAssets[${WSTETH.toLowerCase()}].limit.value`,
      ),
    ).toEqual({
      path: `quotaAssets[${WSTETH.toLowerCase()}].limit.value`,
      onchain: 10_000n,
      offchain: 10_001n,
      kind: "numeric",
    });
    expect(report.matched[0]?.clean).toBe(false);
  });
});

describe("the report as a whole", () => {
  it("counts how often each field differed, with array keys collapsed", () => {
    const other = pool({
      pool: "0xda00000000000000000000000000000000000002" as Address,
    });
    const report = compare(
      [pool(), other],
      [
        pool({ supplyApy: { organicApy: 710 } }),
        pool({
          pool: other.pool,
          supplyApy: { organicApy: 510 },
          allowedDepositTokens: [
            { ...token(WSTETH, "wstETH"), symbol: "WSTETH" },
            { ...token(TBTC, "tBTC"), symbol: "TBTC" },
          ],
        }),
      ],
    );

    expect(report.summary.differing).toBe(2);
    expect(report.summary.diffsByPath).toEqual([
      {
        path: "allowedDepositTokens[].symbol",
        kinds: ["other"],
        count: 2,
        expected: 0,
        unexpected: 2,
      },
      {
        path: "supplyApy.organicApy",
        kinds: ["numeric"],
        count: 2,
        expected: 0,
        unexpected: 2,
        worstUnexpected: {
          id: `1:${other.pool.toLowerCase()}`,
          path: "supplyApy.organicApy",
          bps: (Math.abs(610 - 510) / 610) * 10_000,
          onchain: 610,
          offchain: 510,
        },
      },
    ]);
  });

  it("names the entity with the largest unexpected numeric gap", () => {
    const other = pool({
      pool: "0xda00000000000000000000000000000000000002" as Address,
      totalBorrowedWithInterest: amount(1_000n, 1_000),
    });
    const report = compare(
      [pool({ totalBorrowedWithInterest: amount(1_000n, 1_000) }), other],
      [
        pool({ totalBorrowedWithInterest: amount(1_000n, 1_020) }),
        pool({
          pool: other.pool,
          totalBorrowedWithInterest: amount(1_000n, 1_050),
        }),
      ],
    );

    expect(
      report.summary.diffsByPath.find(
        entry => entry.path === "totalBorrowedWithInterest.valueUsd",
      ),
    ).toEqual({
      path: "totalBorrowedWithInterest.valueUsd",
      kinds: ["usd"],
      count: 2,
      expected: 0,
      unexpected: 2,
      worstUnexpected: {
        id: `1:${other.pool.toLowerCase()}`,
        path: "totalBorrowedWithInterest.valueUsd",
        bps: (50 / 1_050) * 10_000,
        onchain: 1_000,
        offchain: 1_050,
      },
    });
  });

  it("carries what the run was pointed at and what each chain answered", () => {
    const report = compare([pool()], [pool()]);

    expect(report.generatedAt).toBe("2026-01-01T00:00:00.000Z");
    expect(report.backendUrl).toBe("https://api.gear-dev.dev");
    expect(report.networks).toEqual(["Mainnet"]);
    expect(report.onchainChains[0]).toMatchObject({
      chainId: 1,
      blockNumber: 100,
    });
    expect(report.offchainChains).toHaveLength(1);
  });
});

describe("expected diffs", () => {
  it("marks a documented offchain-only field as expected, not identical", () => {
    const report = compare(
      [strategy()],
      [
        strategy({
          curator: { address: POOL, name: "Re7", url: "https://re7" },
        }),
      ],
    );
    const match = report.matched[0];

    expect(diffAt(match?.diffs ?? [], "curator.url")).toEqual({
      path: "curator.url",
      onchain: null,
      offchain: "https://re7",
      kind: "presence",
      expected: true,
      reason: "mode-scoped",
    });
    expect(match?.identical).toBe(false);
    expect(match?.clean).toBe(true);
    expect(report.summary.identical).toBe(0);
    expect(report.summary.clean).toBe(1);
  });

  it("treats strategy utilization as mode-scoped", () => {
    const report = compare([strategy()], [strategy({ utilization: 7_500 })]);
    const strategyMatch = report.matched[0];

    expect(diffAt(strategyMatch?.diffs ?? [], "utilization")).toEqual({
      path: "utilization",
      onchain: undefined,
      offchain: 7_500,
      kind: "presence",
      expected: true,
      reason: "mode-scoped",
    });
    expect(strategyMatch?.clean).toBe(true);
  });

  it("tolerates a USD float inside 0.1% and flags one outside it", () => {
    const inside = compare(
      [pool()],
      [pool({ totalBorrowedWithInterest: amount(600n, 600.4) })],
    );
    const outside = compare(
      [pool()],
      [pool({ totalBorrowedWithInterest: amount(600n, 601.42) })],
    );

    expect(
      diffAt(
        inside.matched[0]?.diffs ?? [],
        "totalBorrowedWithInterest.valueUsd",
      ),
    ).toEqual({
      path: "totalBorrowedWithInterest.valueUsd",
      onchain: 600,
      offchain: 600.4,
      kind: "usd",
      expected: true,
      reason: "tolerance",
    });
    expect(inside.matched[0]?.clean).toBe(true);
    expect(
      diffAt(
        outside.matched[0]?.diffs ?? [],
        "totalBorrowedWithInterest.valueUsd",
      ),
    ).toEqual({
      path: "totalBorrowedWithInterest.valueUsd",
      onchain: 600,
      offchain: 601.42,
      kind: "usd",
    });
    expect(outside.matched[0]?.clean).toBe(false);
  });

  it("tolerates a ±1 bps rate and a lag-bounded amount, not a larger gap", () => {
    const rate = compare([strategy()], [strategy({ borrowApy: 521 })]);
    const amountLag = compare(
      [pool({ totalSupply: amount(1_000_000n, 1_000) })],
      [pool({ totalSupply: amount(1_000_400n, 1_000) })],
    );
    const amountGap = compare(
      [pool({ totalSupply: amount(1_000_000n, 1_000) })],
      [pool({ totalSupply: amount(1_010_000n, 1_000) })],
    );

    expect(diffAt(rate.matched[0]?.diffs ?? [], "borrowApy")).toEqual({
      path: "borrowApy",
      onchain: 520,
      offchain: 521,
      kind: "numeric",
      expected: true,
      reason: "tolerance",
    });
    expect(rate.matched[0]?.clean).toBe(true);
    expect(
      diffAt(amountLag.matched[0]?.diffs ?? [], "totalSupply.value"),
    ).toEqual({
      path: "totalSupply.value",
      onchain: 1_000_000n,
      offchain: 1_000_400n,
      kind: "numeric",
      expected: true,
      reason: "tolerance",
    });
    expect(amountLag.matched[0]?.clean).toBe(true);
    expect(
      diffAt(amountGap.matched[0]?.diffs ?? [], "totalSupply.value"),
    ).toEqual({
      path: "totalSupply.value",
      onchain: 1_000_000n,
      offchain: 1_010_000n,
      kind: "numeric",
    });
    expect(amountGap.matched[0]?.clean).toBe(false);
  });

  it("does not treat a pool supplyApy.totalApy presence as unexpected", () => {
    const report = compare(
      [pool()],
      [pool({ supplyApy: { organicApy: 610, totalApy: 842 } })],
    );

    expect(
      diffAt(report.matched[0]?.diffs ?? [], "supplyApy.totalApy"),
    ).toEqual({
      path: "supplyApy.totalApy",
      onchain: undefined,
      offchain: 842,
      kind: "presence",
      expected: true,
      reason: "mode-scoped",
    });
    expect(report.matched[0]?.clean).toBe(true);
    expect(report.summary.diffsByPath).toEqual([
      {
        path: "supplyApy.totalApy",
        kinds: ["presence"],
        count: 1,
        expected: 1,
        unexpected: 0,
      },
    ]);
  });
});
