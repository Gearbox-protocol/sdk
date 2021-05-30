import {BigNumber, ethers} from "ethers";
import {CreditAccountDataExtendedPayload, CreditAccountDataPayload,} from "../payload/creditAccount";
import {PERCENTAGE_FACTOR, RAY} from "./constants";

export class CreditAccountData {
  public readonly id: string;

  public readonly addr: string;
  public readonly borrower: string;
  public readonly inUse: boolean;
  public readonly creditManager: string;
  public readonly kind: string;
  public readonly underlyingToken: string;
  public readonly borrowedAmountPlusInterest: BigNumber;
  public readonly totalValue: BigNumber;
  public readonly healthFactor: number;
  public readonly borrowRate: number;
  public readonly balances: Record<string, BigNumber> = {};

  constructor(payload: CreditAccountDataPayload) {
    this.id = payload.creditManager;
    this.addr = payload.addr;
    this.borrower = payload.borrower;
    this.inUse = payload.inUse;
    this.creditManager = payload.creditManager;
    this.kind = payload.kind.startsWith("0x") ? ethers.utils.parseBytes32String(payload.kind) : payload.kind;
    this.underlyingToken = payload.underlyingToken;
    this.borrowedAmountPlusInterest = BigNumber.from(
      payload.borrowedAmountPlusInterest
    );
    this.totalValue = BigNumber.from(payload.totalValue);
    this.healthFactor = BigNumber.from(payload.healthFactor).toNumber() / 10000;
    this.borrowRate =
      BigNumber.from(payload.borrowRate)
        .mul(PERCENTAGE_FACTOR)
        .mul(100)
        .div(RAY)
        .toNumber() / PERCENTAGE_FACTOR;

    (payload.balances || []).forEach(
      (b) => (this.balances[b.token] = BigNumber.from(b.balance))
    );
  }
}

export class CreditAccountDataExtended extends CreditAccountData {
  public readonly repayAmount: BigNumber;
  public readonly liquidationAmount: BigNumber;
  public readonly borrowedAmount: BigNumber;
  public readonly cumulativeIndexAtOpen: BigNumber;
  public readonly since: number;

  constructor(payload: CreditAccountDataExtendedPayload) {
    super(payload);
    this.borrowedAmount = BigNumber.from(payload.borrowedAmount);
    this.cumulativeIndexAtOpen = BigNumber.from(payload.cumulativeIndexAtOpen);
    this.repayAmount = BigNumber.from(payload.repayAmount);
    this.liquidationAmount = BigNumber.from(payload.liquidationAmount);
    this.since = BigNumber.from(payload.since).toNumber();
  }
}
