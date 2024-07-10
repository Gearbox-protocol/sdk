import {
  contractsByNetwork,
  SupportedContract,
} from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { iYearnV2AdapterAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class YearnV2AdapterParser extends AbstractParser implements IParser {
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.abi = iYearnV2AdapterAbi;
    if (!isContract) this.adapterName = "YearnV2Adapter";
  }
  parse(calldata: Address): string {
    const { functionName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "deposit":
      case "withdraw":
      case "withdraw(uint256,address,uint256)": {
        const [amount, address, maxLoss] = functionData.args || [];

        const yvSym = this.tokenSymbol(
          contractsByNetwork.Mainnet[this.contract as SupportedContract],
        );

        const amountStr = amount
          ? `amount: ${this.formatBN(amount, yvSym)}`
          : "";
        const addressStr = address ? `, address: ${address}` : "";
        const maxLossStr = maxLoss ? `, maxLoss: ${maxLoss}` : "";

        return `${functionName}(${amountStr}${addressStr}${maxLossStr})`;
      }

      case "depositDiff": {
        const [leftoverAmount] = functionData.args || [];

        const yvSym = this.tokenSymbol(
          contractsByNetwork.Mainnet[this.contract as SupportedContract],
        );

        const leftoverAmountStr = this.formatBN(leftoverAmount, yvSym);

        return `${functionName}(leftoverAmount: ${leftoverAmountStr})`;
      }

      case "withdrawDiff": {
        const [leftoverAmount] = functionData.args || [];

        const yvSym = this.tokenSymbol(
          contractsByNetwork.Mainnet[this.contract as SupportedContract],
        );

        const leftoverAmountStr = this.formatBN(leftoverAmount, yvSym);

        return `${functionName}(leftoverAmount: ${leftoverAmountStr})`;
      }

      case "pricePerShare": {
        return `${functionName}()`;
      }
      case "balanceOf": {
        const [address] = functionData.args || [];
        return `${functionName}(${address})`;
      }

      case "allowance": {
        const [account, to] = functionData.args || [];
        return `${functionName}(account: ${account}, to: ${to})`;
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
