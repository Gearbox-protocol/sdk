import {
  decimals,
  formatBN,
  getTokenSymbolOrTicker,
  SupportedToken,
  TickerToken,
  toBigInt,
  tokenSymbolByAddress,
} from "@gearbox-protocol/sdk-gov";
import { Abi, Address, decodeFunctionData } from "viem";

import { BigNumberish } from "../utils/formatter";

export interface ParsedObject {
  address: Address;
  functionName: string;
  args: readonly any[];
}

export class AbstractParser {
  public readonly contract: string;
  protected abi!: Abi;
  public adapterName: string;

  constructor(contract: string) {
    this.contract = contract;
    this.adapterName = "Contract";
  }

  parseSelector(calldata: Address) {
    const functionData = decodeFunctionData({
      abi: this.abi,
      data: calldata,
    });

    if (!functionData.functionName)
      throw new Error("Function fragment not found");

    const operationName = `${this.adapterName}[${this.contract}].${functionData.functionName}`;
    return {
      functionData: functionData as {
        args: Array<any> | undefined;
        functionName: string;
      },
      operationName,
    };
  }

  decodeFunctionData(data: Address) {
    return decodeFunctionData({
      abi: this.abi,
      data,
    });
  }

  tokenSymbol(address: Address): SupportedToken {
    const symbol = tokenSymbolByAddress[address.toLowerCase()];
    if (!symbol) throw new Error(`Unknown token: ${address}`);
    return symbol;
  }

  tokenOrTickerSymbol(address: Address): SupportedToken | TickerToken {
    const symbol = getTokenSymbolOrTicker(address as Address);
    if (!symbol) {
      throw new Error(`Unknown token or ticker: ${address}`);
    }
    return symbol;
  }

  formatBN(amount: BigNumberish, token: SupportedToken): string {
    return `${formatBN(amount, decimals[token])} [${toBigInt(
      amount,
    ).toString()}]`;
  }

  parseToObject(address: Address, calldata: Address): ParsedObject {
    const { functionData } = this.parseSelector(calldata);

    return {
      address,
      functionName: functionData.functionName,
      args: functionData.args || [],
    };
  }

  reportUnknownFragment(
    parserName: string,
    functionName: string,
    calldata: string,
  ) {
    return `${parserName}: Unknown operation ${functionName} with calldata ${calldata}`;
  }
}
