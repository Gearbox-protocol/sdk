import {
  contractParams,
  decimals,
  isLPToken,
  isSupportedContract,
  SupportedContract,
  tokenSymbolByAddress,
  WAD,
} from "@gearbox-protocol/sdk-gov";
import { Signer } from "ethers";

import { TxParser } from "../parsers/txParser";
import { MultiCall, PathFinderResult, SwapOperation } from "../pathfinder/core";
import { ICreditFacadeV2, ICreditFacadeV2__factory } from "../types";
import { formatBN } from "../utils/formatter";
import { CreditManagerData } from "./creditManager";
import { EVMTx } from "./eventOrTx";
import { TXSwap } from "./transactions";

interface Info {
  name: string;
  contractAddress: string;
  creditManager: string;
}

export interface TradeProps {
  adapter: Info;
  tradePath: PathFinderResult;
  creditFacade: string;

  tokenFrom: string;
  tokenTo: string;
  sourceAmount: bigint;
  expectedAmount: bigint;
  swapType: SwapOperation;
  swapName: TradeOperations;
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

export interface GetTradesProps {
  from: string;
  to: string;
  amount: bigint;
  results: Array<PathFinderResult>;

  creditManager: CreditManagerData;
  currentContracts: Record<SupportedContract, string>;
}

export class Trade {
  readonly helper: Info;
  readonly tradePath: PathFinderResult;
  readonly creditFacade: string;

  readonly swapType: SwapOperation;
  readonly sourceAmount: bigint;
  readonly expectedAmount: bigint;
  readonly rate: bigint;
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
    this.rate = (WAD * props.expectedAmount) / props.sourceAmount;
    this.tokenFrom = props.tokenFrom;
    this.tokenTo = props.tokenTo;
    this.operationName = props.swapName;
  }

  getName(): string {
    return this.helper.name;
  }

  async execute(signer: Signer): Promise<EVMTx> {
    const receipt = await Trade.executeMulticallPath(
      this.creditFacade,
      signer,
      this.tradePath.calls,
    );

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

  static getTrades({
    from,
    to,
    amount,
    results,

    creditManager,
    currentContracts,
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
        creditFacade: creditManager.creditFacade,
        adapter: callInfo[0],
        swapType: SwapOperation.EXACT_INPUT,
        sourceAmount: amount,
        expectedAmount: tradePath.amount,
        tokenFrom: from,
        tokenTo: to,
        swapName: Trade.getOperationName(from, to),
      });

      acc.push(trade);

      return acc;
    }, []);

    return trades;
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

  static getTradeId(trade: Trade) {
    return `${trade.getName()}:${trade.expectedAmount.toString()}`;
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
        const sign = a.expectedAmount > b.expectedAmount ? -1 : 1;
        return swapType === SwapOperation.EXACT_INPUT ? sign : -sign;
      }

      return aSelected ? -1 : 1;
    });

    return sorted;
  }

  static async executeMulticallPath(
    creditFacade: string | ICreditFacadeV2,
    signer: Signer,
    calls: Array<MultiCall>,
  ) {
    if (calls.length < 1) throw new Error("No path to execute");
    const safeCreditFacade =
      typeof creditFacade === "string"
        ? ICreditFacadeV2__factory.connect(creditFacade, signer)
        : creditFacade;

    return this.executeOnCreditFacade(calls, safeCreditFacade);
  }

  private static async executeOnCreditFacade(
    calls: Array<MultiCall>,
    creditFacade: ICreditFacadeV2,
  ) {
    return creditFacade.multicall(calls);
  }
}
