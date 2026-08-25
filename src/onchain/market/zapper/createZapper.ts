import type { OnchainSDK } from "../../OnchainSDK.js";
import { bytes32ToString } from "../../utils/index.js";
import type { ZapperData } from "../types.js";
import { IERC20ZapperContract } from "./IERC20ZapperContract.js";
import { IETHZapperContract } from "./IETHZapperContract.js";
import type { IZapperContract } from "./types.js";
import { ZapperContract } from "./ZapperContract.js";

export function createZapper(
  sdk: OnchainSDK,
  data: ZapperData,
): IZapperContract {
  const existing = sdk.getContract<IZapperContract>(data.baseParams.addr);
  if (existing) {
    return existing;
  }

  if (data.type === "base") {
    const contractType = bytes32ToString(data.baseParams.contractType);
    switch (contractType) {
      case "ZAPPER::ERC4626_UNDERLYING":
        return new IERC20ZapperContract(sdk, data);
      case "ZAPPER::WETH_DEPOSIT":
        return new IETHZapperContract(sdk, data);
      default:
        if (sdk.strictContractTypes) {
          throw new Error(`Unknown zapper contract type: ${contractType}`);
        }
        sdk.logger?.warn(`Unknown zapper contract type: ${contractType}`);
        return new ZapperContract(sdk, data);
    }
  }
  return new ZapperContract(sdk, data);
}
