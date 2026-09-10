import { describe, expect, it, vi } from "vitest";
import { MAX_UINT256 } from "../../../constants/math.js";
import type { OnchainSDK } from "../../../index.js";
import { CreditAccountOperationsService } from "../index.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  CREDIT_FACADE,
  caToken,
  POS,
  POS2,
  UND,
  WALLET,
} from "../testing/market.js";
import type { MockDelayedVenue } from "../testing/sdk-mock.js";
import type {
  AdjustLeverageIntent,
  DelayableIntent,
  IntentRoutesResult,
  WithdrawStrategyIntent,
} from "../types.js";
import {
  DEBT_BEFORE,
  QUOTA_BEFORE,
  SPEND,
  TVL_BEFORE,
  W,
} from "./withdraw.fixtures.js";

/**
 * `intentRoutes` — the same intent quoted both ways.
 *
 * Runs on the market the instant and the delayed specs use — 2000 UND of TVL
 * against 1000 of debt (1000 of collateral at 2x), `POS` 1:1 with `UND` — so the
 * amounts are the ones those specs already pin down: what one route swaps is
 * what the other redeems. What is asserted here is which routes come back, and
 * why one does not.
 */

const queued: MockDelayedVenue = {
  withdrawalPhantomToken: POS2,
  claimableAt: 1_772_000_000n,
};

/** A market where `POS` redeems through its issuer as well as on a DEX. */
const withVenue = (): OnchainSDK =>
  buildMarketSdk({ delayed: { [POS]: [queued] } });

