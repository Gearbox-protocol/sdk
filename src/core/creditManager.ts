import { BigNumber, ethers, Signer } from "ethers";

import { TxParser } from "../parsers/txParser";
import { MultiCall } from "../pathfinder/core";
import {
  ChartsCreditManagerPayload,
  CreditManagerDataPayload,
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
  ADDRESS_0X0,
  LEVERAGE_DECIMALS,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  PRICE_DECIMALS,
  RAY,
} from "./constants";
import { OpenAccountError } from "./errors";

export class CreditManagerData {
  readonly address: string;
  readonly underlyingToken: string;
  readonly pool: string;
  readonly isWETH: boolean;
  readonly canBorrow: boolean;
  readonly borrowRate: number;
  readonly minAmount: BigNumber;
  readonly maxAmount: BigNumber;
  readonly maxLeverageFactor: number; // for V1 only
  readonly availableLiquidity: BigNumber;
  readonly collateralTokens: Array<string>;
  readonly adapters: Record<string, string>;
  readonly liquidationThresholds: Record<string, BigNumber>;
  readonly version: number;
  readonly creditFacade: string; // V2 only: address of creditFacade
  readonly creditConfigurator: string; // V2 only: address of creditFacade
  readonly isDegenMode: boolean; // V2 only: true if contract is in Degen mode
  readonly degenNFT: string; // V2 only: degenNFT, address(0) if not in degen mode
  readonly isIncreaseDebtForbidden: boolean; // V2 only: true if increasing debt is forbidden
  readonly forbiddenTokenMask: BigNumber; // V2 only: mask which forbids some particular tokens
  readonly maxEnabledTokensLength: number;

  readonly feeInterest: number;
  readonly feeLiquidation: number;
  readonly liquidationDiscount: number;
  readonly feeLiquidationExpired: number;
  readonly liquidationDiscountExpired: number;

  readonly isPaused: boolean = false;

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

    TxParser.addCreditManager(this.address, this.version);
    if (this.creditFacade !== "" && this.creditFacade !== ADDRESS_0X0) {
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

export class ChartsCreditManagerData {
  readonly id: string;
  readonly address: string;
  readonly underlyingToken: string;
  readonly pool: string;
  readonly isWETH: boolean;

  readonly borrowRate: number;
  readonly borrowRateOld: number;
  readonly borrowRateChange: number;

  readonly minAmount: BigNumber;
  readonly maxAmount: BigNumber;
  readonly maxLeverageFactor: number; // for V1 only
  readonly availableLiquidity: BigNumber;
  readonly version: number;

  readonly feeInterest: number;
  readonly feeLiquidation: number;
  readonly feeLiquidationExpired: number;

  readonly openedAccountsCount: number;
  readonly totalOpenedAccounts: number;
  readonly totalClosedAccounts: number;
  readonly totalRepaidAccounts: number;
  readonly totalLiquidatedAccounts: number;

  readonly totalBorrowed: BigNumber;
  readonly totalBorrowedOld: BigNumber;
  readonly totalBorrowedChange: number;

  readonly totalRepaid: BigNumber;

  readonly totalProfit: BigNumber;
  readonly totalProfitOld: BigNumber;
  readonly pnlChange: number;
  readonly totalLosses: BigNumber;
  readonly totalLossesOld: BigNumber;

  readonly totalBorrowedInUSD: number;
  readonly totalLossesInUSD: number;
  readonly totalProfitInUSD: number;
  readonly totalRepaidInUSD: number;
  readonly availableLiquidityInUSD: number;
  readonly openedAccountsCountChange: number;
  readonly totalOpenedAccountsChange: number;
  readonly totalClosedAccountsChange: number;
  readonly totalLiquidatedAccountsChange: number;

  readonly liquidationThresholds: Record<string, BigNumber>;

  constructor(payload: ChartsCreditManagerPayload) {
    this.id = (payload.addr || "").toLowerCase();
    this.address = (payload.addr || "").toLowerCase();
    this.underlyingToken = (payload.underlyingToken || "").toLowerCase();
    this.pool = (payload.poolAddress || "").toLowerCase();
    this.version = payload.version || 2;
    this.isWETH = payload.isWeth || false;

    this.borrowRate = BigNumber.from(payload.borrowRate || 0)
      .mul(payload.feeInterest + PERCENTAGE_FACTOR)
      .mul(PERCENTAGE_DECIMALS)
      .div(RAY)
      .toNumber();
    this.borrowRateOld = BigNumber.from(payload.borrowRateOld || 0)
      .mul(payload.feeInterest + PERCENTAGE_FACTOR)
      .mul(PERCENTAGE_DECIMALS)
      .div(RAY)
      .toNumber();
    this.borrowRateChange =
      (payload.borrowRate10kBasis || 0) * PERCENTAGE_DECIMALS;

    this.maxLeverageFactor = BigNumber.from(
      payload.maxLeverageFactor || 0,
    ).toNumber();

    this.feeInterest = payload.feeInterest || 0;
    this.feeLiquidation = payload.feeLiquidation || 0;
    this.feeLiquidationExpired = payload.feeLiquidationExpired || 0;

    this.minAmount = BigNumber.from(payload.minAmount || 0);
    this.maxAmount = BigNumber.from(payload.maxAmount || 0);

    this.availableLiquidity = BigNumber.from(payload.availableLiquidity || 0);
    this.availableLiquidityInUSD = payload.availableLiquidityInUSD || 0;

    this.liquidationThresholds = Object.fromEntries(
      Object.entries(payload.liquidityThresholds || {}).map(([t, tr]) => [
        t.toLowerCase(),
        BigNumber.from(tr),
      ]),
    );

    this.totalBorrowed = BigNumber.from(payload.totalBorrowed || 0);
    this.totalBorrowedOld = BigNumber.from(payload.totalBorrowedBIOld || 0);
    this.totalBorrowedInUSD = payload.totalBorrowedInUSD || 0;
    this.totalBorrowedChange =
      (payload.totalBorrowedBI10kBasis || 0) * PERCENTAGE_DECIMALS;

    this.totalLosses = BigNumber.from(payload.totalLosses || 0);
    this.totalLossesOld = BigNumber.from(payload.totalLossesOld || 0);
    this.totalLossesInUSD = payload.totalLossesInUSD || 0;

    this.totalRepaid = BigNumber.from(payload.totalRepaid || 0);
    this.totalRepaidInUSD = payload.totalRepaidInUSD || 0;

    this.totalProfit = BigNumber.from(payload.totalProfit || 0);
    this.totalProfitOld = BigNumber.from(payload.totalProfitOld || 0);
    this.totalProfitInUSD = payload.totalProfitInUSD || 0;
    this.pnlChange = (payload.pnl10kBasis || 0) * PERCENTAGE_DECIMALS;

    this.openedAccountsCount = payload.openedAccountsCount || 0;
    this.openedAccountsCountChange = payload.openedAccountsCountChange || 0;

    this.totalOpenedAccounts = payload.totalOpenedAccounts || 0;
    this.totalOpenedAccountsChange = payload.totalOpenedAccountsChange || 0;

    this.totalClosedAccounts = payload.totalClosedAccounts || 0;
    this.totalClosedAccountsChange = payload.totalClosedAccountsChange || 0;

    this.totalRepaidAccounts = payload.totalRepaidAccounts || 0;

    this.totalLiquidatedAccounts = payload.totalLiquidatedAccounts || 0;
    this.totalLiquidatedAccountsChange =
      payload.totalLiquidatedAccountsChange || 0;
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
