import {
  decimals,
  extractTokenData,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  PRICE_DECIMALS_POW,
  tokenSymbolByAddress,
  WAD,
  WAD_DECIMALS_POW,
} from "@gearbox-protocol/sdk-gov";

import { TokensWithAPY, TokensWithApyRecord } from "../apy";
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

export const MIN_INT96 = -39614081257132168796771975168n;
export const MAX_UINT256 =
  115792089237316195423570985008687907853269984665640564039457584007913129639935n;

export interface CalcOverallAPYProps {
  caAssets: Array<Asset>;
  lpAPY: TokensWithApyRecord | undefined;

  quotas: Record<string, Asset>;
  quotaRates: Record<string, Pick<QuotaInfo, "isActive" | "rate">>;
  feeInterest: number;

  prices: Record<string, bigint>;

  totalValue: bigint | undefined;
  debt: bigint | undefined;
  baseRateWithFee: number;
  underlyingToken: string;
}

export interface CalcMaxLendingDebtIncreaseProps {
  assets: Array<Asset>;

  prices: Record<string, bigint>;
  liquidationThresholds: Record<string, bigint>;
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

export interface CalcDefaultQuotaProps {
  amount: bigint;
  lt: bigint;
  quotaReserve: bigint;
}

export interface CalcRecommendedQuotaProps {
  amount: bigint;
  debt: bigint;
  lt: bigint;
  quotaReserve: bigint;
}

export interface CalcQuotaUpdateProps {
  quotas: Record<string, Pick<QuotaInfo, "isActive" | "token">>;
  initialQuotas: Record<string, Pick<CaTokenBalance, "quota">>;
  liquidationThresholds: Record<string, bigint>;
  assetsAfterUpdate: Record<string, AssetWithAmountInTarget>;
  maxDebt: bigint;

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
}

export interface CalcAvgQuotaBorrowRateProps {
  quotas: Record<string, Asset>;
  quotaRates: Record<string, Pick<QuotaInfo, "isActive" | "rate">>;
}

interface LiquidationPriceProps {
  liquidationThresholds: Record<string, bigint>;

  debt: bigint;
  underlyingToken: string;
  targetToken: string;
  assets: Record<string, Asset>;
}

const MAX_UINT16 = 65535;

export class CreditAccountData {
  readonly isSuccessful: boolean;
  readonly priceFeedsNeeded: string[];

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

  readonly activeBots: Record<string, true>;

  readonly balances: Record<string, bigint> = {};
  readonly collateralTokens: Array<string> = [];
  readonly allBalances: Record<string, CaTokenBalance> = {};
  readonly forbiddenTokens: Record<string, true> = {};
  readonly quotedTokens: Record<string, true> = {};

  constructor(payload: CreditAccountDataPayload) {
    this.isSuccessful = payload.isSuccessful;
    this.priceFeedsNeeded = payload.priceFeedsNeeded;

    this.addr = payload.addr.toLowerCase();
    this.borrower = payload.borrower.toLowerCase();
    this.creditManager = payload.creditManager.toLowerCase();
    this.creditFacade = payload.creditFacade.toLowerCase();
    this.underlyingToken = payload.underlying.toLowerCase();
    this.since = Number(payload.since);
    this.expirationDate = Number(payload.expirationDate);
    this.version = Number(payload.cfVersion);
    this.cmName = payload.cmName;

    this.healthFactor = Number(payload.healthFactor || 0n);
    this.enabledTokenMask = payload.enabledTokensMask;
    this.isDeleting = false;

    this.borrowedAmount = payload.debt;
    this.accruedInterest = payload.accruedInterest || 0n;
    this.accruedFees = payload.accruedFees || 0n;
    this.borrowedAmountPlusInterestAndFees =
      this.borrowedAmount + this.accruedInterest + this.accruedFees;
    this.totalDebtUSD = payload.totalDebtUSD;
    this.totalValue = payload.totalValue || 0n;
    this.totalValueUSD = payload.totalValueUSD;
    this.twvUSD = payload.twvUSD;

    this.baseBorrowRateWithoutFee = rayToNumber(
      payload.baseBorrowRate * PERCENTAGE_DECIMALS * PERCENTAGE_FACTOR,
    );
    this.borrowRateWithoutFee = rayToNumber(
      payload.aggregatedBorrowRate * PERCENTAGE_DECIMALS * PERCENTAGE_FACTOR,
    );

    this.cumulativeIndexLastUpdate = payload.cumulativeIndexLastUpdate;
    this.cumulativeQuotaInterest = payload.cumulativeQuotaInterest;

    this.activeBots = payload.activeBots.reduce<Record<string, true>>(
      (acc, b) => {
        acc[b.toLowerCase()] = true;
        return acc;
      },
      {},
    );

    payload.balances.forEach(b => {
      const token = b.token.toLowerCase();
      const balance: CaTokenBalance = {
        token,
        balance: b.balance,
        isForbidden: b.isForbidden,
        isEnabled: b.isEnabled,
        isQuoted: b.isQuoted,
        quota: b.quota,
        quotaRate: b.quotaRate * PERCENTAGE_DECIMALS,
        quotaCumulativeIndexLU: b.quotaCumulativeIndexLU,
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
            ? this.tokensAbcComparator(token1, token2)
            : this.amountAbcComparator(amount1, amount2);
        }

        return this.amountAbcComparator(totalPrice1, totalPrice2);
      },
    );
  }