function run(
  sdk: OnchainSDK,
  intent: DelayableIntent,
  tokens = [caToken(POS, TVL_BEFORE, QUOTA_BEFORE)],
): Promise<IntentRoutesResult> {
  const service = new CreditAccountOperationsService(sdk);
  return service.intentRoutes({
    intent,
    creditAccount: buildFixtureCreditAccount({
      totalDebt: DEBT_BEFORE,
      tokens,
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  });
}

const withdraw = (
  extra?: Partial<WithdrawStrategyIntent>,
): WithdrawStrategyIntent => ({
  type: "WITHDRAW",
  amount: W,
  to: WALLET,
  sourceToken: POS,
  ...extra,
});

const delever = (targetLeverage: bigint): AdjustLeverageIntent => ({
  type: "ADJUST_LEVERAGE",
  targetLeverage,
});

function expectRoutes(
  result: IntentRoutesResult,
): Extract<IntentRoutesResult, { ok: true }> {
  if (!result.ok) {
    throw new Error(`expected at least one route, got ${result.error.code}`);
  }
  return result;
}

/** A source no pathfinder can sell: every routed leg reverts. */
function withoutRouter(sdk: OnchainSDK): OnchainSDK {
  const router = sdk.routerFor({ creditFacade: CREDIT_FACADE });
  const noPath = new Error("router: no path out of the source");
  vi.mocked(router.findOneTokenPath).mockRejectedValue(noPath);
  vi.mocked(router.findManyToOnePath).mockRejectedValue(noPath);
  return sdk;
}

/**
 * A market where the exit's many-to-one route cannot be found, in the words the
 * pathfinder actually reverts with — an RWA position, whose collateral no pool
 * trades.
 */
function withoutClosePath(sdk: OnchainSDK): OnchainSDK {
  const router = sdk.routerFor({ creditFacade: CREDIT_FACADE });
  vi.mocked(router.findBestClosePath).mockRejectedValue(
    new Error(
      'The contract function "routeManyToOne" reverted with the following reason:\n' +
        "Error: no optimal edge found for token. The swapped amount may be too " +
        "small to yield a positive output",
    ),
  );
  return sdk;
}

describe("withdraw.routes — both halves of the choice, in one call", () => {
  it("returns both when the source can be sold and redeemed", async () => {
    const routes = expectRoutes(await run(withVenue(), withdraw()));

    expect(routes.instant?.operations[0]).toMatchObject({
      type: "swap",
      tokenOut: UND,
      amountOut: SPEND,
    });
    expect(routes.delayed?.operations[0]).toMatchObject({
      type: "startDelayedWithdrawal",
      token: POS,
      amountIn: SPEND,
    });
    // Both land in the same place — the withdrawal made, the debt down by dD —
    // which is what makes them a choice rather than two operations. They part
    // on when: only the instant route has repaid anything by the time its
    // transaction is done.
    expect(routes.instant?.state.totalDebt.value).toBe(DEBT_BEFORE - W);
    expect(routes.delayed?.state.totalDebt.value).toBe(DEBT_BEFORE - W);
    expect(routes.delayed?.delayed.afterRequest.totalDebt.value).toBe(
      DEBT_BEFORE,
    );
    expect(routes.delayed?.delayed.record).toMatchObject({
      type: "WITHDRAW_COLLATERAL",
      debtRepaid: W,
    });
    expect(routes.errors).toEqual({});
  });

  it("returns the instant route alone when the source has no redemption venue", async () => {
    const routes = expectRoutes(await run(buildMarketSdk(), withdraw()));

    expect(routes.instant).toBeDefined();
    expect(routes.delayed).toBeUndefined();
    expect(routes.errors.instant).toBeUndefined();
    expect(routes.errors.delayed?.code).toBe("noDelayedRoute");
  });

  it("returns the instant route alone when only its withdrawal token is servable", async () => {
    // A withdrawal in the source token is fine for a swap and beyond the tail.
    const routes = expectRoutes(
      await run(withVenue(), withdraw({ tokenOut: POS })),
    );

    expect(routes.instant).toBeDefined();
    expect(routes.delayed).toBeUndefined();
    expect(routes.errors.delayed?.code).toBe("noDelayedRoute");
  });

  it("returns the delayed route alone when the source cannot be sold", async () => {
    const routes = expectRoutes(
      await run(withoutRouter(withVenue()), withdraw()),
    );

    expect(routes.instant).toBeUndefined();
    expect(routes.delayed).toBeDefined();
    // Nothing refused it: the route exists, it simply could not be quoted.
    expect(routes.errors.instant).toBeUndefined();
  });

  it("offers both for an exit: sold whole, or redeemed and then sold", async () => {
    const routes = expectRoutes(
      await run(withVenue(), withdraw({ amount: TVL_BEFORE })),
    );

    // The exit records itself rather than a withdrawal: the tail is rebuilt from
    // the account it finds, so there is nothing to name in advance.
    expect(routes.delayed?.delayed.record).toEqual({
      type: "CLOSE_ACCOUNT",
      to: WALLET,
    });
    // Only the request and the quota that follows the value into the phantom.
    expect(routes.delayed?.operations.map(o => o.type)).toEqual([
      "startDelayedWithdrawal",
      "changeQuota",
    ]);
    // Either way the account ends up empty and owing nothing.
    expect(routes.instant?.state.totalDebt.value).toBe(0n);
    expect(routes.delayed?.state.totalDebt.value).toBe(0n);
    expect(routes.delayed?.state.assets).toEqual([]);
    // The request itself settles none of it.
    expect(routes.delayed?.delayed.afterRequest.totalDebt.value).toBe(
      DEBT_BEFORE,
    );
    expect(routes.errors).toEqual({});
  });

  it("reads the pathfinder's revert as a refusal, and the exit keeps its second route", async () => {
    const routes = expectRoutes(
      await run(
        withoutClosePath(withVenue()),
        withdraw({ amount: MAX_UINT256 }),
      ),
    );

    // The revert is the pathfinder saying no, so it is reported as a reason
    // rather than raised — otherwise the route that does work is lost with it.
    expect(routes.instant).toBeUndefined();
    expect(routes.errors.instant?.code).toBe("unsupportedTokenPair");
    expect(routes.delayed?.delayed.record).toEqual({
      type: "CLOSE_ACCOUNT",
      to: WALLET,
    });
  });

  it("refuses rather than throws when the exit cannot be routed at all", async () => {
    const result = await run(
      withoutClosePath(buildMarketSdk()),
      withdraw({ amount: MAX_UINT256 }),
    );

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("expected no route");
    }
    expect(result.errors.instant?.code).toBe("unsupportedTokenPair");
    expect(result.errors.delayed?.code).toBe("noDelayedRoute");
  });

  it("fails once, with the instant route's reason, when neither is viable", async () => {
    const result = await run(withVenue(), withdraw({ amount: 0n }));

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("expected no route");
    }
    expect(result.error.code).toBe("insufficientBalance");
    expect(result.errors.instant?.code).toBe("insufficientBalance");
    expect(result.errors.delayed?.code).toBe("insufficientBalance");
  });

  it("rethrows when nothing answered and a route could not be quoted", async () => {
    await expect(
      run(withoutRouter(buildMarketSdk()), withdraw()),
    ).rejects.toThrow("no path out of the source");
  });
});

