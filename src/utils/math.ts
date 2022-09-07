import { BigNumber } from "ethers";

import { halfRAY, PERCENTAGE_FACTOR, RAY } from "../core/constants";

const ONE = BigNumber.from(1);
const TWO = BigNumber.from(2);

export function revertRay(num?: BigNumber): BigNumber | undefined {
  if (!num) return undefined;
  return RAY.mul(RAY).div(num);
}

export function rayMul(a: BigNumber, b: BigNumber): BigNumber {
  if (a.isZero() || b.isZero()) {
    return BigNumber.from(0);
  }

  return a.mul(b).add(halfRAY).div(RAY);
}

export function rayDiv(a: BigNumber, b: BigNumber): BigNumber {
  const halfB = b.div(2);

  return a.mul(RAY).add(halfB).div(b);
}

export function percentMul(a: BigNumber, b: number): BigNumber {
  if (a.isZero() || b === 0) return BigNumber.from(0);
  return a
    .mul(b)
    .add(PERCENTAGE_FACTOR / 2)
    .div(PERCENTAGE_FACTOR);
}

export function sqrt(x: BigNumber) {
  let z = x.add(ONE).div(TWO);
  let y = x;
  while (z.sub(y).isNegative()) {
    y = z;
    z = x.div(z).add(z).div(TWO);
  }
  return y;
}

export const nonNegativeBn = (v: BigNumber) =>
  v.isNegative() ? BigNumber.from(0) : v;
