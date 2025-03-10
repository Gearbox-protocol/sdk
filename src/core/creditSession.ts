import {
  PERCENTAGE_DECIMALS,
  toBigInt,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import type { Address } from "viem";

import type {
  CreditSessionFilteredPayload,
  CreditSessionPayload,
  CreditSessionsAggregatedStatsPayload,
  SecondaryStatus,
  UserCreditSessionsAggregatedStatsPayload,
} from "../payload/creditSession";
import type { AssetWithView } from "./assets";

export interface CreditSessionAsset extends AssetWithView {
  ind: number;
  isForbidden: boolean;
  isEnabled: boolean;

  quota: bigint;
  quotaIndexLU: bigint;
  isQuoted: boolean;
}

export interface CreditSessionReward extends AssetWithView {
  pool: Address;
}

export type CreditSessionStatus =
  | "active"
  | "closed"
  | "repaid"
  | "liquidated"
  | "liquidateExpired"
  | "liquidatePaused";

export const CREDIT_SESSION_STATUS_BY_ID: Record<number, CreditSessionStatus> =
  {
    0: "active",
    1: "closed",
    2: "repaid",
    3: "liquidated",
    4: "liquidateExpired",
    5: "liquidatePaused",
  };

export const CREDIT_SESSION_ID_BY_STATUS = TypedObjectUtils.swapKeyValue(
  CREDIT_SESSION_STATUS_BY_ID,
);

export class CreditSession {
  readonly id: string;
  readonly status: CreditSessionStatus;
  readonly borrower: Address;
  readonly creditManager: Address;
  readonly account: Address;
  readonly underlyingToken: Address;
  readonly version: number;

  readonly since: number;
  readonly closedAt: number;

  readonly initialAmount: bigint;
  readonly borrowedAmount: bigint;
  readonly totalValue: bigint;
  readonly healthFactor: number;

  readonly profitInUSD: number;
  readonly profitInUnderlying: number;
  readonly collateralInUSD: number;
  readonly collateralInUnderlying: number;
  readonly roi: number;
  readonly apy: number;
  readonly currentBlock: number;
  readonly currentTimestamp: number;

  readonly baseBorrowAPY7DAverage: number;
  readonly baseBorrowAPY_RAY: bigint;
  readonly baseToken: Address;
  readonly pool: Address;

  readonly entryPrice: number;
  readonly closePrice: number;
  readonly quoteToken: Address;
  readonly tradingToken: Address;

  readonly sinceTimestamp: number;
  readonly closedAtTimestamp: number;

  readonly borrowAPY_RAY: bigint;
  readonly borrowAPY7DAverage: number;
  readonly totalValueUSD: number;
  readonly debt: bigint;
  readonly debtUSD: number;
  readonly leverage: number;
  readonly tfIndex: number;

  readonly spotDebt: bigint;
  readonly spotTotalValue: bigint;
  readonly spotUserFunds: bigint;

  readonly cvxUnclaimedRewards: Array<CreditSessionReward>;
  readonly balances: Array<CreditSessionAsset> = [];
  readonly forbiddenTokens: Record<string, true> = {};
  readonly disabledTokens: Record<string, true> = {};
  readonly teritaryStatus: SecondaryStatus;

  constructor(payload: CreditSessionPayload) {
    this.id = (payload.id || "").toLowerCase();
    this.teritaryStatus = payload.teritaryStatus || { secStatus: [] };
    this.status = CREDIT_SESSION_STATUS_BY_ID[payload.status || 0];
    this.borrower = (payload.borrower || "").toLowerCase() as Address;
    this.creditManager = (payload.creditManager || "").toLowerCase() as Address;
    this.account = (payload.account || "").toLowerCase() as Address;
    this.underlyingToken = (
      payload.underlyingToken || ""
    ).toLowerCase() as Address;
    this.version = payload.version || 2;

    this.initialAmount = toBigInt(payload.initialAmount || 0);
    this.borrowedAmount = toBigInt(payload.borrowedAmount || 0);
    this.totalValue = toBigInt(payload.totalValue || 0);
    this.healthFactor = Number(toBigInt(payload.healthFactor || 0));

    this.since = payload.since || 0;
    this.closedAt = payload.closedAt || 0;
    this.sinceTimestamp = payload.sinceTimestamp || 0;
    this.closedAtTimestamp = payload.closedAtTimestamp || 0;

    this.profitInUSD = payload.profitInUSD || 0;
    this.profitInUnderlying = payload.profitInUnderlying || 0;
    this.collateralInUSD = payload.collateralInUSD || 0;
    this.collateralInUnderlying = payload.collateralInUnderlying || 0;

    this.baseBorrowAPY7DAverage = payload.baseBorrowAPY7DAverage || 0;
    this.baseBorrowAPY_RAY = toBigInt(payload.baseBorrowAPY_RAY || 0);
    this.baseToken = (payload.tradingToken || "").toLowerCase() as Address;
    this.pool = (payload.tradingToken || "").toLowerCase() as Address;

    this.entryPrice = payload.entryPrice || 0;
    this.closePrice = payload.closePrice || 0;
    this.tradingToken = (payload.tradingToken || "").toLowerCase() as Address;
    this.quoteToken = (payload.quoteToken || "").toLowerCase() as Address;

    this.borrowAPY_RAY = toBigInt(payload.borrowAPY_RAY || 0);
    this.borrowAPY7DAverage =
      (payload.borrowAPY7DAverage || 0) * Number(PERCENTAGE_DECIMALS);
    this.totalValueUSD = payload.totalValueUSD || 0;
    this.debt = toBigInt(payload.debt || 0);
    this.debtUSD = payload.debtUSD || 0;
    this.leverage = payload.leverage || 0;
    this.tfIndex = (payload.tfIndex || 0) * Number(PERCENTAGE_DECIMALS);

    this.roi = (payload.roi || 0) / Number(PERCENTAGE_DECIMALS);
    this.apy = (payload.apy || 0) / Number(PERCENTAGE_DECIMALS);

    this.currentBlock = payload.currentBlock || 0;
    this.currentTimestamp = payload.currentTimestamp || 0;

    this.spotDebt = toBigInt(payload.spotDebt || 0);
    this.spotTotalValue = toBigInt(payload.spotTotalValue || 0);
    this.spotUserFunds = toBigInt(payload.spotUserFunds || 0);

    this.cvxUnclaimedRewards = Object.entries(
      payload.cvxUnclaimedRewards || {},
    ).map(([t, b]): CreditSessionReward => {
      return {
        token: t.toLowerCase() as Address,
        balance: toBigInt(b.bi || 0),
        balanceView: b.f.toString(),
        pool: b.pool.toLowerCase() as Address,
      };
    });

    Object.entries(payload.balances || {}).forEach(([t, b]) => {
      const token = t.toLowerCase();

      if (!b.isEnabled) {
        this.disabledTokens[token] = true;
      }
      if (b.isForbidden) {
        this.forbiddenTokens[token] = true;
      }

      this.balances.push({
        token: token.toLowerCase() as Address,
        balance: toBigInt(b.BI || 0),
        balanceView: b.F.toString(),

        ind: b.ind,

        isEnabled: b.isEnabled,
        isForbidden: b.isForbidden,

        quota: toBigInt(b.quota || 0),
        quotaIndexLU: toBigInt(b.quotaIndexLU || 0),
        isQuoted: b.isQuoted || false,
      });
    });
  }
}

export class CreditSessionFiltered {
  readonly id: string;
  readonly borrower: Address;
  readonly account: Address;
  readonly creditManager: Address;
  readonly underlyingToken: Address;

  readonly status: CreditSessionStatus;
  readonly since: number;
  readonly closedAt: number;

  readonly sinceTimestamp: number;
  readonly closedAtTimestamp: number;

  readonly healthFactor: number;
  readonly leverage: number;

  readonly debt: bigint;
  readonly debtUSD: number;
  readonly totalValue: bigint;
  readonly totalValueUSD: number;

  readonly profitInUSD: number;
  readonly profitInUnderlying: number;

  readonly tfIndex: number;

  readonly balances: Array<AssetWithView>;
  readonly teritaryStatus: SecondaryStatus;

  constructor(payload: CreditSessionFilteredPayload) {
    this.id = (payload.id || "").toLowerCase();
    this.borrower = (payload.borrower || "").toLowerCase() as Address;
    this.account = (payload.account || "").toLowerCase() as Address;
    this.creditManager = (payload.creditManager || "").toLowerCase() as Address;
    this.underlyingToken = (
      payload.underlyingToken || ""
    ).toLowerCase() as Address;

    this.teritaryStatus = payload.teritaryStatus || { secStatus: [] };
    this.status = CREDIT_SESSION_STATUS_BY_ID[payload.status || 0];
    this.since = payload.since || 0;
    this.closedAt = payload.closedAt || 0;
    this.sinceTimestamp = payload.sinceTimestamp || 0;
    this.closedAtTimestamp = payload.closedAtTimestamp || 0;

    this.healthFactor = Number(toBigInt(payload.healthFactor || 0));
    this.leverage = payload.leverage || 0;

    this.debt = toBigInt(payload.debt || 0);
    this.debtUSD = payload.debtUSD || 0;
    this.totalValue = toBigInt(payload.totalValue || 0);
    this.totalValueUSD = payload.totalValueUSD || 0;

    this.profitInUSD = payload.pnlUSD || 0;
    this.profitInUnderlying = payload.pnl || 0;

    this.tfIndex = (payload.tfIndex || 0) * Number(PERCENTAGE_DECIMALS);

    this.balances = Object.entries(payload.balances || {}).map(
      ([token, balance]) => ({
        token: token.toLowerCase() as Address,
        balance: toBigInt(balance.BI || 0),
        balanceView: balance.F.toString(),
      }),
    );
  }
}

export type CreditSessionSortFields =
  | "type"
  | "tvl"
  | "hf"
  | "debt"
  | "pnl"
  | "leverage"
  | "tfIndex";
export type CreditSessionSortType = "asc" | "desc";

export interface UserCreditSessions
  extends Omit<
    UserCreditSessionsAggregatedStatsPayload,
    "accounts" | "totalValue10kBasis"
  > {
  totalValueChange: number;
  accounts: Array<CreditSession>;
}

type AggregatedOmit =
  | "healthFactor10kBasis"
  | "leverage10kBasis"
  | "activeAccounts10kBasis"
  | "openedAccounts10kBasis"
  | "healthFactor"
  | "healthFactorOld";

export type CreditSessionsAggregatedStats = Omit<
  CreditSessionsAggregatedStatsPayload,
  AggregatedOmit
> & {
  healthFactorChange: number;
  leverageChange: number;
  activeAccountsChange: number;
  openedAccountsChange: number;
  healthFactor: bigint;
  healthFactorOld: bigint;
};

export class UserCreditSessionsBuilder {
  static buildUserCreditSessions(
    payload: UserCreditSessionsAggregatedStatsPayload,
  ): UserCreditSessions {
    const { accounts, totalValue10kBasis = 0, ...sessionsUnfiltered } = payload;

    return {
      ...sessionsUnfiltered,
      totalValueChange: totalValue10kBasis * Number(PERCENTAGE_DECIMALS),
      accounts: accounts.map(p => new CreditSession(p)),
    };
  }

  static buildCreditSessionsAggregatedStats(
    payload: CreditSessionsAggregatedStatsPayload,
  ): CreditSessionsAggregatedStats {
    const {
      healthFactor10kBasis = 0,
      leverage10kBasis = 0,
      activeAccounts10kBasis = 0,
      openedAccounts10kBasis = 0,
      healthFactor = 0,
      healthFactorOld = 0,
      leverage,
      leverageOld,
      ...rest
    } = payload;

    return {
      ...rest,
      leverage: leverage,
      leverageOld: leverageOld,
      healthFactorChange: healthFactor10kBasis * Number(PERCENTAGE_DECIMALS),
      leverageChange: leverage10kBasis * Number(PERCENTAGE_DECIMALS),
      activeAccountsChange:
        activeAccounts10kBasis * Number(PERCENTAGE_DECIMALS),
      openedAccountsChange:
        openedAccounts10kBasis * Number(PERCENTAGE_DECIMALS),
      healthFactor: toBigInt(healthFactor || 0),
      healthFactorOld: toBigInt(healthFactorOld || 0),
    };
  }
}
