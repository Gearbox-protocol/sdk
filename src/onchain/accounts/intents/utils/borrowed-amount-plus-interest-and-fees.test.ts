import { describe, expect, it } from "vitest";

import { calcBorrowedAmountPlusInterestAndFees } from "./borrowed-amount-plus-interest-and-fees.js";

describe("calcBorrowedAmountPlusInterestAndFees", () => {
  it("sums principal, interest and fees", () => {
    expect(
      calcBorrowedAmountPlusInterestAndFees({
        debt: 4000000000000n,
        accruedInterest: 12000000000n,
        accruedFees: 3000000000n,
      }),
    ).toBe(4015000000000n);
  });

  it("zero interest and fees → principal", () => {
    expect(
      calcBorrowedAmountPlusInterestAndFees({
        debt: 4000000000000n,
        accruedInterest: 0n,
        accruedFees: 0n,
      }),
    ).toBe(4000000000000n);
  });
});
