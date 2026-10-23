import { type Address, type Hex, zeroAddress } from "viem";
import { describe, expect, it } from "vitest";
import type { GearboxChain } from "../../../onchain/chain/chains.js";
import type {
  CreateMarketParams,
  DeployCreateSuiteParams,
} from "../actions/actionTypes.js";
import type { AddCollateralTokenAction } from "../actions/addCollateralTokenActionData.js";
import type { SetTotalDebtLimitAction } from "../actions/setTotalDebtLimitActionData.js";
import type { MarketActions } from "../actions/types.js";
import type { Bundle } from "../bundles/Bundle.js";
import type { ConfiguratorState } from "../state/configurator/types.js";
import {
  CM,
  CM2,
  CONFIGURATOR,
  configuratorState,
  createMarketSuite,
  createStubClient,
  createStubSdk,
  createTestSdk,
  FEED_WBTC,
  GOVERNOR,
  marketState,
  POOL,
  SOURCE_BLOCK,
  SOURCE_BLOCK_HASH,
  SOURCE_TIMESTAMP,
  TREASURY,
  USDC,
  WBTC,
  WETH,
} from "../testing/sdkHarness.js";
import { GipTargetResolutionError } from "./MarketBuilder.js";
import { deserializeGipPlan, serializeGipPlan } from "./serializeGipPlan.js";
import type { MarketGipPlan } from "./types.js";

const AUTHOR: Address = "0x000000000000000000000000000000000000dEaD";
const ETA = SOURCE_TIMESTAMP + 7 * 24 * 60 * 60;

const newMarketParams: CreateMarketParams = {
  minorVersion: 310,
  name: "Gearbox USDC",
  symbol: "dUSDC",
  underlying: USDC,
  underlyingPriceFeed: "0x1010101010101010101010101010101010101010",
  interestRateModel: {
    type: "LINEAR",
    params: {
      U_1: 70,
      U_2: 90,
      R_base: 0,
      R_slope1: 5,
      R_slope2: 20,
      R_slope3: 100,
      isBorrowingMoreU2Forbidden: true,
    },
  },
  rateKeeperParams: { type: "TUMBLER", epochSeconds: 604_800 },
  lossPolicyParams: { type: "ALIAS" },
};

const creditSuiteParams: DeployCreateSuiteParams = {
  name: "New CM",
  salt: `0x${"11".repeat(32)}`,
  maxEnabledTokens: 4,
  feeInterest: 20,
  feeLiquidation: 2,
  feeLiquidationPremium: 2.5,
  feeLiquidationExpired: 1,
  feeLiquidationPremiumExpired: 2,
  minDebt: 10_000,
  maxDebt: 100_000,
  minorVersion: 310,
  accountFactoryType: "DEFAULT",
  isExpired: false,
  expirationDate: 0,
  whitelistPolicy: zeroAddress,
};

function wbtcBundle(extraActions: MarketActions[] = []): Bundle {
  return {
    name: "WBTC strategy",
    tokenIn: [USDC],
    tokenOut: [WBTC],
    enabledTokens: 2,
    warning: undefined,
    actions: [
      ...extraActions,
      {
        type: "MARKET::addAsset",
        params: { token: WBTC, priceFeed: FEED_WBTC },
      },
      { type: "POOL::setTokenLimit", params: { token: WBTC, limit: 50_000 } },
      {
        type: "CREDIT::addCollateralToken",
        params: {
          creditManager: zeroAddress,
          token: WBTC,
          liquidationThreshold: 80,
        },
      },
    ],
  };
}

/** Revisits a limit the caller already recorded, forcing a projection replay. **/
function replayBundle(): Bundle {
  const bundle = wbtcBundle();
  bundle.actions.push({
    type: "POOL::setTokenLimit",
    params: { token: WETH, limit: 500 },
  });
  return bundle;
}

