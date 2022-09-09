import { BigNumber, Signer } from "ethers";

import { AdapterInterface } from "../contracts/adapters";
import { TxParser } from "../parsers/txParser";
import { SwapType } from "../pathfinder/tradeTypes";
import { decimals } from "../tokens/decimals";
import { tokenSymbolByAddress } from "../tokens/token";
import {
  PathFinderResultStruct,
  PathFinderResultStructOutput,
} from "../types/contracts/pathfinder/interfaces/IPathFinder";
import { formatBN } from "../utils/formatter";
import { BaseAdapter } from "./adapter";
import { PERCENTAGE_FACTOR } from "./constants";
import { EVMTx } from "./eventOrTx";

export type TradePath = Pick<
  PathFinderResultStructOutput,
  keyof PathFinderResultStruct
>;

export interface BaseTradeInterface {
  swapType: SwapType;
  expectedAmount: BigNumber;
  rate: BigNumber;
  tokenFrom: string;
  tokenTo: string;
  operationName: string;
}

export interface TradeProps extends BaseTradeInterface {
  adapter: BaseAdapter;
  tradePath: TradePath;
}

export interface ConnectTradeProps {
  adapter: BaseAdapter;
  tradePath: TradePath;
}
export class Trade implements BaseTradeInterface {
  protected helper: BaseAdapter;
  protected tradePath: TradePath;

  readonly swapType: SwapType;
  readonly expectedAmount: BigNumber;
  readonly rate: BigNumber;
  readonly tokenFrom: string;
  readonly tokenTo: string;
  readonly operationName: string;

  constructor(props: TradeProps) {
    this.helper = props.adapter;
    this.tradePath = props.tradePath;

    this.swapType = props.swapType;
    this.expectedAmount = props.expectedAmount;
    this.rate = props.rate;
    this.tokenFrom = props.tokenFrom;
    this.tokenTo = props.tokenTo;
    this.operationName = props.operationName;
  }

  static connect({ tradePath, adapter }: ConnectTradeProps) {
    const calls = TxParser.parseMultiCall(tradePath.calls);

    console.log("TRADE CALLS", calls);

    return new Trade({
      tradePath,
      adapter,

      swapType: SwapType.ExactInput,
      expectedAmount: tradePath.amount,
      rate: BigNumber.from(0),
      tokenFrom: "",
      tokenTo: "",
      operationName: "",
    });
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

  execute(slippage: number, signer: Signer): Promise<EVMTx> {
    return this.helper.execute({ tradePath: this.tradePath, slippage, signer });
  }

  toString(): string {
    const symbolFrom = tokenSymbolByAddress[this.tokenFrom.toLowerCase()];
    const symbolTo = tokenSymbolByAddress[this.tokenTo.toLowerCase()];
    if (!symbolFrom) throw new Error(`Unknown token: ${this.tokenFrom}`);
    if (!symbolTo) throw new Error(`Unknown token: ${this.tokenTo}`);

    const decimalsFrom = decimals[symbolFrom];
    const decimalsTo = decimals[symbolTo];

    return `${this.operationName} ${formatBN(
      this.tradePath.amount,
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
}
