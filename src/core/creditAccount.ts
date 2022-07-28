import { BigNumber } from "ethers";
import {
  CreditAccountDataExtendedPayload,
  CreditAccountDataPayload
} from "../payload/creditAccount";
import {
  PERCENTAGE_FACTOR,
  RAY,
  PERCENTAGE_DECIMALS,
  PRICE_DECIMALS
} from "./constants";
import { TokenData } from "../tokens/tokenData";
import { calcTotalPrice } from "./price";

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
    this.underlyingToken = payload.underlying;
    this.borrowedAmountPlusInterest = BigNumber.from(
      payload.borrowedAmountPlusInterest
    );
    this.totalValue = BigNumber.from(payload.totalValue);
    this.healthFactor =
      BigNumber.from(payload.healthFactor).toNumber() / PERCENTAGE_FACTOR;
    this.borrowRate =
      BigNumber.from(payload.borrowRate)
        .mul(PERCENTAGE_FACTOR)
        .mul(PERCENTAGE_DECIMALS)
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
    prices: Record<string, BigNumber>,
    tokens: Record<string, TokenData>
  ): Array<Balance> {
    return sortBalances(this.balances, prices, tokens).map(
      ([address, balance]) => ({ address, balance })
    );
  }
}

export function sortBalances(
  balances: Record<string, BigNumber>,
  prices: Record<string, BigNumber>,
  tokens: Record<string, TokenData>
) {
  return Object.entries(balances).sort(([addr1, amount1], [addr2, amount2]) => {
    const addr1Lc = addr1.toLowerCase();
    const addr2Lc = addr2.toLowerCase();

    const token1 = tokens[addr1Lc];
    const token2 = tokens[addr2Lc];

    const price1 = prices[addr1Lc] || PRICE_DECIMALS;
    const price2 = prices[addr2Lc] || PRICE_DECIMALS;

    const totalPrice1 = calcTotalPrice(price1, amount1, token1?.decimals);
    const totalPrice2 = calcTotalPrice(price2, amount2, token2?.decimals);

    if (totalPrice1.eq(totalPrice2)) {
      return tokensAbcComparator(token1, token2);
    }

    if (totalPrice1.gt(totalPrice2)) {
      return -1;
    }

    return 1;
  });
}

export function tokensAbcComparator(t1?: TokenData, t2?: TokenData) {
  const { symbol: symbol1 = "" } = t1 || {};
  const { symbol: symbol2 = "" } = t2 || {};

  return symbol1 > symbol2 ? 1 : -1;
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
