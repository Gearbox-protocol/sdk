import { describe, expect, it, vi } from "vitest";
import { NATIVE_ADDRESS } from "../../../constants/index.js";
import { LEVERAGE_DECIMALS } from "../../../constants/math.js";
import type { OnchainSDK } from "../../../index.js";
import { toBN } from "../../../index.js";
import { MockTokens } from "../../../market/oracle/TestPriceOracle.mock.js";
import { assertCanBorrow } from "../guards.js";
import { CreditAccountOperationsService } from "../index.js";
import { assertDebtLimits } from "../math.js";
import {
  ANY,
  CREDIT_ACCOUNT,
  CREDIT_FACADE,
  CREDIT_MANAGER,
  MAX_DEBT,
  POS,
  UND,
  UND_DECIMALS,
} from "../testing/market.js";
import { MOCK_ROUTER_CALL } from "../testing/sdk-mock.js";
import type { CreditAccountSlice } from "../types.js";
import {
  buildOpenStrategyProps,
  buildOpenStrategySdk,
  case_mixed_with_leftover,
  case_underlying_1x,
  case_underlying_3x,
  MARGIN_UND,
  type OpenStrategyCase,
  quotaFor,
} from "./open-strategy.fixtures.js";

function run(c: OpenStrategyCase, sdk: OnchainSDK = buildOpenStrategySdk()) {
  const service = new CreditAccountOperationsService(sdk);
  return {
    sdk,
    result: service.openStrategyIntent(buildOpenStrategyProps(c, sdk)),
  };
}

/** Asserts everything a case pins down, and returns the state for extras. */
async function expectCase(c: OpenStrategyCase) {
  const { sdk, result } = run(c);
  const outcome = await result;
  if (!outcome.ok) {
    throw new Error(`expected a state, got error: ${outcome.error.code}`);
  }
  const { state } = outcome;

  expect(state.netValue.value).toBe(c.expectedCollateral);
  expect(state.totalDebt.value).toBe(c.expectedDebt);
  expect(state.totalValue.value).toBe(c.expectedCollateral + c.expectedDebt);
  // the read model's plain multiplier, not the LEVERAGE_DECIMALS-scaled figure
  // the request was made with
  expect(state.leverage).toBeCloseTo(
    Number(c.leverage) / Number(LEVERAGE_DECIMALS),
  );
  // the state prices its holdings; the cases name them
  const held = (assets: typeof state.averageAssets) =>
    assets.map(a => ({ token: a.token.address, balance: a.value }));
  expect(held(state.averageAssets)).toEqual(c.expectedAssets);
  // The mock router applies no slippage, so the floor branch matches expected.
  expect(held(state.minAssets)).toEqual(c.expectedAssets);
  expect(state.calls).toEqual([MOCK_ROUTER_CALL]);

  const findOpen = vi.mocked(
    sdk.routerFor({ creditFacade: CREDIT_FACADE }).findOpenStrategyPath,
  );
  // Twice: the route that will be sent, and the marginal-price probe the
  // price impact is measured against. `Nth(1, …)` so this still pins the real
  // one rather than whichever came back first.
  // Twice: the route that will be sent, and the marginal-price probe the price
  // impact is measured against. The probe goes first — it is fired before the
  // real leg is awaited — and carries a scaled-down basket, so matching on the
  // real balances still identifies the real call without pinning an order.
  expect(findOpen).toHaveBeenCalledTimes(2);
  expect(findOpen).toHaveBeenCalledWith(
    expect.objectContaining({
      expectedBalances: c.expectedRouterBalances,
      leftoverBalances: c.leftoverBalances ?? [],
      target: c.targetToken,
    }),
  );

  return state;
}

