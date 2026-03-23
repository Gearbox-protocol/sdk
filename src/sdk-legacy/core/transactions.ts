import type { Address } from "viem";
import type { Asset } from "../../router/index.js";
import { formatBN, json_parse, json_stringify } from "../../utils/index.js";
import type { TokenData } from "../tokens/tokenData.js";
import { BigIntMath } from "../utils/math.js";
import type { CreditManagerData_Legacy } from "./creditManager.js";
import type { EVMTxProps } from "./eventOrTx.js";
import { EVMTx } from "./eventOrTx.js";

const GEAR_DECIMALS = 18;

export interface TxSerialized {
  type:
    | "TxAddLiquidity"
    | "TxRemoveLiquidity"
    | "TxSwap"
    | "TxAddCollateral"
    | "TxIncreaseBorrowAmount"
    | "TxDecreaseBorrowAmount"
    | "TxRepayAccount"
    | "TxCloseAccount"
    | "TxApprove"
    | "TxOpenMultitokenAccount"
    | "TxClaimNFT"
    | "TxClaimRewards"
    | "TxUpdateQuota"
    | "TxGaugeStake"
    | "TxGaugeUnstake"
    | "TxGaugeClaim"
    | "TxGaugeVote"
    | "TxWithdrawCollateral"
    | "TxAddBot"
    | "TxRemoveBot"
    | "TxLiquidateAccount"
    | "TxStakeDiesel"
    | "TxUnstakeDiesel"
    | "TxEnableTokens"
    | "TxFillOrder"
    | "TxStartDelayedWithdrawal"
    | "TxMigrateCreditAccount";
  content: string;
}

export class TxSerializer {
  static serialize(items: Array<EVMTx>): string {
    return json_stringify(items.map(i => i.serialize()));
  }

  static deserialize(data: string): Array<EVMTx> {
    return (json_parse(data) as Array<TxSerialized>).map(e => {
      const params = json_parse(e.content);
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
        case "TxRepayAccount":
          return new TxRepayAccount(params);
        case "TxCloseAccount":
          return new TxCloseAccount(params);
        case "TxApprove":
          return new TxApprove(params);
        case "TxOpenMultitokenAccount":
          return new TxOpenMultitokenAccount(params);
        case "TxClaimNFT":
          return new TxClaimNFT(params);
        case "TxClaimRewards":
          return new TxClaimRewards(params);
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
        case "TxAddBot":
          return new TxAddBot(params);
        case "TxRemoveBot":
          return new TxRemoveBot(params);
        case "TxLiquidateAccount":
          return new TxLiquidateAccount(params);
        case "TxStakeDiesel":
          return new TxStakeDiesel(params);
        case "TxUnstakeDiesel":
          return new TxUnstakeDiesel(params);
        case "TxEnableTokens":
          return new TxEnableTokens(params);
        case "TxFillOrder":
          return new TxFillOrder(params);
        case "TxStartDelayedWithdrawal":
          return new TxStartDelayedWithdrawal(params);
        case "TxMigrateCreditAccount":
          return new TxMigrateCreditAccount(params);
        default:
          throw new Error(`Unknown transaction for parsing: ${e.type}`);
      }
    });
  }
}

interface AddLiquidityProps extends EVMTxProps {
  amount: bigint;
  token: Address;
  poolName: string;
  address: Address;

  tokensList: Record<Address, TokenData>;
}

export class TxAddLiquidity extends EVMTx {
  readonly amount: bigint;
  readonly token: TokenData;
  readonly poolName: string;
  readonly address: Address;

  constructor(opts: AddLiquidityProps) {
    super(opts);
    this.amount = opts.amount;
    this.token = opts.tokensList[opts.token];
    this.poolName = opts.poolName;
    this.address = opts.address;
  }

  _toString() {
    const { title, decimals = 18 } = this.token;

    return `${this.poolName}: Deposit ${formatBN(
      this.amount,
      decimals,
    )} ${title}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxAddLiquidity",
      content: json_stringify(this),
    };
  }
}

interface RemoveLiquidityProps extends EVMTxProps {
  amount: bigint;
  token: Address;
  poolName: string;
  address: Address;

  tokensList: Record<Address, TokenData>;
}

export class TxRemoveLiquidity extends EVMTx {
  readonly amount: bigint;
  readonly token: TokenData;
  readonly poolName: string;
  readonly address: Address;

  constructor(opts: RemoveLiquidityProps) {
    super(opts);
    this.amount = opts.amount;
    this.token = opts.tokensList[opts.token];
    this.poolName = opts.poolName;
    this.address = opts.address;
  }

  _toString() {
    const { title, decimals = 18 } = this.token;

    return `${this.poolName}: Withdraw ${formatBN(
      this.amount,
      decimals,
    )} ${title}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxRemoveLiquidity",
      content: json_stringify(this),
    };
  }
}

