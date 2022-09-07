import { BigNumber } from "ethers";

import { SwapType } from "../pathfinder/tradeTypes";
import { PathFinderResultStructOutput } from "../types/contracts/pathfinder/interfaces/IPathFinder";
import { PERCENTAGE_FACTOR } from "./constants";

export class BaseTrade {
  readonly tradePath: PathFinderResultStructOutput;
  readonly swapType: SwapType;
  readonly expectedAmount: BigNumber;
  readonly rate: BigNumber;
  readonly tokenFrom: string;
  readonly tokenTo: string;
  readonly operationName: string;

  constructor(tradePath: PathFinderResultStructOutput) {
    this.tradePath = tradePath;

    this.swapType = SwapType.ExactInput;
    this.expectedAmount = BigNumber.from(0);
    this.rate = BigNumber.from(0);
    this.tokenFrom = "";
    this.tokenTo = "";
    this.operationName = "";
  }

  getFromAmount(slippage: number) {
    return this.expectedAmount
      .mul(PERCENTAGE_FACTOR)
      .div(PERCENTAGE_FACTOR + slippage);
  }
  getToAmount(slippage: number) {
    return this.expectedAmount
      .mul(PERCENTAGE_FACTOR + slippage)
      .div(PERCENTAGE_FACTOR);
  }
}
