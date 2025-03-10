import type {
  StakingRewardsParams,
  SupportedContract,
} from "@gearbox-protocol/sdk-gov";
import { contractParams } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import { iStakingRewardsAdapterAbi } from "../types";
import type { BigNumberish } from "../utils/formatter";
import { AbstractParser } from "./abstractParser";
import type { IParser } from "./iParser";

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
    const { operationName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "withdraw": {
        const [amount] = functionData.args || [];
        return `${operationName}(amount: ${this.formatAmount(amount)}`;
      }
      case "withdrawDiff": {
        const [leftoverAmount] = functionData.args || [];
        return `${operationName}(leftoverAmount: ${this.formatAmount(
          leftoverAmount,
        )}`;
      }

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
      (
        contractParams[
          this.contract as SupportedContract
        ] as StakingRewardsParams
      ).stakedToken,
    );
  }
}
