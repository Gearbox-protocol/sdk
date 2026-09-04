import type { Address } from "viem";
import type {
  MalformedTransactionError,
  OperationPreview,
} from "../../model/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import { checkCollateralFunding } from "./bundles/checkCollateralFunding.js";
import type { CreditOperationError } from "./bundles/checkCreditOperation.js";
import { checkCreditOperation } from "./bundles/checkCreditOperation.js";
import type { HealthFactorThresholds } from "./bundles/checkHealthFactors.js";
import { checkMarket } from "./bundles/checkMarket.js";
import { checkPoolFunding } from "./bundles/checkPoolFunding.js";
import type { PoolOperationError } from "./bundles/checkPoolOperation.js";
import { checkPoolOperation } from "./bundles/checkPoolOperation.js";
import type { WalletFundingError } from "./bundles/checkWallet.js";
import { checkPreviewError } from "./checks/index.js";

export interface CheckOperationOptions extends HealthFactorThresholds {
  /** Block to read at; defaults to latest. Only set for testnet forks. */
  blockNumber?: bigint;
}

export interface CheckOperationInput {
  sdk: OnchainSDK;
  preview: OperationPreview;
  /** The wallet that signs. Its allowances, balances and RWA standing are read on-chain. */
  sender: Address;
}

/** {@inheritDoc checkOperation} */
export type OperationValidationError =
  | MalformedTransactionError
  | CreditOperationError
  | PoolOperationError
  | WalletFundingError;

/**
 * Whether a parsed operation may be signed by `sender`: protocol state first,
 * then what the wallet has to approve, hold or sign.
 *
 * The array is in check order, most fundamental first, so a caller with room
 * for one verdict reports the first entry. Approve and sign errors are picked
 * out by `code`, not by position.
 */
export async function checkOperation(
  input: CheckOperationInput,
  options: CheckOperationOptions = {},
): Promise<OperationValidationError[]> {
  const { sdk, preview, sender } = input;
  const { blockNumber, ...thresholds } = options;

  // Every check below reads fields this error declares untrustworthy, so it is
  // reported alone.
  const malformed = checkPreviewError(
    "warning" in preview ? preview.warning : undefined,
  );
  if (malformed.length > 0) {
    return malformed;
  }

  const wallet = { sdk, sender, blockNumber };
  switch (preview.operation) {
    case "Deposit":
    case "Mint":
    case "Withdraw":
    case "Redeem": {
      const isDeposit =
        preview.operation === "Deposit" || preview.operation === "Mint";
      return [
        ...checkPoolOperation({
          sdk,
          pool: preview.pool,
          isDeposit,
          tokenOut: preview.tokenOut,
        }),
        ...(await checkPoolFunding({ ...wallet, preview })),
      ];
    }
    case "DelayedCreditAccountOperation":
      return checkOperation(
        { sdk, preview: preview.instantPreview, sender },
        options,
      );
    case "OpenCreditAccount":
    case "RWAOpenCreditAccount":
    case "AdjustCreditAccount":
      return checkCreditOperation({
        sdk,
        preview,
        sender,
        blockNumber,
        ...thresholds,
      });
    case "RepayCreditAccount":
      return [
        ...checkMarket(
          sdk.marketRegister.findCreditManager(preview.creditManager),
        ),
        ...(await checkCollateralFunding({ ...wallet, preview })),
      ];
    case "CloseCreditAccount":
      return checkMarket(
        sdk.marketRegister.findCreditManager(preview.creditManager),
      );
  }
}
