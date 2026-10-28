import { describe, expect, it } from "vitest";
import type { AllowAdapterAction } from "../actions/allowAdapterActionData.js";
import type { SetFeesAction } from "../actions/setFeesActionData.js";
import type { Bundle } from "../bundles/Bundle.js";
import { mfoneBundle } from "../testing/mfoneBundle.js";
import {
  CM,
  configuratorState,
  createTestSdk,
  FEED_WBTC,
  marketState,
  USDC,
  WBTC,
} from "../testing/sdkHarness.js";
import {
  type ConfiguratorScopedAction,
  GipScopeError,
  getActionScope,
  type MarketScopedAction,
  parseConfiguratorScopedAction,
  parseMarketScopedAction,
} from "./actionScope.js";

const marketAction: MarketScopedAction = {
  type: "POOL::setTotalDebtLimit",
  params: { limit: 2_000_000 },
};
const configuratorAction: ConfiguratorScopedAction = {
  type: "CONFIGURATOR::setEmergencyAdmin",
  params: { emergencyAdmin: CM },
};
const distributeAction: ConfiguratorScopedAction = {
  type: "TREASURY_SPLITTER::distribute",
  params: { token: USDC },
};
const deployAction: MarketScopedAction = {
  type: "BCR::deployContract",
  params: {
    contractType: "ZAPPER::ERC4626_UNDERLYING",
    version: 310,
    constructorParams: "0x",
    salt: `0x${"00".repeat(32)}`,
    expectedAddress: FEED_WBTC,
  },
};

describe("action scope classification", () => {
  it("classifies market and configurator action types", () => {
    expect(getActionScope("POOL::setTotalDebtLimit")).toBe("market");
    expect(getActionScope("CREDIT::addCollateralToken")).toBe("market");
    expect(getActionScope("CONFIGURATOR::addAdmin")).toBe("configurator");
    expect(getActionScope("TREASURY::setDefaultSplit")).toBe("configurator");
    expect(getActionScope("nope")).toBeUndefined();
  });

  it("puts treasury distribution in the configurator and periphery deployment in the market", () => {
    expect(getActionScope("TREASURY_SPLITTER::distribute")).toBe(
      "configurator",
    );
    expect(getActionScope("BCR::deployContract")).toBe("market");
  });
});

describe("JSON input validation", () => {
  it("preserves all mF-ONE adapter types and constructor fields", () => {
    const bundle = mfoneBundle();
    for (const action of bundle.actions) {
      if (action.type !== "CREDIT::allowAdapter") continue;
      const parsed = parseMarketScopedAction(action) as AllowAdapterAction;
      expect(
        parsed.params.adapter,
        `${bundle.name}: ${action.params.adapter.type}`,
      ).toEqual(action.params.adapter);
    }
  });

  it("rejects missing or unknown adapter types and missing specialized fields", () => {
    const parseAdapter = (adapter: unknown) =>
      parseMarketScopedAction({
        type: "CREDIT::allowAdapter",
        params: { creditManager: CM, adapter },
      }) as AllowAdapterAction;
    const base = { version: 311, target: WBTC };
    expect(() => parseAdapter(base)).toThrow();
    expect(() => parseAdapter({ ...base, type: "UNKNOWN_ADAPTER" })).toThrow();
    expect(() =>
      parseAdapter({ ...base, type: "MIDAS_ISSUANCE_VAULT" }),
    ).toThrow();
    expect(() => parseAdapter({ ...base, type: "CURVE_V1_2ASSETS" })).toThrow();
    expect(() =>
      parseAdapter({ ...base, type: "MELLOW_ERC4626_VAULT" }),
    ).toThrow();
    expect(
      parseAdapter({ ...base, version: 310, type: "MELLOW_ERC4626_VAULT" })
        .params.adapter,
    ).toEqual({ ...base, version: 310, type: "MELLOW_ERC4626_VAULT" });
  });

  it("normalizes params through the processor schema", () => {
    const parsed = parseMarketScopedAction({
      type: "CREDIT::setFees",
      params: {
        creditManager: CM,
        params: {
          feeLiquidation: 2.005,
          feeLiquidationExpired: 1,
          feeLiquidationPremium: 2.5,
          feeLiquidationPremiumExpired: 2,
        },
      },
    }) as SetFeesAction;
    // percentageSchema rounds to two decimals, so the parsed value is normalized
    expect(parsed.params.params.feeLiquidation).toBe(2.01);
  });

  it("rejects a configurator action handed to the market parser", () => {
    expect(() => parseMarketScopedAction(configuratorAction)).toThrow(
      GipScopeError,
    );
    try {
      parseMarketScopedAction(configuratorAction);
    } catch (error) {
      expect((error as GipScopeError).code).toBe("WRONG_SCOPE");
      expect(error).toMatchObject({
        expected: "market",
        actual: "configurator",
      });
    }
  });

  it("rejects treasury distribution handed to the market parser", () => {
    try {
      parseMarketScopedAction(distributeAction);
      throw new Error("should have thrown");
    } catch (error) {
      expect(error).toBeInstanceOf(GipScopeError);
      expect((error as GipScopeError).actual).toBe("configurator");
    }
  });

  it("rejects a market action handed to the configurator parser", () => {
    expect(() => parseConfiguratorScopedAction(marketAction)).toThrow(
      /market-scoped/,
    );
  });

  it("accepts treasury distribution in the configurator parser and deployment in the market parser", () => {
    expect(parseConfiguratorScopedAction(distributeAction).type).toBe(
      "TREASURY_SPLITTER::distribute",
    );
    expect(parseMarketScopedAction(deployAction).type).toBe(
      "BCR::deployContract",
    );
    expect(() => parseConfiguratorScopedAction(deployAction)).toThrow(
      GipScopeError,
    );
  });

  it("rejects malformed and unknown input", () => {
    expect(() => parseMarketScopedAction(null)).toThrow(/must be an object/);
    expect(() => parseMarketScopedAction({ params: {} })).toThrow(
      /string `type`/,
    );
    expect(() => parseMarketScopedAction({ type: "nope", params: {} })).toThrow(
      /Unknown GIP action type/,
    );
    for (const inheritedName of ["__proto__", "constructor", "toString"]) {
      expect(getActionScope(inheritedName)).toBeUndefined();
      expect(() =>
        parseMarketScopedAction({ type: inheritedName, params: {} }),
      ).toThrow(/Unknown GIP action type/);
    }
  });
});

