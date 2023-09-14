import {
  decimals,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  tokenSymbolByAddress,
  WAD,
  WAD_DECIMALS_POW,
} from "@gearbox-protocol/sdk-gov";

import { isTokenWithAPY, LpTokensAPY } from "../apy";
import {
  CaTokenBalance,
  CreditAccountDataPayload,
  ScheduledWithdrawal,
} from "../payload/creditAccount";
import { TokenData } from "../tokens/tokenData";
import { rayToNumber, toBigInt, toSignificant } from "../utils/formatter";
import { PriceUtils } from "../utils/price";
import { Asset } from "./assets";

export interface CalcOverallAPYProps {
  caAssets: Array<Asset>;
  lpAPY: LpTokensAPY | undefined;
  prices: Record<string, bigint>;

  totalValue: bigint | undefined;
  debt: bigint | undefined;
  borrowRate: number;
  underlyingToken: string;
}

export interface CalcHealthFactorProps {
  assets: Array<Asset>;
  prices: Record<string, bigint>;
  liquidationThresholds: Record<string, bigint>;
  underlyingToken: string;
  borrowed: bigint;
}

export class CreditAccountData {
  readonly addr: string;
  readonly borrower: string;
  readonly creditManager: string;
  readonly creditFacade: string;
  readonly underlyingToken: string;
  readonly since: number;
  readonly expirationDate: number;
  readonly version: number;

  readonly enabledTokenMask: bigint;
  readonly healthFactor: number;
  isDeleting: boolean;

  readonly baseBorrowRate: number;
  readonly borrowRate: number;

  readonly borrowedAmount: bigint;
  readonly accruedInterest: bigint;
  readonly accruedFees: bigint;
  readonly totalDebtUSD: bigint;
  readonly borrowedAmountPlusInterestAndFees: bigint;
  readonly totalValue: bigint;
  readonly totalValueUSD: bigint;
  readonly twvUSD: bigint;

  readonly cumulativeIndexNow: bigint;
  readonly cumulativeIndexLastUpdate: bigint;
  readonly cumulativeQuotaInterest: bigint;

  readonly activeBots: string[];
  readonly maxApprovedBots: bigint;

  readonly balances: Record<string, bigint> = {};
  readonly collateralTokens: Array<string> = [];
  readonly allBalances: Record<string, CaTokenBalance> = {};
  readonly forbiddenTokens: Record<string, true> = {};
  readonly quotedTokens: Record<string, true> = {};

  readonly schedultedWithdrawals: Array<ScheduledWithdrawal>;