interface TxStakeDieselProps extends EVMTxProps {
  amount: bigint;
  tokenFrom: Address;
  tokenTo: Address;
  poolName: string;

  tokensList: Record<Address, TokenData>;
}

export class TxStakeDiesel extends EVMTx {
  readonly amount: bigint;
  readonly tokenFrom: TokenData;
  readonly tokenTo: TokenData;
  readonly poolName: string;

  constructor(opts: TxStakeDieselProps) {
    super(opts);
    this.amount = opts.amount;
    this.tokenFrom = opts.tokensList[opts.tokenFrom];
    this.tokenTo = opts.tokensList[opts.tokenTo];
    this.poolName = opts.poolName;
  }

  _toString() {
    const { title: fromSymbol, decimals: fromDecimals = 18 } = this.tokenFrom;
    const { title: toSymbol } = this.tokenTo;

    return `${this.poolName}: Stake ${formatBN(
      this.amount,
      fromDecimals,
    )} ${fromSymbol} => ${toSymbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxStakeDiesel",
      content: json_stringify(this),
    };
  }
}

export class TxUnstakeDiesel extends EVMTx {
  readonly amount: bigint;
  readonly tokenFrom: TokenData;
  readonly tokenTo: TokenData;
  readonly poolName: string;

  constructor(opts: TxStakeDieselProps) {
    super(opts);
    this.amount = opts.amount;
    this.tokenFrom = opts.tokensList[opts.tokenFrom];
    this.tokenTo = opts.tokensList[opts.tokenTo];
    this.poolName = opts.poolName;
  }

  _toString() {
    const { title: fromSymbol, decimals: fromDecimals = 18 } = this.tokenFrom;
    const { title: toSymbol } = this.tokenTo;

    return `${this.poolName}: Unstake ${formatBN(
      this.amount,
      fromDecimals,
    )} ${fromSymbol} => ${toSymbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxUnstakeDiesel",
      content: json_stringify(this),
    };
  }
}

interface SwapProps extends EVMTxProps {
  operation: string;

  amountFrom: bigint;
  tokenFrom: Address;

  amountTo?: bigint;
  tokenTo?: Address;
  to?: Array<Asset>;

  creditManagerName: string;

  tokensList: Record<Address, TokenData>;
}

export class TXSwap extends EVMTx {
  readonly operation: string;

  readonly amountFrom: bigint;
  readonly tokenFrom: TokenData;

  readonly to?: Array<{ balance: bigint; token: TokenData }>;

  readonly creditManagerName: string;

  constructor(opts: SwapProps) {
    super(opts);
    this.operation = opts.operation;

    this.amountFrom = opts.amountFrom;
    this.tokenFrom = opts.tokensList[opts.tokenFrom];

    const list = opts.to
      ? opts.to
      : opts.amountTo && opts.tokenTo
        ? [{ balance: opts.amountTo, token: opts.tokenTo }]
        : undefined;

    this.to = list?.map(({ token, balance }) => ({
      token: opts.tokensList[token],
      balance,
    }));

    this.creditManagerName = opts.creditManagerName;
  }

