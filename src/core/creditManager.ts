import {
  ADDRESS_0X0,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  RAY,
  toBigInt,
  tokenSymbolByAddress,
} from "@gearbox-protocol/sdk-gov";
import { Address, encodeFunctionData } from "viem";

import { TxParser } from "../parsers/txParser";
import { MultiCall } from "../pathfinder/core";
import {
  ChartsCreditManagerPayload,
  CreditManagerDataPayload,
  QuotaInfo,
} from "../payload/creditManager";
import { LinearModel } from "../payload/pool";
import {
  iConvexV1BaseRewardPoolAdapterAbi,
  iCreditFacadeV3MulticallAbi,
} from "../types";

export type CreditManagerType = "universal" | "trade" | "farm" | "restaking";

export class CreditManagerData {
  readonly address: Address;
  readonly type: CreditManagerType;
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
  readonly tier: number;

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
  readonly adapters: Record<Address, Address> = {};
  readonly contractsByAdapter: Record<Address, Address> = {};
  readonly liquidationThresholds: Record<Address, bigint>;
  readonly quotas: Record<Address, QuotaInfo>;
  readonly interestModel: LinearModel;

  constructor(payload: CreditManagerDataPayload) {
    this.address = payload.addr.toLowerCase() as Address;
    this.underlyingToken = payload.underlying.toLowerCase() as Address;
    this.type = CreditManagerData.getType(payload.name || "");
    this.name = payload.name;
    this.pool = payload.pool.toLowerCase() as Address;
    this.tier = CreditManagerData.getTier(payload.name);
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
      const adaptertLc = a.adapter.toLowerCase() as Address;

      this.adapters[contractLc] = adaptertLc;
      this.contractsByAdapter[adaptertLc] = contractLc;
    });

    this.liquidationThresholds = payload.liquidationThresholds.reduce<
      CreditManagerData["liquidationThresholds"]
    >((acc, threshold, index) => {
      const address = payload.collateralTokens[index];
      if (address) acc[address.toLowerCase() as Address] = threshold;
      return acc;
    }, {});

    this.quotas = payload.quotas.reduce<CreditManagerData["quotas"]>(
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

    this.interestModel = {
      interestModel: payload.lirm.interestModel.toLowerCase() as Address,
      U_1: BigInt(payload.lirm.U_1),
      U_2: BigInt(payload.lirm.U_2),
      R_base: BigInt(payload.lirm.R_base),
      R_slope1: BigInt(payload.lirm.R_slope1),
      R_slope2: BigInt(payload.lirm.R_slope2),
      R_slope3: BigInt(payload.lirm.R_slope3),
      version: Number(payload?.lirm?.version),
      isBorrowingMoreU2Forbidden: payload?.lirm?.isBorrowingMoreU2Forbidden,
    };

    payload.collateralTokens.forEach(t => {
      const tLc = t.toLowerCase() as Address;

      const zeroLt = this.liquidationThresholds[tLc] === 0n;
      const quotaNotActive = this.quotas[tLc]?.isActive === false;

      const allowed = !zeroLt && !quotaNotActive;
      if (allowed) this.usableTokens[tLc] = true;

      this.collateralTokens.push(tLc);
      this.supportedTokens[tLc] = true;
    });

    TxParser.addCreditManager(this.address, this.version);
    if (!!this.creditFacade && this.creditFacade !== ADDRESS_0X0) {
      TxParser.addCreditFacade(
        this.creditFacade,
        tokenSymbolByAddress[this.underlyingToken],
        this.version,
      );

      TxParser.addAdapters(
        payload.adapters.map(a => ({
          adapter: a.adapter,
          contract: a.targetContract,
        })),
      );
    }
  }

  get id(): Address {
    return this.address;
  }

  isQuoted(token: Address) {
    return !!this.quotas[token];
  }

  encodeAddCollateralV3(tokenAddress: Address, amount: bigint): MultiCall {
    return {
      target: this.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV3MulticallAbi,
        functionName: "addCollateral",
        args: [tokenAddress, amount],
      }),
    };
  }

  encodeAddCollateralWithPermitV3(
    tokenAddress: Address,
    amount: bigint,
    deadline: bigint,
    v: number,
    r: Address,
    s: Address,
  ): MultiCall {
    return {
      target: this.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV3MulticallAbi,
        functionName: "addCollateralWithPermit",
        args: [tokenAddress, amount, deadline, v, r, s],
      }),
    };
  }

  encodeIncreaseDebtV3(amount: bigint): MultiCall {
    return {
      target: this.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV3MulticallAbi,
        functionName: "increaseDebt",
        args: [amount],
      }),
    };
  }

  encodeDecreaseDebtV3(amount: bigint): MultiCall {
    return {
      target: this.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV3MulticallAbi,
        functionName: "decreaseDebt",
        args: [amount],
      }),
    };
  }

  encodeEnableTokenV3(token: Address): MultiCall {
    return {
      target: this.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV3MulticallAbi,
        functionName: "enableToken",
        args: [token],
      }),
    };
  }

  encodeDisableTokenV3(token: Address): MultiCall {
    return {
      target: this.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV3MulticallAbi,
        functionName: "disableToken",
        args: [token],
      }),
    };
  }

  encodeUpdateQuotaV3(
    token: Address,
    quotaChange: bigint,
    minQuota: bigint,
  ): MultiCall {
    return {
      target: this.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV3MulticallAbi,
        functionName: "updateQuota",
        args: [token, quotaChange, minQuota],
      }),
    };
  }

  encodeWithdrawCollateralV3(
    token: Address,
    amount: bigint,
    to: Address,
  ): MultiCall {
    return {
      target: this.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV3MulticallAbi,
        functionName: "withdrawCollateral",
        args: [token, amount, to],
      }),
    };
  }

  static withdrawAllAndUnwrap_Convex(
    address: Address,
    claim: boolean,
  ): MultiCall {
    return {
      target: address,
      callData: encodeFunctionData({
        abi: iConvexV1BaseRewardPoolAdapterAbi,
        functionName: "withdrawDiffAndUnwrap",
        args: [1n, claim],
      }),
    };
  }

  encodeOnDemandPriceUpdateV3(
    token: Address,
    reserve: boolean,
    data: Address,
  ): MultiCall {
    return {
      target: this.creditFacade,
      callData: encodeFunctionData({
        abi: iCreditFacadeV3MulticallAbi,
        functionName: "onDemandPriceUpdate",
        args: [token, reserve, data],
      }),
    };
  }

  static getTier(name: string): number {
    const DEFAULT_TIER = 99;
    const l = name.split(" ") || [];

    const index = l.findIndex(w => w.toLowerCase() === "tier");
    if (index < 0) return DEFAULT_TIER;

    const number = l[index + 1];

    const n = Number(number || DEFAULT_TIER);
    return Number.isNaN(n) ? DEFAULT_TIER : n;
  }

  static getType(name: string): CreditManagerType {
    const [identity = ""] = name.split(" ") || [];
    const lc = identity.toLowerCase();

    if (lc === "farm") return "farm";
    if (lc === "trade") return "trade";
    if (lc === "restaking") return "restaking";

    return "universal";
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
  readonly tier: number;

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
    this.tier = CreditManagerData.getTier(payload.name || "");

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
