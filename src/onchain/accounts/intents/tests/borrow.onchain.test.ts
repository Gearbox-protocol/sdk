import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import { PERCENTAGE_FACTOR } from "../../../constants/math.js";
import type { OnchainSDK } from "../../../index.js";
import { toBN } from "../../../index.js";
import { CreditAccountOperationsService } from "../index.js";
import {
  buildMarketSdk,
  CREDIT_FACADE,
  CREDIT_MANAGER,
  MAX_DEBT,
  type MarketSdkExtras,
  POS,
  POS2,
  UND,
  UND_DECIMALS,
  valueInUnd,
} from "../testing/market.js";
import { MOCK_ROUTER_CALL } from "../testing/sdk-mock.js";

/** Liquidation threshold of every non-underlying token in the fixture market. */
const LT = 9200n;
/** 1000 POS, which is 1000 UND at fixture prices. */
const COLLATERAL = toBN("1000", UND_DECIMALS);
/** 400 UND of loan against it, well inside what the threshold allows. */
const LOAN = toBN("400", UND_DECIMALS);

interface BorrowCase {
  collateralToken?: Address;
  collateralAmount?: bigint;
  borrowToken?: Address;
  borrowAmount?: bigint;
  slippage?: number;
}

function run(c: BorrowCase = {}, sdk: OnchainSDK = buildMarketSdk()) {
  return {
    sdk,
    result: new CreditAccountOperationsService(sdk).borrowIntent({
      sdk,
      creditManager: CREDIT_MANAGER,
      collateralToken: c.collateralToken ?? POS,
      collateralAmount: c.collateralAmount ?? COLLATERAL,
      borrowToken: c.borrowToken ?? UND,
      borrowAmount: c.borrowAmount ?? LOAN,
      slippage: c.slippage,
      quotaReserve: undefined,
    }),
  };
}

/** The state, or the refusal named as the test's failure. */
async function state(c: BorrowCase = {}, extras?: MarketSdkExtras) {
  const outcome = await run(c, extras && buildMarketSdk(extras)).result;
  if (!outcome.ok) {
    throw new Error(`expected a state, got error: ${outcome.error.code}`);
  }
  return outcome.state;
}

/** The refusal code, or the state named as the test's failure. */
async function refusal(c: BorrowCase = {}, extras?: MarketSdkExtras) {
  const outcome = await run(c, extras && buildMarketSdk(extras)).result;
  if (outcome.ok) {
    throw new Error("expected a refusal, got a state");
  }
  return outcome.error;
}

describe("borrow — a loan against collateral, on an account it opens itself", () => {
  it("leaves the collateral on the account and the loan in the wallet", async () => {
    const s = await state();

    expect(s.collateral.token.address).toBe(POS);
    expect(s.collateral.value).toBe(COLLATERAL);
    expect(s.totalDebt.value).toBe(LOAN);
    // The loan is withdrawn, so the collateral is the whole of the account.
    expect(s.totalValue.value).toBe(COLLATERAL);
    expect(s.netValue.value).toBe(COLLATERAL - LOAN);
    expect(s.assets.map(a => [a.token.address, a.value])).toEqual([
      [POS, COLLATERAL],
    ]);
  });

  it("pays out the underlying as it is borrowed, with no route and no floor to quote", async () => {
    const { sdk, result } = run();
    const s = await result.then(r => (r.ok ? r.state : undefined));

    expect(s?.borrowed).toEqual(s?.minBorrowed);
    expect(s?.borrowed.token.address).toBe(UND);
    expect(s?.borrowed.value).toBe(LOAN);
    expect(s?.calls).toEqual([]);
    expect(s?.priceImpact).toBeUndefined();
    expect(
      vi.mocked(
        sdk.routerFor({ creditFacade: CREDIT_FACADE }).findOneTokenPath,
      ),
    ).not.toHaveBeenCalled();
  });

  it("fills the position metrics a form shows beside the two amounts", async () => {
    const s = await state();

    // 1000 of collateral at a 0.92 threshold backs a 400 loan 2.3 times over
    expect(s.healthFactor).toBe(
      Number((COLLATERAL * LT) / LOAN / (PERCENTAGE_FACTOR / 10000n)),
    );
    expect(s.safeHealthFactor).toBe(s.healthFactor);
    expect(s.leverage).toBeCloseTo(
      Number(COLLATERAL) / Number(COLLATERAL - LOAN),
    );
    expect(s.borrowRate.totalOnDebt).toBeGreaterThan(0);
    expect(s.timeToLiquidation).not.toBeNull();
    // one collateral, so both halves of the liquidation-price pair exist
    expect(s.liquidationPrice).not.toBeNull();
    expect(s.currentPrice).not.toBeNull();
    // whose market this is, and what a liquidation would take off it
    expect(s.curator).toBeDefined();
    expect(s.liquidationDiscount).toBeGreaterThan(0);
  });

  it("buys a quota for the collateral, one branch for both of openCA's", async () => {
    const s = await state();

    expect(s.quotaIncrease).toEqual([
      { token: POS, balance: (valueInUnd(COLLATERAL, POS) * LT) / 10000n },
    ]);
  });

  it("echoes the slippage the route was quoted at, defaulting to none", async () => {
    expect((await state()).slippage).toBe(0);
    expect((await state({ slippage: 50 })).slippage).toBe(50);
  });
});

