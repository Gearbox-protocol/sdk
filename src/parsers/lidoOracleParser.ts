import { ILidoOracle__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class LidoOracleParser extends AbstractParser implements IParser {
  constructor() {
    super("LidoOracle");
    this.ifc = ILidoOracle__factory.createInterface();
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "getLastCompletedReportDelta":
        return `${functionName}`;

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }
}
