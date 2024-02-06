import {
  contractParams,
  decimals as decimalList,
  extractTokenData,
  formatBN,
  LEVERAGE_DECIMALS,
  SupportedContract,
} from "@gearbox-protocol/sdk-gov";

import { getContractName } from "../contracts/contractsRegister";
import { BigIntMath } from "../utils/math";
import { Asset } from "./assets";
import { EVMTx, EVMTxProps } from "./eventOrTx";

interface CMEvent {
  readonly creditManager: string;
  readonly creditManagerName?: string;
}

interface PoolEvent {
  readonly pool: string;
  readonly poolName?: string;
}

export interface TxSerialized {
  type:
    | "TxAddLiquidity"
    | "TxRemoveLiquidity"
    | "TxSwap"
    | "TxAddCollateral"
    | "TxIncreaseBorrowAmount"
    | "TxDecreaseBorrowAmount"
    | "TxOpenAccount"
    | "TxRepayAccount"
    | "TxCloseAccount"
    | "TxApprove"
    | "TxOpenMultitokenAccount"
    | "TxClaimReward"
    | "TxClaimNFT"
    | "TxClaimGearRewards"
    | "TxEnableTokens"
    | "TxUpdateQuota"
    | "TxGaugeStake"
    | "TxGaugeUnstake"
    | "TxGaugeClaim"
    | "TxGaugeVote"
    | "TxWithdrawCollateral";
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
        case "TxDecreaseBorrowAmount":
          return new TxDecreaseBorrowAmount(params);
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
        case "TxClaimReward":
          return new TxClaimReward(params);
        case "TxClaimNFT":
          return new TxClaimNFT(params);
        case "TxClaimGearRewards":
          return new TxClaimGearRewards(params);
        case "TxEnableTokens":
          return new TxEnableTokens(params);
        case "TxUpdateQuota":
          return new TxUpdateQuota(params);
        case "TxGaugeStake":
          return new TxGaugeStake(params);
        case "TxGaugeUnstake":
          return new TxGaugeUnstake(params);
        case "TxGaugeClaim":
          return new TxGaugeClaim(params);
        case "TxGaugeVote":
          return new TxGaugeVote(params);
        case "TxWithdrawCollateral":
          return new TxWithdrawCollateral(params);

        default:
          throw new Error(`Unknown transaction for parsing: ${e.type}`);
      }
    });
  }
}

interface AddLiquidityProps extends EVMTxProps {
  amount: bigint;
  underlyingToken: string;
  pool: string;
  poolName?: string;
}

export class TxAddLiquidity extends EVMTx implements PoolEvent {
  readonly amount: bigint;
  readonly underlyingToken: string;
  readonly pool: string;
  readonly poolName?: string;

  constructor(opts: AddLiquidityProps) {
    super(opts);
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.pool = opts.pool;
    this.poolName = opts.poolName;
  }

