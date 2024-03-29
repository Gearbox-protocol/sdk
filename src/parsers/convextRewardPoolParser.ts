import { NormalToken } from "../tokens/normal";
import { IBaseRewardPool__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class ConvexRewardPoolParser extends AbstractParser implements IParser {
  constructor(token: NormalToken) {
    super(`ConvexRewardPool_${token}`);
    this.ifc = IBaseRewardPool__factory.createInterface();
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "rewardRate":
        return `${functionName}()`;

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }
}
