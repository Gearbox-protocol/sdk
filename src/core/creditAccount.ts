import {
  decimals,
  extractTokenData,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  toBigInt,
  tokenSymbolByAddress,
} from "@gearbox-protocol/sdk-gov";

import { LpTokensAPY, TokensWithAPY } from "../apy";
import {
  CaTokenBalance,
  CreditAccountDataPayload,
  ScheduledWithdrawal,
} from "../payload/creditAccount";
import { QuotaInfo } from "../payload/creditManager";
import { TokenData } from "../tokens/tokenData";
import { rayToNumber } from "../utils/formatter";
import { BigIntMath } from "../utils/math";
import { PriceUtils } from "../utils/price";
import { Asset, AssetWithAmountInTarget } from "./assets";

export interface CalcOverallAPYProps {
  caAssets: Array<Asset>;
  lpAPY: LpTokensAPY | undefined;

  quotas: Record<string, Asset>;
  quotaRates: Record<string, Pick<QuotaInfo, "rate">>;

  prices: Record<string, bigint>;

  totalValue: bigint | undefined;
  debt: bigint | undefined;
  baseBorrowRate: number;
  underlyingToken: string;
}

export interface CalcHealthFactorProps {
  assets: Array<Asset>;
  quotas: Record<string, Asset>;

  prices: Record<string, bigint>;
  liquidationThresholds: Record<string, bigint>;
  underlyingToken: string;
  borrowed: bigint;
}

export interface CalcQuotaUpdateProps {
  quotas: Record<string, Pick<QuotaInfo, "isActive" | "token">>;
  initialQuotas: Record<string, Pick<CaTokenBalance, "quota">>;
  assetsAfterUpdate: Record<string, AssetWithAmountInTarget>;

  allowedToSpend: Record<string, {}>;
  allowedToObtain: Record<string, {}>;
}

interface CalcQuotaUpdateReturnType {
  desiredQuota: Record<string, Asset>;
  quotaIncrease: Array<Asset>;
  quotaDecrease: Array<Asset>;
}

export interface CalcQuotaBorrowRateProps {
  quotas: Record<string, Asset>;
  quotaRates: Record<string, Pick<QuotaInfo, "rate">>;
  borrowAmount: bigint;
}

export class CreditAccountData {
  readonly isSuccessful: boolean;

  readonly addr: string;
  readonly borrower: string;
  readonly creditManager: string;
  readonly creditFacade: string;
  readonly underlyingToken: string;
  readonly since: number;
  readonly expirationDate: number;
  readonly version: number;
  readonly cmDescription: string;

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
    this.isSuccessful = payload.isSuccessful;

    this.addr = payload.addr.toLowerCase();
    this.borrower = payload.borrower.toLowerCase();
    this.creditManager = payload.creditManager.toLowerCase();
    this.creditFacade = payload.creditFacade.toLowerCase();
    this.underlyingToken = payload.underlying.toLowerCase();
    this.since = Number(toBigInt(payload.since));
    this.expirationDate = Number(toBigInt(payload.expirationDate));
    this.version = payload.cfVersion?.toNumber();
    this.cmDescription = payload.cmDescription;

    this.healthFactor = Number(toBigInt(payload.healthFactor || 0n));
    this.enabledTokenMask = toBigInt(payload.enabledTokensMask);
    this.isDeleting = false;

    this.borrowedAmount = toBigInt(payload.debt);
    this.accruedInterest = toBigInt(payload.accruedInterest || 0n);
    this.accruedFees = toBigInt(payload.accruedFees || 0n);
    this.borrowedAmountPlusInterestAndFees =
      this.borrowedAmount + this.accruedInterest + this.accruedFees;
    this.totalDebtUSD = toBigInt(payload.totalDebtUSD);
    this.totalValue = toBigInt(payload.totalValue || 0n);
    this.totalValueUSD = toBigInt(payload.totalValueUSD);
    this.twvUSD = toBigInt(payload.twvUSD);

    this.baseBorrowRate = rayToNumber(
      toBigInt(payload.baseBorrowRate) *
        PERCENTAGE_DECIMALS *
        PERCENTAGE_FACTOR,
    );
    this.borrowRate = rayToNumber(
      toBigInt(payload.aggregatedBorrowRate) *
        PERCENTAGE_DECIMALS *
        PERCENTAGE_FACTOR,
    );

    this.cumulativeIndexNow = toBigInt(payload.cumulativeIndexNow);
    this.cumulativeIndexLastUpdate = toBigInt(
      payload.cumulativeIndexLastUpdate,
    );
    this.cumulativeQuotaInterest = toBigInt(payload.cumulativeQuotaInterest);

    this.activeBots = payload.activeBots.map(b => b.toLowerCase());
    this.maxApprovedBots = toBigInt(payload.maxApprovedBots);

