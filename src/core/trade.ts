import { BigNumber, Signer } from "ethers";

import { AdapterInterface } from "../contracts/adapters";
import { TxParser } from "../parsers/txParser";
import { SwapType } from "../pathfinder/tradeTypes";
import { TokenData } from "../tokens/tokenData";
import {
  PathFinderResultStruct,
  PathFinderResultStructOutput,
} from "../types/contracts/pathfinder/interfaces/IPathFinder";
import { formatBN } from "../utils/formatter";
import { AdapterType, BaseAdapter } from "./adapter";
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

  toString(tokenData: Record<string, TokenData>): string {
    let result =
      this.helper.type === AdapterType.Swap
        ? `Swap `
        : `${this.operationName || "Farm"} `;
    const fromToken = tokenData[this.tokenFrom];
    const toToken = tokenData[this.tokenTo];
    result += `${formatBN(this.tradePath.amount, fromToken.decimals)} ${
      fromToken.symbol
    } ⇒ ${formatBN(this.expectedAmount, toToken.decimals)} ${
      toToken.symbol
    } on ${this.helper.name}`;
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
