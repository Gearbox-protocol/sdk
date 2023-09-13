import { FunctionFragment, Result } from "@ethersproject/abi";
import {
  decimals,
  SupportedToken,
  tokenSymbolByAddress,
} from "@gearbox-protocol/sdk-gov";
import { BigNumberish, BytesLike, utils } from "ethers";

import { formatBN, toBigInt } from "../utils/formatter";

interface ParseSelectorResult {
  functionFragment: FunctionFragment;
  functionName: string;
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

  formatBN(amount: BigNumberish, token: SupportedToken): string {
    return `${formatBN(amount, decimals[token])} [${toBigInt(
      amount,
    ).toString()}]`;
  }

  parseToObject(address: string, calldata: string) {
    const { functionFragment } = this.parseSelector(calldata);

    const args = this.decodeFunctionData(functionFragment, calldata);

    return {
      address,
      functionFragment,
      args,
    };
  }
}