describe("supplied vs fetched market state", () => {
  it("uses a supplied state verbatim and never reads the market", async () => {
    const supplied = marketState();
    const { sdk, client } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .market({ pool: POOL, initialState: supplied })
      .addAction({
        type: "POOL::setTotalDebtLimit",
        params: { limit: 2_000_000 },
      })
      .preview();

    expect(preview.stateProvenance).toBe("caller-supplied");
    expect(preview.before?.totalDebtLimit).toBe(1_000_000);
    expect(preview.after.totalDebtLimit).toBe(2_000_000);
    // A market-suite read would have thrown, because none was stubbed.
    expect(client.unexpected).toEqual([]);
  });

  it("rejects a supplied state that belongs to another pool", async () => {
    const { sdk } = await createTestSdk();
    await expect(
      sdk
        .market({
          pool: CM,
          initialState: marketState(),
        })
        .addAction({
          type: "POOL::setTotalDebtLimit",
          params: { limit: 1 },
        })
        .preview(),
    ).rejects.toThrow(/scoped to/);
  });

  it("fetches through the supplied on-chain SDK using pinned supplemental reads", async () => {
    const { sdk, client } = await createTestSdk();
    const preview = await sdk
      .market({ pool: POOL })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 7_000 } })
      .preview();

    expect(preview.stateProvenance).toBe("caller-supplied-sdk-state");
    expect(preview.before?.address).toBe(POOL);
    expect(preview.before?.totalDebtLimit).toBe("Unlimited");
    expect(preview.after.totalDebtLimit).toBe(7_000);
    // Every read the compiler made was pinned to the SDK's source block.
    expect(client.calls.length).toBeGreaterThan(0);
    for (const call of client.calls) {
      const fn =
        call.kind === "readContract" ? call.functionName : call.functions;
      expect({
        fn,
        at: call.blockNumber,
      }).toEqual({ fn, at: SOURCE_BLOCK });
    }
  });

  it("overrides an existing SDK's unpinned supplemental reader", async () => {
    const client = createStubClient();
    const suite = createMarketSuite({ client });
    const onchain = createStubSdk({ client, marketSuite: suite });
    const { sdk } = await createTestSdk({ client, sdk: onchain });
    await sdk
      .market({ pool: POOL })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 7_000 } })
      .preview();

    expect(client.calls.length).toBeGreaterThan(0);
    for (const call of client.calls) {
      expect(call.blockNumber).toBe(SOURCE_BLOCK);
    }
  });

  it("derives isExpired from the source block timestamp, not Date.now()", async () => {
    const client = (await createTestSdk()).client;
    // Expires after the source block but long before "now".
    const expirationDate = SOURCE_TIMESTAMP + 1_000;
    const { sdk } = await createTestSdk({
      client,
      marketSuiteOptions: { expirable: true, expirationDate },
    });
    const preview = await sdk
      .market({ pool: POOL })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 7_000 } })
      .preview();

    expect(preview.before?.creditManagers[CM].expirationDate).toBe(
      expirationDate,
    );
    expect(preview.before?.creditManagers[CM].isExpired).toBe(false);
    expect(Date.now() / 1000).toBeGreaterThan(expirationDate);
  });

  it("reports a provenance caveat when the supplied SDK is at another block", async () => {
    const { sdk } = await createTestSdk({
      sdkCurrentBlock: SOURCE_BLOCK - 10n,
    });
    const preview = await sdk
      .market({ initialState: marketState() })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 1 } })
      .preview();
    expect(preview.incompleteChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "sdk-snapshot-block" }),
      ]),
    );
  });

  it("pins getBlock calls with no arguments and preserves explicit identities", async () => {
    type GetBlockArgs = { blockNumber?: bigint; blockHash?: Hex };
    const calls: GetBlockArgs[] = [];
    const explicitHash: Hex = `0x${"cd".repeat(32)}`;
    const client = createStubClient({
      client: {
        getBlock: async (args: GetBlockArgs = {}) => {
          calls.push(args);
          return {
            number: args.blockNumber ?? SOURCE_BLOCK,
            hash: args.blockHash ?? SOURCE_BLOCK_HASH,
            timestamp: BigInt(SOURCE_TIMESTAMP),
          };
        },
      },
    });
    const { sdk } = await createTestSdk({ client });
    await sdk.readClient.getBlock();
    await sdk.readClient.getBlock({ blockHash: explicitHash });

    expect(calls[1]).toEqual({ blockNumber: SOURCE_BLOCK });
    expect(calls[2]).toEqual({ blockHash: explicitHash });
    // The pinned read client serves the Gearbox chain, which carries `network`.
    expect((sdk.readClient.chain as GearboxChain).network).toBe("Mainnet");
  });
});