  _toString() {
    let toPart = "";
    if (this.to) {
      const str = this.to
        .map(({ token, balance }) => {
          const { title: tokenSymbol, decimals: tokenDecimals = 18 } = token;
          return `${formatBN(balance, tokenDecimals)} ${tokenSymbol}`;
        })
        .join(", ");

      toPart = ` ⇒  ${str}`;
    }

    const { title: fromSymbol, decimals: fromDecimals = 18 } = this.tokenFrom;

    return `Credit Account ${this.creditManagerName}: ${
      this.operation
    } ${formatBN(this.amountFrom, fromDecimals)} ${fromSymbol} ${toPart}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxSwap",
      content: json_stringify(this),
    };
  }
}

interface AddCollateralProps extends EVMTxProps {
  amount: bigint;
  token: Address;
  creditManagerName: string;

  tokensList: Record<Address, TokenData>;
}

export class TxAddCollateral extends EVMTx {
  readonly amount: bigint;
  readonly token: TokenData;
  readonly creditManagerName: string;

  constructor(opts: AddCollateralProps) {
    super(opts);
    this.amount = opts.amount;
    this.token = opts.tokensList[opts.token];
    this.creditManagerName = opts.creditManagerName;
  }

  _toString() {
    const { title: addedSymbol, decimals: addedDecimals = 18 } = this.token;

    return `Credit Account ${this.creditManagerName}: Added ${formatBN(
      this.amount,
      addedDecimals,
    )} ${addedSymbol} as collateral`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxAddCollateral",
      content: json_stringify(this),
    };
  }
}

interface IncreaseBorrowAmountProps extends EVMTxProps {
  amount: bigint;
  token: Address;
  creditManagerName: string;

  tokensList: Record<Address, TokenData>;
}

export class TxIncreaseBorrowAmount extends EVMTx {
  readonly amount: bigint;
  readonly token: TokenData;
  readonly creditManagerName: string;

  constructor(opts: IncreaseBorrowAmountProps) {
    super(opts);
    this.amount = opts.amount;
    this.token = opts.tokensList[opts.token];
    this.creditManagerName = opts.creditManagerName;
  }

  _toString() {
    const { title: tokenSymbol, decimals: tokenDecimals } = this.token;

    return `Credit Account ${
      this.creditManagerName
    }: Borrowed amount was increased for ${formatBN(
      this.amount,
      tokenDecimals || 18,
    )} ${tokenSymbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxIncreaseBorrowAmount",
      content: json_stringify(this),
    };
  }
}

interface DecreaseBorrowAmountProps extends EVMTxProps {
  amount: bigint;
  token: Address;
  creditManagerName: string;

  tokensList: Record<Address, TokenData>;
}

export class TxDecreaseBorrowAmount extends EVMTx {
  readonly amount: bigint;
  readonly token: TokenData;
  readonly creditManagerName: string;

  constructor(opts: DecreaseBorrowAmountProps) {
    super(opts);
    this.amount = opts.amount;
    this.token = opts.tokensList[opts.token];
    this.creditManagerName = opts.creditManagerName;
  }

  _toString() {
    const { title: tokenSymbol, decimals: tokenDecimals } = this.token;

    return `Credit Account ${
      this.creditManagerName
    }: Borrowed amount was decreased for ${formatBN(
      this.amount,
      tokenDecimals || 18,
    )} ${tokenSymbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxIncreaseBorrowAmount",
      content: json_stringify(this),
    };
  }
}

interface TxOpenMultitokenAccountProps extends EVMTxProps {
  borrowedAmount: bigint;
  creditManagerName: string;
  underlyingToken: Address;
  assets: Array<Address>;
  withdrawDebt: boolean;

  targetToken: Address | undefined;
  creditManager: Address;

  tokensList: Record<Address, TokenData>;
}

export class TxOpenMultitokenAccount extends EVMTx {
  readonly borrowedAmount: bigint;
  readonly creditManagerName: string;
  readonly underlyingToken: TokenData;
  readonly assets: Array<TokenData>;
  readonly withdrawDebt: boolean;

  readonly targetToken: Address | undefined;
  readonly creditManager: Address;

  constructor(opts: TxOpenMultitokenAccountProps) {
    super(opts);
    this.borrowedAmount = opts.borrowedAmount;
    this.underlyingToken = opts.tokensList[opts.underlyingToken];
    this.creditManagerName = opts.creditManagerName;
    this.assets = opts.assets.map(a => opts.tokensList[a]);
    this.withdrawDebt = opts.withdrawDebt;
    this.targetToken = opts.targetToken;
    this.creditManager = opts.creditManager;
  }

  _toString() {
    const assetSymbols = this.assets.reduce<Array<string>>((acc, asset) => {
      const { title: tokenSymbol } = asset;
      const skip =
        this.withdrawDebt && this.underlyingToken.address === asset.address;

      if (!skip && tokenSymbol) acc.push(tokenSymbol);
      return acc;
    }, []);

    const name = this.creditManagerName;

    const { title: underlyingSymbol, decimals: underlyingDecimals } =
      this.underlyingToken;
    const borrowedAmount = `${formatBN(
      this.borrowedAmount,
      underlyingDecimals || 18,
    )} ${underlyingSymbol}`;

    const assets = assetSymbols.join(", ");

    const withdraw = this.withdrawDebt ? [`Withdrawn: ${borrowedAmount}`] : [];

    return [
      `Credit Account ${name}: opening. Borrowed amount: ${borrowedAmount}; assets: ${assets}`,
      ...withdraw,
    ].join("; ");
  }

  serialize(): TxSerialized {
    return {
      type: "TxOpenMultitokenAccount",
      content: json_stringify(this),
    };
  }
}

export class TxClaimNFT extends EVMTx {
  _toString() {
    return `NFT claimed`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxClaimNFT",
      content: json_stringify(this),
    };
  }
}

interface TxClaimRewardsProps extends EVMTxProps {
  rewards: Array<Asset>;

  tokensList: Record<Address, TokenData>;
}

export class TxClaimRewards extends EVMTx {
  readonly rewards: Array<Omit<Asset, "token"> & { token: TokenData }>;

  constructor(opts: TxClaimRewardsProps) {
    super(opts);

    this.rewards = opts.rewards.map(({ token, balance }) => ({
      token: opts.tokensList[token],
      balance,
    }));
  }

  _toString() {
    const rewardsString =
      this.rewards.length <= 2
        ? this.rewards
            .map(({ token, balance }) => {
              const { title, decimals = 18 } = token;
              return `${formatBN(balance, decimals)} ${title}`;
            })
            .join(", ")
        : this.rewards
            .map(({ token }) => {
              const { title } = token;
              return title;
            })
            .join(", ");

    return `Claimed: ${rewardsString}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxClaimRewards",
      content: json_stringify(this),
    };
  }
}

