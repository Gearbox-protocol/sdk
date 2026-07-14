import { type Address, getAddress, padHex, parseEther } from "viem";
import { describe, expect, it } from "vitest";
import { NATIVE_ADDRESS } from "../../sdk/index.js";
import { ERROR_INVALID_TRANSACTION_VALUE } from "./types.js";
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

const addr = (hex: string) => getAddress(padHex(hex as Address, { size: 20 }));

const WETH = addr("0x4e7");
const USDC = addr("0x05");
const DAI = addr("0x06");

describe("unwrapNativeCollateral", () => {
  it("returns collateral unchanged when no native value is attached", () => {
    const collateral = [{ token: WETH, balance: parseEther("10") }];

    const { assets, error } = unwrapNativeCollateral(collateral, 0n, WETH);
    expect(assets).toBe(collateral);
    expect(error).toBeUndefined();
  });

  it("replaces WETH entirely when native value matches it exactly", () => {
    const collateral = [{ token: WETH, balance: parseEther("10") }];

    const { assets, error } = unwrapNativeCollateral(
      collateral,
      parseEther("10"),
      WETH,
    );
    expect(assets).toEqual([
      { token: NATIVE_ADDRESS, balance: parseEther("10") },
    ]);
    expect(error).toBeUndefined();
  });

  it("splits WETH into native and remainder when native value is smaller", () => {
    const collateral = [{ token: WETH, balance: parseEther("10") }];

    const { assets, error } = unwrapNativeCollateral(
      collateral,
      parseEther("5"),
      WETH,
    );
    expect(assets).toEqual([
      { token: WETH, balance: parseEther("5") },
      { token: NATIVE_ADDRESS, balance: parseEther("5") },
    ]);
    expect(error).toBeUndefined();
  });

  it("reports an error and returns collateral as-is when native value exceeds WETH collateral", () => {
    const collateral = [{ token: WETH, balance: parseEther("10") }];

    const { assets, error } = unwrapNativeCollateral(
      collateral,
      parseEther("11"),
      WETH,
    );
    expect(assets).toBe(collateral);
    expect(error).toEqual({
      code: ERROR_INVALID_TRANSACTION_VALUE,
      message: expect.stringContaining("exceeds WETH collateral"),
    });
  });

  it("reports an error and returns collateral as-is when native value is attached but there is no WETH collateral", () => {
    const collateral = [{ token: USDC, balance: 1_000_000n }];

    const { assets, error } = unwrapNativeCollateral(
      collateral,
      parseEther("1"),
      WETH,
    );
    expect(assets).toBe(collateral);
    expect(error).toEqual({
      code: ERROR_INVALID_TRANSACTION_VALUE,
      message: expect.stringContaining("exceeds WETH collateral"),
    });
  });

  it("preserves other collateral entries", () => {
    const collateral = [
      { token: USDC, balance: 1_000_000n },
      { token: WETH, balance: parseEther("10") },
      { token: DAI, balance: parseEther("100") },
    ];

    const { assets, error } = unwrapNativeCollateral(
      collateral,
      parseEther("4"),
      WETH,
    );
    expect(assets).toEqual([
      { token: USDC, balance: 1_000_000n },
      { token: WETH, balance: parseEther("6") },
      { token: DAI, balance: parseEther("100") },
      { token: NATIVE_ADDRESS, balance: parseEther("4") },
    ]);
    expect(error).toBeUndefined();
  });
});
