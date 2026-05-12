import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type {
  CuratorFilter,
  NotValidatedStrategy,
  Strategy,
} from "../../common-utils/utils/strategies/types.js";
import {
  AddressMap,
  AP_WETH_TOKEN,
  NATIVE_ADDRESS,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  RAY,
} from "../../sdk/index.js";
import { ApyPlugin } from "./ApyPlugin.js";
import type { ApySnapshotState, GetStrategyInfoSnapshotArgs } from "./types.js";

const mockToken = "0x1111111111111111111111111111111111111111" as Address;
const mockUnderlying = "0x9999999999999999999999999999999999999999" as Address;
const mockPool = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;
const mockCM = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;
const mockFacade = "0xcccccccccccccccccccccccccccccccccccccccc" as Address;
const mockConfigurator =
  "0xdddddddddddddddddddddddddddddddddddddddd" as Address;
const mockAdapter = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as Address;
const mockWrappedNative =
  "0x7777777777777777777777777777777777777777" as Address;
const mockStrategyId = "test-strategy";

function makeMockTokensMeta(
  entries: Array<[Address, { decimals: number }]> = [
    [mockToken, { decimals: 18 }],
  ],
) {
  const map = new AddressMap(entries, "tokensMeta");
  return {
    entries: () => map.entries(),
    get: (token: Address) => map.get(token),
    decimals: (token: Address) => {
      const meta = map.get(token);
      if (!meta) throw new Error(`no decimals for ${token}`);
      return meta.decimals;
    },
  };
}

function makeMockMarket(
  overrides: {
    poolAddress?: Address;
    cmAddress?: Address;
    underlying?: Address;
    token?: Address;
    facadePaused?: boolean;
    poolPaused?: boolean;
    maxDebtPerBlockMultiplier?: number;
    isDegenMode?: boolean;
    quotaLimit?: bigint;
    quotaActive?: boolean;
    availableToBorrow?: bigint;
    minDebt?: bigint;
    maxDebt?: bigint;
    collateralTokens?: Address[];
    priceSuccess?: boolean;
    priceValue?: bigint;
    reservePriceValue?: bigint;
    marketConfigurator?: Address;
  } = {},
) {
  const poolAddr = overrides.poolAddress ?? mockPool;
  const cmAddr = overrides.cmAddress ?? mockCM;
  const underlying = overrides.underlying ?? mockUnderlying;
  const token = overrides.token ?? mockToken;
  const quotaLimit = overrides.quotaLimit ?? 1000n;
  const availableToBorrow = overrides.availableToBorrow ?? 500n;
  const minDebt = overrides.minDebt ?? 10n;
  const maxDebt = overrides.maxDebt ?? 1000n;
  const collateralTokens = overrides.collateralTokens ?? [token, underlying];

  const quotas = new AddressMap(
    [
      [
        token,
        {
          token,
          rate: 100,
          quotaIncreaseFee: 0,
          totalQuoted: 0n,
          limit: quotaLimit,
          isActive: overrides.quotaActive ?? true,
        },
      ],
    ],
    "quotas",
  );

  const liquidationThresholds = new AddressMap(
    collateralTokens.map(t => [t, t === token ? 8000 : 10000]),
    "liquidationThresholds",
  );

  const adapters = new AddressMap(
    [
      [
        mockAdapter,
        {
          address: mockAdapter,
          contractType: "ADAPTER",
          version: 310,
          name: "TestAdapter",
          targetContract: mockAdapter,
        },
      ],
    ],
    "adapters",
  );

  const creditManagerDebtParams = new AddressMap(
    [
      [
        cmAddr,
        {
          creditManager: cmAddr,
          borrowed: 100n,
          limit: 10000n,
          available: availableToBorrow,
        },
      ],
    ],
    "creditManagerDebtParams",
  );

  const mainPrices = new AddressMap(
    [
      [
        underlying,
        {
          price: overrides.priceValue ?? 2_000_00000000n,
          updatedAt: 0n,
          success: overrides.priceSuccess ?? true,
        },
      ],
      [
        mockWrappedNative,
        {
          price: 3_000_00000000n,
          updatedAt: 0n,
          success: true,
        },
      ],
    ],
    "mainPrices",
  );
  const reservePrices = new AddressMap(
    [
      [
        underlying,
        {
          price: overrides.reservePriceValue ?? 0n,
          updatedAt: 0n,
          success: true,
        },
      ],
      [
        mockWrappedNative,
        {
          price: 3_000_00000000n,
          updatedAt: 0n,
          success: true,
        },
      ],
    ],
    "reservePrices",
  );

  return {
    pool: {
      pool: {
        address: poolAddr,
        totalDebtLimit: 50000n,
        totalBorrowed: 1000n,
        baseInterestRate: 10000000000000000000000000n, // ~1% in ray
        isPaused: overrides.poolPaused ?? false,
        creditManagerDebtParams,
      },
      pqk: {
        quotas,
      },
    },
    priceOracle: {
      mainPrices,
      reservePrices,
    },
    creditManagers: [
      {
        creditManager: {
          address: cmAddr,
          underlying,
          pool: poolAddr,
          creditFacade: mockFacade,
          creditConfigurator: mockConfigurator,
          version: 310,
          name: "TestCM",
          maxEnabledTokens: 10,
          feeInterest: 1000,
          feeLiquidation: 500,
          liquidationDiscount: 9500,
          feeLiquidationExpired: 500,
          liquidationDiscountExpired: 9500,
          liquidationThresholds,
          adapters,
          collateralTokens,
        },
        creditFacade: {
          version: 310n,
          degenNFT: overrides.isDegenMode
            ? "0x0000000000000000000000000000000000000001"
            : "0x0000000000000000000000000000000000000000",
          isPaused: overrides.facadePaused ?? false,
          maxDebtPerBlockMultiplier: overrides.maxDebtPerBlockMultiplier ?? 1,
          forbiddenTokensMask: 0n,
          minDebt,
          maxDebt,
        },
        marketConfigurator: overrides.marketConfigurator ?? mockConfigurator,
      },
    ],
  };
}

