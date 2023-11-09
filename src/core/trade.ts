import {
  contractParams,
  decimals,
  formatBN,
  isSupportedContract,
  SupportedContract,
  tokenSymbolByAddress,
  WAD,
} from "@gearbox-protocol/sdk-gov";

import { TxParser } from "../parsers/txParser";
import { MultiCall, PathFinderResult, SwapOperation } from "../pathfinder/core";
import { CreditManagerData } from "./creditManager";

interface Info {
  name: string;
  contractAddress: string;
  creditManager: string;
}

interface TradeProps {
  adapter: Info;
  tradePath: PathFinderResult;

  tokenIn: string;
  tokenOut: string;
  sourceAmount: bigint;
  minExpectedAmount: bigint;
  averageExpectedAmount: bigint;
  swapType: SwapOperation;
  swapName: TradeOperations;
}

export type TradeOperations = "farmWithdraw" | "farmDeposit" | "swap";

export interface GetTradesProps {
  tokenIn: string;
  tokenOut: string;

  amount: bigint;
  results: Array<PathFinderResult>;

  creditManager: CreditManagerData;
  currentContracts: Record<SupportedContract, string>;

  swapType: SwapOperation;
  swapName: TradeOperations;
}

export class Trade {
  readonly helper: Info;
  readonly tradePath: PathFinderResult;

  readonly swapType: SwapOperation;
  readonly sourceAmount: bigint;
  readonly minExpectedAmount: bigint;
  readonly averageExpectedAmount: bigint;
  readonly rate: bigint;
  readonly tokenIn: string;
  readonly tokenOut: string;
  readonly operationName: TradeOperations;

  private constructor(props: TradeProps) {
    this.helper = props.adapter;
    this.tradePath = props.tradePath;

    this.swapType = props.swapType;
    this.sourceAmount = props.sourceAmount;
    this.minExpectedAmount = props.minExpectedAmount;
    this.averageExpectedAmount = props.averageExpectedAmount;
    this.rate = (WAD * props.minExpectedAmount) / props.sourceAmount;
    this.tokenIn = props.tokenIn;
    this.tokenOut = props.tokenOut;
    this.operationName = props.swapName;
  }

  getName(): string {
    return this.helper.name;
  }

  toString(): string {
    const symbolFrom = tokenSymbolByAddress[this.tokenIn.toLowerCase()];
    const symbolTo = tokenSymbolByAddress[this.tokenOut.toLowerCase()];
    if (!symbolFrom) throw new Error(`Unknown token: ${this.tokenIn}`);
    if (!symbolTo) throw new Error(`Unknown token: ${this.tokenOut}`);

    const decimalsFrom = decimals[symbolFrom];
    const decimalsTo = decimals[symbolTo];

    return `${this.operationName} ${formatBN(
      this.sourceAmount,
      decimalsFrom,
    )} ${symbolFrom} ⇒ ${formatBN(
      this.minExpectedAmount,
      decimalsTo,
    )} ${symbolTo} on ${this.helper.name}`;
  }

  static getTrades({
    tokenIn,
    tokenOut,
    amount,
    results,

    creditManager,
    currentContracts,

    swapType,
    swapName,
  }: GetTradesProps) {
    const trades = results.reduce<Array<Trade>>((acc, tradePath) => {
      const { calls } = tradePath;
      const callInfo = Trade.getCallInfo(
        calls,
        creditManager.address,
        currentContracts,
      );

      const trade = new Trade({
        tradePath,
        adapter: callInfo[0],
        swapType,
        sourceAmount: amount,
        minExpectedAmount: tradePath.minAmount,
        averageExpectedAmount: tradePath.amount,
        tokenIn,
        tokenOut,
        swapName,
      });

      acc.push(trade);

      return acc;
    }, []);

    return trades;
  }

  static getCallInfo(
    calls: Array<MultiCall>,
    creditManager: string,
    currentContracts: Record<SupportedContract, string>,
  ) {
    const callAdapters = calls.reduce<Array<Info>>((acc, call) => {
      const contractSymbol = this.getContractSymbol(call.target.toLowerCase());
      if (!isSupportedContract(contractSymbol)) return acc;

      const { name } = contractParams[contractSymbol];
      const contractAddress = currentContracts[contractSymbol];

      acc.push({
        name,
        contractAddress,
        creditManager,
      });

      return acc;
    }, []);

    return callAdapters;
  }

  private static getContractSymbol(address: string) {
    try {
      const { contract } = TxParser.getParseData(address);
      return contract;
    } catch (e) {
      return undefined;
    }
  }

  static sortTrades(trades: Array<Trade>, swapStrategy: string) {
    if (trades.length === 0) return [];

    const { swapType } = trades[0];

    const sorted = [...trades].sort((a, b) => {
      const aSelected =
        a.getName().toLowerCase().search(swapStrategy.toLowerCase()) >= 0;
      const bSelected =
        b.getName().toLowerCase().search(swapStrategy.toLowerCase()) >= 0;

      if ((aSelected && bSelected) || (!aSelected && !bSelected)) {
        const sign = a.minExpectedAmount > b.minExpectedAmount ? -1 : 1;
        return swapType === SwapOperation.EXACT_INPUT ? sign : -sign;
      }

      return aSelected ? -1 : 1;
    });

    return sorted;
  }
}
