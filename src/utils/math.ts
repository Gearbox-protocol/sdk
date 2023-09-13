import { halfRAY, PERCENTAGE_FACTOR, RAY } from "@gearbox-protocol/sdk-gov";
import { BigNumber } from "ethers";

export function revertRay(num?: bigint): bigint | undefined {
  if (!num) return undefined;
  return (RAY * RAY) / num;
}

export function rayMul(a: bigint, b: bigint): bigint {
  if (a === 0n || b === 0n) return 0n;
  return (a * b + halfRAY) / RAY;
}

export function rayDiv(a: bigint, b: bigint): bigint {
  const halfB = b / 2n;
  return (a * RAY + halfB) / b;
}

export function percentMul(a: bigint, b: number): bigint {
  if (a === 0n || b === 0) return 0n;
  return (a * BigInt(b) + PERCENTAGE_FACTOR / 2n) / PERCENTAGE_FACTOR;
}

export function sqrt(x: bigint) {
  let z = (x + 1n) / 2n;
  let y = x;
  while (z - y < 0) {
    y = z;
    z = (x / z + z) / 2n;
  }
  return y;
}

export const nonNegativeBn = (v: bigint): bigint => (v < 0 ? 0n : v);

export class BigIntMath {
  static abs = (x: bigint) => (x < 0n ? -x : x);
  static toHexString = (x: bigint) => BigNumber.from(x).toHexString();
}
