import { describe, expect, it } from "vitest";
import type { CreditSuite, CreditSuiteStrategy } from "./credit/index.js";
import { MarketSuite } from "./MarketSuite.js";

interface FakeStrategy {
  name: string;
  isListed: boolean;
}

/**
 * The method is borrowed onto a plain object: it only walks the credit
 * managers, and a real market needs a loaded snapshot to exist.
 */
function strategiesOf(
  ...strategies: Array<FakeStrategy | undefined>
): CreditSuiteStrategy[] {
  const creditManagers = strategies.map(
    strategy => ({ strategy }) as unknown as CreditSuite,
  );
  return MarketSuite.prototype.strategies.call({
    creditManagers,
  } as unknown as MarketSuite);
}

describe("MarketSuite.strategies", () => {
  it("keeps listed strategies in manager order and skips the rest", () => {
    const listed = strategiesOf(
      undefined,
      { name: "A", isListed: true },
      { name: "B", isListed: false },
      { name: "C", isListed: true },
    );
    expect(listed.map(s => s.name)).toEqual(["A", "C"]);
  });
});
