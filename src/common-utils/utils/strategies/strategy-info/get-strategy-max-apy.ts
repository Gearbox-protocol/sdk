import type { Address } from "viem";
import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  toBigInt,
} from "../../../../sdk/index.js";

import { BONUS_APY_FROM_POINTS } from "../../apy/bonus-apy-from-points.js";
import { calculateEffectiveBorrowRate } from "../../apy/calculate-effective-borrow-rate.js";
import { getComplexAPYList } from "../../apy/get-complex-apy-list.js";
import { getSingleQuotaBorrowRate } from "../../apy/get-single-quota-borrow-rate.js";
import { maxAPYFormula } from "../../apy/max-apy-formula.js";
import {
  calculateMaxLeverageFactor,
  getLeverageFromFactor,
} from "../leverage/index.js";
import type { APYListSlice, CreditManagerSlice, QuotaSlice } from "./types.js";

export function getStrategyMaxAPY(
  targetToken: Address,
  cm: CreditManagerSlice | undefined,
  apyListByNetwork: Record<number, APYListSlice | undefined> | undefined,
  slippage: number,
  quotaReserve: number,
  leverageLimit: number | undefined,
) {
  if (!cm) return undefined;

  const apyRecord = getComplexAPYList(
    apyListByNetwork?.[cm.chainId]?.apyList,
    apyListByNetwork?.[cm.chainId]?.extraCollateralAPYList,
    cm.pool,
  );

  const baseRateWithFee = calculateEffectiveBorrowRate({
    underlyingTokenAddress: cm.underlyingToken,
    baseRateWithFee: cm.baseBorrowRate,
    apyList: apyRecord,
  });

  const lt = cm.liquidationThresholds[targetToken] || 0n;
  const feeInterest = cm.feeInterest;
  const tokenQuota =
    cm.quotas[targetToken] ||
    ({
      token: targetToken,
      rate: 0n,
      quotaIncreaseFee: 0n,
      totalQuoted: 0n,
      limit: 0n,
      isActive: true,
    } satisfies QuotaSlice);
  const qRate = ((tokenQuota?.rate || 0n) * lt) / PERCENTAGE_FACTOR;
  const qRate_reserve =
    (qRate * (PERCENTAGE_FACTOR + toBigInt(quotaReserve))) / PERCENTAGE_FACTOR;

  const quotaRateWithFee = getSingleQuotaBorrowRate({
    quotaRates: {
      [targetToken]: {
        ...tokenQuota,
        rate: qRate_reserve,
      },
    },
    feeInterest,
    quotas: {
      [targetToken]: {
        token: targetToken,
        balance: 1n,
      },
    },
  });

  const leverage = getLeverageFromFactor(
    calculateMaxLeverageFactor({
      targetToken,
      creditManagers: [cm],
      slippage,
      leverageLimit,
    }),
  );

  const apy = apyRecord?.[targetToken] || 0;

  const maxAPY = apyRecord
    ? maxAPYFormula({
        apy,
        leverage,
        baseRateWithFee,
        quotaRateWithFee: Number(quotaRateWithFee),
      })
    : undefined;

  const bonusAPY = BONUS_APY_FROM_POINTS[targetToken];
  const bonusAPYTotal =
    (BigInt(bonusAPY?.value || 0) * leverage) / LEVERAGE_DECIMALS;

  const totalMaxApy = (maxAPY || 0) + Number(bonusAPYTotal);

  const totalBorrowRate = baseRateWithFee + Number(quotaRateWithFee);

  return {
    totalMaxApy,
    bonusAPY,
    maxAPY: maxAPY || 0,
    maxLeverage: leverage,

    quotaRateMin: quotaRateWithFee,
    baseBorrowRate: baseRateWithFee,
    totalBorrowRate,
  };
}
