import type { Address } from "viem";

/**
 * A single ERC-20 Transfer event captured between Execute boundaries.
 *
 * Internal to `plugins/adapters` (kept here so {@link toNetTransfers} stays
 * typed) and intentionally **not** re-exported from the package barrel: the
 * canonical, public `TokenTransfer` lives in the `preview` module. The two are
 * structurally identical, so values flow between the modules without casts.
 *
 * @deprecated Will be deprecated when we get rid of classifyLegacyOperation
 */
export interface TokenTransfer {
  token: Address;
  amount: bigint;
  from: Address;
  to: Address;
}
