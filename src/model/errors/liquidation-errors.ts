import type { Address } from "viem";
import type { Token } from "../primitives.js";
import type { IGearboxError } from "./base.js";

/**
 * The RWA factory has frozen this credit account, so its RWA collateral
 * cannot move and a liquidation cannot run.
 **/
export interface CreditAccountFrozenError extends IGearboxError {
  code: "creditAccountFrozen";
  creditAccount: Address;
}

/** {@inheritDoc CreditAccountFrozenError} */
export function creditAccountFrozen(
  creditAccount: Address,
): CreditAccountFrozenError {
  return {
    code: "creditAccountFrozen",
    message: `Credit account ${creditAccount} is frozen and cannot be liquidated.`,
    creditAccount,
  };
}

/**
 * The market is paused and `liquidator` is not one of its emergency liquidators,
 * so a liquidation would revert.
 **/
export interface NotEmergencyLiquidatorError extends IGearboxError {
  code: "notEmergencyLiquidator";
  creditManager: Address;
  liquidator: Address;
}

/** {@inheritDoc NotEmergencyLiquidatorError} */
export function notEmergencyLiquidator(
  creditManager: Address,
  liquidator: Address,
): NotEmergencyLiquidatorError {
  return {
    code: "notEmergencyLiquidator",
    message: `Credit manager ${creditManager} is paused and ${liquidator} is not an emergency liquidator.`,
    creditManager,
    liquidator,
  };
}

/**
 * The liquidator does not pass the KYC check of the liquidated assets.
 **/
export interface LiquidatorNotEligibleError extends IGearboxError {
  code: "liquidatorNotEligible";
  /**
   * KYC protocol the liquidator must be whitelisted in (e.g. `"securitize"`).
   * Absent when the compressor did not name one.
   **/
  kycProtocol?: string;
  /**
   * Token the liquidator must be whitelisted for in {@link kycProtocol}.
   * Absent when the liquidation is not KYC-gated, or the token is unknown.
   **/
  kycToken?: Token;
}

/** {@inheritDoc LiquidatorNotEligibleError} */
export function liquidatorNotEligible(
  kycProtocol?: string,
  kycToken?: Token,
): LiquidatorNotEligibleError {
  return {
    code: "liquidatorNotEligible",
    message:
      kycProtocol === undefined
        ? "The liquidator is not eligible to liquidate this account."
        : kycToken === undefined
          ? `The liquidator is not whitelisted in ${kycProtocol}.`
          : `The liquidator is not whitelisted in ${kycProtocol} for ${kycToken.symbol}.`,
    kycProtocol,
    kycToken,
  };
}
