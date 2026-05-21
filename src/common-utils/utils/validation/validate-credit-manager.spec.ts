import { describe, expect, it } from "vitest";
import { buildCreditManager } from "../../test-utils/index.js";
import { validateCreditManager } from "./validate-credit-manager.js";

const mockCreditManager = buildCreditManager({
  isPaused: false,
});

describe("validateCreditManager", () => {
  it("returns null when credit manager is not paused", () => {
    const result = validateCreditManager({
      creditManager: mockCreditManager,
      allowPausedCm: false,
    });
    expect(result).toBeNull();
  });

  it("returns null when credit manager is paused but allowed", () => {
    const result = validateCreditManager({
      creditManager: buildCreditManager({
        ...mockCreditManager,
        isPaused: true,
      }),
      allowPausedCm: true,
    });
    expect(result).toBeNull();
  });

  it("returns error when credit manager is paused and not allowed", () => {
    const result = validateCreditManager({
      creditManager: buildCreditManager({
        ...mockCreditManager,
        isPaused: true,
      }),
      allowPausedCm: false,
    });
    expect(result).toEqual({ message: "paused" });
  });
});
