import { BigNumberish } from "ethers";

import { SupportedToken } from "../tokens/token";
import { ICreditFacadeExtended__factory } from "../types";
import { BalanceStruct } from "../types/@gearbox-protocol/core-v2/contracts/interfaces/ICreditFacade.sol/ICreditFacadeExtended";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class CreditFacadeParser extends AbstractParser implements IParser {
  constructor(token: SupportedToken) {
    super(token);
    this.ifc = ICreditFacadeExtended__factory.createInterface();
    this.adapterName = "CreditFacade";
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "addCollateral": {
        const [token, amount] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );
        return `${functionName}(onBehalf: none, token: ${this.tokenSymbol(
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

        const balancesStr = (balances as BalanceStruct[])
          .map(b => {
            const symbol = this.tokenSymbol(b.token);
            return `${symbol}: ${this.formatBN(b.balance, symbol)}`;
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
