import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { CreditSuite } from "./CreditSuite.js";

const address = (i: number): Address =>
  `0x${i.toString(16).padStart(40, "0")}` as Address;

/**
 * Reads the getter off the prototype against a hand-built state, so the decode
 * is exercised without standing a whole market up.
 */
function forbiddenOf(mask: bigint, count: number): Address[] {
  const suite = {
    creditFacade: { forbiddenTokensMask: mask },
    creditManager: {
      collateralTokens: Array.from({ length: count }, (_, i) => address(i)),
    },
  };
  const getter = Object.getOwnPropertyDescriptor(
    CreditSuite.prototype,
    "forbiddenTokens",
  )?.get;
  if (!getter) throw new Error("forbiddenTokens is no longer a getter");
  return getter.call(suite);
}

/**
 * The mask is a `uint256` and a credit manager may hold well over 32 collateral
 * tokens. Shifting a JS `number` silently wraps at bit 31 — the bug this pins,
 * which once mis-flagged token 0 as forbidden whenever token 32 was.
 */
describe("CreditSuite.forbiddenTokens", () => {
  it("returns nothing for an empty mask", () => {
    expect(forbiddenOf(0n, 40)).toEqual([]);
  });

  it("decodes the low bits", () => {
    expect(forbiddenOf(0b101n, 4)).toEqual([address(0), address(2)]);
  });

  it("decodes a bit past 31 without wrapping onto a low one", () => {
    expect(forbiddenOf(1n << 32n, 40)).toEqual([address(32)]);
    expect(forbiddenOf(1n << 40n, 64)).toEqual([address(40)]);
  });

  it("keeps a high and a low bit apart", () => {
    expect(forbiddenOf((1n << 32n) | 1n, 40)).toEqual([
      address(0),
      address(32),
    ]);
  });

  it("ignores bits with no collateral behind them", () => {
    expect(forbiddenOf(1n << 100n, 4)).toEqual([]);
  });
});
