import { BigNumber } from "ethers";
import {
  CreditAccountDataExtendedPayload,
  CreditAccountDataPayload,
} from "../payload/creditAccount";
import { PERCENTAGE_FACTOR, RAY } from "./constants";
import { TokenData } from "./token";

export type Balance = { address: string; balance: BigNumber };

export class CreditAccountData {
  public readonly id: string;

  public readonly addr: string;
  public readonly borrower: string;
  public readonly inUse: boolean;
  public readonly creditManager: string;
  public readonly underlyingToken: string;
  public borrowedAmountPlusInterest: BigNumber;
  public totalValue: BigNumber;
  public healthFactor: number;
  public borrowRate: number;
  public readonly allowedTokens: Array<string> = [];
  public balances: Record<string, BigNumber> = {};

  constructor(payload: CreditAccountDataPayload) {
    this.id = payload.creditManager;
    this.addr = payload.addr;
    this.borrower = payload.borrower;
    this.inUse = payload.inUse;
    this.creditManager = payload.creditManager;
    this.underlyingToken = payload.underlyingToken;
    this.borrowedAmountPlusInterest = BigNumber.from(
      payload.borrowedAmountPlusInterest
    );
    this.totalValue = BigNumber.from(payload.totalValue);
    this.healthFactor =
      BigNumber.from(payload.healthFactor).toNumber() / PERCENTAGE_FACTOR;
    this.borrowRate =
      BigNumber.from(payload.borrowRate)
        .mul(PERCENTAGE_FACTOR)
        .mul(100)
        .div(RAY)
        .toNumber() / PERCENTAGE_FACTOR;

    (payload.balances || []).forEach((b) => {

      console.log(b);

      if (b.isAllowed) {
        this.balances[b.token] = BigNumber.from(b.balance);
        this.allowedTokens.push(b.token);
      }

    });
  }

  balancesSorted(
    prices: Record<string, number>,
    tokens: Record<string, TokenData>
  ): Array<Balance> {
    const priceCalc = (addr: string, amount: BigNumber) =>
      amount
        .mul(Math.floor(1000 * prices[tokens[addr]?.symbol || ""] || 0))
        .div(BigNumber.from(10).pow(tokens[addr]?.decimals || 18));

    const tokensAbcComparator = (t1?: TokenData, t2?: TokenData) =>
      (t1?.symbol || "") > (t2?.symbol || "") ? 1 : -1;

    return tokens
      ? Object.entries(this.balances || [])
          .sort(([addr1, amount1], [addr2, amount2]) => {
            return priceCalc(addr1, amount1).eq(priceCalc(addr2, amount2))
              ? tokensAbcComparator(tokens[addr1], tokens[addr2])
              : priceCalc(addr1, amount1).gt(priceCalc(addr2, amount2))
              ? -1
              : 1;
          })
          .map(([address, balance]) => ({ address, balance }))
      : [];
  }
}

export class CreditAccountDataExtended extends CreditAccountData {
  public readonly repayAmount: BigNumber;
  public readonly liquidationAmount: BigNumber;
  public readonly borrowedAmount: BigNumber;
  public readonly canBeClosed: boolean;
  public readonly cumulativeIndexAtOpen: BigNumber;
  public readonly since: number;

  constructor(payload: CreditAccountDataExtendedPayload) {
    super(payload);
    this.borrowedAmount = BigNumber.from(payload.borrowedAmount);
    this.cumulativeIndexAtOpen = BigNumber.from(payload.cumulativeIndexAtOpen);
    this.repayAmount = BigNumber.from(payload.repayAmount);
    this.liquidationAmount = BigNumber.from(payload.liquidationAmount);
    this.canBeClosed = payload.canBeClosed || false;
    this.since = BigNumber.from(payload.since).toNumber();
  }
}
