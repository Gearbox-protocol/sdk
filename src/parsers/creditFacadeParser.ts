import { SupportedToken } from "@gearbox-protocol/sdk-gov";
import { BigNumberish } from "ethers";

import { ICreditFacadeV2Extended__factory } from "../types";
import { BalanceStructOutput } from "../types/ICreditFacadeV2.sol/ICreditFacadeV2Extended";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class CreditFacadeParser extends AbstractParser implements IParser {
  constructor(token: SupportedToken) {
    super(token);
    this.ifc = ICreditFacadeV2Extended__factory.createInterface();
    this.adapterName = "CreditFacade";
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "addCollateral": {
        const [onBehalf, token, amount] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );
        return `${functionName}(onBehalf: ${onBehalf}, token: ${this.tokenSymbol(
          token,
        )}, amount: ${this.formatAmount(amount)})`;
      }
      case "increaseDebt":
      case "decreaseDebt": {
        const [amount] = this.decodeFunctionData(functionFragment, calldata);
        return `${functionName}(amount: ${this.formatAmount(amount)})`;
      }
      case "enableToken":
      case "disableToken": {
        const [address] = this.decodeFunctionData(functionFragment, calldata);
        return `${functionName}(token: ${this.tokenSymbol(address)})`;
      }

      case "revertIfReceivedLessThan": {
        const [balances] = this.decodeFunctionData(functionFragment, calldata);

        const balancesStr = (balances as BalanceStructOutput[])
          .map(b => {
            const symbol = this.tokenSymbol((b as BalanceStructOutput).token);
            return `${symbol}: ${this.formatBN(
              (b as BalanceStructOutput).balance,
              symbol,
            )}`;
          })
          .join(", ");

        return `${functionName}(${balancesStr})`;
      }

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }

  formatAmount(amount: BigNumberish): string {
    return this.formatBN(amount, this.contract as SupportedToken);
  }
}
