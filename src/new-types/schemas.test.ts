import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";

import {
  createEarnDataSource,
  createPoolId,
  createStrategyId,
  dataMetaSchema,
  earnOpportunityDetailSchema,
  earnOpportunityListSchema,
  earnOpportunityRowSchema,
  historySeriesSchema,
  opportunityListResultSchema,
  poolOpportunityDetailSchema,
  poolOpportunityRowSchema,
  rateCurveSchema,
  ratioSchema,
  strategyOpportunityDetailSchema,
  strategyOpportunityRowSchema,
} from "./index.js";
import type {
  EarnDataSource,
  PoolOpportunityDetail,
  PoolOpportunityRow,
  StrategyOpportunityDetail,
  StrategyOpportunityRow,
} from "./types.js";

const CHAIN = 1;
const OTHER_CHAIN = 42_161;

const POOL = "0x0000000000000000000000000000000000000001" as Address;
const CREDIT_MANAGER = "0x0000000000000000000000000000000000000002" as Address;
const TARGET = "0x0000000000000000000000000000000000000003" as Address;
const UNDERLYING = "0x0000000000000000000000000000000000000004" as Address;
const QUOTA = "0x0000000000000000000000000000000000000005" as Address;
const CONFIGURATOR = "0x0000000000000000000000000000000000000006" as Address;
const CURATOR = "0x0000000000000000000000000000000000000007" as Address;
const ORACLE = "0x0000000000000000000000000000000000000008" as Address;
const FEED = "0x0000000000000000000000000000000000000009" as Address;
const OTHER_ADDRESS = "0x0000000000000000000000000000000000000011" as Address;
const OWNER = "0x0000000000000000000000000000000000000012" as Address;

function token(address: Address, chainId: number = CHAIN) {
  return { chainId, address, symbol: "TKN", decimals: 18, iconUrl: null };
}

function amount(value: number) {
  return { value, usd: value * 2 };
}

const sharedRowFields = {
  chainId: CHAIN,
  title: "Main market",
  underlyingToken: token(UNDERLYING),
  assetClass: "stable" as const,
  status: {
    lifecycle: "active" as const,
    canDeposit: true,
    isDefaultVisible: true,
  },
  market: {
    configuratorAddress: CONFIGURATOR,
    curator: { address: CURATOR, name: "Curator", url: null },
  },
  liquidity: {
    supplied: amount(1_000),
    borrowed: amount(400),
    available: amount(600),
    utilization: 0.4,
  },
  yield: {
    totalApy: 0.05,
    baseApy: 0.04,
    rewardApr: 0.01,
    rewards: [{ token: token(QUOTA), apr: 0.01 }],
    points: [{ id: "p", name: "Points", multiplier: 2, isPending: false }],
  },
  collateralTokens: [token(QUOTA)],
};

function poolRow(): PoolOpportunityRow {
  return {
    ...sharedRowFields,
    kind: "pool",
    id: createPoolId(CHAIN, POOL),
    poolAddress: POOL,
    version: "v3",
    features: { isRwa: false, hasDelayedWithdrawal: false },
  };
}

function poolDetail(): PoolOpportunityDetail {
  return {
    ...poolRow(),
    performance: {
      averageApy: { oneDay: 0.05, sevenDays: 0.048, thirtyDays: 0.051 },
      apySevenDaysAgo: 0.047,
    },
    rateCurve: {
      points: [
        { utilization: 0, supplyApy: 0, borrowApy: 0.01 },
        { utilization: 0.8, supplyApy: 0.05, borrowApy: 0.07 },
        { utilization: 1, supplyApy: 0.2, borrowApy: 0.3 },
      ],
      borrowingLimitUtilization: 0.9,
    },
    quotaAssets: [
      {
        token: token(QUOTA),
        quotaRate: 0.02,
        limit: amount(500),
        used: amount(120),
        isActive: true,
      },
    ],
    pendingCuratorActions: [
      {
        kind: "set-quota-rate",
        executeAt: 1_800_000_000,
        changes: [
          {
            label: "Quota rate",
            token: token(QUOTA),
            before: "2%",
            after: "3%",
          },
        ],
      },
    ],
  };
}

