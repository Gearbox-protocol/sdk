import { BigNumber } from "ethers";
import { TokenData } from "./token";
import { formatBN } from "../utils/formatter";
import { EVMTx, TxStatus } from "./eventOrTx";
import { getContractName } from "./contractsRegister";

export interface TxSerialized {
  type:
    | "TxAddLiquidity"
    | "TxRemoveLiquidity"
    | "TxSwap"
    | "TxAddCollateral"
    | "TxIncreaseBorrowAmount";
  content: string;
}

export class TxSerializer {
  static serialize(items: Array<EVMTx>): string {
    return JSON.stringify(items.map((i) => i.serialize()));
  }

  static deserialize(data: string): Array<EVMTx> {
    return (JSON.parse(data) as Array<TxSerialized>).map((e) => {
      const params = JSON.parse(e.content);
      switch (e.type) {
        case "TxAddLiquidity":
          return new TxAddLiquidity(params);
        case "TxRemoveLiquidity":
          return new TxRemoveLiquidity(params);
        case "TxSwap":
          return new TXSwap(params);
        case "TxAddCollateral":
          return new TxAddCollateral(params);
        case "TxIncreaseBorrowAmount":
          return new TxIncreaseBorrowAmount(params);
        default:
          throw new Error("Unknown transaction for parsing");
      }
    });
  }
}

export class TxAddLiquidity extends EVMTx {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;
  public readonly pool: string;

  constructor(opts: {
    block?: number;
    txStatus: TxStatus;
    txHash: string;
    amount: BigNumber;
    underlyingToken: string;
    pool: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash, txStatus: opts.txStatus });
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.pool = opts.pool;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `${getContractName(this.pool)}: Deposit ${formatBN(
      this.amount,
      token?.decimals || 18
    )} ${token?.symbol || ""}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxAddLiquidity",
      content: JSON.stringify(this),
    };
  }
}

export class TxRemoveLiquidity extends EVMTx {
  public readonly amount: BigNumber;
  public readonly dieselToken: string;
  public readonly pool: string;

  constructor(opts: {
    block?: number;
    txStatus: TxStatus;
    txHash: string;
    amount: BigNumber;
    dieselToken: string;
    pool: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash, txStatus: opts.txStatus });
    this.amount = opts.amount;
    this.dieselToken = opts.dieselToken;
    this.pool = opts.pool;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const dtoken = tokenData[this.dieselToken];
    return `${getContractName(this.pool)}: Withdraw ${formatBN(
      this.amount,
      dtoken?.decimals || 18
    )} ${dtoken?.symbol || ""}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxRemoveLiquidity",
      content: JSON.stringify(this),
    };
  }
}

export class TXSwap extends EVMTx {
  public readonly protocol: string;
  public readonly operation: string;
  public readonly amountFrom: BigNumber;
  public readonly amountTo: BigNumber;
  public readonly tokenFrom: string;
  public readonly tokenTo: string;
  public readonly creditManager: string;

  constructor(opts: {
    block?: number;
    txStatus: TxStatus;
    txHash: string;
    protocol: string;
    operation: string;
    amountFrom: BigNumber;
    amountTo: BigNumber;
    tokenFrom: string;
    tokenTo: string;
    creditManager: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash, txStatus: opts.txStatus });
    this.protocol = opts.protocol;
    this.operation = opts.operation;
    this.amountFrom = opts.amountFrom;
    this.amountTo = opts.amountTo;
    this.tokenFrom = opts.tokenFrom;
    this.tokenTo = opts.tokenTo;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const tokenFrom = tokenData[this.tokenFrom];
    const tokenTo = tokenData[this.tokenTo];
    return `${getContractName(this.creditManager)}: ${
      this.operation
    } ${formatBN(this.amountFrom, tokenFrom?.decimals || 18)} ${
      tokenFrom?.symbol || ""
    } ⇒  ${formatBN(this.amountTo, tokenTo?.decimals || 18)} ${
      tokenTo?.symbol || ""
    } on ${getContractName(this.protocol)}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxSwap",
      content: JSON.stringify(this),
    };
  }
}

export class TxAddCollateral extends EVMTx {
  public readonly amount: BigNumber;
  public readonly addedToken: string;
  public readonly creditManager: string;

  constructor(opts: {
    block?: number;
    txStatus: TxStatus;
    txHash: string;
    amount: BigNumber;
    addedToken: string;
    creditManager: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash, txStatus: opts.txStatus });
    this.amount = opts.amount;
    this.addedToken = opts.addedToken;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const addedToken = tokenData[this.addedToken];
    return `${getContractName(this.creditManager)}: Added ${formatBN(
      this.amount,
      addedToken.decimals
    )} ${addedToken.symbol} as collateral`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxAddCollateral",
      content: JSON.stringify(this),
    };
  }
}

export class TxIncreaseBorrowAmount extends EVMTx {
  public readonly amount: BigNumber;
  public readonly underlyingToken: string;
  public readonly creditManager: string;

  constructor(opts: {
    block?: number;
    txStatus: TxStatus;
    txHash: string;
    amount: BigNumber;
    underlyingToken: string;
    creditManager: string;
  }) {
    super({ block: opts.block, txHash: opts.txHash, txStatus: opts.txStatus });
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken];
    return `${getContractName(
      this.creditManager
    )}: Borrowed amount was increased for ${formatBN(
      this.amount,
      token?.decimals || 18
    )} ${token?.symbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxIncreaseBorrowAmount",
      content: JSON.stringify(this),
    };
  }
}
