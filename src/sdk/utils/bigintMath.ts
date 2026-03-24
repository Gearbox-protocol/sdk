export class BigIntMath {
  static abs = (x: bigint) => (x < 0n ? -x : x);
  static max = (a: bigint, b: bigint) => (a > b ? a : b);
  static min = (a: bigint, b: bigint) => (a < b ? a : b);
  static neg = (a: bigint) => (a > 0 ? a * -1n : a);
}
