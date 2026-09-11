import { describe, expect, it } from "vitest";

import { CreditAccountOperationsService } from "../index.js";
import {
  assetBalance,
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
import { POS, RWA_ASSET, UND } from "../testing/market.js";
import {
  CA_OP_CALLS,
  MOCK_ROUTER_CALL,
  MOCK_RWA_UNWRAP_CALL,
  MOCK_RWA_WRAP_CALL,
} from "../testing/sdk-mock.js";
import {
  buildDepositProps,
  buildDepositSdk,
  case_fixed_leverage,
  case_native_coin,
  case_position_is_underlying,
  case_rwa_collateral,
  case_rwa_position,
  case_target_leverage,
  type DepositCase,
  P2000,
  P3000,
  QUOTA_2000,
  QUOTA_3000,
} from "./deposit.fixtures.js";

function run(c: DepositCase, routeQuote?: (amount: bigint) => bigint) {
  const sdk = buildDepositSdk(c, routeQuote);
  const service = new CreditAccountOperationsService(sdk);
  return service.startIntent(buildDepositProps(c, sdk));
}

async function expectCase(c: DepositCase, expectedCalls: unknown[]) {
  const result = await run(c);
  return expectAdjustPreview(result, {
    totalValue: c.totalValue,
    totalDebt: c.totalDebtAfter,
    expectedOps: withOnchainOpCalls([...c.ops]),
    expectedCalls: expectedCalls as never,
  });
}

describe("deposit.start — collateral in, debt on top, converted to position", () => {
  it("1.1 preserves leverage: addCollateral → increaseDebt → swap", async () => {
    const state = await expectCase(case_fixed_leverage, [
      CA_OP_CALLS.addCollateral,
      CA_OP_CALLS.increaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.changeQuota,
    ]);

    expect(assetBalance(state.assets, POS)).toBe(P2000);
    expect(assetBalance(state.assets, UND)).toBe(0n);
    expect(assetBalance(state.quotas, POS)).toBe(QUOTA_2000);
    // TVL 2000 against debt 1000 leaves collateral at 1000: still 2x.
    expect(state.totalValue.value - state.totalDebt.value).toBe(
      state.totalDebt.value,
    );
  });

  it("1.2 levers up to the target while depositing", async () => {
    const state = await expectCase(case_target_leverage, [
      CA_OP_CALLS.addCollateral,
      CA_OP_CALLS.increaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.changeQuota,
    ]);

    expect(assetBalance(state.assets, POS)).toBe(P3000);
    expect(assetBalance(state.quotas, POS)).toBe(QUOTA_3000);
    // TVL 3000 on collateral 1000 is exactly 3x.
    expect(state.totalValue.value).toBe(P3000);
  });

  it("matrix 3.2 deposits the native coin: value rides on addCollateral", async () => {
    const state = await expectCase(case_native_coin, [
      CA_OP_CALLS.addCollateral,
      CA_OP_CALLS.increaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.changeQuota,
    ]);

    // TVL 15U against debt 12U leaves collateral at 3U: still 5x.
    expect(state.totalValue.value - state.totalDebt.value).toBe(300000000n);
  });

  it("skips the swap when the position token is the underlying", async () => {
    const state = await expectCase(case_position_is_underlying, [
      CA_OP_CALLS.addCollateral,
      CA_OP_CALLS.increaseDebt,
    ]);

    expect(assetBalance(state.assets, UND)).toBe(P2000);
  });

  it("wraps the RWA asset before routing it", async () => {
    const state = await expectCase(case_rwa_collateral, [
      CA_OP_CALLS.addCollateral,
      MOCK_RWA_WRAP_CALL,
      CA_OP_CALLS.increaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.changeQuota,
    ]);

    expect(assetBalance(state.assets, POS)).toBe(P2000);
    expect(assetBalance(state.assets, RWA_ASSET)).toBe(0n);
  });

  it("leaves the deposit alone and unwraps only the debt when the asset is the position", async () => {
    const state = await expectCase(case_rwa_position, [
      CA_OP_CALLS.addCollateral,
      CA_OP_CALLS.increaseDebt,
      MOCK_RWA_UNWRAP_CALL,
      CA_OP_CALLS.changeQuota,
    ]);

    expect(assetBalance(state.assets, RWA_ASSET)).toBe(P2000);
    expect(assetBalance(state.assets, UND)).toBe(0n);
  });

  it("rejects a collateral token that is not the underlying", async () => {
    const result = await run({
      ...case_fixed_leverage,
      intent: { ...case_fixed_leverage.intent, token: POS },
    });
    expectPreviewError(result, "unsupportedCollateralToken");
  });

  it("rejects a target leverage that would require repaying", async () => {
    const result = await run({
      ...case_target_leverage,
      intent: { ...case_target_leverage.intent, targetLeverage: 100n },
    });
    expectPreviewError(result, "leverageOutOfRange");
  });

  it("rejects a non-positive amount", async () => {
    const result = await run({
      ...case_fixed_leverage,
      intent: { ...case_fixed_leverage.intent, amount: 0n },
    });
    expectPreviewError(result, "insufficientBalance");
  });
});

describe("deposit.start — price impact of the routed leg", () => {
  /**
   * A market with depth: every route gives up a hundredth of a percent per
   * `SIZE` swapped. A probe is orders of magnitude smaller, so it clears at
   * very nearly the marginal price and the real leg's shortfall is the impact.
   */
  const SIZE = 100_000_000_000n;
  const withDepth = (amount: bigint): bigint =>
    amount - (amount * amount) / (SIZE * 10_000n);

  it("reports what the route gave up to depth", async () => {
    const result = await run(case_fixed_leverage, withDepth);
    if (!result.ok) throw new Error("expected a preview");
    const { priceImpact } = result.state;

    expect(priceImpact).toBeDefined();
    if (!priceImpact) return;
    // A loss, never a gain
    expect(priceImpact.pathPriceImpact).toBeLessThan(0n);
    // and small: this is depth, not a broken measurement
    expect(priceImpact.pathPriceImpact).toBeGreaterThan(-100_000n);
  });

  it("states the same loss against equity and against position size", async () => {
    const result = await run(case_fixed_leverage, withDepth);
    if (!result.ok) throw new Error("expected a preview");
    const { priceImpact, totalValue, totalDebt } = result.state;
    if (!priceImpact) throw new Error("expected a measurement");

    // The same absolute loss over two different bases, so the ratio of the two
    // rates is the ratio of the bases. Catches a swapped denominator, which no
    // single-rate assertion can.
    const netValue = totalValue.value - totalDebt.value;
    expect(
      priceImpact.netValuePriceImpact * netValue -
        priceImpact.totalValuePriceImpact * totalValue.value,
    ).toBeLessThanOrEqual(totalValue.value / 1_000n);
    // Equity is the smaller base, so the same loss reads worse against it.
    expect(priceImpact.netValuePriceImpact).toBeLessThan(
      priceImpact.totalValuePriceImpact,
    );
  });

  it("measures nothing on a market with no depth to give up", async () => {
    const result = await run(case_fixed_leverage);
    if (!result.ok) throw new Error("expected a preview");

    // The mock's default route is linear, and a probe scales down in exactly
    // the same proportion, so there is nothing to find.
    expect(result.state.priceImpact?.pathPriceImpact).toBe(0n);
  });
});
