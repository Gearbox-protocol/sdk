import {
  contractParams,
  decimals,
  formatBN,
  isSupportedContract,
  tokenSymbolByAddress,
  WAD,
} from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import { TxParser } from "../parsers/txParser";
import type { MultiCall, PathFinderResult } from "../pathfinder/core";
import { SwapOperation } from "../pathfinder/core";
import type { CreditManagerData } from "./creditManager";

interface Info {
  name: string;
  creditManager: Address;
  creditManagerName: string;
}

interface TradeProps {
  adapter: Info;
  tradePath: PathFinderResult;

  tokenIn: Address;
  tokenOut: Address;
  sourceAmount: bigint;
  minExpectedAmount: bigint;
  averageExpectedAmount: bigint;
  swapOperation: SwapOperation;
  swapName: TradeOperations;
}

export type TradeOperations = "farmWithdraw" | "farmDeposit" | "swap";

export interface GetTradesProps {
  tokenIn: Address;
  tokenOut: Address;

  amount: bigint;
  results: Array<PathFinderResult>;

  creditManager: CreditManagerData;

  swapOperation: SwapOperation;
  swapName: TradeOperations;
}

export class Trade {
  readonly helper: Info;
  readonly tradePath: PathFinderResult;

  readonly swapOperation: SwapOperation;
  readonly sourceAmount: bigint;
  readonly minExpectedAmount: bigint;
  readonly averageExpectedAmount: bigint;
  readonly rate: bigint;
  readonly tokenIn: Address;
  readonly tokenOut: Address;
  readonly operationName: TradeOperations;

  private constructor(props: TradeProps) {
    this.helper = props.adapter;
    this.tradePath = props.tradePath;

    this.swapOperation = props.swapOperation;
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

    swapOperation,
    swapName,
  }: GetTradesProps) {
    const trades = results.reduce<Array<Trade>>((acc, tradePath) => {
      const { calls } = tradePath;
      const callInfo = Trade.getCallInfo(
        calls,
        creditManager.address,
        creditManager.name,
      );

      const trade = new Trade({
        tradePath,
        adapter: callInfo[0] || {
          name: "unknown",
          contractAddress: calls[0]?.target || "",
          creditManager: creditManager.address,
          creditManagerName: creditManager.name,
        },
        swapOperation,
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
    creditManager: Address,
    creditManagerName: string,
  ) {
    const callAdapters = calls.reduce<Array<Info>>((acc, call) => {
      const contractSymbol = this.getContractSymbol(
        call.target.toLowerCase() as Address,
      );

      if (!isSupportedContract(contractSymbol)) {
        return acc;
      }

      const { name } = contractParams[contractSymbol];

      acc.push({
        name,
        creditManager,
        creditManagerName,
      });

      return acc;
    }, []);

    return callAdapters;
  }

  private static getContractSymbol(address: Address) {
    try {
      const { contract } = TxParser.getParseData(address);
      return contract;
    } catch (e) {
      return undefined;
    }
  }

  static sortTrades(trades: Array<Trade>, swapStrategy: string) {
    if (trades.length === 0) return [];

    const { swapOperation } = trades[0];

    const sorted = [...trades].sort((a, b) => {
      const aSelected =
        a.getName().toLowerCase().search(swapStrategy.toLowerCase()) >= 0;
      const bSelected =
        b.getName().toLowerCase().search(swapStrategy.toLowerCase()) >= 0;

      if ((aSelected && bSelected) || (!aSelected && !bSelected)) {
        const sign = a.minExpectedAmount > b.minExpectedAmount ? -1 : 1;
        return swapOperation === SwapOperation.EXACT_INPUT ? sign : -sign;
      }

      return aSelected ? -1 : 1;
    });

    return sorted;
  }
}
