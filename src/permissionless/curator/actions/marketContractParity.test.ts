import { type Address, formatUnits, stringToHex, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import { AccessMode } from "../../bindings/types.js";
import { addMarketActions } from "../editing/addAction.js";
import { MarketExecutor } from "../executor/MarketExecutor.js";
import { parseMarketScopedAction } from "../session/actionScope.js";
import { deserializeGipPlan } from "../session/serializeGipPlan.js";
import { isCreditManagerExpired } from "../state/market/isCreditManagerExpired.js";
import { diffMarketStates } from "../state/market/marketStateComparison.js";
import { type MarketState, NO_LIMIT } from "../state/market/types.js";
import {
  CM,
  CM2,
  CONFIGURATOR,
  createStubClient,
  createTestSdk,
  DECIMALS,
  FEED_USDC,
  FEED_WBTC,
  FEED_WETH,
  marketState,
  SOURCE_TIMESTAMP as NOW,
  USDC,
  WBTC,
  WETH,
} from "../testing/sdkHarness.js";
import { createCreditSuiteSchema } from "./createCreditSuiteActionData.js";
import type { GipMarketAction } from "./types.js";
import { MAX_QUOTA, MAX_UINT128 } from "./utils/rawAmounts.js";

function setup(facts: Record<string, unknown> = {}, code = "0x6000") {
  const client = createStubClient({
    client: { getCode: async () => code },
    readContract: args => {
      if (args.functionName in facts) {
        const answer = facts[args.functionName];
        if (answer instanceof Error) throw answer;
        if (typeof answer === "function") return answer(args);
        return answer;
      }
      switch (args.functionName) {
        case "isAllowedPriceFeed":
        case "isKnownPriceFeed":
          return true;
        case "getStalenessPeriod":
          return 3600;
        case "decimals":
          return 8;
        case "skipPriceCheck":
          return false;
        case "isPeripheryContract":
          return false;
        case "isDeployedFromRepository":
          return true;
        case "bytecodeRepository":
          return CONFIGURATOR;
        case "contractType":
          return stringToHex("DEGEN_NFT", { size: 32 });
        case "getPhantomTokenInfo":
          return [CM2, USDC];
        default:
          return undefined;
      }
    },
  });
  const executor = new MarketExecutor(
    {
      client,
      marketConfigurator: new MarketConfiguratorContract(CONFIGURATOR, client),
      tokens: { decimals: token => DECIMALS[token] ?? 6 },
    },
    { timestamp: NOW },
  );
  const state = marketState({ underlyingReservePriceFeed: zeroAddress });
  state.creditManagers[CM].creditFacade = CM2;
  return { client, executor, state };
}
const price = (feed: Address): GipMarketAction => ({
  type: "ORACLE::setPriceFeed",
  params: { token: WETH, priceFeed: feed },
});
const reserve = (feed: Address): GipMarketAction => ({
  type: "ORACLE::setReservePriceFeed",
  params: { token: WETH, priceFeed: feed },
});
const upgrade: GipMarketAction = {
  type: "CREDIT::upgradeCreditFacade",
  params: {
    creditManager: CM,
    facade: { degenNft: zeroAddress, expirable: true },
  },
};
const expiry = (date: number): GipMarketAction => ({
  type: "CREDIT::setExpirationDate",
  params: { creditManager: CM, expirationDate: date },
});
const rawHuman = (raw: bigint) => formatUnits(raw, 6);
const suiteParams = {
  name: "Parity suite",
  minorVersion: 310 as const,
  maxEnabledTokens: 4,
  feeInterest: 10,
  feeLiquidation: 1,
  feeLiquidationPremium: 2,
  feeLiquidationExpired: 0.5,
  feeLiquidationPremiumExpired: 1,
  minDebt: 1,
  maxDebt: 10,
  whitelistPolicy: zeroAddress,
  accountFactoryType: "DEFAULT" as const,
  isExpired: true,
};

async function rejection(
  action: GipMarketAction,
  expected: string,
  facts: Record<string, unknown> = {},
  change?: (state: MarketState) => void,
) {
  const { executor, state } = setup(facts);
  change?.(state);
  const result = await executor.execute(state, [action]);
  expect(result.blockedAt).toBe(0);
  expect(
    result.diagnostics.some(d => d.code === expected && d.severity === "error"),
  ).toBe(true);
  expect(result.txs).toEqual([]);
}

describe("market transitions against core contract rules", () => {
  it("keeps distinct adapter keys and merges only the latest pause after an upgrade barrier", () => {
    const allow = (target: Address): GipMarketAction => ({
      type: "CREDIT::allowAdapter",
      params: {
        creditManager: CM,
        adapter: { type: "UNISWAP_V3_ROUTER", version: 310, target },
      },
    });
    expect(
      addMarketActions([], [allow(FEED_WETH), allow(FEED_WBTC)]),
    ).toHaveLength(2);
    const pause: GipMarketAction = {
      type: "CREDIT::pause",
      params: { creditManager: CM },
    };
    expect(addMarketActions([], [pause, upgrade, pause, pause])).toEqual([
      pause,
      upgrade,
      pause,
    ]);
  });
  it("clears a promoted reserve and permits its explicit restoration", async () => {
    const { executor, state } = setup();
    state.assets[WETH].reservePriceFeed = FEED_WBTC;
    const result = await executor.executeBatch(state, [
      price(FEED_WBTC),
      reserve(FEED_WBTC),
    ]);
    expect(result.after.assets[WETH]).toMatchObject({
      mainPriceFeed: FEED_WBTC,
      reservePriceFeed: FEED_WBTC,
    });
    expect(
      (await executor.project(state, [price(FEED_WBTC)])).after.assets[WETH]
        .reservePriceFeed,
    ).toBe(zeroAddress);
  });

  it("supports and clears the underlying reserve", async () => {
    const { executor, state } = setup();
    const result = await executor.executeBatch(state, [
      {
        type: "ORACLE::setReservePriceFeed",
        params: { token: USDC, priceFeed: FEED_WBTC },
      },
      {
        type: "ORACLE::setPriceFeed",
        params: { token: USDC, priceFeed: FEED_WBTC },
      },
    ]);
    expect(result.after.underlyingReservePriceFeed).toBe(zeroAddress);
  });

  it("resets facade pause state and permits an explicit pause after upgrading", async () => {
    const { executor, state } = setup();
    state.creditManagers[CM].paused = true;
    const result = await executor.executeBatch(state, [
      upgrade,
      { type: "CREDIT::pause", params: { creditManager: CM } },
    ]);
    expect(result.after.creditManagers[CM].paused).toBe(true);
    expect(
      (await executor.project(state, [upgrade])).after.creditManagers[CM]
        .paused,
    ).toBe(false);
  });

  it.each([false, true])(
    "migrates expiration only when both facades are expirable (old=%s)",
    async old => {
      const { executor, state } = setup();
      Object.assign(state.creditManagers[CM], {
        expirable: old,
        expirationDate: NOW - 1,
        isExpired: true,
      });
      const cm = (await executor.project(state, [upgrade])).after
        .creditManagers[CM];
      expect(cm.expirationDate).toBe(old ? NOW - 1 : 0);
      expect(cm.isExpired).toBe(old);
      const disabled = await executor.project(state, [
        {
          ...upgrade,
          params: {
            creditManager: CM,
            facade: { degenNft: zeroAddress, expirable: false },
          },
        },
      ]);
      expect(disabled.after.creditManagers[CM]).toMatchObject({
        expirationDate: 0,
        isExpired: false,
      });
    },
  );

  it("clamps before checking monotonicity and refreshes the derived expiry", async () => {
    const { executor, state } = setup();
    Object.assign(state.creditManagers[CM], {
      expirable: true,
      expirationDate: NOW + 100,
      isExpired: true,
    });
    const cm = (await executor.executeBatch(state, [expiry(NOW + 1)])).after
      .creditManagers[CM];
    expect(cm.expirationDate).toBe(NOW + 14 * 86400);
    expect(cm.isExpired).toBe(false);
    expect(
      isCreditManagerExpired({ expirable: true, expirationDate: NOW }, NOW),
    ).toBe(true);
  });

  it("rejects past expiry before comparing equality and compares clamped equality", async () => {
    await rejection(expiry(NOW - 1), "EXPIRATION_IN_PAST", {}, state =>
      Object.assign(state.creditManagers[CM], {
        expirable: true,
        expirationDate: NOW - 1,
      }),
    );
    await rejection(expiry(NOW + 1), "NO_OP", {}, state =>
      Object.assign(state.creditManagers[CM], {
        expirable: true,
        expirationDate: NOW + 14 * 86400,
      }),
    );
  });

  it("replaces an in-progress ramp from its effective integer-bps LT", async () => {
    const { executor, state } = setup();
    Object.assign(state.creditManagers[CM].collateralTokens[WETH], {
      liquidationThresholdInitial: 80,
      liquidationThresholdFinal: 60,
      rampStart: NOW - 100,
      rampDuration: 300,
    });
    const result = await executor.executeBatch(state, [
      {
        type: "CREDIT::rampLiquidationThreshold",
        params: {
          creditManager: CM,
          token: WETH,
          liquidationThresholdFinal: 50,
          rampStart: 0,
          rampDuration: 172800,
        },
      },
    ]);
    expect(
      result.after.creditManagers[CM].collateralTokens[WETH],
    ).toMatchObject({ liquidationThresholdInitial: 73.33, rampStart: NOW });
  });

  it("deletes an alias key, and rejects actual alias changes on unquoted tokens", async () => {
    const { executor, state } = setup();
    state.lossPolicy = {
      type: "ALIAS",
      aliases: { [WETH]: FEED_WETH },
      enabled: true,
      mode: AccessMode.Permissionless,
    };
    const result = await executor.executeBatch(state, [
      {
        type: "LOSS_POLICY::ALIAS::setAlias",
        params: { token: WETH, alias: zeroAddress },
      },
    ]);
    expect(result.after.lossPolicy).toMatchObject({
      type: "ALIAS",
      aliases: {},
    });
    await rejection(
      {
        type: "LOSS_POLICY::ALIAS::setAlias",
        params: { token: USDC, alias: FEED_USDC },
      },
      "ASSET_NOT_FOUND",
    );
  });
});

describe("raw-unit storage bounds", () => {
  it("checks the uint128 intermediate products in the suite debt-ratio guard", async () =>
    rejection(
      {
        type: "MARKET::createCreditSuite",
        params: { ...suiteParams, minDebt: 1e31, maxDebt: 1e31 },
      },
      "AMOUNT_OVERFLOW",
    ));
  it.each([
    ["POOL::setTokenLimit", MAX_QUOTA],
    ["POOL::setTotalDebtLimit", MAX_UINT128],
    ["POOL::setCreditManagerDebtLimit", MAX_UINT128],
  ] as const)(
    "accepts the exact %s boundary and rejects one unit above it",
    async (type, max) => {
      const { executor, state } = setup();
      const action = (raw: bigint) =>
        ({
          type,
          params: { token: WETH, creditManager: CM, limit: rawHuman(raw) },
        }) as GipMarketAction;
      expect(
        (await executor.execute(state, [action(max)])).blockedAt,
      ).toBeUndefined();
      await rejection(action(max + 1n), "AMOUNT_OVERFLOW");
    },
  );

  it("supports unlimited manager and pool debt limits without losing the sentinel", async () => {
    const { executor, state } = setup();
    const result = await executor.executeBatch(state, [
      { type: "POOL::setTotalDebtLimit", params: { limit: NO_LIMIT } },
      {
        type: "POOL::setCreditManagerDebtLimit",
        params: { creditManager: CM, limit: NO_LIMIT },
      },
    ]);
    expect(result.after.totalDebtLimit).toBe(NO_LIMIT);
    expect(result.after.creditManagerDebtLimit[CM]).toBe(NO_LIMIT);
  });

  it("rejects extra fractional raw units rather than rounding them", async () => {
    await rejection(
      { type: "POOL::setTotalDebtLimit", params: { limit: "0.0000001" } },
      "INVALID_TOKEN_AMOUNT",
    );
  });

  it("checks the raw maxDebt times multiplier bound", async () => {
    await rejection(
      {
        type: "CREDIT::setMaxDebtPerBlockMultiplier",
        params: { creditManager: CM, maxDebtPerBlockMultiplier: 255 },
      },
      "DEBT_PER_BLOCK_OVERFLOW",
      {},
      state => {
        state.creditManagers[CM].maxDebt = Number(rawHuman(MAX_UINT128));
      },
    );
  });
});

describe("chain facts checked against projected prerequisites", () => {
  it("keeps unknown reserve allowance checks incomplete", async () => {
    const missingAllowance = setup({
      isAllowedPriceFeed: new Error("RPC unavailable"),
      zeroPriceFeed: FEED_USDC,
    });
    const result = await missingAllowance.executor.project(
      missingAllowance.state,
      [reserve(FEED_WBTC)],
    );
    expect(result.blockedAt).toBeUndefined();
    expect(
      result.incompleteChecks.some(check =>
        check.reason.includes("priceFeedValidation"),
      ),
    ).toBe(true);
  });

  it("leaves price validity to simulation across feed and quota actions", async () => {
    // @dev no check reads prices: a zero answer would block if one did
    const { executor, state } = setup({
      latestRoundData: [0n, 0n, 0n, 0n, 0n],
      getPrice: 0n,
    });
    state.lossPolicy = {
      type: "ALIAS",
      aliases: {},
      enabled: true,
      mode: AccessMode.Permissionless,
    };
    const result = await executor.project(state, [
      {
        type: "MARKET::addAsset",
        params: { token: WBTC, priceFeed: FEED_WBTC },
      },
      price(FEED_WBTC),
      reserve(FEED_USDC),
      {
        type: "LOSS_POLICY::ALIAS::setAlias",
        params: { token: WETH, alias: FEED_WBTC },
      },
      { type: "POOL::setTokenLimit", params: { token: WETH, limit: 1 } },
    ]);
    expect(result.blockedAt).toBeUndefined();
  });
  it("allows the store's special zero reserve even when it is not a token-specific allowed feed", async () => {
    const { executor, state } = setup({
      isAllowedPriceFeed: false,
      zeroPriceFeed: FEED_WBTC,
      skipPriceCheck: true,
      getStalenessPeriod: 0,
    });
    expect(
      (await executor.project(state, [reserve(FEED_WBTC)])).blockedAt,
    ).toBeUndefined();
  });

  it("checks creation NFT registration as a blocking prerequisite", async () => {
    await rejection(
      {
        type: "MARKET::createCreditSuite",
        params: { ...suiteParams, whitelistPolicy: FEED_WBTC },
      },
      "DEGEN_NFT_NOT_REGISTERED",
    );
  });

  it("uses validated preceding deployment metadata for targets absent at the source block", async () => {
    const { executor, state } = setup({}, "0x");
    const adapter: GipMarketAction = {
      type: "CREDIT::allowAdapter",
      params: {
        creditManager: CM,
        adapter: { type: "UNISWAP_V3_ROUTER", version: 310, target: FEED_WBTC },
      },
    };
    expect(
      (await executor.project(state, [adapter])).diagnostics.some(
        d => d.code === "ADAPTER_TARGET_NOT_CONTRACT",
      ),
    ).toBe(true);
    state.periphery = [
      {
        address: FEED_WBTC,
        type: "ZAPPER::ERC4626",
        domain: "ZAPPER",
        version: 310,
        status: "deployed",
      },
    ];
    const result = await executor.project(state, [adapter]);
    expect(result.blockedAt).toBeUndefined();
    expect(
      result.incompleteChecks.some(check =>
        check.reason.includes("deployed by preceding actions"),
      ),
    ).toBe(true);
  });

  it("reevaluates adapter required tokens after preceding collateral admission without caching the decision", async () => {
    const { executor, state, client } = setup({ asset: WBTC });
    state.assets[WBTC] = { ...state.assets[WETH], address: WBTC };
    const adapter: GipMarketAction = {
      type: "CREDIT::allowAdapter",
      params: {
        creditManager: CM,
        adapter: { type: "ERC4626_VAULT", version: 311, target: FEED_WBTC },
      },
    };
    expect(
      (await executor.project(state, [adapter])).diagnostics.some(
        d => d.code === "INVALID_ADAPTER_PARAMS",
      ),
    ).toBe(true);
    const assetReads = () =>
      client.calls.filter(
        call => call.kind === "readContract" && call.functionName === "asset",
      ).length;
    const count = assetReads();
    const result = await executor.project(state, [
      {
        type: "CREDIT::addCollateralToken",
        params: { creditManager: CM, token: WBTC, liquidationThreshold: 50 },
      },
      adapter,
    ]);
    expect(result.blockedAt).toBeUndefined();
    expect(assetReads()).toBe(count);
  });
  it("blocks an unapproved feed", async () =>
    rejection(price(FEED_WBTC), "PRICE_FEED_NOT_ALLOWED", {
      isAllowedPriceFeed: false,
    }));
  it("blocks an unknown alias feed", async () =>
    rejection(
      {
        type: "LOSS_POLICY::ALIAS::setAlias",
        params: { token: WETH, alias: FEED_WBTC },
      },
      "PRICE_FEED_NOT_ALLOWED",
      { isKnownPriceFeed: false },
    ));
  it("checks feed decimals", async () =>
    rejection(price(FEED_WBTC), "INVALID_FEED_DECIMALS", { decimals: 18 }));
  it("checks skip-check/staleness consistency", async () =>
    rejection(price(FEED_WBTC), "INVALID_FEED_STALENESS", {
      skipPriceCheck: true,
    }));
  it("enforces the collateral capacity including underlying", async () =>
    rejection(
      {
        type: "CREDIT::addCollateralToken",
        params: { creditManager: CM, token: WBTC, liquidationThreshold: 50 },
      },
      "TOO_MANY_COLLATERAL_TOKENS",
      {},
      state => {
        state.assets[WBTC] = { ...state.assets[WETH], address: WBTC };
        const collateral = state.creditManagers[CM].collateralTokens;
        for (let i = 1; Object.keys(collateral).length < 255; ++i)
          collateral[`0x${i.toString(16).padStart(40, "0")}`] = {
            liquidationThresholdFinal: 50,
            rampStart: 0,
            rampDuration: 0,
            isForbidden: false,
          };
      },
    ));
  it("requires phantom deposited tokens to already be collateral", async () =>
    rejection(
      {
        type: "CREDIT::addCollateralToken",
        params: { creditManager: CM, token: WBTC, liquidationThreshold: 50 },
      },
      "PHANTOM_DEPOSITED_TOKEN_MISSING",
      { getPhantomTokenInfo: [CM2, WBTC] },
      state => {
        state.assets[WBTC] = { ...state.assets[WETH], address: WBTC };
      },
    ));
  it("checks the repository provenance of periphery contracts", async () =>
    rejection(
      {
        type: "MARKET::addPeripheryContract",
        params: {
          peripheryContract: FEED_WBTC,
          domain: "DEGEN_NFT",
          type: "DEGEN_NFT",
        },
      },
      "PERIPHERY_NOT_FROM_REPOSITORY",
      { isDeployedFromRepository: false },
    ));
  it("rejects relabeling a deployed zapper as an NFT", async () =>
    rejection(
      {
        type: "MARKET::addPeripheryContract",
        params: {
          peripheryContract: FEED_WBTC,
          domain: "DEGEN_NFT",
          type: "DEGEN_NFT",
        },
      },
      "PERIPHERY_TYPE_MISMATCH",
      { contractType: stringToHex("ZAPPER::ERC4626", { size: 32 }) },
    ));
  it("checks upgrade NFTs, including preceding registrations", async () => {
    const { executor, state } = setup();
    const nftUpgrade: GipMarketAction = {
      ...upgrade,
      params: {
        creditManager: CM,
        facade: { degenNft: FEED_WBTC, expirable: true },
      },
    };
    expect((await executor.project(state, [nftUpgrade])).blockedAt).toBe(0);
    expect(
      (
        await executor.project(state, [
          {
            type: "MARKET::addPeripheryContract",
            params: {
              peripheryContract: FEED_WBTC,
              domain: "DEGEN_NFT",
              type: "DEGEN_NFT",
            },
          },
          nftUpgrade,
        ])
      ).blockedAt,
    ).toBeUndefined();
  });
  it.each([CM, CM2])("rejects manager/facade adapter target %s", async target =>
    rejection(
      {
        type: "CREDIT::allowAdapter",
        params: {
          creditManager: CM,
          adapter: { type: "UNISWAP_V3_ROUTER", version: 310, target },
        },
      },
      "FORBIDDEN_ADAPTER_TARGET",
    ),
  );
  it("checks adapter setter versions against the projected adapter", async () =>
    rejection(
      {
        type: "ADAPTER::UNISWAP_V3_ROUTER::setPoolBatchStatus",
        params: {
          creditManager: CM,
          target: FEED_WBTC,
          version: 310,
          pools: [],
        },
      },
      "ADAPTER_VERSION_MISMATCH",
      {},
      state => {
        state.creditManagers[CM].adapters[FEED_WBTC] = {
          type: "UNISWAP_V3_ROUTER",
          version: 311,
          target: FEED_WBTC,
          adapter: CM2,
          isForbidden: false,
        };
      },
    ));
  it("reports unavailable source facts separately from passing checks", async () => {
    const { executor, state } = setup({
      isAllowedPriceFeed: new Error("RPC unavailable"),
    });
    const result = await executor.project(state, [price(FEED_WBTC)]);
    expect(result.blockedAt).toBeUndefined();
    expect(
      result.incompleteChecks.some(check =>
        check.reason.includes("priceFeedValidation"),
      ),
    ).toBe(true);
  });
});

describe("schemas, serialization, and ETA", () => {
  it("rejects creation expiration instead of dropping it from calldata", () => {
    expect(createCreditSuiteSchema.safeParse(suiteParams).success).toBe(true);
    for (const expirationDate of [0, NOW + 86400])
      expect(
        createCreditSuiteSchema.safeParse({ ...suiteParams, expirationDate })
          .success,
      ).toBe(false);
  });
  it("bounds Tumbler epochs at 28 days", () => {
    expect(() =>
      parseMarketScopedAction({
        type: "MARKET::updateRateKeeper",
        params: { type: "TUMBLER", epochSeconds: 28 * 86400 },
      }),
    ).not.toThrow();
    const base = { type: "TUMBLER", epochSeconds: 28 * 86400 + 1 };
    expect(() =>
      parseMarketScopedAction({
        type: "MARKET::updateRateKeeper",
        params: base,
      }),
    ).toThrow();
  });
  it("rejects unknown plain-adapter versions", () => {
    expect(() =>
      parseMarketScopedAction({
        type: "CREDIT::allowAdapter",
        params: {
          creditManager: CM,
          adapter: {
            type: "UNISWAP_V3_ROUTER",
            version: 312,
            target: FEED_WBTC,
          },
        },
      }),
    ).toThrow();
  });
  it.each([310, 311])("accepts Midas issuance setter v%s", version => {
    expect(() =>
      parseMarketScopedAction({
        type: "ADAPTER::MIDAS_ISSUANCE_VAULT::setTokenAllowedStatusBatch",
        params: {
          creditManager: CM,
          target: FEED_WBTC,
          version,
          allowedTokens: [],
        },
      }),
    ).not.toThrow();
  });
  it("does not invent missing legacy reserve or ramp facts", () => {
    const state = marketState();
    const next = structuredClone(state);
    next.underlyingReservePriceFeed = FEED_USDC;
    next.creditManagers[CM].collateralTokens[WETH].liquidationThresholdInitial =
      80;
    const diff = diffMarketStates(state, next);
    expect(diff.changes).toEqual([]);
    expect(diff.skipped).toHaveLength(2);
  });
  it("rejects old serialized plan semantics explicitly", () =>
    expect(() =>
      deserializeGipPlan('{"serializationVersion":1,"plan":{}}'),
    ).toThrow("Unsupported"));
  it("uses ETA for projections and shares compilation across preview and build", async () => {
    const { sdk } = await createTestSdk();
    const builder = sdk
      .market({ initialState: marketState() })
      .addActions([upgrade, expiry(NOW + 86400)]);
    const earlier = await builder.preview();
    const eta = NOW + 100;
    const later = await builder.preview({ eta });
    expect(earlier.eta).toBe(NOW);
    expect(later.eta).toBe(eta);
    expect(await builder.preview({ eta })).toBe(later);
    expect(await builder.preview()).toBe(earlier);
    expect(earlier.after.creditManagers[CM].expirationDate).toBe(
      NOW + 14 * 86400,
    );
    expect(later.after.creditManagers[CM].expirationDate).toBe(
      NOW + 100 + 14 * 86400,
    );
    const plan = await builder.build({
      author: CM,
      eta,
    });
    expect(plan.eta).toBe(eta);
    expect(plan.after).toEqual(later.after);
    expect(await builder.build({ author: CM, eta })).toBe(plan);
  });

  it("preserves a past ETA while projecting from the source block time", async () => {
    const { sdk } = await createTestSdk();
    const builder = sdk
      .market({ initialState: marketState() })
      .addActions([upgrade, expiry(NOW + 86400)]);
    const eta = NOW - 100;
    const preview = await builder.preview({ eta });
    const plan = await builder.build({ author: CM, eta });
    expect(preview.eta).toBe(eta);
    expect(plan.eta).toBe(eta);
    expect(plan.timelockTxs.eta).toBe(eta);
    expect(plan.after.creditManagers[CM].expirationDate).toBe(NOW + 14 * 86400);
    expect(plan.after).toEqual(preview.after);
  });

  it.each([
    -1,
    NOW + 0.5,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.MAX_SAFE_INTEGER + 1,
  ])("rejects invalid ETA %s in preview and build", async eta => {
    const { sdk } = await createTestSdk();
    const builder = sdk
      .market({ initialState: marketState() })
      .addActions([upgrade, expiry(NOW + 86400)]);
    // Both methods validate ETA before their asynchronous compilation starts.
    expect(() => builder.preview({ eta })).toThrow("eta must be");
    expect(() => builder.build({ author: CM, eta })).toThrow("eta must be");
  });
});
