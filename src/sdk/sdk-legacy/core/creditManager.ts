import type { Address } from "viem";

import {
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  RAY,
} from "../../constants/index.js";
import { toBigInt } from "../../utils/index.js";
import type {
  ChartsCreditManagerPayload,
  CreditManagerDataPayload,
  QuotaInfo,
} from "../payload/creditManager.js";

export class CreditManagerData_Legacy {
  readonly address: Address;
  readonly underlyingToken: Address;
  readonly pool: Address;
  readonly creditFacade: Address; // V2 only: address of creditFacade
  readonly creditConfigurator: Address; // V2 only: address of creditFacade
  readonly degenNFT: Address; // V2 only: degenNFT, address(0) if not in degen mode
  readonly isDegenMode: boolean;
  readonly version: number;
  readonly isPaused: boolean;
  readonly forbiddenTokenMask: bigint; // V2 only: mask which forbids some particular tokens
  readonly isBorrowingForbidden: boolean;
  readonly maxEnabledTokensLength: number;
  readonly name: string;
  readonly marketConfigurator: Address;

  readonly baseBorrowRate: number;

  readonly minDebt: bigint;
  readonly maxDebt: bigint;
  readonly availableToBorrow: bigint;
  readonly totalDebt: bigint;
  readonly totalDebtLimit: bigint;

  readonly feeInterest: number;
  readonly feeLiquidation: number;
  readonly liquidationDiscount: number;
  readonly feeLiquidationExpired: number;
  readonly liquidationDiscountExpired: number;

  readonly collateralTokens: Array<Address> = [];
  readonly supportedTokens: Record<Address, true> = {};
  readonly usableTokens: Record<Address, true> = {};
  readonly forbiddenTokens: Record<Address, true> = {};
  readonly adapters: Record<Address, CreditManagerDataPayload["adapters"][1]> =
    {};
  readonly contractsByAdapter: Record<Address, Address> = {};
  readonly liquidationThresholds: Record<Address, bigint>;
  readonly quotas: Record<Address, QuotaInfo>;

