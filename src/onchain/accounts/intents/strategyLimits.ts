import type { Address } from "viem";
import type { OperationLimitOptions } from "../../../model/index.js";
import type { Asset } from "../../base/index.js";
import { MAX_UINT256 } from "../../constants/index.js";
import { LEVERAGE_DECIMALS } from "../../constants/math.js";
import type { CreditSuite } from "../../market/credit/CreditSuite.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import type { AccountView } from "./plan.js";
import type {
  AdjustLeverageIntent,
  CreditAccountSlice,
  DepositStrategyIntent,
} from "./types.js";
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

interface AccountLimitsProps extends BaseLimitsProps {
  view: AccountView;
  initialQuotas: CreditAccountSlice["tokens"];
}

interface DepositLimitsProps extends AccountLimitsProps, DepositStrategyIntent {}

interface LeverageLimitsProps extends AccountLimitsProps, AdjustLeverageIntent {
  /** Additional ceiling imposed by the selected delayed route. */
  maxLeverage?: bigint;
}

type StrategyLimitsProps = OpenLimitsProps | DepositLimitsProps | LeverageLimitsProps;

/** Independent input bounds supplied to debt, liquidity and quota errors. */
export function strategyLimits(props: StrategyLimitsProps): OperationLimitOptions {
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

    case "DEPOSIT": {
      const { view, token, positionToken, initialQuotas, targetLeverage } = props;
      // Only deposits preserving current leverage have an amount solution.
      if (targetLeverage !== undefined || view.collateral <= 0n) return {};

      const minDebt = BigIntMath.max(view.debt, suite.creditFacade.minDebt);
      const maxDebt = BigIntMath.min(
        suite.creditFacade.maxDebt,
        view.debt + suite.maxBorrowAmount().amount.value,
      );

      // deltaD = floor(D * addedC / C); existing debt is not scaled away.
      const minCollateralForDebt = (debt: bigint) => {
        if (debt <= view.debt) return 0n;
        if (view.debt === 0n) return undefined;
        const collateralUnderlying = BigIntMath.ceilDiv((debt - view.debt) * view.collateral, view.debt);
        const result = oracle.safeConvertInput(token, view.underlying, collateralUnderlying);
        return result.error ? undefined : result.value;
      };
      // An undefined ceiling also covers zero debt: proportional borrowing stays zero.
      const debtFloorCollateral = minCollateralForDebt(minDebt);
      const minCollateral = debtFloorCollateral === undefined ? undefined : BigIntMath.max(1n, debtFloorCollateral);
      const excessCollateral = debtFloorCollateral === undefined ? undefined : minCollateralForDebt(maxDebt + 1n);
      const maxCollateral = excessCollateral === undefined ? MAX_UINT256 : BigIntMath.min(MAX_UINT256, excessCollateral - 1n);

      const position = positionToken ?? view.fattest([view.underlying]);
      let maxCollateralByQuota: bigint | undefined;
      if (position) {
        if (!market.isUnderlyingLike(position) && !market.pool.pqk.hasActiveQuota(position)) {
          maxCollateralByQuota = 0n;
        } else {
          const quotaResult = quotaIncreaseLimit({
            suite,
            token: position,
            balance: view.balanceOf(position),
            initialQuotas,
            quotaReserve,
            rwaAsset: view.rwaAsset,
          });
          // Account projections value unavailable assets at zero: no quota increase.
          maxCollateralByQuota = MAX_UINT256;
          if (!quotaResult.error && quotaResult.value !== undefined) {
            // Purchased increase = addedC + floor(D * addedC / C).
            const excessUnderlying = BigIntMath.ceilDiv(
              (quotaResult.value + 1n) * view.collateral,
              view.collateral + view.debt,
            );
            const result = oracle.safeConvertInput(token, view.underlying, BigIntMath.max(excessUnderlying, 0n));
            maxCollateralByQuota = result.error ? undefined : BigIntMath.min(MAX_UINT256, result.value - 1n);
          }
        }
      }

      return {
        collateralLimits: minCollateral !== undefined && minCollateral <= maxCollateral
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

    case "ADJUST_LEVERAGE": {
      const { view, token, initialQuotas, targetLeverage, maxLeverage = MAX_UINT256 } = props;
      if (view.collateral <= 0n || targetLeverage < LEVERAGE_DECIMALS) return {};

      const maxDebt = BigIntMath.min(
        suite.creditFacade.maxDebt,
        view.debt + suite.maxBorrowAmount().amount.value,
      );
      // D = floor(C * (L - 100) / 100); L is already in hundredths.
      const minLeverage = BigIntMath.max(
        LEVERAGE_DECIMALS + 1n,
        LEVERAGE_DECIMALS + BigIntMath.ceilDiv(suite.creditFacade.minDebt * LEVERAGE_DECIMALS, view.collateral),
      );
      const debtMaxLeverage = BigIntMath.min(
        maxLeverage,
        LEVERAGE_DECIMALS + BigIntMath.ceilDiv((maxDebt + 1n) * LEVERAGE_DECIMALS, view.collateral) - 1n,
      );

      const position = token ?? view.fattest([view.underlying]);
      let maxLeverageByQuota: bigint | undefined;
      if (position) {
        if (!market.isUnderlyingLike(position) && !market.pool.pqk.hasActiveQuota(position)) {
          maxLeverageByQuota = LEVERAGE_DECIMALS;
        } else {
          const quotaResult = quotaIncreaseLimit({
            suite,
            token: position,
            balance: view.balanceOf(position),
            initialQuotas,
            quotaReserve,
            rwaAsset: view.rwaAsset,
          });
          // As with Deposit, an unavailable asset produces no projected quota increase.
          maxLeverageByQuota = maxLeverage;
          if (!quotaResult.error && quotaResult.value !== undefined) {
            // With fixed own funds, purchased increase is the positive debt delta.
            const quotaMaxDebt = view.debt + quotaResult.value;
            maxLeverageByQuota = BigIntMath.min(
              maxLeverage,
              LEVERAGE_DECIMALS + BigIntMath.ceilDiv((quotaMaxDebt + 1n) * LEVERAGE_DECIMALS, view.collateral) - 1n,
            );
          }
        }
      }

      return {
        leverageLimits: minLeverage <= debtMaxLeverage ? { min: minLeverage, max: debtMaxLeverage } : undefined,
        quotaLimits: maxLeverageByQuota === undefined ? undefined : { leverageMax: maxLeverageByQuota },
      };
    }
  }
}
