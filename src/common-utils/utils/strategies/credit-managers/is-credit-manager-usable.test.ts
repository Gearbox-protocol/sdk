import { describe, expect, it } from "vitest";

import { buildCreditManager } from "../__test-utils.js";
import { isCreditManagerUsable } from "./is-credit-manager-usable.js";

describe("isCreditManagerUsable", () => {
  it("returns false when borrowing is forbidden", () => {
    const cm = buildCreditManager({ isBorrowingForbidden: true } as any);

    expect(isCreditManagerUsable(cm as any)).toBe(false);
  });

  it("returns false for version in v3.0 range", () => {
    const cm = buildCreditManager({ version: 300 } as any);

    expect(isCreditManagerUsable(cm as any)).toBe(false);
  });
});
