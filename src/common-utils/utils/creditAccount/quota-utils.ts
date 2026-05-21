import type { Address } from "viem";
import {
  type Asset,
  MIN_INT96,
  PERCENTAGE_FACTOR,
} from "../../../sdk/index.js";
import { BigIntMath } from "../bigint-math.js";
import type { QuotaSlice } from "../strategies/strategy-info/types.js";
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
  quotas: Record<Address, QuotaSlice | undefined>;
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

/**
 * Rounds quota deltas to protocol precision step (`PERCENTAGE_FACTOR`).
 *
 * The `MIN_INT96` sentinel is preserved as-is because it encodes
 * "reset quota" semantics and must not be transformed.
 *
 * @param quotaChange Raw quota delta.
 * @returns Rounded quota delta, or untouched `MIN_INT96` sentinel.
 */
export function roundUpQuota(quotaChange: bigint) {
  return quotaChange !== MIN_INT96
    ? (quotaChange / PERCENTAGE_FACTOR) * PERCENTAGE_FACTOR
    : quotaChange;
}

/**
 * Computes recommended quota for a token when debt-aware capping is enabled.
 *
 * Base quota is `min(debt, amount * LT)`, then reserve buffer is applied.
 * Final value is rounded to protocol quota step.
 *
 * @param props Token amount in target units, debt, liquidation threshold, reserve.
 * @returns Recommended rounded quota.
 */
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

/**
 * Computes default quota for a token without debt capping.
 *
 * Base quota is `amount * LT`, then reserve buffer is applied.
 * Final value is rounded to protocol quota step.
 *
 * @param props Token amount in target units, liquidation threshold, reserve.
 * @returns Default rounded quota.
 */
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

/**
 * Produces desired quota state and explicit increase/decrease actions.
 *
 * The function:
 * - computes decreases for spendable tokens
 * - computes increase capacity based on global quota cap
 * - computes increases for obtainable tokens within remaining capacity
 * - applies changes on top of initial quotas for active quota tokens
 *
 * `MIN_INT96` is treated as a full reset marker for a token quota.
 *
 * @param props Current quotas, initial quotas, permissions, and calculation context.
 * @returns Desired quota map plus separate increase/decrease instruction lists.
 */
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
      if (!cmQuota) return acc;
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

/**
 * Calculates a single-token quota change candidate.
 *
 * The helper computes desired quota (default or debt-aware), derives delta
 * against initial quota, applies increase cap, and converts full-decrease
 * cases into `MIN_INT96` sentinel when needed.
 *
 * @param token Token to evaluate.
 * @param unsafeMaxQuotaIncrease Maximum currently available increase budget.
 * @param props Shared quota-update context.
 * @returns Asset-shaped quota delta for allowed and valid changes,
 * or `undefined` when token is inactive or change is not permitted.
 */
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