interface TxStartDelayedWithdrawalProps extends EVMTxProps {
  instantWithdrawals: Array<Asset>;
  delayedWithdrawals: Array<Asset>;

  tokensList: Record<Address, TokenData>;
}

export class TxStartDelayedWithdrawal extends EVMTx {
  readonly instantWithdrawals: Array<
    Omit<Asset, "token"> & { token: TokenData }
  >;
  readonly delayedWithdrawals: Array<
    Omit<Asset, "token"> & { token: TokenData }
  >;

  constructor(opts: TxStartDelayedWithdrawalProps) {
    super(opts);

    this.instantWithdrawals = opts.instantWithdrawals.map(
      ({ token, balance }) => ({
        token: opts.tokensList[token],
        balance,
      }),
    );
    this.delayedWithdrawals = opts.delayedWithdrawals.map(
      ({ token, balance }) => ({
        token: opts.tokensList[token],
        balance,
      }),
    );
  }

  _toString() {
    const total =
      this.instantWithdrawals.length + this.delayedWithdrawals.length;

    const instantString =
      total <= 2
        ? this.instantWithdrawals
            .map(({ token, balance }) => {
              const { title, decimals = 18 } = token;
              return `${formatBN(balance, decimals)} ${title}`;
            })
            .join(", ")
        : this.instantWithdrawals
            .map(({ token }) => {
              const { title } = token;
              return title;
            })
            .join(", ");

    const delayedString =
      total <= 2
        ? this.delayedWithdrawals
            .map(({ token, balance }) => {
              const { title, decimals = 18 } = token;
              return `${formatBN(balance, decimals)} ${title}`;
            })
            .join(", ")
        : this.delayedWithdrawals
            .map(({ token }) => {
              const { title } = token;
              return title;
            })
            .join(", ");

    const instant =
      this.instantWithdrawals.length > 0
        ? `Tokens obtained: ${instantString}`
        : undefined;

    const delayed =
      this.delayedWithdrawals.length > 0
        ? `Tokens withdrawal started: ${delayedString}`
        : undefined;

    return [instant, delayed].filter(s => s).join("; ");
  }

  serialize(): TxSerialized {
    return {
      type: "TxStartDelayedWithdrawal",
      content: json_stringify(this),
    };
  }
}

interface TxMigrateCreditAccountProps extends EVMTxProps {
  targetCreditManager: CreditManagerData_Legacy;
  curatorName: string;

  tokensList: Record<Address, TokenData>;
}

export class TxMigrateCreditAccount extends EVMTx {
  readonly targetCreditManager: string;

