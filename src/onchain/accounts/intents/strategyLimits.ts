import type { Address } from "viem";
import type { OperationLimitOptions } from "../../../model/index.js";
import type { Asset } from "../../base/index.js";
import { MAX_UINT256 } from "../../constants/index.js";
import { LEVERAGE_DECIMALS } from "../../constants/math.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import { quotaIncreaseLimit } from "./utils/quotas-for-update.js";

interface BaseLimitsProps {
  suite: CreditSuite;
  quotaReserve: number | undefined;
}

interface OpenLimitsProps extends BaseLimitsProps {
  type: "OPEN";
  collateral: readonly Asset[];
  leverage: bigint;
  targetToken: Address;
}

/** Independent input bounds supplied to debt, liquidity and quota errors. */
export function strategyLimits(props: OpenLimitsProps): OperationLimitOptions {
  const { suite, quotaReserve } = props;
  const { market } = suite;
  const { priceOracle: oracle } = market;

  switch (props.type) {
    case "OPEN": {
      const { collateral, leverage, targetToken } = props;
      if (collateral.length !== 1 || leverage <= LEVERAGE_DECIMALS) return {};

      const [{ token }] = collateral;
      const minDebt = suite.creditFacade.minDebt;
      const maxDebt = suite.maxBorrowAmount().amount.value;
      if (maxDebt < minDebt) return {};

      // D = floor(C * (L - 100) / 100); invert with ceiling division.
      const minCollateralForDebt = (debt: bigint) => {
        const collateralUnderlying = BigIntMath.ceilDiv(
          debt * LEVERAGE_DECIMALS,
          leverage - LEVERAGE_DECIMALS,
        );
        const result = oracle.safeConvertInput(token, market.pool.underlying, collateralUnderlying);
        return result.error ? undefined : result.value;
      };
      const priceCheck = oracle.safeConvert(token, market.pool.underlying, 1n);
      if (priceCheck.error) return {};

      // First inputs reaching minDebt and exceeding maxDebt delimit the range.
      const minCollateral = minCollateralForDebt(BigIntMath.max(minDebt, 1n));
      const excessCollateral = minCollateralForDebt(maxDebt + 1n);
      if (minCollateral === undefined || excessCollateral === undefined || minCollateral > MAX_UINT256) return {};
      const maxCollateral = BigIntMath.min(MAX_UINT256, excessCollateral - 1n);

      let maxCollateralByQuota: bigint | undefined;
      if (!market.isUnderlyingLike(targetToken) && !market.pool.pqk.hasActiveQuota(targetToken)) {
        maxCollateralByQuota = 0n;
      } else {
        const quotaResult = quotaIncreaseLimit({
          suite,
          token: targetToken,
          balance: 0n,
          initialQuotas: [],
          quotaReserve,
        });
        if (!quotaResult.error && quotaResult.value !== undefined) {
          // Quota covers total purchased value: floor(C * L / 100).
          const excessUnderlying = BigIntMath.ceilDiv(
            (BigIntMath.max(quotaResult.value, 0n) + 1n) * LEVERAGE_DECIMALS,
            leverage,
          );
          const result = oracle.safeConvertInput(token, market.pool.underlying, excessUnderlying);
          if (!result.error) maxCollateralByQuota = BigIntMath.min(MAX_UINT256, result.value - 1n);
        }
      }

      return {
        collateralLimits: minCollateral <= maxCollateral
          ? {
              min: oracle.toTokenAmount(token, minCollateral),
              max: oracle.toTokenAmount(token, maxCollateral),
            }
          : undefined,
        quotaLimits: maxCollateralByQuota === undefined
          ? undefined
          : { collateralMax: oracle.toTokenAmount(token, maxCollateralByQuota) },
      };
    }

  }
}
