import { expect } from "vitest";

expect.extend({
  /**
   * Asserts that the received bigint deviates from the oracle-estimated
   * `predicted` value by at most `bps` basis points: previews estimate
   * router swaps with oracle conversions, real swaps add slippage and fees.
   */
  toBeWithinBps(received: bigint, predicted: bigint, bps: bigint = 100n) {
    if (typeof received !== "bigint") {
      return {
        pass: false,
        message: () =>
          `expected a bigint within ${bps} bps of ${predicted}, received ${this.utils.printReceived(received)}`,
      };
    }
    const diff =
      received >= predicted ? received - predicted : predicted - received;
    const pass = diff * 10_000n <= predicted * bps;
    return {
      pass,
      message: () =>
        `expected ${received} to ${this.isNot ? "deviate more than" : "be within"} ${bps} bps of ${predicted} (diff ${diff})`,
    };
  },

  /**
   * Asserts that the received bigint is a min guarantee of `actual`: at most
   * `actual`, and within `bps` basis points below it. Previews predict
   * minimal guaranteed amounts, the on-chain result can only be better.
   */
  toBeWithinBpsBelow(received: bigint, actual: bigint, bps: bigint = 100n) {
    if (typeof received !== "bigint") {
      return {
        pass: false,
        message: () =>
          `expected a bigint within ${bps} bps below ${actual}, received ${this.utils.printReceived(received)}`,
      };
    }
    const pass =
      received <= actual && (actual - received) * 10_000n <= received * bps;
    return {
      pass,
      message: () =>
        `expected ${received} to ${this.isNot ? "not " : ""}be within ${bps} bps below ${actual} (diff ${actual - received})`,
    };
  },

  /**
   * Asserts that the received array has exactly the expected elements,
   * regardless of order: `expect.arrayContaining` that also rejects extra
   * elements. Expected elements may contain nested asymmetric matchers.
   */
  toEqualUnordered(received: unknown[], expected: unknown[]) {
    if (!Array.isArray(received)) {
      return {
        pass: false,
        message: () =>
          `expected an array, received ${this.utils.printReceived(received)}`,
      };
    }
    const remaining = [...received];
    for (const item of expected) {
      const idx = remaining.findIndex(r => this.equals(r, item));
      if (idx < 0) {
        return {
          pass: false,
          message: () =>
            `expected array to contain ${this.utils.printExpected(item)}, received ${this.utils.printReceived(received)}`,
        };
      }
      remaining.splice(idx, 1);
    }
    return {
      pass: remaining.length === 0,
      message: () =>
        remaining.length === 0
          ? `expected arrays to differ, but they have the same elements`
          : `expected no extra elements, found ${this.utils.printReceived(remaining)}`,
    };
  },
});

declare module "vitest" {
  // biome-ignore lint/suspicious/noExplicitAny: must match vitest's own `Matchers<T = any>` declaration to merge
  interface Matchers<T = any> {
    /**
     * Asserts that the received bigint deviates from the oracle-estimated
     * `predicted` value by at most `bps` basis points (default 100).
     */
    toBeWithinBps(predicted: bigint, bps?: bigint): T;
    /**
     * Asserts that the received bigint is at most `actual` and within `bps`
     * basis points (default 100) below it: a min guarantee of `actual`.
     */
    toBeWithinBpsBelow(actual: bigint, bps?: bigint): T;
    /**
     * Asserts that the received array has exactly the expected elements,
     * regardless of order. Elements may contain asymmetric matchers.
     */
    toEqualUnordered(expected: unknown[]): T;
  }
}
