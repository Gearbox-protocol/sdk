import { BigNumber, ethers, Signer } from "ethers";

import {
  CreditManagerDataPayload,
  CreditManagerStatPayload
} from "../payload/creditManager";

import { IAppCreditManager, IAppCreditManager__factory } from "../types";
import { ICreditFacade__factory } from "../typesV2";

import { MultiCall } from "./multicall";
import {
  PERCENTAGE_FACTOR,
  RAY,
  UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD,
  LEVERAGE_DECIMALS
} from "./constants";
import { OpenAccountError } from "./errors";

export class CreditManagerData {
  public readonly id: string;
  public readonly address: string;
  public readonly underlyingToken: string;
  public readonly isWETH: boolean;
  public readonly canBorrow: boolean;
  public readonly borrowRate: number;
  public readonly minAmount: BigNumber;
  public readonly maxAmount: BigNumber;
  public readonly maxLeverageFactor: number; // for V1 only
  public readonly availableLiquidity: BigNumber;
  public readonly allowedTokens: Array<string>;
  public readonly adapters: Record<string, string>;

  public readonly liquidationThresholds: Record<string, BigNumber>;
  public readonly version: number;
  public readonly creditFacade: string; // V2 only: address of creditFacade
  public readonly isDegenMode: boolean; // V2 only: true if contract is in Degen mode
  public readonly degenNFT: string; // V2 only: degenNFT, address(0) if not in degen mode
  public readonly isIncreaseDebtForbidden: boolean; // V2 only: true if increasing debt is forbidden
  public readonly forbiddenTokenMask: BigNumber; // V2 only: mask which forbids some particular tokens

  constructor(payload: CreditManagerDataPayload) {
    this.id = payload.addr;
    this.address = payload.addr;

    this.underlyingToken = payload.underlying;

    this.isWETH = payload.isWETH;
    this.canBorrow = payload.canBorrow;

    this.borrowRate =
      payload.borrowRate.mul(PERCENTAGE_FACTOR).mul(100).div(RAY).toNumber() /
      PERCENTAGE_FACTOR;
    this.minAmount = payload.minAmount;
    this.maxAmount = payload.maxAmount;

    this.maxLeverageFactor = payload.maxLeverageFactor.toNumber();
    this.availableLiquidity = payload.availableLiquidity;

    this.allowedTokens = payload.collateralTokens;
    this.adapters = payload.adapters.reduce<Record<string, string>>(
      (acc, { allowedContract, adapter }) => ({
        ...acc,
        [allowedContract]: adapter
      }),
      {}
    );

    this.liquidationThresholds = payload.liquidationThresholds.reduce<
      Record<string, BigNumber>
    >((acc, threshold, index) => {
      const address = payload.collateralTokens[index];

      if (address) acc[address.toLowerCase()] = threshold;

      return acc;
    }, {});
    this.version = payload.version;
    this.creditFacade = payload.creditFacade;
    this.isDegenMode = payload.isDegenMode;
    this.degenNFT = payload.degenNFT;
    this.isIncreaseDebtForbidden = payload.isIncreaseDebtForbidden;
    this.forbiddenTokenMask = payload.forbiddenTokenMask;
  }

  contractToAdapter(contractAddress: string): string | undefined {
    return this.adapters[contractAddress];
  }

  encodeAddCollateral(
    accountAddress: string,
    tokenAddress: string,
    amount: BigNumber
  ): MultiCall {
    if (this.version !== 2)
      throw new Error("Multicall is eligible only for version 2");
    return {
      target: this.creditFacade,
      callData: ICreditFacade__factory.createInterface().encodeFunctionData(
        "addCollateral",
        [accountAddress, tokenAddress, amount]
      )
    };
  }

  encodeIncreaseDebt(amount: BigNumber): MultiCall {
    if (this.version !== 2)
      throw new Error("Multicall is eligible only for version 2");
    return {
      target: this.creditFacade,
      callData: ICreditFacade__factory.createInterface().encodeFunctionData(
        "increaseDebt",
        [amount]
      )
    };
  }

  encodeDecreaseDebt(amount: BigNumber): MultiCall {
    if (this.version !== 2)
      throw new Error("Multicall is eligible only for version 2");
    return {
      target: this.creditFacade,
      callData: ICreditFacade__factory.createInterface().encodeFunctionData(
        "decreaseDebt",
        [amount]
      )
    };
  }

  validateOpenAccount(totalAmount: BigNumber, leverage: number): true {
    if (totalAmount.lt(this.minAmount))
      throw new OpenAccountError("amountLessMin", this.minAmount);

    if (totalAmount.gt(this.maxAmount))
      throw new OpenAccountError("amountGreaterMax", this.maxAmount);

    if (leverage > this.maxLeverageFactor)
      throw new OpenAccountError(
        "leverageGreaterMax",
        BigNumber.from(this.maxLeverageFactor)
      );

    if (
      totalAmount
        .mul(leverage)
        .div(LEVERAGE_DECIMALS)
        .gt(this.availableLiquidity)
    )
      throw new OpenAccountError(
        "insufficientPoolLiquidity",
        BigNumber.from(this.availableLiquidity)
      );

    return true;
  }

  getContractETH(
    signer: Signer | ethers.providers.Provider
  ): IAppCreditManager {
    return IAppCreditManager__factory.connect(this.address, signer);
  }

  get isPaused(): boolean {
    return false;
  }
}

export function calcMaxIncreaseBorrow(
  healthFactor: number,
  borrowAmountPlusInterest: BigNumber,
  maxLeverageFactor: number
): BigNumber {
  const healthFactorPercentage = Math.floor(healthFactor * PERCENTAGE_FACTOR);

  const minHealthFactor = Math.floor(
    (UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD * (maxLeverageFactor + 100)) /
      maxLeverageFactor
  );

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
