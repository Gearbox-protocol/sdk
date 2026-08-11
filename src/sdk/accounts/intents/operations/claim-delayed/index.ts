import type { Address } from "viem";
import type {
  ClaimableWithdrawal,
  MultiCall,
  OnchainSDK,
  WithdrawableAsset,
  WithdrawalOutput,
} from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";
import { eq, toTargetDecimals } from "../../utils/index.js";

export interface OnchainOption {
  kind: "onchain";
  claimableWithdrawal: ClaimableWithdrawal;
}

export interface OffchainOption {
  kind: "offchain";
  phantomSpent: bigint;
  withdrawalConfig: WithdrawableAsset;
}

export type ClaimDelayedOption = OnchainOption | OffchainOption;

/**
 * Logical claim op for resume previews.
 * Simulation burns the phantom and credits outputs.
 */
export type ClaimDelayedWithdrawalOperation = {
  type: "claimDelayedWithdrawal";
  /** Source token the delayed withdrawal was requested from. */
  token: Address;
  withdrawalPhantomToken: Address;
  withdrawalTokenSpent: bigint;
  /** Claim outputs as returned by the compressor (incl. `isDelayed`). */
  outputs: WithdrawalOutput[];
  /**
   * Compressor claimCalls. Empty for instant-only / fixture simulation when
   * the full claimable payload is unavailable — refined then keeps calls: [].
   */
  calls: MultiCall[];
};

/**
 * Build the claim op from a matured claimable, or a simulation-only op from
 * resume claimedToken/amount when claimable is not attached.
 * Stores balances for raw call
 */
export function buildClaimDelayedWithdrawalOperation(
  creditAccount: CreditAccountSlice,
  option: ClaimDelayedOption,
  sdk: OnchainSDK,
): ClaimDelayedWithdrawalOperation {
  if (option.kind === "onchain") {
    const calls = sdk.accounts.assembleClaimDelayedCalls({
      creditFacade: creditAccount.creditFacade,
      claimableNow: option.claimableWithdrawal,
    });

    return {
      type: "claimDelayedWithdrawal",
      token: option.claimableWithdrawal.token.toLowerCase() as Address,
      withdrawalPhantomToken:
        option.claimableWithdrawal.withdrawalPhantomToken.toLowerCase() as Address,
      withdrawalTokenSpent: option.claimableWithdrawal.withdrawalTokenSpent,
      outputs: option.claimableWithdrawal.outputs.map(o => ({
        ...o,
        token: o.token.toLowerCase() as Address,
      })),
      calls,
    };
  }

  return {
    type: "claimDelayedWithdrawal",
    token: option.withdrawalConfig.token,
    withdrawalPhantomToken: option.withdrawalConfig.withdrawalPhantomToken,
    withdrawalTokenSpent: option.phantomSpent,
    outputs: [
      {
        token: option.withdrawalConfig.underlying,
        amount: toTargetDecimals(
          option.phantomSpent,
          option.withdrawalConfig.withdrawalPhantomToken,
          option.withdrawalConfig.underlying,
          sdk,
        ),
        isDelayed: false,
      },
    ],
    calls: [],
  };
}

/** First positive non-delayed output (optionally restricted to `token`). */
export function primaryInstantOutput(
  outputs: Array<{ token: Address; amount: bigint; isDelayed: boolean }>,
  token?: Address,
): { token: Address; amount: bigint } | undefined {
  for (const out of outputs) {
    if (out.isDelayed || out.amount <= 0n) {
      continue;
    }
    if (token != null && !eq(out.token, token)) {
      continue;
    }
    return { token: out.token, amount: out.amount };
  }
  return undefined;
}
