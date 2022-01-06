import { BigNumber } from "ethers";
import { IAppCreditManager } from "../types";
import { formatBN } from "../utils/formatter";
import {
  PERCENTAGE_FACTOR,
  RAY,
  UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD,
} from "./constants";
import {
  CreditManagerDataPayload,
  CreditManagerStatPayload,
} from "../payload/creditManager";

export class CreditManagerData {
  public readonly id: string;
  public readonly address: string;
  public readonly underlyingToken: string;
  public readonly isWETH: boolean;
  public readonly canBorrow: boolean;
  public readonly borrowRate: number;
  public readonly minAmount: BigNumber;
  public readonly maxAmount: BigNumber;
  public readonly maxLeverageFactor: number;
  public readonly availableLiquidity: BigNumber;
  public readonly allowedTokens: Array<string>;
  public readonly adapters: Record<string, string> = {};
  public readonly contractETH?: IAppCreditManager;

  constructor(
    payload: CreditManagerDataPayload,
    contractETH?: IAppCreditManager
  ) {
    this.id = payload.addr;
    this.address = payload.addr;

    this.underlyingToken = payload.underlyingToken || "";
    this.isWETH = payload.isWETH || false;
    this.canBorrow = payload.canBorrow || false;
    this.borrowRate =
      BigNumber.from(payload.borrowRate || 0)
        .mul(PERCENTAGE_FACTOR)
        .mul(100)
        .div(RAY)
        .toNumber() / PERCENTAGE_FACTOR;
    this.minAmount = BigNumber.from(payload.minAmount || 0);
    this.maxAmount = BigNumber.from(payload.maxAmount || 0);
    this.maxLeverageFactor = BigNumber.from(
      payload.maxLeverageFactor || 0
    ).toNumber();
    this.availableLiquidity = BigNumber.from(payload.availableLiquidity || 0);
    this.allowedTokens = payload.allowedTokens || [];
    payload.adapters?.forEach((a) => {
      this.adapters[a.allowedContract] = a.adapter;
    });

    this.contractETH = contractETH;
  }

  validateOpenAccount(
    balance: BigNumber,
    decimals: number,
    amount_BN: BigNumber,
    leverage: number
  ): string | null {
    if (balance.lt(amount_BN)) return "Insufficient funds";

    if (amount_BN.lt(this.minAmount))
      return `Amount is less than minimal (${formatBN(
        this.minAmount,
        decimals
      )})`;

    if (amount_BN.gt(this.maxAmount))
      return `Amount is greater than maximum (${formatBN(
        this.maxAmount,
        decimals
      )})`;

    if (leverage > this.maxLeverageFactor) return `Leverage is bigger than max`;

    if (amount_BN.mul(leverage).div(100).gt(this.availableLiquidity))
      return "Insufficient liquidity in the pool";

    return null;
  }
}

export function calcMaxIncreaseBorrow(
  healthFactor: number | undefined,
  borrowAmountPlusInterest?: BigNumber,
  maxLeverageFactor?: number
): BigNumber {
  if (!healthFactor || !borrowAmountPlusInterest || !maxLeverageFactor)
    return BigNumber.from(0);

  const healthFactorPercentage = Math.floor(healthFactor * PERCENTAGE_FACTOR);

  const minHealthFactor = Math.floor(
    (UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD * (maxLeverageFactor + 100)) /
      maxLeverageFactor
  );

  console.log("HFPer", healthFactorPercentage);
  console.log("minHealthFactor", minHealthFactor);

  const result = borrowAmountPlusInterest
    .mul(healthFactorPercentage - minHealthFactor)
    .div(minHealthFactor - UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD);
  return result.isNegative() ? BigNumber.from(0) : result;
}

export function calcHealthFactorAfterIncreasingBorrow(
  healthFactor: number | undefined,
  borrowAmountPlusInterest: BigNumber | undefined,
  additional: BigNumber
): number {
  if (!healthFactor || !borrowAmountPlusInterest) return 0;

  const healthFactorPercentage = Math.floor(healthFactor * PERCENTAGE_FACTOR);

  return (
    borrowAmountPlusInterest
      .mul(healthFactorPercentage)
      .add(additional.mul(UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD))
      .div(borrowAmountPlusInterest.add(additional))
      .toNumber() / PERCENTAGE_FACTOR
  );
}

export function calcHealthFactorAfterAddingCollateral(
  healthFactor: number | undefined,
  borrowAmountPlusInterest: BigNumber | undefined,
  additionalCollateral: BigNumber
): number {
  if (!healthFactor || !borrowAmountPlusInterest) return 0;

  const healthFactorPercentage = Math.floor(healthFactor * PERCENTAGE_FACTOR);

  return (
    borrowAmountPlusInterest
      .mul(healthFactorPercentage)
      .add(additionalCollateral.mul(UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD))
      .div(borrowAmountPlusInterest)
      .toNumber() / PERCENTAGE_FACTOR
  );
}

export class CreditManagerStat extends CreditManagerData {
  public readonly uniqueUsers: number;
  public readonly openedAccountsCount: number;
  public readonly totalOpenedAccounts: number;
  public readonly totalClosedAccounts: number;
  public readonly totalRepaidAccounts: number;
  public readonly totalLiquidatedAccounts: number;
  public readonly totalBorrowed: BigNumber;
  public readonly cumulativeBorrowed: BigNumber;
  public readonly totalRepaid: BigNumber;
  public readonly totalProfit: BigNumber;
  public readonly totalLosses: BigNumber;

  constructor(payload: CreditManagerStatPayload) {
    super(payload);
    this.uniqueUsers = payload.uniqueUsers;
    this.openedAccountsCount = payload.openedAccountsCount || 0;
    this.totalOpenedAccounts = payload.totalOpenedAccounts || 0;
    this.totalClosedAccounts = payload.totalClosedAccounts || 0;
    this.totalRepaidAccounts = payload.totalRepaidAccounts || 0;
    this.totalLiquidatedAccounts = payload.totalLiquidatedAccounts || 0;
    this.totalBorrowed = BigNumber.from(payload.totalBorrowed || 0);
    this.cumulativeBorrowed = BigNumber.from(payload.cumulativeBorrowed || 0);
    this.totalRepaid = BigNumber.from(payload.totalRepaid || 0);
    this.totalProfit = BigNumber.from(payload.totalProfit || 0);
    this.totalLosses = BigNumber.from(payload.totalLosses || 0);
  }
}
