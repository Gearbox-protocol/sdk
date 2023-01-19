import { SupportedToken } from "../tokens/token";
import { IERC20__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class ERC20Parser extends AbstractParser implements IParser {
  constructor(symbol: SupportedToken) {
    super(symbol);
    this.adapterName = "Token";
    this.ifc = IERC20__factory.createInterface();
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "totalSupply": {
        return `${functionName}`;
      }
      case "balanceOf": {
        const [address] = this.decodeFunctionData(functionFragment, calldata);
        return `${functionName}(${address})`;
      }
      case "allowance": {
        const [account, to] = this.decodeFunctionData(
          functionFragment,
          calldata,
        );
        return `${functionName}(account: ${account}, to: ${to})`;
      }
      case "approve": {
        const [spender] = this.decodeFunctionData(functionFragment, calldata);
        return `${functionName}(${spender})`;
      }

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }
}
