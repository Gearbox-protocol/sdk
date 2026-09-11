import type { Address } from "viem";

/**
 * A single ERC-20 Transfer event captured between Execute boundaries.
 */
export interface TokenTransfer {
  token: Address;
  amount: bigint;
  from: Address;
  to: Address;
}
