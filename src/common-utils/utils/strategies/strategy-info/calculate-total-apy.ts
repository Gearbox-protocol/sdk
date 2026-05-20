import type { Address } from "viem";
import { PERCENTAGE_FACTOR } from "../../../../sdk/constants/math.js";
import type { Asset } from "../../../../sdk/router/types.js";
import type { TokenData } from "../../../charts/token-data.js";
import { EMPTY_ADDRESS } from "../../constants.js";
import { calcOverallAPY } from "../../creditAccount/calc-overall-apy.js";
import { isApyWithPointsException } from "../tokens/is-apy-with-points-exception.js";
import type { QuotaInfo } from "../types/strategy-data.js";
export interface TotalAPY {
  overallAPY: number | undefined | null;
  overallAPYBigInt: bigint | undefined | null;
  overallAPYStatus:
    | "loading"
    | "notEnoughFarmAssets"
    | "noAPY"
    | "calculated"
    | "pointsNoAPY"
    | "negativeForPoints";
}

export interface CalculateTotalAPYProps {
  caAssets: Asset[];
  lpAPY: Record<Address, number> | undefined;
  pointsInfo: Pick<{ address: Address }, "address"> | undefined;
  isValueTo?: boolean;
  debt: bigint | undefined;
  totalValue: bigint | undefined;
  effectiveBorrowRate: number;
  showAPY: boolean;

  prices: Record<Address, bigint>;
  quotaRates: Record<Address, Pick<QuotaInfo, "isActive" | "rate">>;
  quotas: Record<Address, Asset>;
  feeInterest: number;
  underlyingToken: Address;
  tokensList: Record<Address, TokenData>;
}

export function calculateTotalAPY({
  caAssets,
  lpAPY,
  pointsInfo,
  isValueTo,
  debt,
  totalValue,
  effectiveBorrowRate,
  showAPY,

  prices,
  quotaRates,
  quotas,
  feeInterest,
  underlyingToken,
  tokensList,
}: CalculateTotalAPYProps): Omit<TotalAPY, "extraAPY"> {
  const pointsWithAPY =
    (lpAPY?.[pointsInfo?.address || EMPTY_ADDRESS] || 0) > 0;
  const pointsWithoutAPY = pointsInfo?.address && !pointsWithAPY;
  // if points without APY, show no value if it is valueFrom, show n/a if it is valueTo
  if (pointsWithoutAPY && !isApyWithPointsException(pointsInfo?.address)) {
    return isValueTo
      ? {
          overallAPY: null,
          overallAPYBigInt: null,
          overallAPYStatus: "pointsNoAPY",
        }
      : {
          overallAPY: undefined,
          overallAPYBigInt: undefined,
          overallAPYStatus: "pointsNoAPY",
        };
  }

  if (
    pointsWithAPY &&
    (debt === 0n ||
      totalValue === 0n ||
      caAssets.length === 0 ||
      effectiveBorrowRate === 0)
  ) {
    return {
      overallAPY: undefined,
      overallAPYBigInt: undefined,
      overallAPYStatus: "noAPY",
    };
  }

  if (!showAPY) {
    return {
      overallAPY: null,
      overallAPYBigInt: null,
      overallAPYStatus: "notEnoughFarmAssets",
    };
  }

  const r = calcOverallAPY({
    caAssets,
    lpAPY,
    prices,

    quotaRates,
    quotas,
    feeInterest,

    totalValue,
    debt,
    baseRateWithFee: effectiveBorrowRate,
    underlyingToken,
    tokensList,
  });

  if (r === undefined) {
    return {
      overallAPY: undefined,
      overallAPYBigInt: undefined,
      overallAPYStatus: "noAPY",
    };
  }

  const apy = Number(r) / Number(PERCENTAGE_FACTOR);

  if (
    pointsWithAPY &&
    !isApyWithPointsException(pointsInfo?.address) &&
    apy <= 0
  ) {
    return isValueTo
      ? {
          overallAPY: null,
          overallAPYBigInt: null,
          overallAPYStatus: "negativeForPoints",
        }
      : {
          overallAPY: undefined,
          overallAPYBigInt: undefined,
          overallAPYStatus: "negativeForPoints",
        };
  }

  return {
    overallAPYStatus: "calculated",
    overallAPY: apy,
    overallAPYBigInt: r,
  };
}
