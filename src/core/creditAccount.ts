import {
  decimals,
  extractTokenData,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  toBigInt,
  tokenSymbolByAddress,
  WAD,
} from "@gearbox-protocol/sdk-gov";

import { LpTokensAPY, TokensWithAPY } from "../apy";
import {
  CaTokenBalance,
  CreditAccountDataPayload,
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
  quotaRates: Record<string, Pick<QuotaInfo, "isActive" | "rate">>;
  feeInterest: number;

  prices: Record<string, bigint>;

  totalValue: bigint | undefined;
  debt: bigint | undefined;
  baseRateWithFee: number;
  underlyingToken: string;
}

export interface CalcHealthFactorProps {
  assets: Array<Asset>;
  quotas: Record<string, Asset>;
  quotasInfo: Record<string, Pick<QuotaInfo, "isActive">>;

  prices: Record<string, bigint>;
  liquidationThresholds: Record<string, bigint>;
  underlyingToken: string;
  debt: bigint;
}

export interface CalcQuotaUpdateProps {
  quotas: Record<string, Pick<QuotaInfo, "isActive" | "token">>;
  initialQuotas: Record<string, Pick<CaTokenBalance, "quota">>;
  liquidationThresholds: Record<string, bigint>;
  debt: bigint;
  assetsAfterUpdate: Record<string, AssetWithAmountInTarget>;

  allowedToSpend: Record<string, {}>;
  allowedToObtain: Record<string, {}>;

  quotaReserve: bigint;
}

interface CalcQuotaUpdateReturnType {
  desiredQuota: Record<string, Asset>;
  quotaIncrease: Array<Asset>;
  quotaDecrease: Array<Asset>;
}

export interface CalcQuotaBorrowRateProps {
  quotas: Record<string, Asset>;
  quotaRates: Record<string, Pick<QuotaInfo, "isActive" | "rate">>;
}

export interface CalcRelativeBaseBorrowRateProps {
  debt: bigint;
  baseRateWithFee: number;
  assetAmountInUnderlying: bigint;
  totalValue: bigint;
}

export interface CalcAvgQuotaBorrowRateProps {
  quotas: Record<string, Asset>;
  quotaRates: Record<string, Pick<QuotaInfo, "isActive" | "rate">>;
  totalValue: bigint;
}

interface LiquidationPriceProps {
  liquidationThresholds: Record<string, bigint>;

  debt: bigint;
  underlyingToken: string;
  targetToken: string;
  assets: Record<string, Asset>;
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
  readonly cmName: string;

  readonly enabledTokenMask: bigint;
  readonly healthFactor: number;
  isDeleting: boolean;

  readonly baseBorrowRateWithoutFee: number;
  readonly borrowRateWithoutFee: number;

  readonly borrowedAmount: bigint;
  readonly accruedInterest: bigint;
  readonly accruedFees: bigint;
  readonly totalDebtUSD: bigint;
  readonly borrowedAmountPlusInterestAndFees: bigint;
  readonly totalValue: bigint;
  readonly totalValueUSD: bigint;
  readonly twvUSD: bigint;

  readonly cumulativeIndexLastUpdate: bigint;
  readonly cumulativeQuotaInterest: bigint;

  readonly activeBots: string[];

  readonly balances: Record<string, bigint> = {};
  readonly collateralTokens: Array<string> = [];
  readonly allBalances: Record<string, CaTokenBalance> = {};
  readonly forbiddenTokens: Record<string, true> = {};
  readonly quotedTokens: Record<string, true> = {};

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
    this.cmName = payload.cmName;

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

    this.baseBorrowRateWithoutFee = rayToNumber(
      toBigInt(payload.baseBorrowRate) *
        PERCENTAGE_DECIMALS *
        PERCENTAGE_FACTOR,
    );
    this.borrowRateWithoutFee = rayToNumber(
      toBigInt(payload.aggregatedBorrowRate) *
        PERCENTAGE_DECIMALS *
        PERCENTAGE_FACTOR,
    );

    this.cumulativeIndexLastUpdate = toBigInt(
      payload.cumulativeIndexLastUpdate,
    );
    this.cumulativeQuotaInterest = toBigInt(payload.cumulativeQuotaInterest);

    this.activeBots = payload.activeBots.map(b => b.toLowerCase());

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
        quotaCumulativeIndexLU: toBigInt(b.quotaCumulativeIndexLU),
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

  isTokenEnabled(token: string) {
    return this.allBalances[token].isEnabled;
  }

  static calcMaxDebtIncrease(
    healthFactor: number,
    debt: bigint,
    underlyingLT: number,
    minHf = Number(PERCENTAGE_FACTOR),
  ): bigint {
    const result =
      (debt * BigInt(healthFactor - minHf)) / BigInt(minHf - underlyingLT);

    return BigIntMath.max(0n, result);
  }

