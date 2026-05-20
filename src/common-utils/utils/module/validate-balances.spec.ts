import { describe, expect, it } from "vitest";
import type { Asset } from "../../../sdk/router/types.js";
import { mockToken1, mockToken2 } from "../../../test-utils";
import { validateBalances } from "./validate-balances.js";

describe("validateBalances", () => {
  it("returns null when all balances are valid", () => {
    const result = validateBalances({
      balances: {
        [mockToken1]: 2000n,
        [mockToken2]: 3000n,
      },
      assets: [
        { token: mockToken1, balance: 1000n } as Asset,
        { token: mockToken2, balance: 2000n } as Asset,
      ],
      zeroCheck: true,
    });
    expect(result).toBeNull();
  });

  it("returns error when any balance is invalid", () => {
    const result = validateBalances({
      balances: {
        [mockToken1]: 500n,
        [mockToken2]: 3000n,
      },
      assets: [
        { token: mockToken1, balance: 1000n } as Asset,
        { token: mockToken2, balance: 2000n } as Asset,
      ],
      zeroCheck: true,
    });
    expect(result).toEqual({
      message: "insufficientFunds",
      token: mockToken1,
    });
  });
});
