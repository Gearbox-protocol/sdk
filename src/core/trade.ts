import { BigNumber, Signer } from "ethers";

import { AdapterInterface } from "../contracts/adapters";
import { SwapType } from "../pathfinder/tradeTypes";
import { TokenData } from "../tokens/tokenData";
import { PathFinderResultStructOutput } from "../types/contracts/pathfinder/interfaces/IPathFinder";
import { formatBN } from "../utils/formatter";
import { AdapterData, AdapterType } from "./adapter";
import { PERCENTAGE_FACTOR } from "./constants";
import { EVMTx } from "./eventOrTx";

export interface TradeProps {
  adapter: AdapterData;
  tradePath: PathFinderResultStructOutput;
}

export class Trade {
  protected helper: AdapterData;
  readonly tradePath: PathFinderResultStructOutput;
  readonly swapType: SwapType;
  readonly expectedAmount: BigNumber;
  readonly rate: BigNumber;
  readonly tokenFrom: string;
  readonly tokenTo: string;
  readonly operationName: string;

  constructor({ tradePath, adapter }: TradeProps) {
    this.helper = adapter;
    this.tradePath = tradePath;

    this.swapType = SwapType.ExactInput;
    this.expectedAmount = BigNumber.from(0);
    this.rate = BigNumber.from(0);
    this.tokenFrom = "";
    this.tokenTo = "";
    this.operationName = "";
  }

  getName(): string {
    return this.helper.getName();
  }

  getAdapterInterface(): AdapterInterface {
    return this.helper.getAdapterInterface();
  }

  getContractAddress(): string {
    return this.helper.getContractAddress();
  }

  getAdapterAddress(): string {
    return this.helper.getAdapterAddress();
  }

  execute(slippage: number, signer: Signer): Promise<EVMTx> {
    return this.helper.execute({ tradePath: this.tradePath, slippage, signer });
  }

  toString(tokenData: Record<string, TokenData>): string {
    let result =
      this.helper.getType() === AdapterType.Swap
        ? `Swap `
        : `${this.operationName || "Farm"} `;
    const fromToken = tokenData[this.tokenFrom];
    const toToken = tokenData[this.tokenTo];
    result += `${formatBN(this.tradePath.amount, fromToken.decimals)} ${
      fromToken.symbol
    } ⇒ ${formatBN(this.expectedAmount, toToken.decimals)} ${
      toToken.symbol
    } on ${this.helper.getName()}`;
    return result;
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