function strategyRow(): StrategyOpportunityRow {
  return {
    ...sharedRowFields,
    kind: "strategy",
    id: createStrategyId(CHAIN, CREDIT_MANAGER, TARGET),
    creditManagerAddress: CREDIT_MANAGER,
    targetCollateral: token(TARGET),
    maxLeverage: 10,
    features: {
      isRwa: false,
      hasDelayedWithdrawal: false,
      zeroSlippageToken: null,
      hasDeleverageBot: true,
    },
    walletEstimate: null,
  };
}

function ownedStrategyRow(): StrategyOpportunityRow {
  return {
    ...strategyRow(),
    walletEstimate: {
      eligible: true,
      inputValueUsd: 1_000,
      annualEarningsUsd: 80,
      projectedPoints: [{ id: "p", name: "Points", amount: 1_200 }],
    },
  };
}

function strategyDetail(): StrategyOpportunityDetail {
  return {
    ...strategyRow(),
    apyBreakdown: {
      collateralApy: 0.09,
      baseBorrowApy: 0.06,
      additionalBorrowApy: 0.01,
    },
    rateCurve: {
      points: [
        { utilization: 0, supplyApy: 0, borrowApy: 0.01 },
        { utilization: 1, supplyApy: 0.2, borrowApy: 0.3 },
      ],
      borrowingLimitUtilization: null,
    },
    liquidation: { threshold: 0.9, premium: 0.02, fee: 0.015, penalty: 0.035 },
    oracle: {
      address: ORACLE,
      rows: [
        {
          pair: "collateral/underlying",
          price: 1.03,
          kind: "derived",
          dependsOn: "Chainlink ETH/USD",
          feedAddress: FEED,
          dependencies: [{ label: "ETH/USD", address: FEED }],
        },
      ],
    },
  };
}

