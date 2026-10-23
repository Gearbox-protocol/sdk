import {
  type Address,
  type Chain,
  decodeAbiParameters,
  decodeFunctionData,
  type Hex,
  type PublicClient,
  type Transport,
  zeroAddress,
} from "viem";
import { describe, expect, it } from "vitest";
import { iCreditConfigureActionsAbi } from "../../../abi/310/configure/iCreditConfigureActions.js";
import type { RawTx } from "../../../onchain/types/transactions.js";
import { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import { convertPercent } from "../../utils/format.js";
import { MarketExecutor } from "../executor/MarketExecutor.js";
import { ResolveCache } from "../executor/ResolveCache.js";
import { GipRegistry } from "../GipRegistry.js";
import { parseMarketScopedAction } from "../session/actionScope.js";
import type {
  MarketCreditManagerState,
  MarketState,
} from "../state/market/types.js";
import { batchMarketTransactions } from "../transactions/batchMarketTransactions.js";
import type { ParsedMarketTx } from "../types.js";
import { numberToDecimalString } from "../utils/numberToDecimalString.js";
import type { GipBuilderContext } from "./builderContext.js";
import type { CreateCreditSuiteAction } from "./createCreditSuiteActionData.js";
import type { SetFeesAction } from "./setFeesActionData.js";

const POOL: Address = "0x1111111111111111111111111111111111111111";
const CM: Address = "0x2222222222222222222222222222222222222222";
const CONFIGURATOR: Address = "0x3333333333333333333333333333333333333333";
const USDC: Address = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const WETH: Address = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";

/** Percentages whose `x * 100` is just below the integer in floating point. **/
const FLOOR_TRAPS: [percent: number, bps: number][] = [
  [0.29, 29],
  [1.15, 115],
  [4.35, 435],
  [8.2, 820],
];

/** The members of the viem client the executor reaches here. **/
interface StubReadClient {
  chain: { id: number };
  readContract: (args: { functionName: string }) => Promise<unknown>;
}

function context(): GipBuilderContext {
  const stub: StubReadClient = {
    chain: { id: 1 },
    readContract: async ({ functionName }) => {
      if (functionName === "previewCreateCreditSuite") return CM;
      if (functionName === "addressProvider") return CONFIGURATOR;
      throw new Error(`Unexpected RPC ${functionName}`);
    },
  };
  const client = stub as unknown as PublicClient<Transport, Chain>;
  return {
    client,
    marketConfigurator: new MarketConfiguratorContract(CONFIGURATOR, client),
    tokens: { decimals: token => (token.toLowerCase() === USDC ? 6 : 18) },
  };
}

function marketState({
  creditManagers = {},
}: {
  creditManagers?: MarketState["creditManagers"];
} = {}): MarketState {
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
        mainPriceFeed: zeroAddress,
        reservePriceFeed: zeroAddress,
      },
    },
    creditManagers,
    treasury: { address: CONFIGURATOR, type: "TREASURY", balances: {} },
    rateKeeper: { type: "TUMBLER", epochSeconds: 0, rates: {} },
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

function creditManagerState(): MarketCreditManagerState {
  return {
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
    },
    adapters: {},
    degenNFT: zeroAddress,
    minDebt: 1_000,
    maxDebt: 100_000,
    maxDebtPerBlockMultiplier: 2,
    paused: false,
  };
}

/** The forwarded `ICreditConfigureActions` call of a `configureCreditManager` tx. **/
function forwardedCreditCall(ctx: GipBuilderContext, callData: Hex) {
  const outer = decodeFunctionData({
    abi: ctx.marketConfigurator.abi,
    data: callData,
  });
  expect(outer.functionName).toBe("configureCreditSuite");
  if (outer.functionName !== "configureCreditSuite") {
    throw new Error(`unexpected ${outer.functionName}`);
  }
  return decodeFunctionData({
    abi: iCreditConfigureActionsAbi,
    data: outer.args[1],
  });
}

/** The suite parameters `MarketConfigurator.createCreditSuite` receives. **/
function creditSuiteParams(ctx: GipBuilderContext, callData: Hex) {
  const outer = decodeFunctionData({
    abi: ctx.marketConfigurator.abi,
    data: callData,
  });
  expect(outer.functionName).toBe("createCreditSuite");
  if (outer.functionName !== "createCreditSuite") {
    throw new Error(`unexpected ${outer.functionName}`);
  }
  const [manager] = decodeAbiParameters(
    [
      {
        type: "tuple",
        components: [
          { type: "uint8", name: "maxEnabledTokens" },
          { type: "uint16", name: "feeInterest" },
          { type: "uint16", name: "feeLiquidation" },
          { type: "uint16", name: "liquidationPremium" },
          { type: "uint16", name: "feeLiquidationExpired" },
          { type: "uint16", name: "liquidationPremiumExpired" },
          { type: "uint128", name: "minDebt" },
          { type: "uint128", name: "maxDebt" },
          { type: "string", name: "name" },
          {
            type: "tuple",
            name: "accountFactoryParams",
            components: [
              { type: "bytes32", name: "postfix" },
              { type: "bytes32", name: "salt" },
              { type: "bytes", name: "constructorParams" },
            ],
          },
        ],
      },
      {
        type: "tuple",
        components: [
          { type: "address", name: "degenNFT" },
          { type: "bool", name: "isExpirable" },
          { type: "bool", name: "migrateBotList" },
        ],
      },
    ],
    outer.args[2],
  );
  return manager;
}

