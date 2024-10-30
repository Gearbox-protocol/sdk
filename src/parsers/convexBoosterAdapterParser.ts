import {
  Address,
  convexLpTokenByPid,
  convexPoolByPid,
  SupportedContract,
} from "@gearbox-protocol/sdk-gov";

import { iConvexV1BoosterAdapterAbi } from "../types";
import { BigNumberish } from "../utils/formatter";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class ConvexBoosterAdapterParser
  extends AbstractParser
  implements IParser
{
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = iConvexV1BoosterAdapterAbi;
    if (!isContract) this.adapterName = "ConvexV1BoosterAdapter";
  }
  parse(calldata: Address): string {
    const { functionName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "deposit": {
        const [pid, amount, stake] = functionData.args || [];
        return `${functionName}(pid: ${this.formatPid(
          pid,
        )}, amount: ${this.formatAmount(amount, pid)}, stake: ${stake})`;
      }

      case "depositDiff": {
        const [pid, leftoverAmount, stake] = functionData.args || [];
        return `${functionName}(pid: ${this.formatPid(
          pid,
        )}, leftoverAmount: ${this.formatAmount(
          leftoverAmount,
          pid,
        )}, stake: ${stake})`;
      }

      case "withdraw": {
        const [pid, amount] = functionData.args || [];
        return `${functionName}(pid: ${this.formatPid(
          pid,
        )}, amount: ${this.formatAmount(amount, pid)})`;
      }

      case "withdrawDiff": {
        const [pid, leftoverAmount] = functionData.args || [];
        return `${functionName}(pid: ${this.formatPid(
          pid,
        )}, leftoverAmount: ${this.formatAmount(leftoverAmount, pid)})`;
      }

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          functionName,
          calldata,
        );
    }
  }

  formatAmount(amount: BigNumberish, pid: number): string {
    return this.formatBN(amount, convexLpTokenByPid[pid]);
  }

  formatPid(pid: number): string {
    return `${pid} [${convexPoolByPid[pid]}]`;
  }
}
