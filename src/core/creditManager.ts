import {
  ADDRESS_0X0,
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  RAY,
  toBigInt,
  tokenSymbolByAddress,
} from "@gearbox-protocol/sdk-gov";

import { TxParser } from "../parsers/txParser";
import { MultiCall } from "../pathfinder/core";
import {
  ChartsCreditManagerPayload,
  CreditManagerDataPayload,
  QuotaInfo,
} from "../payload/creditManager";
import { LinearModel } from "../payload/pool";
import {
  IConvexV1BaseRewardPoolAdapter__factory,
  ICreditFacadeV2Extended__factory,
  ICreditFacadeV3Multicall__factory,
} from "../types";
import { Asset } from "./assets";
import { PoolData, PoolType } from "./pool";

export class CreditManagerData {
  readonly address: string;
  readonly type: PoolType;
  readonly underlyingToken: string;
  readonly pool: string;
  readonly creditFacade: string; // V2 only: address of creditFacade
  readonly creditConfigurator: string; // V2 only: address of creditFacade
  readonly degenNFT: string; // V2 only: degenNFT, address(0) if not in degen mode
  readonly isDegenMode: boolean;
  readonly version: number;
  readonly isPaused: boolean;
  readonly forbiddenTokenMask: bigint; // V2 only: mask which forbids some particular tokens
  readonly maxEnabledTokensLength: number;
  readonly name: string;

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

  readonly collateralTokens: Array<string> = [];
  readonly supportedTokens: Record<string, true> = {};
  readonly adapters: Record<string, string>;
  readonly liquidationThresholds: Record<string, bigint>;
  readonly quotas: Record<string, QuotaInfo>;
  readonly interestModel: LinearModel;

