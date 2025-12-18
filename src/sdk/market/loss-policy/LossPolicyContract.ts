import type { Address, Hex } from "viem";
import { iLossPolicyV310Abi } from "../../../abi/310/generated.js";
import {
  BaseContract,
  type BaseParams,
  type ConstructOptions,
} from "../../base/index.js";
import type { ILossPolicyContract } from "./types.js";

const abi = iLossPolicyV310Abi;
type abi = typeof abi;

export class LossPolicyContract
  extends BaseContract<abi>
  implements ILossPolicyContract
{
  constructor(options: ConstructOptions, params: BaseParams) {
    super(options, {
      abi,
      addr: params.addr,
      contractType: params.contractType,
      version: params.version,
    });
  }

  async getLiquidationData(
    _creditAccount: Address,
    _blockNumber?: bigint,
  ): Promise<Hex | undefined> {
    return undefined;
  }
}
