import type { OnchainSDK } from "../../OnchainSDK.js";
import { bytes32ToString } from "../../utils/index.js";
import type { ZapperData } from "../types.js";
import { IERC20ZapperContract } from "./IERC20ZapperContract.js";
import { IETHZapperContract } from "./IETHZapperContract.js";
import { Zapper } from "./Zapper.js";

export function createZapper(
  sdk: OnchainSDK,
  data: ZapperData,
): Zapper | IETHZapperContract | IERC20ZapperContract {
  if (data.type === "base") {
    const contractType = Zapper.contractType(data.baseParams);
    switch (contractType) {
      case "ZAPPER::ERC4626_UNDERLYING":
        return new IERC20ZapperContract(sdk, data);
      case "ZAPPER::WETH_DEPOSIT":
        return new IETHZapperContract(sdk, data);
      default:
        sdk.logger?.warn(`Unknown zapper contract type: ${contractType}`);
        return new Zapper(data);
    }
  }
  return new Zapper(data);
}
