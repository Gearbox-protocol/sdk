import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { calcLiquidationPriceForTarget } from "../../positions/calcLiquidationPriceForTarget.js";
import { toBN } from "../../utils/index.js";
import { collateralPriceInUnderlying } from "./collateralPriceInUnderlying.js";
import type { IPriceOracleContract } from "./types.js";

const WETH =
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2".toLowerCase() as Address;
const USDC =
  "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48".toLowerCase() as Address;
const CBETH =
  "0xBe9895146f7AF43049ca1c1AE358B0541Ea49704".toLowerCase() as Address;

/**
 * An oracle answering USD per whole token in `PRICE_DECIMALS`, which is what
 * `mainPrice` speaks, and throwing for a token it was given no answer for.
 */
function oracleOf(prices: Record<Address, bigint>): IPriceOracleContract {
  return {
    mainPrice: (token: Address): bigint => {
      const price = prices[token.toLowerCase() as Address];
      if (price === undefined) {
        throw new Error(`no feed for ${token}`);
      }
      return price;
    },
  } as unknown as IPriceOracleContract;
}

describe("collateralPriceInUnderlying", () => {
  it("divides the two main feeds, in the oracle's own scale", () => {
    const oracle = oracleOf({
      [CBETH]: 2_269n * 10n ** 8n,
      [WETH]: 2_000n * 10n ** 8n,
    });
    // 2269 / 2000 = 1.1345 WETH per cbETH
    expect(collateralPriceInUnderlying(oracle, CBETH, WETH)).toBe(113_450_000n);
  });

  it("answers per whole token, whatever the two tokens' decimals are", () => {
    // USDC has six decimals and WETH eighteen; the feeds are per token, so the
    // ratio carries no decimal correction and the answer is plain USDC per WETH
    const oracle = oracleOf({
      [WETH]: 2_000n * 10n ** 8n,
      [USDC]: 1n * 10n ** 8n,
    });
    expect(collateralPriceInUnderlying(oracle, WETH, USDC)).toBe(
      2_000n * 10n ** 8n,
    );
  });

  it("reads as a pair with the liquidation price of the same position", () => {
    // 10 WETH at 2000 USDC is 20k of collateral, 17k of it weighed in at an
    // 85% threshold, against 8.5k of debt — a health factor of exactly 2
    const oracle = oracleOf({
      [WETH]: 2_000n * 10n ** 8n,
      [USDC]: 1n * 10n ** 8n,
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
    const oracle = oracleOf({ [WETH]: 2_000n * 10n ** 8n, [USDC]: 0n });
    expect(collateralPriceInUnderlying(oracle, WETH, USDC)).toBeNull();
  });

  it("is null when the oracle cannot answer for either side", () => {
    const oracle = oracleOf({ [USDC]: 1n * 10n ** 8n });
    expect(collateralPriceInUnderlying(oracle, WETH, USDC)).toBeNull();
    expect(collateralPriceInUnderlying(oracle, USDC, WETH)).toBeNull();
  });
});