function setupPlugin(
  opts: {
    loaded?: boolean;
    apySnapshot?: ApySnapshotState;
    markets?: ReturnType<typeof makeMockMarket>[];
    tokensMeta?: ReturnType<typeof makeMockTokensMeta>;
    chainId?: number;
    networkType?: string;
    timestamp?: bigint;
  } = {},
) {
  const plugin = new ApyPlugin();

  const apySnapshot = opts.apySnapshot ?? {
    apy: {
      apyList: { [mockToken]: 100 },
      extraCollateralAPYList: undefined,
      pointsList: undefined,
      extraCollateralPointsList: undefined,
      poolRewardsList: undefined,
      tokenExtraRewardsList: undefined,
      poolExternalAPYList: undefined,
      poolExtraAPYList: undefined,
    },
    gearStats: null,
    timestamp: "0",
  };

  Object.defineProperty(plugin, "loaded", {
    get: () => opts.loaded ?? true,
  });
  Object.defineProperty(plugin, "apySnapshot", {
    get: () => apySnapshot,
  });

  (plugin as unknown as { sdk: unknown }).sdk = {
    chainId: opts.chainId ?? 1,
    networkType: opts.networkType ?? "Mainnet",
    timestamp: opts.timestamp ?? 1000n,
    tokensMeta: opts.tokensMeta ?? makeMockTokensMeta(),
    marketRegister: {
      markets: opts.markets ?? [makeMockMarket()],
    },
    addressProvider: {
      getAddress: (key: string) =>
        key === AP_WETH_TOKEN ? mockWrappedNative : undefined,
    },
  };

  return { plugin };
}

function makeStrategy(
  overrides: Partial<NotValidatedStrategy> = {},
): NotValidatedStrategy {
  return {
    name: "Test strategy",
    id: mockStrategyId,
    chainId: 1,
    network: "Mainnet",
    tokenOutAddress: mockToken,
    creditManagers: [mockCM],
    strategyType: ["stable"],
    hideInProd: false,
    ...overrides,
  };
}

