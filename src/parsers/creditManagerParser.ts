import { ICreditManagerV2__factory, ICreditManagerV3__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class CreditManagerParser extends AbstractParser implements IParser {
  constructor(version: number) {
    super(`CreditManager_V${version}`);
    this.ifc =
      version === 2
        ? ICreditManagerV2__factory.createInterface()
        : ICreditManagerV3__factory.createInterface();
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "creditConfigurator": {
        return `${functionName}()`;
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
