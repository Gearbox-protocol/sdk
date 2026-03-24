import type { Address } from "viem";

import {
  MIN_INT96,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  PRICE_DECIMALS_POW,
  SECONDS_PER_YEAR,
  WAD,
  WAD_DECIMALS_POW,
} from "../constants/index.js";
import type { Asset } from "../router/types.js";
import { BigIntMath } from "./bigintMath.js";
import { PriceUtils } from "./priceMath.js";

interface TokenDataSlice {
  symbol: string;
  decimals: number;
}

// interface QuotaInfo {
//   token: Address;
//   rate: bigint;
//   quotaIncreaseFee: bigint;
//   totalQuoted: bigint;
//   limit: bigint;
//   isActive: boolean;
// }

interface QuotaInfoIsActiveSlice {
  isActive: boolean;
}

interface QuotaInfoTokenSlice extends QuotaInfoIsActiveSlice {
  token: Address;
}

interface QuotaInfoSlice extends QuotaInfoIsActiveSlice {
  rate: bigint;
}

interface AssetWithAmountInTarget extends Asset {
  amountInTarget: bigint;
}

export interface CalcOverallAPYProps {
  caAssets: Array<Asset>;
  lpAPY: Record<Address, number> | undefined;

  quotas: Record<Address, Asset>;
  quotaRates: Record<Address, QuotaInfoSlice>;
  feeInterest: number;

  prices: Record<Address, bigint>;

  totalValue: bigint | undefined;
  debt: bigint | undefined;
  baseRateWithFee: number;
  underlyingToken: Address;
  tokensList: Record<Address, TokenDataSlice>;
}

export interface CalcMaxLendingDebtProps {
  assets: Array<Asset>;

  prices: Record<Address, bigint>;
  liquidationThresholds: Record<Address, bigint>;
  underlyingToken: Address;
  tokensList: Record<Address, TokenDataSlice>;

  targetHF?: bigint;
}

export interface CalcHealthFactorProps {
  assets: Array<Asset>;
  quotas: Record<Address, Asset>;
  quotasInfo: Record<Address, QuotaInfoIsActiveSlice>;

  prices: Record<Address, bigint>;
  liquidationThresholds: Record<Address, bigint>;
  underlyingToken: Address;
  debt: bigint;
  tokensList: Record<Address, TokenDataSlice>;
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
  quotas: Record<Address, QuotaInfoTokenSlice>;
  initialQuotas: Record<
    Address,
    {
      quota: bigint;
    }
  >;
  liquidationThresholds: Record<Address, bigint>;
  assetsAfterUpdate: Record<Address, AssetWithAmountInTarget>;
  maxDebt: bigint;
  calcModification?: {
    type: "recommendedQuota";
    debt: bigint;
  };

  allowedToSpend: Record<Address, object>;
  allowedToObtain: Record<Address, object>;

  quotaReserve: bigint;
}

interface CalcQuotaUpdateReturnType {
  desiredQuota: Record<Address, Asset>;
  quotaIncrease: Array<Asset>;
  quotaDecrease: Array<Asset>;
}

export interface CalcQuotaBorrowRateProps {
  quotas: Record<Address, Asset>;
  quotaRates: Record<Address, QuotaInfoSlice>;
}

export interface CalcRelativeBaseBorrowRateProps {
  debt: bigint;
  baseRateWithFee: number;
  assetAmountInUnderlying: bigint;
}

interface LiquidationPriceProps {
  liquidationThresholds: Record<Address, bigint>;

  debt: bigint;
  underlyingToken: Address;
  targetToken: Address;
  assets: Record<Address, Asset>;
  tokensList: Record<Address, TokenDataSlice>;
}

export interface TimeToLiquidationProps {
  totalBorrowRate_debt: bigint;
  healthFactor: number;
}

const MAX_UINT16 = 65535;

export class CreditAccountDataUtils {
  private constructor() {}

  static sortBalances(
    balances: Record<Address, bigint>,
    prices: Record<Address, bigint>,
    tokens: Record<Address, TokenDataSlice>,
  ): Array<[Address, bigint]> {
    return (Object.entries(balances) as Array<[Address, bigint]>).sort(
      ([addr1, amount1], [addr2, amount2]) => {
        return CreditAccountDataUtils.assetComparator(
          {
            token: addr1,
            balance: amount1,
          },
          {
            token: addr2,
            balance: amount2,
          },
          prices,
          prices,
          tokens,
          tokens,
        );
      },
    );
  }

