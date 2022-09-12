import { BigNumber } from "ethers";

import { AdapterInterface } from "../contracts/adapters";
import { SwapType } from "../pathfinder/tradeTypes";
import { decimals } from "../tokens/decimals";
import { isLPToken, tokenSymbolByAddress } from "../tokens/token";
import { ICreditFacade } from "../types";
import {
  PathFinderResultStruct,
  PathFinderResultStructOutput,
} from "../types/contracts/pathfinder/interfaces/IPathFinder";
import { formatBN } from "../utils/formatter";
import { BaseAdapter } from "./adapter";
import { PERCENTAGE_FACTOR } from "./constants";
import { EVMTx } from "./eventOrTx";
import { TXSwap } from "./transactions";

export type TradePath = Pick<
  PathFinderResultStructOutput,
  keyof PathFinderResultStruct
>;

export interface BaseTradeInterface {
  swapType: SwapType;
  sourceAmount: BigNumber;
  expectedAmount: BigNumber;
  rate: BigNumber;
  tokenFrom: string;
  tokenTo: string;
  operationName: TradeOperations;
}

export interface TradeProps extends BaseTradeInterface {
  adapter: BaseAdapter;
  tradePath: TradePath;
  creditFacade: ICreditFacade;
}

export type TradeOperations =
  | "farmWithdraw"
  | "farmDeposit"
  | "swap"
  | "unknownOperation";

const OPERATION_NAMES: Record<TradeOperations, string> = {
  farmWithdraw: "Farm withdraw",
  farmDeposit: "Farm deposit",
  swap: "Swap",
  unknownOperation: "Unknown operation",
};

export class Trade implements BaseTradeInterface {
  protected helper: BaseAdapter;
  protected tradePath: TradePath;
  protected creditFacade: ICreditFacade;

  readonly swapType: SwapType;
  readonly sourceAmount: BigNumber;
  readonly expectedAmount: BigNumber;
  readonly rate: BigNumber;
  readonly tokenFrom: string;
  readonly tokenTo: string;
  readonly operationName: TradeOperations;

  constructor(props: TradeProps) {
    this.helper = props.adapter;
    this.tradePath = props.tradePath;
    this.creditFacade = props.creditFacade;

    this.swapType = props.swapType;
    this.sourceAmount = props.sourceAmount;
    this.expectedAmount = props.expectedAmount;
    this.rate = props.rate;
    this.tokenFrom = props.tokenFrom;
    this.tokenTo = props.tokenTo;
    this.operationName = props.operationName;
  }

  getName(): string {
    return this.helper.name;
  }

  getAdapterInterface(): AdapterInterface {
    return this.helper.adapterInterface;
  }

  getContractAddress(): string {
    return this.helper.contractAddress;
  }

  getAdapterAddress(): string {
    return this.helper.adapterAddress;
  }

  execute(): Promise<EVMTx> {
    return this._execute();
  }

  protected async _execute() {
    const receipt = await this.creditFacade.multicall(this.tradePath.calls);

    return new TXSwap({
      txHash: receipt.hash,
      protocol: this.helper.contractAddress,
      operation: OPERATION_NAMES[this.operationName],
      amountFrom: this.sourceAmount,
      amountTo: this.expectedAmount,
      tokenFrom: this.tokenFrom,
      tokenTo: this.tokenTo,
      creditManager: this.helper.creditManager,
      timestamp: 0,
    });
  }

  toString(): string {
    const symbolFrom = tokenSymbolByAddress[this.tokenFrom.toLowerCase()];
    const symbolTo = tokenSymbolByAddress[this.tokenTo.toLowerCase()];
    if (!symbolFrom) throw new Error(`Unknown token: ${this.tokenFrom}`);
    if (!symbolTo) throw new Error(`Unknown token: ${this.tokenTo}`);

    const decimalsFrom = decimals[symbolFrom];
    const decimalsTo = decimals[symbolTo];

    return `${this.operationName} ${formatBN(
      this.sourceAmount,
      decimalsFrom,
    )} ${symbolFrom} ⇒ ${formatBN(
      this.expectedAmount,
      decimalsTo,
    )} ${symbolTo} on ${this.helper.name}`;
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

  static getOperationName(
    tokenInAddress: string,
    tokenOutAddress: string,
  ): TradeOperations {
    const tokenInSymbol = tokenSymbolByAddress[tokenInAddress];
    const tokenOutSymbol = tokenSymbolByAddress[tokenOutAddress];

    const tokenInIsLp = isLPToken(tokenInSymbol);
    const tokenOutIsLp = isLPToken(tokenOutSymbol);

    if (!tokenInSymbol) throw new Error(`Unknown token: ${tokenInAddress}`);
    if (!tokenOutSymbol) throw new Error(`Unknown token: ${tokenOutAddress}`);
    if (tokenInIsLp && !tokenOutIsLp) return "farmWithdraw";
    if (!tokenInIsLp && tokenOutIsLp) return "farmDeposit";
    if (!tokenInIsLp && !tokenOutIsLp) return "swap";
    return "unknownOperation";
  }
}
