import {
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  PRICE_DECIMALS_POW,
  SECONDS_PER_YEAR,
  WAD,
  WAD_DECIMALS_POW,
} from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { TokensAPYList } from "../apy";
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
  lpAPY: TokensAPYList | undefined;

  quotas: Record<Address, Asset>;
  quotaRates: Record<Address, Pick<QuotaInfo, "isActive" | "rate">>;
  feeInterest: number;

  prices: Record<Address, bigint>;

  totalValue: bigint | undefined;
  debt: bigint | undefined;
  baseRateWithFee: number;
  underlyingToken: Address;
  tokensList: Record<Address, TokenData>;
}

export interface CalcMaxLendingDebtProps {
  assets: Array<Asset>;

  prices: Record<Address, bigint>;
  liquidationThresholds: Record<Address, bigint>;
  underlyingToken: Address;
  tokensList: Record<Address, TokenData>;

  targetHF?: bigint;
}

export interface CalcHealthFactorProps {
  assets: Array<Asset>;
  quotas: Record<Address, Asset>;
  quotasInfo: Record<Address, Pick<QuotaInfo, "isActive">>;

  prices: Record<Address, bigint>;
  liquidationThresholds: Record<Address, bigint>;
  underlyingToken: Address;
  debt: bigint;
  tokensList: Record<Address, TokenData>;
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
  quotas: Record<Address, Pick<QuotaInfo, "isActive" | "token">>;
  initialQuotas: Record<Address, Pick<CaTokenBalance, "quota">>;
  liquidationThresholds: Record<Address, bigint>;
  assetsAfterUpdate: Record<Address, AssetWithAmountInTarget>;
  maxDebt: bigint;
  calcModification?: {
    type: "recommendedQuota";
    debt: bigint;
  };

  allowedToSpend: Record<Address, {}>;
  allowedToObtain: Record<Address, {}>;

  quotaReserve: bigint;
}

interface CalcQuotaUpdateReturnType {
  desiredQuota: Record<Address, Asset>;
  quotaIncrease: Array<Asset>;
  quotaDecrease: Array<Asset>;
}

export interface CalcQuotaBorrowRateProps {
  quotas: Record<Address, Asset>;
  quotaRates: Record<Address, Pick<QuotaInfo, "isActive" | "rate">>;
}

export interface CalcRelativeBaseBorrowRateProps {
  debt: bigint;
  baseRateWithFee: number;
  assetAmountInUnderlying: bigint;
}

export interface CalcAvgQuotaBorrowRateProps {
  quotas: Record<Address, Asset>;
  quotaRates: Record<Address, Pick<QuotaInfo, "isActive" | "rate">>;
}

interface LiquidationPriceProps {
  liquidationThresholds: Record<Address, bigint>;

  debt: bigint;
  underlyingToken: Address;
  targetToken: Address;
  assets: Record<Address, Asset>;
  tokensList: Record<Address, TokenData>;
}

export interface TimeToLiquidationProps {
  totalBorrowRate_debt: bigint;
  healthFactor: number;
}

const MAX_UINT16 = 65535;

export class CreditAccountData {
  readonly isSuccessful: boolean;

  readonly creditAccount: Address;
  readonly borrower: Address;
  readonly creditManager: Address;
  readonly creditFacade: Address;
  readonly underlying: Address;
  readonly expirationDate: number;
  readonly version: number;

  readonly enabledTokensMask: bigint;
  readonly healthFactor: number;
  isDeleting: boolean;

  readonly baseBorrowRateWithoutFee: number;

  readonly borrowedAmount: bigint;
  readonly accruedInterest: bigint;
  readonly accruedFees: bigint;
  readonly totalDebtUSD: bigint;
  readonly borrowedAmountPlusInterestAndFees: bigint;
  readonly debt: bigint;
  readonly totalValue: bigint;
  readonly totalValueUSD: bigint;
  readonly twvUSD: bigint;

  readonly activeBots: Record<Address, true>;

  readonly balances: Record<Address, bigint> = {};
  readonly collateralTokens: Array<Address> = [];
  readonly tokens: Record<Address, CaTokenBalance> = {};
  readonly forbiddenTokens: Record<Address, true> = {};
  readonly quotedTokens: Record<Address, true> = {};

