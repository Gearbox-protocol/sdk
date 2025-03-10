import type { Abi, Address } from "viem";

import type { AdapterData, GearboxSDK } from "../sdk";
import { BaseContract } from "../sdk";
import type { AdapterContractType } from "./types";

export interface AbstractAdapterContractOptions<
  abi extends Abi | readonly unknown[],
> extends AdapterData {
  abi: abi;
  name?: string;
}

export class AbstractAdapterContract<
  const abi extends Abi | readonly unknown[],
> extends BaseContract<abi> {
  public readonly targetContract: Address;

  constructor(sdk: GearboxSDK, args: AbstractAdapterContractOptions<abi>) {
    const { baseParams, targetContract, ...rest } = args;
    super(sdk, { ...rest, ...baseParams });
    this.targetContract = args.targetContract;
  }

  public get adapterType(): AdapterContractType {
    return this.contractType as AdapterContractType;
  }
}
