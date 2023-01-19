import { Multicall2__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class MulticallParser extends AbstractParser implements IParser {
  constructor() {
    super("Multicall");
    this.ifc = Multicall2__factory.createInterface();
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "aggregate": {
        const [calls] = this.decodeFunctionData(functionFragment, calldata);

        return `${functionName}: ${calls}`;
      }
      case "getBlockNumber": {
        return `${functionName}`;
      }
      case "getEthBalance": {
        const [account] = this.decodeFunctionData(functionFragment, calldata);
        return `${functionName}(${account})`;
      }

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }
}