  static sortAssets<T extends Asset>(
    balances: Array<T>,
    prices: Record<Address, bigint>,
    tokens: Record<Address, TokenDataSlice>,
  ) {
    return [...balances].sort((t1, t2) =>
      CreditAccountDataUtils.assetComparator(
        t1,
        t2,
        prices,
        prices,
        tokens,
        tokens,
      ),
    );
  }

  static assetComparator<T extends Asset>(
    t1: T,
    t2: T,

    prices1: Record<Address, bigint> | undefined,
    prices2: Record<Address, bigint> | undefined,

    tokens1: Record<Address, TokenDataSlice> | undefined,
    tokens2: Record<Address, TokenDataSlice> | undefined,
  ) {
    const addr1Lc = t1.token.toLowerCase() as Address;
    const addr2Lc = t2.token.toLowerCase() as Address;

    const token1 = tokens1?.[addr1Lc];
    const token2 = tokens2?.[addr2Lc];

    const price1 = prices1?.[addr1Lc] || PRICE_DECIMALS;
    const price2 = prices2?.[addr2Lc] || PRICE_DECIMALS;

    const totalPrice1 = PriceUtils.calcTotalPrice(
      price1,
      t1.balance,
      token1?.decimals,
    );
    const totalPrice2 = PriceUtils.calcTotalPrice(
      price2,
      t2.balance,
      token2?.decimals,
    );

    if (totalPrice1 === totalPrice2) {
      return t1.balance === t2.balance
        ? CreditAccountDataUtils.tokensAbcComparator(token1, token2)
        : CreditAccountDataUtils.amountAbcComparator(t1.balance, t2.balance);
    }

    return CreditAccountDataUtils.amountAbcComparator(totalPrice1, totalPrice2);
  }

  static tokensAbcComparator(t1?: TokenDataSlice, t2?: TokenDataSlice) {
    const { symbol: symbol1 = "" } = t1 || {};
    const { symbol: symbol2 = "" } = t2 || {};
    const symbol1LC = symbol1.toLowerCase();
    const symbol2LC = symbol2.toLowerCase();

    if (symbol1LC === symbol2LC) return 0;
    return symbol1LC > symbol2LC ? 1 : -1;
  }

  static amountAbcComparator(t1: bigint, t2: bigint) {
    return t1 > t2 ? -1 : 1;
  }

  static calcMaxDebtIncrease(
    healthFactor: number,
    debt: bigint,
    underlyingLT: number,
    minHf = Number(PERCENTAGE_FACTOR),
  ): bigint {
    // HF = (TWV + d*lt) / (D + d) => d = (HF*D - TWV) / (l - HF)
    // hf = TWV / D
    // HF = (TVW * D / D + d*lt) / (D + d) = (hf*D + d*lt) / (d + D) => d = D * (hf-HF) / (HF - lt)
    const result =
      (debt * BigInt(healthFactor - minHf)) / BigInt(minHf - underlyingLT);

    return BigIntMath.max(0n, result);
  }

