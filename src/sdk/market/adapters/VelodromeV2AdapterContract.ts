import { velodromeV2RouterAdapterAbi } from "../../abi";
import type { GearboxSDK } from "../../GearboxSDK";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter";
import { AbstractAdapterContract } from "./AbstractAdapter";

const abi = velodromeV2RouterAdapterAbi;

export class VelodromeV2RouterAdapterContract extends AbstractAdapterContract<
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
