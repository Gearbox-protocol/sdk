import type { Address } from "viem";
import type {
  CreditAccountFrozenError,
  LiquidationDetails,
  LiquidatorNotEligibleError,
  NotEmergencyLiquidatorError,
  PartialLiquidationImpossibleError,
} from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import {
  checkCreditAccountFrozen,
  checkEmergencyLiquidator,
  checkLiquidatorEligible,
  checkPartiallyLiquidatable,
} from "../checks/index.js";

export interface CheckLiquidationEligibilityInput {
  sdk: OnchainSDK;
  details: LiquidationDetails;
  liquidator: Address;
}

/** {@inheritDoc checkLiquidationEligibility} */
export type LiquidationEligibilityError =
  | CreditAccountFrozenError
  | PartialLiquidationImpossibleError
  | NotEmergencyLiquidatorError
  | LiquidatorNotEligibleError;

/**
 * Whether this wallet may liquidate this account, from the facts the
 * liquidation details already report and the market's emergency-liquidator
 * list.
 */
export function checkLiquidationEligibility(
  input: CheckLiquidationEligibilityInput,
): LiquidationEligibilityError[] {
  const { sdk, details, liquidator } = input;
  const market = sdk.marketRegister.findByCreditManager(details.creditManager);
  return [
    ...checkCreditAccountFrozen({
      frozen: details.isCreditAccountFrozen,
      creditAccount: details.creditAccount,
    }),
    ...checkPartiallyLiquidatable({
      isPartial: details.isPartial,
      partiallyLiquidatable: details.isPartiallyLiquidatable,
      creditAccount: details.creditAccount,
    }),
    ...checkEmergencyLiquidator({
      paused: details.paused,
      isEmergencyLiquidator: market.isEmergencyLiquidator(liquidator),
      creditManager: details.creditManager,
      liquidator: liquidator,
    }),
    ...checkLiquidatorEligible({
      eligible: details.isLiquidatorEligible,
      kycProtocol: details.kycProtocol,
      kycToken: details.kycToken,
    }),
  ];
}
