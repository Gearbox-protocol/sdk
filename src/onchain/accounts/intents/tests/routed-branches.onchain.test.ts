import { describe, expect, it } from "vitest";

import { CreditAccountOperationsService } from "../index.js";
import {
  assetBalance,
  expectOpsArrayExact,
  expectPreviewError,
  withOnchainOpCalls,
} from "../testing/expect.js";
import {
  buildFixtureCreditAccount,
  buildMarketSdk,
  caToken,
  POS,
  UND,
} from "../testing/market.js";
import type { DepositStrategyIntent } from "../types.js";

/**
 * The two amounts a routed leg comes back with, and which of them decides what.
 *
 * The pathfinder answers twice about one swap: what it expects to return, and
 * the floor it will guarantee once slippage is allowed for. The engine uses both
 * and keeps them apart on purpose — the calls are built off the floor, because
 * that is all the transaction can promise the facade, while the state reported
 * back is read off the expectation, because that is where the position lands.
 *
 * Every other spec in this folder quotes a market with no slippage at all, which
 * collapses the two into one number and makes the distinction invisible. This
 * one drives them apart with `routeFloor` and pins which is which.
 */

const LT = 9200n;
const quotaOf = (balance: bigint) => (balance * LT) / 10000n;

/** 1000 of the position token, and its 1:1 value in the underlying. */
const P1000 = 100000000000n;
/** 500 of the underlying: the starting debt, and the deposit. */
const DEP = 50000000000n;

/** A route that keeps back 1% of what it expects to return. */
const ONE_PERCENT = (amount: bigint) => (amount * 99n) / 100n;

/** What the swap of 1000 underlying guarantees under that route. */
const FLOOR = ONE_PERCENT(P1000);

const INTENT: DepositStrategyIntent = {
  type: "DEPOSIT",
  token: UND,
  amount: DEP,
  positionToken: POS,
};

/** Deposit at preserved 2x into a market whose route floors at `routeFloor`. */
function deposit(routeFloor: (amount: bigint) => bigint) {
  const sdk = buildMarketSdk({ routeFloor });
  return new CreditAccountOperationsService(sdk).startIntent({
    intent: INTENT,
    creditAccount: buildFixtureCreditAccount({
      totalDebt: DEP,
      tokens: [caToken(POS, P1000, quotaOf(P1000))],
    }),
    sdk,
    quotaReserve: undefined,
    slippage: undefined,
  });
}

describe("a routed leg's two amounts — the floor signs, the expectation is reported", () => {
  it("builds the calls off the floor and reports the state off the expectation", async () => {
    const result = await deposit(ONE_PERCENT);
    if (!result.ok) {
      throw new Error(`deposit refused: ${result.reason}`);
    }

    // The calls: 500 added, 500 borrowed, 1000 routed into the position for a
    // guaranteed 990. The floor is what the swap op carries, so it is what the
    // slippage control in the router's own calldata will be checked against.
    expectOpsArrayExact(
      result.operations,
      withOnchainOpCalls([
        { type: "addCollateral", token: UND, amount: DEP, value: undefined },
        { type: "increaseDebt", amount: DEP },
        {
          type: "swap",
          from: [{ token: UND, balance: P1000 }],
          tokenOut: POS,
          amountOut: FLOOR,
        },
        {
          type: "changeQuota",
          // Sized off the floor along with the calls: buying quota for a
          // balance the route does not guarantee would pay for collateral the
          // account may never receive.
          quotaIncrease: [
            { token: POS, balance: quotaOf(P1000 + FLOOR) - quotaOf(P1000) },
          ],
          quotaDecrease: [],
          desiredQuota: {},
        },
      ]),
    );

    // The state: the position at the full 2000 the route expects to deliver, not
    // at the 1990 it guarantees.
    const state = result.state;
    expect(assetBalance(state.assets, POS)).toBe(2n * P1000);
    expect(state.totalValue.value).toBe(2n * P1000);
    expect(state.netValue.value).toBe(P1000);
    expect(state.leverage).toBe(2);

    // Debt and quota are the calls' own words, so they read the same on either
    // branch — and the health factor is the expected balances weighed against
    // the quota actually bought, which is exactly what the account will stand at
    // if the route delivers what it expects.
    expect(state.totalDebt.value).toBe(P1000);
    expect(assetBalance(state.quotas, POS)).toBe(quotaOf(P1000 + FLOOR));
    expect(state.healthFactor).toBe(
      Number((quotaOf(P1000 + FLOOR) * 10000n) / P1000),
    );
  });

  it("refuses a floor that lands the account under water, expectation notwithstanding", async () => {
    // A route promising almost nothing: expected still buys 1000 of the
    // position, so the reported branch would clear the facade's bar comfortably,
    // while the floor leaves 1000 of collateral against 1000 of debt. The guard
    // reads the floor, because that is the outcome the transaction is signed
    // against.
    expectPreviewError(await deposit(() => 1n), "insufficientCollateral");
  });
});
