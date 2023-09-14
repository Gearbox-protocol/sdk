import {
  PERCENTAGE_DECIMALS,
  toBigInt,
  TypedObjectUtils,
} from "@gearbox-protocol/sdk-gov";
import moment from "moment";

import {
  CreditSessionFilteredPayload,
  CreditSessionPayload,
  CreditSessionsAggregatedStatsPayload,
  UserCreditSessionsAggregatedStatsPayload,
} from "../payload/creditSession";
import { AssetWithView } from "./assets";

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
  readonly borrower: string;
  readonly creditManager: string;
  readonly account: string;
  readonly underlyingToken: string;
  readonly version: number;

  readonly since: number;
  readonly sinceDate: string;
  readonly closedAt: number;
  readonly closedAtDate: string;

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

  readonly entryPrice: number;
  readonly closePrice: number;
  readonly quoteToken: string;
  readonly tradingToken: string;

  // sinceTimestamp: number;
  // closedAtTimestamp: number;

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

  readonly cvxUnclaimedRewards: Array<AssetWithView>;
  readonly balances: Array<AssetWithView> = [];
  readonly forbiddenTokens: Record<string, true> = {};
  readonly disabledTokens: Record<string, true> = {};

  constructor(payload: CreditSessionPayload) {
    this.id = (payload.id || "").toLowerCase();
    this.status = CREDIT_SESSION_STATUS_BY_ID[payload.status || 0];
    this.borrower = (payload.borrower || "").toLowerCase();
    this.creditManager = (payload.creditManager || "").toLowerCase();
    this.account = (payload.account || "").toLowerCase();
    this.underlyingToken = (payload.underlyingToken || "").toLowerCase();
    this.version = payload.version || 2;

    this.initialAmount = toBigInt(payload.initialAmount || 0);
    this.borrowedAmount = toBigInt(payload.borrowedAmount || 0);
    this.totalValue = toBigInt(payload.totalValue || 0);
    this.healthFactor = Number(toBigInt(payload.healthFactor || 0));

    this.since = payload.since || 0;
    this.closedAt = payload.closedAt || 0;
    this.sinceDate = moment((payload.sinceTimestamp || 0) * 1000).format(
      "Do MMM YYYY",
    );
    this.closedAtDate = moment((payload.closedAtTimestamp || 0) * 1000).format(
      "Do MMM YYYY",
    );

    this.profitInUSD = payload.profitInUSD || 0;
    this.profitInUnderlying = payload.profitInUnderlying || 0;
    this.collateralInUSD = payload.collateralInUSD || 0;
    this.collateralInUnderlying = payload.collateralInUnderlying || 0;

    this.entryPrice = payload.entryPrice || 0;
    this.closePrice = payload.closePrice || 0;
    this.tradingToken = (payload.tradingToken || "").toLowerCase();
    this.quoteToken = (payload.quoteToken || "").toLowerCase();

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
    ).map(([token, balance]): AssetWithView => {
      return {
        token: token.toLowerCase(),
        balance: toBigInt(balance.bi || 0),
        balanceView: balance.f.toString(),
      };
    });

    Object.entries(payload.balances || {}).forEach(([t, b]) => {
      const token = t.toLowerCase();

      if (!b.isEnabled) {
        this.disabledTokens[token] = true;
      }
      if (!b.isAllowed) {
        this.forbiddenTokens[token] = true;
      }

      this.balances.push({
        token: token.toLowerCase(),
        balance: toBigInt(b.BI || 0),
        balanceView: b.F.toString(),
      });
    });
  }
}

export class CreditSessionFiltered {
  readonly id: string;
  readonly borrower: string;
  readonly account: string;
  readonly creditManager: string;
  readonly underlyingToken: string;

  readonly status: CreditSessionStatus;
  readonly since: number;
  readonly sinceDate: string;
  readonly closedAt: number;
  readonly closedAtDate: string;

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

  constructor(payload: CreditSessionFilteredPayload) {
    this.id = (payload.id || "").toLowerCase();
    this.borrower = (payload.borrower || "").toLowerCase();
    this.account = (payload.account || "").toLowerCase();
    this.creditManager = (payload.creditManager || "").toLowerCase();
    this.underlyingToken = (payload.underlyingToken || "").toLowerCase();

    this.status = CREDIT_SESSION_STATUS_BY_ID[payload.status || 0];
    this.since = payload.since || 0;
    this.closedAt = payload.closedAt || 0;
    this.sinceDate = moment((payload.since || 0) * 1000).format("Do MMM YYYY");
    this.closedAtDate = moment((payload.closedAt || 0) * 1000).format(
      "Do MMM YYYY",
    );

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
        token: token.toLowerCase(),
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