describe("borrow — a payout the market does not lend in", () => {
  it("sizes the debt from the oracle and routes the underlying into the payout", async () => {
    const { sdk, result } = run({ borrowToken: POS2 });
    const outcome = await result;
    if (!outcome.ok) throw new Error(outcome.error.code);

    // POS2 is 1:1 with UND at fixture prices, so the loan converts one for one
    expect(outcome.state.totalDebt.value).toBe(LOAN);
    expect(outcome.state.borrowed.token.address).toBe(POS2);
    expect(outcome.state.borrowed.value).toBe(LOAN);
    expect(outcome.state.calls).toEqual([MOCK_ROUTER_CALL]);
    expect(
      vi.mocked(
        sdk.routerFor({ creditFacade: CREDIT_FACADE }).findOneTokenPath,
      ),
    ).toHaveBeenCalledWith(
      expect.objectContaining({ tokenIn: UND, tokenOut: POS2, amount: LOAN }),
    );
  });

  it("reports the floor under the payout when the route quotes one", async () => {
    const s = await state(
      { borrowToken: POS2 },
      { routeFloor: amount => (amount * 99n) / 100n },
    );

    expect(s.borrowed.value).toBe(LOAN);
    expect(s.minBorrowed.value).toBe((LOAN * 99n) / 100n);
  });

  it("keeps underlying collateral out of the route that buys the payout", async () => {
    const { sdk, result } = run({
      collateralToken: UND,
      collateralAmount: COLLATERAL,
      borrowToken: POS,
    });
    await result;

    // The account holds the collateral beside the loan, so the leftover-aware
    // path is the one asked for — the one-token path would sweep both.
    const router = sdk.routerFor({ creditFacade: CREDIT_FACADE });
    expect(vi.mocked(router.findManyToOnePath)).toHaveBeenCalledWith(
      expect.objectContaining({
        expectedBalances: [{ token: UND, balance: COLLATERAL + LOAN }],
        leftoverBalances: [{ token: UND, balance: COLLATERAL }],
        target: POS,
      }),
    );
  });
});

describe("borrow — what it refuses, and with which numbers", () => {
  it("refuses a payout in the collateral token, which the sweep would take", async () => {
    const error = await refusal({ collateralToken: POS, borrowToken: POS });

    expect(error.code).toBe("unsupportedCollateralToken");
  });

  it("refuses collateral worth nothing and a loan of nothing", async () => {
    expect((await refusal({ collateralAmount: 0n })).code).toBe(
      "insufficientBalance",
    );
    expect((await refusal({ borrowAmount: 0n })).code).toBe(
      "insufficientBalance",
    );
  });

  it("refuses a loan the collateral cannot carry, and says at what factor", async () => {
    const error = await refusal({ borrowAmount: COLLATERAL });

    if (error.code !== "insufficientCollateral") {
      throw new Error(`expected insufficientCollateral, got ${error.code}`);
    }
    // 1000 of collateral at a 0.92 threshold does not back a 1000 loan
    expect(error.healthFactor).toBeLessThan(10000);
    // the payout leaves the account, so the facade weighs the rest at safe prices
    expect(error.safePrices).toBe(true);
  });

  it("refuses a loan above the facade maxDebt, and names the ceiling", async () => {
    const error = await refusal({
      collateralAmount: MAX_DEBT * 10n,
      borrowAmount: MAX_DEBT + 1n,
    });

    if (error.code !== "debtOutOfRange") {
      throw new Error(`expected debtOutOfRange, got ${error.code}`);
    }
    expect(error.maxDebt?.value).toBe(MAX_DEBT);
  });

  it("refuses a paused market before it quotes anything", async () => {
    expect((await refusal({}, { facadePaused: true })).code).toBe(
      "creditManagerPaused",
    );
  });

  it("refuses a pool with less liquidity than the loan asks for", async () => {
    const error = await refusal({}, { availableLiquidity: LOAN - 1n });

    expect(error.code).toBe("insufficientPoolLiquidity");
  });
});
