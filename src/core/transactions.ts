import { BigNumber } from "ethers";
import { TokenData } from "../tokens/tokenData";
import { formatBN } from "../utils/formatter";
import { EVMTx, EVMTxProps } from "./eventOrTx";
import { getContractName } from "../contracts/contractsRegister";
import { LEVERAGE_DECIMALS } from "./constants";

export interface TxSerialized {
  type:
    | "TxAddLiquidity"
    | "TxRemoveLiquidity"
    | "TxSwap"
    | "TxAddCollateral"
    | "TxIncreaseBorrowAmount"
    | "TxOpenAccount"
    | "TxRepayAccount"
    | "TxCloseAccount"
    | "TxApprove"
    | "TxOpenMultitokenAccount";
  content: string;
}

export class TxSerializer {
  static serialize(items: Array<EVMTx>): string {
    return JSON.stringify(items.map(i => i.serialize()));
  }

  static deserialize(data: string): Array<EVMTx> {
    return (JSON.parse(data) as Array<TxSerialized>).map(e => {
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
        case "TxOpenAccount":
          return new TxOpenAccount(params);
        case "TxRepayAccount":
          return new TxRepayAccount(params);
        case "TxCloseAccount":
          return new TxCloseAccount(params);
        case "TxApprove":
          return new TxApprove(params);
        case "TxOpenMultitokenAccount":
          return new TxOpenMultitokenAccount(params);
        default:
          throw new Error("Unknown transaction for parsing");
      }
    });
  }
}

interface AddLiquidityProps extends EVMTxProps {
  amount: BigNumber;
  underlyingToken: string;
  pool: string;
}

export class TxAddLiquidity extends EVMTx {
  public readonly amount: BigNumber;

  public readonly underlyingToken: string;

  public readonly pool: string;

  constructor(opts: AddLiquidityProps) {
    super({
      block: opts.block,
      txHash: opts.txHash,
      txStatus: opts.txStatus,
      timestamp: opts.timestamp,
    });
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.pool = opts.pool;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken.toLowerCase()];
    return `${getContractName(this.pool)}: Deposit ${formatBN(
      this.amount,
      token?.decimals || 18,
    )} ${token?.symbol || ""}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxAddLiquidity",
      content: JSON.stringify(this),
    };
  }
}

interface RemoveLiquidityProps extends EVMTxProps {
  amount: BigNumber;
  dieselToken: string;
  pool: string;
}

export class TxRemoveLiquidity extends EVMTx {
  public readonly amount: BigNumber;

  public readonly dieselToken: string;

  public readonly pool: string;

  constructor(opts: RemoveLiquidityProps) {
    super({
      block: opts.block,
      txHash: opts.txHash,
      txStatus: opts.txStatus,
      timestamp: opts.timestamp,
    });
    this.amount = opts.amount;
    this.dieselToken = opts.dieselToken;
    this.pool = opts.pool;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const dtoken = tokenData[this.dieselToken.toLowerCase()];
    return `${getContractName(this.pool)}: Withdraw ${formatBN(
      this.amount,
      dtoken?.decimals || 18,
    )} ${dtoken?.symbol || ""}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxRemoveLiquidity",
      content: JSON.stringify(this),
    };
  }
}

interface SwapProps extends EVMTxProps {
  protocol: string;
  operation: string;
  amountFrom: BigNumber;
  amountTo?: BigNumber;
  tokenFrom: string;
  tokenTo?: string;
  creditManager: string;
}

export class TXSwap extends EVMTx {
  public readonly protocol: string;

  public readonly operation: string;

  public readonly amountFrom: BigNumber;

  public readonly amountTo?: BigNumber;

  public readonly tokenFrom: string;

  public readonly tokenTo?: string;

  public readonly creditManager: string;

  constructor(opts: SwapProps) {
    super({
      block: opts.block,
      txHash: opts.txHash,
      txStatus: opts.txStatus,
      timestamp: opts.timestamp,
    });
    this.protocol = opts.protocol;
    this.operation = opts.operation;
    this.amountFrom = opts.amountFrom;
    this.amountTo = opts.amountTo;
    this.tokenFrom = opts.tokenFrom;
    this.tokenTo = opts.tokenTo;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const tokenFrom = tokenData[this.tokenFrom.toLowerCase()];

    let toPart = "";
    if (this.tokenTo && this.amountTo) {
      const tokenTo = tokenData[this.tokenTo.toLowerCase()];
      toPart = ` ⇒  ${formatBN(this.amountTo, tokenTo?.decimals || 18)} ${
        tokenTo?.symbol || ""
      }`;
    }

    return `Credit account ${getContractName(this.creditManager)}: ${
      this.operation
    } ${formatBN(this.amountFrom, tokenFrom?.decimals || 18)} ${
      tokenFrom?.symbol || ""
    } ${toPart} on ${getContractName(this.protocol)}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxSwap",
      content: JSON.stringify(this),
    };
  }
}

interface AddCollateralProps extends EVMTxProps {
  amount: BigNumber;
  addedToken: string;
  creditManager: string;
}

export class TxAddCollateral extends EVMTx {
  public readonly amount: BigNumber;

  public readonly addedToken: string;

  public readonly creditManager: string;

  constructor(opts: AddCollateralProps) {
    super({
      block: opts.block,
      txHash: opts.txHash,
      txStatus: opts.txStatus,
      timestamp: opts.timestamp,
    });
    this.amount = opts.amount;
    this.addedToken = opts.addedToken;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const addedToken = tokenData[this.addedToken.toLowerCase()];
    return `Credit account ${getContractName(
      this.creditManager,
    )}: Added ${formatBN(this.amount, addedToken.decimals)} ${
      addedToken.symbol
    } as collateral`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxAddCollateral",
      content: JSON.stringify(this),
    };
  }
}

interface IncreaseBorrowAmountProps extends EVMTxProps {
  amount: BigNumber;
  underlyingToken: string;
  creditManager: string;
}

export class TxIncreaseBorrowAmount extends EVMTx {
  public readonly amount: BigNumber;

  public readonly underlyingToken: string;

  public readonly creditManager: string;

  constructor(opts: IncreaseBorrowAmountProps) {
    super({
      block: opts.block,
      txHash: opts.txHash,
      txStatus: opts.txStatus,
      timestamp: opts.timestamp,
    });
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken.toLowerCase()];
    return `Credit account ${getContractName(
      this.creditManager,
    )}: Borrowed amount was increased for ${formatBN(
      this.amount,
      token?.decimals || 18,
    )} ${token?.symbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxIncreaseBorrowAmount",
      content: JSON.stringify(this),
    };
  }
}

