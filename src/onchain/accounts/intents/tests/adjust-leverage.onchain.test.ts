import { describe, expect, it } from "vitest";

import { calcPositionLeverage } from "../../../market/math.js";
import { CreditAccountOperationsService } from "../index.js";
import {
  assetBalance,
  expectAdjustPreview,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
import {
  buildMarketSdk,
  CREDIT_FACADE,
  caToken,
  POS,
  QUOTAS,
  RWA_ASSET,
  UND,
} from "../testing/market.js";
import {
  CA_OP_CALLS,
  MOCK_ROUTER_CALL,
  MOCK_RWA_UNWRAP_CALL,
  MOCK_RWA_WRAP_CALL,
} from "../testing/sdk-mock.js";
import {
  type AdjustLeverageCase,
  buildAdjustLeverageProps,
  buildAdjustLeverageSdk,
  case_decrease,
  case_decrease_from_idle_underlying,
  case_decrease_rwa,
  case_increase,
  case_increase_rwa,
  case_increase_underlying,
  case_noop,
  DEBT_3X,
  QUOTA_1000,
  QUOTA_1500,
  TVL_2X,
  TVL_3X,
} from "./adjust-leverage.fixtures.js";

function run(c: AdjustLeverageCase) {
  const sdk = buildAdjustLeverageSdk(c);
  const service = new CreditAccountOperationsService(sdk);
  return service.startIntent(buildAdjustLeverageProps(c, sdk));
}

function expectCase(c: AdjustLeverageCase, expectedCalls: unknown[]) {
  return async () => {
    const result = await run(c);
    return expectAdjustPreview(result, {
      totalValue: c.totalValue,
      totalDebt: c.totalDebtAfter,
      expectedOps: withOnchainOpCalls([...c.ops]),
      expectedCalls: expectedCalls as never,
    });
  };
}

describe("adjustLeverage.start — collateral fixed, debt retargeted", () => {
  it("retains the quota ceiling when one asset cannot repay the entire debt", async () => {
    const unit = 10n ** 8n;
    const sdk = buildMarketSdk({
      availableLiquidity: 100n * unit,
      quotas: {
        ...QUOTAS,
        [POS]: {
          token: POS,
          rate: 500n,
          limit: 1050n * unit,
          totalQuoted: 1000n * unit,
          isActive: true,
        },
      },
    });
    const props = buildAdjustLeverageProps(
      {
        ...case_increase,
        intent: { ...case_increase.intent, token: POS },
        tokens: [
          caToken(POS, 300n * unit, 276n * unit),
          caToken(RWA_ASSET, 700n * unit, 644n * unit),
        ],
      },
      sdk,
    );
    const service = new CreditAccountOperationsService(sdk);
    const result = await service.startIntent(props);
    if (result.ok || result.error.code !== "insufficientPoolLiquidity")
      throw new Error("expected liquidity refusal");
    const max = result.error.quotaLimits?.leverageMax;
    expect(max).toBeDefined();
    if (max === undefined) throw new Error("expected quota ceiling");
    expect(max).toBeLessThan(result.error.leverageLimits?.max ?? 0n);
    expect(
      (
        await service.startIntent({
          ...props,
          intent: { ...props.intent, targetLeverage: max },
        })
      ).ok,
    ).toBe(true);
  });

  it("reports the debt ceiling independently at zero borrowing capacity", async () => {
    const sdk = buildMarketSdk({ availableLiquidity: 0n });
    const result = await new CreditAccountOperationsService(sdk).startIntent(
      buildAdjustLeverageProps(case_increase, sdk),
    );
    if (result.ok || result.error.code !== "insufficientPoolLiquidity")
      throw new Error("expected liquidity refusal");
    expect(result.error.leverageLimits?.max).toBe(200n);
  });

  it.each([0, 1000])(
    "caps leverage by quota delta with reserve %s",
    async quotaReserve => {
      const sdk = buildMarketSdk({
        quotas: {
          [POS]: {
            token: POS,
            rate: 500n,
            limit: 1100n * 10n ** 8n,
            totalQuoted: 1000n * 10n ** 8n,
            isActive: true,
          },
        },
      });
      const service = new CreditAccountOperationsService(sdk);
      const props = {
        ...buildAdjustLeverageProps(case_increase, sdk),
        quotaReserve,
      };
      const result = await service.startIntent(props);
      if (result.ok || result.error.code !== "quotaLimitReached")
        throw new Error("expected quota refusal");
      const limits = result.error.leverageLimits;
      expect(limits).toBeDefined();
      if (!limits) throw new Error("expected leverage limits");
      const maximum = result.error.quotaLimits?.leverageMax;
      if (maximum === undefined)
        throw new Error("expected separate quota ceiling");
      expect(maximum).toBeLessThan(300n);
      expect(limits.max).toBeGreaterThan(300n);
      for (const targetLeverage of [limits.min, maximum]) {
        expect(
          (
            await service.startIntent({
              ...props,
              intent: { ...props.intent, targetLeverage },
            })
          ).ok,
        ).toBe(true);
      }
    },
  );

  it("rounds the minimum leverage up when decreasing below minDebt", async () => {
    const sdk = buildMarketSdk({
      minDebt: 101n * 10n ** 8n,
      availableLiquidity: 0n,
    });
    const service = new CreditAccountOperationsService(sdk);
    const props = {
      ...buildAdjustLeverageProps(case_increase, sdk),
      intent: { ...case_increase.intent, targetLeverage: 110n },
    };
    const result = await service.startIntent(props);
    if (result.ok || result.error.code !== "debtOutOfRange")
      throw new Error("expected debt refusal");
    expect(result.error.leverageLimits?.min).toBe(121n);
    expect(
      (
        await service.startIntent({
          ...props,
          intent: { ...props.intent, targetLeverage: 121n },
        })
      ).ok,
    ).toBe(true);
  });

  it("caps target leverage by the available debt increase", async () => {
    const sdk = buildMarketSdk({ availableLiquidity: 100n * 10n ** 8n });
    const service = new CreditAccountOperationsService(sdk);
    const props = buildAdjustLeverageProps(case_increase, sdk);
    const result = await service.startIntent(props);
    if (result.ok || result.error.code !== "insufficientPoolLiquidity")
      throw new Error("expected liquidity refusal");
    expect(result.error.leverageLimits?.max).toBe(220n);
    expect(
      sdk.routerFor({ creditFacade: CREDIT_FACADE }).findOneTokenPath,
    ).not.toHaveBeenCalled();
    const limits = result.error.leverageLimits;
    if (!limits) throw new Error("expected leverage limits");
    expect(
      (
        await service.startIntent({
          ...props,
          intent: { ...props.intent, targetLeverage: limits.max },
        })
      ).ok,
    ).toBe(true);
  });

  it("2x → 3x: increaseDebt then swap the borrowed underlying into the position", async () => {
    const state = await expectCase(case_increase, [
      CA_OP_CALLS.increaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.changeQuota,
    ])();

    expect(assetBalance(state.assets, POS)).toBe(TVL_3X);
    expect(assetBalance(state.assets, UND)).toBe(0n);
    expect(assetBalance(state.quotas, POS)).toBe(QUOTA_1500);
  });

  it("fills position metrics on the projected state", async () => {
    const state = await expectCase(case_increase, [
      CA_OP_CALLS.increaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.changeQuota,
    ])();

    expect(state.healthFactor).toBeGreaterThan(10000);
    expect(
      state.borrowRate.quotas.find(q => q.token.address === POS)?.rate,
    ).toBeGreaterThan(0);
    // single non-underlying asset left on the account: a price exists
    expect(state.liquidationPrice).not.toBeNull();
  });

  it("reports total-value leverage like a Position, not the calculator's target", async () => {
    // the calculator targets `TVL / collateral` (3x here); the projection must
    // read like a `Position` — `calcPositionLeverage(totalValue, totalDebt)`
    // is 3x for the same account, so a re-read position compares without a fudge
    const state = await expectCase(case_increase, [
      CA_OP_CALLS.increaseDebt,
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.changeQuota,
    ])();

    expect(state.leverage).toBe(calcPositionLeverage(TVL_3X, DEBT_3X));
    expect(state.leverage).toBe(3);
  });

  it("2x → 3x with underlying as the position: increaseDebt only", async () => {
    const state = await expectCase(case_increase_underlying, [
      CA_OP_CALLS.increaseDebt,
    ])();

    expect(assetBalance(state.assets, UND)).toBe(TVL_3X);
  });

  it("2x → 3x on an RWA market: unwrap instead of swap", async () => {
    const state = await expectCase(case_increase_rwa, [
      CA_OP_CALLS.increaseDebt,
      MOCK_RWA_UNWRAP_CALL,
      CA_OP_CALLS.changeQuota,
    ])();

    expect(assetBalance(state.assets, RWA_ASSET)).toBe(TVL_3X);
    expect(assetBalance(state.assets, UND)).toBe(0n);
  });

  it("3x → 2x: sell the position, then repay", async () => {
    const state = await expectCase(case_decrease, [
      MOCK_ROUTER_CALL,
      CA_OP_CALLS.decreaseDebt,
      CA_OP_CALLS.changeQuota,
    ])();

    expect(assetBalance(state.assets, POS)).toBe(TVL_2X);
    expect(assetBalance(state.assets, UND)).toBe(0n);
    expect(assetBalance(state.quotas, POS)).toBe(QUOTA_1000);
  });

  it("3x → 2x funded by idle underlying: no swap leg", async () => {
    const state = await expectCase(case_decrease_from_idle_underlying, [
      CA_OP_CALLS.decreaseDebt,
    ])();

    expect(assetBalance(state.assets, UND)).toBe(0n);
    expect(assetBalance(state.assets, POS)).toBe(TVL_2X);
  });

  it("3x → 2x on an RWA market: wrap instead of swap", async () => {
    const state = await expectCase(case_decrease_rwa, [
      MOCK_RWA_WRAP_CALL,
      CA_OP_CALLS.decreaseDebt,
      CA_OP_CALLS.changeQuota,
    ])();

    expect(assetBalance(state.assets, RWA_ASSET)).toBe(TVL_2X);
  });

  it("target equals current leverage → no operations", async () => {
    await expectCase(case_noop, [])();
  });

  it("rejects leverage below 1x", async () => {
    const result = await run({
      ...case_increase,
      intent: { ...case_increase.intent, targetLeverage: 50n },
    });
    expectPreviewError(result, "leverageOutOfRange");
  });

  it("rejects a target whose debt exceeds maxDebt", async () => {
    const result = await run({
      ...case_increase,
      intent: { ...case_increase.intent, targetLeverage: 50000n },
    });
    expectPreviewError(result, "debtOutOfRange");
  });

  it("rejects when no position token can be defaulted", async () => {
    const result = await run({
      ...case_increase_underlying,
      intent: {
        type: "ADJUST_LEVERAGE",
        targetLeverage: case_increase_underlying.intent.targetLeverage,
      },
    });
    expectPreviewError(result, "insufficientBalance");
  });
});
