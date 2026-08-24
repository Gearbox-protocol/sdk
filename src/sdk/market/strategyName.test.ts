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
  it("joins the target and underlying display symbols", () => {
    expect(strategyName(token(WSTETH, "wstETH"), token(WETH, "WETH"))).toBe(
      "wstETH / WETH",
    );
  });
});
