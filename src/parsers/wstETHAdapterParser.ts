import { SupportedContract, toBigInt } from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { iwstEthAbi, iwstEthv1AdapterAbi } from "../types-viem";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class WstETHAdapterParser extends AbstractParser implements IParser {
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = !isContract ? iwstEthv1AdapterAbi : iwstEthAbi;
    if (!isContract) this.adapterName = "wstETHAdapter";
  }
  parse(calldata: Address): string {
    const { functionData, functionName } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "wrap": {
        const [amount] = functionData.args || [];
        return `${functionName}(amount: ${this.formatBN(amount, "STETH")})`;
      }
      case "wrapDiff": {
        const [leftoverAmount] = functionData.args || [];
        return `${functionName}(leftoverAmount: ${this.formatBN(
          leftoverAmount,
          "STETH",
        )})`;
      }

      case "unwrap": {
        const [amount] = functionData.args || [];
        return `${functionName}(amount: ${this.formatBN(amount, "wstETH")})`;
      }
      case "unwrapDiff": {
        const [leftoverAmount] = functionData.args || [];
        return `${functionName}(leftoverAmount: ${this.formatBN(
          leftoverAmount,
          "STETH",
        )})`;
      }

      case "balanceOf": {
        const [address] = functionData.args || [];
        return `${functionName}(${address})`;
      }
      case "allowance": {
        const [account, to] = functionData.args || [];
        return `${functionName}(account: ${account}, to: ${to})`;
      }
      case "approve": {
        const [spender, amount] = functionData.args || [];
        return `${functionName}(${spender}, [${toBigInt(amount).toString()}])`;
      }

      default:
        return this.reportUnknownFragment(
          this.adapterName || this.contract,
          functionName,
          calldata,
        );
    }
  }
}
