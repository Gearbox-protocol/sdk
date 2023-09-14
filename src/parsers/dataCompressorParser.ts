import {
  IDataCompressor__factory,
  IDataCompressorV2_10__factory,
  IDataCompressorV3_00__factory,
} from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class DataCompressorParser extends AbstractParser implements IParser {
  constructor(version: number) {
    super("DataCompressor");

    switch (version) {
      case 2:
        this.ifc = IDataCompressor__factory.createInterface();
        break;
      case 210:
        this.ifc = IDataCompressorV2_10__factory.createInterface();
        break;
      case 300:
        this.ifc = IDataCompressorV3_00__factory.createInterface();
        break;
      default:
        this.ifc = IDataCompressor__factory.createInterface();
    }
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "getPoolsList":
      case "getCreditManagersList": {
        return `${functionName}()`;
      }

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }
}