describe("builder scope enforcement at runtime", () => {
  it("market builder refuses configurator actions", async () => {
    const { sdk } = await createTestSdk();
    const market = sdk.market({ initialState: marketState() });
    expect(() =>
      market.addAction(configuratorAction as unknown as MarketScopedAction),
    ).toThrow(GipScopeError);
    expect(() =>
      market.addAction(distributeAction as unknown as MarketScopedAction),
    ).toThrow(GipScopeError);
    // Nothing was recorded, so the builder is still at revision 0.
    expect(market.revision).toBe(0);
  });

  it("configurator builder refuses market actions", async () => {
    const { sdk } = await createTestSdk();
    const config = sdk.configurator({ initialState: configuratorState() });
    expect(() =>
      config.addAction(marketAction as unknown as ConfiguratorScopedAction),
    ).toThrow(GipScopeError);
    expect(() =>
      config.addAction(deployAction as unknown as ConfiguratorScopedAction),
    ).toThrow(GipScopeError);
    expect(config.revision).toBe(0);
  });

  it("has no shared builder", async () => {
    const { sdk } = await createTestSdk();
    expect((sdk as unknown as { shared?: unknown }).shared).toBeUndefined();
  });

  it("has no bundle application outside the market scope", async () => {
    const { sdk } = await createTestSdk();
    expect(typeof sdk.market({ initialState: marketState() }).applyBundle).toBe(
      "function",
    );
    expect(
      (sdk.configurator() as unknown as { applyBundle?: unknown }).applyBundle,
    ).toBeUndefined();
  });

  it("normalizes recorded params through the processor schema", async () => {
    const { sdk } = await createTestSdk();
    const preview = await sdk
      .market({ initialState: marketState() })
      .addAction({
        type: "CREDIT::setFees",
        params: {
          creditManager: CM,
          // fee + premium stays 4.5%, as the credit configurator requires
          params: {
            feeLiquidation: 2.005,
            feeLiquidationExpired: 1,
            feeLiquidationPremium: 2.49,
            feeLiquidationPremiumExpired: 2,
          },
        },
      })
      .preview();
    expect(
      (preview.resolvedActions[0] as SetFeesAction).params.params
        .feeLiquidation,
    ).toBe(2.01);
    expect(preview.after.creditManagers[CM].feeLiquidation).toBe(2.01);
  });

  it("normalizes schema-valid bundle actions", async () => {
    const { sdk } = await createTestSdk();
    const preview = await sdk
      .market({ initialState: marketState() })
      .applyBundle({
        name: "normalized",
        tokenIn: [],
        tokenOut: [],
        enabledTokens: 1,
        warning: undefined,
        actions: [
          {
            type: "CREDIT::setFees",
            params: {
              creditManager: CM,
              params: {
                feeLiquidation: 2.005,
                feeLiquidationExpired: 1,
                feeLiquidationPremium: 2.5,
                feeLiquidationPremiumExpired: 2,
              },
            },
          },
        ],
      })
      .preview();

    expect(
      (preview.resolvedActions[0] as SetFeesAction).params.params
        .feeLiquidation,
    ).toBe(2.01);
    expect(preview.bundles[0].paramWarnings).toBeUndefined();
  });

  it("rejects recorded params that fail the schema", async () => {
    const { sdk } = await createTestSdk();
    expect(() =>
      sdk.market({ initialState: marketState() }).addAction({
        type: "POOL::setTokenLimit",
        params: { token: "0x1", limit: 1 },
      }),
    ).toThrow(/42 characters/);
  });

  it("rejects out-of-scope and unknown actions inside a bundle", async () => {
    const { sdk } = await createTestSdk();
    const market = sdk.market({ initialState: marketState() });
    expect(() =>
      market.applyBundle({
        name: "bad",
        tokenIn: [],
        tokenOut: [],
        enabledTokens: 1,
        actions: [distributeAction],
      } as unknown as Bundle),
    ).toThrow(GipScopeError);
    expect(() =>
      market.applyBundle({
        name: "unknown",
        tokenIn: [],
        tokenOut: [],
        enabledTokens: 1,
        actions: [{ type: "ADAPTER::NOPE::doThing", params: {} }],
      } as unknown as Bundle),
    ).toThrow(/Unknown GIP action type/);
  });

  it("reports — but still applies — bundle params that fail the schema", async () => {
    const { sdk } = await createTestSdk();
    const preview = await sdk
      .market({ initialState: marketState() })
      .applyBundle({
        name: "loud bundle",
        tokenIn: [],
        tokenOut: [],
        enabledTokens: 1,
        actions: [
          {
            type: "MARKET::addAsset",
            params: { token: WBTC, priceFeed: FEED_WBTC },
          },
          {
            type: "MARKET::addPeripheryContract",
            // the label must be a string, but it never reaches the chain
            params: {
              peripheryContract: FEED_WBTC,
              domain: "ZAPPER",
              type: 42,
            },
          },
        ],
      } as unknown as Bundle)
      .preview();

    expect(preview.bundles[0].paramWarnings?.join(" ")).toMatch(/type/);
    expect(preview.incompleteChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "bundleActionParams:loud bundle" }),
      ]),
    );
    // The bundle was still applied as authored.
    expect(preview.after.periphery).toEqual([
      {
        address: FEED_WBTC,
        domain: "ZAPPER",
        type: 42,
        version: 310,
        status: "registered",
      },
    ]);
    expect(preview.blockedAt).toBeUndefined();
  });

  it("stops at a bundle action the chain would reject, and refuses to build it", async () => {
    const { sdk } = await createTestSdk();
    const market = sdk.market({ initialState: marketState() }).applyBundle({
      name: "reverting bundle",
      tokenIn: [],
      tokenOut: [],
      enabledTokens: 1,
      warning: undefined,
      actions: [
        {
          type: "MARKET::addAsset",
          params: { token: WBTC, priceFeed: FEED_WBTC },
        },
        {
          type: "CREDIT::addCollateralToken",
          // above the underlying's 100% liquidation threshold
          params: { creditManager: CM, token: WBTC, liquidationThreshold: 120 },
        },
      ],
    });

    const preview = await market.preview();
    expect(preview.blockedAt).toBe(1);
    expect(preview.actionDiagnostics).toEqual([
      expect.objectContaining({
        severity: "error",
        code: "LT_ABOVE_UNDERLYING",
        actionIndex: 1,
        actionType: "CREDIT::addCollateralToken",
        path: ["params", "liquidationThreshold"],
      }),
    ]);
    // The projection stops right before the reverting action.
    expect(preview.after.assets[WBTC]).toBeDefined();
    expect(
      preview.after.creditManagers[CM].collateralTokens[WBTC],
    ).toBeUndefined();

    await expect(market.build({ author: CM, eta: 1 })).rejects.toMatchObject({
      name: "GipActionError",
      code: "LT_ABOVE_UNDERLYING",
      actionIndex: 1,
    });
  });
});