    payload.balances.forEach(b => {
      const token = b.token.toLowerCase();
      const balance: CaTokenBalance = {
        token,
        balance: toBigInt(b.balance),
        isForbidden: b.isForbidden,
        isEnabled: b.isEnabled,
        isQuoted: b.isQuoted,
        quota: toBigInt(b.quota),
        quotaRate: Number(toBigInt(b.quotaRate) * PERCENTAGE_DECIMALS),
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

  isTokenEnabled(index: number) {
    return ((2n ** BigInt(index)) & this.enabledTokenMask) !== 0n;
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

    return BigIntMath.max(0n, result);
  }

  static calcOverallAPY({
    caAssets,
    lpAPY,
    prices,
    quotas,
    quotaRates,

    totalValue,
    debt,
    baseBorrowRate,
    underlyingToken,
  }: CalcOverallAPYProps): bigint | undefined {
    if (
      !lpAPY ||
      !totalValue ||
      totalValue <= 0n ||
      !debt ||
      totalValue <= debt
    )
      return undefined;

    const underlyingTokenAddressLC = underlyingToken.toLowerCase();
    const underlyingTokenSymbol =
      tokenSymbolByAddress[underlyingTokenAddressLC] || "";
    const underlyingTokenDecimals = decimals[underlyingTokenSymbol] || 18;
    const underlyingPrice = prices[underlyingTokenAddressLC];

    const assetAPYMoney = caAssets.reduce(
      (acc, { token: tokenAddress, balance: amount }) => {
        const tokenAddressLC = tokenAddress.toLowerCase();
        const symbol = tokenSymbolByAddress[tokenAddressLC] || "";

        const apy = lpAPY[symbol as TokensWithAPY] || 0;
        const price = prices[tokenAddressLC] || 0n;
        const tokenDecimals = decimals[symbol];

        const money = PriceUtils.calcTotalPrice(price, amount, tokenDecimals);
        const apyMoney = money * BigInt(apy);

        const { balance: quotaAmount = 0n } = quotas[tokenAddressLC] || {};
        const quotaMoney = PriceUtils.calcTotalPrice(
          underlyingPrice || 0n,
          quotaAmount,
          underlyingTokenDecimals,
        );

        const { rate: quotaAPY = 0 } = quotaRates[tokenAddressLC] || {};
        const quotaAPYMoney = quotaMoney * BigInt(quotaAPY);

        return acc + apyMoney - quotaAPYMoney;
      },
      0n,
    );

    const assetAPYAmountInUnderlying = PriceUtils.convertByPrice(
      assetAPYMoney,
      {
        price: underlyingPrice || PRICE_DECIMALS,
        decimals: underlyingTokenDecimals,
      },
    );

    const debtAPY = debt * BigInt(baseBorrowRate);

    const yourAssets = totalValue - debt;

    const apyInPercent = (assetAPYAmountInUnderlying - debtAPY) / yourAssets;

    return apyInPercent;
  }

  hash(): string {
    return CreditAccountData.hash(this.creditManager, this.borrower);
  }

  static hash(creditManager: string, borrower: string): string {
    return `${creditManager.toLowerCase()}:${borrower.toLowerCase()}`;
  }

  static calcHealthFactor({
    assets,
    quotas,

    liquidationThresholds,
    underlyingToken,
    borrowed,

    prices,
  }: CalcHealthFactorProps): number {
    const [, underlyingDecimals] = extractTokenData(underlyingToken);
    const underlyingPrice = prices[underlyingToken] || 0n;

    const assetLTMoney = assets.reduce(
      (acc, { token: tokenAddress, balance: amount }) => {
        const [, tokenDecimals] = extractTokenData(tokenAddress);

        const lt = liquidationThresholds[tokenAddress] || 0n;
        const price = prices[tokenAddress] || 0n;

        const tokenMoney = PriceUtils.calcTotalPrice(
          price,
          amount,
          tokenDecimals,
        );

        const quota = quotas[tokenAddress];
        const quotaMoney = PriceUtils.calcTotalPrice(
          underlyingPrice,
          quota?.balance || 0n,
          underlyingDecimals,
        );

        // if quota is undefined, then it is not a quoted token
        const money = quota
          ? BigIntMath.min(quotaMoney, tokenMoney)
          : tokenMoney;

        const ltMoney = money * lt;

        return acc + ltMoney;
      },
      0n,
    );

    const borrowedMoney = PriceUtils.calcTotalPrice(
      underlyingPrice || PRICE_DECIMALS,
      borrowed,
      underlyingDecimals,
    );

    const hfInPercent = borrowedMoney > 0n ? assetLTMoney / borrowedMoney : 0n;

    return Number(hfInPercent);
  }

  static calcQuotaUpdate({
    quotas,
    initialQuotas,
    assetsAfterUpdate,

    allowedToSpend,
    allowedToObtain,
  }: CalcQuotaUpdateProps) {
    const r = Object.values(quotas).reduce<CalcQuotaUpdateReturnType>(
      (acc, cmQuota) => {
        const { token } = cmQuota;

        const { quota: initialQuota = 0n } = initialQuotas[token] || {};

        const after = assetsAfterUpdate[token];
        const { amountInTarget = 0n } = after || {};

        const desiredQuota = (amountInTarget * 101n) / 100n;
        const quotaChange = desiredQuota - initialQuota;

        const correctIncrease =
          after && allowedToObtain[token] && quotaChange > 0;
        const correctDecrease =
          after && allowedToSpend[token] && quotaChange < 0;

        if (correctIncrease || correctDecrease) {
          acc.desiredQuota[token] = {
            balance: desiredQuota,
            token,
          };
        } else {
          acc.desiredQuota[token] = {
            balance: initialQuota,
            token,
          };
        }

        if (correctIncrease) {
          acc.quotaIncrease.push({
            balance: quotaChange,
            token,
          });
        }
        if (correctDecrease) {
          acc.quotaDecrease.push({
            balance: quotaChange,
            token,
          });
        }

        return acc;
      },
      { desiredQuota: {}, quotaIncrease: [], quotaDecrease: [] },
    );
    return r;
  }

  static calcQuotaBorrowRate({
    quotas,
    quotaRates,
    borrowAmount,
  }: CalcQuotaBorrowRateProps) {
    if (borrowAmount <= 0) return 0;
    const totalRateBalance = Object.values(quotas).reduce(
      (acc, { token, balance }) => {
        const { rate = 0 } = quotaRates[token] || {};

        const rateBalance = balance * BigInt(rate);

        return acc + rateBalance;
      },
      0n,
    );

    const quotaBorrowRate = Number(totalRateBalance / borrowAmount);
    return quotaBorrowRate;
  }
}
