import type { Address } from "viem";
import type { PoolPositionOperationPreview } from "../../../model/index.js";
import type { OnchainSDK } from "../../OnchainSDK.js";
import type { WalletFundingError } from "./checkWallet.js";
import { checkWallet } from "./checkWallet.js";

export interface CheckPoolFundingInput {
  sdk: OnchainSDK;
  preview: PoolPositionOperationPreview;
  sender: Address;
  blockNumber?: bigint;
}

/**
 * What the wallet must hold (and approve) for a pool deposit, mint, withdraw
 * or redeem, read off the preview's `tokenIn`, `zapper` and `holder`.
 */
export async function checkPoolFunding(
  input: CheckPoolFundingInput,
): Promise<WalletFundingError[]> {
  const { sdk, preview, sender, blockNumber } = input;
  const {
    tokenIn: {
      token: { address: token },
      value: required,
    },
    pool,
    zapper,
    holder,
  } = preview;
  const isDeposit =
    preview.operation === "Deposit" || preview.operation === "Mint";
  return checkWallet({
    sdk,
    token,
    required,
    blockNumber,
    holder: isDeposit || zapper ? sender : holder,
    spender: zapper ?? (isDeposit ? pool : sender),
  });
}