describe("unit conversions", () => {
  it("rounds percentages to basis points instead of truncating them", () => {
    for (const [percent, bps] of FLOOR_TRAPS) {
      expect(Math.floor(percent * 100)).toBe(bps - 1);
      expect(convertPercent(percent)).toBe(bps);
    }
  });

  it("hands the SDK a percentage its truncation encodes as the rounded bps", () => {
    // `sdkPercent` is gone: the SDK's own `convertPercent` rounds now, so a
    // percentage of whole basis points is handed over as it is.
    for (let bps = 0; bps <= 10_000; bps++) {
      expect(convertPercent(bps / 100)).toBe(bps);
    }
  });

  it("writes amounts in plain decimal notation", () => {
    expect(numberToDecimalString(1e21)).toBe("1000000000000000000000");
    expect(numberToDecimalString(1.25e-7)).toBe("0.000000125");
    expect(numberToDecimalString(50_000)).toBe("50000");
    expect(numberToDecimalString(0.1)).toBe("0.1");
    expect(() => numberToDecimalString(Number.NaN)).toThrow();
  });
});

describe("action encoding", () => {
  it("encodes collateral liquidation thresholds in rounded basis points", async () => {
    const ctx = context();
    for (const [percent, bps] of FLOOR_TRAPS) {
      const { txs } = await new MarketExecutor(ctx).executeBatch(
        marketState({ creditManagers: { [CM]: creditManagerState() } }),
        [
          {
            type: "CREDIT::addCollateralToken",
            params: {
              creditManager: CM,
              token: WETH,
              liquidationThreshold: percent,
            },
          },
        ],
      );
      const call = forwardedCreditCall(ctx, txs[0].tx.callData);
      expect(call.functionName).toBe("addCollateralToken");
      if (call.functionName !== "addCollateralToken") {
        throw new Error(`unexpected ${call.functionName}`);
      }
      expect(call.args[1]).toBe(bps);
    }
  });

  it("encodes credit suite fees in rounded basis points", async () => {
    const ctx = context();
    const { txs } = await new MarketExecutor(ctx).executeBatch(marketState(), [
      {
        type: "MARKET::createCreditSuite",
        params: {
          name: "USDC suite",
          minorVersion: 310,
          feeInterest: 8.2,
          feeLiquidation: 1.15,
          feeLiquidationExpired: 1.15,
          feeLiquidationPremium: 4.35,
          feeLiquidationPremiumExpired: 4.35,
          minDebt: 1_000,
          maxDebt: 20_000,
          maxEnabledTokens: 4,
          whitelistPolicy: zeroAddress,
          accountFactoryType: "DEFAULT",
          isExpired: false,
          expirationDate: 0,
        },
      },
    ]);
    const params = creditSuiteParams(ctx, txs[0].tx.callData);
    expect(params.feeInterest).toBe(820);
    expect(params.feeLiquidation).toBe(115);
    expect(params.feeLiquidationExpired).toBe(115);
    expect(params.liquidationPremium).toBe(435);
    expect(params.liquidationPremiumExpired).toBe(435);
    expect(params.minDebt).toBe(1_000_000_000n);
  });

  it("derives a new suite's expiry from the executor timestamp, not the wall clock", async () => {
    const ctx = context();
    const params: CreateCreditSuiteAction["params"] = {
      name: "Expiring suite",
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
      isExpired: true,
      expirationDate: 1_800_000_000,
    };
    const run = (timestamp: number) =>
      new MarketExecutor(ctx, { timestamp }).executeBatch(marketState(), [
        { type: "MARKET::createCreditSuite", params },
      ]);
    expect((await run(1_700_000_000)).after.creditManagers[CM].isExpired).toBe(
      false,
    );
    expect((await run(1_900_000_000)).after.creditManagers[CM].isExpired).toBe(
      true,
    );
  });
});

