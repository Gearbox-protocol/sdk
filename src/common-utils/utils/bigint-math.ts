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
   *
   * @param a First candidate value.
   * @param b Second candidate value.
   * @returns The larger value between `a` and `b`.
   */
  static max = (a: bigint, b: bigint) => (a > b ? a : b);

  /**
   * Returns the smaller of two bigint values.
   *
   * @param a First candidate value.
   * @param b Second candidate value.
   * @returns The smaller value between `a` and `b`.
   */
  static min = (a: bigint, b: bigint) => (a < b ? a : b);

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
}
