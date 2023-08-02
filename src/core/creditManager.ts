import { ethers, Signer } from "ethers";

import { TxParser } from "../parsers/txParser";
import { MultiCall } from "../pathfinder/core";
import {
  ChartsCreditManagerPayload,
  CreditManagerDataPayload,
} from "../payload/creditManager";
import { tokenSymbolByAddress } from "../tokens/token";
import {
  ICreditFacade__factory,
  ICreditManager,
  ICreditManager__factory,
} from "../types";
import { toBigInt } from "../utils/formatter";
import {
  ADDRESS_0X0,
  LEVERAGE_DECIMALS,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
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
  readonly minAmount: bigint;
  readonly maxAmount: bigint;
  readonly maxLeverageFactor: number; // for V1 only
  readonly availableLiquidity: bigint;
  readonly collateralTokens: Array<string> = [];
  readonly supportedTokens: Record<string, true> = {};
  readonly adapters: Record<string, string>;
  readonly liquidationThresholds: Record<string, bigint>;
  readonly version: number;
  readonly creditFacade: string; // V2 only: address of creditFacade
  readonly creditConfigurator: string; // V2 only: address of creditFacade
  readonly isDegenMode: boolean; // V2 only: true if contract is in Degen mode
  readonly degenNFT: string; // V2 only: degenNFT, address(0) if not in degen mode
  readonly isIncreaseDebtForbidden: boolean; // V2 only: true if increasing debt is forbidden
  readonly forbiddenTokenMask: bigint; // V2 only: mask which forbids some particular tokens
  readonly maxEnabledTokensLength: number;

  readonly feeInterest: number;
  readonly feeLiquidation: number;
  readonly liquidationDiscount: number;
  readonly feeLiquidationExpired: number;
  readonly liquidationDiscountExpired: number;

  readonly totalDebt:
    | { currentTotalDebt: bigint; totalDebtLimit: bigint }
    | undefined;

  readonly isPaused: boolean = false;

  constructor(payload: CreditManagerDataPayload) {
    this.address = payload.addr.toLowerCase();
    this.underlyingToken = payload.underlying.toLowerCase();
    this.pool = payload.pool.toLowerCase();

    this.isWETH = payload.isWETH;
    this.canBorrow = payload.canBorrow;

    this.maxEnabledTokensLength = payload.maxEnabledTokensLength;

    this.borrowRate = Number(
      (toBigInt(payload.borrowRate || 0) *
        (toBigInt(payload.feeInterest || 0) + PERCENTAGE_FACTOR) *
        PERCENTAGE_DECIMALS) /
        RAY,
    );

    this.minAmount = toBigInt(payload.minAmount || 0);
    this.maxAmount = toBigInt(payload.maxAmount || 0);

    this.maxLeverageFactor = Number(toBigInt(payload.maxLeverageFactor || 0));

    this.availableLiquidity = toBigInt(payload.availableLiquidity || 0);

    payload.collateralTokens.forEach(t => {
      const tLc = t.toLowerCase();

      this.collateralTokens.push(tLc);
      this.supportedTokens[tLc] = true;
    });

    this.adapters = payload.adapters.reduce<Record<string, string>>(
      (acc, { allowedContract, adapter }) => ({
        ...acc,
        [allowedContract.toLowerCase()]: adapter.toLowerCase(),
      }),
      {},
    );

    this.liquidationThresholds = payload.liquidationThresholds.reduce<
      Record<string, bigint>
    >((acc, threshold, index) => {
      const address = payload.collateralTokens[index];

      if (address) acc[address.toLowerCase()] = toBigInt(threshold || 0);

      return acc;
    }, {});

    this.version = payload.version;
    this.creditFacade = payload.creditFacade.toLowerCase();
    this.creditConfigurator = payload.creditConfigurator.toLowerCase();
    this.isDegenMode = payload.isDegenMode;
    this.degenNFT = payload.degenNFT.toLowerCase();
    this.isIncreaseDebtForbidden = payload.isIncreaseDebtForbidden;
    this.forbiddenTokenMask = toBigInt(payload.forbiddenTokenMask || 0);

    this.feeInterest = payload.feeInterest;
    this.feeLiquidation = payload.feeLiquidation;
    this.liquidationDiscount = payload.liquidationDiscount;
    this.feeLiquidationExpired = payload.feeLiquidationExpired;
    this.liquidationDiscountExpired = payload.liquidationDiscountExpired;

    this.totalDebt = payload.totalDebt
      ? {
          totalDebtLimit: toBigInt(payload.totalDebt.totalDebtLimit),
          currentTotalDebt: toBigInt(payload.totalDebt.currentTotalDebt),
        }
      : undefined;

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
    amount: bigint,
  ): MultiCall {
    if (this.version === 1)
      throw new Error("Multicall is eligible only for version 2");
    return {
      target: this.creditFacade,
      callData: ICreditFacade__factory.createInterface().encodeFunctionData(
        "addCollateral",
        [accountAddress, tokenAddress, amount],
      ),
    };
  }

  encodeIncreaseDebt(amount: bigint): MultiCall {
    if (this.version === 1)
      throw new Error("Multicall is eligible only for version 2");
    return {
      target: this.creditFacade,
      callData: ICreditFacade__factory.createInterface().encodeFunctionData(
        "increaseDebt",
        [amount],
      ),
    };
  }

  encodeDecreaseDebt(amount: bigint): MultiCall {
    if (this.version === 1)
      throw new Error("Multicall is eligible only for version 2");
    return {
      target: this.creditFacade,
      callData: ICreditFacade__factory.createInterface().encodeFunctionData(
        "decreaseDebt",
        [amount],
      ),
    };
  }

  validateOpenAccount(collateral: bigint, debt: bigint): true {
    return this.version === 1
      ? this.validateOpenAccountV1(collateral, debt)
      : this.validateOpenAccountV2(debt);
  }

  protected validateOpenAccountV1(collateral: bigint, debt: bigint): true {
    if (collateral < this.minAmount)
      throw new OpenAccountError("amountLessMin", this.minAmount);

    if (collateral > this.maxAmount)
      throw new OpenAccountError("amountGreaterMax", this.maxAmount);

    const leverage = Number((debt * LEVERAGE_DECIMALS) / collateral);

    if (!leverage || leverage < 0)
      throw new OpenAccountError("wrongLeverage", 0n);

    if (leverage > this.maxLeverageFactor)
      throw new OpenAccountError(
        "leverageGreaterMax",
        toBigInt(this.maxLeverageFactor || 0),
      );

    if (debt > this.availableLiquidity)
      throw new OpenAccountError(
        "insufficientPoolLiquidity",
        toBigInt(this.availableLiquidity || 0),
      );

    return true;
  }

  protected validateOpenAccountV2(debt: bigint): true {
    if (debt < this.minAmount)
      throw new OpenAccountError("amountLessMin", this.minAmount);

    if (debt > this.maxAmount)
      throw new OpenAccountError("amountGreaterMax", this.maxAmount);

    if (debt > this.availableLiquidity)
      throw new OpenAccountError(
        "insufficientPoolLiquidity",
        this.availableLiquidity,
      );

    if (
      this.totalDebt &&
      debt > this.totalDebt.totalDebtLimit - this.totalDebt.currentTotalDebt
    )
      throw new OpenAccountError(
        "insufficientDebtLimit",
        this.availableLiquidity,
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

  readonly minAmount: bigint;
  readonly maxAmount: bigint;
  readonly maxLeverageFactor: number; // for V1 only
  readonly availableLiquidity: bigint;
  readonly version: number;

  readonly feeInterest: number;
  readonly feeLiquidation: number;
  readonly feeLiquidationExpired: number;

  readonly openedAccountsCount: number;
  readonly totalOpenedAccounts: number;
  readonly totalClosedAccounts: number;
  readonly totalRepaidAccounts: number;
  readonly totalLiquidatedAccounts: number;

  readonly totalBorrowed: bigint;
  readonly totalBorrowedOld: bigint;
  readonly totalBorrowedChange: number;

  readonly totalRepaid: bigint;

  readonly totalProfit: bigint;
  readonly totalProfitOld: bigint;
  readonly pnlChange: number;
  readonly totalLosses: bigint;
  readonly totalLossesOld: bigint;

  readonly totalBorrowedInUSD: number;
  readonly totalLossesInUSD: number;
  readonly totalProfitInUSD: number;
  readonly totalRepaidInUSD: number;
  readonly availableLiquidityInUSD: number;
  readonly openedAccountsCountChange: number;
  readonly totalOpenedAccountsChange: number;
  readonly totalClosedAccountsChange: number;
  readonly totalLiquidatedAccountsChange: number;

  readonly liquidationThresholds: Record<string, bigint>;

  constructor(payload: ChartsCreditManagerPayload) {
    this.id = (payload.addr || "").toLowerCase();
    this.address = (payload.addr || "").toLowerCase();
    this.underlyingToken = (payload.underlyingToken || "").toLowerCase();
    this.pool = (payload.poolAddress || "").toLowerCase();
    this.version = payload.version || 2;
    this.isWETH = payload.isWeth || false;

    this.borrowRate = Number(
      (toBigInt(payload.borrowRate || 0) *
        (toBigInt(payload.feeInterest || 0) + PERCENTAGE_FACTOR) *
        PERCENTAGE_DECIMALS) /
        RAY,
    );
    this.borrowRateOld = Number(
      (toBigInt(payload.borrowRateOld || 0) *
        (toBigInt(payload.feeInterest || 0) + PERCENTAGE_FACTOR) *
        PERCENTAGE_DECIMALS) /
        RAY,
    );
    this.borrowRateChange = Number(
      toBigInt(payload.borrowRate10kBasis || 0) * PERCENTAGE_DECIMALS,
    );

    this.maxLeverageFactor = payload.maxLeverageFactor || 0;

    this.feeInterest = payload.feeInterest || 0;
    this.feeLiquidation = payload.feeLiquidation || 0;
    this.feeLiquidationExpired = payload.feeLiquidationExpired || 0;

    this.minAmount = toBigInt(payload.minAmount || 0);
    this.maxAmount = toBigInt(payload.maxAmount || 0);

    this.availableLiquidity = toBigInt(payload.availableLiquidity || 0);
    this.availableLiquidityInUSD = payload.availableLiquidityInUSD || 0;

    this.liquidationThresholds = Object.fromEntries(
      Object.entries(payload.liquidityThresholds || {}).map(([t, tr]) => [
        t.toLowerCase(),
        BigInt(tr),
      ]),
    );

    this.totalBorrowed = toBigInt(payload.totalBorrowed || 0);
    this.totalBorrowedOld = toBigInt(payload.totalBorrowedBIOld || 0);
    this.totalBorrowedInUSD = payload.totalBorrowedInUSD || 0;
    this.totalBorrowedChange = Number(
      toBigInt(payload.totalBorrowedBI10kBasis || 0) * PERCENTAGE_DECIMALS,
    );

    this.totalLosses = toBigInt(payload.totalLosses || 0);
    this.totalLossesOld = toBigInt(payload.totalLossesOld || 0);
    this.totalLossesInUSD = payload.totalLossesInUSD || 0;

    this.totalRepaid = toBigInt(payload.totalRepaid || 0);
    this.totalRepaidInUSD = payload.totalRepaidInUSD || 0;

    this.totalProfit = toBigInt(payload.totalProfit || 0);
    this.totalProfitOld = toBigInt(payload.totalProfitOld || 0);
    this.totalProfitInUSD = payload.totalProfitInUSD || 0;
    this.pnlChange = Number(
      toBigInt(payload.pnl10kBasis || 0) * PERCENTAGE_DECIMALS,
    );

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
