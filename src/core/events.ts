import { TokenData } from "./token";
import { BigNumber } from "ethers";
import { formatBN } from "../utils/formatter";
import { LEVERAGE_DECIMALS } from "./constants";

export interface Display {
  toString(tokenData: Record<string, TokenData>): string;
}

export abstract class EventOrTx implements Display {
  public readonly block: number;
  public readonly txHash: string;
  public isPending: boolean;
  abstract toString(tokenData: Record<string, TokenData>): string;

  constructor({block: number, txHash: string, isPending?: booolean}) {
    this.block = block;
    this.txHash = txHash;
    this.isPending = false;
  }


}

export class EventAddLiquidity extends EventOrTx {
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
    return `Deposit ${formatBN(this.amount, token?.decimals || 18)} ${
      token?.symbol || ""
    } to ${token?.symbol} pool`;
  }
}

export class EventRemoveLiquidity extends EventOrTx {
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
    return `Withdraw ${formatBN(this.amount, dtoken?.decimals || 18)} ${
      dtoken?.symbol || ""
    } from ${token?.symbol} pool`;
  }
}

export class EventOpenCreditAccount extends EventOrTx {
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
    return `Open credit account ${formatBN(
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

export class EventCloseCreditAccount extends EventOrTx {
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
    return `Close ${token?.symbol} credit account and got ${formatBN(
      this.amount,
      token?.decimals || 18
    )} ${token?.symbol} as remaining funds`;
  }
}

export class EventLiquidateCreditAccount extends EventOrTx {
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
    return `${token?.symbol} credit account was liquidated. You got ${formatBN(
      this.amount,
      token?.decimals || 18
    )} ${token?.symbol} as remaining funds`;
  }
}

export class EventRepayCreditAccount extends EventOrTx {
  public readonly underlyingToken: string;

  constructor(block: number, txHash: string, underlyingToken: string) {
    super(block, txHash);
    this.underlyingToken = underlyingToken;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `Repay ${token?.symbol} credit account`;
  }
}

export class EventAddCollateral extends EventOrTx {
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
    return `Added ${formatBN(this.amount, addedToken.decimals)} ${
      addedToken.symbol
    } as collateral to ${token?.symbol} credit account`;
  }
}

export class EventIncreaseBorrowAmount extends EventOrTx {
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
    return `Borrowed amount was increased for ${formatBN(
      this.amount,
      token?.decimals || 18
    )} ${token?.symbol} for  ${token?.symbol} credit account`;
  }
}