describe("openStrategy — leverage on wallet collateral, no account yet", () => {
  it("caps the opening solution by quota as well as liquidity", async () => {
    const sdk = buildOpenStrategySdk({
      minDebt: 100n * 10n ** 8n,
      availableLiquidity: 394_520n * 10n ** 8n,
      quotas: {
        [POS]: {
          token: POS,
          rate: 500n,
          limit: 300_000n * 10n ** 8n,
          isActive: true,
        },
      },
    });
    sdk.marketRegister.findCreditManager(CREDIT_MANAGER).creditFacade.maxDebt =
      1_000_000n * 10n ** 8n;
    const scenario = {
      ...case_underlying_3x,
      leverage: 150n,
      collateral: [{ token: UND, balance: 1_000_000n * 10n ** 8n }],
    };
    const result = await run(scenario, sdk).result;
    if (
      result.ok ||
      result.error.code !== "insufficientPoolLiquidity" ||
      !result.error.collateralLimits
    )
      throw new Error("expected opening limits");
    expect(result.error.limit).toBe("poolAvailableLiquidity");
    expect(result.error.available.value).toBe(394_520n * 10n ** 8n);
    expect(result.error.maxBorrowAmount).toBeUndefined();
    expect(result.error.collateralLimits.max.value).toBe(
      789_040n * 10n ** 8n + 1n,
    );
    expect(
      sdk.routerFor({ creditFacade: CREDIT_FACADE }).findOpenStrategyPath,
    ).not.toHaveBeenCalled();
    const maximum = result.error.quotaLimits?.collateralMax?.value;
    expect(maximum).toBeLessThan(result.error.collateralLimits.max.value);
    if (maximum === undefined) throw new Error("expected quota ceiling");
    const repeated = await run(
      { ...scenario, collateral: [{ token: UND, balance: maximum }] },
      sdk,
    ).result;
    expect(repeated.ok).toBe(true);
  });

  it.each([0, 1000])(
    "returns quota-refusal bounds including reserve %s",
    async quotaReserve => {
      const sdk = buildOpenStrategySdk({
        minDebt: 100n * 10n ** 8n,
        quotas: {
          [POS]: {
            token: POS,
            rate: 500n,
            limit: 30_000n * 10n ** 8n,
            isActive: true,
          },
        },
      });
      const props = {
        ...buildOpenStrategyProps(case_underlying_3x, sdk),
        quotaReserve,
        collateral: [{ token: UND, balance: 50_000n * 10n ** 8n }],
      };
      const service = new CreditAccountOperationsService(sdk);
      const result = await service.openStrategyIntent(props);
      if (result.ok || result.error.code !== "quotaLimitReached")
        throw new Error("expected quota refusal");
      const limits = result.error.collateralLimits;
      expect(limits).toBeDefined();
      if (!limits) throw new Error("expected confirmed limits");
      expect(
        sdk.routerFor({ creditFacade: CREDIT_FACADE }).findOpenStrategyPath,
      ).toHaveBeenCalledTimes(2);
      const maximum = result.error.quotaLimits?.collateralMax;
      if (!maximum) throw new Error("expected quota ceiling");
      for (const endpoint of [limits.min, maximum]) {
        expect(
          (
            await service.openStrategyIntent({
              ...props,
              collateral: [
                { token: endpoint.token.address, balance: endpoint.value },
              ],
            })
          ).ok,
        ).toBe(true);
      }
    },
  );

  it("reports zero quota independently of the opening debt band", async () => {
    const sdk = buildOpenStrategySdk({
      minDebt: MARGIN_UND,
      quotas: { [POS]: { token: POS, rate: 500n, limit: 0n, isActive: true } },
    });
    const result = await run(case_underlying_3x, sdk).result;
    if (result.ok || result.error.code !== "quotaLimitReached")
      throw new Error("expected quota refusal");
    expect(result.error.collateralLimits).toBeDefined();
    expect(result.error.quotaLimits?.collateralMax?.value).toBe(0n);
  });

  it("preserves the debt refusal while reporting an exhausted quota separately", async () => {
    const sdk = buildOpenStrategySdk({
      minDebt: MARGIN_UND,
      quotas: { [POS]: { token: POS, rate: 500n, limit: 0n, isActive: true } },
    });
    const result = await run(
      {
        ...case_underlying_3x,
        collateral: [{ token: UND, balance: 1_000_000n * 10n ** 8n }],
      },
      sdk,
    ).result;
    if (result.ok || result.error.code !== "debtOutOfRange")
      throw new Error("expected debt refusal");
    expect(result.error.maxBorrowAmount).toMatchObject({
      limit: "maxDebt",
      amount: { value: MAX_DEBT },
    });
    expect(result.error.collateralLimits).toBeDefined();
    expect(result.error.quotaLimits?.collateralMax?.value).toBe(0n);
  });

  it("3x on underlying margin: debt is 2x the margin, all of it routed", async () => {
    const state = await expectCase(case_underlying_3x);

    expect(state.averageQuota).toEqual([
      { token: POS, balance: quotaFor(MARGIN_UND * 3n, POS) },
    ]);
    expect(state.minQuota).toEqual(state.averageQuota);
  });

  it("fills position metrics from the expected branch", async () => {
    const state = await expectCase(case_underlying_3x);

    expect(state.healthFactor).toBeGreaterThan(10000);
    // no base rate in the fixture market; the POS quota carries the cost
    expect(state.borrowRate.base).toBe(0);
    expect(state.borrowRate.quotas.map(q => q.token.address)).toEqual([POS]);
    expect(state.borrowRate.totalOnDebt).toBeGreaterThan(0);
    expect(state.timeToLiquidation).not.toBeNull();
    // everything is routed into POS: a single target, so a price exists
    expect(state.liquidationPrice).not.toBeNull();
  });

  it("weighs the safe-price factor at the reserve feed, not the main one", async () => {
    // An opening hands the pool's funds over, so the credit manager judges it
    // at safe prices; POS reserves at half its main price, and the reported
    // factor has to follow that feed rather than repeat `healthFactor`.
    const { result } = run(
      case_underlying_3x,
      buildOpenStrategySdk({
        reservePrices: { [UND]: toBN("2", 8), [POS]: toBN("1", 8) },
      }),
    );
    const outcome = await result;
    if (!outcome.ok) {
      throw new Error(`expected a state, got error: ${outcome.error.code}`);
    }

    expect(outcome.state.safeHealthFactor).toBeLessThan(
      outcome.state.healthFactor,
    );
  });

  it("reports no liquidation price when the position holds two targets", async () => {
    const state = await expectCase(case_mixed_with_leftover);

    expect(state.liquidationPrice).toBeNull();
  });

  it("1x draws no debt", async () => {
    const state = await expectCase(case_underlying_1x);

    expect(state.totalDebt.value).toBe(0n);
    expect(state.averageQuota).toEqual([
      { token: POS, balance: quotaFor(MARGIN_UND, POS) },
    ]);
  });

  it("mixed margin: the leftover stays put and gets a quota of its own", async () => {
    const state = await expectCase(case_mixed_with_leftover);

    const [keptAny, target] = case_mixed_with_leftover.expectedAssets;
    expect(state.averageQuota).toEqual([
      { token: ANY, balance: quotaFor(keptAny.balance, ANY) },
      { token: POS, balance: quotaFor(target.balance, POS) },
    ]);
  });

  /** Each refusal carries the numbers a form would otherwise re-derive. */
  it("returns exact collateral bounds in a size refusal and accepts both endpoints", async () => {
    const sdk = buildOpenStrategySdk({
      minDebt: 100n,
      availableLiquidity: 100n,
    });
    const scenario = {
      ...case_underlying_3x,
      leverage: 130n,
      collateral: [{ token: UND, balance: 1000n }],
    };
    const refusal = await run(scenario, sdk).result;
    expect(refusal).toMatchObject({
      ok: false,
      error: {
        collateralLimits: {
          min: { value: 334n, token: { address: UND } },
          max: { value: 336n, token: { address: UND } },
        },
      },
    });
    for (const balance of [334n, 336n]) {
      const outcome = await run(
        { ...scenario, collateral: [{ token: UND, balance }] },
        sdk,
      ).result;
      expect(outcome.ok).toBe(true);
    }
  });

  it("omits bounds when a zero main price makes conversion directions use different feeds", async () => {
    const sdk = buildOpenStrategySdk({
      minDebt: 100n,
      availableLiquidity: 100n,
      extraPrices: { [UND]: 0n },
      reservePrices: {
        [ANY]: 300000000n,
        [UND]: 200000000n,
        [POS]: 200000000n,
      },
    });
    const refusal = await run(
      {
        ...case_underlying_3x,
        leverage: 130n,
        collateral: [{ token: ANY, balance: 20000000000n }],
      },
      sdk,
    ).result;
    expect(refusal.ok).toBe(false);
    if (refusal.ok || refusal.error.code !== "debtOutOfRange")
      throw new Error("expected debt refusal");
    expect(refusal.error.collateralLimits).toBeUndefined();
  });

  it.each([false, true])(
    "returns converted-token bounds using forward oracle prices (reserve fallback %s)",
    async reserve => {
      const sdk = buildOpenStrategySdk({
        minDebt: 100n,
        availableLiquidity: 100n,
        reservePrices: reserve
          ? { [ANY]: 300000000n, [UND]: 200000000n, [POS]: 200000000n }
          : undefined,
      });
      const oracle =
        sdk.marketRegister.findByCreditManager(CREDIT_MANAGER).priceOracle;
      if (reserve) {
        const mainPrice = oracle.mainPrice.bind(oracle);
        vi.spyOn(oracle, "mainPrice").mockImplementation(token => {
          if (token === ANY) throw new Error("main feed unavailable");
          return mainPrice(token);
        });
      }
      const scenario = {
        ...case_underlying_3x,
        leverage: 130n,
        collateral: [{ token: ANY, balance: 1n }],
      };
      // Start below minDebt with a small, priceable collateral amount.
      scenario.collateral[0].balance = 20000000000n;
      const refusal = await run(scenario, sdk).result;
      if (
        refusal.ok ||
        refusal.error.code !== "debtOutOfRange" ||
        !refusal.error.collateralLimits
      )
        throw new Error("expected debt bounds");
      const { min, max } = refusal.error.collateralLimits;
      expect(min.token.address).toBe(ANY);
      expect(min.value).toBe(reserve ? 2220000000001n : 6660000000001n);
      expect(max.value).toBe(reserve ? 2240000000000n : 6720000000000n);
      for (const balance of [min.value, max.value]) {
        expect(
          (
            await run(
              { ...scenario, collateral: [{ token: ANY, balance }] },
              sdk,
            ).result
          ).ok,
        ).toBe(true);
      }
      for (const balance of [min.value - 1n, max.value + 1n]) {
        expect(
          (
            await run(
              { ...scenario, collateral: [{ token: ANY, balance }] },
              sdk,
            ).result
          ).ok,
        ).toBe(false);
      }
    },
  );

  it("uses native/WETH mapping for refusal bounds and repeated opening", async () => {
    const weth = MockTokens.WETH.toLowerCase() as typeof UND;
    const sdk = buildOpenStrategySdk({
      minDebt: 100n,
      availableLiquidity: 100n,
      extraPrices: { [weth]: 100000000n },
      extraDecimals: { [weth]: 18, [NATIVE_ADDRESS]: 18 },
    });
    const scenario = {
      ...case_underlying_3x,
      leverage: 130n,
      collateral: [{ token: NATIVE_ADDRESS, balance: 20000000000n }],
    };
    const refusal = await run(scenario, sdk).result;
    if (
      refusal.ok ||
      refusal.error.code !== "debtOutOfRange" ||
      !refusal.error.collateralLimits
    )
      throw new Error("expected native debt bounds");
    const { min, max } = refusal.error.collateralLimits;
    expect(min.token.address).toBe(NATIVE_ADDRESS);
    expect(min.value).toBe(6660000000001n);
    expect(max.value).toBe(6720000000000n);
    for (const balance of [min.value, max.value]) {
      expect(
        (
          await run(
            { ...scenario, collateral: [{ token: NATIVE_ADDRESS, balance }] },
            sdk,
          ).result
        ).ok,
      ).toBe(true);
    }
  });

  it("does not suggest collateral when no amount can meet the debt interval", async () => {
    const sdk = buildOpenStrategySdk({
      minDebt: 100n,
      availableLiquidity: 99n,
    });
    const refusal = await run(
      { ...case_underlying_3x, collateral: [{ token: UND, balance: 1n }] },
      sdk,
    ).result;
    if (refusal.ok || refusal.error.code !== "debtOutOfRange")
      throw new Error("expected debt refusal");
    expect(refusal.error.collateralLimits).toBeUndefined();
  });

  it("does not suggest an amount for an unrepresentable converted debt", async () => {
    const sdk = buildOpenStrategySdk({
      minDebt: 100n,
      availableLiquidity: 100n,
      extraDecimals: { [ANY]: 0 },
    });
    const refusal = await run(
      {
        ...case_underlying_3x,
        leverage: 130n,
        collateral: [{ token: ANY, balance: 1n }],
      },
      sdk,
    ).result;
    if (refusal.ok || refusal.error.code !== "insufficientPoolLiquidity")
      throw new Error("expected liquidity refusal");
    expect(refusal.error.collateralLimits).toBeUndefined();
  });

  it("does not suggest a single-token replacement for multiple collateral tokens", async () => {
    const sdk = buildOpenStrategySdk({ minDebt: MARGIN_UND * 2n });
    const refusal = await run(case_mixed_with_leftover, sdk).result;
    if (refusal.ok || refusal.error.code !== "debtOutOfRange")
      throw new Error("expected debt refusal");
    expect(refusal.error.collateralLimits).toBeUndefined();
  });

  it("rejects leverage below 1x", async () => {
    const { result } = run({ ...case_underlying_3x, leverage: 50n });
    const refusal = await result;

    if (refusal.ok || refusal.error.code !== "leverageOutOfRange") {
      throw new Error("expected leverageOutOfRange");
    }
    expect(refusal.error).toMatchObject({
      code: "leverageOutOfRange",
      requested: 50n,
      min: LEVERAGE_DECIMALS,
    });
  });

  it("rejects a zero-debt opening against a nonzero debt floor", async () => {
    const { result } = run(
      case_underlying_1x,
      buildOpenStrategySdk({ minDebt: MARGIN_UND }),
    );
    const refusal = await result;

    if (refusal.ok || refusal.error.code !== "debtOutOfRange") {
      throw new Error("expected debtOutOfRange");
    }
    expect(refusal.error.requested?.value).toBe(0n);
    expect(refusal.error.collateralLimits).toBeUndefined();
  });

  it("rejects collateral that is worth nothing in underlying", async () => {
    const { result } = run({ ...case_underlying_3x, collateral: [] });
    const refusal = await result;

    if (refusal.ok || refusal.error.code !== "insufficientBalance") {
      throw new Error("expected insufficientBalance");
    }
    // Nothing was supplied, so there is no amount to name.
    expect(refusal.error.required).toBeUndefined();
    expect(refusal.error.held).toBeUndefined();
  });

  it("rejects a debt above the facade maxDebt, and says what the ceiling is", async () => {
    const { result } = run({
      ...case_underlying_3x,
      collateral: [{ token: UND, balance: MAX_DEBT }],
    });
    const refusal = await result;

    if (refusal.ok || refusal.error.code !== "debtOutOfRange") {
      throw new Error("expected debtOutOfRange");
    }
    expect(refusal.error.maxDebt).toEqual({
      token: expect.objectContaining({ address: UND }),
      value: MAX_DEBT,
      valueUsd: null,
    });
    expect(refusal.error.requested.token.address).toBe(UND);
    expect(refusal.error.requested.value).toBeGreaterThan(MAX_DEBT);
  });

  it("rejects a debt below the facade minDebt, and says what the floor is", async () => {
    const { result } = run(
      {
        ...case_underlying_3x,
        collateral: [{ token: UND, balance: toBN("1", UND_DECIMALS) }],
      },
      buildOpenStrategySdk({ minDebt: MARGIN_UND }),
    );
    const refusal = await result;

    if (refusal.ok || refusal.error.code !== "debtOutOfRange") {
      throw new Error("expected debtOutOfRange");
    }
    expect(refusal.error.minDebt).toEqual({
      token: expect.objectContaining({ address: UND }),
      value: MARGIN_UND,
      valueUsd: null,
    });
    expect(refusal.error.requested.value).toBeLessThan(MARGIN_UND);
  });
});

