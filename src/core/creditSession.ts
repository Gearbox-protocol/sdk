import { BigNumber } from "ethers";
import moment from "moment";
import { CreditOperation } from "./creditOperation";
import { CreditSessionPayload } from "../payload/creditSession";
import { PERCENTAGE_FACTOR } from "./constants";

export type CreditSessionStatus = "active" | "closed" | "repaid" | "liquidated";

const statusEnum: Array<CreditSessionStatus> = [
  "active",
  "closed",
  "repaid",
  "liquidated",
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
    this.healthFactor =
      BigNumber.from(payload.healthFactor || 0).toNumber() / PERCENTAGE_FACTOR;
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