describe("adjustLeverage.routes — only deleveraging has a second route", () => {
  it("returns both when the position token can be sold and redeemed", async () => {
    // 2000 TVL on 1000 of debt is 2x; 1.5x wants 500 of debt, so 500 is raised
    // from POS either way.
    const routes = expectRoutes(await run(withVenue(), delever(150n)));

    expect(routes.instant?.operations[0]).toMatchObject({
      type: "swap",
      tokenOut: UND,
      amountOut: DEBT_BEFORE / 2n,
    });
    expect(routes.instant?.operations[1]).toMatchObject({
      type: "decreaseDebt",
      amount: DEBT_BEFORE / 2n,
    });
    expect(routes.delayed?.operations[0]).toMatchObject({
      type: "startDelayedWithdrawal",
      token: POS,
      amountIn: DEBT_BEFORE / 2n,
    });
    // Both reach 1.5x; only the instant route is there already.
    expect(routes.instant?.state.totalDebt.value).toBe(DEBT_BEFORE / 2n);
    expect(routes.delayed?.state.totalDebt.value).toBe(DEBT_BEFORE / 2n);
    expect(routes.delayed?.delayed.afterRequest.totalDebt.value).toBe(
      DEBT_BEFORE,
    );
    expect(routes.delayed?.delayed.record).toEqual({
      type: "DECREASE_LEVERAGE",
    });
    expect(routes.errors).toEqual({});
  });

  it("returns the instant route alone when leverage goes up", async () => {
    // Borrowing and buying settle at once, so there is nothing to redeem.
    const routes = expectRoutes(await run(withVenue(), delever(300n)));

    expect(routes.instant?.operations[0]).toMatchObject({
      type: "increaseDebt",
    });
    expect(routes.delayed).toBeUndefined();
    expect(routes.errors.delayed?.code).toBe("noDelayedRoute");
  });

  it("returns the instant route alone when idle underlying covers the repayment", async () => {
    const routes = expectRoutes(
      await run(withVenue(), delever(150n), [
        caToken(POS, TVL_BEFORE / 2n, QUOTA_BEFORE),
        caToken(UND, TVL_BEFORE / 2n),
      ]),
    );

    expect(routes.instant?.operations[0]).toMatchObject({
      type: "decreaseDebt",
      amount: DEBT_BEFORE / 2n,
    });
    expect(routes.delayed).toBeUndefined();
    expect(routes.errors.delayed?.code).toBe("noDelayedRoute");
  });

  it("fails once when the target leverage is not viable for either route", async () => {
    const result = await run(withVenue(), delever(50n));

    expect(result.ok).toBe(false);
    if (result.ok) {
      throw new Error("expected no route");
    }
    expect(result.error.code).toBe("leverageOutOfRange");
    expect(result.errors.instant?.code).toBe("leverageOutOfRange");
    expect(result.errors.delayed?.code).toBe("leverageOutOfRange");
  });
});
