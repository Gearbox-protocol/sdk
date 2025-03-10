import type {
  ConvexPoolParams,
  SupportedContract,
} from "@gearbox-protocol/sdk-gov";
import { contractParams } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import { iConvexV1BaseRewardPoolAdapterAbi } from "../types";
import type { BigNumberish } from "../utils/formatter";
import { AbstractParser } from "./abstractParser";
import type { IParser } from "./iParser";

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
    const { operationName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "stake": {
        const [amount] = functionData.args || [];
        return `${operationName}(amount: ${this.formatAmount(amount)})`;
      }

      case "stakeDiff": {
        const [leftoverAmount] = functionData.args || [];
        return `${operationName}(leftoverAmount: ${this.formatAmount(
          leftoverAmount,
        )})`;
      }

      case "withdraw":
      case "withdrawAndUnwrap": {
        const [amount, claim] = functionData.args || [];
        return `${operationName}(amount: ${this.formatAmount(
          amount,
        )}, claim: ${claim})`;
      }
      case "withdrawDiff":
      case "withdrawDiffAndUnwrap": {
        const [leftoverAmount, claim] = functionData.args || [];
        return `${operationName}(leftoverAmount: ${this.formatAmount(
          leftoverAmount,
        )}, claim: ${claim})`;
      }

      case "rewardRate":
        return `${operationName}()`;
      case "totalSupply":
        return `${operationName}()`;

      case "getReward":
        return `${operationName}()`;

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          operationName,
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
