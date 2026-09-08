import type { Address } from "viem";
import type { LiquidationDetails } from "../../model/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import type { LiquidationEligibilityError } from "./bundles/checkLiquidationEligibility.js";
import { checkLiquidationEligibility } from "./bundles/checkLiquidationEligibility.js";
import { checkLiquidationFunding } from "./bundles/checkLiquidationFunding.js";
import type { WalletFundingError } from "./bundles/checkWallet.js";

export interface CheckLiquidationInput {
  sdk: OnchainSDK;
  details: LiquidationDetails;
  liquidator: Address;
}

export interface CheckLiquidationOptions {
  /** Block to read at; defaults to latest. Only set for testnet forks. */
  blockNumber?: bigint;
}

/** {@inheritDoc checkLiquidation} */
export type LiquidationValidationError =
  | LiquidationEligibilityError
  | WalletFundingError;

/**
 * Whether `liquidator` may send a full liquidation of this account
 */
export async function checkLiquidation(
  input: CheckLiquidationInput,
  options: CheckLiquidationOptions = {},
): Promise<LiquidationValidationError[]> {
  const { sdk, details, liquidator } = input;
  return [
    ...checkLiquidationEligibility({ sdk, details, liquidator }),
    ...(await checkLiquidationFunding({
      sdk,
      details,
      liquidator,
      blockNumber: options.blockNumber,
    })),
  ];
}
