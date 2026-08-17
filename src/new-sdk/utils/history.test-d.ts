import { describe, expectTypeOf, it } from "vitest";
import type {
  PoolPositionRef,
  StrategyPositionRef,
} from "../../model/index.js";
import type { Positions } from "../positions/types.js";

/**
 * The position history metrics the UI asked for (plan §3.3) compile for
 * their subject kind and not for the other.
 */
describe("position history metrics", () => {
  const positions = {} as Positions<"both">;
  const pool = {} as PoolPositionRef;
  const strategy = {} as StrategyPositionRef;

  it("a strategy position charts netValue, pnl and healthFactor", () => {
    expectTypeOf(positions.history(strategy).chart).toBeCallableWith(
      "netValue",
      "1m",
    );
    expectTypeOf(positions.history(strategy).chart).toBeCallableWith(
      "pnl",
      "1y",
    );
    expectTypeOf(positions.history(strategy).chart).toBeCallableWith(
      "healthFactor",
      "1w",
    );
  });

  it("a pool position charts its balance", () => {
    expectTypeOf(positions.history(pool).chart).toBeCallableWith(
      "balance",
      "1m",
    );
  });

  it("neither kind accepts the other's series", () => {
    // @ts-expect-error `balance` is a pool-position metric
    positions.history(strategy).chart("balance", "1m");
    // @ts-expect-error `healthFactor` is a strategy-position metric
    positions.history(pool).chart("healthFactor", "1m");
    // @ts-expect-error `pnl` is a strategy-position metric
    positions.history(pool).chart("pnl", "1m");
  });
});
