import { SupportedToken, toBigInt } from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { istEthAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import { IParser } from "./iParser";

export class LidoSTETHParser extends AbstractParser implements IParser {
  constructor(symbol: SupportedToken) {
    super(`LIDO_${symbol}`);
    this.abi = istEthAbi;
  }

  parse(calldata: Address): string {
    const { functionName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "getFee":
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
