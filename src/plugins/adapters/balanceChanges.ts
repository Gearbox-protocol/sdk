import type { Address } from "viem";
import type { AddressMap } from "../../sdk/index.js";

/**
 * Applies diff-call semantics to a balances map: a diff-style adapter call
 * spends the consumed token down to the exact `leftoverAmount` encoded in its
 * calldata, so the post-call balance of `tokenIn` is `leftoverAmount`
 * regardless of the actual amount spent.
 *
 * Returns a new map; the input map is not mutated.
 */
export function clampToLeftover(
  balances: AddressMap<bigint>,
  tokenIn: Address,
  leftoverAmount: bigint,
): AddressMap<bigint> {
  const next = balances.clone();
  next.upsert(tokenIn, leftoverAmount);
  return next;
}

/**
 * Resolves a Curve pool coin index to its token address.
 *
 * @throws When the index is out of range for the pool.
 */
export function curveCoin(
  tokens: readonly Address[],
  i: bigint | number,
): Address {
  const token = tokens[Number(i)];
  if (!token) {
    throw new Error(`curve coin index ${i} is out of range`);
  }
  return token;
}
