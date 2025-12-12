import type { Abi, Address } from "viem";
import type { AdapterData, ConstructOptions } from "../../../sdk/index.js";
import { BaseContract } from "../../../sdk/index.js";
import type { AdapterContractType } from "../types.js";

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

  constructor(
    options: ConstructOptions,
    args: AbstractAdapterContractOptions<abi>,
  ) {
    const { baseParams, targetContract, ...rest } = args;
    super(options, { ...rest, ...baseParams });
    this.targetContract = targetContract;
  }

  public get adapterType(): AdapterContractType {
    return this.contractType as AdapterContractType;
  }
}
