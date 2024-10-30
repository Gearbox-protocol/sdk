import { SupportedContract } from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { iCompoundV2CTokenAdapterAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class CompoundV2CTokenAdapterParser
  extends AbstractParser
  implements IParser
{
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = iCompoundV2CTokenAdapterAbi;
    if (!isContract) this.adapterName = "CompoundV2_CTokenAdapter";
  }

  parse(calldata: Address): string {
    const { functionName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          functionName,
          calldata,
        );
    }
  }
}
