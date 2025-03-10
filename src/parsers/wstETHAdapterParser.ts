import type { SupportedContract } from "@gearbox-protocol/sdk-gov";
import { toBigInt } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import { iwstEthAbi, iwstEthv1AdapterAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import type { IParser } from "./iParser";

export class WstETHAdapterParser extends AbstractParser implements IParser {
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = !isContract ? iwstEthv1AdapterAbi : iwstEthAbi;
    if (!isContract) this.adapterName = "wstETHAdapter";
  }
  parse(calldata: Address): string {
    const { operationName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "wrap": {
        const [amount] = functionData.args || [];
        return `${operationName}(amount: ${this.formatBN(amount, "STETH")})`;
      }
      case "wrapDiff": {
        const [leftoverAmount] = functionData.args || [];
        return `${operationName}(leftoverAmount: ${this.formatBN(
          leftoverAmount,
          "STETH",
        )})`;
      }

      case "unwrap": {
        const [amount] = functionData.args || [];
        return `${operationName}(amount: ${this.formatBN(amount, "wstETH")})`;
      }
      case "unwrapDiff": {
        const [leftoverAmount] = functionData.args || [];
        return `${operationName}(leftoverAmount: ${this.formatBN(
          leftoverAmount,
          "STETH",
        )})`;
      }

      case "balanceOf": {
        const [address] = functionData.args || [];
        return `${operationName}(${address})`;
      }
      case "allowance": {
        const [account, to] = functionData.args || [];
        return `${operationName}(account: ${account}, to: ${to})`;
      }
      case "approve": {
        const [spender, amount] = functionData.args || [];
        return `${operationName}(${spender}, [${toBigInt(amount).toString()}])`;
      }

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          operationName,
          calldata,
        );
    }
  }
}
