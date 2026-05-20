import type { Address } from "viem";
import { BigIntMath } from "../../utils/bigint-math.js";
import type { CreditManagerData, PoolData } from "./types.js";
import {
  type ValidateOpenAccountPoolQuotaStatusResult,
  validateOpenAccountPoolQuotaStatus,
} from "./validate-open-account-pool-quota-status.js";

export interface ValidateOpenAccountPoolStatusProps {
  creditManager: Pick<
    CreditManagerData,
    "minDebt" | "totalDebtLimit" | "totalDebt" | "availableToBorrow" | "quotas"
  >;
  pool: Pick<PoolData, "totalDebtLimit" | "totalBorrowed"> | undefined | null;
  debt: bigint;
  targetToken: Address | null;
}

export type ValidateOpenAccountPoolStatusResult =
  | {
      message: "insufficientDebtLimit";
      amount: bigint;
      solutionAmount?: bigint;
    }
  | {
      message: "insufficientPoolDebtLimit";
      amount: bigint;
      solutionAmount?: bigint;
    }
  | {
      message: "insufficientPoolLiquidity";
      amount: bigint;
      solutionAmount?: bigint;
    }
  | ValidateOpenAccountPoolQuotaStatusResult;

export function validateOpenAccountPoolStatus(
  props: ValidateOpenAccountPoolStatusProps,
): ValidateOpenAccountPoolStatusResult | null {
  const { debt, creditManager, pool, targetToken } = props;

  const effectiveDebt = BigIntMath.max(creditManager.minDebt, debt);

  const hasDebtLimit = creditManager.totalDebtLimit >= 0n;
  const debtLimitLeft = BigIntMath.max(
    creditManager.totalDebtLimit - creditManager.totalDebt,
    0n,
  );

  const { totalDebtLimit = 0n, totalBorrowed = 0n } = pool || {};
  const hasPoolDebtLimit = totalDebtLimit > 0n;
  const poolDebtLimitLeft = totalDebtLimit - totalBorrowed;

  const canOpenMinDebt =
    creditManager.minDebt <= debtLimitLeft &&
    creditManager.minDebt <= poolDebtLimitLeft &&
    creditManager.minDebt <= creditManager.availableToBorrow;
  const minPositionSize = BigIntMath.min(
    BigIntMath.min(debtLimitLeft, poolDebtLimitLeft),
    creditManager.availableToBorrow,
  );

  if (hasDebtLimit && effectiveDebt > debtLimitLeft) {
    return {
      message: "insufficientDebtLimit",
      amount: debtLimitLeft,
      solutionAmount: canOpenMinDebt ? minPositionSize : undefined,
    };
  }

  if (hasPoolDebtLimit && effectiveDebt > poolDebtLimitLeft) {
    return {
      message: "insufficientPoolDebtLimit",
      amount: poolDebtLimitLeft,
      solutionAmount: canOpenMinDebt ? minPositionSize : undefined,
    };
  }

  if (effectiveDebt > creditManager.availableToBorrow) {
    return {
      message: "insufficientPoolLiquidity",
      amount: creditManager.availableToBorrow,
      solutionAmount: canOpenMinDebt ? minPositionSize : undefined,
    };
  }

  if (targetToken !== null) {
    const quotaError = validateOpenAccountPoolQuotaStatus(
      targetToken,
      creditManager,
      effectiveDebt,
    );
    if (quotaError) return quotaError;
  }

  return null;
}
