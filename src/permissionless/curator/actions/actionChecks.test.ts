import {
  type Address,
  type Chain,
  type PublicClient,
  type Transport,
  zeroAddress,
} from "viem";
import { describe, expect, it } from "vitest";
import { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import { ConfigurationExecutor } from "../executor/ConfigurationExecutor.js";
import { MarketExecutor } from "../executor/MarketExecutor.js";
import type { ConfiguratorState } from "../state/configurator/types.js";
import type { MarketState } from "../state/market/types.js";
import { GipActionError } from "./actionDiagnostics.js";
import type { GipBuilderContext } from "./builderContext.js";
import type { RampLiquidationThresholdAction } from "./rampLiquidationThresholdActionData.js";
import type { SetFeesAction } from "./setFeesActionData.js";
import type { GipMarketAction } from "./types.js";

const POOL: Address = "0x1111111111111111111111111111111111111111";
const CM: Address = "0x2222222222222222222222222222222222222222";
const CONFIGURATOR: Address = "0x3333333333333333333333333333333333333333";
const USDC: Address = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const WETH: Address = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const ADMIN: Address = "0x4444444444444444444444444444444444444444";
const NOW = 1_800_000_000;
const DAY = 24 * 60 * 60;

function context(): GipBuilderContext {
  // Only the members the executor reaches; nothing here should read the chain.
  const client = {
    chain: { id: 1 },
    readContract: async ({ functionName }: { functionName: string }) => {
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
    creditManagerDebtLimit: { [CM]: 1_000_000 },
    assets: {
      [WETH]: {
        address: WETH,
        quotaLimit: 1_000,
        quotaIncreaseFee: 0,
        mainPriceFeed: "0x5555555555555555555555555555555555555555",
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
        adapters: {},
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

const run = (
  actions: readonly GipMarketAction[],
  state: MarketState = marketState(),
) => new MarketExecutor(context(), { timestamp: NOW }).execute(state, actions);

const ramp = (
  params: Partial<RampLiquidationThresholdAction["params"]>,
): RampLiquidationThresholdAction => ({
  type: "CREDIT::rampLiquidationThreshold",
  params: {
    creditManager: CM,
    token: WETH,
    liquidationThresholdFinal: 80,
    rampStart: NOW + DAY,
    rampDuration: 7 * DAY,
    ...params,
  },
});

describe("action checks", () => {
  it("stops at the first action that would revert and keeps the state before it", async () => {
    const pause: GipMarketAction = {
      type: "CREDIT::pause",
      params: { creditManager: CM },
    };
    const result = await run([pause, pause]);

    expect(result.blockedAt).toBe(1);
    expect(result.diagnostics).toEqual([
      {
        severity: "error",
        code: "NO_OP",
        message: "The credit manager is already paused",
        actionIndex: 1,
        actionType: "CREDIT::pause",
      },
    ]);
    expect(result.txs).toHaveLength(1);
    expect(result.after.creditManagers[CM].paused).toBe(true);
  });

  it("makes executeBatch throw a located GipActionError", async () => {
    const executor = new MarketExecutor(context(), { timestamp: NOW });
    const error = await executor
      .executeBatch(marketState(), [ramp({ rampDuration: DAY })])
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(GipActionError);
    expect(error).toMatchObject({
      code: "RAMP_TOO_SHORT",
      actionIndex: 0,
      actionType: "CREDIT::rampLiquidationThreshold",
      path: ["params", "rampDuration"],
    });
  });

  it("reports a ramp starting in the past as a warning and keeps projecting", async () => {
    const result = await run([ramp({ rampStart: NOW - DAY })]);
    expect(result.blockedAt).toBeUndefined();
    expect(
      result.diagnostics.map(diagnostic => [
        diagnostic.severity,
        diagnostic.code,
      ]),
    ).toEqual([["warning", "RAMP_START_CLAMPED"]]);
    expect(
      result.after.creditManagers[CM].collateralTokens[WETH]
        .liquidationThresholdFinal,
    ).toBe(80);
  });

  it("rejects liquidation thresholds above the underlying's", async () => {
    const result = await run([ramp({ liquidationThresholdFinal: 97 })]);
    expect(result.diagnostics[0]).toMatchObject({
      code: "LT_ABOVE_UNDERLYING",
    });
  });

  it("requires setFees to keep the fee plus premium sum", async () => {
    const setFees = (
      fees: Pick<
        SetFeesAction["params"]["params"],
        "feeLiquidation" | "feeLiquidationPremium"
      >,
    ): SetFeesAction => ({
      type: "CREDIT::setFees",
      params: {
        creditManager: CM,
        params: {
          feeLiquidationExpired: 1,
          feeLiquidationPremiumExpired: 1,
          ...fees,
        },
      },
    });
    const changed = await run([
      setFees({ feeLiquidation: 1.5, feeLiquidationPremium: 2.5 }),
    ]);
    expect(changed.diagnostics[0]).toMatchObject({ code: "FEES_SUM_CHANGED" });

    const moved = await run([
      setFees({ feeLiquidation: 1, feeLiquidationPremium: 2.5 }),
    ]);
    expect(moved.blockedAt).toBeUndefined();
    expect(moved.after.creditManagers[CM].feeLiquidation).toBe(1);

    const same = await run([
      setFees({ feeLiquidation: 1.5, feeLiquidationPremium: 2 }),
    ]);
    expect(same.diagnostics[0]).toMatchObject({ code: "NO_OP" });
  });

  it("checks the rate keeper and loss policy an action needs", async () => {
    const gauge: MarketState = {
      ...marketState(),
      rateKeeper: {
        type: "GAUGE",
        rates: { [WETH]: { minRate: 1, maxRate: 5 } },
      },
    };
    const result = await run(
      [
        {
          type: "RATE_KEEPER::TUMBLER::setRate",
          params: { token: WETH, rate: 3 },
        },
      ],
      gauge,
    );
    expect(result.diagnostics[0]).toMatchObject({
      code: "RATE_KEEPER_MISMATCH",
    });

    const minAboveMax = await run(
      [
        {
          type: "RATE_KEEPER::GAUGE::changeQuotaMinRate",
          params: { token: WETH, minRate: 6 },
        },
      ],
      gauge,
    );
    expect(minAboveMax.diagnostics[0]).toMatchObject({
      code: "MIN_RATE_ABOVE_MAX",
    });
  });

  it("rejects adapter actions without an allowed adapter of that kind", async () => {
    const result = await run([
      {
        type: "ADAPTER::UNISWAP_V3_ROUTER::setPoolBatchStatus",
        params: {
          creditManager: CM,
          version: 310,
          target: "0x6666666666666666666666666666666666666666",
          pools: [],
        },
      },
    ]);
    expect(result.diagnostics[0]).toMatchObject({ code: "ADAPTER_NOT_FOUND" });
  });

  it("treats redundant setters as errors", async () => {
    const result = await run([
      { type: "POOL::setTokenLimit", params: { token: WETH, limit: 1_000 } },
    ]);
    expect(result.diagnostics[0]).toMatchObject({
      code: "NO_OP",
      path: ["params", "limit"],
    });
  });
});

describe("configurator checks", () => {
  const configuratorState = (): ConfiguratorState => ({
    address: CONFIGURATOR,
    version: 310,
    admin: ADMIN,
    emergencyAdmin: ADMIN,
    pausableAdmins: [ADMIN],
    unpausableAdmins: [],
    lossLiquidators: [],
    emergencyLiquidators: [],
    governor: {
      address: ADMIN,
      queueAdmins: [],
      executionAdmins: [],
      vetoAdmin: ADMIN,
    },
    treasury: {
      address: ADMIN,
      defaultSplit: { recievers: [ADMIN], proportions: [100] },
      activeProposals: [],
    },
    shutdown: false,
  });

  it("stops at an admin that already holds the role", async () => {
    const executor = new ConfigurationExecutor(context(), { timestamp: NOW });
    const result = await executor.execute(configuratorState(), [
      {
        type: "CONFIGURATOR::addAdmin",
        params: { role: "PAUSABLE_ADMIN", admin: ADMIN },
      },
    ]);
    expect(result.blockedAt).toBe(0);
    expect(result.diagnostics[0]).toMatchObject({
      code: "NO_OP",
      actionType: "CONFIGURATOR::addAdmin",
    });
    await expect(
      executor.executeBatch(configuratorState(), [
        {
          type: "CONFIGURATOR::removeAdmin",
          params: { role: "UNPAUSABLE_ADMIN", admin: ADMIN },
        },
      ]),
    ).rejects.toMatchObject({ code: "ADMIN_NOT_FOUND" });
  });
});
