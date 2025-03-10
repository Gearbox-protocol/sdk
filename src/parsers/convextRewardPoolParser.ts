import type { NormalToken } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import { iBaseRewardPoolAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import type { IParser } from "./iParser";

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
