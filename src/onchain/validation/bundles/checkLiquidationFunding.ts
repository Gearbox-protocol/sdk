import type { Address } from "viem";
import type { LiquidationDetails } from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { WalletFundingError } from "./checkWallet.js";
import { checkWalletAllowance } from "./checkWalletAllowance.js";
import { checkWalletBalance } from "./checkWalletBalance.js";

export interface CheckLiquidationFundingInput {
  sdk: OnchainSDK;
  details: LiquidationDetails;
  liquidator: Address;
  blockNumber?: bigint;
}

/**
 * What the liquidator wallet must hold and have approved.
 */
export async function checkLiquidationFunding(
  input: CheckLiquidationFundingInput,
): Promise<WalletFundingError[]> {
  const { sdk, details, liquidator, blockNumber } = input;
  const reads: Promise<WalletFundingError[]>[] = [];

  if (details.repaymentAmount.value > 0n) {
    reads.push(
      checkWalletBalance({
        sdk,
        token: details.repaymentAmount.token.address,
        holder: liquidator,
        required: details.repaymentAmount.value,
        blockNumber,
      }),
    );
  }
  if (details.approve) {
    reads.push(
      checkWalletAllowance({
        sdk,
        token: details.approve.token.address,
        owner: liquidator,
        spender: details.approve.spender,
        required: details.approve.value,
        blockNumber,
      }),
    );
  }

  return (await Promise.all(reads)).flat();
}
