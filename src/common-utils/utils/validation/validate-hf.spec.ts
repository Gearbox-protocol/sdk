import { describe, expect, it } from "vitest";
import { MIN_HF_LIMITED, validateHF } from "./validate-hf.js";

describe("validateHF", () => {
  it("returns null when HF is above minimum", () => {
    const result = validateHF({ hf: 15000 });
    expect(result).toBeNull();
  });

  it("returns error when HF is undefined", () => {
    const result = validateHF({ hf: undefined });
    expect(result).toEqual({ message: "hfTooLow" });
  });

  it("returns error when HF is too low", () => {
    const result = validateHF({ hf: Number(MIN_HF_LIMITED) });
    expect(result).toEqual({ message: "hfTooLow" });
  });

  it("returns null when hfCheck is false and HF is too low", () => {
    const result = validateHF({
      hf: Number(MIN_HF_LIMITED - 1n),
      hfCheck: false,
    });
    expect(result).toBeNull();
  });
});
