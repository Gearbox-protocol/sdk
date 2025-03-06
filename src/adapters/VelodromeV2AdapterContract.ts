import type { GearboxSDK } from "../sdk";
import { iVelodromeV2RouterAdapterAbi } from "./abi";
import type { AbstractAdapterContractOptions } from "./AbstractAdapter";
import { AbstractAdapterContract } from "./AbstractAdapter";

const abi = iVelodromeV2RouterAdapterAbi;

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
