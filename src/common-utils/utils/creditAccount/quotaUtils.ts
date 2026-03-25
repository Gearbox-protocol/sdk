import type { Address } from "viem";
import {
  type Asset,
  MIN_INT96,
  PERCENTAGE_FACTOR,
} from "../../../sdk/index.js";
import { BigIntMath } from "../bigintMath.js";
import type { AssetWithAmountInTarget, QuotaInfoTokenSlice } from "./types.js";

export interface CalcDefaultQuotaProps {
  amount: bigint;
  lt: bigint;
  quotaReserve: bigint;
}

export interface CalcRecommendedQuotaProps {
  amount: bigint;
  debt: bigint;
  lt: bigint;
  quotaReserve: bigint;
}

export interface CalcQuotaUpdateProps {
  quotas: Record<Address, QuotaInfoTokenSlice>;
  initialQuotas: Record<
    Address,
    {
      quota: bigint;
    }
  >;
  liquidationThresholds: Record<Address, bigint>;
  assetsAfterUpdate: Record<Address, AssetWithAmountInTarget>;
  maxDebt: bigint;
  calcModification?: {
    type: "recommendedQuota";
    debt: bigint;
  };

  allowedToSpend: Record<Address, object>;
  allowedToObtain: Record<Address, object>;

  quotaReserve: bigint;
}

interface CalcQuotaUpdateReturnType {
  desiredQuota: Record<Address, Asset>;
  quotaIncrease: Array<Asset>;
  quotaDecrease: Array<Asset>;
}

export function roundUpQuota(quotaChange: bigint) {
  return quotaChange !== MIN_INT96
    ? (quotaChange / PERCENTAGE_FACTOR) * PERCENTAGE_FACTOR
    : quotaChange;
}

export function calcRecommendedQuota({
  amount,
  debt,
  lt,
  quotaReserve,
}: CalcRecommendedQuotaProps) {
  const recommendedBaseQuota = BigIntMath.min(
    debt,
    (amount * lt) / PERCENTAGE_FACTOR,
  );

  const recommendedQuota =
    (recommendedBaseQuota * (PERCENTAGE_FACTOR + quotaReserve)) /
    PERCENTAGE_FACTOR;

  return roundUpQuota(recommendedQuota);
}

export function calcDefaultQuota({
  amount,
  lt,
  quotaReserve,
}: CalcDefaultQuotaProps) {
  const recommendedBaseQuota = (amount * lt) / PERCENTAGE_FACTOR;
  const recommendedQuota =
    (recommendedBaseQuota * (PERCENTAGE_FACTOR + quotaReserve)) /
    PERCENTAGE_FACTOR;

  return roundUpQuota(recommendedQuota);
}

export function calcQuotaUpdate(
  props: CalcQuotaUpdateProps,
): CalcQuotaUpdateReturnType {
  const { quotas, initialQuotas, maxDebt, allowedToSpend, allowedToObtain } =
    props;
  const quotaDecrease = Object.keys(allowedToSpend).reduce<
    Record<Address, Asset>
  >((acc, token) => {
    const ch = getSingleQuotaChange(token as Address, 0n, props);
    if (ch && ch.balance < 0) acc[ch.token] = ch;
    return acc;
  }, {});

  const quotaCap = roundUpQuota(maxDebt * 2n);
  const quotaBought = Object.values(initialQuotas).reduce(
    (sum, q) => sum + roundUpQuota(q?.quota || 0n),
    0n,
  );
  const quotaReduced = Object.values(quotaDecrease).reduce((sum, q) => {
    const quotaBalance = q.balance || 0n;
    const safeBalance =
      quotaBalance === MIN_INT96
        ? BigIntMath.neg(roundUpQuota(initialQuotas[q.token]?.quota || 0n))
        : quotaBalance;

    return sum + safeBalance;
  }, 0n);
  const maxQuotaIncrease = roundUpQuota(
    BigIntMath.max(quotaCap - (quotaBought + quotaReduced), 0n),
  );

  const quotaIncrease = Object.keys(allowedToObtain).reduce<
    Record<Address, Asset>
  >((acc, token) => {
    const ch = getSingleQuotaChange(token as Address, maxQuotaIncrease, props);
    if (ch && ch.balance > 0) acc[ch.token] = ch;
    return acc;
  }, {});

  const quotaChange = {
    ...quotaDecrease,
    ...quotaIncrease,
  };

  const desiredQuota = Object.values(quotas).reduce<Record<Address, Asset>>(
    (acc, cmQuota) => {
      const { token, isActive } = cmQuota;
      const { quota: initialQuota = 0n } = initialQuotas[token] || {};

      if (!isActive) {
        acc[token] = {
          balance: initialQuota,
          token,
        };
      } else {
        const change = quotaChange[token]?.balance || 0n;
        const quotaAfter = change === MIN_INT96 ? 0n : initialQuota + change;

        acc[token] = {
          balance: quotaAfter,
          token,
        };
      }

      return acc;
    },
    {},
  );
  return {
    desiredQuota,
    quotaDecrease: Object.values(quotaDecrease),
    quotaIncrease: Object.values(quotaIncrease),
  };
}

function getSingleQuotaChange(
  token: Address,
  unsafeMaxQuotaIncrease: bigint,
  props: CalcQuotaUpdateProps,
) {
  const { isActive = false } = props.quotas[token] || {};
  const { quota: unsafeInitialQuota = 0n } = props.initialQuotas[token] || {};

  if (!isActive) {
    return undefined;
  }

  // min(debt,assetAmountInUnderlying*LT)*(1+buffer)
  const assetAfter = props.assetsAfterUpdate[token];
  const { amountInTarget = 0n } = assetAfter || {};
  const lt = props.liquidationThresholds[token] || 0n;
  const maxQuotaIncrease = roundUpQuota(unsafeMaxQuotaIncrease);
  const initialQuota = roundUpQuota(unsafeInitialQuota);

  const defaultQuota =
    props.calcModification?.type === "recommendedQuota" &&
    props.calcModification.debt > 0
      ? calcRecommendedQuota({
          lt,
          quotaReserve: props.quotaReserve,
          amount: amountInTarget,
          debt: props.calcModification.debt,
        })
      : calcDefaultQuota({
          lt,
          quotaReserve: props.quotaReserve,
          amount: amountInTarget,
        });

  const unsafeQuotaChange = roundUpQuota(defaultQuota - initialQuota);
  const quotaChange =
    unsafeQuotaChange > 0
      ? BigIntMath.min(maxQuotaIncrease, unsafeQuotaChange)
      : unsafeQuotaChange < 0 &&
          BigIntMath.abs(unsafeQuotaChange) >= initialQuota
        ? MIN_INT96
        : unsafeQuotaChange;

  const correctIncrease =
    assetAfter && props.allowedToObtain[token] && quotaChange > 0;
  const correctDecrease =
    assetAfter && props.allowedToSpend[token] && quotaChange < 0;

  if (correctIncrease || correctDecrease) {
    return {
      balance: quotaChange,
      token,
    };
  }

  return undefined;
}
