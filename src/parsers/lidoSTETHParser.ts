import { SupportedToken } from "../tokens/token";
import { IstETH__factory } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class LidoSTETHParser extends AbstractParser implements IParser {
  constructor(symbol: SupportedToken) {
    super(symbol);
    this.ifc = IstETH__factory.createInterface();
    this.adapterName = "TokenLido";
  }
  parse(calldata: string): string {
    const { functionFragment, functionName } = this.parseSelector(calldata);

    switch (functionFragment.name) {
      case "getFee":
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

      default:
        return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
    }
  }
}
