import type { Bps, CreditOperationMarket } from "../../../model/index.js";
import { PERCENTAGE_FACTOR } from "../../constants/math.js";
import type { CreditSuite } from "./CreditSuite.js";

/**
 * What a liquidation takes off an account, in basis points: the premium the
 * liquidator keeps plus the protocol's own fee, with the suite's expiration
 * already resolved.
 *
 * Not {@link LiquidationFees.liquidationDiscount}, which is the complement of
 * the premium alone (`100% - liquidationPremium`) and says what share of the
 * seized collateral repays the debt.
 **/
export function totalLiquidationDiscount(suite: CreditSuite): Bps {
  const { feeLiquidation, liquidationDiscount } = suite.liquidationFees();
  return Number(PERCENTAGE_FACTOR) - liquidationDiscount + feeLiquidation;
}

/**
 * The market half of every credit operation result, read off the suite that
 * serves it. Spread into a preview or a projection so the four fields are
 * filled in one place and cannot drift apart between the two halves of the SDK.
 **/
export function creditOperationMarket(
  suite: CreditSuite,
): CreditOperationMarket {
  return {
    creditManager: suite.creditManager.address,
    name: suite.name,
    curator: suite.marketConfigurator.address,
    liquidationDiscount: totalLiquidationDiscount(suite),
  };
}