  constructor(payload: CreditManagerDataPayload) {
    this.address = payload.addr.toLowerCase() as Address;
    this.underlyingToken = payload.underlying.toLowerCase() as Address;
    this.name = payload.name;
    this.pool = payload.pool.toLowerCase() as Address;
    this.creditFacade = payload.creditFacade.toLowerCase() as Address;
    this.creditConfigurator =
      payload.creditConfigurator.toLowerCase() as Address;
    this.degenNFT = payload.degenNFT.toLowerCase() as Address;
    this.isDegenMode = payload.isDegenMode;
    this.version = Number(payload.cfVersion);
    this.isPaused = payload.isPaused;
    this.forbiddenTokenMask = payload.forbiddenTokenMask;
    this.maxEnabledTokensLength = Number(payload.maxEnabledTokensLength);
    this.isBorrowingForbidden = payload.isBorrowingForbidden;
    this.marketConfigurator =
      payload.marketConfigurator.toLowerCase() as Address;

    this.baseBorrowRate = Number(
      (payload.baseBorrowRate *
        (BigInt(payload.feeInterest) + PERCENTAGE_FACTOR) *
        PERCENTAGE_DECIMALS) /
        RAY,
    );

    this.minDebt = payload.minDebt;
    this.maxDebt = payload.maxDebt;
    this.availableToBorrow = payload.availableToBorrow;
    this.totalDebt = payload.totalDebt;
    this.totalDebtLimit = payload.totalDebtLimit;

    this.feeInterest = Number(payload.feeInterest);
    this.feeLiquidation = Number(payload.feeLiquidation);
    this.liquidationDiscount = Number(payload.liquidationDiscount);
    this.feeLiquidationExpired = Number(payload.feeLiquidationExpired);
    this.liquidationDiscountExpired = Number(
      payload.liquidationDiscountExpired,
    );

    payload.adapters.forEach(a => {
      const contractLc = a.targetContract.toLowerCase() as Address;
      const adapterLc = a.address.toLowerCase() as Address;

      this.adapters[contractLc] = {
        address: adapterLc,
        contractType: a.contractType,
        version: a.version,
        name: a.name,
        targetContract: contractLc,
      };
      this.contractsByAdapter[adapterLc] = contractLc;
    });

    this.liquidationThresholds = payload.liquidationThresholds.reduce<
      CreditManagerData_Legacy["liquidationThresholds"]
    >((acc, [token, threshold]) => {
      acc[token.toLowerCase() as Address] = BigInt(threshold);
      return acc;
    }, {});

    this.quotas = payload.quotas.reduce<CreditManagerData_Legacy["quotas"]>(
      (acc, q) => {
        const addressLc = q.token.toLowerCase() as Address;

        acc[addressLc] = {
          token: addressLc,
          rate: BigInt(q.rate) * PERCENTAGE_DECIMALS,
          quotaIncreaseFee: BigInt(q.quotaIncreaseFee),
          totalQuoted: q.totalQuoted,
          limit: q.limit,
          isActive: q.isActive,
        };

        return acc;
      },
      {},
    );

    payload.collateralTokens.forEach((t, index) => {
      const tLc = t.toLowerCase() as Address;

      const mask = BigInt(1 << index);
      const isForbidden = (mask & payload.forbiddenTokenMask) !== 0n;

      const zeroLt = this.liquidationThresholds[tLc] === 0n;
      const quotaNotActive = this.quotas[tLc]?.isActive === false;

      const allowed = !zeroLt && !quotaNotActive && !isForbidden;
      if (allowed) this.usableTokens[tLc] = true;

      if (isForbidden) this.forbiddenTokens[tLc] = true;

      this.collateralTokens.push(tLc);
      this.supportedTokens[tLc] = true;
    });
  }

  isQuoted(token: Address) {
    return !!this.quotas[token];
  }

  isForbidden(token: Address) {
    return !!this.forbiddenTokens[token];
  }
}

export class ChartsCreditManagerData {
  readonly address: Address;
  readonly underlyingToken: Address;
  readonly configurator: Address;
  readonly creditFacade: Address;
  readonly pool: Address;
  readonly version: number;
  readonly name: string;

  readonly borrowRate: number;
  readonly borrowRateOld: number;
  readonly borrowRateChange: number;

  readonly minAmount: bigint;
  readonly maxAmount: bigint;
  readonly maxLeverageFactor: number; // for V1 only
  readonly availableLiquidity: bigint;

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
  readonly totalDebtLimit: bigint;

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
    this.address = (payload.addr || "").toLowerCase() as Address;
    this.underlyingToken = (
      payload.underlyingToken || ""
    ).toLowerCase() as Address;
    this.configurator = (payload.configurator || "").toLowerCase() as Address;
    this.creditFacade = (payload.creditFacade || "").toLowerCase() as Address;
    this.pool = (payload.poolAddress || "").toLowerCase() as Address;
    this.version = payload.version || 2;
    this.name = payload.name || "";

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

    this.liquidationThresholds = Object.entries(
      payload.liquidityThresholds || {},
    ).reduce<Record<string, bigint>>((acc, [t, tr]) => {
      acc[t.toLowerCase()] = BigInt(tr);

      return acc;
    }, {});

    this.totalBorrowed = toBigInt(payload.totalBorrowed || 0);
    this.totalBorrowedOld = toBigInt(payload.totalBorrowedBIOld || 0);
    this.totalBorrowedInUSD = payload.totalBorrowedInUSD || 0;
    this.totalBorrowedChange = Number(
      toBigInt(payload.totalBorrowedBI10kBasis || 0) * PERCENTAGE_DECIMALS,
    );
    this.totalDebtLimit = toBigInt(payload.totalDebtLimit || 0);

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
