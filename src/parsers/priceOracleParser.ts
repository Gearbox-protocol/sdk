import { Address } from "viem";

import { iPriceOracleBaseAbi } from "../types-viem";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class PriceOracleParser extends AbstractParser implements IParser {
  constructor() {
    super("PriceOracle");
    this.abi = iPriceOracleBaseAbi;
  }
  parse(calldata: Address): string {
    const { functionName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "getPrice": {
        const [token] = functionData.args || [];
        return `${functionName}(${this.tokenSymbol(token)})`;
      }

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          functionName,
          calldata,
        );
    }
  }
}
