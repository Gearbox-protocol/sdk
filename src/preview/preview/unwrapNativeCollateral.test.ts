import { type Address, getAddress, padHex, parseEther } from "viem";
import { describe, expect, it } from "vitest";
import { NATIVE_ADDRESS } from "../../sdk/index.js";
import { InvalidTransactionValueError } from "./errors.js";
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

const addr = (hex: string) => getAddress(padHex(hex as Address, { size: 20 }));

const WETH = addr("0x4e7");
const USDC = addr("0x05");
const DAI = addr("0x06");

describe("unwrapNativeCollateral", () => {
  it("returns collateral unchanged when no native value is attached", () => {
    const collateral = [{ token: WETH, balance: parseEther("10") }];

    expect(unwrapNativeCollateral(collateral, 0n, WETH)).toBe(collateral);
  });

  it("replaces WETH entirely when native value matches it exactly", () => {
    const collateral = [{ token: WETH, balance: parseEther("10") }];

    expect(unwrapNativeCollateral(collateral, parseEther("10"), WETH)).toEqual([
      { token: NATIVE_ADDRESS, balance: parseEther("10") },
    ]);
  });

  it("splits WETH into native and remainder when native value is smaller", () => {
    const collateral = [{ token: WETH, balance: parseEther("10") }];

    expect(unwrapNativeCollateral(collateral, parseEther("5"), WETH)).toEqual([
      { token: NATIVE_ADDRESS, balance: parseEther("5") },
      { token: WETH, balance: parseEther("5") },
    ]);
  });

  it("throws when native value exceeds WETH collateral", () => {
    const collateral = [{ token: WETH, balance: parseEther("10") }];

    expect(() =>
      unwrapNativeCollateral(collateral, parseEther("11"), WETH),
    ).toThrow(InvalidTransactionValueError);
  });

  it("throws when native value is attached but there is no WETH collateral", () => {
    const collateral = [{ token: USDC, balance: 1_000_000n }];

    expect(() =>
      unwrapNativeCollateral(collateral, parseEther("1"), WETH),
    ).toThrow(InvalidTransactionValueError);
  });

  it("preserves other collateral entries and their order", () => {
    const collateral = [
      { token: USDC, balance: 1_000_000n },
      { token: WETH, balance: parseEther("10") },
      { token: DAI, balance: parseEther("100") },
    ];

    expect(unwrapNativeCollateral(collateral, parseEther("4"), WETH)).toEqual([
      { token: USDC, balance: 1_000_000n },
      { token: NATIVE_ADDRESS, balance: parseEther("4") },
      { token: WETH, balance: parseEther("6") },
      { token: DAI, balance: parseEther("100") },
    ]);
  });
});
