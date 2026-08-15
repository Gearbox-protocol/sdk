import { describe, expect, it, vi } from "vitest";

import type { OnchainSDK } from "../../../../../index.js";
import { toBN } from "../../../../../index.js";
import { CreditAccountOperationsService } from "../../../index.js";
import {
  ANY,
  CREDIT_FACADE,
  MAX_DEBT,
  POS,
  UND,
  UND_DECIMALS,
} from "../../../testing/market.js";
import { MOCK_ROUTER_CALL } from "../../../testing/sdk-mock.js";
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

/** Asserts everything a case pins down, and returns the preview for extras. */
async function expectCase(c: OpenStrategyCase) {
  const { sdk, result } = run(c);
  const outcome = await result;
  if (!outcome.ok) {
    throw new Error(`expected a preview, got error: ${outcome.reason}`);
  }
  const { preview } = outcome;

  expect(preview.collateral).toBe(c.expectedCollateral);
  expect(preview.debt).toBe(c.expectedDebt);
  expect(preview.totalValue).toBe(c.expectedCollateral + c.expectedDebt);
  expect(preview.averageAssets).toEqual(c.expectedAssets);
  // The mock router applies no slippage, so the floor branch matches expected.
  expect(preview.minAssets).toEqual(c.expectedAssets);
  expect(preview.calls).toEqual([MOCK_ROUTER_CALL]);

  const findOpen = vi.mocked(
    sdk.routerFor({ creditFacade: CREDIT_FACADE }).findOpenStrategyPath,
  );
  expect(findOpen).toHaveBeenCalledTimes(1);
  expect(findOpen).toHaveBeenCalledWith(
    expect.objectContaining({
      expectedBalances: c.expectedRouterBalances,
      leftoverBalances: c.leftoverBalances ?? [],
      target: c.targetToken,
    }),
  );

  return preview;
}

describe("openStrategy — leverage on wallet collateral, no account yet", () => {
  it("3x on underlying margin: debt is 2x the margin, all of it routed", async () => {
    const preview = await expectCase(case_underlying_3x);

    expect(preview.averageQuota).toEqual([
      { token: POS, balance: quotaFor(MARGIN_UND * 3n, POS) },
    ]);
    expect(preview.minQuota).toEqual(preview.averageQuota);
  });

  it("1x draws no debt", async () => {
    const preview = await expectCase(case_underlying_1x);

    expect(preview.debt).toBe(0n);
    expect(preview.averageQuota).toEqual([
      { token: POS, balance: quotaFor(MARGIN_UND, POS) },
    ]);
  });

  it("mixed margin: the leftover stays put and gets a quota of its own", async () => {
    const preview = await expectCase(case_mixed_with_leftover);

    const [keptAny, target] = case_mixed_with_leftover.expectedAssets;
    expect(preview.averageQuota).toEqual([
      { token: ANY, balance: quotaFor(keptAny.balance, ANY) },
      { token: POS, balance: quotaFor(target.balance, POS) },
    ]);
  });

  it("rejects leverage below 1x", async () => {
    const { result } = run({ ...case_underlying_3x, leverage: 50n });
    await expect(result).resolves.toEqual({
      ok: false,
      reason: "leverageOutOfRange",
    });
  });

  it("rejects collateral that is worth nothing in underlying", async () => {
    const { result } = run({ ...case_underlying_3x, collateral: [] });
    await expect(result).resolves.toEqual({
      ok: false,
      reason: "insufficientSourceBalance",
    });
  });

  it("rejects a debt above the facade maxDebt", async () => {
    const { result } = run({
      ...case_underlying_3x,
      collateral: [{ token: UND, balance: MAX_DEBT }],
    });
    await expect(result).resolves.toEqual({
      ok: false,
      reason: "debtOutOfRange",
    });
  });

  it("rejects a debt below the facade minDebt", async () => {
    const { result } = run(
      {
        ...case_underlying_3x,
        collateral: [{ token: UND, balance: toBN("1", UND_DECIMALS) }],
      },
      buildOpenStrategySdk({ minDebt: MARGIN_UND }),
    );
    await expect(result).resolves.toEqual({
      ok: false,
      reason: "debtOutOfRange",
    });
  });
});