  toString(): string {
    const [underlyingSymbol, underlyingDecimals] = extractTokenData(
      this.underlyingToken,
    );

    return `${this.poolName || getContractName(this.pool)}: Deposit ${formatBN(
      this.amount,
      underlyingDecimals || 18,
    )} ${underlyingSymbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxAddLiquidity",
      content: JSON.stringify(this),
    };
  }
}

interface RemoveLiquidityProps extends EVMTxProps {
  amount: bigint;
  dieselToken: string;
  pool: string;
  poolName?: string;
}

export class TxRemoveLiquidity extends EVMTx implements PoolEvent {
  readonly amount: bigint;
  readonly dieselToken: string;
  readonly pool: string;
  readonly poolName?: string;

  constructor(opts: RemoveLiquidityProps) {
    super(opts);
    this.amount = opts.amount;
    this.dieselToken = opts.dieselToken;
    this.pool = opts.pool;
    this.poolName = opts.poolName;
  }

  toString(): string {
    const [dSymbol, dDecimals] = extractTokenData(this.dieselToken);

    return `${this.poolName || getContractName(this.pool)}: Withdraw ${formatBN(
      this.amount,
      dDecimals || 18,
    )} ${dSymbol}`;
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
  amountFrom: bigint;
  amountTo?: bigint;
  tokenFrom: string;
  tokenTo?: string;
  creditManager: string;
  creditManagerName?: string;
}

export class TXSwap extends EVMTx implements CMEvent {
  readonly protocol: string;
  readonly operation: string;
  readonly amountFrom: bigint;
  readonly amountTo?: bigint;
  readonly tokenFrom: string;
  readonly tokenTo?: string;
  readonly creditManager: string;
  readonly creditManagerName?: string;

  constructor(opts: SwapProps) {
    super(opts);
    this.protocol = opts.protocol;
    this.operation = opts.operation;
    this.amountFrom = opts.amountFrom;
    this.amountTo = opts.amountTo;
    this.tokenFrom = opts.tokenFrom;
    this.tokenTo = opts.tokenTo;
    this.creditManager = opts.creditManager;
    this.creditManagerName = opts.creditManagerName;
  }

  toString(): string {
    let toPart = "";
    if (this.tokenTo && this.amountTo) {
      const [toSymbol, toDecimals] = extractTokenData(this.tokenTo);

      toPart = ` ⇒  ${formatBN(this.amountTo, toDecimals || 18)} ${toSymbol}`;
    }

    const [fromSymbol, fromDecimals] = extractTokenData(this.tokenFrom);

    return `Credit Account ${
      this.creditManagerName || getContractName(this.creditManager)
    }: ${this.operation} ${formatBN(
      this.amountFrom,
      fromDecimals || 18,
    )} ${fromSymbol} ${toPart} on ${this.protocol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxSwap",
      content: JSON.stringify(this),
    };
  }
}

interface AddCollateralProps extends EVMTxProps {
  amount: bigint;
  addedToken: string;
  creditManager: string;
  creditManagerName?: string;
}

export class TxAddCollateral extends EVMTx implements CMEvent {
  readonly amount: bigint;
  readonly addedToken: string;
  readonly creditManager: string;
  readonly creditManagerName?: string;

  constructor(opts: AddCollateralProps) {
    super(opts);
    this.amount = opts.amount;
    this.addedToken = opts.addedToken;
    this.creditManager = opts.creditManager;
    this.creditManagerName = opts.creditManagerName;
  }

  toString(): string {
    const [addedSymbol, addedDecimals] = extractTokenData(this.addedToken);

    return `Credit Account ${
      this.creditManagerName || getContractName(this.creditManager)
    }: Added ${formatBN(
      this.amount,
      addedDecimals || 18,
    )} ${addedSymbol} as collateral`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxAddCollateral",
      content: JSON.stringify(this),
    };
  }
}

interface IncreaseBorrowAmountProps extends EVMTxProps {
  amount: bigint;
  underlyingToken: string;
  creditManager: string;
  creditManagerName?: string;
}

export class TxIncreaseBorrowAmount extends EVMTx implements CMEvent {
  readonly amount: bigint;
  readonly underlyingToken: string;
  readonly creditManager: string;
  readonly creditManagerName?: string;

  constructor(opts: IncreaseBorrowAmountProps) {
    super(opts);
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
    this.creditManagerName = opts.creditManagerName;
  }

  toString(): string {
    const [tokenSymbol, tokenDecimals] = extractTokenData(this.underlyingToken);

    return `Credit Account ${
      this.creditManagerName || getContractName(this.creditManager)
    }: Borrowed amount was increased for ${formatBN(
      this.amount,
      tokenDecimals || 18,
    )} ${tokenSymbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxIncreaseBorrowAmount",
      content: JSON.stringify(this),
    };
  }
}

interface DecreaseBorrowAmountProps extends EVMTxProps {
  amount: bigint;
  underlyingToken: string;
  creditManager: string;
  creditManagerName?: string;
}

export class TxDecreaseBorrowAmount extends EVMTx implements CMEvent {
  readonly amount: bigint;
  readonly underlyingToken: string;
  readonly creditManager: string;
  readonly creditManagerName?: string;

  constructor(opts: DecreaseBorrowAmountProps) {
    super(opts);
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
    this.creditManagerName = opts.creditManagerName;
  }

  toString(): string {
    const [tokenSymbol, tokenDecimals] = extractTokenData(this.underlyingToken);

    return `Credit Account ${
      this.creditManagerName || getContractName(this.creditManager)
    }: Borrowed amount was decreased for ${formatBN(
      this.amount,
      tokenDecimals || 18,
    )} ${tokenSymbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxIncreaseBorrowAmount",
      content: JSON.stringify(this),
    };
  }
}