describe("parameter bounds", () => {
  const rejects = (type: string, params: unknown) =>
    expect(() => parseMarketScopedAction({ type, params })).toThrow();

  it("rejects values that do not fit the encoded integer type", () => {
    rejects("RATE_KEEPER::TUMBLER::setRate", { token: WETH, rate: 1.5 });
    rejects("RATE_KEEPER::TUMBLER::setRate", { token: WETH, rate: 70_000 });
    rejects("CREDIT::setMaxDebtPerBlockMultiplier", {
      creditManager: CM,
      maxDebtPerBlockMultiplier: 256,
    });
    rejects("CREDIT::rampLiquidationThreshold", {
      creditManager: CM,
      token: WETH,
      liquidationThresholdFinal: 80,
      rampStart: 1_700_000_000.5,
      rampDuration: 172_800,
    });
    rejects("POOL::setTotalDebtLimit", { limit: -1 });
  });

  it("rejects liquidation fees the credit configurator would revert on", () => {
    rejects("CREDIT::setFees", {
      creditManager: CM,
      params: {
        feeLiquidation: 3,
        feeLiquidationPremium: 2,
        feeLiquidationExpired: 1,
        feeLiquidationPremiumExpired: 1,
      },
    });
    expect(
      (
        parseMarketScopedAction({
          type: "CREDIT::setFees",
          params: {
            creditManager: CM,
            params: {
              feeLiquidation: 1.5,
              feeLiquidationPremium: 2,
              feeLiquidationExpired: 1,
              feeLiquidationPremiumExpired: 1,
            },
          },
        }) as SetFeesAction
      ).params.params.feeLiquidation,
    ).toBe(1.5);
  });
});

describe("action definitions", () => {
  it("declare scope and gas for every registered type", () => {
    for (const definition of GipRegistry.builtin.marketActions) {
      expect(definition.scope).toBe("market");
      expect(typeof definition.gas).toBe("function");
    }
  });

  it("report every touched price feed of a batch", () => {
    const tx = (
      feeds: Address[],
    ): Pick<ParsedMarketTx, "tx" | "estimatedGas" | "touchedFeeds"> => ({
      // Only the fields batching reads.
      tx: { to: POOL, callData: "0x", value: "0" } as unknown as RawTx,
      estimatedGas: 100_000,
      touchedFeeds: feeds,
    });
    const [batch] = batchMarketTransactions({
      chainId: 1,
      txs: [tx([USDC, WETH]), tx([WETH])],
    });
    expect(batch.touchedFeeds).toEqual([USDC, WETH]);
  });
});

describe("resolve / apply / encode", () => {
  const suiteParams: CreateCreditSuiteAction["params"] = {
    name: "USDC suite",
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
  };

  function countingContext() {
    const reads: string[] = [];
    const ctx = context();
    const client = ctx.client as unknown as StubReadClient;
    const readContract = client.readContract;
    client.readContract = async args => {
      reads.push(args.functionName);
      return readContract(args);
    };
    return { ctx, reads };
  }

  it("replays through a shared resolve cache without reading the chain again", async () => {
    const { ctx, reads } = countingContext();
    const resolveCache = new ResolveCache();
    const actions: CreateCreditSuiteAction[] = [
      { type: "MARKET::createCreditSuite", params: suiteParams },
    ];

    const projected = await new MarketExecutor(ctx, { resolveCache }).project(
      marketState(),
      actions,
    );
    const readsAfterProjection = reads.length;
    expect(readsAfterProjection).toBeGreaterThan(0);

    const executed = await new MarketExecutor(ctx, {
      resolveCache,
    }).executeBatch(marketState(), actions);
    expect(reads).toHaveLength(readsAfterProjection);
    expect(executed.after).toEqual(projected.after);
    expect(executed.txs[0].newContract).toBe(CM);
  });

  it("keys resolutions by params, so a changed action resolves again", async () => {
    const { ctx, reads } = countingContext();
    const resolveCache = new ResolveCache();
    const run = (params: CreateCreditSuiteAction["params"]) =>
      new MarketExecutor(ctx, { resolveCache }).project(marketState(), [
        { type: "MARKET::createCreditSuite", params },
      ]);
    await run(suiteParams);
    const once = reads.length;
    await run({ ...suiteParams, maxDebt: 30_000 });
    expect(reads.length).toBe(once * 2);
  });

  it("does not keep a failed resolution", async () => {
    const cache = new ResolveCache();
    let calls = 0;
    const failing = () => {
      calls += 1;
      return Promise.reject(new Error("rpc down"));
    };
    await expect(cache.run({ key: 1 }, failing)).rejects.toThrow("rpc down");
    await expect(cache.run({ key: 1 }, failing)).rejects.toThrow("rpc down");
    expect(calls).toBe(2);
    await expect(cache.run({ key: 1 }, async () => 7)).resolves.toBe(7);
    await expect(cache.run({ key: 1 }, async () => 8)).resolves.toBe(7);
  });
});
