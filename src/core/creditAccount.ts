import { isTokenWithAPY, LpTokensAPY } from "../apy";
import { CreditAccountDataPayload } from "../payload/creditAccount";
import { decimals } from "../tokens/decimals";
import { tokenSymbolByAddress } from "../tokens/token";
import { TokenData } from "../tokens/tokenData";
import { toBigInt, toSignificant } from "../utils/formatter";
import { PriceUtils } from "../utils/price";
import { Asset } from "./assets";
import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  RAY,
  WAD,
  WAD_DECIMALS_POW,
} from "./constants";
import { CreditManagerData } from "./creditManager";
import { PriceOracleData } from "./priceOracle";

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
  readonly inUse: boolean;
  readonly creditManager: string;
  readonly underlyingToken: string;

  readonly since: number;
  readonly cumulativeIndexAtOpen: bigint;
  readonly borrowedAmount: bigint;
  readonly borrowedAmountPlusInterestAndFees: bigint;

  readonly borrowedAmountPlusInterest: bigint;
  readonly totalValue: bigint;
  healthFactor: number;
  readonly borrowRate: number;
  isDeleting: boolean;
  readonly enabledTokenMask: bigint;
  readonly version: number = 1;

  readonly collateralTokens: Array<string> = [];
  readonly allTokens: Array<string> = [];
  readonly forbiddenTokens: Array<string> = [];

  readonly balances: Record<string, bigint> = {};
  readonly allBalances: Record<string, bigint> = {};

  /// V1 Artifacts
  readonly repayAmount: bigint;
  readonly liquidationAmount: bigint;
  readonly canBeClosed: boolean;

  constructor(payload: CreditAccountDataPayload) {
    this.addr = payload.addr.toLowerCase();
    this.borrower = payload.borrower.toLowerCase();
    this.inUse = payload.inUse;
    this.creditManager = payload.creditManager.toLowerCase();
    this.underlyingToken = payload.underlying.toLowerCase();

    this.since = Number(toBigInt(payload.since || 0));
    this.cumulativeIndexAtOpen = toBigInt(payload.cumulativeIndexAtOpen || 0);

    this.borrowedAmount = toBigInt(payload.borrowedAmount || 0);
    this.borrowedAmountPlusInterest = toBigInt(
      payload.borrowedAmountPlusInterest || 0,
    );
    this.borrowedAmountPlusInterestAndFees = toBigInt(
      payload.borrowedAmountPlusInterestAndFees || 0,
    );

    this.totalValue = toBigInt(payload.totalValue || 0);
    this.healthFactor = payload.healthFactor.toNumber();
    this.borrowRate = Number(
      (toBigInt(payload.borrowRate || 0) *
        PERCENTAGE_FACTOR *
        PERCENTAGE_DECIMALS) /
        RAY,
    );
    payload.balances.forEach(b => {
      const tokenLC = b.token.toLowerCase();
      if (b.isAllowed) {
        this.balances[tokenLC] = toBigInt(b.balance || 0);
        this.collateralTokens.push(tokenLC);
      } else {
        this.forbiddenTokens.push(tokenLC);
      }

      this.allBalances[tokenLC] = toBigInt(b.balance || 0);
      this.allTokens.push(tokenLC);
    });

    this.enabledTokenMask = toBigInt(payload.enabledTokenMask || 0);
    this.isDeleting = false;
    this.version = payload.version;

    this.repayAmount = toBigInt(payload.repayAmount || 0);
    this.liquidationAmount = toBigInt(payload.liquidationAmount || 0);
    this.canBeClosed = payload.canBeClosed;
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

  calcBorrowAmountPlusInterestRate(currentCumulativeIndex: bigint): bigint {
    return (
      (this.borrowedAmount * currentCumulativeIndex) /
      this.cumulativeIndexAtOpen
    );
  }

  isForbidden(token: string) {
    return this.balances[token] === undefined;
  }

  updateHealthFactor(
    creditManager: CreditManagerData,
    currentCumulativeIndex: bigint,
    priceOracle: PriceOracleData,
  ) {
    const twvUSDValue = this.collateralTokens
      .filter((_, num) =>
        CreditAccountData.isTokenEnabled(num, this.enabledTokenMask),
      )
      .map(
        token =>
          priceOracle.convertToUSD(this.balances[token], token) *
          creditManager.liquidationThresholds[token],
      )
      .reduce((a, b) => a + b);

    this.healthFactor = Number(
      priceOracle.convertFromUSD(twvUSDValue, this.underlyingToken) /
        this.calcBorrowAmountPlusInterestRate(currentCumulativeIndex),
    );
  }

  static isTokenEnabled(index: number, enabledTokenMask: bigint) {
    return ((2n ** BigInt(index)) & enabledTokenMask) !== 0n;
  }

  static calcMaxIncreaseBorrow(
    healthFactor: number,
    borrowAmountPlusInterest: bigint,
    maxLeverageFactor: number,
    underlyingLT: number,
    minHf = PERCENTAGE_FACTOR,
  ): bigint {
    const minHealthFactor =
      maxLeverageFactor > 0
        ? Math.floor(
            (underlyingLT * (maxLeverageFactor + Number(LEVERAGE_DECIMALS))) /
              maxLeverageFactor,
          )
        : Number(minHf);

    const result =
      (borrowAmountPlusInterest * BigInt(healthFactor - minHealthFactor)) /
      BigInt(minHealthFactor - underlyingLT);
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