  static calcMaxLendingDebt({
    assets,

    liquidationThresholds,
    underlyingToken,

    prices,
    tokensList,

    targetHF = PERCENTAGE_FACTOR,
  }: CalcMaxLendingDebtProps) {
    const assetsLTMoney = assets.reduce(
      (acc, { token: tokenAddress, balance: amount }) => {
        const tokenDecimals = tokensList[tokenAddress]?.decimals || 18;
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
    const underlyingDecimals = tokensList[underlyingToken]?.decimals || 18;

    // HF = TWV / D => D = TWV / HF; D = amount * price
    // Debt_max = sum(LT_i * Asset_i * price_i) / (price_underlying * HF)
    const max =
      underlyingPrice > 0
        ? (assetsLTMoney * 10n ** BigInt(underlyingDecimals)) /
          underlyingPrice /
          targetHF /
          10n ** BigInt(WAD_DECIMALS_POW - PRICE_DECIMALS_POW)
        : 0n;

    return max;
  }

  // [
  //  Sum(amount_i * price_i * apy_i - quota_i * quotaPrice * quotaRate_i * (1 + feeInterest)) -
  //  debt * debtPrice * baseRateWithFee
  // ] / (totalValue - debt) * debtPrice
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
    tokensList,
  }: CalcOverallAPYProps): bigint | undefined {
    if (
      !lpAPY ||
      !totalValue ||
      totalValue <= 0n ||
      !debt ||
      totalValue <= debt
    )
      return undefined;

    const underlyingTokenDecimals = tokensList[underlyingToken]?.decimals || 18;
    const underlyingPrice = prices[underlyingToken];

    const assetAPYMoney = caAssets.reduce(
      (acc, { token: tokenAddress, balance: amount }) => {
        const apy = lpAPY[tokenAddress] || 0;

        const tokenDecimals = tokensList[tokenAddress]?.decimals || 18;
        const price = prices[tokenAddress] || 0n;

        const money = PriceUtils.calcTotalPrice(price, amount, tokenDecimals);
        const apyMoney = money * BigInt(apy);

        const { rate: quotaAPY = 0n, isActive = false } =
          quotaRates?.[tokenAddress] || {};
        const { balance: quotaBalance = 0n } = quotas[tokenAddress] || {};

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

    const debtMoney = PriceUtils.calcTotalPrice(
      underlyingPrice || 0n,
      debt,
      underlyingTokenDecimals,
    );
    const debtAPYMoney = debtMoney * BigInt(baseRateWithFee);

    const yourAssetsMoney = PriceUtils.calcTotalPrice(
      underlyingPrice || PRICE_DECIMALS,
      totalValue - debt,
      underlyingTokenDecimals,
    );

    const apyInPercent = (assetAPYMoney - debtAPYMoney) / yourAssetsMoney;

    return apyInPercent;
  }

  static calcHealthFactor({
    assets,
    quotas,
    quotasInfo,

    liquidationThresholds,
    underlyingToken,
    debt,

    prices,
    tokensList,
  }: CalcHealthFactorProps): number {
    if (debt === 0n) return MAX_UINT16;

    const underlyingDecimals = tokensList[underlyingToken]?.decimals || 18;
    const underlyingPrice = prices[underlyingToken] || 0n;

    const assetMoney = assets.reduce(
      (acc, { token: tokenAddress, balance: amount }) => {
        const tokenDecimals = tokensList[tokenAddress]?.decimals || 18;

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

    return CreditAccountDataUtils.roundUpQuota(recommendedQuota);
  }

  static calcDefaultQuota({ amount, lt, quotaReserve }: CalcDefaultQuotaProps) {
    const recommendedBaseQuota = (amount * lt) / PERCENTAGE_FACTOR;
    const recommendedQuota =
      (recommendedBaseQuota * (PERCENTAGE_FACTOR + quotaReserve)) /
      PERCENTAGE_FACTOR;

    return CreditAccountDataUtils.roundUpQuota(recommendedQuota);
  }

  static calcQuotaUpdate(
    props: CalcQuotaUpdateProps,
  ): CalcQuotaUpdateReturnType {
    const { quotas, initialQuotas, maxDebt, allowedToSpend, allowedToObtain } =
      props;
    const quotaDecrease = Object.keys(allowedToSpend).reduce<
      Record<Address, Asset>
    >((acc, token) => {
      const ch = CreditAccountDataUtils.getSingleQuotaChange(
        token as Address,
        0n,
        props,
      );
      if (ch && ch.balance < 0) acc[ch.token] = ch;
      return acc;
    }, {});

    const quotaCap = CreditAccountDataUtils.roundUpQuota(maxDebt * 2n);
    const quotaBought = Object.values(initialQuotas).reduce(
      (sum, q) => sum + CreditAccountDataUtils.roundUpQuota(q?.quota || 0n),
      0n,
    );
    const quotaReduced = Object.values(quotaDecrease).reduce((sum, q) => {
      const quotaBalance = q.balance || 0n;
      const safeBalance =
        quotaBalance === MIN_INT96
          ? BigIntMath.neg(
              CreditAccountDataUtils.roundUpQuota(
                initialQuotas[q.token]?.quota || 0n,
              ),
            )
          : quotaBalance;

      return sum + safeBalance;
    }, 0n);
    const maxQuotaIncrease = CreditAccountDataUtils.roundUpQuota(
      BigIntMath.max(quotaCap - (quotaBought + quotaReduced), 0n),
    );

    const quotaIncrease = Object.keys(allowedToObtain).reduce<
      Record<Address, Asset>
    >((acc, token) => {
      const ch = CreditAccountDataUtils.getSingleQuotaChange(
        token as Address,
        maxQuotaIncrease,
        props,
      );
      if (ch && ch.balance > 0) acc[ch.token] = ch;
      return acc;
    }, {});

    const quotaChange = {
      ...quotaDecrease,
      ...quotaIncrease,
    };

    const desiredQuota = Object.values(quotas).reduce<Record<Address, Asset>>(
      (acc, cmQuota) => {
        const { token, isActive } = cmQuota;
        const { quota: initialQuota = 0n } = initialQuotas[token] || {};

        if (!isActive) {
          acc[token] = {
            balance: initialQuota,
            token,
          };
        } else {
          const change = quotaChange[token]?.balance || 0n;
          const quotaAfter = change === MIN_INT96 ? 0n : initialQuota + change;

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
    token: Address,
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
    const maxQuotaIncrease = CreditAccountDataUtils.roundUpQuota(
      unsafeMaxQuotaIncrease,
    );
    const initialQuota =
      CreditAccountDataUtils.roundUpQuota(unsafeInitialQuota);

    const defaultQuota =
      props.calcModification?.type === "recommendedQuota" &&
      props.calcModification.debt > 0
        ? CreditAccountDataUtils.calcRecommendedQuota({
            lt,
            quotaReserve: props.quotaReserve,
            amount: amountInTarget,
            debt: props.calcModification.debt,
          })
        : CreditAccountDataUtils.calcDefaultQuota({
            lt,
            quotaReserve: props.quotaReserve,
            amount: amountInTarget,
          });

    const unsafeQuotaChange = CreditAccountDataUtils.roundUpQuota(
      defaultQuota - initialQuota,
    );
    const quotaChange =
      unsafeQuotaChange > 0
        ? BigIntMath.min(maxQuotaIncrease, unsafeQuotaChange)
        : unsafeQuotaChange < 0 &&
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
    tokensList,
  }: LiquidationPriceProps) {
    const underlyingDecimals = tokensList[underlyingToken]?.decimals || 18;
    const { balance: underlyingBalance = 0n } = assets[underlyingToken] || {};

    // effectiveDebt = Debt - underlyingBalance*LTunderlying
    const ltUnderlying = liquidationThresholds[underlyingToken] || 0n;
    const effectiveDebt =
      ((debt - (underlyingBalance * ltUnderlying) / PERCENTAGE_FACTOR) * WAD) /
      10n ** BigInt(underlyingDecimals);

    const targetDecimals = tokensList[targetToken]?.decimals || 18;
    const { balance: targetBalance = 0n } = assets[targetToken] || {};
    const effectiveTargetBalance =
      (targetBalance * WAD) / 10n ** BigInt(targetDecimals);

    const lpLT = liquidationThresholds[targetToken] || 0n;

    if (targetBalance <= 0n || lpLT <= 0n) return 0n;

    // priceTarget = effectiveDebt / (lpLT*targetBalance)
    return (
      (effectiveDebt * PRICE_DECIMALS * PERCENTAGE_FACTOR) /
      (effectiveTargetBalance * lpLT)
    );
  }

  /**
   * Calculates the time remaining until liquidation for a credit account.
   * @returns The time remaining until liquidation in milliseconds.
   */
  static getTimeToLiquidation({
    healthFactor,
    totalBorrowRate_debt,
  }: TimeToLiquidationProps) {
    if (healthFactor <= PERCENTAGE_FACTOR || totalBorrowRate_debt === 0n)
      return null;

    // (HF - 1) / (br_D / year) or (HF - 1) * (year / br_D)
    const HF_1 = BigInt(healthFactor) - PERCENTAGE_FACTOR;
    const brPerYear =
      (BigInt(SECONDS_PER_YEAR) * PERCENTAGE_FACTOR * PERCENTAGE_DECIMALS) /
      totalBorrowRate_debt;
    return (HF_1 * brPerYear * 1000n) / PERCENTAGE_FACTOR;
  }
}
