import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import { borrowable } from "./guards.js";

const CM = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;

/**
 * `borrowable` decides which ceiling a caller is told about, so each of its
 * three terms has to be able to win, and the tie has to keep the earlier one —
 * which is what the `reduce` it replaced did.
 */
function suiteWith(args: {
  availableLiquidity: bigint;
  maxDebt: bigint;
  multiplier: number;
  managerAvailable?: bigint;
}): CreditSuite {
  return {
    creditManager: { address: CM },
    creditFacade: {
      maxDebt: args.maxDebt,
      maxDebtPerBlockMultiplier: args.multiplier,
    },
    market: {
      pool: {
        pool: {
          availableLiquidity: args.availableLiquidity,
          creditManagerDebtParams: {
            get: () =>
              args.managerAvailable === undefined
                ? undefined
                : { available: args.managerAvailable },
          },
        },
      },
    },
  } as unknown as CreditSuite;
}

describe("borrowable", () => {
  it("reports the pool's free liquidity when it is the tightest", () => {
    expect(
      borrowable(
        suiteWith({
          availableLiquidity: 100n,
          maxDebt: 1000n,
          multiplier: 1,
          managerAvailable: 500n,
        }),
      ),
    ).toEqual({ limit: 100n, binding: "poolAvailableLiquidity" });
  });

  it("reports the facade's per-block cap when it is the tightest", () => {
    expect(
      borrowable(
        suiteWith({
          availableLiquidity: 1000n,
          maxDebt: 50n,
          multiplier: 2,
          managerAvailable: 500n,
        }),
      ),
    ).toEqual({ limit: 100n, binding: "facadePerBlockCap" });
  });

  it("reports the manager's remaining allowance when it is the tightest", () => {
    expect(
      borrowable(
        suiteWith({
          availableLiquidity: 1000n,
          maxDebt: 1000n,
          multiplier: 1,
          managerAvailable: 7n,
        }),
      ),
    ).toEqual({ limit: 7n, binding: "managerDebtAvailable" });
  });

  it("keeps the earlier term when two ceilings tie", () => {
    expect(
      borrowable(
        suiteWith({
          availableLiquidity: 100n,
          maxDebt: 100n,
          multiplier: 1,
          managerAvailable: 100n,
        }),
      ),
    ).toEqual({ limit: 100n, binding: "poolAvailableLiquidity" });
  });

  it("omits the manager's allowance when the pool reports none for it", () => {
    expect(
      borrowable(
        suiteWith({ availableLiquidity: 1000n, maxDebt: 40n, multiplier: 1 }),
      ),
    ).toEqual({ limit: 40n, binding: "facadePerBlockCap" });
  });

  it("names the cap when borrowing is switched off for the block", () => {
    // Nothing is weighed: the multiplier alone closes the door.
    expect(
      borrowable(
        suiteWith({
          availableLiquidity: 1000n,
          maxDebt: 1000n,
          multiplier: 0,
          managerAvailable: 1000n,
        }),
      ),
    ).toEqual({ limit: 0n, binding: "facadePerBlockCap" });
  });
});