const baseArgs: GetStrategyInfoSnapshotArgs = {
  slippage: 100,
  quotaReserve: 5,
  curatorFilter: undefined,
  strategyPayloadsList: undefined,
  showHiddenStrategies: false,
};

describe("ApyPlugin.getStrategyInfoSnapshot", () => {
  it('throws "apy plugin not loaded" when not loaded', () => {
    const { plugin } = setupPlugin({ loaded: false });
    expect(() => plugin.getStrategyInfoSnapshot(baseArgs)).toThrow(
      "apy plugin not loaded",
    );
  });

  it("returns empty snapshot when strategyPayloadsList is undefined", () => {
    const { plugin } = setupPlugin();
    const result = plugin.getStrategyInfoSnapshot(baseArgs);

    expect(result.availableStrategies).toBeNull();
    expect(result.availableList).toBeNull();
    expect(result.disabledStrategies).toEqual({});
    expect(result.disabledList).toEqual([]);
    expect(result.cmsOfStrategiesByChain).toBeUndefined();
    expect(result.strategiesInfo).toEqual({});
  });

  it("filters strategies by current chain via allowedChains", () => {
    const { plugin } = setupPlugin({ chainId: 1 });
    const strategies = [
      makeStrategy(),
      makeStrategy({
        chainId: 2,
        network: "Arbitrum",
      }),
    ];

    const result = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: strategies,
    });

    expect(result.availableList).toHaveLength(1);
    expect((result.availableList as Strategy[])[0].chainId).toBe(1);
    expect(result.strategiesInfo[1]).toBeDefined();
    expect(result.strategiesInfo[2]).toBeUndefined();
  });

  it("respects showHiddenStrategies and releaseAt via lastSyncBlock", () => {
    const { plugin } = setupPlugin({ timestamp: 100n });
    const strategies = [
      makeStrategy({
        releaseAt: 200,
      }),
    ];

    const hidden = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: strategies,
      showHiddenStrategies: false,
    });
    expect(hidden.availableList).toEqual([]);

    const shown = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: strategies,
      showHiddenStrategies: true,
    });
    expect(shown.availableList).toHaveLength(1);
  });

  it("filters CMs by curatorFilter via marketConfigurator", () => {
    const otherConfigurator =
      "0x5555555555555555555555555555555555555555" as Address;
    const { plugin } = setupPlugin({
      markets: [
        makeMockMarket({ cmAddress: mockCM, poolAddress: mockPool }),
        makeMockMarket({
          cmAddress: "0x2222222222222222222222222222222222222222" as Address,
          poolAddress: "0x3333333333333333333333333333333333333333" as Address,
          token: mockToken,
          marketConfigurator: otherConfigurator,
        }),
      ],
    });

    const strategies = [
      makeStrategy({
        creditManagers: [mockCM, "0x2222222222222222222222222222222222222222"],
      }),
    ];
    const curatorFilter: CuratorFilter = { [mockConfigurator]: true };

    const result = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: strategies,
      curatorFilter,
    });

    const cms = result.cmsOfStrategiesByChain?.[1]?.[mockStrategyId];
    expect(Object.keys(cms ?? {})).toEqual([mockCM]);
  });

  it("matches strategy CM addresses case-insensitively", () => {
    const { plugin } = setupPlugin();
    const result = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: [
        makeStrategy({
          creditManagers: [mockCM.toUpperCase() as Address],
        }),
      ],
    });

    expect(result.strategiesInfo[1][mockStrategyId]).toBeDefined();
  });

  it("computes strategiesInfo for released strategies", () => {
    const { plugin } = setupPlugin();
    const strategies = [makeStrategy()];

    const result = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: strategies,
    });

    expect(result.strategiesInfo[1]).toBeDefined();
    expect(result.strategiesInfo[1][mockStrategyId]).toBeDefined();
    expect(result.strategiesInfo[1][mockStrategyId]?.points).toBeDefined();
    expect(
      result.strategiesInfo[1][mockStrategyId]?.points?.pointsInfo,
    ).toBeUndefined();
  });

  it("includes points in strategiesInfo when pointsList is present", () => {
    const { plugin } = setupPlugin({
      apySnapshot: {
        apy: {
          apyList: { [mockToken]: 100 },
          extraCollateralAPYList: undefined,
          pointsList: {
            [mockToken]: {
              symbol: "TKN",
              address: mockToken,
              rewards: [
                {
                  name: "pts",
                  units: "pts",
                  multiplier: 1n,
                  type: "test",
                },
              ],
              debtRewards: [
                {
                  name: "debt",
                  units: "pts",
                  multiplier: 2n,
                  type: "test",
                  cm: "any",
                },
              ],
            },
          },
          extraCollateralPointsList: undefined,
          poolRewardsList: undefined,
          tokenExtraRewardsList: undefined,
          poolExternalAPYList: undefined,
          poolExtraAPYList: undefined,
        },
        gearStats: null,
        timestamp: "0",
      },
    });

    const result = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: [makeStrategy()],
    });

    const points = result.strategiesInfo[1][mockStrategyId]?.points;
    expect(points).toBeDefined();
    expect(points?.rewardRates).toHaveLength(1);
    expect(points?.debtRewardRates).toHaveLength(1);
  });

  it("excludes strategy from strategiesInfo when no suitable CM", () => {
    const { plugin } = setupPlugin({
      markets: [
        makeMockMarket({
          cmAddress: mockCM,
          maxDebtPerBlockMultiplier: 0,
        }),
      ],
    });
    const strategies = [makeStrategy()];

    const result = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: strategies,
    });

    expect(result.strategiesInfo[1]).toBeUndefined();
  });

  it("reads prices from market.priceOracle.mainPrices", () => {
    const { plugin } = setupPlugin({
      markets: [makeMockMarket({ priceValue: 3_000_00000000n })],
    });
    const strategies = [makeStrategy()];

    const result = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: strategies,
    });

    const info = result.strategiesInfo[1][mockStrategyId];
    expect(info).toBeDefined();
    expect(info?.availableToBorrowMoney).toBeGreaterThan(0n);
  });

  it("scales borrow and quota rates like client-v3", () => {
    const { plugin } = setupPlugin();
    const result = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: [makeStrategy()],
    });

    const cm = result.strategiesInfo[1][mockStrategyId]?.minCreditManager;
    const expectedBaseBorrowRate = Number(
      (10000000000000000000000000n *
        (1000n + PERCENTAGE_FACTOR) *
        PERCENTAGE_DECIMALS) /
        RAY,
    );

    expect(cm?.baseBorrowRate).toBe(expectedBaseBorrowRate);
    expect(cm?.quotas[mockToken]?.rate).toBe(100n * PERCENTAGE_DECIMALS);
  });

  it("uses reserve price fallback when main price is zero", () => {
    const { plugin } = setupPlugin({
      markets: [
        makeMockMarket({
          priceValue: 0n,
          reservePriceValue: 3_000_00000000n,
        }),
      ],
    });

    const result = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: [makeStrategy()],
    });

    expect(
      result.strategiesInfo[1][mockStrategyId]?.availableToBorrowMoney,
    ).toBeGreaterThan(0n);
  });

  it("does not expose CM when target quota is inactive", () => {
    const { plugin } = setupPlugin({
      markets: [makeMockMarket({ quotaActive: false })],
    });

    const result = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: [makeStrategy()],
    });

    expect(result.availableList).toEqual([]);
    expect(result.strategiesInfo[1]).toBeUndefined();
  });

  it("adds native token price alias from wrapped native", () => {
    const { plugin } = setupPlugin({
      tokensMeta: makeMockTokensMeta([
        [mockToken, { decimals: 18 }],
        [NATIVE_ADDRESS, { decimals: 18 }],
      ]),
      markets: [
        makeMockMarket({
          underlying: NATIVE_ADDRESS,
          collateralTokens: [mockToken, NATIVE_ADDRESS],
          priceValue: 0n,
        }),
      ],
    });

    const result = plugin.getStrategyInfoSnapshot({
      ...baseArgs,
      strategyPayloadsList: [makeStrategy()],
    });

    expect(
      result.strategiesInfo[1][mockStrategyId]?.availableToBorrowMoney,
    ).toBeGreaterThan(0n);
  });
});
