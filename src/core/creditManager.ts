import { BigNumber, ethers, Signer } from "ethers";

import { TxParser } from "../parsers/txParser";
import { MultiCall } from "../pathfinder/core";
import {
  CreditManagerDataPayload,
  CreditManagerStatPayload,
} from "../payload/creditManager";
import { decimals } from "../tokens/decimals";
import { tokenSymbolByAddress } from "../tokens/token";
import {
  ICreditFacade__factory,
  ICreditManager,
  ICreditManager__factory,
} from "../types";
import { calcTotalPrice } from "../utils/price";
import { Asset } from "./assets";
import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  RAY,
} from "./constants";
import { OpenAccountError } from "./errors";

export class CreditManagerData {
  public readonly address: string;
  public readonly underlyingToken: string;
  public readonly pool: string;
  public readonly isWETH: boolean;
  public readonly canBorrow: boolean;
  public readonly borrowRate: number;
  public readonly minAmount: BigNumber;
  public readonly maxAmount: BigNumber;
  public readonly maxLeverageFactor: number; // for V1 only
  public readonly availableLiquidity: BigNumber;
  public readonly collateralTokens: Array<string>;
  public readonly adapters: Record<string, string>;
  public readonly liquidationThresholds: Record<string, BigNumber>;
  public readonly version: number;
  public readonly creditFacade: string; // V2 only: address of creditFacade
  public readonly creditConfigurator: string; // V2 only: address of creditFacade
  public readonly isDegenMode: boolean; // V2 only: true if contract is in Degen mode
  public readonly degenNFT: string; // V2 only: degenNFT, address(0) if not in degen mode
  public readonly isIncreaseDebtForbidden: boolean; // V2 only: true if increasing debt is forbidden
  public readonly forbiddenTokenMask: BigNumber; // V2 only: mask which forbids some particular tokens
  public readonly maxEnabledTokensLength: number;

  public readonly feeInterest: number;
  public readonly feeLiquidation: number;
  public readonly liquidationDiscount: number;
  public readonly feeLiquidationExpired: number;
  public readonly liquidationDiscountExpired: number;

  public readonly isPaused: boolean = false;

  constructor(payload: CreditManagerDataPayload) {
    this.address = payload.addr.toLowerCase();
    this.underlyingToken = payload.underlying.toLowerCase();
    this.pool = payload.pool.toLowerCase();

    this.isWETH = payload.isWETH;
    this.canBorrow = payload.canBorrow;

    this.maxEnabledTokensLength = payload.maxEnabledTokensLength;

    this.borrowRate = payload.borrowRate
      .mul(payload.feeInterest + PERCENTAGE_FACTOR)
      .mul(PERCENTAGE_DECIMALS)
      .div(RAY)
      .toNumber();

    this.minAmount = payload.minAmount;
    this.maxAmount = payload.maxAmount;

    this.maxLeverageFactor = BigNumber.from(
      payload.maxLeverageFactor,
    ).toNumber();
    this.availableLiquidity = payload.availableLiquidity;

    this.collateralTokens = payload.collateralTokens.map(t => t.toLowerCase());

    this.adapters = payload.adapters.reduce<Record<string, string>>(
      (acc, { allowedContract, adapter }) => ({
        ...acc,
        [allowedContract.toLowerCase()]: adapter.toLowerCase(),
      }),
      {},
    );

    this.liquidationThresholds = payload.liquidationThresholds.reduce<
      Record<string, BigNumber>
    >((acc, threshold, index) => {
      const address = payload.collateralTokens[index];

      if (address) acc[address.toLowerCase()] = threshold;

      return acc;
    }, {});

    this.version = payload.version;
    this.creditFacade = payload.creditFacade.toLowerCase();
    this.creditConfigurator = payload.creditConfigurator.toLowerCase();
    this.isDegenMode = payload.isDegenMode;
    this.degenNFT = payload.degenNFT.toLowerCase();
    this.isIncreaseDebtForbidden = payload.isIncreaseDebtForbidden;
    this.forbiddenTokenMask = payload.forbiddenTokenMask;

    this.feeInterest = payload.feeInterest;
    this.feeLiquidation = payload.feeLiquidation;
    this.liquidationDiscount = payload.liquidationDiscount;
    this.feeLiquidationExpired = payload.feeLiquidationExpired;
    this.liquidationDiscountExpired = payload.liquidationDiscountExpired;

    if (this.creditFacade !== "") {
      TxParser.addCreditFacade(
        this.creditFacade,
        tokenSymbolByAddress[this.underlyingToken],
      );

      TxParser.addAdapters(
        payload.adapters.map(a => ({
          adapter: a.adapter,
          contract: a.allowedContract,
        })),
      );
    }
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

  get id(): string {
    return this.address;
  }
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

export interface CalcHealthFactorProps {
  assets: Array<Asset>;
  prices: Record<string, BigNumber>;
  liquidationThresholds: Record<string, BigNumber>;
  underlyingToken: string;
  borrowed: BigNumber;
}

export function calcHealthFactor({
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

      const lt =
        liquidationThresholds[tokenAddress.toLowerCase()] || BigNumber.from(0);
      const price = prices[tokenAddress.toLowerCase()] || BigNumber.from(0);

      const money = calcTotalPrice(price, amount, tokenDecimals);
      const ltMoney = money.mul(lt);

      return acc.add(ltMoney);
    },
    BigNumber.from(0),
  );

  const underlyingSymbol = tokenSymbolByAddress[underlyingToken.toLowerCase()];
  const underlyingDecimals: number | undefined = decimals[underlyingSymbol];

  const underlyingPrice =
    prices[underlyingToken.toLowerCase()] || PRICE_DECIMALS;

  const borrowedMoney = calcTotalPrice(
    underlyingPrice,
    borrowed,
    underlyingDecimals,
  );

  const hfInPercent = borrowedMoney.gt(0)
    ? assetLTMoney.div(borrowedMoney)
    : BigNumber.from(0);

  return hfInPercent.toNumber();
}
