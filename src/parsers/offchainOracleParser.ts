import { IOffchainOracle__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class OffchainOracleParserParser
  extends AbstractParser
  implements IParser
{
  constructor() {
    super("OffchainOracleParser");
    this.ifc = IOffchainOracle__factory.createInterface();
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "getRate": {
        const [srcToken, dstToken, useWrappers] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );

        return `${functionName}(token: ${this.tokenSymbol(
          srcToken,
        )}, measured in: ${this.tokenSymbol(
          dstToken,
        )}, use wrappers: ${useWrappers})`;
      }

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }
}