describe("earn read models", () => {
  describe("discriminated unions", () => {
    it("parses both row kinds through the row union", () => {
      expect(earnOpportunityRowSchema.parse(poolRow()).kind).toBe("pool");
      expect(earnOpportunityRowSchema.parse(strategyRow()).kind).toBe(
        "strategy",
      );
    });

    it("parses both detail kinds through the detail union", () => {
      expect(earnOpportunityDetailSchema.parse(poolDetail()).kind).toBe("pool");
      expect(earnOpportunityDetailSchema.parse(strategyDetail()).kind).toBe(
        "strategy",
      );
    });

    it("rejects an unknown kind", () => {
      expect(
        earnOpportunityRowSchema.safeParse({ ...poolRow(), kind: "vault" })
          .success,
      ).toBe(false);
    });

    it("keeps a detail assignable to its row (details extend the row)", () => {
      const detail = poolOpportunityDetailSchema.parse(poolDetail());
      expect(poolOpportunityRowSchema.safeParse(detail).success).toBe(true);
    });

    it("distinguishes unavailable oracle dependencies from known-none", () => {
      const detail = strategyDetail();
      const withUnavailableDependencies = {
        ...detail,
        oracle: {
          ...detail.oracle,
          rows: detail.oracle.rows.map(row => ({
            ...row,
            dependencies: null,
          })),
        },
      };

      expect(
        strategyOpportunityDetailSchema.parse(withUnavailableDependencies)
          .oracle.rows[0]?.dependencies,
      ).toBeNull();
      expect(
        strategyOpportunityDetailSchema.safeParse({
          ...detail,
          oracle: {
            ...detail.oracle,
            rows: [
              {
                ...detail.oracle.rows[0],
                dependencies: [{ label: "Unavailable address", address: null }],
              },
            ],
          },
        }).success,
      ).toBe(false);
    });
  });

  describe("identity refinement", () => {
    it("rejects a pool whose chain disagrees with its ID", () => {
      expect(
        poolOpportunityRowSchema.safeParse({
          ...poolRow(),
          chainId: OTHER_CHAIN,
        }).success,
      ).toBe(false);
    });

    it("rejects a pool whose address disagrees with its ID", () => {
      expect(
        poolOpportunityRowSchema.safeParse({
          ...poolRow(),
          poolAddress: OTHER_ADDRESS,
        }).success,
      ).toBe(false);
    });

    it("rejects a strategy whose credit manager disagrees with its ID", () => {
      expect(
        strategyOpportunityRowSchema.safeParse({
          ...strategyRow(),
          creditManagerAddress: OTHER_ADDRESS,
        }).success,
      ).toBe(false);
    });

    it("rejects a strategy whose target collateral disagrees with its ID", () => {
      expect(
        strategyOpportunityRowSchema.safeParse({
          ...strategyRow(),
          targetCollateral: token(OTHER_ADDRESS),
        }).success,
      ).toBe(false);
    });

    it("rejects an embedded token from another chain", () => {
      const result = poolOpportunityRowSchema.safeParse({
        ...poolRow(),
        collateralTokens: [token(QUOTA, OTHER_CHAIN)],
      });
      expect(result.success).toBe(false);
      expect(result.error?.issues[0]?.path).toEqual([
        "collateralTokens",
        0,
        "chainId",
      ]);
    });

    it("reaches tokens nested inside groups", () => {
      const detail = strategyDetail();
      expect(
        strategyOpportunityDetailSchema.safeParse({
          ...detail,
          features: {
            ...detail.features,
            zeroSlippageToken: token(QUOTA, OTHER_CHAIN),
          },
        }).success,
      ).toBe(false);
    });
  });

  describe("list keys", () => {
    it("accepts a pool and a strategy with distinct IDs", () => {
      expect(
        earnOpportunityListSchema.parse([poolRow(), strategyRow()]),
      ).toHaveLength(2);
    });

    it("rejects a duplicate PoolId", () => {
      expect(
        earnOpportunityListSchema.safeParse([poolRow(), poolRow()]).success,
      ).toBe(false);
    });

    it("rejects a duplicate StrategyId", () => {
      expect(
        earnOpportunityListSchema.safeParse([strategyRow(), strategyRow()])
          .success,
      ).toBe(false);
    });
  });

  describe("wallet estimate", () => {
    it("accepts both the ownerless and the prepared shape", () => {
      expect(
        strategyOpportunityRowSchema.parse(strategyRow()).walletEstimate,
      ).toBeNull();
      expect(
        strategyOpportunityRowSchema.parse(ownedStrategyRow()).walletEstimate,
      ).toEqual(ownedStrategyRow().walletEstimate);
    });

    it("keeps a negative earnings projection representable", () => {
      const row = ownedStrategyRow();
      expect(
        strategyOpportunityRowSchema.parse({
          ...row,
          walletEstimate: {
            ...row.walletEstimate,
            annualEarningsUsd: -25,
          },
        }).walletEstimate?.annualEarningsUsd,
      ).toBe(-25);
    });
  });

  describe("ordering invariants", () => {
    it("requires strictly increasing history timestamps", () => {
      expect(
        historySeriesSchema.safeParse({
          metric: "depositApy",
          points: [
            { timestamp: 1, value: 0.01 },
            { timestamp: 2, value: 0.02 },
          ],
        }).success,
      ).toBe(true);

      expect(
        historySeriesSchema.safeParse({
          metric: "depositApy",
          points: [
            { timestamp: 2, value: 0.02 },
            { timestamp: 2, value: 0.03 },
          ],
        }).success,
      ).toBe(false);
    });

    it("requires strictly increasing rate-curve utilization", () => {
      expect(
        rateCurveSchema.safeParse({
          points: [
            { utilization: 0.5, supplyApy: 0.05, borrowApy: 0.07 },
            { utilization: 0.5, supplyApy: 0.06, borrowApy: 0.08 },
          ],
          borrowingLimitUtilization: null,
        }).success,
      ).toBe(false);
    });
  });

  describe("rate convention", () => {
    it("reads a Ratio as a decimal fraction", () => {
      expect(ratioSchema.parse(0.05)).toBe(0.05);
      expect(ratioSchema.safeParse(5).success).toBe(false);
      expect(ratioSchema.safeParse(-0.1).success).toBe(false);
    });

    it("allows values above 1 only where a Rate is expected", () => {
      const row = poolRow();
      expect(
        poolOpportunityRowSchema.safeParse({
          ...row,
          yield: { ...row.yield, totalApy: 1.5 },
        }).success,
      ).toBe(true);
      expect(
        poolOpportunityRowSchema.safeParse({
          ...row,
          liquidity: { ...row.liquidity, utilization: 1.5 },
        }).success,
      ).toBe(false);
    });
  });

  describe("envelopes", () => {
    it("accepts a bare source", () => {
      expect(dataMetaSchema.parse({ source: "backend" })).toEqual({
        source: "backend",
      });
      expect(dataMetaSchema.parse({ source: "sdk" }).source).toBe("sdk");
    });

    it("rejects unknown DataMeta fields", () => {
      expect(
        dataMetaSchema.safeParse({ source: "backend", unexpected: 1 }).success,
      ).toBe(false);
      expect(
        dataMetaSchema.safeParse({ source: "backend", extra: false }).success,
      ).toBe(false);
    });

    it("rejects unknown envelope fields but tolerates unknown payload fields", () => {
      expect(
        opportunityListResultSchema.safeParse({
          data: [{ ...poolRow(), futureField: "ignored" }],
          meta: { source: "backend" },
        }).success,
      ).toBe(true);

      expect(
        opportunityListResultSchema.safeParse({
          data: [poolRow()],
          meta: { source: "backend" },
          unexpected: null,
        }).success,
      ).toBe(false);
    });
  });
});

