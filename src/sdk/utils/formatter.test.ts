import { describe, expect, it } from "vitest";
import { toBN } from "./formatter.js";

describe("toBN", () => {
  it("returns 0n for empty string", () => {
    expect(toBN("", 18)).toBe(0n);
  });

  it("returns 0n for zero", () => {
    expect(toBN("0", 18)).toBe(0n);
  });

  it("converts integer input", () => {
    expect(toBN("1000", 8)).toBe(100_000_000_000n);
  });

  it("converts integer with 18 decimals", () => {
    expect(toBN("1", 18)).toBe(10n ** 18n);
  });

  it("converts small decimals (GUSD-like, 2 decimals)", () => {
    expect(toBN("100", 2)).toBe(10_000n);
  });

  it("converts integer with 6 decimals (USDC-like)", () => {
    expect(toBN("1", 6)).toBe(1_000_000n);
  });

  it("converts fractional input with 18 decimals", () => {
    expect(toBN("1.5", 18)).toBe(1_500_000_000_000_000_000n);
  });

  it("converts fractional with fewer digits than decimals", () => {
    expect(toBN("1.5", 6)).toBe(1_500_000n);
  });

  it("converts fractional with exact number of decimal digits", () => {
    expect(toBN("1.123456", 6)).toBe(1_123_456n);
  });

  it("rounds half up when fractional has more digits than decimals", () => {
    expect(toBN("1.1234565", 6)).toBe(1_123_457n);
  });

  it("truncates (no round) when digit after cutoff is below 5", () => {
    expect(toBN("1.1234564", 6)).toBe(1_123_456n);
  });

  it("handles large values that exceed JS Number precision", () => {
    // 2^64 = 18446744073709551616
    expect(toBN("18446744073709551616", 0)).toBe(18_446_744_073_709_551_616n);
    expect(toBN("18446744073709551616", 18)).toBe(
      18_446_744_073_709_551_616n * 10n ** 18n,
    );
  });

  it("handles large fractional values beyond JS Number range", () => {
    // Value has more integer digits than JS Number can represent precisely,
    // but total significant digits fit within decimal.js-light default precision (20)
    expect(toBN("12345678901234.5678", 6)).toBe(12_345_678_901_234_567_800n);
  });

  it("handles negative values", () => {
    expect(toBN("-1.5", 18)).toBe(-1_500_000_000_000_000_000n);
  });

  it("handles negative integer", () => {
    expect(toBN("-100", 6)).toBe(-100_000_000n);
  });

  it("handles 0 decimals", () => {
    expect(toBN("42", 0)).toBe(42n);
    expect(toBN("42.9", 0)).toBe(43n);
    expect(toBN("42.4", 0)).toBe(42n);
  });

  it("handles very small fractional (leading zeros in fraction)", () => {
    expect(toBN("0.000001", 6)).toBe(1n);
    expect(toBN("0.000001", 18)).toBe(1_000_000_000_000n);
  });
});
