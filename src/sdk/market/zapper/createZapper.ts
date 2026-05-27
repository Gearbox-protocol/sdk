import { NATIVE_ADDRESS } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { hexEq } from "../../utils/index.js";
import type { ZapperData } from "../types.js";
import { IERC20ZapperContract } from "./IERC20ZapperContract.js";
import { IETHZapperContract } from "./IETHZapperContract.js";
import { Zapper } from "./Zapper.js";

export function createZapper(
  sdk: OnchainSDK,
  data: ZapperData,
): Zapper | IETHZapperContract | IERC20ZapperContract {
  if (data.type === "base") {
    return hexEq(data.tokenIn.addr, NATIVE_ADDRESS)
      ? new IETHZapperContract(sdk, data)
      : new IERC20ZapperContract(sdk, data);
  }
  return new Zapper(data);
}
