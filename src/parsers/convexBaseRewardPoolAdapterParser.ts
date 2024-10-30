import {
  contractParams,
  ConvexPoolParams,
  SupportedContract,
} from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { iConvexV1BaseRewardPoolAdapterAbi } from "../types";
import { BigNumberish } from "../utils/formatter";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class ConvexBaseRewardPoolAdapterParser
  extends AbstractParser
  implements IParser
{
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = iConvexV1BaseRewardPoolAdapterAbi;
    if (!isContract) this.adapterName = "ConvexV1BaseRewardPoolAdapter";
  }
  parse(calldata: Address): string {
    const { functionName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "stake": {
        const [amount] = functionData.args || [];
        return `${functionName}(amount: ${this.formatAmount(amount)})`;
      }

      case "stakeDiff": {
        const [leftoverAmount] = functionData.args || [];
        return `${functionName}(leftoverAmount: ${this.formatAmount(
          leftoverAmount,
        )})`;
      }

      case "withdraw":
      case "withdrawAndUnwrap": {
        const [amount, claim] = functionData.args || [];
        return `${functionName}(amount: ${this.formatAmount(
          amount,
        )}, claim: ${claim})`;
      }
      case "withdrawDiff":
      case "withdrawDiffAndUnwrap": {
        const [leftoverAmount, claim] = functionData.args || [];
        return `${functionName}(leftoverAmount: ${this.formatAmount(
          leftoverAmount,
        )}, claim: ${claim})`;
      }

      case "rewardRate":
        return `${functionName}()`;
      case "totalSupply":
        return `${functionName}()`;

      case "getReward":
        return `${functionName}()`;

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          functionName,
          calldata,
        );
    }
  }

  formatAmount(amount: BigNumberish): string {
    return this.formatBN(
      amount,
      (contractParams[this.contract as SupportedContract] as ConvexPoolParams)
        .stakedToken,
    );
  }
}
