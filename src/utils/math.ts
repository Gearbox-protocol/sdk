import { BigNumber } from "ethers";
import {RAY} from "@diesellabs/gearbox-sdk";

export function revertRay(num?: BigNumber): BigNumber | undefined {
    if (!num) return undefined
  return RAY.mul(RAY).div(num);
}
