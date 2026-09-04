import type { Address } from "viem";
import { DUST_THRESHOLD } from "../../constants/index.js";
import { AssetsMap } from "../../utils/index.js";
import type { BalanceDelta } from "./types.js";

/**
 * One token amount a multicall is expected to produce on the credit account.
 * `WithdrawalOutput` satisfy it without this module knowing about them.
 */
export interface ExpectedOutput {
  token: Address;
  /**
   * Non-negative amount of `token` the multicall is expected to produce.
   */
  amount: bigint;
}

/**
 * Props for {@link expectedBalanceDeltas}.
 */
export interface ExpectedBalanceDeltasProps {
  /**
   * Amounts the multicall is expected to produce, summed per token.
   */
  outputs: readonly ExpectedOutput[];
  /**
   * Token the multicall spends, e.g. the source token of a delayed withdrawal
   * request or the withdrawal phantom token burned by a claim.
   */
  spentToken: Address;
  /**
   * Amount of `spentToken` spent. No negative delta is emitted when it is 0.
   */
  spentAmount: bigint;
}

/**
 * Builds the `storeExpectedBalances` deltas of a multicall from the amounts it
 * is expected to produce and the token it spends.
 */
export function expectedBalanceDeltas({
  outputs,
  spentToken,
  spentAmount,
}: ExpectedBalanceDeltasProps): BalanceDelta[] {
  const sums = new AssetsMap();
  for (const { token, amount } of outputs) {
    sums.inc(token, amount);
  }

  const deltas: BalanceDelta[] = sums
    .entries()
    .filter(([, amount]) => amount > DUST_THRESHOLD)
    .map(([token, amount]) => ({
      token,
      amount: amount - DUST_THRESHOLD,
    }));

  if (spentAmount > 0n) {
    deltas.push({ token: spentToken, amount: -spentAmount });
  }

  return deltas;
}
