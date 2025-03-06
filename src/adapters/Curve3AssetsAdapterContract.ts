import type { GearboxSDK } from "../sdk";
import { iCurveV1_3AssetsAdapterAbi } from "./abi";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter";
import { AbstractAdapterContract } from "./AbstractAdapter";

const abi = iCurveV1_3AssetsAdapterAbi;

export class Curve3AssetsAdapterContract extends AbstractAdapterContract<
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
