import { getAddress } from "viem";
import { describe, expect, it } from "vitest";
import type { Token } from "../../model/index.js";
import { strategyName } from "./strategyName.js";

const WSTETH = getAddress("0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0");
const WETH = getAddress("0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2");

function token(address: Token["address"], symbol: string): Token {
  return {
    chainId: 1,
    address,
    symbol,
    name: symbol,
    decimals: 18,
  };
}

describe("strategyName", () => {
  it("uses the target ticker when no pretty name is configured", () => {
    expect(
      strategyName(token(WSTETH, "wstETH"), token(WETH, "WETH"), "Mainnet"),
    ).toBe("wstETH / WETH");
  });

  it("accepts a numeric chain id for the same lookup", () => {
    expect(strategyName(token(WSTETH, "wstETH"), token(WETH, "WETH"), 1)).toBe(
      "wstETH / WETH",
    );
  });
});
