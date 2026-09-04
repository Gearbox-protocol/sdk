import { describe, expect, it } from "vitest";
import { calcLiquidationPriceForTarget } from "../../positions/calcLiquidationPriceForTarget.js";
import { toBN } from "../../utils/index.js";
import { collateralPriceInUnderlying } from "./collateralPriceInUnderlying.js";
import { MockTokens, TestPriceOracle } from "./TestPriceOracle.mock.js";

const { WETH, USDC, cbETH } = MockTokens;

describe("collateralPriceInUnderlying", () => {
  it("divides the two main feeds, in the oracle's own scale", () => {
    const oracle = new TestPriceOracle({
      [cbETH]: { price: 2_269 },
      [WETH]: { price: 2_000 },
    });
    // 2269 / 2000 = 1.1345 WETH per cbETH
    expect(collateralPriceInUnderlying(oracle, cbETH, WETH)).toBe(113_450_000n);
  });

  it("answers per whole token, whatever the two tokens' decimals are", () => {
    // USDC has six decimals and WETH eighteen; the feeds are per token, so the
    // ratio carries no decimal correction and the answer is plain USDC per WETH
    const oracle = new TestPriceOracle({
      [WETH]: { price: 2_000 },
      [USDC]: { price: 1 },
    });
    expect(collateralPriceInUnderlying(oracle, WETH, USDC)).toBe(
      2_000n * 10n ** 8n,
    );
  });

  it("reads as a pair with the liquidation price of the same position", () => {
    // 10 WETH at 2000 USDC is 20k of collateral, 17k of it weighed in at an
    // 85% threshold, against 8.5k of debt — a health factor of exactly 2
    const oracle = new TestPriceOracle({
      [WETH]: { price: 2_000 },
      [USDC]: { price: 1 },
    });
    const currentPrice = collateralPriceInUnderlying(oracle, WETH, USDC);
    const liquidationPrice = calcLiquidationPriceForTarget({
      snapshot: {
        creditManager: USDC,
        assets: [{ token: WETH, balance: toBN("10", 18) }],
        quotas: [],
        totalDebt: toBN("8500", 6),
        totalValue: toBN("20000", 6),
      },
      targetToken: WETH,
      underlying: USDC,
      decimals: { [WETH]: 18, [USDC]: 6 },
      liquidationThresholds: { [WETH]: 8500, [USDC]: 9000 },
    });

    // twice the room means half the price: the same denomination and the same
    // scale, which is the whole reason the two are reported together
    expect(currentPrice).toBe(2_000n * 10n ** 8n);
    expect(liquidationPrice * 2n).toBe(currentPrice);
  });

  it("is null when the underlying has no price rather than dividing by zero", () => {
    const oracle = new TestPriceOracle({
      [WETH]: { price: 2_000 },
      [USDC]: { price: 0 },
    });
    expect(collateralPriceInUnderlying(oracle, WETH, USDC)).toBeNull();
  });

  it("is null when the oracle cannot answer for either side", () => {
    const oracle = new TestPriceOracle({ [USDC]: { price: 1 } });
    expect(collateralPriceInUnderlying(oracle, WETH, USDC)).toBeNull();
    expect(collateralPriceInUnderlying(oracle, USDC, WETH)).toBeNull();
  });
});
