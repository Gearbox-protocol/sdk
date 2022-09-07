import { contractsByNetwork, SupportedContract } from "../contracts/contracts";
import { IYVault__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class YearnV2AdapterParser extends AbstractParser implements IParser {
  constructor(contract: SupportedContract, isContract: boolean) {
    super(contract);
    this.ifc = IYVault__factory.createInterface();
    if (!isContract) this.adapterName = "YearnV2Adapter";
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "deposit":
      case "withdraw":
      case "deposit(uint256)":
      case "withdraw(uint256)":
      case "withdraw(uint256,address,uint256)": {
        const [amount, address, maxLoss] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );

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

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }
}
