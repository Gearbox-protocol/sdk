import {
  decimals,
  formatBN,
  getTokenSymbolOrTicker,
  SupportedToken,
  TickerToken,
  toBigInt,
  tokenSymbolByAddress,
} from "@gearbox-protocol/sdk-gov";
import {
  BytesLike,
  dataSlice,
  FunctionFragment,
  Interface,
  Result,
} from "ethers";
import { Address } from "viem";

import { BigNumberish } from "../utils/formatter";

interface ParseSelectorResult {
  functionFragment: FunctionFragment;
  functionName: string;
}

export interface ParsedObject {
  address: string;
  functionFragment: FunctionFragment;
  args: Result;
}

export class AbstractParser {
  public readonly contract: string;
  protected ifc!: Interface;
  public adapterName: string;

  constructor(contract: string) {
    this.contract = contract;
    this.adapterName = "Contract";
  }

  parseSelector(calldata: BytesLike): ParseSelectorResult {
    const functionFragment = this.ifc.getFunction(
      dataSlice(calldata, 0, 4) as any,
    );
    if (!functionFragment) throw new Error("Function fragment not found");

    const functionName = `${this.adapterName}[${this.contract}].${functionFragment?.name}`;
    return { functionFragment, functionName };
  }

  decodeFunctionData(
    functionFragment: FunctionFragment | string,
    data: BytesLike,
  ): Result {
    return this.ifc.decodeFunctionData(functionFragment, data);
  }

  encodeFunctionResult(
    functionFragment: FunctionFragment | string,
    data: Array<any>,
  ) {
    return this.ifc.encodeFunctionResult(functionFragment, data);
  }

  tokenSymbol(address: string): SupportedToken {
    const symbol = tokenSymbolByAddress[address.toLowerCase()];
    if (!symbol) throw new Error(`Unknown token: ${address}`);
    return symbol;
  }

  tokenOrTickerSymbol(address: string): SupportedToken | TickerToken {
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

  parseToObject(address: string, calldata: string): ParsedObject {
    const { functionFragment } = this.parseSelector(calldata);

    const args = this.decodeFunctionData(functionFragment, calldata);

    return {
      address,
      functionFragment,
      args,
    };
  }

  reportUnknownFragment(
    functionName: string,
    functionFragment: FunctionFragment,
    calldata: string,
  ) {
    return `${functionName}: Unknown operation ${functionFragment.name} with calldata ${calldata}`;
  }
}
