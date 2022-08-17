import { BigNumber, ethers, Signer } from "ethers";

import {
  CreditManagerDataPayload,
  CreditManagerStatPayload,
} from "../payload/creditManager";
import {
  ICreditFacade__factory,
  ICreditManager,
  ICreditManager__factory,
} from "../types";
import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  RAY,
  UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD,
} from "./constants";
import { OpenAccountError } from "./errors";
import { MultiCall } from "./multicall";

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

  public readonly isPaused: boolean = false;

  constructor(payload: CreditManagerDataPayload) {
    this.id = payload.addr.toLowerCase();
    this.address = payload.addr.toLowerCase();

    this.underlyingToken = (payload.underlying || "").toLowerCase();

    this.isWETH = payload.isWETH || false;
    this.canBorrow = payload.canBorrow || false;

    this.borrowRate =
      BigNumber.from(payload.borrowRate || 0)
        .mul(PERCENTAGE_FACTOR)
        .mul(PERCENTAGE_DECIMALS)
        .div(RAY)
        .toNumber() / PERCENTAGE_FACTOR;
    this.minAmount = BigNumber.from(payload.minAmount || 0);
    this.maxAmount = BigNumber.from(payload.maxAmount || 0);

    this.maxLeverageFactor = BigNumber.from(
      payload.maxLeverageFactor || 0,
    ).toNumber();
    this.availableLiquidity = BigNumber.from(payload.availableLiquidity || 0);

    this.allowedTokens = (payload.collateralTokens || []).map(t =>
      t.toLowerCase(),
    );
    this.adapters = (payload.adapters || []).reduce<Record<string, string>>(
      (acc, { allowedContract, adapter }) => ({
        ...acc,
        [allowedContract.toLowerCase()]: adapter.toLowerCase(),
      }),
      {},
    );

    this.liquidationThresholds = (payload.liquidationThresholds || []).reduce<
      Record<string, BigNumber>
    >((acc, threshold, index) => {
      const address = payload.collateralTokens[index];

      if (address) acc[address.toLowerCase()] = BigNumber.from(threshold);

      return acc;
    }, {});

    this.version = BigNumber.from(payload.version || 1).toNumber();
    this.creditFacade = (payload.creditFacade || "").toLowerCase();
    this.isDegenMode = payload.isDegenMode || false;
    this.degenNFT = (payload.degenNFT || "").toLowerCase();
    this.isIncreaseDebtForbidden = payload.isIncreaseDebtForbidden || false;
    this.forbiddenTokenMask = BigNumber.from(payload.forbiddenTokenMask || 0);
  }

  getContractETH(signer: Signer | ethers.providers.Provider): ICreditManager {
    return ICreditManager__factory.connect(this.address, signer);
  }

  contractToAdapter(contractAddress: string): string | undefined {
    return this.adapters[contractAddress];
  }

  encodeAddCollateral(
    accountAddress: string,
    tokenAddress: string,
    amount: BigNumber,
  ): MultiCall {
    if (this.version !== 2)
      throw new Error("Multicall is eligible only for version 2");
    return {
      target: this.creditFacade,
      callData: ICreditFacade__factory.createInterface().encodeFunctionData(
        "addCollateral",
        [accountAddress, tokenAddress, amount],
      ),
    };
  }

  encodeIncreaseDebt(amount: BigNumber): MultiCall {
    if (this.version !== 2)
      throw new Error("Multicall is eligible only for version 2");
    return {
      target: this.creditFacade,
      callData: ICreditFacade__factory.createInterface().encodeFunctionData(
        "increaseDebt",
        [amount],
      ),
    };
  }

  encodeDecreaseDebt(amount: BigNumber): MultiCall {
    if (this.version !== 2)
      throw new Error("Multicall is eligible only for version 2");
    return {
      target: this.creditFacade,
      callData: ICreditFacade__factory.createInterface().encodeFunctionData(
        "decreaseDebt",
        [amount],
      ),
    };
  }

  validateOpenAccount(collateral: BigNumber, debt: BigNumber): true {
    return this.version === 2
      ? this.validateOpenAccountV2(debt)
      : this.validateOpenAccountV1(collateral, debt);
  }

  protected validateOpenAccountV1(
    collateral: BigNumber,
    debt: BigNumber,
  ): true {
    if (collateral.lt(this.minAmount))
      throw new OpenAccountError("amountLessMin", this.minAmount);

    if (collateral.gt(this.maxAmount))
      throw new OpenAccountError("amountGreaterMax", this.maxAmount);

    const leverage = debt.mul(LEVERAGE_DECIMALS).div(collateral).toNumber();

    if (!leverage || leverage < 0)
      throw new OpenAccountError("wrongLeverage", BigNumber.from(0));

    if (leverage > this.maxLeverageFactor)
      throw new OpenAccountError(
        "leverageGreaterMax",
        BigNumber.from(this.maxLeverageFactor),
      );

    if (debt.gt(this.availableLiquidity))
      throw new OpenAccountError(
        "insufficientPoolLiquidity",
        BigNumber.from(this.availableLiquidity),
      );

    return true;
  }

  protected validateOpenAccountV2(debt: BigNumber): true {
    if (debt.lt(this.minAmount))
      throw new OpenAccountError("amountLessMin", this.minAmount);

    if (debt.gt(this.maxAmount))
      throw new OpenAccountError("amountGreaterMax", this.maxAmount);

    if (debt.gt(this.availableLiquidity))
      throw new OpenAccountError(
        "insufficientPoolLiquidity",
        BigNumber.from(this.availableLiquidity),
      );

    return true;
  }
}

export function calcMaxIncreaseBorrow(
  healthFactor: number,
  borrowAmountPlusInterest: BigNumber,
  maxLeverageFactor: number,
): BigNumber {
  const healthFactorPercentage = Math.floor(healthFactor * PERCENTAGE_FACTOR);

  const minHealthFactor = Math.floor(
    (UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD *
      (maxLeverageFactor + LEVERAGE_DECIMALS)) /
      maxLeverageFactor,
  );

  const result = borrowAmountPlusInterest
    .mul(healthFactorPercentage - minHealthFactor)
    .div(minHealthFactor - UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD);
  return result.isNegative() ? BigNumber.from(0) : result;
}

export function calcHealthFactorAfterIncreasingBorrow(
  healthFactor: number | undefined,
  borrowAmountPlusInterest: BigNumber | undefined,
  additional: BigNumber,
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
  additionalCollateral: BigNumber,
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
