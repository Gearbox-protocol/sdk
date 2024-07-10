import { SupportedContract } from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { iAaveV2LendingPoolAdapterAbi } from "../types-viem";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class AaveV2LendingPoolAdapterParser
  extends AbstractParser
  implements IParser
{
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = iAaveV2LendingPoolAdapterAbi;
    if (!isContract) this.adapterName = "AaveV2_LendingPoolAdapter";
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
