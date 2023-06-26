import { BigNumber, Signer } from "ethers";

import { AdapterInterface } from "../contracts/adapters";
import { MultiCall, PathFinderResult, SwapOperation } from "../pathfinder/core";
import { decimals } from "../tokens/decimals";
import { isLPToken, tokenSymbolByAddress } from "../tokens/token";
import { ICreditFacade, ICreditFacade__factory } from "../types";
import { formatBN } from "../utils/formatter";
import { BaseAdapter } from "./adapter";
import { WAD } from "./constants";
import { EVMTx } from "./eventOrTx";
import { TXSwap } from "./transactions";

interface BaseTradeInterface {
  swapType: SwapOperation;
  sourceAmount: BigNumber;
  expectedAmount: BigNumber;
  tokenFrom: string;
  tokenTo: string;
  operationName: TradeOperations;
}

export interface TradeProps extends BaseTradeInterface {
  adapter: BaseAdapter;
  tradePath: PathFinderResult;
  creditFacade: string;
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
  readonly helper: BaseAdapter;
  readonly tradePath: PathFinderResult;
  readonly creditFacade: string;

  readonly swapType: SwapOperation;
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
    this.rate = WAD.mul(props.expectedAmount).div(props.sourceAmount);
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

  static async executeMulticallPath(
    creditFacade: string | ICreditFacade,
    signer: Signer,
    calls: Array<MultiCall>,
  ) {
    if (calls.length < 1) throw new Error("No path to execute");
    const safeCreditFacade =
      typeof creditFacade === "string"
        ? ICreditFacade__factory.connect(creditFacade, signer)
        : creditFacade;

    return this.executeOnCreditFacade(calls, safeCreditFacade);
  }

  private static async executeOnCreditFacade(
    calls: Array<MultiCall>,
    creditFacade: ICreditFacade,
  ) {
    return creditFacade.multicall(calls);
  }
}