describe("immutability", () => {
  it("does not mutate the supplied state or bundle", async () => {
    const supplied = marketState();
    const before = structuredClone(supplied);
    const bundle = wbtcBundle();
    const bundleBefore = structuredClone(bundle);
    const { sdk } = await createTestSdk({ marketSuite: null });

    await sdk.market({ initialState: supplied }).applyBundle(bundle).preview();

    expect(supplied).toEqual(before);
    expect(bundle).toEqual(bundleBefore);
  });

  it("freezes sdk.source, matching its readonly type", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    expect(Object.isFrozen(sdk.source)).toBe(true);
    expect(() => {
      // Deliberately writes through the readonly type to prove it is frozen.
      (sdk.source as { blockNumber: bigint }).blockNumber = SOURCE_BLOCK + 1n;
    }).toThrow();
    expect(sdk.source.blockNumber).toBe(SOURCE_BLOCK);
  });

  it("freezes previews and plans, and keeps earlier plans stable", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const market = sdk
      .market({ initialState: marketState() })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 2_000 } });

    const firstPlan = await market.build({ author: AUTHOR, eta: ETA });
    expect(Object.isFrozen(firstPlan)).toBe(true);
    expect(Object.isFrozen(firstPlan.after)).toBe(true);
    expect(() => {
      firstPlan.after.totalDebtLimit = 1;
    }).toThrow();

    const callsBefore = firstPlan.payloadCalls.length;
    market.addAction({
      type: "POOL::setTokenLimit",
      params: { token: WETH, limit: 1_234 },
    });
    const secondPlan = await market.build({ author: AUTHOR, eta: ETA });

    expect(firstPlan.payloadCalls.length).toBe(callsBefore);
    expect(firstPlan.after.totalDebtLimit).toBe(2_000);
    expect(secondPlan.payloadCalls.length).toBe(callsBefore + 1);
    expect(secondPlan).not.toBe(firstPlan);
  });

  it("records an immutable copy of the action, so later edits are ignored", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const action: SetTotalDebtLimitAction = {
      type: "POOL::setTotalDebtLimit",
      params: { limit: 10 },
    };
    const market = sdk
      .market({ initialState: marketState() })
      .addAction(action);
    action.params.limit = 999;
    const preview = await market.preview();
    expect(preview.after.totalDebtLimit).toBe(10);
  });

  it("copies a supplied state when the builder is created", async () => {
    const supplied = marketState();
    const { sdk } = await createTestSdk({ marketSuite: null });
    const market = sdk
      .market({ initialState: supplied })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 10 } });
    supplied.totalDebtLimit = 999;
    const preview = await market.preview();
    expect(preview.before?.totalDebtLimit).toBe(1_000_000);
  });
});

