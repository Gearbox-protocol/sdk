import { type Address, getAddress, padHex, parseEther } from "viem";
import { describe, expect, it } from "vitest";
import { isSDKError, sdkOk } from "../../model/index.js";
import { NATIVE_ADDRESS } from "../../onchain/index.js";
import { unwrapNativeCollateral } from "./unwrapNativeCollateral.js";

const addr = (hex: string) => getAddress(padHex(hex as Address, { size: 20 }));

const WETH = addr("0x4e7");
const USDC = addr("0x05");
const DAI = addr("0x06");

describe("unwrapNativeCollateral", () => {
  it("returns collateral unchanged when no native value is attached", () => {
    const collateral = [{ token: WETH, balance: parseEther("10") }];

    const answer = unwrapNativeCollateral(collateral, 0n, WETH);
    expect(answer).toEqual(sdkOk(collateral));
    if (answer.ok) {
      expect(answer.data).toBe(collateral);
    }
  });

  it("replaces WETH entirely when native value matches it exactly", () => {
    const collateral = [{ token: WETH, balance: parseEther("10") }];

    const answer = unwrapNativeCollateral(collateral, parseEther("10"), WETH);
    expect(answer).toEqual(
      sdkOk([{ token: NATIVE_ADDRESS, balance: parseEther("10") }]),
    );
  });

  it("splits WETH into native and remainder when native value is smaller", () => {
    const collateral = [{ token: WETH, balance: parseEther("10") }];

    const answer = unwrapNativeCollateral(collateral, parseEther("5"), WETH);
    expect(answer).toEqual(
      sdkOk([
        { token: WETH, balance: parseEther("5") },
        { token: NATIVE_ADDRESS, balance: parseEther("5") },
      ]),
    );
  });

  it("answers malformedTransaction when native value exceeds WETH collateral", () => {
    const collateral = [{ token: WETH, balance: parseEther("10") }];

    const answer = unwrapNativeCollateral(collateral, parseEther("11"), WETH);
    expect(isSDKError(answer)).toBe(true);
    if (!isSDKError(answer)) {
      throw new Error("expected a refusal");
    }
    expect(answer.error.code).toBe("malformedTransaction");
  });

  it("answers malformedTransaction when native value is attached but there is no WETH collateral", () => {
    const collateral = [{ token: USDC, balance: 1_000_000n }];

    const answer = unwrapNativeCollateral(collateral, parseEther("1"), WETH);
    expect(isSDKError(answer)).toBe(true);
    if (!isSDKError(answer)) {
      throw new Error("expected a refusal");
    }
    expect(answer.error.code).toBe("malformedTransaction");
  });

  it("preserves other collateral entries", () => {
    const collateral = [
      { token: USDC, balance: 1_000_000n },
      { token: WETH, balance: parseEther("10") },
      { token: DAI, balance: parseEther("100") },
    ];

    const answer = unwrapNativeCollateral(collateral, parseEther("4"), WETH);
    expect(answer).toEqual(
      sdkOk([
        { token: USDC, balance: 1_000_000n },
        { token: WETH, balance: parseEther("6") },
        { token: DAI, balance: parseEther("100") },
        { token: NATIVE_ADDRESS, balance: parseEther("4") },
      ]),
    );
  });
});
