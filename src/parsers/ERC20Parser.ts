import { SupportedToken, toBigInt } from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { ierc20Abi } from "../types-viem";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class ERC20Parser extends AbstractParser implements IParser {
  constructor(symbol: SupportedToken) {
    super(symbol);
    this.adapterName = "Token";
    this.abi = ierc20Abi;
  }
  parse(calldata: Address): string {
    const { functionName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "totalSupply": {
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
