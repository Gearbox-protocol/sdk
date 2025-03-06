import type { GearboxSDK } from "../sdk";
import { iCurveV1_4AssetsAdapterAbi } from "./abi";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter";
import { AbstractAdapterContract } from "./AbstractAdapter";

const abi = iCurveV1_4AssetsAdapterAbi;

export class Curve4AssetsAdapterContract extends AbstractAdapterContract<
  typeof abi
> {
  constructor(
    sdk: GearboxSDK,
    args: Omit<AbstractAdapterContractOptions<typeof abi>, "abi">,
  ) {
    super(sdk, {
      ...args,
      abi,
    });
  }
}