interface OpenAccountProps extends EVMTxProps {
  amount: bigint;
  underlyingToken: string;
  leverage: number;
  creditManager: string;
  creditManagerName?: string;
}

export class TxOpenAccount extends EVMTx implements CMEvent {
  readonly amount: bigint;
  readonly underlyingToken: string;
  readonly leverage: number;
  readonly creditManager: string;
  readonly creditManagerName?: string;

  constructor(opts: OpenAccountProps) {
    super(opts);
    this.amount = opts.amount;
    this.underlyingToken = opts.underlyingToken;
    this.leverage = opts.leverage;
    this.creditManager = opts.creditManager;
    this.creditManagerName = opts.creditManagerName;
  }

  toString(): string {
    const [tokenSymbol, tokenDecimals] = extractTokenData(this.underlyingToken);

    return `Credit Account ${
      this.creditManagerName || getContractName(this.creditManager)
    }: opening ${formatBN(
      this.amount,
      tokenDecimals || 18,
    )} ${tokenSymbol} x ${this.leverage.toFixed(2)} ⇒ 
    ${formatBN(
      (this.amount *
        BigInt(Math.floor(this.leverage * Number(LEVERAGE_DECIMALS)))) /
        LEVERAGE_DECIMALS,
      tokenDecimals || 18,
    )} ${tokenSymbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxOpenAccount",
      content: JSON.stringify(this),
    };
  }
}

interface TxOpenMultitokenAccountProps extends EVMTxProps {
  borrowedAmount: bigint;
  creditManager: string;
  creditManagerName?: string;
  underlyingToken: string;
  assets: Array<string>;
}

export class TxOpenMultitokenAccount extends EVMTx implements CMEvent {
  readonly borrowedAmount: bigint;
  readonly creditManager: string;
  readonly creditManagerName?: string;
  readonly underlyingToken: string;
  readonly assets: Array<string>;

  constructor(opts: TxOpenMultitokenAccountProps) {
    super(opts);
    this.borrowedAmount = opts.borrowedAmount;
    this.underlyingToken = opts.underlyingToken;
    this.creditManager = opts.creditManager;
    this.creditManagerName = opts.creditManagerName;
    this.assets = opts.assets;
  }

  toString(): string {
    const assetSymbols = this.assets.reduce<Array<string>>(
      (acc, assetAddress) => {
        const [tokenSymbol] = extractTokenData(assetAddress);
        if (tokenSymbol) acc.push(tokenSymbol);
        return acc;
      },
      [],
    );

    const [symbol, underlyingDecimals] = extractTokenData(this.underlyingToken);

    return `Credit Account ${
      this.creditManagerName || getContractName(this.creditManager)
    }: opening. Borrowed amount: ${formatBN(
      this.borrowedAmount,
      underlyingDecimals || 18,
    )} ${symbol}; assets: ${assetSymbols.join(", ")}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxOpenMultitokenAccount",
      content: JSON.stringify(this),
    };
  }
}

interface TxClaimRewardProps extends EVMTxProps {
  contracts: Array<SupportedContract>;
}

export class TxClaimReward extends EVMTx {
  readonly contracts: Array<SupportedContract>;

  constructor(opts: TxClaimRewardProps) {
    super(opts);
    this.contracts = opts.contracts;
  }