  constructor(payload: CreditAccountDataPayload) {
    this.addr = payload.addr.toLowerCase();
    this.borrower = payload.borrower.toLowerCase();
    this.creditManager = payload.creditManager.toLowerCase();
    this.creditFacade = payload.creditFacade.toLowerCase();
    this.underlyingToken = payload.underlying.toLowerCase();
    this.since = Number(toBigInt(payload.since || 0));
    this.expirationDate = Number(toBigInt(payload.expirationDate || 0));
    this.version = payload.cfVersion?.toNumber() || 0;

    this.healthFactor = Number(toBigInt(payload.healthFactor || 0));
    this.enabledTokenMask = toBigInt(payload.enabledTokensMask || 0);
    this.isDeleting = false;

    this.borrowedAmount = toBigInt(payload.debt || 0);
    this.accruedInterest = toBigInt(payload.accruedInterest || 0);
    this.accruedFees = toBigInt(payload.accruedFees || 0);
    this.borrowedAmountPlusInterestAndFees =
      this.borrowedAmount + this.accruedInterest + this.accruedFees;
    this.totalDebtUSD = toBigInt(payload.totalDebtUSD || 0);
    this.totalValue = toBigInt(payload.totalValue || 0);
    this.totalValueUSD = toBigInt(payload.totalValueUSD || 0);
    this.twvUSD = toBigInt(payload.twvUSD || 0);

    this.baseBorrowRate = rayToNumber(
      toBigInt(payload.baseBorrowRate || 0) *
        PERCENTAGE_DECIMALS *
        PERCENTAGE_FACTOR,
    );
    this.borrowRate = rayToNumber(
      toBigInt(payload.aggregatedBorrowRate || 0) *
        PERCENTAGE_DECIMALS *
        PERCENTAGE_FACTOR,
    );

    this.cumulativeIndexNow = toBigInt(payload.cumulativeIndexNow || 0);
    this.cumulativeIndexLastUpdate = toBigInt(
      payload.cumulativeIndexLastUpdate || 0,
    );
    this.cumulativeQuotaInterest = toBigInt(
      payload.cumulativeQuotaInterest || 0,
    );

    this.activeBots = payload.activeBots.map(b => b.toLowerCase());
    this.maxApprovedBots = toBigInt(payload.maxApprovedBots || 0);

    payload.balances.forEach(b => {
      const token = b.token.toLowerCase();
      const balance: CaTokenBalance = {
        token,
        balance: toBigInt(b.balance || 0),
        isForbidden: b.isForbidden || false,
        isEnabled: b.isEnabled || false,
        isQuoted: b.isQuoted || false,
        quota: toBigInt(b.quota || 0),
        quotaRate: b.quotaRate || 0,
      };

      if (!b.isForbidden) {
        this.balances[token] = balance.balance;
        this.collateralTokens.push(token);
      }
      if (b.isForbidden) {
        this.forbiddenTokens[token] = true;
      }
      if (b.isQuoted) {
        this.quotedTokens[token] = true;
      }

      this.allBalances[token] = balance;
    });

    this.schedultedWithdrawals = payload.schedultedWithdrawals.map(w => ({
      tokenIndex: w.tokenIndex,
      maturity: w.maturity,
      token: w.token.toLowerCase(),
      amount: toBigInt(w.amount),
    }));
  }

  setDeleteInProgress(d: boolean) {
    this.isDeleting = d;
  }

  balancesSorted(
    prices: Record<string, bigint>,
    tokens: Record<string, TokenData>,
  ): Array<Asset> {
    return CreditAccountData.sortBalances(this.balances, prices, tokens).map(
      ([token, balance]) => ({ token, balance }),
    );
  }

  static sortBalances(
    balances: Record<string, bigint>,
    prices: Record<string, bigint>,
    tokens: Record<string, TokenData>,
  ): Array<[string, bigint]> {
    return Object.entries(balances).sort(
      ([addr1, amount1], [addr2, amount2]) => {
        const addr1Lc = addr1.toLowerCase();
        const addr2Lc = addr2.toLowerCase();

        const token1 = tokens[addr1Lc];
        const token2 = tokens[addr2Lc];

        const price1 = prices[addr1Lc] || PRICE_DECIMALS;
        const price2 = prices[addr2Lc] || PRICE_DECIMALS;

        const totalPrice1 = PriceUtils.calcTotalPrice(
          price1,
          amount1,
          token1?.decimals,
        );
        const totalPrice2 = PriceUtils.calcTotalPrice(
          price2,
          amount2,
          token2?.decimals,
        );

        if (totalPrice1 === totalPrice2) {
          return amount1 === amount2
            ? CreditAccountData.tokensAbcComparator(token1, token2)
            : CreditAccountData.amountAbcComparator(amount1, amount2);
        }

        return CreditAccountData.amountAbcComparator(totalPrice1, totalPrice2);
      },
    );
  }

  static tokensAbcComparator(t1?: TokenData, t2?: TokenData) {
    const { symbol: symbol1 = "" } = t1 || {};
    const { symbol: symbol2 = "" } = t2 || {};

    return symbol1 > symbol2 ? 1 : -1;
  }

  static amountAbcComparator(t1: bigint, t2: bigint) {
    return t1 > t2 ? -1 : 1;
  }

  isForbidden(token: string) {
    return !!this.forbiddenTokens[token];
  }

  isQuoted(token: string) {
    return !!this.quotedTokens[token];
  }

  static isTokenEnabled(index: number, enabledTokenMask: bigint) {
    return ((2n ** BigInt(index)) & enabledTokenMask) !== 0n;
  }