describe("openStrategy on a pre-opened empty account", () => {
  const EMPTY_ACCOUNT: CreditAccountSlice = {
    creditAccount: CREDIT_ACCOUNT,
    creditManager: CREDIT_MANAGER,
    creditFacade: CREDIT_FACADE,
    underlying: UND,
    enabledTokensMask: 0n,
    totalDebtUSD: 0n,
    totalDebt: 0n,
    tokens: [],
  };

  function runReused(sdk: OnchainSDK = buildOpenStrategySdk()) {
    const service = new CreditAccountOperationsService(sdk);
    return {
      sdk,
      result: service.openStrategyIntent({
        ...buildOpenStrategyProps(case_underlying_3x, sdk),
        creditAccount: EMPTY_ACCOUNT,
      }),
    };
  }

  it("reaches the same state, and names the account it will run on", async () => {
    const plain = await run(case_underlying_3x).result;
    const reused = await runReused().result;
    if (!plain.ok || !reused.ok) throw new Error("expected two states");

    expect(reused.state.creditAccount).toBe(CREDIT_ACCOUNT);
    expect({ ...reused.state, creditAccount: undefined }).toEqual({
      ...plain.state,
      creditAccount: undefined,
    });
  });

  it("routes the same basket, because the path is quoted for the manager and never for the account", async () => {
    const { sdk } = runReused();
    await runReused(sdk).result;
    const findOpen = vi.mocked(
      sdk.routerFor({ creditFacade: CREDIT_FACADE }).findOpenStrategyPath,
    );

    expect(findOpen).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedBalances: case_underlying_3x.expectedRouterBalances,
        target: case_underlying_3x.targetToken,
      }),
    );
  });
});

