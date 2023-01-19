import { IAirdropDistributor__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class AirdropDistributorParser
  extends AbstractParser
  implements IParser
{
  constructor() {
    super("AirdropDistributor");
    this.ifc = IAirdropDistributor__factory.createInterface();
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "merkleRoot": {
        return `${functionName}`;
      }

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }
}