  constructor(opts: TxMigrateCreditAccountProps) {
    super(opts);

    this.targetCreditManager = `${opts.targetCreditManager.name} (${opts.curatorName})`;
  }

  _toString() {
    return `Successfully migrated Credit Account to ${this.targetCreditManager}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxMigrateCreditAccount",
      content: json_stringify(this),
    };
  }
}

interface RepayAccountProps extends EVMTxProps {
  creditManagerName: string;
}

export class TxRepayAccount extends EVMTx {
  readonly creditManagerName: string;

  constructor(opts: RepayAccountProps) {
    super(opts);
    this.creditManagerName = opts.creditManagerName;
  }

  _toString() {
    return `Credit Account ${this.creditManagerName}: Repaying account`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxRepayAccount",
      content: json_stringify(this),
    };
  }
}

interface LiquidateAccountProps extends EVMTxProps {
  creditManagerName: string;
}

export class TxLiquidateAccount extends EVMTx {
  readonly creditManagerName: string;

  constructor(opts: LiquidateAccountProps) {
    super(opts);
    this.creditManagerName = opts.creditManagerName;
  }

  _toString() {
    return `Credit Account ${this.creditManagerName}: Liquidated`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxLiquidateAccount",
      content: json_stringify(this),
    };
  }
}

interface CloseAccountProps extends EVMTxProps {
  creditManagerName: string;
}

export class TxCloseAccount extends EVMTx {
  readonly creditManagerName: string;

  constructor(opts: CloseAccountProps) {
    super(opts);
    this.creditManagerName = opts.creditManagerName;
  }

  _toString() {
    return `Credit Account ${this.creditManagerName}: Closing account`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxCloseAccount",
      content: json_stringify(this),
    };
  }
}

interface ApproveProps extends EVMTxProps {
  token: Address;

  tokensList: Record<Address, TokenData>;
}

export class TxApprove extends EVMTx {
  readonly token: TokenData;

  constructor(opts: ApproveProps) {
    super(opts);
    this.token = opts.tokensList[opts.token];
  }

  _toString() {
    const { title: symbol } = this.token;
    return `Approved ${symbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxApprove",
      content: json_stringify(this),
    };
  }
}

interface TxUpdateQuotaProps extends EVMTxProps {
  updatedQuotas: Array<Asset>;
  underlyingToken: Address;
  creditManagerName: string;

  tokensList: Record<Address, TokenData>;
}

export class TxUpdateQuota extends EVMTx {
  readonly updatedQuotas: Array<Omit<Asset, "token"> & { token: TokenData }>;
  readonly underlyingToken: TokenData;
  readonly creditManagerName: string;

  constructor(opts: TxUpdateQuotaProps) {
    super(opts);
    this.updatedQuotas = opts.updatedQuotas.map(({ token, balance }) => ({
      token: opts.tokensList[token],
      balance,
    }));
    this.creditManagerName = opts.creditManagerName;
    this.underlyingToken = opts.tokensList[opts.underlyingToken];
  }

  _toString() {
    const { decimals: underlyingDecimals } = this.underlyingToken;

    const quota = this.updatedQuotas.map(({ token, balance }) => {
      const { title: tokenSymbol } = token;

      const sign = balance < 0 ? "-" : "";
      const amountString = formatBN(
        BigIntMath.abs(balance),
        underlyingDecimals || 18,
      );

      return `${tokenSymbol} by ${sign}${amountString}`;
    });

    return `Credit Account ${
      this.creditManagerName
    } quota updated: ${quota.join("; ")}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxUpdateQuota",
      content: json_stringify(this),
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

  _toString() {
    const amountString = formatBN(BigIntMath.abs(this.amount), GEAR_DECIMALS);

    return `Gauge: staked ${amountString} GEAR`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxGaugeStake",
      content: json_stringify(this),
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

  _toString() {
    const amountString = formatBN(BigIntMath.abs(this.amount), GEAR_DECIMALS);

    return `Gauge: unstaked ${amountString} GEAR`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxGaugeUnstake",
      content: json_stringify(this),
    };
  }
}

export class TxGaugeClaim extends EVMTx {
  _toString() {
    return `Gauge: withdrawals claimed`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxGaugeClaim",
      content: json_stringify(this),
    };
  }
}

interface TxGaugeVoteProps extends EVMTxProps {
  tokens: Array<{ token: Address }>;

  tokensList: Record<Address, TokenData>;
}

export class TxGaugeVote extends EVMTx {
  readonly tokens: Array<TokenData>;

  constructor(opts: TxGaugeVoteProps) {
    super(opts);
    this.tokens = opts.tokens.map(t => opts.tokensList[t.token]);
  }

  _toString() {
    const votes = this.tokens.map(({ title }) => {
      return title;
    });

    return `Gauge: voted for ${votes.join(", ")}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxGaugeVote",
      content: json_stringify(this),
    };
  }
}

