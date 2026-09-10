import type { Address } from "viem";
import { isAddressEqual } from "viem";
import type {
  InsufficientAllowanceError,
  InsufficientBalanceError,
  UnexpectedFailureError,
} from "../../../model/index.js";
import { NATIVE_ADDRESS } from "../../constants/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import { checkWalletAllowance } from "./checkWalletAllowance.js";
import { checkWalletBalance } from "./checkWalletBalance.js";

/** {@inheritDoc checkWallet} */
export type WalletFundingError =
  | InsufficientBalanceError
  | InsufficientAllowanceError
  | UnexpectedFailureError;

export interface CheckWalletInput {
  sdk: OnchainSDK;
  token: Address;
  holder: Address;
  required: bigint;
  spender?: Address;
  blockNumber?: bigint;
}

/**
 * The wallet's whole side for one token: always the balance; the allowance
 * only when it can matter (an ERC-20, with a spender who is not the holder).
 */
export async function checkWallet(
  input: CheckWalletInput,
): Promise<WalletFundingError[]> {
  const { spender, ...rest } = input;
  const needsAllowance =
    spender !== undefined &&
    !isAddressEqual(rest.token, NATIVE_ADDRESS) &&
    !isAddressEqual(spender, rest.holder);
  const results = await Promise.all([
    checkWalletBalance(rest),
    needsAllowance
      ? checkWalletAllowance({ ...rest, owner: rest.holder, spender })
      : [],
  ]);
  return results.flat();
}
