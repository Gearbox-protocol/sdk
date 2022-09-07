import { BigNumberish } from "ethers";

import { SupportedContract } from "../contracts/contracts";
import { convexLpTokenByPid, convexPoolByPid } from "../tokens/convex";
import { IConvexV1BoosterAdapter__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class ConvexBoosterAdapterParser
  extends AbstractParser
  implements IParser
{
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.ifc = IConvexV1BoosterAdapter__factory.createInterface();
    if (!isContract) this.adapterName = "ConvexV1BoosterAdapter";
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "deposit": {
        const [pid, amount, stake] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );
        return `${functionName}(pid: ${this.formatPid(
          pid,
        )}, amount: ${this.formatAmount(amount, pid)}, stake: ${stake})`;
      }

      case "depositAll": {
        const [pid, stake] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );
        return `${functionName}(pid: ${this.formatPid(pid)}, stake: ${stake})`;
      }

      case "withdraw": {
        const [pid, amount] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );
        return `${functionName}(pid: ${this.formatPid(
          pid,
        )}, amount: ${this.formatAmount(amount, pid)})`;
      }

      case "withdrawAll": {
        const [pid] = this.decodeFunctionData(functionFragment, calldata);
        return `${functionName}(pid: ${this.formatPid(pid)})`;
      }

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }

  formatAmount(amount: BigNumberish, pid: number): string {
    return this.formatBN(amount, convexLpTokenByPid[pid]);
  }

  formatPid(pid: number): string {
    return `${pid} [${convexPoolByPid[pid]}]`;
  }
}