  static calcMaxDebtIncrease(
    healthFactor: number,
    borrowAmountPlusInterest: bigint,
    underlyingLT: number,
    minHf = Number(PERCENTAGE_FACTOR),
  ): bigint {
    const result =
      (borrowAmountPlusInterest * BigInt(healthFactor - minHf)) /
      BigInt(minHf - underlyingLT);
    return result < 0 ? 0n : result;
  }

  static calcOverallAPY({
    caAssets,
    lpAPY,
    prices,

    totalValue,
    debt,
    borrowRate,
    underlyingToken,
  }: CalcOverallAPYProps): number | undefined {
    if (
      !lpAPY ||
      !totalValue ||
      totalValue <= 0n ||
      !debt ||
      totalValue <= debt
    )
      return undefined;

    const assetAPYMoney = caAssets.reduce(
      (acc, { token: tokenAddress, balance: amount }) => {
        const tokenAddressLC = tokenAddress.toLowerCase();
        const symbol = tokenSymbolByAddress[tokenAddressLC];
        if (!isTokenWithAPY(symbol)) return acc;

        const apy = lpAPY[symbol] || 0;
        const price = prices[tokenAddressLC] || 0n;
        const tokenDecimals = decimals[symbol];

        const money = PriceUtils.calcTotalPrice(price, amount, tokenDecimals);
        const apyMoney = money * BigInt(apy);

        return acc + apyMoney;
      },
      0n,
    );

    const underlyingTokenAddressLC = underlyingToken.toLowerCase();
    const underlyingTokenSymbol =
      tokenSymbolByAddress[underlyingTokenAddressLC] || "";
    const underlyingTokenDecimals = decimals[underlyingTokenSymbol] || 18;
    const underlyingPrice = prices[underlyingTokenAddressLC] || PRICE_DECIMALS;
    const assetAPYAmountInUnderlying = PriceUtils.convertByPrice(
      assetAPYMoney,
      {
        price: underlyingPrice,
        decimals: underlyingTokenDecimals,
      },
    );

    const debtAPY = debt * BigInt(borrowRate);

    const yourAssets = totalValue - debt;

    const apyInPercent =
      ((assetAPYAmountInUnderlying - debtAPY) * WAD) /
      yourAssets /
      PERCENTAGE_FACTOR;

    return Number(toSignificant(apyInPercent, WAD_DECIMALS_POW));
  }

  hash(): string {
    return CreditAccountData.hash(this.creditManager, this.borrower);
  }

  static hash(creditManager: string, borrower: string): string {
    return `${creditManager.toLowerCase()}:${borrower.toLowerCase()}`;
  }

  static calcHealthFactor({
    assets,
    prices,
    liquidationThresholds,
    underlyingToken,
    borrowed,
  }: CalcHealthFactorProps): number {
    const assetLTMoney = assets.reduce(
      (acc, { token: tokenAddress, balance: amount }) => {
        const tokenSymbol = tokenSymbolByAddress[tokenAddress.toLowerCase()];
        const tokenDecimals: number | undefined = decimals[tokenSymbol];

        const lt = liquidationThresholds[tokenAddress.toLowerCase()] || 0n;
        const price = prices[tokenAddress.toLowerCase()] || 0n;

        const money = PriceUtils.calcTotalPrice(price, amount, tokenDecimals);
        const ltMoney = money * lt;

        return acc + ltMoney;
      },
      0n,
    );

    const underlyingSymbol =
      tokenSymbolByAddress[underlyingToken.toLowerCase()];
    const underlyingDecimals: number | undefined = decimals[underlyingSymbol];

    const underlyingPrice =
      prices[underlyingToken.toLowerCase()] || PRICE_DECIMALS;

    const borrowedMoney = PriceUtils.calcTotalPrice(
      underlyingPrice,
      borrowed,
      underlyingDecimals,
    );

    const hfInPercent = borrowedMoney > 0n ? assetLTMoney / borrowedMoney : 0n;

    return Number(hfInPercent);
  }
}
