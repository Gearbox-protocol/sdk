import { Address } from "viem";

import { iCreditManagerV2Abi, iCreditManagerV3Abi } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class CreditManagerParser extends AbstractParser implements IParser {
  constructor(version: number) {
    super(`CreditManager_V${version}`);
    this.abi = version === 2 ? iCreditManagerV2Abi : iCreditManagerV3Abi;
  }
  parse(calldata: Address): string {
    const { operationName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "creditConfigurator": {
        return `${operationName}()`;
      }

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          operationName,
          calldata,
        );
    }
  }
}
