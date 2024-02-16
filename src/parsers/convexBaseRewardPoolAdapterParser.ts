import {
  contractParams,
  ConvexPoolParams,
  SupportedContract,
} from "@gearbox-protocol/sdk-gov";
import { BigNumberish } from "ethers";

import { IConvexV1BaseRewardPoolAdapter__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class ConvexBaseRewardPoolAdapterParser
  extends AbstractParser
  implements IParser
{
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.ifc = IConvexV1BaseRewardPoolAdapter__factory.createInterface();
    if (!isContract) this.adapterName = "ConvexV1BaseRewardPoolAdapter";
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "stake": {
        const [amount] = this.decodeFunctionData(functionFragment, calldata);
        return `${functionName}(amount: ${this.formatAmount(amount)})`;
      }

      case "stakeDiff": {
        const [leftoverAmount] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );
        return `${functionName}(leftoverAmount: ${this.formatAmount(
          leftoverAmount,
        )})`;
      }

      case "withdraw":
      case "withdrawAndUnwrap": {
        const [amount, claim] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );
        return `${functionName}(amount: ${this.formatAmount(
          amount,
        )}, claim: ${claim})`;
      }
      case "withdrawDiff":
      case "withdrawDiffAndUnwrap": {
        const [leftoverAmount, claim] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );
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
          functionName,
          functionFragment,
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