describe("sequential actions, bundles and deployment targets", () => {
  it("merges a later action into an earlier one that configures the same thing", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .market({ initialState: marketState() })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 10 } })
      .addAction({ type: "POOL::pause", params: {} })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 20 } })
      .preview();

    // The same merge rules apply as for bundles and the app: one limit, in
    // the earlier action's place.
    expect(preview.resolvedActions).toEqual([
      { type: "POOL::setTotalDebtLimit", params: { limit: 20 } },
      { type: "POOL::pause", params: {} },
    ]);
    expect(preview.after.totalDebtLimit).toBe(20);
  });

  it("applies a bundle on top of recorded actions and replays the projection", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .market({ initialState: marketState() })
      // A limit the bundle will revisit, because the bundle keeps the larger
      // of the two.
      .addAction({
        type: "POOL::setTokenLimit",
        params: { token: WETH, limit: 10 },
      })
      .applyBundle(replayBundle())
      .preview();

    const types = preview.resolvedActions.map(action => action.type);
    expect(types).toContain("MARKET::addAsset");
    expect(types).toContain("CREDIT::addCollateralToken");
    // The bundle replaced the earlier WETH limit in place, and the replayed
    // projection reflects the bundle's value rather than the recorded 10.
    const limits = preview.resolvedActions.filter(
      action => action.type === "POOL::setTokenLimit",
    );
    expect(limits).toHaveLength(2);
    expect(limits.map(action => action.params.limit)).not.toContain(10);
    expect(preview.after.assets[WETH].quotaLimit).toBe(500);
    expect(preview.after.assets[WBTC].quotaLimit).toBe(50_000);
    expect(
      preview.after.creditManagers[CM].collateralTokens[WBTC],
    ).toMatchObject({
      liquidationThresholdFinal: 80,
    });
    expect(preview.bundles).toHaveLength(1);
    expect(preview.bundles[0]).toMatchObject({
      bundleName: "WBTC strategy",
      targetCreditManager: CM,
      targetResolution: "existing-single-manager",
    });
    expect(preview.bundles[0].replaced).toContain("POOL::setTokenLimit");
  });

  it("resolves a zero-address placeholder to the suite the bundle deploys", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .market({ initialState: marketState({ creditManagers: {} }) })
      .applyBundle(
        wbtcBundle([
          { type: "MARKET::createCreditSuite", params: creditSuiteParams },
        ]),
      )
      .preview();

    expect(preview.bundles[0]).toMatchObject({
      targetResolution: "predicted-suite",
      targetCreditManager: CM2,
    });
    expect(preview.predictedDeployments).toEqual([
      expect.objectContaining({
        address: CM2,
        actionType: "MARKET::createCreditSuite",
        prediction: "preview",
      }),
    ]);
    expect(preview.after.creditManagers[CM2]).toBeDefined();
    const collateral = preview.after.creditManagers[CM2].collateralTokens[WBTC];
    expect(collateral.liquidationThresholdFinal).toBe(80);
  });

  it("uses the market's single existing credit manager when there is one", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .market({ initialState: marketState() })
      .applyBundle(wbtcBundle())
      .preview();
    expect(preview.bundles[0]).toMatchObject({
      targetResolution: "existing-single-manager",
      targetCreditManager: CM,
    });
  });

  it("targets the bundle's new suite when the market already has several managers", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const supplied = marketState();
    const anotherManager: Address =
      "0x2222222222222222222222222222222222222224";
    supplied.creditManagers[anotherManager] = {
      ...structuredClone(supplied.creditManagers[CM]),
      address: anotherManager,
    };
    supplied.creditManagerDebtLimit[anotherManager] = 1;
    const preview = await sdk
      .market({ initialState: supplied })
      .applyBundle(
        wbtcBundle([
          { type: "MARKET::createCreditSuite", params: creditSuiteParams },
        ]),
      )
      .preview();

    expect(preview.bundles[0]).toMatchObject({
      targetResolution: "predicted-suite",
      targetCreditManager: CM2,
    });
    expect(
      preview.after.creditManagers[CM2].collateralTokens[WBTC],
    ).toMatchObject({ liquidationThresholdFinal: 80 });
    for (const manager of [CM, anotherManager]) {
      expect(preview.after.creditManagers[manager]).toEqual(
        supplied.creditManagers[manager],
      );
    }
  });

  it("resolves a suite recorded before the bundle from the replayed state", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .market({ initialState: marketState({ creditManagers: {} }) })
      .addAction({
        type: "MARKET::createCreditSuite",
        params: creditSuiteParams,
      })
      .applyBundle(wbtcBundle())
      .preview();

    expect(preview.bundles[0]).toMatchObject({
      targetResolution: "predicted-suite",
      targetCreditManager: CM2,
    });
    expect(
      preview.after.creditManagers[CM2].collateralTokens[WBTC],
    ).toMatchObject({ liquidationThresholdFinal: 80 });
  });

  it("uses addresses authored in bundle actions when there are several managers", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const supplied = marketState();
    supplied.creditManagers[CM2] = {
      ...structuredClone(supplied.creditManagers[CM]),
      address: CM2,
    };
    supplied.creditManagerDebtLimit[CM2] = 1;
    const bundle = wbtcBundle();
    (
      bundle.actions.find(
        action => action.type === "CREDIT::addCollateralToken",
      ) as AddCollateralTokenAction
    ).params.creditManager = CM2;
    const preview = await sdk
      .market({ initialState: supplied })
      .applyBundle(bundle)
      .preview();

    expect(preview.bundles[0].targetResolution).toBe("not-required");
    expect(
      preview.after.creditManagers[CM2].collateralTokens[WBTC],
    ).toMatchObject({ liquidationThresholdFinal: 80 });
    expect(preview.after.creditManagers[CM]).toEqual(
      supplied.creditManagers[CM],
    );
  });

  it("rejects bundles that deploy several suites with shared placeholders", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    await expect(
      sdk
        .market({ initialState: marketState() })
        .applyBundle(
          wbtcBundle([
            { type: "MARKET::createCreditSuite", params: creditSuiteParams },
            {
              type: "MARKET::createCreditSuite",
              params: { ...creditSuiteParams, salt: "another-strategy" },
            },
          ]),
        )
        .preview(),
    ).rejects.toMatchObject({
      code: "AMBIGUOUS_TARGET",
      message: expect.stringContaining(
        "apply each strategy in a separate bundle",
      ),
    });
  });

  it("rejects an ambiguous target", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const twoManagers = marketState();
    twoManagers.creditManagers[CM2] = {
      ...twoManagers.creditManagers[CM],
      address: CM2,
      collateralTokens: {
        [USDC]: twoManagers.creditManagers[CM].collateralTokens[USDC],
      },
    };
    twoManagers.creditManagerDebtLimit[CM2] = 1;
    await expect(
      sdk
        .market({ initialState: twoManagers })
        .applyBundle(wbtcBundle())
        .preview(),
    ).rejects.toThrow(GipTargetResolutionError);
  });

  it("rejects a missing target", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    await expect(
      sdk
        .market({ initialState: marketState({ creditManagers: {} }) })
        .applyBundle(wbtcBundle())
        .preview(),
    ).rejects.toThrow(/has none/);
  });

  it("initializes new-market creation and then accepts a bundle", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const preview = await sdk
      .newMarket(newMarketParams)
      .applyBundle(
        wbtcBundle([
          { type: "MARKET::createCreditSuite", params: creditSuiteParams },
        ]),
      )
      .preview();

    expect(preview.stateProvenance).toBe("new-market");
    expect(preview.before).toBeUndefined();
    expect(preview.resolvedActions[0].type).toBe("MARKET::createMarket");
    expect(preview.pool).toBe(POOL);
    expect(preview.predictedDeployments).toEqual([
      expect.objectContaining({
        address: POOL,
        actionType: "MARKET::createMarket",
      }),
      expect.objectContaining({
        address: CM2,
        actionType: "MARKET::createCreditSuite",
      }),
    ]);
    expect(
      preview.after.creditManagers[CM2].collateralTokens[WBTC],
    ).toBeDefined();
  });

  it("requires a pool or an initial state for an existing market", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    // Deliberately neither: the types forbid it, the runtime guard rejects it.
    expect(() =>
      sdk.market({} as unknown as Parameters<typeof sdk.market>[0]),
    ).toThrow(/pool.*initialState/);
  });
});

