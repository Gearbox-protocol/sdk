import { IDataCompressor__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class DataCompressorParser extends AbstractParser implements IParser {
  constructor() {
    super("DataCompressor");
    this.ifc = IDataCompressor__factory.createInterface();
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "getPoolsList":
      case "getCreditManagersList": {
        return `${functionName}`;
      }

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }
}
