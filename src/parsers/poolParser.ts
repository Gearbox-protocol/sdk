import { IPoolService__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class PoolParser extends AbstractParser implements IParser {
  constructor(version: number) {
    super(`Pool_V${version}`);
    this.ifc = IPoolService__factory.createInterface();
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      default:
        return this.reportUnknownFragment(
          functionName,
          functionFragment,
          calldata,
        );
    }
  }
}
