import type { Address } from "viem";
import type {
  ClaimableWithdrawal,
  MultiCall,
  OnchainSDK,
  WithdrawalOutput,
} from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";
import { eq } from "../../utils/index.js";

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
  /** Compressor claimCalls. */
  calls: MultiCall[];
};

/**
 * The claim op for a matured claimable: burns the phantom and credits the
 * outputs the compressor reports.
 */
export function buildClaimDelayedWithdrawalOperation(input: {
  claimable: ClaimableWithdrawal;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): ClaimDelayedWithdrawalOperation {
  const { claimable } = input;

  return {
    type: "claimDelayedWithdrawal",
    token: claimable.token.toLowerCase() as Address,
    withdrawalPhantomToken:
      claimable.withdrawalPhantomToken.toLowerCase() as Address,
    withdrawalTokenSpent: claimable.withdrawalTokenSpent,
    outputs: claimable.outputs.map(o => ({
      ...o,
      token: o.token.toLowerCase() as Address,
    })),
    calls: input.sdk.accounts.assembleClaimDelayedCalls({
      creditFacade: input.creditAccount.creditFacade,
      claimableNow: claimable,
    }),
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
