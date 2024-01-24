import { IPriceOracleBase__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class PriceOracleParser extends AbstractParser implements IParser {
  constructor() {
    super("PriceOracle");
    this.ifc = IPriceOracleBase__factory.createInterface();
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "getPrice": {
        const [token] = this.decodeFunctionData(functionFragment, calldata);

        return `${functionName}(${this.tokenSymbol(token)})`;
      }

      default:
        return this.reportUnknownFragment(
          functionName,
          functionFragment,
          calldata,
        );
    }
  }
}