interface OpenAccountProps extends EVMTxProps {
  amount: BigNumber;
  underlyingToken: string;
  leverage: number;
  creditManager: string;
}

export class TxOpenAccount extends EVMTx {
  public readonly amount: BigNumber;

  public readonly underlyingToken: string;

  public readonly leverage: number;

  public readonly creditManager: string;

  constructor(opts: OpenAccountProps) {
    super({
      block: opts.block,
      txHash: opts.txHash,
      txStatus: opts.txStatus,
      timestamp: opts.timestamp,
    });
    this.amount = BigNumber.from(opts.amount);
    this.underlyingToken = opts.underlyingToken;
    this.leverage = opts.leverage;
    this.creditManager = opts.creditManager;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.underlyingToken.toLowerCase()];
    return `Credit account ${getContractName(
      this.creditManager,
    )}: opening ${formatBN(this.amount, token?.decimals || 18)} ${
      token?.symbol
    } x ${this.leverage.toFixed(2)} ⇒ 
    ${formatBN(
      this.amount
        .mul(Math.floor(this.leverage * LEVERAGE_DECIMALS))
        .div(LEVERAGE_DECIMALS),
      token?.decimals || 18,
    )} ${token?.symbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxOpenAccount",
      content: JSON.stringify(this),
    };
  }
}

interface TxOpenMultitokenAccountProps extends EVMTxProps {
  borrowedAmount: BigNumber;
  creditManager: string;
  underlyingToken: string;
  assets: Array<string>;
}

export class TxOpenMultitokenAccount extends EVMTx {
  public readonly borrowedAmount: BigNumber;

  public readonly creditManager: string;

  public readonly underlyingToken: string;

  public readonly assets: Array<string>;

  constructor(opts: TxOpenMultitokenAccountProps) {
    super({
      block: opts.block,
      txHash: opts.txHash,
      txStatus: opts.txStatus,
      timestamp: opts.timestamp,
    });
    this.borrowedAmount = BigNumber.from(opts.borrowedAmount);
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
    this.assets = opts.assets;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const underlyingToken = tokenData[this.underlyingToken.toLowerCase()];

    const assetSymbols = this.assets.reduce<Array<string>>(
      (acc, assetAddress) => {
        const token = tokenData[assetAddress.toLowerCase()];
        if (token) acc.push(token.symbol);
        return acc;
      },
      [],
    );

    return `Credit account ${getContractName(
      this.creditManager,
    )}: opening. Borrowed amount: ${formatBN(
      this.borrowedAmount,
      underlyingToken?.decimals || 18,
    )} ${underlyingToken?.symbol}; assets: ${assetSymbols.join(", ")}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxOpenMultitokenAccount",
      content: JSON.stringify(this),
    };
  }
}

interface RepayAccountProps extends EVMTxProps {
  creditManager: string;
}

export class TxRepayAccount extends EVMTx {
  public readonly creditManager: string;

  constructor(opts: RepayAccountProps) {
    super({
      block: opts.block,
      txHash: opts.txHash,
      txStatus: opts.txStatus,
      timestamp: opts.timestamp,
    });
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit account ${getContractName(
      this.creditManager,
    )}: Repaying account`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxRepayAccount",
      content: JSON.stringify(this),
    };
  }
}

interface CloseAccountProps extends EVMTxProps {
  creditManager: string;
}

export class TxCloseAccount extends EVMTx {
  public readonly creditManager: string;

  constructor(opts: CloseAccountProps) {
    super({
      block: opts.block,
      txHash: opts.txHash,
      txStatus: opts.txStatus,
      timestamp: opts.timestamp,
    });
    this.creditManager = opts.creditManager;
  }

  toString(): string {
    return `Credit account ${getContractName(
      this.creditManager,
    )}: Closing account`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxCloseAccount",
      content: JSON.stringify(this),
    };
  }
}

interface ApproveProps extends EVMTxProps {
  token: string;
}

export class TxApprove extends EVMTx {
  public readonly token: string;

  constructor(opts: ApproveProps) {
    super({
      block: opts.block,
      txHash: opts.txHash,
      txStatus: opts.txStatus,
      timestamp: opts.timestamp,
    });
    this.token = opts.token;
  }

  toString(tokenData: Record<string, TokenData>): string {
    const token = tokenData[this.token.toLowerCase()];
    return `Approve ${token?.symbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxApprove",
      content: JSON.stringify(this),
    };
  }
}
