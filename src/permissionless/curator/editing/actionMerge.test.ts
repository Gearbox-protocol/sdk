import {
  type Address,
  type Chain,
  type PublicClient,
  type Transport,
  zeroAddress,
} from "viem";
import { describe, expect, it } from "vitest";
import { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import type { AddCollateralTokenAction } from "../actions/addCollateralTokenActionData.js";
import type { AddPeripheryContractAction } from "../actions/addPeripheryContractActionData.js";
import type { GipBuilderContext } from "../actions/builderContext.js";
import type { CreateCreditSuiteAction } from "../actions/createCreditSuiteActionData.js";
import { BUNDLE_TARGET } from "../actions/creditManagerTargets.js";
import type { DeployContractAction } from "../actions/deployContractActionData.js";
import type { ForbidTokenAction } from "../actions/forbidTokenActionData.js";
import type { PausePoolAction } from "../actions/pausePoolActionData.js";
import type { RampLiquidationThresholdAction } from "../actions/rampLiquidationThresholdActionData.js";
import type { SetTotalDebtLimitAction } from "../actions/setTotalDebtLimitActionData.js";
import type { GipMarketAction } from "../actions/types.js";
import { applyBundle } from "../bundles/applyBundle.js";
import type { Bundle } from "../bundles/Bundle.js";
import { MarketExecutor } from "../executor/MarketExecutor.js";
import type { SetPoolBatchStatusAction } from "../plugins/adapters/uniswap-v3/setPoolBatchStatusActionData.js";
import type { UniswapV3AdapterState } from "../plugins/adapters/uniswap-v3/uniswapV3Plugin.js";
import type { MarketState } from "../state/market/types.js";
import { copyCmActionsForMarket } from "./actionListOperations.js";
import { addMarketAction, addMarketActions } from "./addAction.js";

const POOL: Address = "0x1111111111111111111111111111111111111111";
const CM: Address = "0x2222222222222222222222222222222222222222";
const NEW_CM: Address = "0x2222222222222222222222222222222222222223";
const CONFIGURATOR: Address = "0x3333333333333333333333333333333333333333";
const USDC: Address = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const WETH: Address = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const WBTC: Address = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const FEED: Address = "0x5555555555555555555555555555555555555555";
const ROUTER: Address = "0x6666666666666666666666666666666666666666";
const ADAPTER: Address = "0x7777777777777777777777777777777777777777";
const DEGEN_NFT: Address = "0x8888888888888888888888888888888888888888";
const NOW = 1_800_000_000;

function context(): GipBuilderContext {
  // Only the members the executor reaches.
  const client = {
    chain: { id: 1 },
    readContract: async ({ functionName }: { functionName: string }) => {
      if (functionName === "previewCreateCreditSuite") return NEW_CM;
      if (functionName === "addressProvider") return CONFIGURATOR;
      throw new Error(`Unexpected RPC ${functionName}`);
    },
  } as unknown as PublicClient<Transport, Chain>;
  return {
    client,
    marketConfigurator: new MarketConfiguratorContract(CONFIGURATOR, client),
    tokens: { decimals: token => (token.toLowerCase() === USDC ? 6 : 18) },
  };
}

function marketState(): MarketState {
  return {
    minorVersion: 310,
    address: POOL,
    symbol: "dUSDC",
    name: "Diesel USDC",
    underlyingAsset: USDC,
    underlyingPriceFeed: zeroAddress,
    totalDebtLimit: "Unlimited",
    creditManagerDebtLimit: {},
    assets: {
      [WETH]: {
        address: WETH,
        quotaLimit: 0,
        quotaIncreaseFee: 0,
        mainPriceFeed: FEED,
        reservePriceFeed: zeroAddress,
      },
    },
    creditManagers: {
      [CM]: {
        address: CM,
        name: "USDC suite",
        isExpired: false,
        expirable: false,
        expirationDate: 0,
        feeInterest: 10,
        feeLiquidation: 1.5,
        feeLiquidationExpired: 1,
        feeLiquidationPremium: 2,
        feeLiquidationPremiumExpired: 1,
        maxEnabledTokens: 4,
        collateralTokens: {
          [USDC]: {
            liquidationThresholdFinal: 96.5,
            rampStart: 0,
            rampDuration: 0,
            isForbidden: false,
          },
          [WETH]: {
            liquidationThresholdFinal: 85,
            rampStart: 0,
            rampDuration: 0,
            isForbidden: false,
          },
        },
        adapters: {
          [ROUTER]: {
            type: "UNISWAP_V3_ROUTER",
            version: 310,
            target: ROUTER,
            adapter: ADAPTER,
            isForbidden: false,
            pools: [],
          },
        },
        degenNFT: zeroAddress,
        minDebt: 1_000,
        maxDebt: 100_000,
        maxDebtPerBlockMultiplier: 2,
        paused: false,
      },
    },
    treasury: { address: CONFIGURATOR, type: "TREASURY", balances: {} },
    rateKeeper: { type: "TUMBLER", epochSeconds: 0, rates: { [WETH]: 1 } },
    lossPolicy: { type: "ALIAS", enabled: true, aliases: {}, mode: 0 },
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
    paused: false,
    periphery: [],
  };
}

const execute = (actions: readonly GipMarketAction[]) =>
  new MarketExecutor(context(), { timestamp: NOW }).execute(
    marketState(),
    actions,
  );

const suite = (
  params: Partial<CreateCreditSuiteAction["params"]> = {},
): CreateCreditSuiteAction => ({
  type: "MARKET::createCreditSuite",
  params: {
    name: "New suite",
    minorVersion: 310,
    feeInterest: 10,
    feeLiquidation: 1.5,
    feeLiquidationExpired: 1,
    feeLiquidationPremium: 2,
    feeLiquidationPremiumExpired: 1,
    minDebt: 1_000,
    maxDebt: 20_000,
    maxEnabledTokens: 4,
    whitelistPolicy: zeroAddress,
    accountFactoryType: "DEFAULT",
    isExpired: false,
    expirationDate: 0,
    ...params,
  },
});

const pools = (
  ...entries: [token1: Address, allowed: boolean][]
): SetPoolBatchStatusAction => ({
  type: "ADAPTER::UNISWAP_V3_ROUTER::setPoolBatchStatus",
  params: {
    creditManager: CM,
    version: 310,
    target: ROUTER,
    pools: entries.map(([token1, allowed]) => ({
      token0: WETH,
      token1,
      fee: 500,
      allowed,
    })),
  },
});

describe("merging by key", () => {
  it("merges a setter in place and moves a must-come-last action to the end", () => {
    const forbid: ForbidTokenAction = {
      type: "CREDIT::forbidToken",
      params: { creditManager: CM, token: WETH },
    };
    const limit = (value: number): SetTotalDebtLimitAction => ({
      type: "POOL::setTotalDebtLimit",
      params: { limit: value },
    });
    const pause: PausePoolAction = { type: "POOL::pause", params: {} };

    expect(
      addMarketActions([], [limit(1), forbid, pause, limit(2), forbid]),
    ).toEqual([limit(2), pause, forbid]);
  });

  it("merges adapter batches item by item instead of dropping the earlier one", () => {
    const merged = addMarketActions(
      [],
      [pools([USDC, true], [WBTC, true]), pools([WBTC, false])],
    );
    expect(merged).toHaveLength(1);
    expect(merged[0].params.pools).toEqual([
      { token0: WETH, token1: USDC, fee: 500, allowed: true },
      { token0: WETH, token1: WBTC, fee: 500, allowed: false },
    ]);
  });

  it("keeps each pool once in the adapter state, with its latest status", async () => {
    const result = await execute([
      pools([USDC, true]),
      { type: "POOL::pause", params: {} },
      pools([USDC, false], [WBTC, true]),
    ]);
    expect(result.blockedAt).toBeUndefined();
    const adapter = result.after.creditManagers[CM].adapters[
      ROUTER
    ] as UniswapV3AdapterState;
    expect(adapter.pools).toEqual([
      { token0: WETH, token1: USDC, fee: 500, allowed: false },
      { token0: WETH, token1: WBTC, fee: 500, allowed: true },
    ]);
  });

  it("flags batches that change nothing", async () => {
    const same = await execute([pools([USDC, true]), pools([USDC, true])]);
    expect(same.diagnostics).toEqual([
      expect.objectContaining({ code: "NO_OP", actionIndex: 1 }),
    ]);

    const partly = await execute([
      pools([USDC, true]),
      pools([USDC, true], [WBTC, true]),
    ]);
    expect(partly.blockedAt).toBeUndefined();
    expect(partly.diagnostics).toEqual([
      expect.objectContaining({ code: "ITEMS_UNCHANGED", severity: "warning" }),
    ]);
  });
});

describe("placement by dependencies", () => {
  it("registers a Degen NFT before the credit suite that uses it", () => {
    const whitelisted = suite({ whitelistPolicy: DEGEN_NFT });
    const registration: AddPeripheryContractAction = {
      type: "MARKET::addPeripheryContract",
      params: { peripheryContract: DEGEN_NFT, domain: "DEGEN_NFT", type: "" },
    };
    const pause: PausePoolAction = { type: "POOL::pause", params: {} };
    expect(addMarketActions([], [pause, whitelisted, registration])).toEqual([
      pause,
      registration,
      whitelisted,
    ]);
  });

  it("deploys a contract before the action that registers it", () => {
    const registration: AddPeripheryContractAction = {
      type: "MARKET::addPeripheryContract",
      params: { peripheryContract: ROUTER, domain: "ZAPPER", type: "" },
    };
    const deployment: DeployContractAction = {
      type: "BCR::deployContract",
      params: {
        contractType: "ZAPPER::ERC4626_UNDERLYING",
        version: 310,
        constructorParams: "0x",
        salt: `0x${"00".repeat(32)}`,
        expectedAddress: ROUTER,
      },
    };
    expect(
      addMarketAction<GipMarketAction>([registration], deployment),
    ).toEqual([deployment, registration]);
  });
});

describe("credit suite references", () => {
  it("resolves suite:<id> to the suite's predicted address", async () => {
    const result = await execute([
      suite({ id: "strategy" }),
      { type: "MARKET::addAsset", params: { token: WBTC, priceFeed: FEED } },
      {
        type: "CREDIT::addCollateralToken",
        params: {
          creditManager: "suite:strategy",
          token: WBTC,
          liquidationThreshold: 80,
        },
      },
    ]);
    expect(result.blockedAt).toBeUndefined();
    expect(result.creditSuites).toEqual({ strategy: NEW_CM });
    expect(
      (result.resolvedActions[2] as AddCollateralTokenAction).params
        .creditManager,
    ).toBe(NEW_CM);
    expect(
      result.after.creditManagers[NEW_CM].collateralTokens[WBTC]
        .liquidationThresholdFinal,
    ).toBe(80);
  });

  it("reports a reference to a suite nothing deploys", async () => {
    const result = await execute([
      { type: "CREDIT::pause", params: { creditManager: "suite:missing" } },
    ]);
    expect(result.blockedAt).toBe(0);
    expect(result.diagnostics[0]).toMatchObject({
      code: "UNKNOWN_CREDIT_SUITE",
    });
  });

  it("binds a bundle without a target to the suite it deploys", () => {
    const bundle: Bundle = {
      name: "WBTC strategy",
      tokenIn: [USDC],
      tokenOut: [WBTC],
      enabledTokens: 2,
      warning: undefined,
      actions: [
        { type: "MARKET::addAsset", params: { token: WBTC, priceFeed: FEED } },
        suite(),
        {
          type: "CREDIT::addCollateralToken",
          // the catalog spelling of the bundle's credit manager
          params: {
            creditManager: zeroAddress,
            token: WBTC,
            liquidationThreshold: 80,
          },
        },
      ],
    };
    const once = applyBundle({
      actions: [],
      currentState: marketState(),
      bundle,
    });
    expect((once[1] as CreateCreditSuiteAction).params.id).toBe(
      "bundle:WBTC strategy",
    );
    expect((once[2] as AddCollateralTokenAction).params.creditManager).toBe(
      "suite:bundle:WBTC strategy",
    );

    // Applying it again merges into the same suite instead of adding one.
    const twice = applyBundle({
      actions: once,
      currentState: marketState(),
      bundle,
    });
    expect(twice).toEqual(once);
  });

  it("leaves an unbound placeholder when a bundle deploys no suite", () => {
    const [action] = applyBundle({
      actions: [],
      currentState: marketState(),
      bundle: {
        name: "LT only",
        tokenIn: [],
        tokenOut: [],
        enabledTokens: 1,
        warning: undefined,
        actions: [
          {
            type: "CREDIT::rampLiquidationThreshold",
            params: {
              creditManager: zeroAddress,
              token: WETH,
              liquidationThresholdFinal: 80,
              rampStart: NOW,
              rampDuration: 172_800,
            },
          },
        ],
      },
    });
    expect(
      (action as RampLiquidationThresholdAction).params.creditManager,
    ).toBe(BUNDLE_TARGET);
  });

  it("gives a copied suite its own id", () => {
    const copied = copyCmActionsForMarket({
      actions: [
        suite({ id: "s" }),
        { type: "CREDIT::pause", params: { creditManager: "suite:s" } },
      ],
      index: 0,
      name: "Copy",
      oldCm: "suite:s",
      newCm: "suite:s#Copy",
    });
    expect(
      copied.map(action => {
        // A suite carries an id, every other action here a credit manager.
        const params = action.params as { id?: string; creditManager?: string };
        return params.id ?? params.creditManager;
      }),
    ).toEqual(["s", "suite:s", "s#Copy", "suite:s#Copy"]);
  });
});
