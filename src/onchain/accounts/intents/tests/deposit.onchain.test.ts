import { describe, expect, it, vi } from "vitest";

import { BigIntMath } from "../../../utils/bigint-math.js";
import { CreditAccountOperationsService } from "../index.js";
import { planDeposit } from "../plan.js";
import {
  assetBalance,
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
import {
  buildMarketSdk,
  CREDIT_FACADE,
  CREDIT_MANAGER,
  caToken,
  MAX_DEBT,
  POS,
  RWA_ASSET,
  UND,
} from "../testing/market.js";
import {
  CA_OP_CALLS,
  MOCK_ROUTER_CALL,
  MOCK_RWA_UNWRAP_CALL,
  MOCK_RWA_WRAP_CALL,
} from "../testing/sdk-mock.js";
import { accountView } from "../view.js";
import {
  buildDepositProps,
  buildDepositSdk,
  case_fixed_leverage,
  case_native_coin,
  case_position_is_underlying,
  case_rwa_collateral,
  case_rwa_position,
  case_target_leverage,
  DEBT_START,
  type DepositCase,
  P1000,
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
  it.each(["insufficientPoolLiquidity", "debtOutOfRange", "quotaLimitReached"] as const)(
    "omits solution bounds for a targeted-leverage deposit refused by %s",
    async code => {
      const sdk = buildDepositSdk(case_target_leverage);
      const props = buildDepositProps(case_target_leverage, sdk);
      const suite = sdk.marketRegister.findCreditManager(CREDIT_MANAGER);
      if (code === "insufficientPoolLiquidity") {
        vi.spyOn(suite, "maxBorrowAmount").mockReturnValue({
          amount: suite.market.toUnderlyingAmount(1n),
          limit: "poolAvailableLiquidity",
        });
      } else if (code === "debtOutOfRange") {
        suite.creditFacade.maxDebt = props.creditAccount.totalDebt + 1n;
      } else {
        vi.spyOn(suite.market.pool.pqk, "quotaAvailable").mockReturnValue(0n);
      }
      const result = await new CreditAccountOperationsService(sdk).startIntent(props);
      if (result.ok) throw new Error("expected refusal");
      expect(result.error.code).toBe(code);
      if (result.error.code !== "insufficientPoolLiquidity" && result.error.code !== "debtOutOfRange" && result.error.code !== "quotaLimitReached") throw new Error("unexpected refusal");
      expect(result.error.collateralLimits).toBeUndefined();
      expect(result.error.leverageLimits).toBeUndefined();
      expect(result.error.quotaLimits).toBeUndefined();
    },
  );

  it("values the deposit once for both borrowing and conversion", () => {
    const sdk = buildDepositSdk(case_fixed_leverage);
    const props = buildDepositProps(case_fixed_leverage, sdk);
    const view = accountView(props.creditAccount, sdk);
    const price = vi.spyOn(view, "price");
    planDeposit(props.intent, view);
    expect(price).toHaveBeenCalledTimes(1);
    expect(price).toHaveBeenCalledWith(
      props.intent.token,
      view.underlying,
      props.intent.amount,
    );
  });

  it("limits the added collateral by debt delta on an existing position", async () => {
    const sdk = buildMarketSdk({ availableLiquidity: 100n * 10n ** 8n });
    const service = new CreditAccountOperationsService(sdk);
    const props = buildDepositProps(case_fixed_leverage, sdk);
    const result = await service.startIntent(props);
    if (result.ok || result.error.code !== "insufficientPoolLiquidity")
      throw new Error("expected liquidity refusal");
    expect(result.error.collateralLimits?.max.value).toBe(100n * 10n ** 8n);
    expect(
      sdk.routerFor({ creditFacade: CREDIT_FACADE }).findOneTokenPath,
    ).not.toHaveBeenCalled();
    const limits = result.error.collateralLimits;
    if (!limits) throw new Error("expected deposit limits");
    const repeated = await service.startIntent({
      ...props,
      intent: { ...props.intent, amount: limits.max.value },
    });
    expect(repeated.ok).toBe(true);
  });

  it.each([0, 1000])(
    "caps deposit quota increases with reserve %s",
    async quotaReserve => {
      const sdk = buildMarketSdk({
        quotas: {
          [POS]: {
            token: POS,
            rate: 500n,
            limit: 1200n * 10n ** 8n,
            totalQuoted: 1000n * 10n ** 8n,
            isActive: true,
          },
        },
      });
      const service = new CreditAccountOperationsService(sdk);
      const props = {
        ...buildDepositProps(case_fixed_leverage, sdk),
        quotaReserve,
      };
      const result = await service.startIntent(props);
      if (result.ok || result.error.code !== "quotaLimitReached")
        throw new Error("expected quota refusal");
      const limits = result.error.collateralLimits;
      expect(limits).toBeDefined();
      if (!limits) throw new Error("expected confirmed limits");
      const maximum = result.error.quotaLimits?.collateralMax;
      if (!maximum) throw new Error("expected separate quota ceiling");
      expect(maximum.value).toBeLessThan(limits.max.value);
      for (const endpoint of [limits.min, maximum]) {
        expect(
          (
            await service.startIntent({
              ...props,
              intent: { ...props.intent, amount: endpoint.value },
            })
          ).ok,
        ).toBe(true);
      }
    },
  );

  it("leaves no button when no positive deposit can fit the debt ceiling", async () => {
    const sdk = buildMarketSdk();
    const props = buildDepositProps(
      {
        ...case_fixed_leverage,
        totalDebt: MAX_DEBT,
        tokens: [caToken(UND, MAX_DEBT + 500n * 10n ** 8n)],
      },
      sdk,
    );
    const result = await new CreditAccountOperationsService(sdk).startIntent(
      props,
    );
    if (result.ok || result.error.code !== "debtOutOfRange")
      throw new Error("expected debt ceiling refusal");
    expect(result.error.collateralLimits).toBeUndefined();
  });

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

  it.each([0n, 50n, 100n])(
    "rejects target leverage %s that would require repaying",
    async targetLeverage => {
      const result = await run({
        ...case_target_leverage,
        intent: { ...case_target_leverage.intent, targetLeverage },
      });
      expectPreviewError(result, "leverageOutOfRange");
    },
  );

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

  it("states the same loss against the equity it started with and against position size", async () => {
    const result = await run(case_fixed_leverage, withDepth);
    if (!result.ok) throw new Error("expected a preview");
    const { priceImpact, totalValue, totalDebt } = result.state;
    if (!priceImpact) throw new Error("expected a measurement");

    // The same absolute loss over two different bases, so the ratio of the two
    // rates is the ratio of the bases. Catches a swapped denominator, which no
    // single-rate assertion can.
    const loss = priceImpact.totalValuePriceImpact * totalValue.value;
    const agrees = (base: bigint): boolean => {
      const stated = priceImpact.netValuePriceImpact * base;
      return BigIntMath.abs(stated - loss) * 20n <= BigIntMath.abs(stated);
    };
    expect(agrees(P1000 - DEBT_START)).toBe(true);
    expect(agrees(totalValue.value - totalDebt.value)).toBe(false);
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

describe("deposit.start — execution cost of the routed leg", () => {
  it("reads a flat haircut the price impact cannot see", async () => {
    const result = await run(
      case_fixed_leverage,
      amount => (amount * 99n) / 100n,
    );
    if (!result.ok) throw new Error("expected a preview");
    const { priceImpact, executionCost } = result.state;

    // Linear, so the probe loses the same share and there is no depth to find
    expect(priceImpact?.pathPriceImpact).toBe(0n);
    // while against the oracle the leg gave up a percent of what it sold.
    expect(executionCost?.amount.value).toBe(-P1000 / 100n);
    expect(executionCost?.rate).toBe(-10_000n);
  });

  it("costs nothing on a route that pays the oracle price", async () => {
    const result = await run(case_fixed_leverage);
    if (!result.ok) throw new Error("expected a preview");

    expect(result.state.executionCost?.amount.value).toBe(0n);
    expect(result.state.executionCost?.rate).toBe(0n);
  });
});
