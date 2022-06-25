import { BigNumber } from "ethers";
import {
  CreditAccountDataExtendedPayload,
  CreditAccountDataPayload
} from "../payload/creditAccount";
import { PERCENTAGE_FACTOR, RAY } from "./constants";
import { TokenData } from "../tokens/tokenData";

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
  public readonly allTokens: Array<string> = [];
  public balances: Record<string, BigNumber> = {};
  public allBalances: Record<string, BigNumber> = {};
  public isDeleting: boolean;
  public readonly version: number = 1;

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

    (payload.balances || []).forEach(b => {
      if (b.isAllowed) {
        this.balances[b.token] = BigNumber.from(b.balance);
        this.allowedTokens.push(b.token);
      }

      this.allBalances[b.token] = BigNumber.from(b.balance);
      this.allTokens.push(b.token);
    });

    this.isDeleting = false;
  }

  balancesSorted(
    prices: Record<string, number>,
    tokens: Record<string, TokenData>
  ): Array<Balance> {
    const priceCalc = (addr: string, amount: BigNumber) => {
      const price = prices[addr] || 0;
      const { decimals = 18 } = tokens[addr] || {};

      return amount
        .mul(Math.floor(1000 * price))
        .div(BigNumber.from(10).pow(decimals));
    };

    const tokensAbcComparator = (t1?: TokenData, t2?: TokenData) => {
      const { symbol: symbol1 = "" } = t1 || {};
      const { symbol: symbol2 = "" } = t2 || {};

      return symbol1 > symbol2 ? 1 : -1;
    };

    const safeBalances = this.balances || [];

    return Object.entries(safeBalances)
      .sort(([addr1, amount1], [addr2, amount2]) => {
        const addr1Lc = addr1.toLowerCase();
        const addr2Lc = addr2.toLowerCase();

        const price1 = priceCalc(addr1Lc, amount1);
        const price2 = priceCalc(addr2Lc, amount2);

        return price1.eq(price2)
          ? tokensAbcComparator(tokens[addr1Lc], tokens[addr2Lc])
          : price1.gt(price2)
          ? -1
          : 1;
      })
      .map(([address, balance]) => ({ address, balance }));
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