  static sortAssets(
    balances: Array<Asset>,
    prices: Record<string, bigint>,
    tokens: Record<string, TokenData>,
  ) {
    return balances.sort(
      (
        { token: addr1, balance: amount1 },
        { token: addr2, balance: amount2 },
      ) => {
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
            ? this.tokensAbcComparator(token1, token2)
            : this.amountAbcComparator(amount1, amount2);
        }

        return this.amountAbcComparator(totalPrice1, totalPrice2);
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

  // HF = TWV / debt
  // 1 = (TWV + (debtmax-debt)*LTunderl )/ debtmax
  // For lending

  static calcMaxLendingDebtIncrease({
    assets,

    liquidationThresholds,
    underlyingToken,

    prices,
  }: CalcMaxLendingDebtIncreaseProps) {
    const assetsLTMoney = assets.reduce(
      (acc, { token: tokenAddress, balance: amount }) => {
        const [, tokenDecimals] = extractTokenData(tokenAddress);

        const lt = liquidationThresholds[tokenAddress] || 0n;
        const price = prices[tokenAddress] || 0n;

        const tokenMoney = PriceUtils.calcTotalPrice(
          price,
          amount,
          tokenDecimals,
        );
        const tokenLtMoney = tokenMoney * lt;
        return acc + tokenLtMoney;
      },
      0n,
    );

    const underlyingPrice = prices[underlyingToken] || 0n;
    const [, underlyingDecimals = 18] = extractTokenData(underlyingToken);

    // HF = TWV / debt => 1 = TWV / debtMax
    // Debtmax = sum (LTi * Asset_i * price_i) / price_underlying
    const max =
      underlyingPrice > 0
        ? (assetsLTMoney * 10n ** BigInt(underlyingDecimals)) /
          underlyingPrice /
          PERCENTAGE_FACTOR /
          10n ** BigInt(WAD_DECIMALS_POW - PRICE_DECIMALS_POW)
        : 0n;

    return max;
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
        const [symbol = "", tokenDecimals] = extractTokenData(tokenAddressLC);

        const apy = lpAPY[symbol as TokensWithAPY] || 0;
        const price = prices[tokenAddressLC] || 0n;

        const money = PriceUtils.calcTotalPrice(price, amount, tokenDecimals);
        const apyMoney = money * BigInt(apy);

        const { rate: quotaAPY = 0n, isActive = false } =
          quotaRates?.[tokenAddressLC] || {};
        const { balance: quotaBalance = 0n } = quotas[tokenAddressLC] || {};

        const quotaAmount = isActive ? quotaBalance : 0n;
        const quotaMoney = PriceUtils.calcTotalPrice(
          underlyingPrice || 0n,
          quotaAmount,
          underlyingTokenDecimals,
        );

        const quotaRate =
          (quotaAPY * (BigInt(feeInterest) + PERCENTAGE_FACTOR)) /
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
    if (debt === 0n) return MAX_UINT16;

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

  static roundUpQuota(quotaChange: bigint) {
    return quotaChange !== MIN_INT96
      ? (quotaChange / PERCENTAGE_FACTOR) * PERCENTAGE_FACTOR
      : quotaChange;
  }

  static calcRecommendedQuota({
    amount,
    debt,
    lt,
    quotaReserve,
  }: CalcRecommendedQuotaProps) {
    const recommendedBaseQuota = BigIntMath.min(
      debt,
      (amount * lt) / PERCENTAGE_FACTOR,
    );

    const recommendedQuota =
      (recommendedBaseQuota * (PERCENTAGE_FACTOR + quotaReserve)) /
      PERCENTAGE_FACTOR;

    return this.roundUpQuota(recommendedQuota);
  }

  static calcDefaultQuota({ amount, lt, quotaReserve }: CalcDefaultQuotaProps) {
    const recommendedBaseQuota = (amount * lt) / PERCENTAGE_FACTOR;
    const recommendedQuota =
      (recommendedBaseQuota * (PERCENTAGE_FACTOR + quotaReserve)) /
      PERCENTAGE_FACTOR;

    return this.roundUpQuota(recommendedQuota);
  }

  static calcQuotaUpdate(
    props: CalcQuotaUpdateProps,
  ): CalcQuotaUpdateReturnType {
    const { quotas, initialQuotas, maxDebt, allowedToSpend, allowedToObtain } =
      props;
    const quotaDecrease = Object.keys(allowedToSpend).reduce<
      Record<string, Asset>
    >((acc, token) => {
      const ch = this.getSingleQuotaChange(token, 0n, props);
      if (ch) acc[ch.token] = ch;
      return acc;
    }, {});

    const quotaCap = this.roundUpQuota(maxDebt * 2n);
    const quotaBought = Object.values(initialQuotas).reduce(
      (sum, q) => sum + this.roundUpQuota(q?.quota || 0n),
      0n,
    );
    const quotaReduced = Object.values(quotaDecrease).reduce((sum, q) => {
      const quotaBalance = q.balance || 0n;
      const safeBalance =
        quotaBalance === MIN_INT96
          ? BigIntMath.neg(
              this.roundUpQuota(initialQuotas[q.token]?.quota || 0n),
            )
          : quotaBalance;

      return sum + safeBalance;
    }, 0n);
    const maxQuotaIncrease = this.roundUpQuota(
      BigIntMath.max(quotaCap - (quotaBought + quotaReduced), 0n),
    );

    const quotaIncrease = Object.keys(allowedToObtain).reduce<
      Record<string, Asset>
    >((acc, token) => {
      const ch = this.getSingleQuotaChange(token, maxQuotaIncrease, props);
      if (ch) acc[ch.token] = ch;
      return acc;
    }, {});

    const quotaChange = {
      ...quotaDecrease,
      ...quotaIncrease,
    };

    const desiredQuota = Object.values(quotas).reduce<Record<string, Asset>>(
      (acc, cmQuota) => {
        const { token, isActive } = cmQuota;
        const { quota: initialQuota = 0n } = initialQuotas[token] || {};

        if (!isActive) {
          acc[token] = {
            balance: initialQuota,
            token,
          };
        } else {
          const unsafeChange = quotaChange[token]?.balance || 0n;
          const change =
            unsafeChange === MIN_INT96
              ? BigIntMath.neg(
                  this.roundUpQuota(initialQuotas[cmQuota.token]?.quota || 0n),
                )
              : unsafeChange;

          const quotaAfter = initialQuota + change;
          acc[token] = {
            balance: quotaAfter,
            token,
          };
        }

        return acc;
      },
      {},
    );
    return {
      desiredQuota,
      quotaDecrease: Object.values(quotaDecrease),
      quotaIncrease: Object.values(quotaIncrease),
    };
  }

  private static getSingleQuotaChange(
    token: string,
    unsafeMaxQuotaIncrease: bigint,
    props: CalcQuotaUpdateProps,
  ) {
    const { isActive = false } = props.quotas[token] || {};
    const { quota: unsafeInitialQuota = 0n } = props.initialQuotas[token] || {};

    if (!isActive) {
      return undefined;
    }

    // min(debt,assetAmountInUnderlying*LT)*(1+buffer)
    const assetAfter = props.assetsAfterUpdate[token];
    const { amountInTarget = 0n } = assetAfter || {};
    const lt = props.liquidationThresholds[token] || 0n;
    const maxQuotaIncrease = this.roundUpQuota(unsafeMaxQuotaIncrease);
    const initialQuota = this.roundUpQuota(unsafeInitialQuota);

    const defaultQuota = this.calcDefaultQuota({
      lt,
      quotaReserve: props.quotaReserve,
      amount: amountInTarget,
    });

    const unsafeQuotaChange = this.roundUpQuota(defaultQuota - initialQuota);
    const quotaChange =
      unsafeQuotaChange > 0
        ? BigIntMath.min(maxQuotaIncrease, unsafeQuotaChange)
        : initialQuota !== 0n &&
          BigIntMath.abs(unsafeQuotaChange) >= initialQuota
        ? MIN_INT96
        : unsafeQuotaChange;

    const correctIncrease =
      assetAfter && props.allowedToObtain[token] && quotaChange > 0;
    const correctDecrease =
      assetAfter && props.allowedToSpend[token] && quotaChange < 0;

    if (correctIncrease || correctDecrease) {
      return {
        balance: quotaChange,
        token,
      };
    }

    return undefined;
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
  }: CalcRelativeBaseBorrowRateProps) {
    return debt * BigInt(baseRateWithFee) * assetAmountInUnderlying;
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

    // effectiveDebt = Debt - underlyingBalance*LTunderlying
    const ltUnderlying = liquidationThresholds[underlyingTokenLC] || 0n;
    const effectiveDebt =
      ((debt - (underlyingBalance * ltUnderlying) / PERCENTAGE_FACTOR) * WAD) /
      10n ** BigInt(underlyingDecimals);

    const targetTokenLC = targetToken.toLowerCase();
    const [, targetDecimals = 18] = extractTokenData(targetTokenLC);
    const { balance: targetBalance = 0n } = assets[targetTokenLC] || {};
    const effectiveTargetBalance =
      (targetBalance * WAD) / 10n ** BigInt(targetDecimals);

    const lpLT = liquidationThresholds[targetTokenLC] || 0n;

    if (targetBalance <= 0n || lpLT <= 0n) return 0n;

    // priceTarget = effectiveDebt / (lpLT*targetBalance)
    return (
      (effectiveDebt * PRICE_DECIMALS * PERCENTAGE_FACTOR) /
      (effectiveTargetBalance * lpLT)
    );
  }
}
