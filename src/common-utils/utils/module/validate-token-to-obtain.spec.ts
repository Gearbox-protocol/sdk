import { describe, expect, it } from "vitest";
import { buildCreditManager, mockToken1 } from "../../../test-utils";
import { validateTokenToObtain } from "./validate-token-to-obtain.js";

const mockCreditManager = buildCreditManager({
  forbiddenTokens: {},
});

describe("validateTokenToObtain", () => {
  it("returns null when targetToken is null", () => {
    const result = validateTokenToObtain({
      targetToken: null,
      creditManager: mockCreditManager,
    });
    expect(result).toBeNull();
  });

  it("returns null when targetToken is not forbidden", () => {
    const result = validateTokenToObtain({
      targetToken: mockToken1,
      creditManager: mockCreditManager,
    });
    expect(result).toBeNull();
  });

  it("returns error when targetToken is forbidden", () => {
    const result = validateTokenToObtain({
      targetToken: mockToken1,
      creditManager: buildCreditManager({
        ...mockCreditManager,
        forbiddenTokens: {
          [mockToken1]: true,
        },
      }),
    });
    expect(result).toEqual({ message: "tokenIsForbidden", token: mockToken1 });
  });
});