describe("compilation cache", () => {
  it("captures a market operation before a later synchronous edit", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const market = sdk
      .market({ initialState: marketState() })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 5 } });

    const firstPending = market.preview();
    market.addAction({
      type: "POOL::setTokenLimit",
      params: { token: WETH, limit: 9 },
    });

    const first = await firstPending;
    const second = await market.preview();
    expect(first.resolvedActions).toHaveLength(1);
    expect(second.resolvedActions).toHaveLength(2);
  });

  it("captures build inputs before entering the plan queue", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const market = sdk
      .market({ initialState: marketState() })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 5 } });

    const firstPending = market.build({ author: AUTHOR, eta: ETA });
    market.addAction({
      type: "POOL::setTokenLimit",
      params: { token: WETH, limit: 9 },
    });

    const first = await firstPending;
    expect(first.resolvedActions).toHaveLength(1);
    expect(first.payloadCalls).toHaveLength(1);
  });

  it("shares one compilation per revision and invalidates on new intent", async () => {
    const { sdk, client } = await createTestSdk({ marketSuite: null });
    const market = sdk
      .market({ initialState: marketState() })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 5 } });

    const [a, b] = await Promise.all([market.preview(), market.preview()]);
    expect(a).toBe(b);
    const callsAfterFirst = client.calls.length;

    expect(await market.preview()).toBe(a);
    expect(client.calls.length).toBe(callsAfterFirst);

    market.addAction({
      type: "POOL::setTokenLimit",
      params: { token: WETH, limit: 9 },
    });
    const c = await market.preview();
    expect(c).not.toBe(a);
    expect(c.resolvedActions).toHaveLength(2);
  });

  it("caches token decimals across compilations", async () => {
    const { sdk, client } = await createTestSdk({ marketSuite: null });
    const market = sdk.market({ initialState: marketState() }).addAction({
      type: "POOL::setTokenLimit",
      params: { token: WETH, limit: 1 },
    });
    await market.preview();
    market.addAction({
      type: "POOL::setTokenLimit",
      params: { token: WETH, limit: 2 },
    });
    await market.preview();
    const decimalsMulticalls = client.calls.filter(
      call => call.kind === "multicall" && call.functions.includes("decimals"),
    );
    // The stub SDK's token registry answers both, so no on-chain read is needed.
    expect(decimalsMulticalls).toHaveLength(0);
  });

  it("falls back to an on-chain read for tokens the registry does not know", async () => {
    const unknown: Address = "0x00000000000000000000000000000000000000ff";
    const { sdk } = await createTestSdk({
      marketSuite: null,
      stub: {
        multicall: contract =>
          contract.functionName === "decimals" &&
          contract.address?.toLowerCase() === unknown
            ? { status: "success", result: 12 }
            : undefined,
      },
    });
    const state = marketState();
    state.assets[unknown] = {
      address: unknown,
      quotaLimit: 1,
      quotaIncreaseFee: 0,
      mainPriceFeed: FEED_WBTC,
      reservePriceFeed: zeroAddress,
    };
    const preview = await sdk
      .market({ initialState: state })
      .addAction({
        type: "POOL::setTokenLimit",
        params: { token: unknown, limit: 3 },
      })
      .preview();
    expect(preview.tokenDecimals[unknown]).toBe(12);
  });

  it("evicts a rejected address prediction so a retry can succeed", async () => {
    let predictionAttempts = 0;
    const { sdk } = await createTestSdk({
      marketSuite: null,
      stub: {
        readContract: ({ functionName }) => {
          if (functionName !== "previewCreateCreditSuite") return undefined;
          predictionAttempts += 1;
          if (predictionAttempts === 1)
            throw new Error("transient prediction RPC failure");
          return CM2;
        },
      },
    });
    const market = sdk
      .market({ initialState: marketState({ creditManagers: {} }) })
      .applyBundle(
        wbtcBundle([
          { type: "MARKET::createCreditSuite", params: creditSuiteParams },
        ]),
      );

    await expect(market.preview()).rejects.toThrow(/transient prediction/);
    const preview = await market.preview();
    expect(preview.bundles[0].targetCreditManager).toBe(CM2);
    expect(predictionAttempts).toBeGreaterThanOrEqual(2);
  });
});

