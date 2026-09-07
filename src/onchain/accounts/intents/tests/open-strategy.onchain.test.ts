import { describe, expect, it, vi } from "vitest";
import { LEVERAGE_DECIMALS } from "../../../constants/math.js";
import type { OnchainSDK } from "../../../index.js";
import { toBN } from "../../../index.js";
import { CreditAccountOperationsService } from "../index.js";
import {
  ANY,
  CREDIT_FACADE,
  MAX_DEBT,
  POS,
  UND,
  UND_DECIMALS,
} from "../testing/market.js";
import { MOCK_ROUTER_CALL } from "../testing/sdk-mock.js";
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
    throw new Error(`expected a state, got error: ${outcome.reason}`);
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
      throw new Error(`expected a state, got error: ${outcome.reason}`);
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
  it("rejects leverage below 1x", async () => {
    const { result } = run({ ...case_underlying_3x, leverage: 50n });
    const refusal = await result;

    if (refusal.ok || refusal.reason !== "leverageOutOfRange") {
      throw new Error("expected leverageOutOfRange");
    }
    expect(refusal.detail).toEqual({ requested: 50n, min: LEVERAGE_DECIMALS });
  });

  it("rejects collateral that is worth nothing in underlying", async () => {
    const { result } = run({ ...case_underlying_3x, collateral: [] });
    const refusal = await result;

    if (refusal.ok || refusal.reason !== "insufficientSourceBalance") {
      throw new Error("expected insufficientSourceBalance");
    }
    // Nothing was supplied, so there is no amount to name.
    expect(refusal.detail).toBeUndefined();
  });

  it("rejects a debt above the facade maxDebt, and says what the ceiling is", async () => {
    const { result } = run({
      ...case_underlying_3x,
      collateral: [{ token: UND, balance: MAX_DEBT }],
    });
    const refusal = await result;

    if (refusal.ok || refusal.reason !== "debtOutOfRange") {
      throw new Error("expected debtOutOfRange");
    }
    expect(refusal.detail.maxDebt).toEqual({
      token: expect.objectContaining({ address: UND }),
      value: MAX_DEBT,
      valueUsd: null,
    });
    expect(refusal.detail.requested.token.address).toBe(UND);
    expect(refusal.detail.requested.value).toBeGreaterThan(MAX_DEBT);
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

    if (refusal.ok || refusal.reason !== "debtOutOfRange") {
      throw new Error("expected debtOutOfRange");
    }
    expect(refusal.detail.minDebt).toEqual({
      token: expect.objectContaining({ address: UND }),
      value: MARGIN_UND,
      valueUsd: null,
    });
    expect(refusal.detail.requested.value).toBeLessThan(MARGIN_UND);
  });
});
