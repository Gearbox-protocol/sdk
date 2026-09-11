import type { Address } from "viem";
import type {
  AdjustStrategyPositionPreview,
  OpenStrategyPositionPreview,
  RepayStrategyPositionPreview,
} from "../../../model/index.js";
import { unexpectedFailure } from "../../../model/index.js";
import {
  AP_WETH_TOKEN,
  NATIVE_ADDRESS,
  NO_VERSION,
} from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { AssetsMap } from "../../utils/AssetsMap.js";
import type { WalletFundingError } from "./checkWallet.js";
import { checkWalletAllowance } from "./checkWalletAllowance.js";
import { checkWalletBalance } from "./checkWalletBalance.js";

export type CollateralFundingPreview =
  | OpenStrategyPositionPreview
  | AdjustStrategyPositionPreview
  | RepayStrategyPositionPreview;

export interface CheckCollateralFundingInput {
  sdk: OnchainSDK;
  preview: CollateralFundingPreview;
  sender: Address;
  blockNumber?: bigint;
}

/**
 * What the wallet must hold and have approved for the collateral the
 * operation adds. Native value is already split out of `collateralAdded` as a
 * `NATIVE_ADDRESS` entry; the facade wraps it into WETH, so the WETH allowance
 * covers both halves.
 */
export async function checkCollateralFunding(
  input: CheckCollateralFundingInput,
): Promise<WalletFundingError[]> {
  const { sdk, preview, sender, blockNumber } = input;
  const held = new AssetsMap(
    preview.collateralAdded.map(a => ({
      token: a.token.address,
      balance: a.value,
    })),
  );
  if (held.size === 0) {
    return [];
  }

  let spender: Address;
  try {
    if (
      preview.operation === "OpenCreditAccount" ||
      preview.operation === "RWAOpenCreditAccount"
    ) {
      spender = await sdk.accounts.getApprovalAddress({
        creditManager: preview.creditManager,
        borrower: sender,
      });
    } else {
      spender = await sdk.accounts.getApprovalAddress({
        creditManager: preview.creditManager,
        creditAccount: preview.creditAccount,
      });
    }
  } catch (cause) {
    return [unexpectedFailure(cause, "resolve the approval address")];
  }

  const approved = held.clone();
  const native = approved.get(NATIVE_ADDRESS) ?? 0n;
  if (native > 0n) {
    approved.delete(NATIVE_ADDRESS);
    approved.inc(
      sdk.addressProvider.getAddress(AP_WETH_TOKEN, NO_VERSION),
      native,
    );
  }

  const results = await Promise.all([
    ...held.entries().map(([token, required]) =>
      checkWalletBalance({
        sdk,
        token,
        holder: sender,
        required,
        blockNumber,
      }),
    ),
    ...approved.entries().map(([token, required]) =>
      checkWalletAllowance({
        sdk,
        token,
        owner: sender,
        spender,
        required,
        blockNumber,
      }),
    ),
  ]);
  return results.flat();
}