  toString(): string {
    const contractNames = this.contracts.map(contract => {
      const contractInfo = contractParams[contract];
      return contractInfo.name;
    });

    return `Pools reward claimed: ${contractNames.join(", ")}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxClaimReward",
      content: JSON.stringify(this),
    };
  }
}

export class TxClaimNFT extends EVMTx {
  toString(): string {
    return `NFT claimed`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxClaimNFT",
      content: JSON.stringify(this),
    };
  }
}

interface TxClaimGearRewardsProps extends EVMTxProps {
  token: string;
  amount: bigint;
}

export class TxClaimGearRewards extends EVMTx {
  readonly token: string;
  readonly amount: bigint;

  constructor(opts: TxClaimGearRewardsProps) {
    super(opts);

    this.amount = opts.amount;
    this.token = opts.token;
  }

  toString(): string {
    const [symbol, decimals] = extractTokenData(this.token);

    return `GEAR Rewards claimed: ${formatBN(
      this.amount,
      decimals || 18,
    )} ${symbol} `;
  }

  serialize(): TxSerialized {
    return {
      type: "TxClaimGearRewards",
      content: JSON.stringify(this),
    };
  }
}

interface RepayAccountProps extends EVMTxProps {
  creditManager: string;
  creditManagerName?: string;
}

export class TxRepayAccount extends EVMTx implements CMEvent {
  readonly creditManager: string;
  readonly creditManagerName?: string;

  constructor(opts: RepayAccountProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.creditManagerName = opts.creditManagerName;
  }

  toString(): string {
    return `Credit Account ${
      this.creditManagerName || getContractName(this.creditManager)
    }: Repaying account`;
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
  creditManagerName?: string;
}

export class TxCloseAccount extends EVMTx implements CMEvent {
  readonly creditManager: string;
  readonly creditManagerName?: string;

  constructor(opts: CloseAccountProps) {
    super(opts);
    this.creditManager = opts.creditManager;
    this.creditManagerName = opts.creditManagerName;
  }

  toString(): string {
    return `Credit Account ${
      this.creditManagerName || getContractName(this.creditManager)
    }: Closing account`;
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
  readonly token: string;

  constructor(opts: ApproveProps) {
    super(opts);
    this.token = opts.token;
  }

  toString(): string {
    const [symbol] = extractTokenData(this.token);
    return `Approve ${symbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxApprove",
      content: JSON.stringify(this),
    };
  }
}

interface TxEnableTokensProps extends EVMTxProps {
  enabledTokens: Array<string>;
  disabledTokens: Array<string>;
  creditManager: string;
  creditManagerName?: string;
}

export class TxEnableTokens extends EVMTx implements CMEvent {
  readonly enabledTokens: Array<string>;
  readonly disabledTokens: Array<string>;
  readonly creditManager: string;
  readonly creditManagerName?: string;

  constructor(opts: TxEnableTokensProps) {
    super(opts);
    this.enabledTokens = opts.enabledTokens;
    this.disabledTokens = opts.disabledTokens;
    this.creditManager = opts.creditManager;
    this.creditManagerName = opts.creditManagerName;
  }

  toString(): string {
    const enabledSymbols = this.enabledTokens.map(address => {
      const [tokenSymbol] = extractTokenData(address);
      return tokenSymbol;
    });

    const disabledSymbols = this.disabledTokens.map(address => {
      const [tokenSymbol] = extractTokenData(address);
      return tokenSymbol;
    });

    const currentSentences = [
      enabledSymbols.length > 0 ? `enabled: ${enabledSymbols.join(", ")}` : "",
      disabledSymbols.length > 0
        ? `disabled: ${disabledSymbols.join(", ")}`
        : "",
    ].filter(s => !!s);

    return `Credit Account ${
      this.creditManagerName || getContractName(this.creditManager)
    }: ${currentSentences.join("; ")}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxEnableTokens",
      content: JSON.stringify(this),
    };
  }
}

interface TxUpdateQuotaProps extends EVMTxProps {
  updatedQuotas: Array<Asset>;
  underlyingToken: string;
  creditManager: string;
  creditManagerName?: string;
}

export class TxUpdateQuota extends EVMTx implements CMEvent {
  readonly updatedQuotas: Array<Asset>;
  readonly underlyingToken: string;
  readonly creditManager: string;
  readonly creditManagerName?: string;

  constructor(opts: TxUpdateQuotaProps) {
    super(opts);
    this.updatedQuotas = opts.updatedQuotas;
    this.creditManager = opts.creditManager;
    this.creditManagerName = opts.creditManagerName;
    this.underlyingToken = opts.underlyingToken;
  }

  toString(): string {
    const [, underlyingDecimals] = extractTokenData(this.underlyingToken);

    const quota = this.updatedQuotas.map(({ token, balance }) => {
      const [tokenSymbol] = extractTokenData(token);

      const sign = balance < 0 ? "-" : "";
      const amountString = formatBN(
        BigIntMath.abs(balance),
        underlyingDecimals || 18,
      );

      return `${tokenSymbol} by ${sign}${amountString}`;
    });

    return `Credit Account ${
      this.creditManagerName || getContractName(this.creditManager)
    } quota updated: ${quota.join("; ")}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxUpdateQuota",
      content: JSON.stringify(this),
    };
  }
}

