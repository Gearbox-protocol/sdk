import { ICreditManager__factory, ICreditManagerV2__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class CreditManagerParser extends AbstractParser implements IParser {
  constructor(version: number) {
    super(`CreditManager_V${version}`);
    this.ifc =
      version === 1
        ? ICreditManager__factory.createInterface()
        : ICreditManagerV2__factory.createInterface();
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "creditConfigurator": {
        return `${functionName}`;
      }

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }
}
