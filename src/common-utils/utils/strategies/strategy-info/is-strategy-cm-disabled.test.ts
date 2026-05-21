import { describe, expect, it } from "vitest";

import {
  buildCreditManager,
  buildQuota,
  mockToken1,
} from "../../../test-utils/index.js";
import { isStrategyCMDisabled } from "./is-strategy-cm-disabled.js";

describe("isStrategyCMDisabled", () => {
  it("returns true when quota is missing", () => {
    const cm = buildCreditManager({ minDebt: 100n, availableToBorrow: 300n });
    const result = isStrategyCMDisabled(cm, undefined);

    expect(result).toBe(true);
  });

  it("returns true when quota is inactive", () => {
    const cm = buildCreditManager({ minDebt: 100n, availableToBorrow: 300n });
    const quota = buildQuota({
      token: mockToken1,
      rate: 0n,
      limit: 500n,
      totalQuoted: 0n,
      isActive: false,
    });

    const result = isStrategyCMDisabled(cm, quota);

    expect(result).toBe(true);
  });
  it("returns true when quota left is below min debt", () => {
    const cm = buildCreditManager({ minDebt: 100n, availableToBorrow: 300n });
    const quota = buildQuota({
      token: mockToken1,
      rate: 0n,
      limit: 120n,
      totalQuoted: 30n,
    });

    const result = isStrategyCMDisabled(cm, quota);

    expect(result).toBe(true);
  });
  it("returns true when availableToBorrow is below min debt", () => {
    const cm = buildCreditManager({ availableToBorrow: 50n, minDebt: 100n });
    const quota = buildQuota({
      token: mockToken1,
      rate: 0n,
      limit: 500n,
      totalQuoted: 50n,
    });

    const result = isStrategyCMDisabled(cm, quota);

    expect(result).toBe(true);
  });

  it("returns false when quota and availableToBorrow are sufficient", () => {
    const cm = buildCreditManager({ minDebt: 100n, availableToBorrow: 300n });
    const quota = buildQuota({
      token: mockToken1,
      rate: 0n,
      limit: 500n,
      totalQuoted: 0n,
      isActive: true,
    });

    const result = isStrategyCMDisabled(cm, quota);

    expect(result).toBe(false);
  });
});
