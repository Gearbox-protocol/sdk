import { TokenData } from "./token";
import { BigNumber } from "ethers";
import { formatBN } from "../utils/formatter";
import { LEVERAGE_DECIMALS } from "./constants";

export abstract class EVMEvent {
  public readonly block: number;
  public readonly txHash: string;
  abstract toString(tokenData: Record<string, TokenData>): string;

  constructor(block: number, txHash: string) {
    this.block = block;
    this.txHash = txHash;
  }
}

export class EventAddLiquidity extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;

  constructor(
    block: number,
    txHash: string,
    amount: BigNumber,
    underlyingToken: string
  ) {
    super(block, txHash);
    this.amount = amount;
    this.underlyingToken = underlyingToken;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `You deposit ${formatBN(this.amount, token?.decimals || 18)} ${
      token?.symbol || ""
    } to ${token?.symbol} pool`;
  }
}

export class EventRemoveLiquidity extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;
  public readonly dieselToken: string;

  constructor(
    block: number,
    txHash: string,
    amount: BigNumber,
    underlyingToken: string,
    dieselToken: string
  ) {
    super(block, txHash);
    this.amount = amount;
    this.underlyingToken = underlyingToken;
    this.dieselToken = dieselToken;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    const dtoken = tokenData[this.dieselToken];
    return `You withdrawn ${formatBN(this.amount, dtoken?.decimals || 18)} ${
      dtoken?.symbol || ""
    } from ${token?.symbol} pool`;
  }
}

export class EventOpenCreditAccount extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;
  public readonly leverage: number;

  constructor(
    block: number,
    txHash: string,
    amount: BigNumber,
    underlyingToken: string,
    leverage: number
  ) {
    super(block, txHash);
    this.amount = amount;
    this.underlyingToken = underlyingToken;
    this.leverage = leverage;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `You open credit account ${formatBN(
      this.amount,
      token?.decimals || 18
    )} ${token?.symbol} x${this.leverage.toFixed(2)} ⇒ 
    ${formatBN(
      this.amount
        .mul(Math.floor(this.leverage * LEVERAGE_DECIMALS))
        .div(LEVERAGE_DECIMALS),
      token?.decimals || 18
    )} ${token?.symbol}`;
  }
}

export class EventCloseCreditAccount extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;

  constructor(
    block: number,
    txHash: string,
    amount: BigNumber,
    underlyingToken: string
  ) {
    super(block, txHash);
    this.amount = amount;
    this.underlyingToken = underlyingToken;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `You closed ${token?.symbol} credit account and got ${formatBN(
      this.amount,
      token?.decimals || 18
    )} ${token?.symbol} as remaining funds`;
  }
}

export class EventLiquidateCreditAccount extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;

  constructor(
    block: number,
    txHash: string,
    amount: BigNumber,
    underlyingToken: string
  ) {
    super(block, txHash);
    this.amount = amount;
    this.underlyingToken = underlyingToken;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `Your  ${
      token?.symbol
    } credit account was liquidated and you got ${formatBN(
      this.amount,
      token?.decimals || 18
    )} ${token?.symbol} as remaining funds`;
  }
}

export class EventRepayCreditAccount extends EVMEvent {
  public readonly underlyingToken: string;

  constructor(block: number, txHash: string, underlyingToken: string) {
    super(block, txHash);
    this.underlyingToken = underlyingToken;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `You repaid ${token?.symbol} credit account`;
  }
}

export class EventAddCollateral extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly addedToken: string;
  public readonly underlyingToken: string;

  constructor(
    block: number,

    txHash: string,
    amount: BigNumber,
    addedToken: string,
    underlyingToken: string
  ) {
    super(block, txHash);
    this.amount = amount;
    this.underlyingToken = underlyingToken;
    this.addedToken = addedToken;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const addedToken = tokenData[this.addedToken];
    const token = tokenData[this.underlyingToken];
    return `You added ${formatBN(this.amount, addedToken.decimals)} ${
      addedToken.symbol
    } as collateral to your ${token?.symbol} credit account`;
  }
}

export class EventIncreaseBorrowAmount extends EVMEvent {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;

  constructor(
    block: number,
    txHash: string,
    amount: BigNumber,
    underlyingToken: string
  ) {
    super(block, txHash);
    this.amount = amount;
    this.underlyingToken = underlyingToken;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `You increased your borrowing amount to ${formatBN(
      this.amount,
      token?.decimals || 18
    )} ${token?.symbol} for  ${token?.symbol} credit account`;
  }
}
