import type { SupportedToken } from "@gearbox-protocol/sdk-gov";
import { toBigInt } from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import { istEthAbi } from "../types";
import { AbstractParser } from "./abstractParser";
import type { IParser } from "./iParser";

export class LidoSTETHParser extends AbstractParser implements IParser {
  constructor(symbol: SupportedToken) {
    super(`LIDO_${symbol}`);
    this.abi = istEthAbi;
  }

  parse(calldata: Address): string {
    const { operationName, functionData } = this.parseSelector(calldata);

    switch (functionData.functionName) {
      case "getFee":
      case "totalSupply": {
        return `${operationName}()`;
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