describe("plan output", () => {
  it("separates payload calls from governor queue and execute wrappers", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const plan = await sdk
      .market({ initialState: marketState() })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 2_000 } })
      .addAction({
        type: "POOL::setTokenLimit",
        params: { token: WETH, limit: 42 },
      })
      .build({ author: AUTHOR, eta: ETA });

    expect(plan.scope).toBe("market");
    expect(plan.planVersion).toBe(1);
    expect(plan.source).toMatchObject({
      chainId: 1,
      marketConfigurator: CONFIGURATOR,
      blockNumber: SOURCE_BLOCK,
      blockHash: SOURCE_BLOCK_HASH,
      blockTimestamp: SOURCE_TIMESTAMP,
    });
    expect(plan.author).toBe(AUTHOR.toLowerCase());
    expect(plan.eta).toBe(ETA);

    expect(plan.payloadCalls).toHaveLength(2);
    for (const call of plan.payloadCalls) {
      expect(call.to.toLowerCase()).toBe(CONFIGURATOR);
    }
    expect(plan.payloadCallHashes).toHaveLength(2);
    expect(new Set(plan.payloadCallHashes).size).toBe(2);

    expect(plan.batches).toHaveLength(1);
    expect(plan.batches[0].txs).toHaveLength(2);

    const queueBatch = plan.timelockTxs.queueBatches[0];
    expect(queueBatch[0].contractMethod.name).toBe("startBatch");
    expect(queueBatch.slice(1).map(tx => tx.contractMethod.name)).toEqual([
      "queueTransaction",
      "queueTransaction",
    ]);
    for (const tx of queueBatch) {
      expect(tx.to.toLowerCase()).toBe(GOVERNOR);
    }
    // Governor wrappers are separate from the payload they wrap.
    expect(plan.executeBatchSafeTxs).toHaveLength(1);
    expect(plan.executeBatchSafeTxs[0].contractMethod.name).toBe(
      "executeBatch",
    );
    expect(plan.executeBatchTxs).toHaveLength(1);
    expect(plan.executeBatchTxs[0].to.toLowerCase()).toBe(GOVERNOR);
    expect(
      plan.payloadCalls.some(
        call => call.callData === plan.executeBatchTxs[0].callData,
      ),
    ).toBe(false);
  });

  it("does not present heuristic gas as a measurement", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const plan = await sdk
      .market({ initialState: marketState() })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 2_000 } })
      .build({ author: AUTHOR, eta: ETA });
    expect(plan.gas.isActualMeasurement).toBe(false);
    expect(plan.gas.model).toBe("heuristic-action-table");
    expect(plan.gas.total).toBe(plan.gas.perBatch[0]);
    expect(plan.gas.total).toBeGreaterThan(0);
  });

  it("reports feed dependencies per batch", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const plan = await sdk
      .market({ initialState: marketState() })
      .addAction({
        type: "ORACLE::setPriceFeed",
        params: { token: WETH, priceFeed: FEED_WBTC },
      })
      .build({ author: AUTHOR, eta: ETA });
    expect(plan.feedDependencies.all).toEqual([FEED_WBTC]);
    expect(plan.feedDependencies.perBatch).toEqual([[FEED_WBTC]]);
    // The stub price feed tree has no Redstone feeds, so nothing is updatable.
    expect(plan.feedDependencies.updatablePerBatch).toEqual([[]]);
  });

  it("carries the preview's incomplete checks, bundles and diagnostics into the plan", async () => {
    const { sdk } = await createTestSdk();
    const market = sdk.market({ initialState: marketState() }).applyBundle({
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
          params: { peripheryContract: FEED_WBTC, domain: "ZAPPER", type: 42 },
        },
      ],
      // Deliberately malformed, and without a `warning`.
    } as unknown as Bundle);
    const preview = await market.preview();
    const plan = await market.build({ author: AUTHOR, eta: ETA });

    // A consumer that only ever sees build() output must still be able to tell
    // "checked, nothing found" from "not checked".
    expect(plan.incompleteChecks).toEqual(preview.incompleteChecks);
    expect(plan.incompleteChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "bundleActionParams:loud bundle" }),
      ]),
    );
    expect(plan.bundles).toEqual(preview.bundles);
    expect(plan.bundles[0].paramWarnings?.join(" ")).toMatch(/type/);
    expect(plan.diagnostics).toEqual(preview.diagnostics);

    // A market plan serializes back into a market plan.
    const restored = deserializeGipPlan(
      serializeGipPlan(plan),
    ) as MarketGipPlan;
    expect(restored.incompleteChecks).toEqual(plan.incompleteChecks);
    expect(restored.bundles).toEqual(plan.bundles);
    expect(restored.diagnostics).toEqual(plan.diagnostics);
    expect(typeof restored.source.blockNumber).toBe("bigint");
  });

  it("carries the configurator shutdown caveat into a configurator plan", async () => {
    const { sdk } = await createTestSdk();
    const config = sdk.configurator().addAction({
      type: "CONFIGURATOR::setEmergencyAdmin",
      params: { emergencyAdmin: CM },
    });
    const preview = await config.preview();
    const plan = await config.build({ author: AUTHOR, eta: ETA });
    expect(plan.incompleteChecks).toEqual(preview.incompleteChecks);
    expect(plan.incompleteChecks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ check: "configuratorState.shutdown" }),
      ]),
    );
  });

  it("zeroes the distributed amount in a configurator plan", async () => {
    const { sdk } = await createTestSdk();
    const initial = configuratorState({
      treasury: {
        ...configuratorState().treasury,
        balances: {
          [USDC]: { available: 1_000, insuranceAmount: 50 },
          [WETH]: { available: 0, insuranceAmount: 0 },
        },
      },
    });
    const config = sdk.configurator({ initialState: initial });
    const plan = await config
      .addAction({
        type: "TREASURY_SPLITTER::distribute",
        params: { token: USDC },
      })
      .build({ author: AUTHOR, eta: ETA });
    expect(plan.scope).toBe("configurator");
    expect(plan.after.treasury.balances?.[USDC]).toEqual({
      available: 0,
      insuranceAmount: 50,
    });
    expect(plan.payloadCalls[0].to.toLowerCase()).toBe(TREASURY);

    // Nothing left to distribute: the call would do nothing.
    const empty = await sdk
      .configurator({ initialState: initial })
      .addAction({
        type: "TREASURY_SPLITTER::distribute",
        params: { token: WETH },
      })
      .preview();
    expect(empty.actionDiagnostics[0]).toMatchObject({ code: "NO_OP" });

    // A token the state does not track is distributed with a warning.
    const untracked = await sdk
      .configurator({ initialState: initial })
      .addAction({
        type: "TREASURY_SPLITTER::distribute",
        params: { token: WBTC },
      })
      .preview();
    expect(untracked.blockedAt).toBeUndefined();
    expect(untracked.actionDiagnostics[0]).toMatchObject({
      severity: "warning",
      code: "TOKEN_NOT_TRACKED",
    });
  });

  it("resolves configurator actions once per SDK", async () => {
    const { sdk, client } = await createTestSdk();
    const distribute = (state: ConfiguratorState) =>
      sdk
        .configurator({ initialState: state })
        .addAction({
          type: "TREASURY_SPLITTER::distribute",
          params: { token: USDC },
        })
        .preview();
    const initial = configuratorState({
      treasury: {
        ...configuratorState().treasury,
        balances: { [USDC]: { available: 1_000, insuranceAmount: 0 } },
      },
    });

    await distribute(initial);
    const reads = client.calls.length;
    expect(reads).toBeGreaterThan(0);
    // Another builder of the same SDK finds the treasury splitter cached.
    await distribute(initial);
    expect(client.calls.length).toBe(reads);
  });

  it("round-trips through versioned serialization, keeping bigints", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const plan = await sdk
      .market({ initialState: marketState() })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 2_000 } })
      .build({ author: AUTHOR, eta: ETA });
    const restored = deserializeGipPlan(serializeGipPlan(plan));
    expect(restored.source.blockNumber).toBe(SOURCE_BLOCK);
    expect(typeof restored.source.blockNumber).toBe("bigint");
    expect(restored.payloadCalls).toEqual(plan.payloadCalls);
    expect(() =>
      deserializeGipPlan('{"serializationVersion":99,"plan":{}}'),
    ).toThrow(/Unsupported GIP plan serialization version/);
  });

  it("reuses one plan per author/eta and rebuilds for another", async () => {
    const { sdk } = await createTestSdk({ marketSuite: null });
    const market = sdk
      .market({ initialState: marketState() })
      .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 2_000 } });
    const a = await market.build({ author: AUTHOR, eta: ETA });
    expect(await market.build({ author: AUTHOR, eta: ETA })).toBe(a);
    const b = await market.build({ author: AUTHOR, eta: ETA + 1 });
    expect(b).not.toBe(a);
    expect(b.payloadCallHashes).not.toEqual(a.payloadCallHashes);
  });
});
