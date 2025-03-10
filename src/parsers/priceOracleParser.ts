import type { Address } from "viem";

import { iPriceOracleBaseAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import type { IParser } from "./iParser";

export class PriceOracleParser extends AbstractParser implements IParser {
  constructor() {
    super("PriceOracle");
    this.abi = iPriceOracleBaseAbi;
  }
  parse(calldata: Address): string {
    const { operationName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "getPrice": {
        const [token] = functionData.args || [];
        return `${operationName}(${this.tokenSymbol(token)})`;
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