  constructor(payload: CreditAccountDataPayload) {
    this.isSuccessful = payload.isSuccessful;

    this.creditAccount = payload.addr.toLowerCase() as Address;
    this.borrower = payload.borrower.toLowerCase() as Address;
    this.creditManager = payload.creditManager.toLowerCase() as Address;
    this.creditFacade = payload.creditFacade.toLowerCase() as Address;
    this.underlying = payload.underlying.toLowerCase() as Address;
    this.expirationDate = Number(payload.expirationDate);
    this.version = Number(payload.cfVersion);

    this.healthFactor = Number(payload.healthFactor || 0n);
    this.enabledTokensMask = payload.enabledTokensMask;
    this.isDeleting = false;

    this.borrowedAmount = payload.debt;
    this.accruedInterest = payload.accruedInterest || 0n;
    this.accruedFees = payload.accruedFees || 0n;
    this.debt = this.borrowedAmount;
    this.borrowedAmountPlusInterestAndFees =
      this.borrowedAmount + this.accruedInterest + this.accruedFees;
    this.totalDebtUSD = payload.totalDebtUSD;
    this.totalValue = payload.totalValue || 0n;
    this.totalValueUSD = payload.totalValueUSD;
    this.twvUSD = payload.twvUSD;

    this.baseBorrowRateWithoutFee = rayToNumber(
      payload.baseBorrowRate * PERCENTAGE_DECIMALS * PERCENTAGE_FACTOR,
    );

    this.activeBots = payload.activeBots.reduce<
      CreditAccountData["activeBots"]
    >((acc, b) => {
      const botLc = b.toLowerCase() as Address;
      acc[botLc] = true;
      return acc;
    }, {});

    payload.balances.forEach(b => {
      const token = b.token.toLowerCase() as Address;
      const balance: CaTokenBalance = {
        success: b.success,
        token,
        balance: b.balance,
        isForbidden: b.isForbidden,
        isEnabled: b.isEnabled,
        isQuoted: b.isQuoted,
        quota: b.quota,
        quotaRate: BigInt(b.quotaRate) * PERCENTAGE_DECIMALS,
        mask: b.mask,
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

      this.tokens[token] = balance;
    });
  }

  setDeleteInProgress(d: boolean) {
    this.isDeleting = d;
  }

  static sortBalances(
    balances: Record<Address, bigint>,
    prices: Record<Address, bigint>,
    tokens: Record<Address, TokenData>,
  ): Array<[Address, bigint]> {
    return (Object.entries(balances) as Array<[Address, bigint]>).sort(
      ([addr1, amount1], [addr2, amount2]) => {
        const addr1Lc = addr1.toLowerCase() as Address;
        const addr2Lc = addr2.toLowerCase() as Address;

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
    prices: Record<Address, bigint>,
    tokens: Record<Address, TokenData>,
  ) {
    return balances.sort(
      (
        { token: addr1, balance: amount1 },
        { token: addr2, balance: amount2 },
      ) => {
        const addr1Lc = addr1.toLowerCase() as Address;
        const addr2Lc = addr2.toLowerCase() as Address;

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
    const symbol1LC = symbol1.toLowerCase();
    const symbol2LC = symbol2.toLowerCase();

    if (symbol1LC === symbol2LC) return 0;
    return symbol1LC > symbol2LC ? 1 : -1;
  }

  static amountAbcComparator(t1: bigint, t2: bigint) {
    return t1 > t2 ? -1 : 1;
  }

  isForbidden(token: Address) {
    return !!this.forbiddenTokens[token];
  }

  isQuoted(token: Address) {
    return !!this.quotedTokens[token];
  }

  isTokenEnabled(token: Address) {
    return this.tokens[token].isEnabled;
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

  static hash(creditManager: Address, borrower: Address): string {
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
      Record<Address, Asset>
    >((acc, token) => {
      const ch = this.getSingleQuotaChange(token as Address, 0n, props);
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
      Record<Address, Asset>
    >((acc, token) => {
      const ch = this.getSingleQuotaChange(
        token as Address,
        maxQuotaIncrease,
        props,
      );
      if (ch) acc[ch.token] = ch;
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
    const maxQuotaIncrease = this.roundUpQuota(unsafeMaxQuotaIncrease);
    const initialQuota = this.roundUpQuota(unsafeInitialQuota);

    const defaultQuota =
      props.calcModification?.type === "recommendedQuota" &&
      props.calcModification.debt > 0
        ? this.calcRecommendedQuota({
            lt,
            quotaReserve: props.quotaReserve,
            amount: amountInTarget,
            debt: props.calcModification.debt,
          })
        : this.calcDefaultQuota({
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
