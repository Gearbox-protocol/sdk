import { describe, expect, it } from "vitest";

import { isStrategyReleased } from "./is-strategy-released.js";

describe("isStrategyReleased", () => {
  it("returns true when releaseAt is undefined", () => {
    expect(isStrategyReleased(undefined, 1_000)).toBe(true);
  });

  it("returns true when current time is after releaseAt", () => {
    expect(isStrategyReleased(100, 200)).toBe(true);
  });

  it("returns false when current time is before or equal releaseAt", () => {
    expect(isStrategyReleased(200, 200)).toBe(false);
    expect(isStrategyReleased(300, 200)).toBe(false);
  });
});