interface WithdrawCollateralProps extends EVMTxProps {
  amount: bigint;
  token: Address;
  to: Address;
  creditManagerName: string;

  tokensList: Record<Address, TokenData>;
}

export class TxWithdrawCollateral extends EVMTx {
  readonly amount: bigint;
  readonly token: TokenData;
  readonly to: Address;
  readonly creditManagerName: string;

  constructor(opts: WithdrawCollateralProps) {
    super(opts);
    this.amount = opts.amount;
    this.token = opts.tokensList[opts.token];
    this.to = opts.to;
    this.creditManagerName = opts.creditManagerName;
  }

  _toString() {
    const { title: symbol, decimals } = this.token;

    return `Credit Account ${this.creditManagerName}: withdrawn ${formatBN(
      this.amount,
      decimals || 18,
    )} ${symbol}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxWithdrawCollateral",
      content: json_stringify(this),
    };
  }
}

interface TxAddBotProps extends EVMTxProps {
  creditManagerName: string;
}

export class TxAddBot extends EVMTx {
  readonly creditManagerName: string;

  constructor(opts: TxAddBotProps) {
    super(opts);
    this.creditManagerName = opts.creditManagerName;
  }

  _toString() {
    return `Credit Account ${this.creditManagerName}: bot enabled`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxAddBot",
      content: json_stringify(this),
    };
  }
}

export class TxRemoveBot extends EVMTx {
  readonly creditManagerName: string;

  constructor(opts: TxAddBotProps) {
    super(opts);
    this.creditManagerName = opts.creditManagerName;
  }

  _toString() {
    return `Credit Account ${this.creditManagerName}: bot disabled`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxAddBot",
      content: json_stringify(this),
    };
  }
}

interface EnableTokensProps extends EVMTxProps {
  enabledTokens: Array<Address>;
  disabledTokens: Array<Address>;
  creditManagerName: string;

  tokensList: Record<Address, TokenData>;
}

export class TxEnableTokens extends EVMTx {
  readonly enabledTokens: Array<TokenData>;
  readonly disabledTokens: Array<TokenData>;
  readonly creditManagerName: string;

  constructor(opts: EnableTokensProps) {
    super(opts);
    this.enabledTokens = opts.enabledTokens.map(a => opts.tokensList[a]);
    this.disabledTokens = opts.disabledTokens.map(a => opts.tokensList[a]);
    this.creditManagerName = opts.creditManagerName;
  }

  _toString() {
    const enabledSymbols = this.enabledTokens.map(t => t?.title);
    const disabledSymbols = this.disabledTokens.map(t => t?.title);

    const currentSentences = [
      enabledSymbols.length > 0 ? `enabled: ${enabledSymbols.join(", ")}` : "",
      disabledSymbols.length > 0
        ? `disabled: ${disabledSymbols.join(", ")}`
        : "",
    ].filter(s => !!s);

    return `Credit Account ${this.creditManagerName}: ${currentSentences.join(
      "; ",
    )}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxEnableTokens",
      content: json_stringify(this),
    };
  }
}

interface TxFillOrderProps extends EVMTxProps {
  amount: bigint;
  token: Address;
  network: string;

  tokensList: Record<Address, TokenData>;
}

export class TxFillOrder extends EVMTx {
  readonly amount: bigint;
  readonly token: TokenData;
  readonly network: string;

  constructor(opts: TxFillOrderProps) {
    super(opts);
    this.amount = opts.amount;
    this.token = opts.tokensList[opts.token];
    this.network = opts.network;
  }

  _toString() {
    const { title, decimals = 18 } = this.token;

    return `Order opened [${this.network}]: ${formatBN(
      this.amount,
      decimals,
    )} ${title}`;
  }

  serialize(): TxSerialized {
    return {
      type: "TxFillOrder",
      content: json_stringify(this),
    };
  }
}
