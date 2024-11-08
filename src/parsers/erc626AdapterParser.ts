import { SupportedContract } from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { ierc4626AdapterAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class ERC4626AdapterParser extends AbstractParser implements IParser {
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = ierc4626AdapterAbi;
    if (!isContract) this.adapterName = "ERC4626Adapter";
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
