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
import { CreditManagerDataPayload } from "../payload/creditManager";
import { ecosystemPartners, Partner, partnersByKind } from "./ecosystem";

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
      BigNumber.from(payload.borrowRate)
        .mul(PERCENTAGE_FACTOR)
        .mul(100)
        .div(RAY)
        .toNumber() / PERCENTAGE_FACTOR;
    this.minAmount = BigNumber.from(payload.minAmount);
    this.maxAmount = BigNumber.from(payload.maxAmount);
    this.maxLeverageFactor = BigNumber.from(
      payload.maxLeverageFactor
    ).toNumber();
    this.availableLiquidity = BigNumber.from(payload.availableLiquidity);
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

  getApplications(): Array<Partner> {
    const partnersId = partnersByKind[this.kind];
    return partnersId.map((id) => ecosystemPartners[id]);
  }
}

export class CreditManagerDataExtended extends CreditManagerData {
  public readonly contractETH: ICreditManager;
  public readonly traderManager?: TraderCreditManager;
  public readonly stableManager?: StableCreditManager;

  constructor(payload: CreditManagerDataPayload, contractETH: ICreditManager) {
    super(payload);
    this.contractETH = contractETH;
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
