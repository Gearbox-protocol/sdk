import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { wrapTokenAddress } from "./wrap-token-address.js";

describe("wrapTokenAddress", () => {
  const native: Address = "0xeeee";
  const wrapped: Address = "0xweth";

  it("returns wrapped when token matches native", () => {
    expect(wrapTokenAddress(native, native, wrapped)).toBe(wrapped);
  });

  it("returns token when it does not match native", () => {
    expect(wrapTokenAddress("0xother", native, wrapped)).toBe("0xother");
  });
});
