import { iDaiUsdsAdapterAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter";
import { AbstractAdapterContract } from "./AbstractAdapter";

const abi = iDaiUsdsAdapterAbi;
type abi = typeof abi;

export class DaiUsdsAdapterContract extends AbstractAdapterContract<
  typeof abi
> {
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
