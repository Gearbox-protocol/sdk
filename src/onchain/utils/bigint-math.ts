/**
 * Utility namespace for common `bigint` operations.
 *
 * The constructor is private because this class is not meant to be
 * instantiated; all helpers are exposed as static functions.
 */
export class BigIntMath {
  private constructor() {}

  /**
   * Returns the absolute (non-negative) value of a bigint.
   *
   * @param x Input value.
   * @returns `x` when `x` is already non-negative, otherwise `-x`.
   */
  static abs = (x: bigint) => (x < 0n ? -x : x);

  /**
   * Returns the greater of two bigint values.
   * @param values - The values to find the maximum of.
   * @returns The maximum value.
   */
  static max = (...values: bigint[]): bigint => {
    return values.reduce((max, v) => (v > max ? v : max));
  };

  /**
   * Returns the smaller of two bigint values.
   * @param values - The values to find the minimum of.
   * @returns The minimum value.
   */
  static min = (...values: bigint[]): bigint => {
    return values.reduce((min, v) => (v < min ? v : min));
  };

  /**
   * Returns the negative form of a bigint if it is currently positive.
   *
   * Useful when a value should be represented as an outflow/debit:
   * - positive values become negative
   * - zero and negative values are returned unchanged
   *
   * @param a Input value.
   * @returns A non-positive bigint representation of `a`.
   */
  static neg = (a: bigint) => (a > 0 ? a * -1n : a);

  /**
   * Divides rounding toward positive infinity.
   *
   * @param a - Dividend; must not be negative.
   * @param b - Divisor; must be positive — zero throws, negative returns
   * nonsense rather than the ceiling.
   * @returns The smallest integer that is at least `a / b`.
   **/
  static ceilDiv = (a: bigint, b: bigint): bigint => (a + b - 1n) / b;
}
