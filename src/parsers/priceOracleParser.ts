import { IPriceOracleV2__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class PriceOracleParser extends AbstractParser implements IParser {
  constructor() {
    super("PriceOracle");
    this.ifc = IPriceOracleV2__factory.createInterface();
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "getPrice": {
        const [token] = this.decodeFunctionData(functionFragment, calldata);

        return `${functionName}(${this.tokenSymbol(token)})`;
      }

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }

  parseToObject(address: string, calldata: string) {
    const { functionFragment } = this.parseSelector(calldata);

    const args = this.decodeFunctionData(functionFragment, calldata);

    return {
      address,
      functionFragment,
      args,
    };
  }
}
