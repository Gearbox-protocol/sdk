import type { SupportedContract } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import { iAaveV2WrappedATokenAdapterAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import type { IParser } from "./iParser";

export class AaveV2WrappedATokenAdapterParser
  extends AbstractParser
  implements IParser
{
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = iAaveV2WrappedATokenAdapterAbi;
    if (!isContract) this.adapterName = "AaveV2_WrappedATokenAdapter";
  }

  parse(calldata: Address): string {
    const { operationName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          operationName,
          calldata,
        );
    }
  }
}
