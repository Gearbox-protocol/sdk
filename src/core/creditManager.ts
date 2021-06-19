import { BigNumber, ethers } from "ethers";
import {
  ICreditManager,
  StableCreditManager,
  TraderCreditManager,
} from "../types";
import { formatBN } from "../utils/formatter";
import {
  HEALTH_FACTOR_MIN_AFTER_UPDATE,
  LIQUIDATION_DISCOUNTED_SUM,
  PERCENTAGE_FACTOR,
  RAY,
} from "./constants";
import {
  CreditManagerDataPayload,
  CreditManagerStatPayload,
} from "../payload/creditManager";

export class CreditManagerData {
  public readonly id: string;
  public readonly address: string;
  public readonly kind: "trade" | "stable";
  public readonly underlyingToken: string;
  public readonly isWETH: boolean;
  public readonly canBorrow: boolean;
  public readonly borrowRate: number;
  public readonly minAmount: BigNumber;
  public readonly maxAmount: BigNumber;
  public readonly maxLeverageFactor: number;
  public readonly availableLiquidity: BigNumber;
  public readonly allowedTokens: Array<string>;
  public readonly allowedContracts: Array<string>;
  public readonly hasAccount: boolean;

  constructor(payload: CreditManagerDataPayload) {
    this.id = payload.addr;
    this.address = payload.addr;

    const kind = payload.kind?.startsWith("0x")
      ? ethers.utils.parseBytes32String(payload.kind)
      : payload.kind;
    this.kind = kind === "trade" ? "trade" : "stable";
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
    this.allowedContracts = payload.allowedContracts || [];
    this.hasAccount = payload.hasAccount || false;
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

export class CreditManagerDataExtended extends CreditManagerData {
  public readonly contractETH: ICreditManager;
  private _traderManager?: TraderCreditManager;
  private _stableManager?: StableCreditManager;

  constructor(payload: CreditManagerDataPayload, contractETH: ICreditManager) {
    super(payload);
    this.contractETH = contractETH;
  }

  get traderManager(): TraderCreditManager | undefined {
    return this._traderManager;
  }

  setTraderManager(value: TraderCreditManager) {
    this._traderManager = value;
  }

  get stableManager(): StableCreditManager | undefined {
    return this._stableManager;
  }

  set setStableManager(value: StableCreditManager) {
    this._stableManager = value;
  }
}

export function calcMaxIncreaseBorrow(
  healthFactor?: number,
  borrowAmountPlusInterest?: BigNumber,
  maxLeverageFactor?: number
): BigNumber {
  if (!healthFactor || !borrowAmountPlusInterest || !maxLeverageFactor)
    return BigNumber.from(0);

  const minHealthFactor =
    (LIQUIDATION_DISCOUNTED_SUM * (maxLeverageFactor + 1)) / maxLeverageFactor;

  const result = borrowAmountPlusInterest
    .mul(healthFactor - HEALTH_FACTOR_MIN_AFTER_UPDATE)
    .div(minHealthFactor - LIQUIDATION_DISCOUNTED_SUM);
  return result.isNegative() ? BigNumber.from(0) : result;
}

export function calcHealthFactorAfter(
  healthFactor: number | undefined,
  borrowAmountPlusInterest: BigNumber | undefined,
  additional: BigNumber
): number {
  if (!healthFactor || !borrowAmountPlusInterest) return 0;
  return borrowAmountPlusInterest
    .mul(healthFactor)
    .add(additional.mul(LIQUIDATION_DISCOUNTED_SUM))
    .div(borrowAmountPlusInterest.add(additional))
    .toNumber();
}

export class CreditManagerStat extends CreditManagerData {
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