interface TxGaugeStakeProps extends EVMTxProps {
  amount: bigint;
}

export class TxGaugeStake extends EVMTx {
  readonly amount: bigint;

  constructor(opts: TxGaugeStakeProps) {
    super(opts);
    this.amount = opts.amount;
  }

  toString(): string {
    const tokenDecimals = decimalList.GEAR;
    const amountString = formatBN(BigIntMath.abs(this.amount), tokenDecimals);

    return `Gauge: staked ${amountString} GEAR`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxGaugeStake",
      content: JSON.stringify(this),
    };
  }
}

interface TxGaugeUnstakeProps extends EVMTxProps {
  amount: bigint;
}

export class TxGaugeUnstake extends EVMTx {
  readonly amount: bigint;

  constructor(opts: TxGaugeUnstakeProps) {
    super(opts);
    this.amount = opts.amount;
  }

  toString(): string {
    const tokenDecimals = decimalList.GEAR;
    const amountString = formatBN(BigIntMath.abs(this.amount), tokenDecimals);

    return `Gauge: unstaked ${amountString} GEAR`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxGaugeUnstake",
      content: JSON.stringify(this),
    };
  }
}

export class TxGaugeClaim extends EVMTx {
  toString(): string {
    return `Gauge: withdrawals claimed`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxGaugeClaim",
      content: JSON.stringify(this),
    };
  }
}

interface TxGaugeVoteProps extends EVMTxProps {
  tokens: Array<{ token: string }>;
}

export class TxGaugeVote extends EVMTx {
  readonly tokens: Array<{ token: string }>;

  constructor(opts: TxGaugeVoteProps) {
    super(opts);
    this.tokens = opts.tokens;
  }

  toString(): string {
    const votes = this.tokens.map(({ token }) => {
      const [tokenSymbol] = extractTokenData(token);
      return tokenSymbol;
    });

    return `Gauge: voted for ${votes.join(", ")}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxGaugeVote",
      content: JSON.stringify(this),
    };
  }
}

interface WithdrawCollateralProps extends EVMTxProps {
  amount: bigint;
  token: string;
  to: string;
  creditManager: string;
  creditManagerName?: string;
}

export class TxWithdrawCollateral extends EVMTx implements CMEvent {
  readonly amount: bigint;
  readonly token: string;
  readonly to: string;
  readonly creditManager: string;
  readonly creditManagerName?: string;

  constructor(opts: WithdrawCollateralProps) {
    super(opts);
    this.amount = opts.amount;
    this.token = opts.token;
    this.to = opts.to;
    this.creditManager = opts.creditManager;
    this.creditManagerName = opts.creditManagerName;
  }

  toString(): string {
    const [symbol, decimals] = extractTokenData(this.token);

    return `Credit Account ${
      this.creditManagerName || getContractName(this.creditManager)
    }: withdrawn ${formatBN(this.amount, decimals || 18)} ${symbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxWithdrawCollateral",
      content: JSON.stringify(this),
    };
  }
}
