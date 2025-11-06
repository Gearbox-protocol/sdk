import { iAliasedLossPolicyV310Abi } from "../../../abi/310/generated.js";
import { BaseContract, type BaseParams } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";

const abi = iAliasedLossPolicyV310Abi;
type abi = typeof abi;

export class AliasLossPolicyV310Contract extends BaseContract<abi> {
  constructor(sdk: GearboxSDK, params: BaseParams) {
    super(sdk, {
      abi,
      addr: params.addr,
      contractType: params.contractType,
      version: params.version,
    });
  }
}
