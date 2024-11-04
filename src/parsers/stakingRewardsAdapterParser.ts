import {
  contractParams,
  StakingRewardsParams,
  SupportedContract,
} from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { iStakingRewardsAdapterAbi } from "../types";
import { BigNumberish } from "../utils/formatter";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class StakingRewardsAdapterParser
  extends AbstractParser
  implements IParser
{
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = iStakingRewardsAdapterAbi;
    if (!isContract) this.adapterName = "StakingRewardsAdapter";
  }
  parse(calldata: Address): string {
    const { functionName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "withdraw": {
        const [amount] = functionData.args || [];
        return `${functionName}(amount: ${this.formatAmount(amount)}`;
      }
      case "withdrawDiff": {
        const [leftoverAmount] = functionData.args || [];
        return `${functionName}(leftoverAmount: ${this.formatAmount(
          leftoverAmount,
        )}`;
      }

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
      (
        contractParams[
          this.contract as SupportedContract
        ] as StakingRewardsParams
      ).stakedToken,
    );
  }
}
