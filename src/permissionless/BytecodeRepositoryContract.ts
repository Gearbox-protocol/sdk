import type { Address } from "viem";

import type { GearboxSDK } from "../sdk/index.js";
import { BaseContract } from "../sdk/index.js";
import { iBytecodeRepositoryAbi } from "./abi/index.js";

const abi = iBytecodeRepositoryAbi;
type abi = typeof abi;

export class BytecodeRepositoryContract extends BaseContract<abi> {
  constructor(sdk: GearboxSDK, address: Address) {
    super(sdk, {
      addr: address,
      name: "BytecodeRepository",
      abi,
    });
  }
}
