import { BigNumber } from "ethers";
import {RAY} from "../core/constants";

export function revertRay(num?: BigNumber): BigNumber | undefined {
    if (!num) return undefined
  return RAY.mul(RAY).div(num);
}