describe("prepared opening bounds in guards", () => {
  it("passes prepared bounds into debt and borrowing refusals", () => {
    const sdk = buildOpenStrategySdk({
      minDebt: 100n,
      availableLiquidity: 200n,
    });
    const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
    const collateralLimits = {
      min: suite.market.toUnderlyingAmount(100n),
      max: suite.market.toUnderlyingAmount(200n),
    };
    const options = { collateralLimits };
    assertDebtLimits(sdk, 100n, suite.creditFacade, UND, {
      ...options,
      allowZero: false,
    });
    assertCanBorrow(sdk, suite, 100n, options);
    const error = expect.objectContaining({
      error: expect.objectContaining({ collateralLimits }),
    });
    expect(() =>
      assertDebtLimits(sdk, 99n, suite.creditFacade, UND, {
        ...options,
        allowZero: false,
      }),
    ).toThrow(error);
    expect(() => assertCanBorrow(sdk, suite, 201n, options)).toThrow(error);
  });
});

describe("open debt refusal live borrowing ceiling", () => {
  it("attaches subminimum market capacity to the first debt refusal", async () => {
    const sdk = buildOpenStrategySdk({
      minDebt: MARGIN_UND * 3n,
      availableLiquidity: MARGIN_UND,
    });
    const outcome = await run(case_underlying_3x, sdk).result;
    if (outcome.ok || outcome.error.code !== "debtOutOfRange")
      throw new Error("expected debt refusal");
    expect(outcome.error.maxBorrowAmount?.amount.value).toBe(MARGIN_UND);
    expect(outcome.error.maxBorrowAmount?.limit).toBe("poolAvailableLiquidity");
    expect(outcome.error.minDebt.value).toBe(MARGIN_UND * 3n);
  });
});