describe("createEarnDataSource", () => {
  function adapter(overrides: Partial<EarnDataSource>): EarnDataSource {
    const miss = () => Promise.reject(new Error("not stubbed"));
    return {
      listOpportunities: miss,
      getPool: miss,
      getStrategy: miss,
      getHistory: miss,
      ...overrides,
    };
  }

  it("reports the backend as the source when the backend answers", async () => {
    const source = createEarnDataSource({
      backend: adapter({
        listOpportunities: () =>
          Promise.resolve({ data: [poolRow()], meta: { source: "backend" } }),
      }),
      sdk: adapter({}),
    });

    await expect(source.listOpportunities()).resolves.toEqual({
      data: [poolRow()],
      meta: { source: "backend" },
    });
  });

  it("falls back to the SDK for the whole result and says so", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const backendError = new Error("502");
    const source = createEarnDataSource({
      backend: adapter({
        listOpportunities: () => Promise.reject(backendError),
      }),
      sdk: adapter({
        // A confused adapter could claim any source; the facade overrides it.
        listOpportunities: () =>
          Promise.resolve({
            data: [strategyRow()],
            meta: { source: "backend" },
          }),
      }),
    });

    await expect(source.listOpportunities()).resolves.toEqual({
      data: [strategyRow()],
      meta: { source: "sdk" },
    });
    expect(warning).toHaveBeenCalledWith(
      "Earn backend read failed; using the SDK source",
      {
        method: "listOpportunities",
        kind: "retry",
        error: backendError,
      },
    );
    warning.mockRestore();
  });

  it("falls back when the backend returns an invalid root payload", async () => {
    const invalidPool = {
      ...poolRow(),
      liquidity: { ...poolRow().liquidity, utilization: 5 },
    } as PoolOpportunityRow;
    const source = createEarnDataSource({
      backend: adapter({
        listOpportunities: () =>
          Promise.resolve({
            data: [invalidPool],
            meta: { source: "backend" },
          }),
      }),
      sdk: adapter({
        listOpportunities: () =>
          Promise.resolve({ data: [poolRow()], meta: { source: "sdk" } }),
      }),
    });

    await expect(source.listOpportunities()).resolves.toEqual({
      data: [poolRow()],
      meta: { source: "sdk" },
    });
  });

  it("parses a successful source once and strips tolerated payload fields", async () => {
    const rowWithFutureField = {
      ...poolRow(),
      futureField: "not public",
      underlyingToken: {
        ...poolRow().underlyingToken,
        futureTokenField: "not public",
      },
    };
    const source = createEarnDataSource({
      backend: adapter({
        listOpportunities: () =>
          Promise.resolve({
            data: [rowWithFutureField],
            meta: { source: "backend" },
          }),
      }),
      sdk: adapter({}),
    });

    const result = await source.listOpportunities();
    expect(result).toEqual({
      data: [poolRow()],
      meta: { source: "backend" },
    });
    expect(result.data[0]).not.toHaveProperty("futureField");
    expect(result.data[0]?.underlyingToken).not.toHaveProperty(
      "futureTokenField",
    );
  });

  it("falls back on a schema failure", async () => {
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
    const source = createEarnDataSource({
      backend: adapter({
        getPool: () =>
          Promise.reject(
            poolOpportunityDetailSchema.safeParse({}).error ??
              new Error("expected a validation failure"),
          ),
      }),
      sdk: adapter({
        getPool: () =>
          Promise.resolve({ data: poolDetail(), meta: { source: "sdk" } }),
      }),
    });

    await expect(source.getPool(createPoolId(CHAIN, POOL))).resolves.toEqual({
      data: poolDetail(),
      meta: { source: "sdk" },
    });
    expect(warning).toHaveBeenCalledWith(
      "Earn backend read failed; using the SDK source",
      expect.objectContaining({
        method: "getPool",
        kind: "contract-drift",
      }),
    );
    warning.mockRestore();
  });

  it("forwards the owner and keeps the prepared estimate", async () => {
    const listOpportunities = vi.fn(() =>
      Promise.resolve({
        data: [ownedStrategyRow()],
        meta: { source: "backend" as const },
      }),
    );
    const source = createEarnDataSource({
      backend: adapter({ listOpportunities }),
      sdk: adapter({}),
    });

    await expect(source.listOpportunities(OWNER)).resolves.toEqual({
      data: [ownedStrategyRow()],
      meta: { source: "backend" },
    });
    expect(listOpportunities).toHaveBeenCalledWith(OWNER);
  });

  it("treats an estimate on an ownerless list as contract drift", async () => {
    const source = createEarnDataSource({
      backend: adapter({
        listOpportunities: () =>
          Promise.resolve({
            data: [ownedStrategyRow()],
            meta: { source: "backend" },
          }),
      }),
      sdk: adapter({
        listOpportunities: () =>
          Promise.resolve({ data: [strategyRow()], meta: { source: "sdk" } }),
      }),
    });

    await expect(source.listOpportunities()).resolves.toEqual({
      data: [strategyRow()],
      meta: { source: "sdk" },
    });
  });

  it("treats a missing estimate on an owner list as contract drift", async () => {
    const source = createEarnDataSource({
      backend: adapter({
        listOpportunities: () =>
          Promise.resolve({
            data: [strategyRow()],
            meta: { source: "backend" },
          }),
      }),
      sdk: adapter({
        listOpportunities: () =>
          Promise.resolve({
            data: [ownedStrategyRow()],
            meta: { source: "sdk" },
          }),
      }),
    });

    await expect(source.listOpportunities(OWNER)).resolves.toEqual({
      data: [ownedStrategyRow()],
      meta: { source: "sdk" },
    });
  });

  it("leaves pool rows out of the owner check", async () => {
    const source = createEarnDataSource({
      backend: adapter({
        listOpportunities: () =>
          Promise.resolve({ data: [poolRow()], meta: { source: "backend" } }),
      }),
      sdk: adapter({}),
    });

    await expect(source.listOpportunities(OWNER)).resolves.toEqual({
      data: [poolRow()],
      meta: { source: "backend" },
    });
  });

  it("rejects owner-only wallet estimates on strategy details", async () => {
    const backendDetail = {
      ...strategyDetail(),
      walletEstimate: ownedStrategyRow().walletEstimate,
    };
    const source = createEarnDataSource({
      backend: adapter({
        getStrategy: () =>
          Promise.resolve({
            data: backendDetail,
            meta: { source: "backend" },
          }),
      }),
      sdk: adapter({
        getStrategy: () =>
          Promise.resolve({
            data: strategyDetail(),
            meta: { source: "sdk" },
          }),
      }),
    });

    await expect(
      source.getStrategy(createStrategyId(CHAIN, CREDIT_MANAGER, TARGET)),
    ).resolves.toEqual({
      data: strategyDetail(),
      meta: { source: "sdk" },
    });
  });

  it("propagates the failure when both sources miss", async () => {
    const source = createEarnDataSource({
      backend: adapter({}),
      sdk: adapter({
        getStrategy: () => Promise.reject(new Error("rpc down")),
      }),
    });

    await expect(
      source.getStrategy(createStrategyId(CHAIN, CREDIT_MANAGER, TARGET)),
    ).rejects.toThrow("rpc down");
  });
});
