import { BigNumber } from "ethers";
import moment from "moment";

import {
  CreditSessionFilteredPayload,
  CreditSessionPayload,
} from "../payload/creditSession";
import { CreditOperation } from "./creditOperation";

export type CreditSessionStatus =
  | "active"
  | "closed"
  | "repaid"
  | "liquidated"
  | "liquidateExpired"
  | "liquidatePaused";

const statusEnum: Array<CreditSessionStatus> = [
  "active",
  "closed",
  "repaid",
  "liquidated",
  "liquidateExpired",
  "liquidatePaused",
];

export class CreditSession {
  public readonly id: string;
  public readonly status: CreditSessionStatus;
  public readonly name: string;
  public readonly background: string;
  public readonly borrower: string;
  public readonly creditManager: string;
  public readonly account: string;
  public readonly since: number;
  public readonly sinceDate: string;
  public readonly closedAt: number;
  public readonly closedAtDate: string;
  public readonly initialAmount: BigNumber;
  public readonly borrowedAmount: BigNumber;
  public readonly totalValue: BigNumber;
  public readonly healthFactor: number;
  public readonly profit: BigNumber;
  public readonly profitPercentage: number;
  public readonly score: number;
  public readonly operations: Array<CreditOperation>;

  constructor(payload: CreditSessionPayload) {
    this.id = payload.id;
    this.status = statusEnum[payload.status];
    this.name = payload.name;
    this.background = payload.background;
    this.borrower = payload.borrower;
    this.creditManager = payload.creditManager;
    this.account = payload.account;
    this.since = payload.since;
    this.closedAt = payload.closedAt;
    this.initialAmount = BigNumber.from(payload.initialAmount || 0);
    this.borrowedAmount = BigNumber.from(payload.borrowedAmount || 0);
    this.profit = BigNumber.from(payload.profit || 0);
    this.profitPercentage = payload.profitPercentage || 0;
    this.totalValue = BigNumber.from(payload.totalValue || 0);
    this.healthFactor = BigNumber.from(payload.healthFactor || 0).toNumber();
    this.score = payload.score;
    this.operations = (payload.operations || []).map(op => {
      const formattedOp = {
        ...op,
        date: moment(op.timestamp * 1000).format("Do MMM YYYY"),
      };
      return formattedOp;
    });
    this.sinceDate = moment(payload.sinceTimestamp * 1000).format(
      "Do MMM YYYY",
    );
    this.closedAtDate = moment(payload.closedAtTimestamp * 1000).format(
      "Do MMM YYYY",
    );
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

  readonly debt: number;
  readonly debtUSD: number;
  readonly totalValue: number;
  readonly totalValueUSD: number;

  readonly profitInUSD: number;
  readonly profitInUnderlying: number;

  readonly tfIndex: number;

  readonly balances: Record<string, BigNumber>;

  constructor(payload: CreditSessionFilteredPayload) {
    this.id = payload.id || "";
    this.borrower = payload.borrower || "";
    this.account = payload.account || "";
    this.creditManager = payload.creditManager || "";
    this.underlyingToken = payload.underlyingToken || "";

    this.status = statusEnum[payload.status || 0];
    this.since = payload.since || 0;
    this.closedAt = payload.closedAt || 0;
    this.sinceDate = moment((payload.since || 0) * 1000).format("Do MMM YYYY");
    this.closedAtDate = moment((payload.closedAt || 0) * 1000).format(
      "Do MMM YYYY",
    );

    this.healthFactor = BigNumber.from(payload.healthFactor || 0).toNumber();
    this.leverage = payload.leverage || 0;

    this.debt = payload.debt || 0;
    this.debtUSD = payload.debtUSD || 0;
    this.totalValue = payload.totalValue || 0;
    this.totalValueUSD = payload.totalValueUSD || 0;

    this.profitInUSD = payload.pnlUSD || 0;
    this.profitInUnderlying = payload.pnl || 0;

    this.tfIndex = payload.tfIndex || 0;

    this.balances = Object.entries(payload.balances).reduce<
      Record<string, BigNumber>
    >(
      (acc, [token, balance]) => ({
        ...acc,
        [token]: BigNumber.from(balance.BI),
      }),
      {},
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
