import { PRICE_DECIMALS, WAD } from "../../sdk/index.js";

interface Target {
  price: bigint;
  decimals: number | undefined;
}

/**
 * Static utility namespace for converting between token amounts and
 * normalized value using oracle-like prices.
 *
 * All helpers rely on shared fixed-point constants (`WAD` and
 * `PRICE_DECIMALS`) to keep arithmetic consistent across assets
 * with different token decimal precisions.
 */
export class PriceUtils {
  /**
   * This class is intentionally non-instantiable.
   */
  private constructor() {}

  /**
   * Calculates normalized total value for a token amount at a given price.
   *
   * Formula:
   * `(amount * WAD * price) / 10^decimals / PRICE_DECIMALS`
   *
   * @param price Token unit price in `PRICE_DECIMALS` precision.
   * @param amount Token amount in raw token units.
   * @param decimals Token decimals used to normalize `amount` (defaults to `18`).
   * @returns Total value in WAD-normalized units.
   */
  static calcTotalPrice = (
    price: bigint,
    amount: bigint,
    decimals: number | undefined = 18,
  ): bigint =>
    (amount * WAD * price) / 10n ** BigInt(decimals) / PRICE_DECIMALS;

  /**
   * Converts a normalized monetary value into target token amount by price.
   *
   * Formula:
   * `(totalMoney * 10^targetDecimals * PRICE_DECIMALS) / targetPrice / WAD`
   *
   * Safety behavior:
   * - returns `0n` when `targetPrice <= 0n` to avoid invalid division
   *
   * @param totalMoney Value to convert, expected in WAD-normalized units.
   * @param target Conversion target configuration:
   * - `price`: target token unit price in `PRICE_DECIMALS` precision
   * - `decimals`: target token decimals (defaults to `18`)
   * @returns Target token amount in raw token units.
   */
  static convertByPrice(
    totalMoney: bigint,
    { price: targetPrice, decimals: targetDecimals = 18 }: Target,
  ): bigint {
    if (targetPrice <= 0n) return 0n;
    return (
      (totalMoney * 10n ** BigInt(targetDecimals) * PRICE_DECIMALS) /
      targetPrice /
      WAD
    );
  }
}