  constructor(payload: CreditManagerDataPayload) {
    this.address = payload.addr.toLowerCase();
    this.underlyingToken = payload.underlying.toLowerCase();
    this.type = PoolData.getPoolType(payload.name || "");
    this.name = payload.name;
    this.pool = payload.pool.toLowerCase();
    this.creditFacade = payload.creditFacade.toLowerCase();
    this.creditConfigurator = payload.creditConfigurator.toLowerCase();
    this.degenNFT = payload.degenNFT.toLowerCase();
    this.isDegenMode = payload.isDegenMode;
    this.version = payload.cfVersion?.toNumber();
    this.isPaused = payload.isPaused;
    this.forbiddenTokenMask = toBigInt(payload.forbiddenTokenMask);
    this.maxEnabledTokensLength = payload.maxEnabledTokensLength;

    this.baseBorrowRate = Number(
      (toBigInt(payload.baseBorrowRate) *
        (toBigInt(payload.feeInterest) + PERCENTAGE_FACTOR) *
        PERCENTAGE_DECIMALS) /
        RAY,
    );

    this.minDebt = toBigInt(payload.minDebt);
    this.maxDebt = toBigInt(payload.maxDebt);
    this.availableToBorrow = toBigInt(payload.availableToBorrow);
    this.totalDebt = toBigInt(payload.totalDebt);
    this.totalDebtLimit = toBigInt(payload.totalDebtLimit);

    this.feeInterest = payload.feeInterest;
    this.feeLiquidation = payload.feeLiquidation;
    this.liquidationDiscount = payload.liquidationDiscount;
    this.feeLiquidationExpired = payload.feeLiquidationExpired;
    this.liquidationDiscountExpired = payload.liquidationDiscountExpired;

    payload.collateralTokens.forEach(t => {
      const tLc = t.toLowerCase();

      this.collateralTokens.push(tLc);
      this.supportedTokens[tLc] = true;
    });

    this.adapters = Object.fromEntries(
      payload.adapters.map(a => [
        a.targetContract.toLowerCase(),
        a.adapter.toLowerCase(),
      ]),
    );

    this.liquidationThresholds = payload.liquidationThresholds.reduce<
      Record<string, bigint>
    >((acc, threshold, index) => {
      const address = payload.collateralTokens[index];
      if (address) acc[address.toLowerCase()] = toBigInt(threshold);
      return acc;
    }, {});

    this.quotas = Object.fromEntries(
      payload.quotas.map(q => [
        q.token.toLowerCase(),
        {
          token: q.token.toLowerCase(),
          rate: Number(toBigInt(q.rate) * PERCENTAGE_DECIMALS),
          quotaIncreaseFee: q.quotaIncreaseFee,
          totalQuoted: toBigInt(q.totalQuoted),
          limit: toBigInt(q.limit),
          isActive: q.isActive,
        },
      ]),
    );

    this.interestModel = {
      interestModel: payload.lirm.interestModel.toLowerCase(),
      U_1: payload.lirm.U_1,
      U_2: payload.lirm.U_2,
      R_base: payload.lirm.R_base,
      R_slope1: payload.lirm.R_slope1,
      R_slope2: payload.lirm.R_slope2,
      R_slope3: payload.lirm.R_slope3,
      version: payload?.lirm?.version?.toNumber(),
      isBorrowingMoreU2Forbidden: payload?.lirm?.isBorrowingMoreU2Forbidden,
    };

    TxParser.addCreditManager(this.address, this.version);
    if (this.creditFacade !== "" && this.creditFacade !== ADDRESS_0X0) {
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

  get id(): string {
    return this.address;
  }

  isQuoted(token: string) {
    return !!this.quotas[token];
  }

  encodeAddCollateralV2(tokenAddress: string, amount: bigint): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV2Extended__factory.createInterface().encodeFunctionData(
          "addCollateral",
          [tokenAddress, amount],
        ),
    };
  }
  encodeAddCollateralV3(tokenAddress: string, amount: bigint): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV3Multicall__factory.createInterface().encodeFunctionData(
          "addCollateral",
          [tokenAddress, amount],
        ),
    };
  }

  encodeAddCollateralWithPermitV3(
    tokenAddress: string,
    amount: bigint,
    deadline: bigint,
    v: bigint | number,
    r: string,
    s: string,
  ): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV3Multicall__factory.createInterface().encodeFunctionData(
          "addCollateralWithPermit",
          [tokenAddress, amount, deadline, v, r, s],
        ),
    };
  }

  encodeIncreaseDebtV2(amount: bigint): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV2Extended__factory.createInterface().encodeFunctionData(
          "increaseDebt",
          [amount],
        ),
    };
  }
  encodeIncreaseDebtV3(amount: bigint): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV3Multicall__factory.createInterface().encodeFunctionData(
          "increaseDebt",
          [amount],
        ),
    };
  }

  encodeDecreaseDebtV2(amount: bigint): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV2Extended__factory.createInterface().encodeFunctionData(
          "decreaseDebt",
          [amount],
        ),
    };
  }
  encodeDecreaseDebtV3(amount: bigint): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV3Multicall__factory.createInterface().encodeFunctionData(
          "decreaseDebt",
          [amount],
        ),
    };
  }

  encodeEnableTokenV2(token: string): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV2Extended__factory.createInterface().encodeFunctionData(
          "enableToken",
          [token],
        ),
    };
  }
  encodeEnableTokenV3(token: string): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV3Multicall__factory.createInterface().encodeFunctionData(
          "enableToken",
          [token],
        ),
    };
  }

  encodeDisableTokenV2(token: string): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV2Extended__factory.createInterface().encodeFunctionData(
          "disableToken",
          [token],
        ),
    };
  }
  encodeDisableTokenV3(token: string): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV3Multicall__factory.createInterface().encodeFunctionData(
          "disableToken",
          [token],
        ),
    };
  }

  encodeRevertIfReceivedLessThanV2(assets: Array<Asset>): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV2Extended__factory.createInterface().encodeFunctionData(
          "revertIfReceivedLessThan",
          [assets],
        ),
    };
  }

  encodeUpdateQuotaV3(
    token: string,
    quotaChange: bigint,
    minQuota: bigint,
  ): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV3Multicall__factory.createInterface().encodeFunctionData(
          "updateQuota",
          [token, quotaChange, minQuota],
        ),
    };
  }

  encodeWithdrawCollateralV3(
    token: string,
    amount: bigint,
    to: string,
  ): MultiCall {
    return {
      target: this.creditFacade,
      callData:
        ICreditFacadeV3Multicall__factory.createInterface().encodeFunctionData(
          "withdrawCollateral",
          [token, amount, to],
        ),
    };
  }

  static withdrawAllAndUnwrap_Convex(
    address: string,
    claim: boolean,
  ): MultiCall {
    return {
      target: address,
      callData:
        IConvexV1BaseRewardPoolAdapter__factory.createInterface().encodeFunctionData(
          "withdrawDiffAndUnwrap",
          [1, claim],
        ),
    };
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
