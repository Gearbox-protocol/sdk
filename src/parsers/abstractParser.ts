import { FunctionFragment, Result } from "@ethersproject/abi";
import {
  Address,
  decimals,
  formatBN,
  getTokenSymbolOrTicker,
  SupportedToken,
  TickerToken,
  toBigInt,
  tokenSymbolByAddress,
} from "@gearbox-protocol/sdk-gov";
import { BigNumberish, BytesLike, utils } from "ethers";

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
  protected ifc!: utils.Interface;
  public adapterName: string;

  constructor(contract: string) {
    this.contract = contract;
    this.adapterName = "Contract";
  }

  parseSelector(calldata: BytesLike): ParseSelectorResult {
    const functionFragment = this.ifc.getFunction(
      utils.hexDataSlice(calldata, 0, 4) as any,
    );

    const functionName = `${this.adapterName}[${this.contract}].${functionFragment.name}`;
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
