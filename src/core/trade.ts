import { BigNumber } from "ethers";
import { SwapType } from "./swap";
import { BytesLike } from "@ethersproject/bytes";
import { PERCENTAGE_FACTOR, WAD } from "./constants";

export interface CloseTradePath {
  path: Array<string>;
  amountOutMin: BigNumber;
}

export class TradePath {
  public readonly swapType: SwapType;
  public readonly amount: BigNumber;
  public readonly rate: BigNumber;
  public readonly path: Array<string>;
  public readonly expectedAmount: BigNumber;
  public readonly pathUniV3: BytesLike | undefined;
  public readonly i: number | undefined;
  public readonly j: number | undefined;
  public readonly operationName: string | undefined;

  constructor(params: {
    swapType: SwapType;
    amount: BigNumber;
    path: Array<string>;
    expectedAmount: BigNumber;
    pathUniV3?: BytesLike;
    i?: number;
    j?: number;
    operationName?: string;
  }) {
    this.swapType = params.swapType;
    this.amount = params.amount;
    this.path = params.path;
    this.expectedAmount = params.expectedAmount;
    this.pathUniV3 = params.pathUniV3;
    this.rate =
      params.swapType !== SwapType.ExactInput
        ? params.expectedAmount.mul(WAD).div(params.amount)
        : WAD.mul(params.amount).div(params.expectedAmount);
    this.i = params.i;
    this.j = params.j;
    this.operationName = params.operationName;
  }

  getExpectedAmountWithSlippage(slippage: number): BigNumber {
    return this.swapType === SwapType.ExactInput
      ? this.getAmountOutMin(slippage)
      : this.getAmountInMax(slippage);
  }

  getAmountInMax(slippage: number): BigNumber {
    return this.expectedAmount
      .mul(PERCENTAGE_FACTOR + slippage)
      .div(PERCENTAGE_FACTOR);
  }

  getAmountOutMin(slippage: number): BigNumber {
    return this.expectedAmount
      .mul(PERCENTAGE_FACTOR)
      .div(PERCENTAGE_FACTOR + slippage);
  }

  public get from(): string {
    return this.path[0];
  }

  public get to(): string {
    return this.path[this.path.length - 1];
  }

  getFromAmount(slippage: number): BigNumber {
    return this.swapType === SwapType.ExactInput
      ? this.amount
      : this.getExpectedAmountWithSlippage(slippage);
  }

  getToAmount(slippage: number): BigNumber {
    return this.swapType === SwapType.ExactOutput
      ? this.amount
      : this.getExpectedAmountWithSlippage(slippage);
  }
}
