import { describe, expect, it } from "vitest";
import { checkBoolean } from "./check-boolean.js";

describe("checkBoolean", () => {
  it("should return 0 when both values are true", () => {
    const result = checkBoolean(true, true);
    expect(result).toBe(0);
  });

  it("should return -1 when first value is true and second is false", () => {
    const result = checkBoolean(true, false);
    expect(result).toBe(-1);
  });

  it("should return 1 when first value is false and second is true", () => {
    const result = checkBoolean(false, true);
    expect(result).toBe(1);
  });

  it("should return 0 when both values are false", () => {
    const result = checkBoolean(false, false);
    expect(result).toBe(0);
  });
});
