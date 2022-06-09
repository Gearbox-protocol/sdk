import { BigNumber, ethers, Signer } from "ethers";
import { IAppCreditManager, IAppCreditManager__factory } from "../types";
import { formatBN } from "../utils/formatter";
import {
  PERCENTAGE_FACTOR,
  RAY,
  UNDERLYING_TOKEN_LIQUIDATION_THRESHOLD
} from "./constants";
import {
  CreditManagerDataPayload,
  CreditManagerStatPayload
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
  public readonly maxLeverageFactor: number; // for V1 only
  public readonly availableLiquidity: BigNumber;
  public readonly allowedTokens: Array<string>;
  public readonly adapters: Record<string, string>;

  public readonly liquidationThresholds: Array<BigNumber>;
  public readonly version: number;
  public readonly creditFacade: string; // V2 only: address of creditFacade
  public readonly isDegenMode: boolean; // V2 only: true if contract is in Degen mode
  public readonly degenNFT: string; // V2 only: degenNFT, address(0) if not in degen mode
  public readonly isIncreaseDebtForbidden: boolean; // V2 only: true if increasing debt is forbidden
  public readonly forbiddenTokenMask: BigNumber; // V2 only: mask which forbids some particular tokens

  constructor({
    addr,
    underlying = "",
    isWETH = false,
    canBorrow = false,
    borrowRate = 0,
    minAmount = 0,
    maxAmount = 0,
    maxLeverageFactor = 0,
    availableLiquidity = 0,
    collateralTokens = [],
    adapters = [],
    liquidationThresholds = [],
    version = 1,
    creditFacade = "",
    isDegenMode = false,
    degenNFT = "",
    isIncreaseDebtForbidden = false,
    forbiddenTokenMask = 0
  }: CreditManagerDataPayload) {
    this.id = addr;
    this.address = addr;

    this.underlyingToken = underlying;

    this.isWETH = isWETH;
    this.canBorrow = canBorrow;

    this.borrowRate =
      BigNumber.from(borrowRate)
        .mul(PERCENTAGE_FACTOR)
        .mul(100)
        .div(RAY)
        .toNumber() / PERCENTAGE_FACTOR;
    this.minAmount = BigNumber.from(minAmount);
    this.maxAmount = BigNumber.from(maxAmount);

    this.maxLeverageFactor = BigNumber.from(maxLeverageFactor).toNumber();
    this.availableLiquidity = BigNumber.from(availableLiquidity);

    this.allowedTokens = collateralTokens;
    this.adapters = adapters.reduce<Record<string, string>>(
      (acc, { allowedContract, adapter }) => ({
        ...acc,
        [allowedContract]: adapter
      }),
      {}
    );

    this.liquidationThresholds = liquidationThresholds.map(threshold =>
      BigNumber.from(threshold)
    );
    this.version = version;
    this.creditFacade = creditFacade;
    this.isDegenMode = isDegenMode;
    this.degenNFT = degenNFT;
    this.isIncreaseDebtForbidden = isIncreaseDebtForbidden;
    this.forbiddenTokenMask = BigNumber.from(forbiddenTokenMask);
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