  static calcOverallAPY({
    caAssets,
    lpAPY,
    prices,
    quotas,
    quotaRates,
    feeInterest,

    totalValue,
    debt,
    baseRateWithFee,
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

        const { rate: quotaAPY = 0, isActive = false } =
          quotaRates?.[tokenAddressLC] || {};
        const { balance: quotaBalance = 0n } = quotas[tokenAddressLC] || {};

        const quotaAmount = isActive ? quotaBalance : 0n;
        const quotaMoney = PriceUtils.calcTotalPrice(
          underlyingPrice || 0n,
          quotaAmount,
          underlyingTokenDecimals,
        );

        const quotaRate =
          (toBigInt(quotaAPY) * (BigInt(feeInterest) + PERCENTAGE_FACTOR)) /
          PERCENTAGE_FACTOR;

        const quotaAPYMoney = quotaMoney * quotaRate;

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

    const debtAPY = debt * BigInt(baseRateWithFee);

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
    quotasInfo,

    liquidationThresholds,
    underlyingToken,
    debt,

    prices,
  }: CalcHealthFactorProps): number {
    const [, underlyingDecimals] = extractTokenData(underlyingToken);
    const underlyingPrice = prices[underlyingToken] || 0n;

    const assetMoney = assets.reduce(
      (acc, { token: tokenAddress, balance: amount }) => {
        const [, tokenDecimals] = extractTokenData(tokenAddress);

        const lt = liquidationThresholds[tokenAddress] || 0n;
        const price = prices[tokenAddress] || 0n;

        const tokenMoney = PriceUtils.calcTotalPrice(
          price,
          amount,
          tokenDecimals,
        );
        const tokenLtMoney = (tokenMoney * lt) / PERCENTAGE_FACTOR;

        const { isActive = false } = quotasInfo?.[tokenAddress] || {};
        const quota = quotas[tokenAddress];
        const quotaBalance = isActive ? quota?.balance || 0n : 0n;
        const quotaMoney = PriceUtils.calcTotalPrice(
          underlyingPrice,
          quotaBalance,
          underlyingDecimals,
        );

        // if quota is undefined, then it is not a quoted token
        const money = quota
          ? BigIntMath.min(quotaMoney, tokenLtMoney)
          : tokenLtMoney;

        return acc + money;
      },
      0n,
    );

    const borrowedMoney = PriceUtils.calcTotalPrice(
      underlyingPrice || PRICE_DECIMALS,
      debt,
      underlyingDecimals,
    );

    const hfInPercent =
      borrowedMoney > 0n
        ? (assetMoney * PERCENTAGE_FACTOR) / borrowedMoney
        : 0n;

    return Number(hfInPercent);
  }

  static calcQuotaUpdate({
    quotas,
    initialQuotas,
    assetsAfterUpdate,

    liquidationThresholds,
    debt,

    allowedToSpend,
    allowedToObtain,

    quotaReserve,
  }: CalcQuotaUpdateProps) {
    const r = Object.values(quotas).reduce<CalcQuotaUpdateReturnType>(
      (acc, cmQuota) => {
        const { token, isActive } = cmQuota;
        const { quota: initialQuota = 0n } = initialQuotas[token] || {};

        if (!isActive) {
          acc.desiredQuota[token] = {
            balance: initialQuota,
            token,
          };
          return acc;
        }

        // min(debt,assetAmountInUnderlying*LT)*(1+buffer)
        const after = assetsAfterUpdate[token];
        const { amountInTarget = 0n } = after || {};
        const lt = liquidationThresholds[token] || 0n;

        const desiredBaseQuota = BigIntMath.min(
          debt,
          (amountInTarget * lt) / PERCENTAGE_FACTOR,
        );

        const desiredQuota =
          (desiredBaseQuota * (PERCENTAGE_FACTOR + quotaReserve)) /
          PERCENTAGE_FACTOR;
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

  static calcQuotaBorrowRate({ quotas, quotaRates }: CalcQuotaBorrowRateProps) {
    const totalRateBalance = Object.values(quotas).reduce(
      (acc, { token, balance }) => {
        const { rate = 0, isActive = false } = quotaRates?.[token] || {};

        const quotaBalance = isActive ? balance : 0n;
        const rateBalance = quotaBalance * BigInt(rate);

        return acc + rateBalance;
      },
      0n,
    );
    return totalRateBalance;
  }
  static calcRelativeBaseBorrowRate({
    debt,
    baseRateWithFee,
    assetAmountInUnderlying,
    totalValue,
  }: CalcRelativeBaseBorrowRateProps) {
    if (totalValue === 0n) return 0n;
    return (
      (debt * BigInt(baseRateWithFee) * assetAmountInUnderlying) / totalValue
    );
  }

  static liquidationPrice({
    liquidationThresholds,

    debt,
    underlyingToken,
    targetToken,
    assets,
  }: LiquidationPriceProps) {
    const underlyingTokenLC = underlyingToken.toLowerCase();
    const [, underlyingDecimals = 18] = extractTokenData(underlyingTokenLC);
    const { balance: underlyingBalance = 0n } = assets[underlyingTokenLC] || {};

    const effectiveDebt =
      ((debt - underlyingBalance) * WAD) / 10n ** BigInt(underlyingDecimals);

    const targetTokenLC = targetToken.toLowerCase();
    const [, targetDecimals = 18] = extractTokenData(targetTokenLC);
    const { balance: targetBalance = 0n } = assets[targetTokenLC] || {};
    const effectiveTargetBalance =
      (targetBalance * WAD) / 10n ** BigInt(targetDecimals);

    const lpLT = liquidationThresholds[targetTokenLC] || 0n;

    if (targetBalance <= 0n || lpLT <= 0n) return 0n;

    return (
      (effectiveDebt * PRICE_DECIMALS * PERCENTAGE_FACTOR) /
      effectiveTargetBalance /
      lpLT
    );
  }
}
