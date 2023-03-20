import { BigNumber, BigNumberish } from "ethers";
import moment from "moment";

import {
  CreditSessionFilteredPayload,
  CreditSessionPayload,
} from "../payload/creditSession";
import { swapKeyValue } from "../utils/mappers";
import { AssetWithView } from "./assets";
import { PERCENTAGE_DECIMALS } from "./constants";

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

export const CREDIT_SESSION_ID_BY_STATUS = swapKeyValue(
  CREDIT_SESSION_STATUS_BY_ID,
);

export interface CreditSessionBalance {
  balance: BigNumber;
  token: string;
}

export class CreditSession {
  readonly id: string;
  readonly status: CreditSessionStatus;
  readonly borrower: string;
  readonly creditManager: string;
  readonly account: string;

  readonly since: number;
  readonly sinceDate: string;
  readonly closedAt: number;
  readonly closedAtDate: string;

  readonly initialAmount: BigNumber;
  readonly borrowedAmount: BigNumber;
  readonly totalValue: BigNumber;
  readonly healthFactor: number;

  readonly profitInUSD: number;
  readonly profitInUnderlying: number;
  readonly collateralInUSD: number;
  readonly collateralInUnderlying: number;
  readonly roi: number;
  readonly apy: number;
  readonly currentBlock: number;
  readonly currentTimestamp: number;

  // sinceTimestamp: number;
  // closedAtTimestamp: number;

  readonly borrowAPY_RAY: BigNumberish;
  readonly borrowAPY7D: number;
  readonly totalValueUSD: number;
  readonly debt: BigNumberish;
  readonly debtUSD: number;
  readonly leverage: number;
  readonly tfIndex: number;

  readonly spotDebt: BigNumber;
  readonly spotTotalValue: BigNumber;
  readonly spotUserFunds: BigNumber;

  readonly cvxUnclaimedRewards: Record<string, CreditSessionBalance>;
  readonly balances: Record<string, CreditSessionBalance>;

  constructor(payload: CreditSessionPayload) {
    this.id = (payload.id || "").toLowerCase();
    this.status = CREDIT_SESSION_STATUS_BY_ID[payload.status || 0];
    this.borrower = (payload.borrower || "").toLowerCase();
    this.creditManager = (payload.creditManager || "").toLowerCase();
    this.account = (payload.account || "").toLowerCase();

    this.initialAmount = BigNumber.from(payload.initialAmount || 0);
    this.borrowedAmount = BigNumber.from(payload.borrowedAmount || 0);
    this.totalValue = BigNumber.from(payload.totalValue || 0);
    this.healthFactor = BigNumber.from(payload.healthFactor || 0).toNumber();

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

    this.borrowAPY_RAY = BigNumber.from(payload.borrowAPY_RAY || 0);
    this.borrowAPY7D = (payload.borrowAPY7D || 0) * PERCENTAGE_DECIMALS;
    this.totalValueUSD = payload.totalValueUSD || 0;
    this.debt = BigNumber.from(payload.debt || 0);
    this.debtUSD = payload.debtUSD || 0;
    this.leverage = payload.leverage || 0;
    this.tfIndex = (payload.tfIndex || 0) * PERCENTAGE_DECIMALS;

    this.roi = (payload.roi || 0) / PERCENTAGE_DECIMALS;
    this.apy = (payload.apy || 0) / PERCENTAGE_DECIMALS;

    this.currentBlock = payload.currentBlock || 0;
    this.currentTimestamp = payload.currentTimestamp || 0;

    this.spotDebt = BigNumber.from(payload.spotDebt || 0);
    this.spotTotalValue = BigNumber.from(payload.spotTotalValue || 0);
    this.spotUserFunds = BigNumber.from(payload.spotUserFunds || 0);

    this.cvxUnclaimedRewards = Object.entries(
      payload.cvxUnclaimedRewards || {},
    ).reduce<Record<string, CreditSessionBalance>>((acc, [token, balance]) => {
      const tokenLC = token.toLowerCase();

      return {
        ...acc,
        [tokenLC]: {
          balance: BigNumber.from(balance.bi),
          token: tokenLC,
        },
      };
    }, {});
    this.balances = Object.entries(payload.balances || {}).reduce<
      Record<string, CreditSessionBalance>
    >((acc, [token, balance]) => {
      const tokenLC = token.toLowerCase();

      return {
        ...acc,
        [tokenLC]: {
          balance: BigNumber.from(balance.BI),
          token: tokenLC,
        },
      };
    }, {});
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

  readonly debt: BigNumber;
  readonly debtUSD: number;
  readonly totalValue: BigNumber;
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

    this.healthFactor = BigNumber.from(payload.healthFactor || 0).toNumber();
    this.leverage = payload.leverage || 0;

    this.debt = BigNumber.from(payload.debt || 0);
    this.debtUSD = payload.debtUSD || 0;
    this.totalValue = BigNumber.from(payload.totalValue || 0);
    this.totalValueUSD = payload.totalValueUSD || 0;

    this.profitInUSD = payload.pnlUSD || 0;
    this.profitInUnderlying = payload.pnl || 0;

    this.tfIndex = (payload.tfIndex || 0) * PERCENTAGE_DECIMALS;

    this.balances = Object.entries(payload.balances || {}).map(
      ([token, balance]) => ({
        token: token.toLowerCase(),
        balance: BigNumber.from(balance.BI),
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
