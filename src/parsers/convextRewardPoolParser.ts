import { NormalToken } from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { iBaseRewardPoolAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class ConvexRewardPoolParser extends AbstractParser implements IParser {
  constructor(token: NormalToken) {
    super(`ConvexRewardPool_${token}`);
    this.abi = iBaseRewardPoolAbi;
  }
  parse(calldata: Address): string {
    const { operationName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "rewardRate":
        return `${operationName}()`;

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          operationName,
          calldata,
        );
    }
  }
}
