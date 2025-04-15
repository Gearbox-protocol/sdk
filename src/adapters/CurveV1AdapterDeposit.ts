import type { GearboxSDK } from "../sdk/index.js";
import { iCurveV1AdapterAbi } from "./abi/index.js";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter.js";
import { AbstractAdapterContract } from "./AbstractAdapter.js";

const abi = iCurveV1AdapterAbi;
type abi = typeof abi;

export class CurveV1AdapterDeposit extends AbstractAdapterContract<abi> {
  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<abi>, "abi">,
  ) {
    super(sdk, {
      ...args,
      abi,
    });
  }
}
